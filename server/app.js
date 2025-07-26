'use strict'; 
const path = require('path');
const Backbone = require('./non_config/backbone');
const Promise = require('bluebird')
const PORT = process.env.RDS_HOSTNAME && 80 || process.env.PORT || 3001;
// const PORT = 443;
const CLIENT_FILES = path.join(__dirname, '/../public');
const express = require('express');
const server = express()
.use(express.static(__dirname + '/../public'))
.listen(PORT, () => {
	console.log('\n\n\n\n\n   (((((((((  WELCOME TO DTPOKER SERVER  )))))))))  ');
	console.log(`Listening on ${ PORT }`);
	console.log('\n\n\n\n\n');
});
const SocketServer = require('ws').Server;
const wss = new SocketServer({ server });
const lobby = require('./lobby')



wss.on('connection', 
	(ws, req) => {
		var user = new lobby.User();
		user.ws = ws;
		ws.upgradeReq = req;
		user.set({sessionId: ws.upgradeReq.rawHeaders[21].slice(0,5)});  // set sessionId
		ws.on('message', (received)=> user.handleInput(JSON.parse(received)));
		ws.on('close', ()=>{
      delete user.ws;
      user.attributes.loggedIn && user.handleInput({disconnect: true})
    });
});

