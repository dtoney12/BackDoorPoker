

module.exports = {
	manage: function(client, clientID) {
		var pokerObj = JSON.stringify({
      		time: new Date().toTimeString()
    	});

		client.on('message', (msg)=> console.log(clientID,':',msg) );
  		client.on('close', ()=> console.log(clientID, 'disconnected') );
		
		client.send( pokerObj );
  		setTimeout( ()=> client.send( pokerObj ), 5000 );

	}	
};
