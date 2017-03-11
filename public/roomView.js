'use strict';

var playerState = {
	name: 'Bob',
	joinTable: 'false',
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

ReactDOM.render(React.createElement(TableView, { playerState: playerState }), document.getElementById('room'));