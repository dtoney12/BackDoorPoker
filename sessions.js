

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
	      newBet: 0
	    };
		pokerObj.time = new Date().toTimeString();

		client.on('message', (msg)=> {
			console.log(clientID,':',msg);
			pokerObj.time = new Date().toTimeString();
			client.send( JSON.stringify(pokerObj) ); });
		
		var oneSetInterval = setInterval( ()=> {
  			pokerObj.time = new Date().toTimeString();
  			client.send( JSON.stringify(pokerObj) ), 5000 });

  		oneSetInterval();

  		client.on('close', ()=> console.log(clientID, 'disconnected') );


	}	
};
