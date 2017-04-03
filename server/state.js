var Backbone = require('backbone');
var dbase = require('./db');
var model = require('./model');

exports.UserState = Backbone.Model.extend({
	defaults: {
		name: 'PlayerName',
		userModel: {},
		session: {},
		password: '',
		loggedIn: false,
		logOut: false,
		location: 'lobby',
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
		this.updateUserModelFilter = {
			name: true,
			// password: '',
			loggedIn: true,
			// logOut: true,
			location: true,
			// accountCash: true,
			// getCashWait: true,
			// joinTable: true,
			// rejoinWaitTimer: false,
			// sitOutNext: true,
			// quitYesOrNo: true,
			// accountCash: '',
			// getCash: true,
			// getCashWait: 24,
			// turn: false,
			// token: false,
			// bootPlayer: false,
			// bootPlayerTimer: false,
			// bet: true,
			// newBet: true,
			// message: true
			// update: false
		};
		this.on({
			"all": ()=>{
				console.log(this.userModel);
				// var setUserModelObj = filterUpdateToUserModel(this.attributes, this.userModel, this.updateUserModelFilter)
				// this.userModel.set(setUserModelObj);
			},
			"change:name": ()=>{
				console.log('\n>>>>STATE  change name event triggered');
				console.log('>>>>STATE  name is now ----> :' + this.attributes.name);
			},
			"change:password": ()=>{
				console.log('\n>>>>STATE  change password event triggered');
				console.log('>>>>STATE  password is now ----> :' + this.attributes.password);
			},
			"change:loggedIn": ()=>{
				console.log('\n>>>>STATE  change loggedIn event triggered');
				console.log('>>>>STATE  loggedIn is now ----> :' + this.attributes.loggedIn);
				this.attributes.userModel.set( { loggedIn: true } );
			},
			"change:logOut": ()=>{
				console.log('\n>>>>STATE  change logOut event triggered');
				console.log('>>>>STATE  logOut is currently ----> :' + this.attributes.logOut);
			},
			"change:accountCash": ()=>{
				console.log('\n>>>>STATE  change accountCash event triggered');
				console.log('>>>>STATE  accountCash is currently ----> :' + this.attributes.accountCash);
				this.attributes.userModel.set( { accountCash: this.attributes.accountCash } );
			},
			"change:getCashWait": ()=>{
				console.log('\n>>>>STATE  change getCashWait event triggered');
				console.log('>>>>STATE  getCashWait is currently ----> :' + this.attributes.getCashWait);
				this.attributes.userModel.set( { getCashWait: this.attributes.getCashWait } );
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
				console.log('\n>>>>STATE  change update event triggered');
				console.log('>>>>STATE  update is currently ----> :' + this.attributes.update);
				this.attributes.userModel.set( { update: this.attributes.update } ); }
			})
	}
});
var UserState = exports.UserState;

var UsersStateGroup = Backbone.Collection.extend({
		model: UserState
});
var allUsersStateGroup = new UsersStateGroup();

exports.syncPlayerStateDb = function(player, playerInfo) {
	for (var x in playerInfo) {
		player.set( { [x]: playerInfo[x] } );
	}
}
var getStateUserObj = function(userName) {
	for (var i = 0; i < allUsersStateGroup.models.length; i++) {
		var user = allUsersStateGroup.models[i];
		if (user.attributes.name === userName) {
			return user;
		}
	}
	return false;
}

exports.addUserState = function(user, userDBInfo, additions) {
	var userState = new UserState();
	console.log('\n>>>>STATE  State for User ' + user.attributes.name + ' created');
	allUsersStateGroup.add(userState);
	userState.set( { userModel: user } );
	userState.set(Object.assign(userDBInfo, additions));
	// for (var x in userDBInfo) {
	// 	x !== 'loggedIn' ? userState.set( { [x]: userDBInfo[x] } ) : userState.set( { loggedIn: true} );
	// }
}

exports.logOutPlayer = function(player) {
	console.log('(((((still need to write state.logOutPlayer function))))))');
}
exports.updateClientStatus = function(player, message) {
	player.set( { update: message} );
}

var filterUpdateToUserModel = function(userStateAttributes, userModel, allowfilterObj) {
	for (var x in userStateAttributes) {
		if (x in allowfilterObj) {
			userModel.set( { [x]: userStateAttributes[x] } );
		}
	}
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