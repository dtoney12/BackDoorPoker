var model = require('./model');
var Backbone = require('backbone');


module.exports = {
	manage: function(client, clientID) {
		var playerBb = new model.Player();
		model.PlayersBb.add(playerBb);

		var pokerObj = playerBb.attributes;
		var filter = model.allowFilterPokerObj;
		pokerObj.time = new Date().toTimeString();

		client.on('message', (recObj)=> {
			recObj = JSON.parse(recObj);
			model.mergeObj( recObj, playerBb, filter);
			console.log('\n' + clientID + ' attempted to update ' + recObj.update + ':', recObj[recObj.update]);
			console.log(clientID, recObj.update + ' state: ' + (pokerObj[pokerObj.update]).toString());
			});

  		client.on('close', ()=> {
  			console.log(clientID, 'disconnected');
  			clearInterval(oneSetInterval); 
  			});

		var oneSetInterval = setInterval( ()=> {
			pokerObj.time = new Date().toTimeString();
			client.send( JSON.stringify(pokerObj) );
			}, 1000);

		// setTimeout(()=>{
		// 	clearInterval(oneSetInterval);
		// 	},20000);
	}	
};
