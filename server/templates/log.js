 

module.exports = {
  consoleUserUpdate: ()=> {
    let index = 0;
    return (user, update)=> {
      console.log('\n|------ log # '+index+' -------');
      console.log(user.attributes.username?`| USERNAME: ${user.attributes.username}`:`| ID: ${user.attributes.sessionId}`)
      Object.keys(update).forEach((key)=> console.log(`|   ${key}: ${JSON.stringify(update[key])}`))
      console.log('|----------------------\n');
      index++;
    }
  },
  
  whoIsInRoom: ()=> {
    let index = 0;
    return (room, user, action) => {
      console.log('\n|-------------- log # '+index+' -------------');
      console.log((user.attributes.username?`| USERNAME: ${user.attributes.username}`:`| ID: ${user.attributes.sessionId}`)+`   ${action} ${room.name}.USERS`);
      console.log(' ------------------------------------');
      console.log(`| ||   CURRENT ${room.name}.USERS:`);
      console.log('| ||                          || |');
      console.log('| \\/                          \\/ |');
      console.log(' ---------------------------------');
      room.each((user, i)=> user.attributes.type && console.log(`|   USERNAME: ${user.attributes.username}  ID:  ${user.attributes.sessionId}`));
      console.log('|---------------------------------\n');
      index++;
    }
  },
}