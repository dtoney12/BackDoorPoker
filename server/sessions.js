var model = require('./model');
var Backbone = require('backbone');


module.exports = {
	manage: function(wsClient, clientID) {
		var user = new model.User();
		user.attributes.session = wsClient;
		user.attributes.clientID = clientID;
		var updateUserObj = user.attributes;
		model.guests.add(user);
		// updateUserObj.time = new Date().toTimeString();

		wsClient.on('message', (recObj)=> {
			recObj = JSON.parse(recObj);
			console.log('\n>>>>CLIENT  ' + clientID + ' attempting to update ' + recObj.update + '----> :' + recObj[recObj.update]);
			model.filterInputFromClient( recObj, user, user.validUserInputFilter);
			});

  		wsClient.on('close', ()=> {
  			console.log('\n' + clientID, ' <------ disconnected');
  			user.set( { logOut: true } );
  			// clearInterval(oneSetInterval); 
  			});

		// var oneSetInterval = setInterval( ()=> {
		// 	updateUserObj.time = new Date().toTimeString();
		// 	wsClient.send( JSON.stringify(updateUserObj) );
		// 	}, 10000);
	}	
};
