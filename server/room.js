'use strict'
const Backbone = require('backbone');
const settings = require('./templates/settings.js');
const status = require('./templates/statuscode');
const log = require('./templates/log.js');
const consoleUserUpdate = log.consoleUserUpdate();
const whoIsInRoom = log.whoIsInRoom();
const lobby = require('./lobby');
const bots = require('./bots/bots')
const db = require('./db/db');
const qry = require('./db/qry');
const accounts = require('./accounts');
const util = require('./db/util');

db.initDb(bots.lobbyBots, bots.getCashBots, bots.getTableCashBots, bots.tableBots, 
					bots.lobbyConfigs, bots.getCashConfigs, bots.getTableCashConfigs, bots.tableConfigs)

// const AddState = Backbone.Model.extend({ defaults: settings.state });
// const t1State = this.add(new AddState());
// const t1 = t1State.attributes;
// t1.setState = ()=>t1State.set;

var Table = Backbone.Collection.extend({
	initialize: function () { 
		const State = Backbone.Model.extend({ defaults: settings.state });
		const table1State = this.add(new State());
		const state = table1State.attributes;
		this.setState =  (update)=>{ for (let key in update) { table1State.set({[key]: update[key]}); }};		
		this.on({
			"change:clientReady":     	(user)=> this.updatePlayerOfSeatStates(user),		//user.outFilter.forEach((attr)=>user.sendUpdate({[attr]: user.attributes[attr]})),
			"change:message":    (sender, msg)=> this.each((user)=> user.attributes.type && user.update({chats:`(${sender.attributes.username}) ${msg}`})),
			// "change:tableCash":(sender, value)=> this.updateOfPlayer(sender, value, 'tableCash'),
			"change:addToPot": (sender, value)=> this.callPot(sender, value, this.pots[0]),
			"change:post":     (sender, value)=> this.updateOfPlayer(sender, value, 'post'),
			"change:check":    (sender, value)=> this.updateOfPlayer(sender, value, 'check'),
			"change:bet": 	   (sender, value)=> this.updateOfPlayer(sender, value, 'bet'),
			"change:fold":    	      (sender)=> this.fold(sender),
			"change:callBet":         (sender)=> this.call(sender),
			"change:leaveTable":      (sender)=> this.leaveQueueJoin(sender),
			"change:disconnect":        (user)=> this.disconnectQueueJoin(user),
			"add": 		   (user, attributesArr)=> { this.loadPlayerToState(user); whoIsInRoom(this, user, 'ADD to'); }, 
			"remove":    (user, attributesArr)=> { this.unloadPlayerFromState(user); whoIsInRoom(this, user, 'REMOVE from'); },  // just logging

			"change:dealer":    			(state, value)=> this.sendUpdateAll({dealer: value}),
			"change:smallBlindSeat":  (state, value)=> this.sendUpdateAll({smallBlindSeat: value}),
			"change:bigBlindSeat":    (state, value)=> this.sendUpdateAll({bigBlindSeat: value}),
			"change:round":     			(state, value)=> this.sendUpdateAll({round: value}),
			"change:turn":      			(state, value)=> this.sendUpdateAll({turn: value}),
			"change:communityCards":  (state, value)=> this.sendUpdateAll({communityCards: value}),
		});														

		this.swapInFilter =           (player, filter)=>  player.inFilter = Object.keys(filter);
		this.addToInFilter =          (player, filter)=>	player.inFilter = util.extendToArray(player.inFilter, filter);
		this.removeFromInFilter =     (player, filter)=>  player.inFilter = util.unExtendFromArray(player.inFilter, filter);

		this.loadPlayerToState =     					(player)=>  state.seat[player.attributes.seat] = player.attributes;
		this.unloadPlayerFromState = 					(player)=>  state.seat[player.attributes.seat] = null;  //untested

		this.updatePlayerOfSeatStates =       (player)=>  Object.values(state.seat).forEach((playerState, i)=> {
				if (playerState) {
					for (let key in playerState) {
						(key in state.filters.otherPlayerOut) && player.sendUpdate({ seat: {[i+1]: {[key]: state.seat[i+1][key] }}});
					}
				}
		});
		this.sendUpdateAll =             (tableUpdate)=>  this.each((user)=> user.attributes.type && user.sendUpdate(tableUpdate));
		this.updateOfPlayer =    (player, value, attr)=>  this.each((user)=> user.attributes.type && user.update({ ["_"+player.attributes.seat+"_"+attr]: value}));
		this.takenSeats = 		                  ()=>  Object.entries(this.seat).filter((tuple)=>tuple[1]).map((tuple)=>tuple[0]);
		this.changeTurnSeat =                   ()=>  this.setState({turn: this.findNextSeat(state.turn)});
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
		}
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
						this.serviceAnnounceStartHand,
						this.pickDealer,
						this.placeAntes,
						this.dealCards,
						this.startTurn
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
						this.swapInFilter(player, this.filters.in.default);
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
				if (player.attributes.tableCash < state.bigBlindAmount) {
					this.leaveQueueJoin(player);
					player.update(status.NotEnoughTableCash(player.attributes.username));
				}
			})
		};
		this.serviceAnnounceStartHand = ()=> {
			console.log('NEXT HAND WILL START MOMENTARILY');
		};
		this.pickDealer = ()=> {
			this.setState({ dealer: Math.min.apply(null, this.takenSeats()) });
			console.log('dealer = ', this.seat[state.dealer].attributes.username,' seat ', state.dealer)
		};
		this.placeAntes = ()=> {
			this.setState({smallBlindSeat: this.findNextSeat(state.dealer) });
			let smallBlindPlayer = this.seat[state.smallBlindSeat];
			// smallBlindPlayer.handleSet( {post: this.smallBlindAmount} );
			this.setState({bigBlindSeat: this.findNextSeat(state.smallBlindSeat) });
			let bigBlindPlayer = this.seat[state.bigBlindSeat];
			// bigBlindPlayer.handleSet( {post: this.bigBlindAmount} );
			this.setState({calledBet: 1 });
			this.setState({playersInHand: this.takenSeats().length });
			this.setState({round: 1 });
			this.setState({turn: this.findNextSeat(state.bigBlindSeat) });
			console.log('ROUND = ', state.roundNames[state.round]);
			console.log('PLACING ANTEs');
		};
		this.dealCards = ()=> {
			this.setState({deck: util.shuffledDeck(util.orderedDeck()) });
			for (var i = 1; i <=10; i++) {
				if (this.seat[i]) {
					let playerReceivingCards = this.seat[i];
					playerReceivingCards.update({holeCards: [ state.deck.pop(), state.deck.pop() ] });
					this.each((otherPlayer)=> { 
						if (otherPlayer.attributes.username !== playerReceivingCards.attributes.username) {
							playerReceivingCards.sendUpdate({ ["seat"+otherPlayer.attributes.seat]: {holeCards: 'reverse'} });
						}
					});
				}
			}
		};
		this.checkRoundConditions = ()=> {
			if (state.round === 5 || state.playersInHand === 1) {
				this.declareWinner();
			} else if (state.checkedBet === state.playersInHand || state.calledBet === state.playersInHand) {
				this.advanceRound();
			} else {
				this.changeTurnSeat();
				this.startTurn();
			}
		};
		this.advanceRound = ()=> {
			this.setState({round: state.round+1 });
			console.log('ROUND = ', settings.rounds[state.round]);
			if (state.round===2) { // Nothing to do on Round 1?
				this.setState({communityCards: state.communityCards.push(state.deck.pop()) });
				this.setState({communityCards: state.communityCards.push(state.deck.pop()) });
				this.setState({communityCards: state.communityCards.push(state.deck.pop()) });
				console.log('COMMUNITY CARDS = ', state.communityCards);
			} else if (state.round === 3) {
				this.setState({communityCards: state.communityCards.push(state.deck.pop()) });
				console.log('TURN CARD = ', state.communityCards[3]);						
			} else if (state.round === 4) {
				this.setState({communityCards: state.communityCards.push(state.deck.pop()) });
				console.log('RIVER CARD = ', state.communityCards[4]);						
			} 
			this.setState({turn: state.smallBlindSeat});
			this.setState({calledBet: 0 });
			this.setState({checkedBet: 0 });
			this.checkRoundConditions();
		};
		this.declareWinner = ()=> {
			this.winner = this.turn;
			console.log('PLAYER '+this.winner+' wins!!');
			state.waitBetweenHands = this.waitBetweenHandsDuration();
		};
		this.waitBetweenHandsDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitBetweenHands);
				this.pollForStartTimer = this.pollForStart();
			}, state.waitBetweenHandsTimer);
		};
		this.startTurn = ()=> {
			let player = this.seat[state.turn];
			console.log('Player', state.turn, 'turn');
			this.addToInFilter(player, state.filters.onTurn)   //player && ?
			// player.handleSet( {post: this.bigBlindAmount} );
			state.waitForTurn = this.turnDuration();
		};
		this.turnDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(state.waitForTurn);
				let finishingTurnPlayer = this.seat[state.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.removeFromInFilter(finishingTurnPlayer, state.filters.onTurn);
				this.changeTurnSeat();
				this.startTurn1();
			}, state.turnTimer);
		};
		this.startTurn1 = ()=> {
			let player = this.seat[state.turn];
			console.log('Player', state.turn, 'turn');
			this.addToInFilter(player, state.filters.onTurn)   //player && ?
			player.handleSet( {post: 10} );
			state.waitForTurn = this.turnDuration1();
		};
		this.turnDuration1 = ()=> {
			return setTimeout(()=>{
				clearTimeout(state.waitForTurn);
				let finishingTurnPlayer = this.seat[state.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.removeFromInFilter(finishingTurnPlayer, state.filters.onTurn);
				this.changeTurnSeat();
				this.startTurn2();
			}, state.turnTimer);
		};
		this.startTurn2 = ()=> {
			let player = this.seat[state.turn];
			console.log('Player', state.turn, 'turn');
			this.addToInFilter(player, state.filters.onTurn)   //player && ?
			player.handleSet( {post: 100} );
			state.waitForTurn = this.turnDuration2();
		};
		this.turnDuration2 = ()=> {
			return setTimeout(()=>{
				clearTimeout(state.waitForTurn);
				let finishingTurnPlayer = this.seat[state.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.removeFromInFilter(finishingTurnPlayer, state.filters.onTurn);
				this.changeTurnSeat();
				this.startTurn3();
			}, state.turnTimer);
		};
		this.startTurn3 = ()=> {
			let player = this.seat[state.turn];
			console.log('Player', state.turn, 'turn');
			this.addToInFilter(player, state.filters.onTurn)   //player && ?
			player.handleSet( {post: 20} );
			state.waitForTurn = this.turnDuration3();
		};
		this.turnDuration3 = ()=> {
			return setTimeout(()=>{
				clearTimeout(state.waitForTurn);
				let finishingTurnPlayer = this.seat[state.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.removeFromInFilter(finishingTurnPlayer, state.filters.onTurn);
				this.changeTurnSeat();
				this.startTurn4();
			}, state.turnTimer);
		};
		this.startTurn4 = ()=> {
			let player = this.seat[state.turn];
			console.log('Player', state.turn, 'turn');
			this.addToInFilter(player, state.filters.onTurn)   //player && ?
			player.handleSet( {post: 15} );
			state.waitForTurn = this.turnDuration4();
		};
		this.turnDuration4 = ()=> {
			return setTimeout(()=>{
				clearTimeout(state.waitForTurn);
				let finishingTurnPlayer = this.seat[state.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.removeFromInFilter(finishingTurnPlayer, state.filters.onTurn);
				this.changeTurnSeat();
				this.startTurn5();
			}, state.turnTimer);
		};
		this.startTurn5 = ()=> {
			let player = this.seat[state.turn];
			console.log('Player', state.turn, 'turn');
			this.addToInFilter(player, state.filters.onTurn)   //player && ?
			player.handleSet( {post: 250} );
			state.waitForTurn = this.turnDuration5();
		};
		this.turnDuration5 = ()=> {
			return setTimeout(()=>{
				clearTimeout(state.waitForTurn);
				let finishingTurnPlayer = this.seat[state.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.removeFromInFilter(finishingTurnPlayer, state.filters.onTurn);
				this.checkRoundConditions();
			}, state.turnTimer);
		};		



		this.changeTurnNow = ()=> {
			clearTimeout(state.waitForTurn);
			let finishingTurnPlayer = this.seat[state.turn];
			this.removeFromInFilter(finishingTurnPlayer, state.filters.onTurn);
			this.checkRoundConditions();
		};
		this.fold = (player)=> {
			this.playersInHand = this.playersInHand-1;
			this.changeTurnNow();
		};
		this.call = (player)=> {
			this.calledBet++;
		};
		this.addPlayerInPot = (player, pot, putIn)=> {
			pot.playersInPot[player.attributes.seat] = 
					{ playerName: player.attributes.username,
					holeCards: player.attributes.holeCards,
					topFiveCards: null,
					putIn: putIn || 0,
					winner: false, };
		};
		this.callPot = 	 (player, remainingBetValue, pot)=> {
			console.log('remainingbetValue = ', remainingBetValue)
			console.log('entering pot =', pot)
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
						let nextPot = this.pots[pot.nextPotIndex];
						this.callPot(player, remainingBetValue, nextPot);
					} else if (pot.nextPotIndex===null) {   // no other pots to call, raise
						pot.value += remainingBetValue;
						potSeat.putIn += remainingBetValue;
						pot.callAmount += remainingBetValue - potShortFall;
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
					this.pots.push(newPot);
					pot.nextPotIndex = this.pots.length-1;
				}
			} else {
				if (pot.nextPotIndex!==null) {  // other pots to call
				let nextPot = this.pots[pot.nextPotIndex];
				this.callPot(player, remainingBetValue, nextPot);
				} else {
					// all pots called, raise
					pot.value += remainingBetValue;
					potSeat.putIn += remainingBetValue;
					pot.callAmount += remainingBetValue - potShortFall;
					remainingBetValue = 0;
				}
			}
			console.log('POTS = ')
			this.pots.forEach((pot)=> console.log(pot));
		}
	},
});

const table1 = Object.assign(new Table(), settings.table1);
// const State = Backbone.Model.extend({ defaults: settings.state });
// const tableState = table1.add(new State());
// const state = tableState.attributes;
// table1.state = state;


table1.pollForStartTimer = table1.pollForStart();
module.exports = {
	table1: table1,
}
