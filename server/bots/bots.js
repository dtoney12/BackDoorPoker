'use strict'
const lobby = require('../lobby');
const Promise = require('bluebird');

const Fredinator = new lobby.User();
const LieutenantDan = new lobby.User();
const SuperJunior = new lobby.User();
const MadMarcus = new lobby.User();
const Tinkerer = new lobby.User();
const TommyBoy = new lobby.User();
const Marks = new lobby.User();
const Benz = new lobby.User();
const RandomGuy = new lobby.User();
const botUsers = [Fredinator, LieutenantDan, SuperJunior, MadMarcus, Tinkerer, TommyBoy, Marks, Benz, RandomGuy]
// const botUsers = [Fredinator, LieutenantDan, SuperJunior, MadMarcus, Tinkerer]


module.exports = {
  lobbyBots: [],
  getCashBots: [],
  getTableCashBots: [],
  tableBots: [],
  lobbyConfigs: 
    [{
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Fredinator',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Lieutenant Dan',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Super Junior',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Mad Marcus',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Tinkerer',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'TommyBoy',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Marks OnYourShirt',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Benz',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Random Guy',
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
    },
    { 
      getCash: true,
    },
    { 
      getCash: true,
    },
    { 
      getCash: true,
    },
    { 
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
    },
    { 
      getTableCash: 1000,
    },
    { 
      getTableCash: 1000,
    },
    { 
      getTableCash: 1000,
    },
    { 
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
    },
    { 
      joinTable: true,
    },
    { 
      joinTable: true,
    },
    { 
      joinTable: true,
    },
    { 
      joinTable: true,
    },
    { 
      joinTable: true,
    },
    { 
      joinTable: true,
    }],                
}

for (var i=0; i<8; i++) {
  module.exports.lobbyBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
  module.exports.getCashBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
  module.exports.getTableCashBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
  module.exports.tableBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
}








