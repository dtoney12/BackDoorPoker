

module.exports = {
	manage: function(client, clientID) {
		var pokerObj = {
	      name: 'Mike',
	      joinTable: 'false',
	      rejoinWaitTimer: 0,
	      sitOutNext: false,
	      quitYesOrNo: false,
	      turn: false,
	      token: null,
	      bootPlayer: false,
	      bootPlayerTimer: 0,
	      bet: 0,
	      newBet: 0,
	      message: ''
	    };
		pokerObj.time = new Date().toTimeString();

		client.on('message', (msg)=> {
			pokerObj = JSON.parse(msg);
			console.log(clientID + ' message:', pokerObj.message);
			});

  		client.on('close', ()=> {
  			console.log(clientID, 'disconnected');
  			clearInterval(oneSetInterval); 
  			});

		var oneSetInterval = setInterval( ()=> {
			pokerObj.time = new Date().toTimeString();
			client.send( JSON.stringify(pokerObj) );
			}, 2000);

		// setTimeout(()=>{
		// 	clearInterval(oneSetInterval);
		// 	},20000);
	}	
};
