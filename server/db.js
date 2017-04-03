var mysql = require('mysql');
var state = require('./state');

var pool = mysql.createPool(process.env.CLEARDB_DATABASE_URL || {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dtpoker'
});

module.exports = {
	addName: function(enteredName, user, callback){
	  	pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `SELECT * from player WHERE name='${enteredName}';`;	
	  		connection.query(queryString, function(err, userInfo) {
	  			if (err) {
	  				throw err;
	  			}
	  			if (userInfo!==undefined) {
	  				if (!userInfo.length) {
		  				var queryString = `INSERT INTO player (id, name, password, loggedin, location, accountCash, getCashWait ) VALUES (null, '${enteredName}', '', false, 'lobby', 0, 0);`
			  			connection.query(queryString, function(err) {
				  			if (err) {
				  				throw err;
				  			}
				  			console.log('\n>>>>DB  user added to db -----> :' + enteredName);
				  			user.set( { update: `Create a password, ${enteredName}` } );
				  			connection.release();
				  			return;
				  		});
				  	}
	  			} else {
	  				if (userInfo[0].loggedin === 1) {
		  				console.log('\n>>>>DB  User is already logged in -----> :' + enteredName);
		  				console.log('>>>>DB  removing name from model -----> :' + enteredName)
		  				user.set( { update: `${enteredName} duplicate Login aborting...` } );
		  				user.set( { name: '' } );
		  				connection.release();
		  				return;
		  			} else if (userInfo[0].loggedin === 0) {
		  				console.log('\n>>>>DB  Username exists / not logged in/ requesting enter PW -----> :' + enteredName);
		  				user.set( { update: `Enter the PW for ${enteredName}` } );
		  				user.set( { name: enteredName } );
		  				connection.release();
		  				return;
		  			}
	  			}
		  	})
	  	});
	},
	checkPassword: function(enteredPW, player, callback){
	  	pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
	  		connection.query(queryString, function(err, playerInfo) {
	  			if (err) {
	  				throw err;
	  			}
	  			if (playerInfo.length) {
	  				if (playerInfo[0].password === '') {
		  				var queryString = `UPDATE player SET password='${enteredPW}', loggedin= true, location= 'room' WHERE name='${player.attributes.name}';`
			  			connection.query(queryString, function(err, rows) {
				  			if (err) {
				  				throw err;
				  			}
				  			console.log(`\n>>>>DB  password updated for >>${player.attributes.name}<< -----> :` + enteredPW);
		  					var additions = { loggedIn: true, location: 'room' };
		  					state.addUserState(player, playerInfo[0], additions);
				  			connection.release();
				  			return;
				  		});
	  				} else {
	  					if (playerInfo[0].password === enteredPW && playerInfo[0].loggedIn === 0) {
	  						var queryString = `UPDATE player SET loggedin= true, location= 'room' WHERE name='${player.attributes.name}';`
				  			connection.query(queryString, function(err) {
					  			if (err) {
					  				throw err;
					  			}
		  						console.log('\n>>>>DB  Password \'' + enteredPW + '\' matches ------> Logging in player-----> :' + player.attributes.name);
		  						var additions = { loggedIn: true, location: 'room' };
		  						state.addUserState(player, playerInfo[0], additions);
		  						connection.release();
					  			return;
					  		});
	  					} else {
	  						console.log('\nPassword \'' + enteredPW + '\' does not match for Player-----> :' + player.attributes.name);
	  						state.updateClientStatus(player, 'Password incorrect or already logged in, Sorry');
	  						connection.release();
	  						return;
	  					}
	  				}
	  			} else {
	  				console.log('\n>>>>DB  Player name does not exist in db -----> :' + player.attributes.name);
	  				console.log('>>>>DB  Rejecting password update request -----> :' + enteredPW)
	  				player.set( { update: `${player.attributes.name} <--- user doesn't exist` } );
	  				player.set( { password: '' } );
	  				connection.release();
	  				return;
	  			}
		  	});
	  	});
	},
	logOutPlayer: function(player){
	  	pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
	  		connection.query(queryString, function(err, playerInfo) {
	  			playerInfo = playerInfo[0];
	  			if (err) {
	  				throw err;
	  			}
	  			if (playerInfo!==undefined) {
	  				if (!playerInfo.length) {
		  				playerInfo = playerInfo[0];
		  				var queryString = `UPDATE player SET loggedin= false WHERE name='${player.attributes.name}';`
			  			connection.query(queryString, function(err, rows) {
				  			if (err) {
				  				throw err;
				  			}
				  			console.log(`\n>>>>DB  loggedIn has been set to false for >>${player.attributes.name}<<`);
				  			state.logOutPlayer(player);
				  			connection.release();
				  			return;
				  		});
		  			}
	  			} else {
	  				console.log('\n>>>>DB  Player name does not exist in db -----> :' + player.attributes.name);
	  				connection.release();
	  				return;
	  			}
		  	})
	  	});
	},
	// getCashWait: function(player) {
	// 	pool.getConnection(function(err, connection) {
	//   		if (err) {
	//   			throw err;
	//   		}
	//   		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
	//   		connection.query(queryString, function(err, playerInfo) {
	//   			if (err) {
	//   				throw err;
	//   			}
	//   			if (playerInfo.length) {
	//   				playerInfo = playerInfo[0];
	//   				var queryString = `UPDATE player SET getCashWait= 60 WHERE name='${player.attributes.name}';`
	// 	  			connection.query(queryString, function(err, rows) {
	// 		  			if (err) {
	// 		  				throw err;
	// 		  			}
	// 		  			console.log(`\ndb getCashWait has been set to 60 for >>${player.attributes.name}<<`);
	// 		  			state.syncPlayerStateDb(player, playerInfo);
	// 		  			connection.release();
	// 		  			return;
	// 		  		});
	//   			} else {
	//   				console.log('\nPlayer name does not exist in db -----> :' + player.attributes.name);
	//   				connection.release();
	//   				return;
	//   			}
	// 	  	})
	//   	});
	// },	
	getCash: function(player) {
		pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
	  		connection.query(queryString, function(err, playerInfo) {
	  			if (err) {
	  				throw err;
	  			}
	  			if (playerInfo.length) {
	  				var queryString = `UPDATE player SET accountCash= 1000, getCashWait= 60 WHERE name='${player.attributes.name}';`
		  			connection.query(queryString, function(err, rows) {
			  			if (err) {
			  				throw err;
			  			}
				  		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
				  		connection.query(queryString, function(err, updatedPlayerInfo) {
				  			if (err) {
				  				throw err;
				  			}
				  			if (playerInfo.length) {			  			
					  			console.log(`\n>>>>DB  accountCash has been set to 1000, getCashWait to 60 for >>${player.attributes.name}<<`);
					  			state.syncPlayerStateDb(player, updatedPlayerInfo[0]);
					  			connection.release();
					  			return;
					  		}
					  	});
					});
	  			} else {
	  				console.log('\nPlayer name does not exist in db -----> :' + player.attributes.name);
	  				connection.release();
	  				return;
	  			}
		  	})
	  	});
	},	
	initDb: function() {
		if (process.env.CLEARDB_DATABASE_URL) {
			pool.getConnection(function(err, connection) {
		  		if (err) {
		  			throw err;
		  		}
		  		var queryString = `DROP TABLE IF EXISTS player;`;	
		  		connection.query(queryString, function(err) {
		  			if (err) {
		  				throw err;
		  			}
		  			var queryString = `CREATE TABLE player ( id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, \
 					name CHAR(140), password CHAR(140), loggedIn BOOLEAN, location CHAR(140), accountCash INT, getCashWait INT, UNIQUE (name) );`;
	  				connection.query(queryString, function(err) {
			  			if (err) {
			  				throw err;
			  			}
			  			var queryString = `INSERT INTO player ( id, name, password, loggedin, location, accountCash, getCashWait ) VALUES (null, 'Bobs', 'UpandDownInTheWater', false, 'lobby', 0, 0 );`;
		  				connection.query(queryString, function(err) {
				  			if (err) {
				  				throw err;
				  			}
		  					connection.release();
		  					return;
				  		});
				  		return;
			  		});
				  	return;
			  	});
				return;
		  	});
		} else {
			pool.getConnection(function(err, connection) {
		  		if (err) {
		  			throw err;
		  		}
		  		var queryString = `DROP DATABASE IF EXISTS dtpoker;`;	
		  		connection.query(queryString, function(err) {
		  			if (err) {
		  				throw err;
		  			}
		  			var queryString = `CREATE DATABASE dtpoker;`;
		  			connection.query(queryString, function(err) {
			  			if (err) {
			  				throw err;
			  			}
			  			var queryString = `USE dtpoker;`;
			  			connection.query(queryString, function(err) {
				  			if (err) {
				  				throw err;
				  			}
				  			var queryString = `CREATE TABLE player ( id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, \
		 					name CHAR(140), password CHAR(140), loggedIn BOOLEAN, location CHAR(140), accountCash INT, getCashWait INT, UNIQUE (name) );`;
			  				connection.query(queryString, function(err) {
					  			if (err) {
					  				throw err;
					  			}
					  			var queryString = `INSERT INTO player ( id, name, password, loggedin, location, accountCash, getCashWait ) VALUES (null, 'Bobs', 'UpandDownInTheWater', false, 'lobby', 0, 0 );`;
				  				connection.query(queryString, function(err) {
						  			if (err) {
						  				throw err;
						  			}
				  					connection.release();
				  					return;
						  		});
						  		return;
					  		});
					  		return;
				  		});
				  		return;
				  	});
				  	return;
			  	});
				return;
		  	});
		}
	}
}