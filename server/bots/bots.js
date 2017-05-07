'use strict'
const lobby = require('../lobby');
const Promise = require('bluebird');

const Fred = new lobby.User();
const Dan = new lobby.User();
const SuperJunior = new lobby.User();
const botUsers = [Fred, Dan, SuperJunior]

module.exports = {
  lobbyBots: [],
  getCashBots: [],
  getTableCashBots: [],
  tableBots: [],
  lobbyConfigs: 
    [{
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Fred',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Dan',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Super Junior',
    }],
  getCashConfigs: 
    [{
      getCash: true,
    },
    { 
      getCash: true,
    },
    { 
      getCash: true,
    }],
  getTableCashConfigs: 
    [{
      getTableCash: 1000,
    },
    { 
      getTableCash: 1000,
    },
    { 
      getTableCash: 1000,
    }],
  tableConfigs: 
    [{
      joinTable: true,
    },
    { 
      joinTable: true,
    },
    { 
      joinTable: true,
    }],
}

for (var i=0; i<3; i++) {
  module.exports.lobbyBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
  module.exports.getCashBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
  module.exports.getTableCashBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
  module.exports.tableBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
}

