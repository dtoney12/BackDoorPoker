var Backbone = require('backbone');
var dbase = require('./db');
var helper = require('./helper');

exports.PlayerState = Backbone.Model.extend({
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
				console.log('\n(player state change name event triggered)');
				console.log('state name is now ----> :' + this.attributes.name);
			},
			"change:password": ()=>{console.log('\n change password detected')},
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
var PlayerState = exports.PlayerState;

exports.PlayersState = Backbone.Collection.extend({
		model: PlayerState
});
var PlayersState = exports.PlayersState;
var currentUsers = new PlayersState();
exports.registerNewPlayer = function(enteredName) {
	console.log('\nAttempting to create Player >>' + enteredName + '<<')
	var player = new PlayerState();
	player.set( { name: enteredName });
	console.log('\nPlayer >>' + player.attributes.name + '<< created');
	currentUsers.add(player);
	console.log('Player >>' + player.attributes.name + '<< added to currentUsers');
}

// var TableState = {
// 	playersAtTable: [],
// 	waitList: [],
// 	willSitPlayers: [],
// 	sittingPlayers: [],
// 	exitingPlayers: [],
// 	token: null,
// 	bootPlayer: [],
// 	bootPlayerTimer: []
// };

// var PlayerAccount = {
// 	bet: 0,
// 	newBet: 0,
// 	money: 0,

// };

// var playerState = {
// 	name: '',
// 	joinTable: false,
// 	rejoinWaitTimer: 0,
// 	sitOutNext: false,
// 	quitYesOrNo: false,
// 	turn: false,
// 	token: null,
// 	bootPlayer: false,
// 	bootPlayerTimer: 0,
// 	bet: 0,
// 	newBet: 0
// };