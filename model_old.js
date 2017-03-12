var Backbone = require('backbone');

module.exports = {
	Player: Backbone.Model.extend({
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
	}),
	Players: Backbone.Collection.extend({
		model: module.exports.Player
	}),
	pokerObj: {
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
	allowFilterPokerObj: {
		name: true,
		password: '',
		joinTable: true,
		rejoinWaitTimer: false,
		sitOutNext: true,
		quitYesOrNo: true,
		turn: false,
		token: false,
		bootPlayer: false,
		bootPlayerTimer: false,
		bet: true,
		newBet: true,
		message: true,
		update: true
	},
	nothing: null,
	mergeObj: function(newObj, stateObj, allowfilterObj) {
		for (var x in stateObj.attributes) {
			if (x in allowfilterObj) {
				stateObj.set( { [x]: newObj[x] || stateObj.attributes[x] } );
			}
		}
	}
}


module.exports.PlayersBb = new module.exports.Players();
// console.log('collection created :', module.exports.PlayersBb);
// var player = new module.exports.Player();
// console.log('player created : ', player)
// module.exports.PlayersBb.add({
// 			name: 'PlayerName',
// 			password: '',
// 			joinTable: false,
// 			rejoinWaitTimer: 0,
// 			sitOutNext: false,
// 			quitYesOrNo: false,
// 			turn: false,
// 			token: null,
// 			bootPlayer: false,
// 			bootPlayerTimer: 0,
// 			bet: 0,
// 			newBet: 0,
// 			message: '',
// 			update: ''
// 		});
// console.log('collection after add : ', module.exports.PlayersBb);




	