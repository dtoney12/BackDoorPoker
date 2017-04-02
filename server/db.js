var mysql = require('mysql');
var state = require('./state');

var pool = mysql.createPool(process.env.CLEARDB_DATABASE_URL || {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dtpoker'
});

module.exports = {
	addName: function(enteredName, player, callback){
	  	pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `SELECT * from player WHERE name='${enteredName}';`;	
	  		connection.query(queryString, function(err, playerInfo) {
	  			if (err) {
	  				throw err;
	  			}
	  			if (playerInfo!==undefined) {
	  				if (!playerInfo.length) {
		  				var queryString = `INSERT INTO player (id, name, password, loggedin, accountCash, getCashWait ) VALUES (null, '${enteredName}', '', false, 0, 0);`
			  			connection.query(queryString, function(err) {
				  			if (err) {
				  				throw err;
				  			}
				  			console.log('\nname added to db -----> :' + enteredName);
				  			player.set( { update: `${enteredName} <--- Please log in` } );
				  			connection.release();
				  			return;
				  		});
				  	}
	  			} else {
	  				if (playerInfo[0].loggedin === 1) {
		  				console.log('\nUser is already logged in -----> :' + enteredName);
		  				console.log('removing name from model -----> :' + enteredName)
		  				player.set( { update: `${enteredName} <--- already logged in` } );
		  				player.set( { name: '' } );
		  				connection.release();
		  				return;
		  			} else if (playerInfo[0].loggedin === 0) {
		  				console.log('\nUser exists in db but not logged in -----> :' + enteredName);
		  				console.log('Requesting user to log in -----> :' + enteredName)
		  				player.set( { update: `${enteredName} <--- Please log in` } );
		  				player.set( { name: enteredName } );
		  				connection.release();
		  				return;
		  			}
	  			}
		  	})
	  	});
	},
	checkPassword: function(enteredPW, player, callback){
	  	pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
	  		connection.query(queryString, function(err, playerInfo) {
	  			if (err) {
	  				throw err;
	  			}
	  			if (playerInfo.length) {
	  				if (playerInfo[0].password === '') {
		  				var queryString = `UPDATE player SET password='${enteredPW}', loggedin= true WHERE name='${player.attributes.name}';`
			  			connection.query(queryString, function(err, rows) {
				  			if (err) {
				  				throw err;
				  			}
				  			console.log(`\npassword updated for >>${player.attributes.name}<< in db -----> :` + enteredPW);
				  			player = state.registerNewPlayer(player.attributes.name);
				  			state.logInPlayer(player, playerInfo[0]);
				  			console.log('\nPassword \'' + enteredPW + '\' set and Registered New Player ------> Logging in player-----> :' + player.attributes.name);
				  			connection.release();
				  			return;
				  		});
	  				} else {
	  					if (playerInfo[0].password === enteredPW && playerInfo[0].loggedIn === 0) {
	  						var queryString = `UPDATE player SET loggedin= true WHERE name='${player.attributes.name}';`
				  			connection.query(queryString, function(err) {
					  			if (err) {
					  				throw err;
					  			}
		  						state.logInPlayer(player, playerInfo[0]);
		  						console.log('\nPassword \'' + enteredPW + '\' matches ------> Logging in player-----> :' + player.attributes.name);
		  						connection.release();
					  			return;
					  		});
	  					} else {
	  						console.log('\nPassword \'' + enteredPW + '\' does not match for Player-----> :' + player.attributes.name);
	  						state.updateClientStatus(player, 'Password incorrect or already logged in, Sorry');
	  						connection.release();
	  						return;
	  					}
	  				}
	  			} else {
	  				console.log('\nPlayer name does not exist in db -----> :' + player.attributes.name);
	  				console.log('Rejecting password update request -----> :' + enteredPW)
	  				player.set( { update: `${player.attributes.name} <--- user doesn't exist` } );
	  				player.set( { password: '' } );
	  				connection.release();
	  				return;
	  			}
		  	});
	  	});
	},
	logOutPlayer: function(player){
	  	pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
	  		connection.query(queryString, function(err, playerInfo) {
	  			playerInfo = playerInfo[0];
	  			if (err) {
	  				throw err;
	  			}
	  			if (playerInfo!==undefined) {
	  				if (!playerInfo.length) {
		  				playerInfo = playerInfo[0];
		  				var queryString = `UPDATE player SET loggedin= false WHERE name='${player.attributes.name}';`
			  			connection.query(queryString, function(err, rows) {
				  			if (err) {
				  				throw err;
				  			}
				  			console.log(`\ndb loggedIn has been set to false for >>${player.attributes.name}<<`);
				  			state.logOutPlayer(player);
				  			connection.release();
				  			return;
				  		});
		  			}
	  			} else {
	  				console.log('\nPlayer name does not exist in db -----> :' + player.attributes.name);
	  				connection.release();
	  				return;
	  			}
		  	})
	  	});
	},
	// getCashWait: function(player) {
	// 	pool.getConnection(function(err, connection) {
	//   		if (err) {
	//   			throw err;
	//   		}
	//   		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
	//   		connection.query(queryString, function(err, playerInfo) {
	//   			if (err) {
	//   				throw err;
	//   			}
	//   			if (playerInfo.length) {
	//   				playerInfo = playerInfo[0];
	//   				var queryString = `UPDATE player SET getCashWait= 60 WHERE name='${player.attributes.name}';`
	// 	  			connection.query(queryString, function(err, rows) {
	// 		  			if (err) {
	// 		  				throw err;
	// 		  			}
	// 		  			console.log(`\ndb getCashWait has been set to 60 for >>${player.attributes.name}<<`);
	// 		  			state.syncPlayerStateDb(player, playerInfo);
	// 		  			connection.release();
	// 		  			return;
	// 		  		});
	//   			} else {
	//   				console.log('\nPlayer name does not exist in db -----> :' + player.attributes.name);
	//   				connection.release();
	//   				return;
	//   			}
	// 	  	})
	//   	});
	// },	
	getCash: function(player) {
		pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
	  		connection.query(queryString, function(err, playerInfo) {
	  			if (err) {
	  				throw err;
	  			}
	  			if (playerInfo.length) {
	  				var queryString = `UPDATE player SET accountCash= 1000, getCashWait= 60 WHERE name='${player.attributes.name}';`
		  			connection.query(queryString, function(err, rows) {
			  			if (err) {
			  				throw err;
			  			}
				  		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
				  		connection.query(queryString, function(err, updatedPlayerInfo) {
				  			if (err) {
				  				throw err;
				  			}
				  			if (playerInfo.length) {			  			
					  			console.log(`\ndb accountCash has been set to 1000, getCashWait to 60 for >>${player.attributes.name}<<`);
					  			state.syncPlayerStateDb(player, updatedPlayerInfo[0]);
					  			connection.release();
					  			return;
					  		}
					  	});
					});
	  			} else {
	  				console.log('\nPlayer name does not exist in db -----> :' + player.attributes.name);
	  				connection.release();
	  				return;
	  			}
		  	})
	  	});
	},	
	// initDbPlayer: function() {
	// 	pool.getConnection(function(err, connection) {
	//   		if (err) {
	//   			throw err;
	//   		}
	//   		var queryString = `DROP TABLE IF EXISTS player;`;	
	//   		connection.query(queryString, function(err) {
	//   			if (err) {
	//   				throw err;
	//   			}
	//   			// var queryString = `CREATE DATABASE dtpoker;`;
	//   			// connection.query(queryString, function(err) {
	// 	  		// 	if (err) {
	// 	  		// 		throw err;
	// 	  		// 	}
	// 	  		// 	var queryString = `USE dtpoker;`;
	// 	  		// 	connection.query(queryString, function(err) {
	// 		  	// 		if (err) {
	// 		  	// 			throw err;
	// 		  	// 		}
	// 		  			var queryString = `CREATE TABLE player ( id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, \
	//  					name CHAR(140), password CHAR(140), loggedIn BOOLEAN, accountCash INT, getCashWait INT, UNIQUE (name) );`;
	// 	  				connection.query(queryString, function(err) {
	// 			  			if (err) {
	// 			  				throw err;
	// 			  			}
	// 			  			var queryString = `INSERT INTO player ( id, name, password, loggedin, accountCash, getCashWait ) VALUES (null, 'Bobs', 'UpandDownInTheWater', false, 0, 0 );`;
	// 		  				connection.query(queryString, function(err) {
	// 				  			if (err) {
	// 				  				throw err;
	// 				  			}
	// 		  					connection.release();
	// 		  					return;
	// 				  		});
	// 				  	return;
	// 			  		});
	// 			  // 	return;
	// 		  	// 	});
	// 		  	// return;
	// 		  	// });
	// 		  return;
	// 	  	});
	// 	return;
	//   	});
	// },
	initDbPlayer: function() {
		pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `DROP TABLE IF EXISTS player;`;	
	  		connection.query(queryString, function(err) {
	  			if (err) {
	  				throw err;
	  			}
	  			// var queryString = `CREATE DATABASE dtpoker;`;
	  			// connection.query(queryString, function(err) {
		  		// 	if (err) {
		  		// 		throw err;
		  		// 	}
		  		// 	var queryString = `USE dtpoker;`;
		  		// 	connection.query(queryString, function(err) {
			  	// 		if (err) {
			  	// 			throw err;
			  	// 		}
			  			var queryString = `CREATE TABLE player ( id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, \
	 					name CHAR(140), password CHAR(140), loggedIn BOOLEAN, accountCash INT, getCashWait INT, UNIQUE (name) );`;
		  				connection.query(queryString, function(err) {
				  			if (err) {
				  				throw err;
				  			}
				  			var queryString = `INSERT INTO player ( id, name, password, loggedin, accountCash, getCashWait ) VALUES (null, 'Bobs', 'UpandDownInTheWater', false, 0, 0 );`;
			  				connection.query(queryString, function(err) {
					  			if (err) {
					  				throw err;
					  			}
			  					connection.release();
			  					return;
					  		});
					  	return;
				  		});
				  // 	return;
			  	// 	});
			  	// return;
			  	// });
			  return;
		  	});
		return;
	  	});
	}
}