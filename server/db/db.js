'use strict'
const mysql = require('mysql');
const Promise = require('bluebird');
Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);
const schema = require('./schema');
const demo = require('./demo');
const qry = require('./qry');
const status = require('../templates/statuscode');
const util = require('./util')

const pool = mysql.createPool(
	{host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT} ||

  process.env.CLEARDB_DATABASE_URL ||	

	{host: 'localhost',
	user: 'root',
	password: '',
	database: 'dtpoker'	});

const getConn = ()=> {
  return pool.getConnectionAsync().disposer(function(connection) {
      connection.release();
  });
};

// look at accounts.tableCash for example
const CheckConditional = (param, user, conditional, value1)=> {
	let username = user.attributes.username;
	return Promise.using(getConn(), function(conn) {
		return conn.queryAsync(qry.selectQuery(param), username)
		.then((result)=>Promise.resolve(conditional(value1, result&&result[0][param])))
		.catch((error)=> status.CheckConditionalError(username));
	})
	.catch((error)=> status.CheckConditionalError(username))
};

const ReturnValue = (selections, user)=> {
	let username = user.attributes.username;
	return Promise.using(getConn(), function(conn) {
		return conn.queryAsync(qry.selectQuery(selections), username)
		.then((result)=>{
			if (result&&result[0]) {
				let count = 0;
				for (var key in result[0]) {count++}
				if (count>1) { 
					return Promise.resolve(result[0]);
				} else if (count===1) {
					return Promise.resolve(result[0][key]);
				}
			}
		})
		.catch((error)=> status.ReturnValueError(username));
	})
	.catch((error)=> status.ReturnValueError(username))
};

// UPDATE or INSERT, SELECT same queries, update user state
const SetUpdate = (command, user, update, cb1, cb2)=> {
	let username = user.attributes.editName;
	let commandType = command.slice(0,6);
	if (commandType==='UPDATE') {
		var update = [update, username];
		var selections = Object.keys(update[0]).join(', ');
	} else if (commandType==='INSERT') {
		var selections = Object.keys(update).join(', ');
	}
	// console.log('COMMAND =', command);
	// console.log('SELECTIONS = ', selections);
	// console.log('PLAYER ATTRIBUTES =', user.attributes)
	return Promise.using(getConn(), function(conn) {
		return conn.queryAsync(command, update)
		.then(()=> conn.queryAsync(qry.selectQuery(selections), username))
		.then((results)=>{
			// console.log(results)
				user.update(results[0])})

		.catch((error)=> user.update(status.dbError(error)))
		// .then(()=>console.log('DOODODODODOD SMOETHIN INSIDE OF PROMISE USING'))
		.then(()=>cb1&&cb1())
	.then(()=>cb2&&cb2())
	// .then(()=>cb2&&console.log(cb2.toString()))
	.catch((error)=> status.SetUpdateError(username))
	})
	// .then(()=>console.log('DOODODODODOD SMOETHIN OUTSIDE OF PROMISE USING'))
	// .then(()=>cb1&&console.log(cb1.toString()))
	
};

module.exports = {
	SetUpdate: SetUpdate,
	CheckConditional: CheckConditional,
	ReturnValue: ReturnValue,
	logout: (user, removeFromRoom, deleteSession)=> {
		SetUpdate(qry.updateUser, user, { sessionId: null, loggedIn: false}, removeFromRoom, deleteSession);
	},

	login: (user, room, cb, cb2)=> {
		let username = user.attributes.editName;
		let enteredPassword = user.attributes.password;
		let sessionId = user.attributes.sessionId;
		Promise.using(getConn(), function(conn) {
			return conn.queryAsync(qry.matchSessionId, sessionId)
			.then((result)=>{
				let dbSession = result[0]&&result[0].sessionId?result[0].sessionId:null;
				if (dbSession) { //   already has session
					return user.update(status.hasSession(dbSession));
				} else { //  no session
					return conn.queryAsync(qry.selectQuery('password, loggedIn'), username)
					.then((result)=>{  
						let dbPassword = result[0]&&result[0].password?result[0].password:null;
						let loggedIn = result[0]&&result[0].loggedIn?result[0].loggedIn:null;
						if (dbPassword) {  	// user has password
							if (enteredPassword===dbPassword) {  				// password is correct
								if (loggedIn) {   //  already logged in
									user.update(status.alreadyLoggedIn(username));
								} else if (!loggedIn) {   // not logged in ==> log in the user
									conn.queryAsync(qry.getAllFromUsername, username)
									.then((results)=> {
										let userData = util.extend(util.extendToCopy(schema.User, results[0]),
											{ sessionId: sessionId,  
												username: username,
												loggedIn: true, 
												room: room.name, });
										return SetUpdate(qry.updateUser, user, userData, cb, cb2)
										.then(()=>conn.queryAsync(qry.getAllFromUsername, username))
										.then((results)=>user.update(results[0]))
										.catch((error)=>user.update(status.getAccount(username)))});
								} else user.update(status.unknownLoginError(username));
							} else if (enteredPassword!==dbPassword) { 	//   wrong password
								return user.update(status.incorrectPassword(username)); 
							} else user.update(status.unknownLoginError(username));
						} else if (!dbPassword) { // new user
							let newUserData = util.extend(util.extendToCopy(schema.User, user.attributes),
								{ sessionId: sessionId,
									username: username, 
									password: enteredPassword, 
									loggedIn: true, 
									room: room.name,  });
							return SetUpdate(qry.insertUser, user, newUserData, cb, cb2);
						} else user.update(status.unknownLoginError(username));
					});
				}
			});
		})
		.catch((error)=>{
			return user.update(status.dbError(error));
		})
	},

	initDb: (cb1, cb2, cb3, cb4, data1, data2, data3, data4)=> {
		if (process.env.CLEARDB_DATABASE_URL) {
			Promise.using(getConn(), function(conn) {	
		  	return conn.queryAsync(schema.dropTableUsers)
		  	.then(()=> conn.queryAsync(schema.createTableUsers))
		  	.then(()=> conn.queryAsync(qry.insertUser, util.assign(schema.User, demo.User1)))
		  	.catch((error)=> console.log('\n\n\nXXXXX GOT AN ERROR...error = ', error))
			});
		} else {
			Promise.using(getConn(), function(conn) {
			return conn.queryAsync(schema.dropDatabase)
			.then(()=> conn.queryAsync(schema.createDatabase))
			.then(()=> conn.queryAsync(schema.useDatabase))
			.then(()=> conn.queryAsync(schema.createTableUsers))
			.then(()=> conn.queryAsync(qry.insertUser, util.assign(schema.User, demo.User1)))
			// .then(()=> cb1 && console.log(cb1.toString()))

			.then(()=> {
				return util.promiseAllTimeout(cb1.map((cb,i)=>cb(data1[i])), 1000)
				.then(()=>util.promiseAllTimeout(cb2.map((cb,j)=>cb(data2[j])), 1000))
				.then(()=>util.promiseAllTimeout(cb3.map((cb,k)=>cb(data3[k])), 1000))
				.then(()=>util.promiseAllTimeout(cb4.map((cb,l)=>cb(data4[l])), 1000))
				.catch((error)=>console.error(error))
			})
			.catch((error)=> console.log('\n\n\nXXXXX GOT AN ERROR...error = ', error))
			});
		}
	},
};




