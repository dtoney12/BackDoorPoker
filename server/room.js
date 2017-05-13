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

var Table = Backbone.Collection.extend({
	model: lobby.User,
	initialize: function () { 
		this.on({
			"change:message":    (sender, msg)=> this.each((user)=> user.update({chats:`(${sender.attributes.username}) ${msg}`})),
			// "change:tableCash":(sender, value)=> this.updateAll(sender, value, 'tableCash'),
			"change:addToPot": (sender, value)=> this.callPot(sender, value, this.pots[0]),
			"change:post":     (sender, value)=> this.updateAll(sender, value, 'post'),
			"change:check":    (sender, value)=> this.updateAll(sender, value, 'check'),
			"change:bet": 	   (sender, value)=> this.updateAll(sender, value, 'bet'),
			"change:fold":    	      (sender)=> this.fold(sender),
			"change:callBet":         (sender)=> this.call(sender),
			"change:leaveTable":      (sender)=> this.leaveQueueJoin(sender),
			"change:disconnect":        (user)=> this.disconnectQueueJoin(user),
			"add": 		   (user, attributesArr)=> { whoIsInRoom(this, user, 'ADD to');
				user.outFilter.forEach((key)=> user.sendUpdate({[key]: user.attributes[key]}));
			},
			"remove":    (user, attributesArr)=> whoIsInRoom(this, user, 'REMOVE from'),  // just logging
		});
		this.swapInFilter =   (player, filter)=> player.inFilter = Object.keys(filter);
		// this.broadcast =         (tableUpdate)=> this.each((user)=> user.update(tableUpdate));
		this.updateAll = (sender, value, attr)=> this.each((user)=> user.update({ ["seat"+sender.attributes.seat]: {[attr]: value} }));
		this.takenSeats = 		              ()=> Object.entries(this.seat).filter((tuple)=>tuple[1]).map((tuple)=>tuple[0]);
		this.changeTurnSeat =               ()=> { 
			this.turn = this.findNextSeat(this.turn);
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
		}
		this.leaveQueueJoin = (player)=> {
			if (!(player in this.leaveQueueHash)) {
				this.leaveQueueHash[player.attributes.username]=player;
				this.leaveQueue.push(player);
				player.update(status.willLeaveTable(player.attributes.username))
			}	
		};
		this.disconnectQueueJoin = (player)=> {
			db.SetUpdate(qry.updateUser, player, 
				{ sessionId: null, 
				loggedIn: false }, 
			()=>player.ws && delete player.ws)  
			//sessionId must be 1st Param to render websockets send condition false
			// .then(db.CheckConditional('dcRemain', player, (limit, dcRemain)=>dcRemain>limit, 0))
			.then(()=>db.ReturnValue('dcRemain', player))
			.then((dcRemain)=>{
				if (!(player in this.disconnectQueueHash)) {
					this.disconnectQueueHash[player.attributes.username]=player;
					this.disconnectQueue.push(player);
					console.log('DCREMAIN = ', dcRemain);
					if (dcRemain>0) {
						player.update(status.disconnected(player.attributes.username))
						player.update({dcRound: 2});
						return db.SetUpdate(qry.updateUser, player, 
							{dcRemain: player.attributes.dcRemain-1})
					}	else {  // no remaining disconnects
						console.log('NO REMAINING DISCONNECTS // SET PLAYER UNRESPONSIVE HERE');
						player.update(status.willLeaveTable(player.attributes.username))
						player.update({dcRound: 0});
					}
				}
			});
		};
		this.joinQueueJoin = (player)=> {
			if (player.attributes.tableCash >= 100) {
				if (!(player in this.joinQueueHash)) {
					this.joinQueueHash[player.attributes.username]=player;
					this.joinQueue.push(player);
					player.update(status.willJoinTable(player.attributes.username))
				}	
			} else {
				player.update(status.NotEnoughTableCash(player.attributes.username));
			}
		};
		this.pollForStart = ()=> {
			return setInterval(()=>{
				if (this.emptySeats.length <= 8) {
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
				this.waitForTransitions = this.transitionsDuration(transFuncs, i)
			}
		};
		this.transitionsDuration = (transFuncs, i)=>{
			return setTimeout(()=>{
				clearTimeout(this.waitForTransitions);
				i++;
				if (transFuncs[i]) {
					transFuncs[i]();
					this.waitForTransitions = this.transitionsDuration(transFuncs, i);
				}
			}, this.transitionsTimer);
		};
		// Transition types
		this.checkEnoughTableCash = ()=> {
			this.each((player)=>{
				if (player.attributes.tableCash < this.bigBlindAmount) {
					this.leaveQueueJoin(player);
					player.update(status.NotEnoughTableCash(player.attributes.username));
				}
			})
		};
		this.serviceLeaveQueue = ()=> {
			this.leaveQueue.forEach((player)=>accounts.leaveTable(player, this, lobby.users));
			this.leaveQueue.forEach((player, i)=>{
				if (!(player.attributes.username in this.leaveQueueHash)) {
					this.leaveQueue.splice(i);
				}
			});
			// console.log('LEAVE QUEUE = ', this.leaveQueue)
		};
		this.serviceDisconnectQueue = ()=>{ 
			this.disconnectQueue.forEach((player)=>{
				// console.log('servicing disconnect queue')
				if (player.attributes.dcRound === 0) {
					accounts.disconnect(player, this);
				} else {
					player.update({dcRound: player.attributes.dcRound-1});
				}
			});
			this.disconnectQueue.forEach((player, i)=>{
				if (!(player.attributes.username in this.disconnectQueueHash)) {
					this.disconnectQueue.splice(i, 1);
				}
			});
		};
		this.serviceJoinQueue = ()=> {
			this.joinQueue.forEach((player)=>accounts.joinTable(player, lobby.users, this));
			this.joinQueue.forEach((player, i)=>{
				if (!(player.attributes.username in this.joinQueueHash)) {
					this.joinQueue.splice(i);
				}
			});
			// console.log('JOINQUEUE = ', this.joinQueue)
		};
		this.serviceAnnounceStartHand = ()=> {
			console.log('NEXT HAND WILL START MOMENTARILY');
		};
		this.pickDealer = ()=> {
			this.dealer = Math.min.apply(null, this.takenSeats());
			console.log('dealer = ', this.seat[this.dealer].attributes.username,' seat ', this.dealer)
		};
		this.placeAntes = ()=> {
			this.smallBlindSeat = this.findNextSeat(this.dealer);
			let smallBlindPlayer = this.seat[this.smallBlindSeat];
			// smallBlindPlayer.handleSet( {post: this.smallBlindAmount} );
			this.bigBlindSeat = this.findNextSeat(this.smallBlind);
			let bigBlindPlayer = this.seat[this.bigBlindSeat];
			// bigBlindPlayer.handleSet( {post: this.bigBlindAmount} );
			this.calledBet = 1;
			this.playersInHand = this.takenSeats().length;
			this.round = 1;
			this.turn = this.findNextSeat(this.bigBlindSeat);
			console.log('ROUND = ', settings.rounds[this.round]);
			console.log('PLACING ANTEs');
		};
		this.dealCards = ()=> {
			this.deck = util.shuffledDeck(util.orderedDeck());
			this.each((user)=> user.update({holeCards: [this.deck.pop(), this.deck.pop()]}))
		};
		this.waitBetweenHandsDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitBetweenHands);
				this.pollForStartTimer = this.pollForStart();
			}, this.waitBetweenHandsTimer);
		};
		this.checkRoundConditions = ()=> {
			if (this.round === 5 || this.playersInHand === 1) {
				this.declareWinner();
			} else if (this.checkedBet === this.playersInHand || this.calledBet === this.playersInHand) {
				this.advanceRound();
			} else {
				this.changeTurnSeat();
				this.startTurn();
			}
		};
		this.advanceRound = ()=> {
			this.round++;
			console.log('ROUND = ', settings.rounds[this.round]);
			if (this.round===2) { // Nothing to do on Round 1?
				this.communityCards = [];
				this.communityCards.push(this.deck.pop());
				this.communityCards.push(this.deck.pop());
				this.communityCards.push(this.deck.pop());
				console.log('COMMUNITY CARDS = ', this.communityCards);
			} else if (this.round === 3) {
				this.communityCards.push(this.deck.pop());
				console.log('TURN CARD = ', this.communityCards[3]);						
			} else if (this.round === 4) {
				this.communityCards.push(this.deck.pop());
				console.log('RIVER CARD = ', this.communityCards[4]);						
			} 
			this.turn = this.smallBlind;
			this.calledBet = 0;
			this.checkedBet = 0;
			this.checkRoundConditions();
		};
		this.declareWinner = ()=> {
			this.winner = this.turn;
			console.log('PLAYER '+this.winner+' wins!!');
			this.waitBetweenHands = this.waitBetweenHandsDuration();
		}
		this.startTurn = ()=> {
			let player = this.seat[this.turn];
			console.log('Player', this.turn, 'turn');
			this.swapInFilter(player, this.filters.onTurn)   //player && ?
			// player.handleSet( {post: this.bigBlindAmount} );
			this.waitForTurn = this.turnDuration();
		};
		this.turnDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitForTurn);
				let finishingTurnPlayer = this.seat[this.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.swapInFilter(finishingTurnPlayer, this.filters.default);
				this.changeTurnSeat();
				this.startTurn1();
			}, this.timer);
		};
		this.startTurn1 = ()=> {
			let player = this.seat[this.turn];
			console.log('Player', this.turn, 'turn');
			this.swapInFilter(player, this.filters.onTurn)   //player && ?
			player.handleSet( {post: 10} );
			this.waitForTurn = this.turnDuration1();
		};
		this.turnDuration1 = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitForTurn);
				let finishingTurnPlayer = this.seat[this.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.swapInFilter(finishingTurnPlayer, this.filters.default);
				this.changeTurnSeat();
				this.startTurn2();
			}, this.timer);
		};
		this.startTurn2 = ()=> {
			let player = this.seat[this.turn];
			console.log('Player', this.turn, 'turn');
			this.swapInFilter(player, this.filters.onTurn)   //player && ?
			player.handleSet( {post: 100} );
			this.waitForTurn = this.turnDuration2();
		};
		this.turnDuration2 = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitForTurn);
				let finishingTurnPlayer = this.seat[this.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.swapInFilter(finishingTurnPlayer, this.filters.default);
				this.changeTurnSeat();
				this.startTurn3();
			}, this.timer);
		};
		this.startTurn3 = ()=> {
			let player = this.seat[this.turn];
			console.log('Player', this.turn, 'turn');
			this.swapInFilter(player, this.filters.onTurn)   //player && ?
			player.handleSet( {post: 20} );
			this.waitForTurn = this.turnDuration3();
		};
		this.turnDuration3 = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitForTurn);
				let finishingTurnPlayer = this.seat[this.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.swapInFilter(finishingTurnPlayer, this.filters.default);
				this.changeTurnSeat();
				this.startTurn4();
			}, this.timer);
		};
		this.startTurn4 = ()=> {
			let player = this.seat[this.turn];
			console.log('Player', this.turn, 'turn');
			this.swapInFilter(player, this.filters.onTurn)   //player && ?
			player.handleSet( {post: 15} );
			this.waitForTurn = this.turnDuration4();
		};
		this.turnDuration4 = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitForTurn);
				let finishingTurnPlayer = this.seat[this.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.swapInFilter(finishingTurnPlayer, this.filters.default);
				this.changeTurnSeat();
				this.startTurn5();
			}, this.timer);
		};
		this.startTurn5 = ()=> {
			let player = this.seat[this.turn];
			console.log('Player', this.turn, 'turn');
			this.swapInFilter(player, this.filters.onTurn)   //player && ?
			player.handleSet( {post: 250} );
			this.waitForTurn = this.turnDuration5();
		};
		this.turnDuration5 = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitForTurn);
				let finishingTurnPlayer = this.seat[this.turn];
				// finishingTurnPlayer.handleSet({callBet: true});
				this.swapInFilter(finishingTurnPlayer, this.filters.default);
				this.checkRoundConditions();
			}, this.timer);
		};		



		this.changeTurnNow = ()=> {
			clearTimeout(this.waitForTurn);
			let finishingTurnPlayer = this.seat[this.turn];
			this.swapInFilter(finishingTurnPlayer, this.filters.default);
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
var table1 = new Table();
table1 = Object.assign(table1, settings.table1);
table1.pollForStartTimer = table1.pollForStart();

module.exports = {
	table1: table1,
}
