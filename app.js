'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const model = require('./model');
const sessions = require('./sessions');
const PORT = process.env.PORT || 3000;
const CLIENT_FILES = path.join(__dirname, './public');

// Start server
const server = express()
  // .use( (req, res) => {
  // 	res.sendFile(CLIENT_FILES)
  // })
	.use(express.static(__dirname + '/public'))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`) );
const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  sessions.manage(ws);
  ws.on('close', () => console.log('Client disconnected') );
});

// setTimeout(() => {
//   wss.clients.forEach((client) => {
//   	var returnObj = {
//   		'time': new Date().toTimeString()
//   	}
//     client.send(returnObj.time);
//   });
// }, 5000);
