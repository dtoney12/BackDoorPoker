'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const sessions = require('./sessions');
var Backbone = require('backbone');
// const model = require('./model')
const PORT = process.env.PORT || 3000;
const CLIENT_FILES = path.join(__dirname, './public');
							  // .use( (req, res) => {
							  // 	console.log('something else');
							  // })
const server = express()
.use(express.static(__dirname + '/public'))
.listen(PORT, () => console.log(`Listening on ${ PORT }`) );
const wss = new SocketServer({ server });


// const PlayersBb = new model.Players();

wss.on('connection', (ws) => {
	var clientID = ws.upgradeReq.rawHeaders[21].slice(0,5);
	console.log('Client connected', clientID);
	sessions.manage(ws, clientID);
	
});

