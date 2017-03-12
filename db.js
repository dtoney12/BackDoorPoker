var mysql = require('mysql');

var pool = mysql.createPool({
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
			  			console.log('name added to db');
			  			connection.release();
			  		});
	  			} else {
	  				console.log('name exists in db already');
	  				connection.release();
	  			}
		  	})
	  	});
	},
	addPassword: 
}