'use strict'; 
const status = require('./templates/statuscode');
const settings = require('./templates/settings.js');
const db = require('./db/db');
const qry = require('./db/qry');


module.exports = {
	login: function(user, room) {
		let username = user.attributes.editName && (user.attributes.editName.length > 0);
		let password = user.attributes.password && (user.attributes.password.length > 0);
		let sessionId = user.attributes.sessionId;
		username && password && db.login(user, room, ()=> room.add(user), ()=>user.update(status.logInSuccess(user.attributes.username)));
	},
	logout: (user, room)=>{
		db.SetUpdate(qry.updateUser, user, { sessionId: null, loggedIn: false, room: null}, 
		()=>room.remove(user), ()=>user.ws && delete user.ws);
	}, // FYI:  user.destroy() === false
	disconnect: (user, room)=>{
		if (room.type === 'lobby') {
			module.exports.logout(user, room);
		} 
		else if (room.type === 'table') {
			let table = room;
			table.remove(user);
			table.emptySeats.push(user.attributes.seat);
			table.emptySeats.sort((a,b)=>a-b);
		  table.seat[user.attributes.seat] = null;
	  	user.update({seat: null});
			delete table.disconnectQueueHash[user.attributes.username]
		  console.log(table.emptySeats)
			db.ReturnValue('accountCash, tableCash', user)
			.then((balances)=> {
				let tableCash = balances.tableCash;
				let accountCash = balances.accountCash; 
				let newBalance = accountCash+tableCash;
				return db.SetUpdate(qry.updateUser, user, 
					{accountCash: newBalance, 
					tableCash: 0, 
					room:null})
			})
		}
	},
	getCash: (user)=> {
		if (user.attributes.accountCash < 100) {
			if (!user.attributes.getCashWait) {
				db.SetUpdate(qry.updateUser, user, {accountCash: 1000, getCashWait: 1440}, ()=>user.update(status.getCashSuccess(user.attributes.username)));
			} else {
				user.update(status.waitCash());
			}
		}
	},
	getTableCash: (user, getAmount)=> {
		if (getAmount > 0) {
			db.CheckConditional('accountCash', user, (get, account)=>get<=account, getAmount)
			.then((result)=>{ 
				if (result===true) {
					db.ReturnValue('accountCash, tableCash', user)
					.then((balances)=> {
						let tableCash = balances.tableCash;
						let accountCash = balances.accountCash; 
						let newAccountBalance = accountCash-getAmount;
						let newTableBalance = tableCash+getAmount;
						return db.SetUpdate(qry.updateUser, user, 
							{accountCash: newAccountBalance, tableCash: newTableBalance}
							,()=>user.update(status.getTableCash(user.attributes.username, getAmount)))})
			} else {
				user.update(status.NotEnoughAccountCash(user.attributes.username));
			}});
		} else {
			user.update(status.tableCashError(user.attributes.username, getAmount));
		}
	},
	joinTable: (user, lobby, table)=>{ 
		let playerName = user.attributes.username;
		let NumberOfEmpty = table.emptySeats.length;
		let playerSeat = table.emptySeats.splice(Math.floor(Math.random()*NumberOfEmpty),1)[0];
		console.log('playerseat = ', playerSeat)
		console.log(table.emptySeats);
		table.seat[playerSeat] = user;
		user.update({seat: playerSeat});
		lobby.remove(user);
		table.add(user);
		return db.SetUpdate(qry.updateUser, user, {room: table.name}, ()=>user.sendUpdate({joinTableInvite: true}));
	},
	leaveTable: (user, table, lobby)=> {
		user.sendUpdate({playerAction: {} });
		table.remove(user);
		table.emptySeats.push(user.attributes.seat);
		table.emptySeats.sort(function(a, b) {
	    return a - b;
	  });
	  table.seat[user.attributes.seat] = null;
	  user.update({seat: null});
		delete table.leaveQueueHash[user.attributes.username]
	  console.log(table.emptySeats)
		db.ReturnValue('accountCash, tableCash', user)
		.then((balances)=> {
			let tableCash = balances.tableCash;
			let accountCash = balances.accountCash; 
			let newBalance = accountCash+tableCash;
			return db.SetUpdate(qry.updateUser, user, 
				{accountCash: newBalance, tableCash: 0, room:lobby.name})
		});
		lobby.swapInFilter(user, user.attributes.filters.in);
		lobby.add(user);
		user.sendUpdate({leftTable: true });
	},
}
