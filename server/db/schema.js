
module.exports = {
	dropTableUsers: `DROP TABLE IF EXISTS users;`,
	createTableUsers: `CREATE TABLE users ( id INT NOT NULL PRIMARY KEY \ 
		AUTO_INCREMENT, username VARCHAR(255), password VARCHAR(255), \
		firstName VARCHAR(255), lastName VARCHAR(255), email VARCHAR(255), \
		loggedIn BOOLEAN, sessionId VARCHAR(255), room VARCHAR(255), \
		dcRemain INT, phone_number VARCHAR(255), address VARCHAR(255), tableCash INT, \
		accountCash INT, getCashWait INT, tablePosition VARCHAR(255), \
		UNIQUE (username) );`,
 	dropDatabase: `DROP DATABASE IF EXISTS dtpoker;`,
 	createDatabase: `CREATE DATABASE dtpoker;`,
 	useDatabase: `USE dtpoker;`,
 	User: {
    username: null,
    password: null,
    firstName: null,
    lastName: null,
    email: null,
    loggedIn: false,
    sessionId: null,
    room: null,
    dcRemain: 0,
    phone_number: null,
		address: null,
		tableCash: 0,
		accountCash: 0,
		getCashWait: 0,
		tablePosition: null,
	},

}