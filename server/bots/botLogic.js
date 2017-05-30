const handChecker = require('../handChecker');

// Card ranks Ace = value 2 // whereas 2 = value .5
module.exports.setCardRankValue = ()=> {
  let cardRankValue = {};
  for (let i = 1; i <= 9; i++) {
    cardRankValue[i] = 1;
  }
  cardRankValue[10] = 1.05;
  cardRankValue[11] = 1.1;
  cardRankValue[12] = 1.15;
  cardRankValue[13] = 1.25;
  cardRankValue[14] = 1.5;
  return cardRankValue;
}
var cardRankValue = module.exports.setCardRankValue();

// Table in which value of hands like two pair vs flush are represented during pre-flop, flop, turn, and river rounds
    // handRankValue = {
    //   preFlop: {
    //     1: 1,  (scalar/ cardsRevealed[round])
    //     2: .4,
    //     3: .3333,
    //     etc...
    //     9: //type from checkHand()  // 9 is a straight flush
    //   },
    //   flop: {

    //   },
    //   etc...
    // }
module.exports.setHandRankValue = ()=> {
  let highCardValueDropScalar = 1;
  let handRankValue = {
    preFlop: {},
    flop: {},
    turn: {},
    river: {},
  };
  let cardsRevealed = {
    preFlop: 2,
    flop: 5,
    turn: 6,
    river: 7,
  };
  let typeFactor = {
    1: 1,
    2: 1.5,
    3: 1.5,
    4: 2.5,  // there is a bump in how much value increases from 2 pair to 3 of a kind
    5: 1.5,
    6: 1.3,
    7: 3,
    8: Infinity, // 4 of a kind and straight flush have infinite value
    9: Infinity,
  };
  let scalar;
  for (let type = 1; type <= 9; type++ ) {
    // from type 1 (pair) to type 9 (straight flush)
    if (type===1) {
      scalar = 2; //normalizes so card 9, preflop value = 1(rank value) * 2(scalar) /2 *(cards revealed) = 1
    } else {
      scalar = (scalar * (cardRankValue[14]/cardRankValue[1]) ) * typeFactor[type];
      // add type factor to scalar so higher type low rank > lower type high rank and raw strength of type is represented
    }
    for (let round in handRankValue) {
      handRankValue[round][type] = (Math.round(scalar/cardsRevealed[round]*100))/100; 
      // reduce hand value by number of cards revealed
    }
  }
  return handRankValue;
}
var handRankValue = module.exports.setHandRankValue();

module.exports.factorBetAggression = (aggressionLevel, round, handType)=> {
  let roundNames = {
    1: 'preFlop',
    2: 'flop',
    3: 'turn',
    4: 'river',
  };

  let forwardValueFactor = handRankValue[roundNames[Math.max(5-aggressionLevel, round)]][handType];
  let currentValueFactor = handRankValue[roundNames[round]][handType];
  let betAggressionFactor = forwardValueFactor / currentValueFactor; // more aggressive thinks less about future value
  return betAggressionFactor;
}

module.exports.botRandomness = ()=> {

}

module.exports.wouldBetToMilkValue = (aggressionLevel, state, wouldBetAmount)=> {
  let numberOfOtherPlayers = state.playersInHand - 1;
  let potValue = state.potsTotalValue;
  let wouldBetToMilkValue = 0;
  if (!(state.betPlaced)) {
    wouldBetToMilkValue = Math.min(wouldBetAmount, (potValue*(2*(aggressionLevel/4)))); // aggressionLevel 2 factors to 1
  } else {
    // ratio of pot that decreases with more active players
    wouldBetToMilkValue = Math.min(wouldBetAmount, potValue * (state.calledBet+(aggressionLevel-1))/state.calledBet ); 
  }
  return wouldBetToMilkValue/(5-state.round);  // divide by number of rounds remianing
}

module.exports.guageConfidence = (topCardsIndexes, handType)=> {
  let holeCardsInTopCards = {};
  let cardIndexesToInspect = {
    2: 2,  // inspect 2 cards for a pair
    3: 4,  // inspect 4 cards for 2 pair
    4: 3,   // inspect 3 cards for a set
    5: 5,  // inspect 5 cards for a straight
    6: 5,
    7: 5,
    8: 4,
    9: 5,
  }
  if (handType===1) {
    return 1;
  } else {
    let numberOfImportantCards = cardIndexesToInspect[handType];
    for (let i = 0; i < numberOfImportantCards ; i++) {
      let cardIndex = topCardsIndexes[i];
      if (cardIndex===0 || cardIndex===1) { // indexes are hole cards
        holeCardsInTopCards[cardIndex]=true;
      }
    }
  }
  let countImportantHoleCards = Object.keys(holeCardsInTopCards).length;
  return countImportantHoleCards+1;  // 2 important hole cards is 3x confidence
}

module.exports.playTurn = (bot, state)=> {
  let cardsRevealed = {
    1: 2,
    2: 5,
    3: 6,
    4: 7,
  };
  let roundNames = {
    1: 'preFlop',
    2: 'flop',
    3: 'turn',
    4: 'river',
  }
  let roundName = roundNames[state.round];
  let checkedHand = handChecker.checkHand(bot.attributes.holeCards, state.communityCards, cardsRevealed[state.round]);
  let card = bot.attributes.holeCards.concat(state.communityCards)[checkedHand.indexes[0]];
  let suit = card.slice(-1);
  let highCard = card.slice(0,-1);
  if (highCard==='J') {
    highCard = 11;
  } else if (highCard==='Q') {
    highCard = 12;
  } else if (highCard==='K') {
    highCard = 13;
  } else if (highCard==='A') {
    highCard = 14;
  }
  console.log(bot.attributes.holeCards.concat(state.communityCards));
  let handType = checkedHand.type;
  let handRankValueThisRound = handRankValue[roundName][handType];
  let confidence = module.exports.guageConfidence(checkedHand.indexes, handType);
  let handValue = Math.round(state.bigBlindAmount * cardRankValue[highCard] * handRankValueThisRound * confidence * 100)/100;
  console.log('highCard = ', highCard,'CardRankValue = ', cardRankValue[highCard], 'HandRankValue=',handRankValueThisRound, 'confidence', confidence);
  let callAmount = bot.attributes.leftToCall;
  let minRaise = callAmount + state.bigBlindAmount;
  let ifCallRoundCallAmount = callAmount + bot.attributes.callAmountThisRound;
  let ifRaiseRoundRaiseAmount = ifCallRoundCallAmount + state.bigBlindAmount;
  let aggressionLevel = Math.ceil(Math.random()*3); // random from 1 and 4
  let betAggressionFactor = Math.round(module.exports.factorBetAggression(aggressionLevel, state.round, handType)*1000)/1000
  console.log('Aggression level', aggressionLevel, 'Aggression Factor', betAggressionFactor);
  let wouldBetAmount = Math.round(handValue*betAggressionFactor*100)/100;
  wouldBetToMilkAmount = Math.round(module.exports.wouldBetToMilkValue(aggressionLevel, state, wouldBetAmount)*10)/10
  console.log('HandValue/ WouldBet / WouldBet (milkValue) = ', handValue + ' / '+ wouldBetAmount +' / '+ wouldBetToMilkAmount);
  let floorNearestTenDown = Math.floor(wouldBetToMilkAmount/10)*10;

  if (!!callAmount) {
    if (handValue < ifCallRoundCallAmount ) {
      return {fold: true};
    } else {
      if (wouldBetAmount >= ifRaiseRoundRaiseAmount ) {
        if (floorNearestTenDown >= minRaise) {
          return {raise: floorNearestTenDown};
        } else {
          return {call: callAmount};
        }
      } else if (handValue >= ifCallRoundCallAmount) {
        return {call: callAmount};
      }
    }
  } else {
    if (floorNearestTenDown >= state.bigBlindAmount) {
      return {bet: floorNearestTenDown};
    } else {
      return {check: true};
    }
  }
}



