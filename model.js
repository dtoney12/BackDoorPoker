var Backbone = require('backbone');

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
		this.on([
			"change:name": function() {console.log('\n change name detected')},
			"change:password": function() {console.log('\n change password detected')},
			"change:joinTable": function() {console.log('\n change joinTable detected')},
			"change:rejoinWaitTimer": function() {console.log('\n change rejoinWaitTimer detected')},
			"change:sitOutNext": function() {console.log('\n change sitOutNext detected')},
			"change:quitYesOrNo": function() {console.log('\n change quitYesOrNo detected')},
			"change:turn": function() {console.log('\n change turn detected')},
			"change:token": function() {console.log('\n change token detected')},
			"change:bootPlayer": function() {console.log('\n change bootPlayer detected')},
			"change:bootPlayerTimer": function() {console.log('\n change bootPlayerTimer detected')},
			"change:bet": function() {console.log('\n change bet detected')},
			"change:newBet": function() {console.log('\n change newBet detected')},
			"change:message": function() {console.log('\n change message detected')},
			])		
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
		// password: '',
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