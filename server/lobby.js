'use strict';
const Backbone = require('backbone');
const settings = require('./templates/settings.js');
const status = require('./templates/statuscode');
const log = require('./templates/log.js');
const consoleUserUpdate = log.consoleUserUpdate();
const whoIsInRoom = log.whoIsInRoom();
const accounts = require('./accounts');
const util = require('./db/util');


const User = Backbone.Model.extend({
	defaults: settings.default_user,
	initialize: function () { 
		this.inFilter = Object.keys(this.attributes.filters.in);
		this.outFilter = Object.keys(this.attributes.filters.out);
		this.handleInput =   (received)=>{
			if (this.attributes.loggedIn) {
				this.inFilter.forEach((key)=>{  
					if (key in received) {
						if (Number.isInteger(this.attributes[key])) {
							received[key] = parseInt(received[key]);
						}
						this.set({[key]: received[key]});
						(key!=='editName' && key!=='password') ? this.attributes[key] = settings.default_user[key] : null; // using && causes "Invalid left-hand side in assignment"
					}
				});
			} else if (received.editName || received.password) {
				received.editName && this.set({editName: received.editName});
				received.password && this.set({password: received.password});
			}
		};
		this.on({
			// "change:editName": 	()=> accounts.login(this, users),
			"change:password": 			(user, value)=> accounts.login(this, users),
			"change:logout": 				(user, value)=> accounts.logout(this, users),
			"change:getCash": 			(user, value)=> accounts.getCash(this),
			"change:getTableCash":	(user, value)=> accounts.getTableCash(this, value),
			"change:joinTable": 		(user, value)=> room.table1.joinQueueJoin(this),
			//  in ------>> 

			// <<---- out
			"change:username": 			(user, value)=> this.sendUpdate({username: value}),
			"change:loggedIn": 			(user, value)=> this.sendUpdate({loggedIn: value}),
			"change:sessionId": 		(user, value)=> this.sendUpdate({sessionId: value}),
			"change:accountCash": 	(user, value)=> this.sendUpdate({accountCash: value}),
			"change:tableCash":   	(user, value)=> this.sendUpdate({tableCash: value}),
			"change:chats": 				(user, value)=> this.sendUpdate({chats: value}),
			"change:seat":          (user, value)=> this.sendUpdate({seat: value}),
			"change:holdCards":     (user, value)=> this.sendUpdate({holdCards: value}),
			"change:update": 				(user, value)=> this.sendUpdate({update: value}),
		});
		this.update = (updateParams)=>{ 
			var logParams = {};
			for (let key in updateParams)  {
				this.set({[key]: updateParams[key]});
				(key in this.attributes.filters.out) && (logParams[key] = updateParams[key])
			}
			consoleUserUpdate(this, logParams); 
		};
		this.sendUpdate = (toSend)=> {
			if ( !!this.attributes.sessionId && !(this.attributes.sessionId === 'ROBOT') ) {
				this.ws.send(JSON.stringify(toSend));
			}
		};
		this.sendUpdate = this.sendUpdate.bind(this);
	},
});

const UsersGroup = Backbone.Collection.extend({
	model: User,
	initialize: function () { 
		this.on({
			"change:message":       (sender, msg)=> this.each((user)=> user.update({chats:`(${sender.attributes.username}) ${msg}`})),
			"change:disconnect":    (user, value)=> accounts.disconnect(user, this),
			"add": 		      (user, attributesArr)=> whoIsInRoom(this, user, 'ADD to'),       // just logging
			"remove":       (user, attributesArr)=> whoIsInRoom(this, user, 'REMOVE from'),  // just logging
		});
		this.swapInFilter =  (player, filter)=> player.inFilter = Object.keys(filter);
	},
});

var users = new UsersGroup();
users = Object.assign(users, settings.lobby);
module.exports = {
	User: User,
	users: users,
}
const room = require('./room');


