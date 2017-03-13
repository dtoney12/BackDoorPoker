var Backbone = require('backbone');
var dbase = require('./db');

exports.Player = Backbone.Model.extend({
	defaults: {
		name: 'PlayerName',
		password: '',
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
		this.filter = {
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
			"change:name": ()=>{
				console.log('\n(player model change name event triggered)');
				console.log('model name is now ----> :' + this.attributes.name);
				if (this.attributes.name !== '') {
					dbase.addName(this.attributes.name, this);
				}
			},
			"change:password": ()=>{
				console.log('\n(player model change password event triggered)');
				console.log('model password is now ----> :' + this.attributes.password);
				if (this.attributes.password !== '') {
					dbase.checkPassword(this.attributes.password, this);
				}
			},
			"change:loggedIn": ()=>{
				console.log('\n(player model change loggedIn event triggered)');
				console.log('model loggedIn is currently ----> :' + this.attributes.loggedIn);
			},
			"change:logOut": ()=>{
				console.log('\n(player model change loggedIn event triggered)');
				console.log('model loggedIn is currently ----> :' + this.attributes.loggedIn);
				if (this.attributes.logOut === true) {
					dbase.logOutPlayer(this);
				}
			},
			"change:accountCash": ()=>{
				console.log('\n(player model change accountCash event triggered)');
				console.log('model accountCash is currently ----> :' + this.attributes.accountCash);
			},
			"change:getCashWait": ()=>{
				console.log('\n(player model change getCashWait event triggered)');
				console.log('model getCashWait is currently ----> :' + this.attributes.getCashWait);
			},
			"change:getCash": ()=>{
				console.log('\n(player model change getCash event triggered)');
				console.log('model getCash is currently ----> :' + this.attributes.getCash);
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
			"change:message": ()=>{console.log('\n change message detected')},
			"change:update": ()=>{
				console.log('\n(player model change update event triggered)');
				console.log('model update is currently ----> :' + this.attributes.update); }
			})		
	}
});
var Player = exports.Player;


exports.Players = Backbone.Collection.extend({
		model: Player
});
var Players = exports.Players;
var PlayersBb = new Players();
exports.PlayersBb = PlayersBb;

exports.getUserObj = function(userName) {
	for (var i = 0; i < PlayersBb.models.length; i++) {
		var user = PlayersBb.models[i];
		if (user.attributes.name === userName) {
			return user;
		}
	}
	return false;
}



exports.mergeObj = function(newObj, modelObj, allowfilterObj) {
	for (var x in modelObj.attributes) {
		if (x in allowfilterObj) {
			modelObj.set( { [x]: newObj[x] || modelObj.attributes[x] } );
		}
	}
}