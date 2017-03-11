var TableState = {
	playersAtTable: [],
	waitList: [],
	willSitPlayers: [],
	sittingPlayers: [],
	exitingPlayers: [],
	token: null,
	bootPlayer: [],
	bootPlayerTimer: []
};

var PlayerAccount = {
	bet: 0,
	newBet: 0,
	money: 0,

};

var playerState = {
	name: '',
	joinTable: false,
	rejoinWaitTimer: 0,
	sitOutNext: false,
	quitYesOrNo: false,
	turn: false,
	token: null,
	bootPlayer: false,
	bootPlayerTimer: 0,
	bet: 0,
	newBet: 0
};