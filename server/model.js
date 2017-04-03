var Backbone = require('backbone');
var dbase = require('./db');

exports.User = Backbone.Model.extend({
	defaults: {
		name: 'PlayerName',
		userState: {},
		session: {},
		clientID: '',
		password: '',
		location: 'lobby',
		loggedIn: false,
		logOut: false,
		accountCash: 0,
		getCash: false,
		getCashWait: 0,
		joinTable: false,
		rejoinWaitTimer: 0,
		sitOutNext: false,
		quitYesOrNo: false,
		turn: false,
		token: null,
		bootPlayer: false,
		bootPlayerTimer: 0,
		bet: 0,
		newBet: 0,
		message: '',
		chats: [],
		update: 'nothing to report',
		Player1: {},
		Player2: {},
		Player3: {},
		Player4: {},
		Player5: {},
		Player6: {},
		Player7: {},
		Player8: {},
		Player9: {},
		Player10: {}
	},
	initialize: function() {
		this.validUserInputFilter = {
			name: true,
			password: '',
			// loggedIn: false,
			logOut: true,
			joinTable: true,
			// rejoinWaitTimer: false,
			sitOutNext: true,
			quitYesOrNo: true,
			// accountCash: '',
			getCash: true,
			// getCashWait: 24,
			// turn: false,
			// token: false,
			// bootPlayer: false,
			// bootPlayerTimer: false,
			bet: true,
			newBet: true,
			message: true
			// update: false
		};
		this.on({
			"all": ()=>{ 
				// this.attributes.session.send(JSON.stringify(this.attributes));
			},
			"change:name": ()=>{
				console.log('\n>>>>MODEL change name event triggered');
				console.log('>>>>MODEL name is now ----> :' + this.attributes.name);
				if (this.attributes.name !== '') {
					dbase.addName(this.attributes.name, this);
				}
			},
			"change:password": ()=>{
				console.log('\n>>>>MODEL change password event triggered');
				console.log('>>>>MODEL password is now ----> :' + this.attributes.password);
				if (this.attributes.password !== '') {
					dbase.checkPassword(this.attributes.password, this);
				}
			},
			"change:loggedIn": ()=>{
				console.log('\n>>>>MODEL change loggedIn event triggered');
				console.log('>>>>MODEL loggedIn is currently ----> :' + this.attributes.loggedIn);
			},
			"change:logOut": ()=>{
				console.log('\n>>>>MODEL change loggedIn event triggered');
				console.log('>>>>MODEL loggedIn is currently ----> :' + this.attributes.loggedIn);
				if (this.attributes.logOut === true) {
					dbase.logOutPlayer(this);
				}
			},
			"change:accountCash": ()=>{
				console.log('\n>>>>MODEL change accountCash event triggered');
				console.log('>>>>MODEL accountCash is currently ----> :' + this.attributes.accountCash);
			},
			"change:getCashWait": ()=>{
				console.log('\n>>>>MODEL change getCashWait event triggered');
				console.log('>>>>MODEL getCashWait is currently ----> :' + this.attributes.getCashWait);
			},
			"change:getCash": ()=>{
				console.log('\n>>>>MODEL change getCash event triggered');
				console.log('>>>>MODEL getCash is currently ----> :' + this.attributes.getCash);
				if (this.attributes.getCash === true && this.attributes.accountCash < 100) {
					if (this.attributes.getCashWait === 0) {
						dbase.getCash(this);
						// dbase.getCashWait(this);	
					}
					else state.updateClientStatus(this, 'You must wait to get more cash (check the timer!)');
				}
			},
			"change:rejoinWaitTimer": ()=>{console.log('\n change rejoinWaitTimer detected')},
			"change:sitOutNext": ()=>{console.log('\n change sitOutNext detected')},
			"change:quitYesOrNo": ()=>{console.log('\n change quitYesOrNo detected')},
			"change:turn": ()=>{console.log('\n change turn detected')},
			"change:token": ()=>{console.log('\n change token detected')},
			"change:bootPlayer": ()=>{console.log('\n change bootPlayer detected')},
			"change:bootPlayerTimer": ()=>{console.log('\n change bootPlayerTimer detected')},
			"change:bet": ()=>{console.log('\n change bet detected')},
			"change:newBet": ()=>{console.log('\n change newBet detected')},
			"change:chats": ()=>{
				console.log('\n>>>>MODEL change chats event triggered');
				console.log('>>>>MODEL chats is currently ----> :' + this.attributes.chats);
			},
			"change:message": ()=>{
				console.log('\n>>>>MODEL change message event triggered');
				console.log('>>>>MODEL message is currently ----> :' + this.attributes.message);
			},
			"change:update": ()=>{
				// console.log('\n>>>>MODEL change update event triggered');
				// console.log('>>>>MODEL update is currently ----> :' + this.attributes.update); 
			}
		});
	}
});
var User = exports.User;


var UsersGroup = Backbone.Collection.extend({
	model: User,
	initialize: function () {
		this.on({"change:message": 
			(sendingUser, msg)=> { this.each( function(user) {
				if (user.attributes.chats.length > 10) {
					for (var i = 9; i < user.attributes.chats.length-1; i++) {
						user.attributes.chats.pop();
					}
				}
				user.set( { chats: [`(${sendingUser.attributes.name}) ${msg}`].concat(user.attributes.chats) });
			});
		}
		});
	}	
});

var guests = new UsersGroup();
exports.guests = guests;

// exports.lobbyChat = Backbone.Collection.extend({
// 	initialize: function () {
// 		this.on({"all": ()=> {
// 			console.log('XXXXXX THE LOBBY CHAT BACKBONE IS --->:' + this);
// 			}
// 		});
// 	}
// });
// var lobbyChat = exports.lobbyChat;
// var lobbyChatBb = new lobbyChat();
// exports.lobbyChatBb = lobbyChatBb;

exports.getUserObj = function(userName) {
	for (var i = 0; i < guests.models.length; i++) {
		var user = guests.models[i];
		if (user.attributes.name === userName) {
			return user;
		}
	}
	return {};
}



exports.filterInputFromClient = function(recObj, user, allowfilterObj) {
	for (var x in user.attributes) {
		if (x in allowfilterObj) {
			user.set( { [x]: recObj[x] || user.attributes[x] } );
		}
	}
}