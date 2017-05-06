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
			"change:message": (sender, msg)=> this.each((user)=> user.update({chats:`(${sender.attributes.username}) ${msg}`})),
			"change:fold":    	   (sender)=> this.fold(),
			"change:leaveTable":   (sender)=> this.leaveQueueJoin(sender),
			"change:disconnect":     (user)=> this.disconnectQueueJoin(user),
			"add": 		(user, attributesArr)=> whoIsInRoom(this, user, 'ADD to'),       // just logging
			"remove": (user, attributesArr)=> whoIsInRoom(this, user, 'REMOVE from'),  // just logging
		});
		this.swapInFilter =  (player, filter)=> player.inFilter = Object.keys(filter);
		this.broadcast =        (tableUpdate)=> this.each((user)=> user.update(tableUpdate));
		this.takenSeats = ()=> { return Object.entries(this.seat).filter((tuple)=>tuple[1]).map((tuple)=>tuple[0])};
		this.changeTurnSeat = ()=> { 
			let nextPossibleSeat = Math.min.apply(null, this.takenSeats()
			.filter((seat)=>seat>this.turn));
			let nextSeat;
			if (nextPossibleSeat!==Infinity) {
				nextSeat = nextPossibleSeat;
			} else {
				nextSeat = Math.min.apply(null, this.takenSeats());
			}
			this.turn = nextSeat;
		};
		this.leaveQueueJoin = (player)=> {
			if (!(player in this.leaveQueueHash)) {
				this.leaveQueueHash[player.attributes.username]=player;
				this.leaveQueue.push(player);
				player.update(status.willLeaveTable(player.attributes.username))
			}	
		};
		this.disconnectQueueJoin = (player)=> {
			delete player.ws;
			db.CheckConditional('dcRemain', player, (limit, dcRemain)=>dcRemain>limit, 0)
			.then((hasDcRemain)=>{
				if (hasDcRemain) {
					console.log('DCREMAIN = ', player.attributes.dcRemain)
					if (!(player in this.disconnectQueueHash)) {
						this.disconnectQueueHash[player.attributes.username]=player;
						this.disconnectQueue.push(player);
						player.update({dcRound: 2});
						return db.SetUpdate(qry.updateUser, player, {dcRemain: player.attributes.dcRemain-1})
						.then(()=>player.update(status.disconnected(player.attributes.username)));
					}	
				} else {  // no remaining disconnects
					console.log('NO REMAINING DISCONNECTS // SET PLAYER UNRESPONSIVE HERE');
					this.leaveQueueHash[player.attributes.username]=player;
					this.leaveQueue.push(player);
					player.update(status.willLeaveTable(player.attributes.username))
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
		this.serviceLeaveQueue = ()=> {
			this.leaveQueue.forEach((player)=>accounts.leaveTable(player, this, lobby.users));
			this.leaveQueue.forEach((player, i)=>{
				if (!(player.attributes.username in this.leaveQueueHash)) {
					this.leaveQueue.splice(i);
				}
			});
			console.log('LEAVE QUEUE = ', this.leaveQueue)
		};
		this.serviceDisconnectQueue = ()=>{ 
			this.disconnectQueue.forEach((player)=>{
				console.log('servicing diconnect queue')
				if (player.attributes.dcRound === 0) {
					accounts.disconnect(player, this, lobby.users);
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
			console.log('JOINQUEUE = ', this.joinQueue)
		};
		this.serviceAnnounceStartHand = ()=> {
			console.log('NEXT HAND WILL START MOMENTARILY');
		};
		this.pickDealer = ()=> {
			this.dealer = Math.min.apply(null, this.takenSeats());
			this.turn = this.dealer;
			console.log('dealer = ', this.seat[this.dealer].attributes.username,' seat ', this.dealer)
		};
		this.placeAntes = ()=> {
			this.playerActionsRemain = 10-this.emptySeats.length
			this.round = 0;
			console.log('PLACING ANTEs')
		};
		this.dealCards = ()=> {
			this.deck = util.shuffledDeck(util.orderedDeck());
			// console.log(this.deck);
			console.log('DEALING CARDS')
			this.each((user)=> user.update({holdCards: [this.deck.pop(), this.deck.pop()]}))
		};
		// Turn related
		this.waitBetweenHandsDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitBetweenHands);
				this.pollForStartTimer = this.pollForStart();
			}, this.waitBetweenHandsTimer);
		};
		this.startTurn = ()=> {
			let player = this.seat[this.turn];
			if (this.round === 3) {
				console.log('PLAYER '+player.attributes.username+' wins!!');
				this.waitBetweenHands = this.waitBetweenHandsDuration();
			} else {
				console.log('PLAYER.SEAT =', player.attributes.seat, 'TABLE.DEALER', this.dealer);
				if (player.attributes.seat === this.dealer) {
					this.round++;
					console.log('ROUND = ', this.round);
					if (this.round === 1) {
						this.communityCards = [];
						this.communityCards.push(this.deck.pop());
						this.communityCards.push(this.deck.pop());
						this.communityCards.push(this.deck.pop());
						console.log('COMMUNITY CARDS = ', this.communityCards);
					} else if (this.round === 2) {
						this.communityCards.push(this.deck.pop());
						console.log('TURN CARD = ', this.communityCards[3]);						
					} else if (this.round === 3) {
						this.communityCards.push(this.deck.pop());
						console.log('RIVER CARD = ', this.communityCards[4]);						
					}
				// NEW ROUND
				}
				player && this.swapInFilter(player, this.filters.onTurn) 
				this.broadcast({turn: this.turn});
				this.waitForTurn = this.turnDuration();
			}
		};
		this.turnDuration = ()=> {
			return setTimeout(()=>{
				clearTimeout(this.waitForTurn);
				let player = this.seat[this.turn];
				this.swapInFilter(player, this.filters.default);
				this.changeTurnSeat();
				this.startTurn();
			}, this.timer);
		};
		this.changeTurnNow = ()=> {
			clearTimeout(this.waitForTurn);
			let player = this.seat[this.turn];
			this.swapInFilter(player, this.filters.default);
			this.changeTurnSeat();
			this.startTurn();
		};
		this.fold = ()=> {
			this.playerActionsRemain = this.playerActionsRemain-1;
			this.changeTurnNow();
		}
	},
});
var table1 = new Table();
table1 = Object.assign(table1, settings.table1);
table1.pollForStartTimer = table1.pollForStart();

module.exports = {
	table1: table1,
}
