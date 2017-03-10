'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const model = require('model');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './client/index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  model.table.
  ws.send(new Date().toTimeString());
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
  	var returnObj = {
  		'time': new Date().toTimeString(),
  		''
  	}
    client.send(returnObj);
  });
}, 5000);
