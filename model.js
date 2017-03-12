var Backbone = require('backbone');
var dbase = require('./db');
var helper = require('./helper');

exports.Player = Backbone.Model.extend({
	defaults: {
		name: 'PlayerName',
		password: '',
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
		update: ''
	},
	initialize: function() {
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
					dbase.addPassword(this.attributes.password, this);
				}
			},
			"change:joinTable": ()=>{console.log('\n change joinTable detected')},
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
			})		
	}
});
var Player = exports.Player;


exports.Players = Backbone.Collection.extend({
		model: Player
});
var Players = exports.Players;
exports.PlayersBb = new Players();

exports.allowFilterPokerObj = {
		name: true,
		password: '',
		joinTable: true,
		// rejoinWaitTimer: false,
		sitOutNext: true,
		quitYesOrNo: true,
		// turn: false,
		// token: false,
		// bootPlayer: false,
		// bootPlayerTimer: false,
		bet: true,
		newBet: true,
		message: true,
		update: true
}

exports.mergeObj = function(newObj, stateObj, allowfilterObj) {
	for (var x in stateObj.attributes) {
		if (x in allowfilterObj) {
			stateObj.set( { [x]: newObj[x] || stateObj.attributes[x] } );
		}
	}
}