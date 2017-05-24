'use strict'
const lobby = require('../lobby');
const Promise = require('bluebird');

const Fredinator = new lobby.User();
const LieutenantDan = new lobby.User();
const SuperJunior = new lobby.User();
const MadMarcus = new lobby.User();
const Bobs = new lobby.User();
// const Toms = new lobby.User();
// const Marks = new lobby.User();
// const BenDover = new lobby.User();
// const RandomGuy = new lobby.User();
// const botUsers = [Fredinator, LieutenantDan, SuperJunior, MadMarcus, Bobs, Toms, Marks, BenDover, RandomGuy]
const botUsers = [Fredinator, LieutenantDan, SuperJunior, MadMarcus, Bobs]


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
      editName: 'Bobs UpandDown',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Toms Peeping',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Marks OnYourShirt',
    },
    { 
      sessionId: 'ROBOT',
      password: '123',
      editName: 'Ben Dover',
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

for (var i=0; i<5; i++) {
  module.exports.lobbyBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
  module.exports.getCashBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
  module.exports.getTableCashBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
  module.exports.tableBots.push(Promise.promisify(botUsers[i].set.bind(botUsers[i]),{multiArgs: true}))
}








