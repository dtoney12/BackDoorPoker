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

			"change:clientReady":     	     (user)=> this.updatePlayerOfSeatStates(user),		//user.outFilter.forEach((attr)=>user.sendUpdate({[attr]: user.attributes[attr]})),
			"change:message":         (sender, msg)=> this.each((user)=>user.attributes.type && user.update({chats:`(${sender.attributes.username}) ${msg}`})),
			"change:tableCash":     (sender, value)=> this.updateAllAboutPlayer(sender, value, 'tableCash'),
			"change:playerAction": (sender, update)=> this.updateAllAboutPlayer(sender, update, 'playerAction'),
			"change:playerState":   (sender, value)=> this.updateAllAboutPlayer(sender, value, 'playerState'),
			"change:fold":   	      (sender, value)=> this.fold(sender), // fold() => player.update(playerAction)
			"change:check":         (sender, value)=> this.check(sender), // check() => player.update(playerAction)
			"change:post":          (sender, value)=> this.inputBet(sender, value, 'post'), // inputBet() => player.update(playerAction)
			"change:call":          (sender, value)=> this.inputBet(sender, value, 'call'),
			"change:bet": 	        (sender, value)=> this.inputBet(sender, value, 'bet'),
			"change:raise":         (sender, value)=> this.inputBet(sender, value, 'raise'),
			"change:allIn":  	      (sender, value)=> this.inputBet(sender, value, 'allIn'),

			// build these into update all players of player State
			"change:leaveTable":           (sender)=> this.leaveQueueJoin(sender),
			"change:disconnect":             (user)=> this.disconnectQueueJoin(user),
			"add": 		        (user, attributesArr)=> { this.loadPlayerToState(user); whoIsInRoom(this, user, 'ADD to'); }, 
			"remove":         (user, attributesArr)=> { this.unloadPlayerFromState(user); whoIsInRoom(this, user, 'REMOVE from'); },  // just logging

			// table state changes
			"change:dealer":    			(state, value)=> this.sendUpdateAll({dealer: value}),
			"change:smallBlindSeat":  (state, value)=> this.sendUpdateAll({smallBlindSeat: value}),
			"change:bigBlindSeat":    (state, value)=> this.sendUpdateAll({bigBlindSeat: value}),
			"change:round":     			(state, value)=> this.sendUpdateAll({round: value}),
			"change:turn":      			(state, value)=> this.sendUpdateAll({turn: value}),
			"change:pots": 						(state, value)=> this.sendUpdateAll({pots: value}),
			"change:communityCards":  (state, value)=> this.sendUpdateAll({communityCards: value}),
		});														

		this.swapInFilter =           (player, filter)=>  player.set({inFilter: Object.keys(filter)});
		this.addTurnFilter =                  (player)=>	player.set({inFilter: util.extendKeysToArray(player.attributes.inFilter, state.filterForTurn)});
		this.removeTurnFilter =               (player)=>  player.set({inFilter: util.unExtendFromArray(player.attributes.inFilter, state.filterForTurn)});

		this.loadPlayerToState =     					(player)=>  state.seat[player.attributes.seat] = player.attributes;
		this.unloadPlayerFromState = 					(player)=>  state.seat[player.attributes.seat] = null;  //untested

		this.updatePlayerOfSeatStates =       (player)=>  Object.values(state.seat).forEach((playerAttributesEntry, i)=> {
				if (playerAttributesEntry) {
					for (let key in playerAttributesEntry) {
						let seatNumber = i+1;
						(key in state.filters.otherPlayerOut) && player.sendUpdate({seat:{ [seatNumber]: {[key]: state.seat[seatNumber][key] }}});
					}
				}
		});
		this.updateAll = 									   		 (update)=>  this.each((user)=> user.attributes.type && user.update(update));
		this.sendUpdateAll =                (tableUpdate)=>  this.each((user)=> user.attributes.type && user.sendUpdate(tableUpdate));
		this.updateAllAboutPlayer =(player, update, attr)=>  this.each((user)=> user.attributes.type && user.sendUpdate({ seat: {[player.attributes.seat]: {[attr]: update } }}));

		this.inputBet = 			(player, value, betType)=>  {
			if ((betType in state.calledBetIncrementTypes) || ((betType === 'post') && (player.attributes.seat === state.bigBlindSeat) )) {
				this.setState({calledBet: state.calledBet+1 });
				this.setState({betPlaced: true });
			}
			player.update({tableCash: player.attributes.tableCash-value});
			player.update({playerAction: {[betType]: value} });
			let copyOfPots = util.copy(state.pots)
			this.callPot(player, value, copyOfPots[0], copyOfPots);
			this.setState({pots: copyOfPots});
			if (betType!=='post') {
				this.changeTurnNow();
			}
		};
		this.fold = (player)=> {
			if (player.attributes.playerAction in state.calledBetIncrementTypes) {
				this.setState({calledBet: state.calledBet-1});
			} else if (player.attributes.playerAction==='check') {
				this.setState({checkedBet: state.checkedBet-1 });
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
		this.changeTurnSeat = ()=>  this.setState({turn: this.findNextSeat(state.turn)});
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
						this.resetHand,
						this.serviceAnnounceStartHand,
						this.pickDealer,
						this.placeAntes,
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
				if (player.attributes.tableCash < state.bigBlindAmount) {
					this.leaveQueueJoin(player);
					player.update(status.NotEnoughTableCash(player.attributes.username));
				}
			})
		};
		this.resetHand = ()=> {
			state.communityCards = [];
			state.playersInHand = 0;
	    state.betPlaced = false;
	    state.checkedBet = 0;
	    state.calledBet = 0;
	    state.pots = [{
	      value: 0,
	      callAmount: 0,
	      sidePot: false,
	      nextPotIndex: null,
	      winners: null,
	      playersInPot: {},
    	}];
			for (var i = 1; i <=10; i++) {
				if (this.seat[i]) {
					let playerToReset = this.seat[i];
					playerToReset.attributes.holeCards = [];
					playerToReset.attributes.topFiveCards = null;
					playerToReset.attributes.topFiveCardsType = null;
					playerToReset.attributes.playerAction = null;
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

		}
		this.serviceAnnounceStartHand = ()=> {
			console.log('NEXT HAND WILL START MOMENTARILY');
		};
		this.pickDealer = ()=> {
			this.setState({ dealer: Math.min.apply(null, this.takenSeats()) });
			console.log('dealer = ', this.seat[state.dealer].attributes.username,' seat ', state.dealer)
		};
		this.placeAntes = ()=> {
			console.log('ROUND = ', settings.state.roundNames[state.round]);
			console.log('PLACING ANTEs');
			this.setState({smallBlindSeat: this.findNextSeat(state.dealer) });
			let smallBlindPlayer = this.seat[state.smallBlindSeat];
			smallBlindPlayer.handleSet( {post: state.smallBlindAmount} );
			this.setState({bigBlindSeat: this.findNextSeat(state.smallBlindSeat) });
			let bigBlindPlayer = this.seat[state.bigBlindSeat];
			bigBlindPlayer.handleSet( {post: state.bigBlindAmount} );
			this.setState({playersInHand: this.takenSeats().length });
			this.setState({round: 1 });
			state.turn = state.bigBlindSeat;
		};
		this.dealCards = ()=> {
			this.setState({deck: util.shuffledDeck(util.orderedDeck()) });
			for (var i = 1; i <=10; i++) {
				if (this.seat[i]) {
					let playerReceivingCards = this.seat[i];
					playerReceivingCards.update({holeCards: [ state.deck.pop(), state.deck.pop() ] });
					playerReceivingCards.sendUpdate({seat: {[i]: {holeCards: state.seat[i].holeCards }}});
					this.each((otherPlayer)=> { 
						if (otherPlayer.attributes.type && otherPlayer.attributes.seat !== i) {
							playerReceivingCards.sendUpdate({ seat: {[otherPlayer.attributes.seat]: {holeCards: ['reverse','reverse']}}});
						}
					});
				}
			}
		};
		this.startTurn = ()=> {
			state.turnCounter++;
			let player = this.seat[state.turn];
			console.log("\n\n--------------------");
			console.log("| START TURN");
			console.log('Player', state.turn, 'turn');
			this.calculateLeftToCall(player);
			this.addTurnFilter(player);
			// console.log('player.infilter =',player.attributes.inFilter)
			state.waitForTurn = this.turnDuration(state.turnCounter);
		};
		this.turnDuration = (turnCounter)=> {
			return setTimeout(()=>{
				let player = this.seat[state.turn];
				if (state.betPlaced) {
					console.log('leftToCall =', player.attributes.leftToCall);
					if (player.attributes.sessionId==='ROBOT') {
						player.handleSet(bots.logic(player, state));  // defaults if no player action (change to fold)
					} else {
						player.handleSet({call: player.attributes.leftToCall });
					}
				} else {
					if (player.attributes.sessionId==='ROBOT') {
						player.handleSet(bots.logic(player, state));  // defaults if no player action (change to fold)
					} else {
						player.handleSet({check: true }); // defaults if no player action
					}
				}
				if (turnCounter===state.turnCounter) {
					console.log('NO INPUT RECEIVED, FOLDING', seat);
					player.handleSet({fold: true});
					console.log("| EXPIRATION:    END TURN");
					console.log("--------------------");
				}
			}, state.turnTimer);
		};
		this.changeTurnNow = ()=> {
			let player = this.seat[state.turn];
			console.log('this.seat[state.turn] name= ', this.seat[state.turn].attributes.username)
			this.removeTurnFilter(player);
			clearTimeout(state.waitForTurn);
			console.log("| CHANGE TURN NOW:    END TURN");
			console.log("--------------------");
			this.checkRoundConditions();
		};
		this.checkRoundConditions = ()=> {
			console.log('checkRoundConditions')
			console.log('ROUND = ', settings.state.roundNames[state.round]);
			console.log('checked bet =', state.checkedBet, 'called bet =', state.calledBet, 'players in hand = ', state.playersInHand);
			// console.log('state.callPotsAmount =', state.callPotsAmount);
			if (state.round ===  5 || state.playersInHand === 1) {
				this.declareWinners();
			} else if (state.checkedBet === state.playersInHand || state.calledBet === state.playersInHand) {
				this.advanceRound();
			} else { // player takes a turn
				if (state.round===1) {
					console.log('bet placed? = ', state.betPlaced)
					this.setState({filterForTurn: state.betPlaced ? state.filters.preFlopPostRaise : state.filters.preFlopNoRaise });
				} else {
					this.setState({filterForTurn: state.betPlaced ? state.filters.flopPostBet : state.filters.flopNoBet });
				}
				console.log('filterForTurn =', state.filterForTurn)
				this.changeTurnSeat();
				this.startTurn();
			}
		};
		this.advanceRound = ()=> {
			this.setState({round: state.round+1 });
			console.log('ROUND = ', settings.state.roundNames[state.round]);
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
			this.setState({turn: state.smallBlindSeat});
			this.setState({betPlaced: false});
			this.setState({calledBet: 0 });
			this.setState({checkedBet: 0 });
			this.updateAll({leftToCall: 0});
			this.updateAll({playerAction: null});
			state.turnCounter = 0;
			this.checkRoundConditions();
		};
		this.declareWinners = ()=> {
			state.pots.forEach((pot)=>{
				this.eliminateNonPotWinners(pot);
				for (let winnerSeat in pot.winners) {
					console.log( 'Player ', winnerSeat, ' wins with ', state.seat[winnerSeat].topFiveCards, '\n');
				}
			});
			state.waitBetweenHands = this.waitBetweenHandsDuration();
		};
		this.eliminateNonPotWinners = (pot)=> {
			let cardIndex = 0;
			let highSoFar = {type: 0, winners: util.copy(pot.playersInPot), ranks: null};
			while (cardIndex < 5) {
				let i = cardIndex;
				for (let potSeat in highSoFar.winners) {
					let player = this.seat[potSeat];
					if (!(highSoFar.winners[potSeat].handChecked)) {
						highSoFar.winners[potSeat].handChecked = true;
						let checkedHand = handChecker.checkHand(player.attributes.holeCards, state.communityCards);
						let rankedHand = checkedHand.indexes.map((index)=>{
							if (index===0 || index===1) {
								return util.integerCardValue(player.attributes.holeCards[index]);
							} else {
								return util.integerCardValue(state.communityCards[index-2]);
							}
						});
						player.update({ topFiveCards: rankedHand, topFiveCardsType: checkedHand.type });
					}
					if (player.attributes.topFiveCardsType > highSoFar.type) { // type supercedes so check type first
						highSoFar.type = player.attributes.topFiveCardsType;
						highSoFar.ranks = player.attributes.topFiveCards;
						for (let playerSeat in highSoFar.winners) {
							if (highSoFar.winners[playerSeat].handChecked) {
								if (playerSeat!==potSeat) {
									delete highSoFar.winners[playerSeat];
								}
							}
						}
					} else if (player.attributes.topFiveCardsType === highSoFar.type) {
						let rankedCard = player.attributes.topFiveCards[i];
						if (rankedCard > highSoFar.ranks[i]) {  // player has a higher card than current possible winner
							for (let playerSeat in highSoFar.winners) {
								if (highSoFar.winners[playerSeat].handChecked) {
									if (playerSeat!==potSeat) {
										delete highSoFar.winners[playerSeat];
									}
								}
							}
							highSoFar.ranks = player.attributes.topFiveCards;
						} else if (rankedCard < highSoFar.ranks[i]) {
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
		this.waitBetweenHandsDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitBetweenHands);
				this.pollForStartTimer = this.pollForStart();
			}, state.waitBetweenHandsTimer);
		};
		this.addPlayerInPot = (player, pot, putIn)=> {
			pot.playersInPot[player.attributes.seat] = { playerName: player.attributes.username, putIn: putIn || 0 };
		};
		this.callPot = 	 (player, remainingBetValue, pot, potsArray)=> {
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
						let nextPot = potsArray[pot.nextPotIndex];
						this.callPot(player, remainingBetValue, nextPot, potsArray);
					} else if (pot.nextPotIndex===null) {   // no other pots to call, raise
						pot.value += remainingBetValue;
						potSeat.putIn += remainingBetValue;
						let callAmountIncrease = remainingBetValue - potShortFall;
						pot.callAmount += callAmountIncrease;
						// this.setState({callPotsAmount: state.callPotsAmount+callAmountIncrease});
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
					// this.setState({callPotsAmount: state.callPotsAmount+callAmountIncrease});
					remainingBetValue = 0;
				}
			}
			console.log('POTS = ')
			potsArray.forEach((pot)=> console.log(pot));
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
				totalLeftToCall += (player.attributes.leftToCall+leftToCallInPot)
			});
			player.update({leftToCall: totalLeftToCall });
		};
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
