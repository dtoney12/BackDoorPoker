'use strict'
const Backbone = require('backbone');
const settings = require('./templates/settings');
const status = require('./templates/statuscode');
const log = require('./templates/log');
const consoleUserUpdate = log.consoleUserUpdate();
const whoIsInRoom = log.whoIsInRoom();
const lobby = require('./lobby');
const bots = require('./bots/bots');
const botLogic = require('./bots/botLogic')
const db = require('./db/db');
const qry = require('./db/qry');
const accounts = require('./accounts');
const util = require('./db/util');
const handChecker = require('./handChecker');

db.initDb(bots.lobbyBots, bots.getCashBots, bots.getTableCashBots, bots.tableBots, 
					bots.lobbyConfigs, bots.getCashConfigs, bots.getTableCashConfigs, bots.tableConfigs);

var Table = Backbone.Collection.extend({
	initialize: function () { 
		const State = Backbone.Model.extend({ defaults: settings.state });
		const table1State = this.add(new State());
		const state = table1State.attributes;
		this.setState =  (update)=>{ for (let key in update) { table1State.set({[key]: update[key]}); }};		
		this.on({
			// client side changes
			"change:clientReady":     	     (user)=> this.updatePlayerOfSeatStates(user),		//user.outFilter.forEach((attr)=>user.sendUpdate({[attr]: user.attributes[attr]})),
			"change:message":         (sender, msg)=> this.each((user)=>user.attributes.type && user.update({chats:`(${sender.attributes.username}) ${msg}`})),
			"change:tableCash":     (sender, value)=> this.updateAllAboutPlayer(sender, value, 'tableCash'),
			"change:playerAction":  (sender, value)=> this.updateAllAboutPlayer(sender, value, 'playerAction'),
			"change:playerState":   (sender, value)=> this.updateAllAboutPlayer(sender, value, 'playerState'),
			"change:holeCards":     (sender, value)=> this.updateAllAboutPlayer(sender, value, 'holeCards'),
			"change:winningCards":  (sender, value)=> this.updateAllAboutPlayer(sender, value, 'winningCards'),
			"change:fold":   	      (sender, value)=> this.fold(sender), // fold() => player.update(playerAction)
			"change:check":         (sender, value)=> this.check(sender), // check() => player.update(playerAction)
			"change:post":          (sender, value)=> {
				console.log('sender seat = ', sender.attributes.seat)
				this.inputBet(sender, value, 'post'); // inputBet() => player.update(playerAction)
			},
			"change:call":          (sender, value)=> this.inputBet(sender, value, 'call'),
			"change:bet": 	        (sender, value)=> this.inputBet(sender, value, 'bet'),
			"change:raise":         (sender, value)=> this.inputBet(sender, value, 'raise'),
			"change:allIn":  	      (sender, value)=> this.inputBet(sender, value, 'allIn'),
			"change:show":  	      (sender, value)=> this.updateAllAboutPlayer(sender, sender.attributes.holeCards, 'holeCards'),
			"change:inFilter":     (user, inFilter)=> this.updateInputOptions(user, inFilter),
			"change:pause":  	                   ()=> this.pause(),
			"change:unpause":  	                 ()=> this.unpause(),

			// build these into update all players of player State
			"change:leaveTable":           (sender)=> this.leaveQueueJoin(sender),
			"change:disconnect":             (user)=> this.disconnectQueueJoin(user),
			"add": 		        (user, attributesArr)=> { this.loadPlayerToState(user); 
				whoIsInRoom(this, user, 'ADD to') 
			}, 
			"remove":         (user, attributesArr)=> { this.unloadPlayerFromState(user); 
				whoIsInRoom(this, user, 'REMOVE from'); 
			},  // just logging

			// table state changes
			"change:update":    			       (state, value)=> this.sendUpdateAll({update: value}),
			"change:dealer":    			       (state, value)=> this.sendUpdateAll({dealer: value}),
			"change:smallBlindSeat":         (state, value)=> this.sendUpdateAll({smallBlindSeat: value}),
			"change:bigBlindSeat":           (state, value)=> this.sendUpdateAll({bigBlindSeat: value}),
			"change:round":     			       (state, value)=> this.sendUpdateAll({round: value}),
			"change:roundOnlyPotsCallValue": (state, value)=> this.sendUpdateAll({roundOnlyPotsCallValue: value}),
			"change:turn":      			       (state, value)=> this.sendUpdateAll({turn: value}),
			"change:pots": 						       (state, value)=> this.sendUpdateAll({pots: value}),
			"change:potsBeginRound":         (state, value)=> this.sendUpdateAll({potsBeginRound: value}),
			"change:communityCards":         (state, value)=> this.sendUpdateAll({communityCards: value}),
		});														

		this.swapInFilter =           (player, filter)=>  player.set({inFilter: Object.keys(filter)});
		this.addTurnFilter =                  (player)=>	player.set({inFilter: util.extendKeysToArray(player.attributes.inFilter, state.filterForTurn)});
		this.removeTurnFilter =               (player)=>  player.set({inFilter: util.unExtendFromArray(player.attributes.inFilter, state.filterForTurn)});
		this.updateInputOptions =   (player, inFilter)=>  {
			let inputOptions = util.copy(state.filters.inDefault);
			// console.log('inFilter =', inFilter)
			inFilter.forEach((input)=>{
				let tableCash = player.attributes.tableCash;
				let amountToCall = player.attributes.leftToCall;
				let minRaise = amountToCall+state.bigBlindAmount;
				if (input=== 'check' || input==='fold') {
					inputOptions[input] = true;
				} else if (input === 'call') {
					if (tableCash >= amountToCall) {
						inputOptions[input] = amountToCall;
					}
				} else if (input === 'bet') {
					let minBet = state.bigBlindAmount;
					if (tableCash >= minBet) {
						inputOptions[input] = minBet;
					}
				} else if (input === 'raise') {
					if (tableCash >= minRaise) {
						inputOptions[input] = minRaise;
					}
				} else if (input === 'allIn') {
					if (tableCash < amountToCall) {
						inputOptions[input] = tableCash;
					}
				}
			});
			// console.log('inputOptions =', inputOptions);
			player.sendUpdate({inputOptions: inputOptions});
		};
		this.loadPlayerToState =     					(player)=>  {
			let seatNumber = player.attributes.seat;
			state.seat[seatNumber] = player.attributes;
			for (let key in state.filters.otherPlayerOut) {
				this.updateAllAboutPlayer(player, player.attributes[key], key);
			}
		}
		this.unloadPlayerFromState = 					(player)=>  state.seat[player.attributes.seat] = null;  //untested

		this.updatePlayerOfSeatStates =       (player)=>{
			if (true||(!(player.attributes.clientReceived))) {  // block player from spamming clientReady
				Object.values(state.seat).forEach((playerAttributesEntry, i)=> {
					if (!!playerAttributesEntry) {
						for (let key in playerAttributesEntry) {
							let seatNumber = i+1;
							if (key in state.filters.otherPlayerOut) {
								player.sendUpdate({seat:{ [seatNumber]: {[key]: state.seat[seatNumber][key] }}});
							}
						}
					}
				});
				this.sendBlankOtherPlayerHoleCards(player);
				player.sendUpdate({tableCash: player.attributes.tableCash });  // can update more client attributes here if necessary
				player.sendUpdate({clientReceived: true });
			} else {
				player.update(status.clientAlreadyReceived(player.attributes.username));
			}
		};
		this.updateAll = 									   		 (update)=>  this.each((user)=> user.attributes.type && user.update(update));
		this.sendUpdateAll =                (tableUpdate)=>  {
			this.each((user)=> user.attributes.type && user.sendUpdate(tableUpdate));
			lobby.users.each((user)=> user.attributes.type && user.sendUpdate(tableUpdate));
		}
		this.updateAllAboutPlayer =(player, update, attr)=>  {
			if (attr==='playerAction') {
				for (let action in update) {
					this.setState({update: `Player${player.attributes.seat}: ${player.attributes.username} ${action} ${update[action]===true?'':update[action]}` });
				}
			}
			this.each((user)=> user.attributes.type && user.sendUpdate({ seat: {[player.attributes.seat]: {[attr]: update } }}));
			lobby.users.each((user)=> user.attributes.type && user.sendUpdate({ seat: {[player.attributes.seat]: {[attr]: update } }}));
		};

		this.inputBet = 			(player, value, betType)=>  {
			if (value===player.attributes.tableCash) {
				betType='allIn';
			} else if ((betType==='call') || (betType==='bet') || ((betType === 'post') && (player.attributes.seat === state.bigBlindSeat) )) {
				this.setState({betPlaced: true });
				this.setState({calledBet: state.calledBet+1 });
			} else if (betType==='raise') {
				this.setState({betPlaced: true });
				this.setState({calledBet: 1 });
				this.each((player)=>{
					for (let playerActionType in player.attributes.playerAction) {
						if (playerActionType==='call') {
							player.attributes.playerAction = {};
						}
					}
				});
			}
			player.update({tableCash: player.attributes.tableCash-value});
			player.update({callAmountThisRound: player.attributes.callAmountThisRound + value });
			player.update({playerAction: {[betType]: value} });
			let copyOfPots = util.copy(state.pots);
			this.callPot(player, value, copyOfPots[0], copyOfPots);
			this.setState({pots: copyOfPots});
			if (betType==='allIn') {
				let playersCalledBet = 0;
				this.each((player)=>{
					if (player.attributes.type) {  // not state object
						if ('fold' in player.attributes.playerAction) {
							console.log('DUE TO ALL-IN, in inputBet(), logging that player', player.attributes.username,' has folded');
						} else if ('allIn' in player.attributes.playerAction) {
							console.log('DUE TO ALL-IN, in inputBet(), logging that player', player.attributes.username,' is ALL-IN');
						} else {
							this.calculateLeftToCall(player);
							if (player.attributes.leftToCall===0) {
								console.log('DUE TO ALL-IN, in inputBet(), logging that player', player.attributes.username,' has called all pots');
								playersCalledBet++;
							} 
						}
					}
				});
				console.log('RESETTING state.calledBet TO ', playersCalledBet);
				this.setState({betPlaced: true });
				this.setState({allInBet: state.allInBet+1 })
				this.setState({calledBet: playersCalledBet });
			}
			if (betType!=='post') {
				this.changeTurnNow();
			}
		};
		this.fold = (player)=> {
			for (let playerActionType in player.attributes.playerAction) {
				if (playerActionType in state.calledBetIncrementTypes) {
					this.setState({calledBet: state.calledBet-1 });
				} else if (playerActionType==='allIn') {
					this.setState({allInBet: state.allInBet-1 });
				} else if (playerActionType==='check') {
					this.setState({checkedBet: state.checkedBet-1 });
				}
			}
			player.update({playerAction: {fold: true} });
			this.setState({playersInHand: state.playersInHand-1 });
			this.changeTurnNow();
		};
		this.check = (player)=> {
			player.update({playerAction: {check: true} });
			this.setState({checkedBet: state.checkedBet+1 });
			this.changeTurnNow();
		};
		this.takenSeats = ()=>  Object.entries(this.seat).filter((tuple)=>tuple[1]).map((tuple)=>tuple[0]);
		this.changeTurnSeat = ()=>{
			let nextPossibleTurn = this.findNextSeat(state.turn);
			while (nextPossibleTurn!==state.turn) {
				let player = this.seat[nextPossibleTurn];
				let nextSeatAction = player.attributes.playerAction;
				if ( (!('fold' in nextSeatAction)) && (!('allIn' in nextSeatAction)) ) {
					this.setState({turn: nextPossibleTurn});
					return;
				}
				nextPossibleTurn = this.findNextSeat(nextPossibleTurn);
			}
			this.seat[state.turn].update(status.changeTurnsCycling());
		};
		this.findNextSeat = (seatNumber)=> {
			let nextPossibleSeat = Math.min.apply(null, this.takenSeats()
			.filter((seat)=>seat>seatNumber));
			let nextSeat;
			if (nextPossibleSeat!==Infinity) {
				nextSeat = nextPossibleSeat;
			} else {
				nextSeat = Math.min.apply(null, this.takenSeats());
			}
			return nextSeat;
		};
		this.pollForStart = ()=> {
			return setInterval(()=>{
				let numberPlayers = 10-this.emptySeats.length-this.disconnectQueue.length-this.leaveQueue.length;
				if (numberPlayers >= 2) {
					clearInterval(this.pollForStartTimer);
					this.serviceTransitions(
						this.checkEnoughTableCash,
						this.serviceLeaveQueue,
						this.serviceDisconnectQueue,
						this.serviceJoinQueue,
						this.resetHand,
						this.serviceAnnounceStartHand,
						this.pickDealer,
						this.announceRound,
						this.placeSmallBlind,
						this.placeBigBlind,
						this.dealCards,
						this.checkRoundConditions
					);
				} else {
					this.serviceLeaveQueue();
					this.serviceDisconnectQueue();
					this.serviceJoinQueue();
				}
			}, this.pollTimer)
		};
		// Transitions are processed by serviceTransitions()
		this.serviceTransitions = function() {
			let transFuncs = Array.prototype.slice.call(arguments);
			let i = 0;
			if (transFuncs[i]) {
				transFuncs[i]();
				state.waitForTransitions = this.transitionsDuration(transFuncs, i)
			}
		};
		this.transitionsDuration = (transFuncs, i)=>{
			return setTimeout(()=>{
				clearTimeout(state.waitForTransitions);
				i++;
				if (transFuncs[i]) {
					transFuncs[i]();
					state.waitForTransitions = this.transitionsDuration(transFuncs, i);
				}
			}, state.transitionsTimer);
		};
		this.joinQueueJoin = (player)=> {
			let playerName = player.attributes.username;
			if (player.attributes.tableCash >= 100) {
				if (!(playerName in this.joinQueueHash)) {
					if (!(playerName in this.leaveQueueHash) && !(playerName in this.disconnectQueueHash)) {
						this.joinQueueHash[playerName]=player;
						this.joinQueue.push(player);
						this.swapInFilter(player, state.filters.inDefault);
						player.update(status.willJoinTable(playerName));
					} else if (playerName in this.leaveQueueHash) {
						player.update(status.waitForLeaveTable(playerName));
					} else if (playerName in this.disconnectQueueHash) {
						//  Need to restore session here instead of making player wait
						player.update(status.waitForDisconnect(playerName));    //   <----- restore session when you have time to write
					}
				}	
			} else {
				player.update(status.NotEnoughTableCash(playerName));
			}
		};
		this.serviceJoinQueue = ()=> {
			let nextJoinRound = [];
			this.joinQueue.forEach((player, i)=>{
				let playerName = player.attributes.username;
				let NumberOfEmpty = this.emptySeats.length;
				if (NumberOfEmpty===0) {
					player.update(status.tableFull(table));
					nextJoinRound.push(player);
				} else if (player.attributes.tableCash < 100) {
					player.update(status.NotEnoughTableCash(playerName));
					nextJoinRound.push(player);
				} else {
					accounts.joinTable(player, lobby.users, this);
					delete this.joinQueueHash[playerName];
				}
			});
			this.joinQueue = nextJoinRound;
		};
		this.leaveQueueJoin = (player)=> {
			let playerName = player.attributes.username;
			if (!(playerName in this.leaveQueueHash)) {
				this.leaveQueueHash[playerName]=player;
				this.leaveQueue.push(player);
				player.update(status.willLeaveTable(playerName))
			}	
		};
		this.serviceLeaveQueue = ()=> {
			this.leaveQueue.forEach((player)=>accounts.leaveTable(player, this, lobby.users));
			this.leaveQueue = [];
		};
		this.disconnectQueueJoin = (player)=> {
			let playerName = player.attributes.username;
			db.SetUpdate(qry.updateUser, player, 
				{ sessionId: null, 
				loggedIn: false }, 
			()=>player.ws && delete player.ws)  
			//sessionId must be 1st Param to render websockets send condition false
			// .then(db.CheckConditional('dcRemain', player, (limit, dcRemain)=>dcRemain>limit, 0))
			.then(()=>db.ReturnValue('dcRemain', player))
			.then((dcRemain)=>{
				if (!(playerName in this.disconnectQueueHash)) {
					this.disconnectQueueHash[playerName]=player;
					this.disconnectQueue.push(player);
					console.log('DCREMAIN = ', dcRemain);
					if (dcRemain>0) {
						player.update(status.disconnected(playerName))
						player.update({dcRound: 2});
						return db.SetUpdate(qry.updateUser, player, 
							{dcRemain: player.attributes.dcRemain-1})
					}	else {  // no remaining disconnects
						console.log('NO REMAINING DISCONNECTS // SET PLAYER UNRESPONSIVE HERE');
						player.update(status.willLeaveTable(playerName))
						player.update({dcRound: 0});
					}
				}
			});
		};
		this.serviceDisconnectQueue = ()=>{ 
			let nextDisconnectRound = [];
			this.disconnectQueue.forEach((player)=>{
				if (player.attributes.dcRound === 0) {
					accounts.disconnect(player, this);
				} else {
					player.update({dcRound: player.attributes.dcRound-1});
					nextDisconnectRound.push(player);
				}
			});
			this.disconnectQueue = nextDisconnectRound;
		};
		// Transition types
		this.checkEnoughTableCash = ()=> {
			this.each((player)=>{
				if (player.attributes.type) { // filter out state
					if (player.attributes.tableCash < state.bigBlindAmount) {
						this.leaveQueueJoin(player);
						player.update(status.NotEnoughTableCash(player.attributes.username));
					}
				}
			})
		};
		this.resetHand = ()=> {
			state.smallBlindSeat = null;
			state.bigBlindSeat = null;
			state.playersInHand = 0;
	    state.betPlaced = false;
	    state.checkedBet = 0;
	    state.calledBet = 0;
	    state.allInBet = 0;
	    this.setState({pots: [{
	      value: 0,
	      callAmount: 0,
	      sidePot: false,
	      nextPotIndex: null,
	      winners: null,
	      playersInPot: {},
    	}] });
    	this.setState({potsBeginRound: [{
    		value: 0,
    	}] });
    	this.updateAll({playerAction: {} });
    	this.updateAll({leftToCall: 0});
    	this.updateAll({callAmountThisRound: 0 });
    	this.updateAll({holeCards: [] });
    	this.updateAll({update: '' });
    	this.updateAll({winningCards: [false,false,false,false,false,false,false] });
    	this.setState({communityCards: [] });
    	this.setState({playersInHand: this.takenSeats().length });
			this.setState({round: 1 });
			for (var i = 1; i <=10; i++) {
				if (this.seat[i]) {
					let playerToReset = this.seat[i];
					playerToReset.attributes.topFiveCards = null;
					playerToReset.attributes.topFiveCardsStrings = null;
					playerToReset.attributes.topFiveIndexes = null;
					playerToReset.attributes.topFiveCardsType = null;
					playerToReset.attributes.leftToCall = 0;
			    playerToReset.attributes.post = 0;
			    playerToReset.attributes.check = false;
			    playerToReset.attributes.call = 0;
			    playerToReset.attributes.bet = 0;
			    playerToReset.attributes.raise = 0;
			    playerToReset.attributes.fold = false;
			    playerToReset.attributes.allIn = 0;
			    playerToReset.attributes.addToPot = 0;
			    playerToReset.attributes.show = false;
			    playerToReset.attributes.muck = false;
				}
			}

		};
		this.serviceAnnounceStartHand = ()=> {
			this.setState({update: 'NEXT HAND WILL START MOMENTARILY' });
		};
		this.pickDealer = ()=> {
			if (!state.dealer) {
				this.setState({dealer: Math.min.apply(null, this.takenSeats()) });
			} else {
				this.setState({dealer: this.findNextSeat(state.dealer) });
			}
			this.setState({ update: `Dealer: Player ${state.dealer}: ${this.seat[state.dealer].attributes.username}` });
		};
		this.announceRound = ()=> {
			this.setState({update: 'ROUND = '+settings.state.roundNames[state.round] });
		};
		this.placeSmallBlind = ()=> {
			this.setState({smallBlindSeat: this.findNextSeat(state.dealer) });
			let smallBlindPlayer = this.seat[state.smallBlindSeat];
			smallBlindPlayer.handleSet( {post: state.smallBlindAmount} );
		};
		this.placeBigBlind = ()=> {
			this.setState({bigBlindSeat: this.findNextSeat(state.smallBlindSeat) });
			let bigBlindPlayer = this.seat[state.bigBlindSeat];
			bigBlindPlayer.handleSet( {post: state.bigBlindAmount} );
			state.turn = state.bigBlindSeat;
		};
		this.dealCards = ()=> {
			this.setState({deck: util.shuffledDeck(util.orderedDeck()) });
			for (var i = 1; i <=10; i++) {
				if (this.seat[i]) {
					let playerReceivingCards = this.seat[i];
					playerReceivingCards.attributes.holeCards = [ state.deck.pop(), state.deck.pop() ];
					playerReceivingCards.sendUpdate({seat: {[i]: {holeCards: state.seat[i].holeCards }}});
					this.sendBlankOtherPlayerHoleCards(playerReceivingCards);
				}
			}
			lobby.users.each((user)=>this.sendBlankOtherPlayerHoleCards(user));
		};
		this.sendBlankOtherPlayerHoleCards = (playerReceivingCards)=> {
			this.each((otherPlayer)=> { 
				if (otherPlayer.attributes.type && otherPlayer.attributes.seat !== playerReceivingCards.attributes.seat) {
					playerReceivingCards.sendUpdate({ seat: {[otherPlayer.attributes.seat]: {holeCards: ['reverse','reverse']}}});
				}
			});
		}
		this.startTurn = ()=> {
			let player = this.seat[state.turn];
			this.updatePotsValueState();
			this.calculateLeftToCall(player);
			this.addTurnFilter(player);
			if (player.attributes.sessionId==='ROBOT') {
				state.waitForTurn = this.turnDuration(state.turnCounter, state.turnTimerRobot);
			} else {
				state.waitForTurn = this.turnDuration(state.turnCounter, state.turnTimer);
			}
		};
		this.pause = ()=> {
			clearTimeout(state.waitForTurn);
		}
		this.unpause = ()=> {
			this.startTurn();
		}
		this.turnDuration = (turnCounter, timer)=> {
			return setTimeout(()=>{
				let player = this.seat[state.turn];
				if (state.betPlaced) {
					if (player.attributes.sessionId==='ROBOT') {
						player.handleSet(botLogic.playTurn(player, state));
					} else {
						player.handleSet({fold: true });
					}
				} else {
					if (player.attributes.sessionId==='ROBOT') {
						player.handleSet(botLogic.playTurn(player, state));
					} else {
						player.handleSet({check: true });
					}
				}
				if (turnCounter===state.turnCounter) { // if input not received at all
					player.handleSet({fold: true});
				}
			}, timer);
		};
		this.changeTurnNow = ()=> {
			state.turnCounter++;
			let player = this.seat[state.turn];
			this.removeTurnFilter(player);
			clearTimeout(state.waitForTurn);
			this.checkRoundConditions();
		};
		this.checkRoundConditions = ()=> {
			// console.log('altogether:', Math.max(state.checkedBet+state.allInBet, state.calledBet+state.allInBet), 'checkedBet:', state.checkedBet, 'calledBet:', state.calledBet, 'allInBet:', state.allInBet, 'playersInHand:', state.playersInHand);
			if (state.round ===  5 || state.playersInHand === 1) {
				this.waitBeforeDeclareWinners();
			} else if ((state.checkedBet+state.allInBet) === state.playersInHand || (state.calledBet + state.allInBet) === state.playersInHand) {
				this.waitAfterLastPlayOfRound();
			} else { // player takes a turn
				if (state.round===1) {
					this.setState({filterForTurn: state.betPlaced ? state.filters.preFlopPostRaise : state.filters.preFlopNoRaise });
				} else {
					this.setState({filterForTurn: state.betPlaced ? state.filters.flopPostBet : state.filters.flopNoBet });
				}
				this.changeTurnSeat();
				this.startTurn();
			}
		};
		this.waitBeforeDeclareWinners = ()=> {
			state.waitBeforeDeclareWinners = this.waitBeforeDeclareWinnersDuration();
		};
		this.waitBeforeDeclareWinnersDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(state.waitBeforeDeclareWinners);
				this.declareWinners();
			}, state.waitBeforeDeclareWinnersTimer);
		};
		this.waitAfterLastPlayOfRound = ()=> {
			state.waitAfterLastPlayOfRound = this.waitAfterLastPlayOfRoundDuration();
		};
		this.waitAfterLastPlayOfRoundDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(state.waitAfterLastPlayOfRound);
				this.waitBetweenRounds();
			}, state.waitAfterLastPlayOfRoundTimer);
		};
		this.waitBetweenRounds = ()=> {
			setTimeout(()=>{
				clearInterval(state.announcementSetInterval);
				state.waitBetweenRoundsTimer = 4000;
			}, state.announcementClearIntervalDuration);
			state.announcementSetInterval = setInterval(()=>{
				this.setState({update: `Next Round: ${state.roundNames[state.round+1]} in ${(state.waitBetweenRoundsTimer-1000)/1000} seconds` })
				// console.log('timer =', state.waitBetweenRoundsTimer);	
				state.waitBetweenRoundsTimer = state.waitBetweenRoundsTimer-1000;
			}, state.announcementSetIntervalTimer);
			state.waitBetweenRounds = this.waitBetweenRoundsDuration();
		};
		this.waitBetweenRoundsDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(state.waitBetweenRounds);
				this.advanceRound();
			}, state.waitBetweenRoundsTimer);
		};
		this.advanceRound = ()=> {
			this.setState({round: state.round+1 });
			this.announceRound();
			if (state.round===2) { 
				this.setState({communityCards: 
					state.communityCards.concat([state.deck.pop()])
					.concat([state.deck.pop()])
					.concat([state.deck.pop()])
				});
				console.log('COMMUNITY CARDS = ', state.communityCards);
			} else if (state.round === 3) {
				this.setState({communityCards: state.communityCards.concat([state.deck.pop()]) });
				console.log('TURN CARD = ', state.communityCards[3]);						
			} else if (state.round === 4) {
				this.setState({communityCards: state.communityCards.concat([state.deck.pop()]) });
				console.log('RIVER CARD = ', state.communityCards[4]);						
			} 
			this.setState({turn: state.dealer});
			this.setState({betPlaced: false});
			this.setState({calledBet: 0 });
			this.setState({checkedBet: 0 });
			this.setState({potsBeginRound: util.copy(state.pots) });
			this.setState({beginRoundPotsCallValue: state.beginRoundPotsCallValue + state.roundOnlyPotsCallValue });
			this.updateAll({leftToCall: 0});
			this.each((player)=>{
				if (player.attributes.type) { // filter out state
					if (!('fold' in player.attributes.playerAction) && !('allIn' in player.attributes.playerAction)) {
						player.update({playerAction: {} });
						player.update({callAmountThisRound: 0 });
					}
				}
			});
			state.turnCounter = 0;
			this.checkRoundConditions();
		};
		this.declareWinners = ()=> {
			// state.pots.forEach((pot)=>{
			let declareWinnersThisPot = (pot, i)=> {
				return setTimeout(()=>{
					this.eliminateNonPotWinners(pot);
					let notFoldedCount = 0;
					Object.keys(pot.playersInPot).forEach((playerSeat)=>{
						let player = this.seat[playerSeat];
						if (!('fold' in player.attributes.playerAction)) {  // need to include muck & no show options
							notFoldedCount++;
							player.update({show: true}); 
						}
					});
					let winnerAnnounce = '';
					for (let winnerSeat in pot.winners) {
						let player = this.seat[winnerSeat];
						if (notFoldedCount > 1) {  // if everyone but winner folds, no winningCardsIndex is created
							let winningCards = [false,false,false,false,false,false,false];
							player.attributes.topFiveCardIndexes.forEach((cardIndex)=>{
									winningCards[cardIndex]=true;
							});
							player.update({winningCards: winningCards });
							winnerAnnounce = `Player ${winnerSeat}: ${player.attributes.username} wins`+
								` pot $${pot.value} with ${player.attributes.topFiveCardsStrings.join(' ')} `.concat(winnerAnnounce);
						} else {
							winnerAnnounce = `Player ${winnerSeat}: ${player.attributes.username} wins`+
								` pot $${pot.value}`;
						}
						let potWonCash = pot.value / ((Object.keys(pot.winners).length) || 1)
						potWonCash = (Math.round(potWonCash*100))/100;
						player.update({tableCash: player.attributes.tableCash + potWonCash });
					}
					console.log(winnerAnnounce+'\n');
					this.setState({update: winnerAnnounce });
					clearTimeout(state.waitBetweenWinners);
					i++;
					if (state.pots[i]) {
						state.waitBetweenWinners = setTimeout(()=>{declareWinnersThisPot(state.pots[i], i)}, state.waitBetweenWinnersTimer);
					} else {
						state.waitBetweenHands = this.waitBetweenHandsDuration();
					}
				}, state.waitBetweenWinnersTimer);
			};
			let i=0;
			state.waitBetweenWinners = declareWinnersThisPot(state.pots[i], i);
			// });
		};
		// this.waitBetweenWinnersDuration = ()=> {
		// 	return setTimeout(()=>{
		// 		clearTimeout(state.waitBetweenWinners);
		// 		state.waitBetweenHands = this.waitBetweenHandsDuration();
		// 	}, state.waitBetweenWinnersTimer);
		// };
		this.waitBetweenHandsDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitBetweenHands);
				this.pollForStartTimer = this.pollForStart();
			}, state.waitBetweenHandsTimer);
		};
		this.eliminateNonPotWinners = (pot)=> {
			let cardIndex = 0;
			let possibleWinners = util.copy(pot.playersInPot)
			for (let playerSeat in possibleWinners) {
				let playerAction = state.seat[playerSeat].playerAction;
				if ('fold' in playerAction) {
					delete possibleWinners[playerSeat];
				}
			}
			let highSoFar = {type: 0, winners: possibleWinners, ranks: null};
			while ( (cardIndex < 5) && (Object.keys(highSoFar.winners).length > 1) ) {
				let i = cardIndex;
				// console.log('I = ', cardIndex);
				for (let potSeat in highSoFar.winners) {
					let player = this.seat[potSeat];
					if (!(highSoFar.winners[potSeat].handChecked)) {
						highSoFar.winners[potSeat].handChecked = true;
						let checkedHand = handChecker.checkHand(player.attributes.holeCards, state.communityCards, 7);
						player.update({topFiveCardIndexes: checkedHand.indexes });
						// console.log('player', potSeat, 'hand checked = ', checkedHand);
						let rankedHand = checkedHand.indexes.map((index)=>{
							if (index===0 || index===1) {
								return util.integerCardValue(player.attributes.holeCards[index]);
							} else {
								return util.integerCardValue(state.communityCards[index-2]);
							}
						});
						let stringedHand = checkedHand.indexes.map((index)=>{
							if (index===0 || index===1) {
								return player.attributes.holeCards[index];
							} else {
								return state.communityCards[index-2];
							}
						});
						player.update({ topFiveCards: rankedHand, topFiveCardsStrings: stringedHand, topFiveCardsType: checkedHand.type });
					}
					if (player.attributes.topFiveCardsType > highSoFar.type) { // type supercedes so check type first
						highSoFar.type = player.attributes.topFiveCardsType;
						highSoFar.ranks = player.attributes.topFiveCards;
						console.log('highsoFar = player', player.attributes.username)
						for (let playerSeat in highSoFar.winners) {
							if (highSoFar.winners[playerSeat].handChecked) {
								if (playerSeat!==potSeat) {
									delete highSoFar.winners[playerSeat];
								}
							}
						}
					} else if (player.attributes.topFiveCardsType === highSoFar.type) {
						let rankedCard = player.attributes.topFiveCards[i][0];
						if (rankedCard > highSoFar.ranks[i][0]) {  // player has a higher card than current possible winner
							console.log('after comparing cards individuallly, highsoFar = player', player.attributes.username)
							for (let playerSeat in highSoFar.winners) {
								if (highSoFar.winners[playerSeat].handChecked) {
									if (playerSeat!==potSeat) {
										delete highSoFar.winners[playerSeat];
									}
								}
							}
							highSoFar.ranks = player.attributes.topFiveCards;
						} else if (rankedCard < highSoFar.ranks[i][0]) {
							delete highSoFar.winners[potSeat];
						}
					} else if (player.attributes.topFiveCardsType < highSoFar.type) {
						delete highSoFar.winners[potSeat];
					}
				};
				cardIndex++;
			}
			pot.winners = highSoFar.winners;
		};
		this.addPlayerInPot = (player, pot, putIn)=> {
			pot.playersInPot[player.attributes.seat] = { playerName: player.attributes.username, putIn: putIn || 0 };
		};
		this.callPot = 	 (player, remainingBetValue, pot, potsArray)=> {
			// console.log('remainingbetValue = ', remainingBetValue)
			// console.log('entering pot =', pot)
			let playerSeat = player.attributes.seat;
			if ( !(playerSeat in pot.playersInPot) ) {
				this.addPlayerInPot(player, pot);
			}
			let potSeat = pot.playersInPot[playerSeat];
			let potShortFall = pot.callAmount - potSeat.putIn;
			if (potShortFall > 0) {
				// raise
				if (remainingBetValue > potShortFall) {
					if (pot.nextPotIndex!==null) {  // other pots to call
						pot.value += potShortFall;  // call this pot
						potSeat.putIn += potShortFall;
						remainingBetValue -= potShortFall;
						let nextPot = potsArray[pot.nextPotIndex];
						this.callPot(player, remainingBetValue, nextPot, potsArray);
					} else if (pot.nextPotIndex===null) {   // no other pots to call, raise
						pot.value += remainingBetValue;
						potSeat.putIn += remainingBetValue;
						let callAmountIncrease = remainingBetValue - potShortFall;
						pot.callAmount += callAmountIncrease;
						remainingBetValue = 0;
						// return;
					}

				// call
				} else if (remainingBetValue === potShortFall) {
					pot.value += remainingBetValue;
					potSeat.putIn += remainingBetValue;
					remainingBetValue = 0;
					// return;

				// split pot
				} else if (remainingBetValue < potShortFall) {
					// split to sidepot
					pot.value += remainingBetValue;
					potSeat.putIn += remainingBetValue;
					pot.callAmount = potSeat.putIn;
					let newPot = {  											// make new pot
						value: 0,
						callAmount: 0,
						sidePot: true,
						nextPotIndex: pot.nextPotIndex || null,
						playersInPot: {},
						time: null,
						communityCards: this.communityCards,
					};
					let highestExcessBet = 0;
					for (let seatNumber in pot.playersInPot) {
						let seat = pot.playersInPot[seatNumber];
						if (seat.putIn > pot.callAmount) {
							let excessBet = seat.putIn - pot.callAmount;
							pot.value -= excessBet;
							seat.putIn -= excessBet;
							let excessBetPlayer = this.seat[seatNumber];
							this.addPlayerInPot(excessBetPlayer, newPot, excessBet);
							newPot.value += excessBet;
							if (excessBet > highestExcessBet) {
								highestExcessBet = excessBet;
							}
						}
					}
					newPot.callAmount = highestExcessBet;
					potsArray.push(newPot);
					pot.nextPotIndex = potsArray.length-1;
				}
			} else {
				if (pot.nextPotIndex!==null) {  // other pots to call
				let nextPot = potsArray[pot.nextPotIndex];
				this.callPot(player, remainingBetValue, nextPot, potsArray);
				} else {
					// all pots called, raise
					pot.value += remainingBetValue;
					potSeat.putIn += remainingBetValue;
					let callAmountIncrease = remainingBetValue - potShortFall;
					pot.callAmount += callAmountIncrease;
					remainingBetValue = 0;
				}
			}
			// console.log('POTS = ')
			// potsArray.forEach((pot)=> console.log(pot));
		};
		this.updatePotsValueState = ()=>{
			let currentTotalPotsCallValue = 0;
			let potsTotalValue = 0;
			state.pots.forEach((pot)=>{
				potsTotalValue += pot.value;
				currentTotalPotsCallValue += pot.callAmount;
			});
			this.setState({potsTotalValue: potsTotalValue });
			this.setState({roundOnlyPotsCallValue: currentTotalPotsCallValue - state.beginRoundPotsCallValue });
		};
		this.calculateLeftToCall = (player)=> {
			let totalLeftToCall = 0;
			state.pots.forEach((pot)=>{
				let leftToCallInPot = 0;
				if (player.attributes.seat in pot.playersInPot) {
					leftToCallInPot = pot.callAmount - pot.playersInPot[player.attributes.seat].putIn;
				} else {
					leftToCallInPot = pot.callAmount;
				}
				totalLeftToCall += leftToCallInPot;
			});
			player.update({leftToCall: totalLeftToCall });
		};
	},
});

const table1 = Object.assign(new Table(), settings.table1);
table1.pollForStartTimer = table1.pollForStart();
module.exports = {
	table1: table1,
}
