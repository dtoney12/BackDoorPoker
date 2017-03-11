

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

		// var oneSetInterval = () => { return setTimeout };

  // 		oneSetInterval( );

  		client.on('close', ()=> {

  			console.log(clientID, 'disconnected') });

		var oneSetInterval = setInterval(
			()=> { 	pokerObj.time = new Date().toTimeString();
  					client.send( JSON.stringify(pokerObj) );
					console.log('gee')}, 2000);

		setTimeout(()=>{
			clearInterval(oneSetInterval);
		},20000);
	}	
};
