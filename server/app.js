'use strict'; 

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const sessions = require('./sessions');
const dbase = require('./db');
var Backbone = require('./non_config/backbone');
// const model = require('./model')
const PORT = process.env.PORT || 3000;
const CLIENT_FILES = path.join(__dirname, '/../public');
console.log('directory = ', __dirname)

console.log('db variable = ', process.env.DATABASE_URL)
const server = express()
.use(express.static(__dirname + '/../public'))
.listen(PORT, () => {
	console.log('\n\n\n\n\n   (((((((((  WELCOME TO DTPOKER SERVER  )))))))))  ');
	console.log(`Listening on ${ PORT }`);
	console.log('\n\n\n\n\n');
	});
const wss = new SocketServer({ server });

dbase.initDbPlayer();	

wss.on('connection', (ws) => {
	var clientID = ws.upgradeReq.rawHeaders[21].slice(0,5);
	console.log('\n' + clientID + ' <---- connected');
	sessions.manage(ws, clientID);
	
});

