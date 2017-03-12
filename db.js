var mysql = require('mysql');
var state = require('./state');

var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: ''
});

module.exports = {
	addName: function(enteredName, player, callback){
	  	pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `SELECT * from player WHERE name='${enteredName}';`;	
	  		connection.query(queryString, function(err, nameExists) {
	  			if (err) {
	  				throw err;
	  			}
	  			if (!nameExists.length) {
	  				var queryString = `INSERT INTO player (id, name, password) VALUES (null, '${enteredName}', '');`
		  			connection.query(queryString, function(err, rows) {
			  			if (err) {
			  				throw err;
			  			}
			  			console.log('\nname added to db -----> :' + enteredName);
			  			state.registerNewPlayer(enteredName);
			  			connection.release();
			  		});
	  			} else {
	  				console.log('\nname already exists in db -----> :' + enteredName);
	  				console.log('removing name from model -----> :' + enteredName)
	  				player.set( { update: `${enteredName} <--- exists in db already` } );
	  				player.set( { name: '' } );
	  				connection.release();
	  			}
		  	})
	  	});
	},
	addPassword: function(enteredPW, player, callback){
	  	pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `SELECT * from player WHERE name='${player.attributes.name}';`;	
	  		connection.query(queryString, function(err, nameExists) {
	  			if (err) {
	  				throw err;
	  			}
	  			if (nameExists.length) {
	  				var queryString = `UPDATE player SET password='${enteredPW}' WHERE name='${player.attributes.name}';`
		  			connection.query(queryString, function(err, rows) {
			  			if (err) {
			  				throw err;
			  			}
			  			console.log(`\npassword updated for >>${player.attributes.name}<< in db -----> :` + enteredPW);
			  			state.updatePassword(enteredPW, player.attributes.name);
			  			connection.release();
			  		});
	  			} else {
	  				console.log('\nPlayer name does not exist in db -----> :' + player.attributes.name);
	  				console.log('Rejecting password update request -----> :' + enteredPW)
	  				player.set( { update: `${player.attributes.name} <--- user doesn't exist` } );
	  				player.set( { password: '' } );
	  				connection.release();
	  			}
		  	})
	  	});
	},
	initDbPlayer: function() {
		pool.getConnection(function(err, connection) {
	  		if (err) {
	  			throw err;
	  		}
	  		var queryString = `DROP DATABASE IF EXISTS dtpoker;`;	
	  		connection.query(queryString, function(err) {
	  			if (err) {
	  				throw err;
	  			}
	  			var queryString = `CREATE DATABASE dtpoker;`;
	  			connection.query(queryString, function(err) {
		  			if (err) {
		  				throw err;
		  			}
		  			var queryString = `USE dtpoker;`;
		  			connection.query(queryString, function(err) {
			  			if (err) {
			  				throw err;
			  			}
			  			var queryString = `CREATE TABLE player ( id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, \
	 					name CHAR(140), password CHAR(140), UNIQUE (name) );`;
		  				connection.query(queryString, function(err) {
				  			if (err) {
				  				throw err;
				  			}
				  			var queryString = `INSERT INTO player ( id, name, password ) VALUES (null, 'Bobs', 'UpandDownInTheWater');`;
			  				connection.query(queryString, function(err) {
					  			if (err) {
					  				throw err;
					  			}
			  					connection.release();
			  					return;
					  		});
					  	return;
				  		});
				  	return;
			  		});
			  	return;
			  	});
			  return;
		  	});
		return;
	  	});
	}
}