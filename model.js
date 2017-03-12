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
	}
});
var Player = exports.Player;


exports.Players = Backbone.Collection.extend({
		model: Player
});
var Players = exports.Players;
exports.PlayersBb = new Players();

	
exports.pokerObj = {
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
}
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