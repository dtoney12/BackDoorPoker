

module.exports.playTurn = (bot, state)=> {
  let callAmount = bot.attributes.leftToCall;
  if (!!callAmount) {
    return {call: callAmount};
  } else {
    return {check: true};
  }
}




