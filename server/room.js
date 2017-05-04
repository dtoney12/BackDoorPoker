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
const accounts = require('./accounts')
// console.log('SENDER: '+sender.attributes.username+' folds = '+msg)
db.initDb(bots.lobbyBots, bots.getCashBots, bots.getTableCashBots, bots.tableBots, 
					bots.lobbyConfigs, bots.getCashConfigs, bots.getTableCashConfigs, bots.tableConfigs)

var Table = Backbone.Collection.extend({
	model: lobby.User,
	initialize: function () { 
		this.on({
			"change:message": (sender, msg)=> this.each((user)=> user.update({chats:`(${sender.attributes.username}) ${msg}`})),
			"change:fold":    	   (sender)=> this.nextTurn(),
			"change:leaveTable":   (sender)=> this.leaveQueueJoin(sender),
			"change:disconnect":     (user)=> accounts.disconnect(user, this, lobby.users),
			"add": 		(user, attributesArr)=> whoIsInRoom(this, user, 'ADD to'),       // just logging
			"remove": (user, attributesArr)=> whoIsInRoom(this, user, 'REMOVE from'),  // just logging
		});
		this.swapInFilter =  (player, filter)=> player.inFilter = Object.keys(filter);
		this.broadcast =        (tableUpdate)=> this.each((user)=> user.update(tableUpdate));
		this.takenSeats = ()=> { return Object.entries(this.seat).filter((tuple)=>tuple[1]).map((tuple)=>tuple[0])};
		this.returnNextSeat = ()=> { 
			let nextPossibleSeat = Math.min.apply(null, this.takenSeats()
			.filter((seat)=>seat>this.turn));
			if (nextPossibleSeat!==Infinity) {
				return nextPossibleSeat;
			} else {
				return Math.min.apply(null, this.takenSeats());
			}
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
		}
		this.leaveQueueJoin = (player)=> {
			if (!(player in this.leaveQueueHash)) {
				this.leaveQueueHash[player.attributes.username]=player;
				this.leaveQueue.push(player);
				player.update(status.willLeaveTable(player.attributes.username))
			}	
		};
		this.pollForStart = ()=> {
			return setInterval(()=>{
				if (this.emptySeats.length <= 8) {
					this.serviceTransitions(
						this.serviceLeaveQueue,
						this.serviceJoinQueue,
						this.serviceAnnounceStartHand,
						this.pickDealer,
						this.placeAntes,
						this.dealCards,
						this.startTurn
					);
					clearInterval(this.pollForStartTimer);
				} else {
					this.serviceLeaveQueue();
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
			this.leaveQueue.forEach((player)=>{
				accounts.leaveTable(player, this, lobby.users, false);
			});
		};
		this.serviceJoinQueue = ()=> {
			this.joinQueue.forEach((player)=>{
				accounts.joinTable(player, lobby.users, this);
			});
		};
		this.serviceAnnounceStartHand = ()=> {
			console.log('NEXT HAND WILL START MOMENTARILY');
		};
		this.pickDealer = ()=> {
			this.dealer = Math.min.apply(null, this.takenSeats());
			this.turn = this.dealer;
			console.log('dealer = ', this.seat[this.dealer])
		};
		this.placeAntes = ()=> {
			
			console.log('PLACING ANTEs')
		};
		this.dealCards = ()=> {

			console.log('DEALING CARDS')
		};
		// Turn related
		this.startTurn = ()=> {
			var player = this.seat[this.turn];
			player && this.swapInFilter(player, this.filters.onTurn) 
			this.broadcast({turn: this.turn});
			this.waitForTurn = this.turnDuration(player);
		};
		this.turnDuration = (player)=> {
			return setTimeout(()=>{
				player && this.swapInFilter(player, this.filters.default);
				this.turn = this.returnNextSeat();
				clearTimeout(this.waitForTurn);
				this.startTurn();
			}, this.timer);
		};
		this.nextTurn = ()=> {
			clearTimeout(this.waitForTurn);
			var player = this.seat[this.turn];
			player && this.swapInFilter(player, this.filters.default);
			this.turn = this.returnNextSeat();
			this.startTurn();
		};
	},
});
var table1 = new Table();
table1 = Object.assign(table1, settings.table1);
table1.pollForStartTimer = table1.pollForStart();

module.exports = {
	table1: table1,
}
