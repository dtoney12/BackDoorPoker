module.exports = {
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
		// message: true,
		update: true
	},
	nothing: null,
	mergeObj: function(newObj, stateObj, allowfilterObj) {
		for (var x in stateObj) {
			if (x in allowfilterObj) {
				stateObj[x] = newObj[x] || stateObj[x];
			}
		}
	}
}
	