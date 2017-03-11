var model = require('./model');

module.exports = {
	manage: function(client, clientID) {
		var pokerObj = model.pokerObj;
		var filter = model.allowFilterPokerObj;
		pokerObj.time = new Date().toTimeString();

		client.on('message', (recObj)=> {
			model.mergeObj( JSON.parse(recObj), pokerObj, filter);
			console.log(clientID + ' updated ' + pokerObj.update + ':', pokerObj[pokerObj.update]);
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
