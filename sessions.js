

module.exports = {
	manage: function(clientS) {
		var pokerObj = {
      		time: new Date().toTimeString()
    	}
    	sendObj = JSON.stringify(pokerObj);
		clientS.send( sendObj );
  		setTimeout( () => clientS.send( sendObj ), 5000 )
	}	
};
