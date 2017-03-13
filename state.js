var Backbone = require('backbone');
var dbase = require('./db');
var model = require('./model');

exports.PlayerState = Backbone.Model.extend({
	defaults: {
		name: 'PlayerName',
		model: {},
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
		this.on({
			"change:name": ()=>{
				console.log('\n(player state change name event triggered)');
				console.log('state name is now ----> :' + this.attributes.name);
			},
			"change:password": ()=>{
				console.log('\n(player state change password event triggered)');
				console.log('state password is now ----> :' + this.attributes.password);
			},
			"change:loggedIn": ()=>{
				console.log('\n(player state change loggedIn event triggered)');
				console.log('state loggedIn is now ----> :' + this.attributes.loggedIn);
				this.attributes.model.set( { loggedIn: true } );
			},
			"change:logOut": ()=>{
				console.log('\n(player state change logOut event triggered)');
				console.log('state logOut is currently ----> :' + this.attributes.logOut);
			},
			"change:accountCash": ()=>{
				console.log('\n(player state change accountCash event triggered)');
				console.log('state accountCash is currently ----> :' + this.attributes.accountCash);
				this.attributes.model.set( { accountCash: this.attributes.accountCash } );
			},
			"change:getCashWait": ()=>{
				console.log('\n(player state change getCashWait event triggered)');
				console.log('state getCashWait is currently ----> :' + this.attributes.getCashWait);
				this.attributes.model.set( { getCashWait: this.attributes.getCashWait } );
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
			"change:update": ()=>{
				console.log('\n(player state change update event triggered)');
				console.log('state update is currently ----> :' + this.attributes.update);
				this.attributes.model.set( { update: this.attributes.update } ); }
			})		
	}
});
var PlayerState = exports.PlayerState;

exports.PlayersState = Backbone.Collection.extend({
		model: PlayerState
});
var PlayersState = exports.PlayersState;
var currentUsers = new PlayersState();

exports.syncPlayerStateDb = function(player, playerInfo) {
	console.log('(((((( SYNC ATTMEPTING )))))')
	console.log('playerInfo rows = ', playerInfo);
	for (var x in playerInfo) {
		console.log('SYNC EVENT' +playerInfo[x]);
		player.set( { [x]: playerInfo[x] } );
	}
}
var getStateUserObj = function(userName) {
	console.log('looking')
	for (var i = 0; i < currentUsers.models.length; i++) {
		var user = currentUsers.models[i];
		if (user.attributes.name === userName) {
			return user;
		}
	}
	return false;
}

exports.registerNewPlayer = function(enteredName) {
	console.log('\nAttempting to create Player >>' + enteredName + '<<')
	var player = new PlayerState();
	player.set( { name: enteredName });
	console.log('\nPlayer >>' + player.attributes.name + '<< created');
	currentUsers.add(player);
	console.log('Player >>' + player.attributes.name + '<< added to currentUsers');
	player.set( { model: model.getUserObj(enteredName) } );
	console.log('Player >>' + player.attributes.name + '<< **** { model object } ***** added');
	return player;
}
exports.logInPlayer = function(player, playerInfo) {
	for (var x in playerInfo) {
		player.set( { [x]: playerInfo[x] } );
		player.set( { loggedIn: true} );
	}
}
exports.logOutPlayer = function(player) {
	console.log('(((((still need to write state.logOutPlayer function))))))');
}
exports.updateClientStatus = function(player, message) {
	player.set( { update: message} );
}



// exports.updatePassword = function(enteredPW, userName){
// 	var player = exports.getUserObj(userName);
// 	if (player) {
// 		player.set( { password: enteredPW });
// 		console.log('\nPlayer >>' + player.attributes.name + '<< password set to ' + player.attributes.password);
// 		player.set( { loggedIn: true });
// 		console.log('Player >>' + player.attributes.name + '<< loggedIn set to ' + player.attributes.loggedIn);
// 	}
// }

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