
module.exports.checkHand = (hole, board)=>{

  let copy = (array)=> array.slice(0);

  let allSeven = hole.concat(board).map((card)=> {
    let suit = card.slice(-1)
    let rank = card.slice(0,-1);
    
    if (parseInt(rank)) {
      rank = parseInt(rank);
    }

    if (rank==='J') {
      rank=11;
    } else if (rank==='Q') {
      rank=12;
    } else if (rank==='K') {
      rank=13;
    } else if (rank==='A') {
      rank=14;
    }

    if (suit==='♥') {
      suit='Hearts';
    } else if (suit==='♣') {
      suit='Clubs';
    } else if (suit==='♠') {
      suit='Spades';
    } else if (suit==='♦') {
      suit='Diamonds';
    }

    card = [rank, suit];
    return card;
  })
  // .sort((a,b)=>b[0]-a[0])

  let matches = {
    suits: {
      index: {
        'Hearts': [],
        'Clubs': [],
        'Spades': [],
        'Diamonds': [],
      },
      hand: {
      'Hearts': [], 
      'Clubs': [],
      'Spades': [],
      'Diamonds': [],
      },
    },
    ranks: {
      2: {cards: [], indexes: []},
      3: {cards: [], indexes: []},
      4: {cards: [], indexes: []},
      5: {cards: [], indexes: []},
      6: {cards: [], indexes: []},
      7: {cards: [], indexes: []},
      8: {cards: [], indexes: []},
      9: {cards: [], indexes: []},
      10: {cards: [], indexes: []},
      11: {cards: [], indexes: []},
      12: {cards: [], indexes: []},
      13: {cards: [], indexes: []},
      14: {cards: [], indexes: []},
    },
    straightFlush: { 
      count: 0,
      cards: {},
    },
    fourOfAKind: { 
      count: 0,
      cards: {},
    },
    fullHouse: { 
      count: 0,
      cards: {},
    },
    flush: { 
      count: 0,
      cards: {},
    },
    straight: { 
      count: 0,
      cards: {},
    },
    set: { 
      count: 0,
      cards: {},
    },
    twoPair: { 
      count: 0,
      cards: [],
    },
    pair: { 
      count: 0,
      cards: {},
    },
    highCards: [],
    returnHighCards: {},
  };

  let inspectCard = ()=> {
    //
    //pairs, sets, fourOfAKind
    //
    allSeven.forEach((card, i)=>{
      let rank = card[0];
      let suit = card[1];
      matches.ranks[rank].cards.push(rank);
      matches.ranks[rank].indexes.push(i);
      matches.highCards.push([rank, suit, i]);
      if (rank===14) matches.highCards.push([1, suit, i])
      let indexes = matches.ranks[rank].indexes;
      let ranks = matches.ranks[rank].cards;
      if (indexes.length===2) { // only grabs first pair of a rank
        matches.pair.count++;
        matches.pair.cards[indexes]=copy(ranks);
        for (let setIndexes in matches.set.cards) {
          let setIndexesArray = setIndexes.split(',')
          let slicedIndexes = setIndexesArray.slice(0,2);
          let indexesString = indexes.toString();
          if (indexesString!==slicedIndexes.toString()) {
            matches.fullHouse.count++;
            fullHouseIndexes = setIndexesArray.concat(indexes);
            fullHouseRanks = matches.set.cards[setIndexes].concat(ranks);
            matches.fullHouse.cards[fullHouseIndexes]=fullHouseRanks;
          }
        }
        // two pair
        if (matches.pair.count >=2) {
          for (let indexesFirst in matches.pair.cards) {
            for (let indexesSecond in matches.pair.cards) {
              if (indexesFirst!==indexesSecond) {
                let twoPairIndexes = indexesFirst+','+indexesSecond;
                if (!(twoPairIndexes in matches.twoPair.cards)) {
                  let twoPairRanks = matches.pair.cards[indexesFirst].concat(matches.pair.cards[indexesSecond])
                  matches.twoPair.count++;
                  matches.twoPair.cards[twoPairIndexes] = twoPairRanks;
                }
              }
            }
          }
        }
      };
      if (indexes.length===3) {
        matches.set.count++;
        matches.set.cards[indexes]=copy(ranks);
        let slicedIndexes = indexes.slice(0,2);
        for (let pairIndexes in matches.pair.cards) {
          if (pairIndexes!==slicedIndexes.toString()) {
            matches.fullHouse.count++;
            fullHouseIndexes = indexes.concat(pairIndexes);
            fullHouseRanks = ranks.concat(matches.pair.cards[pairIndexes]);
            matches.fullHouse.cards[fullHouseIndexes]=fullHouseRanks;
          }
        }
      };

      if (indexes.length===4) {
        matches.fourOfAKind.count++;
        matches.fourOfAKind.cards[indexes]=copy(ranks);
      };
    });
    //
    // highcards, flushes, straights
    //
    matches.highCards.sort((a,b)=>b[0]-a[0])
    let topCard = matches.highCards[0];
    let straight = [[topCard[0]]];
    let straightIndexes = [[topCard[2]]];
    let highCardsRanks = [];
    let highCardsIndexes = [];

    for (var i = 0; i < matches.highCards.length; i++) {
      let copiedDupletsStore = {};
      let straightsLength = straight.length;
      let card = matches.highCards[i];
      let rank = card[0];
      let suit = card[1];
      let index = card[2];

      //process highcards
      if (i<5) {
        highCardsIndexes.push(index);
        highCardsRanks.push(rank);
      }

      // process flushes
      let flushIndexes = matches.suits.index[suit];
      let flush = matches.suits.hand[suit];
      flushIndexes.push(index);
      flush.push(rank)
      if ( (flushIndexes.length===5) && (rank!==1) ) { // rank!==1 to prevent Ace counting twice for 5 suited showing
          matches.flush.count++;
          matches.flush.cards[flushIndexes]=copy(flush)
        } else if (flushIndexes.length>5) {
          let sliceNumber = flushIndexes.length-5
          let nextFlushIndexes = flushIndexes.slice(sliceNumber);
          if (!(nextFlushIndexes in matches.flush.cards)) {
            matches.flush.count++;
            matches.flush.cards[nextFlushIndexes]=flush.slice(sliceNumber);
          }
      }

      if (i >= 1) {
        for (var j = 0; j < straightsLength; j++) {

          //process straights
          let straightJ = straight[j];
          let straightIndexesJ = straightIndexes[j];
          let lastStraightCard = straightJ[straightJ.length-1];
          if (rank===(lastStraightCard-1)) {
            straightJ.push(rank);
            straightIndexesJ.push(index);
          } else if (rank===lastStraightCard) {  //same rank, must make new running straight
              straightJ = copy(straightJ);  
              straightIndexesJ = copy(straightIndexesJ);
              straightJ.pop();
              straightJ.push(rank);
              straightIndexesJ.pop();
              straightIndexesJ.push(index);
              if (!(straightIndexesJ in copiedDupletsStore)) {
                straight.push(straightJ);
                straightIndexes.push(straightIndexesJ);
                copiedDupletsStore[straightIndexesJ]=true;
              }
          } else { 
            straight = [[rank]]
            straightIndexes = [[index]];
            straightJ = straight[0];
            straightIndexesJ = straightIndexes[0];
            straightsLength = straight.length;
          }        

          if (straightJ.length===5 && !(straightIndexesJ in matches.straight.cards)) {
            matches.straight.count++;
            matches.straight.cards[straightIndexesJ]=copy(straightJ);
            if (straightIndexesJ in matches.flush.cards) {
              matches.straightFlush.count++;
              matches.straightFlush.cards[straightIndexesJ]=copy(straightJ);
            }
          } else if (straightJ.length>5) {
            let sliceNumber = straightJ.length-5
            let nextStraightIndexes = straightIndexesJ.slice(sliceNumber);
            if (!(nextStraightIndexes in matches.straight.cards)) {
              matches.straight.count++;
              matches.straight.cards[nextStraightIndexes]=straightJ.slice(sliceNumber);
              if (nextStraightIndexes in matches.flush.cards) {
                matches.straightFlush.count++;
                matches.straightFlush.cards[nextStraightIndexes]=straightJ.slice(sliceNumber)
              }
            }
          }         
        }
      }
    };
    matches.returnHighCards[highCardsIndexes]=copy(highCardsRanks);
  };
  inspectCard();

  // console.log('All Seven:')
  // console.log(hole.concat(board));
  // console.log('HighCards:')
  // console.log(matches.highCards);
  for (var x in matches) {
    if (
        x==='straightFlush' ||
        x==='fourOfAKind' ||
        x==='fullHouse' ||
        x==='flush' ||
        x==='straight' ||
        x==='set' ||
        x==='twoPair' ||
        x==='pair' ||
        x==='highCards'
      ) {
      let spaces = '=';
      for (let i = 0; i < (15-x.length); i++) {
        spaces = spaces.concat(' ');
      }
      // console.log(x+spaces+'\n',matches[x]);
    }
  }
  
  let getHighestOfType = (cardsStore, handRankType)=> {
    let highCard = 0;
    let highIndexes = '';
    for (let indexes in cardsStore) {
      let ranks = cardsStore[indexes];
      let highRank = ranks[0];
      if (highRank > highCard) {
        highCard = highRank;
        highIndexes = indexes;
      }
    }
    // console.log(highCard)
    // fill the remaining slots up to 5 with non-used ranked high cards
    let highIndexesArray = highIndexes.split(',').map((index)=>parseInt(index))
    let highIndexesArrayOriginalLength = highIndexesArray.length
    let numberfillCards = 5-highIndexes.length;
    let fillIndex = 0;
    for (let i = highIndexesArrayOriginalLength; i < 5; i++) {  
      let fillCardFound = false;
      while (!fillCardFound) {
        fillCardFound = true;
        for (var j = 0; j < highIndexesArrayOriginalLength; j++) {
          if (matches.highCards[fillIndex][2]===highIndexesArray[j]) {
            fillCardFound = false;
          }
        }
        if (fillCardFound) {
          let nextHighCard = matches.highCards[fillIndex][2];
          highIndexesArray.push(matches.highCards[fillIndex][2]);
        }
        fillIndex++;
      }
    }

    let results = { 
      indexes: highIndexesArray,
      type: handRankType,
    };

    return results;
  }

  if (matches.straightFlush.count) return getHighestOfType(matches.straightFlush.cards, 9)
  else if (matches.fourOfAKind.count) return getHighestOfType(matches.fourOfAKind.cards, 8)
  else if (matches.fullHouse.count) return getHighestOfType(matches.fullHouse.cards, 7)
  else if (matches.flush.count) return getHighestOfType(matches.flush.cards, 6)
  else if (matches.straight.count) return getHighestOfType(matches.straight.cards, 5)
  else if (matches.set.count) return getHighestOfType(matches.set.cards, 4)
  else if (matches.twoPair.count) return getHighestOfType(matches.twoPair.cards, 3)
  else if (matches.pair.count) return getHighestOfType(matches.pair.cards, 2)
  else return getHighestOfType(matches.returnHighCards, 1);
}

// module.exports.compareAllHands = (handsArray)=> {
//   // each hand formatted as follows:  { indexes: [ 1, 0, 2, 5, 6 ], type: 5 } 
//   handsArray.forEach((hand)=>{
    
//   })
// }
// var deck = shuffledDeck(orderedDeck());
// var hole = [deck.pop(),deck.pop()];
// var board = [deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];

// var hole = ['A♥', 'K♥'];
// var board = ['K♣', '2♥', '3♥', '4♥', '5♥'];
// var hole = ['A♥', 'K♥'];
// var board = ['K♣', 'A♣', 'A♦', '4♥', '4♣'];
// var hole = ['8♥', '7♥'];
// var board = ['6♥', '5♥', '4♥', '3♥', '2♥'];
// var hole = ['A♥', '2♥'];
// var board = ['3♣', '4♣', '5♦', '6♥', '7♣'];
// var hole = ['4♦', '2♦'];
// var board = ['A♥', '7♥', '10♦', '2♣', 'J♣'];
// var hole = ['4♥', '4♣'];
// var board = ['2♥', 'A♣', 'A♦', 'A♥', 'A♠'];
// var hole = ['10♥', 'Q♣'];
// var board = ['10♣', 'J♣', 'K♣', 'A♠', 'A♣'];
// var hole = ['A♥', 'Q♦'];
// var board = ['2♥', 'A♣', 'A♦', 'A♠', 'Q♠'];

// var hole = ['4♥', '5♣'];
// var board = ['3♥', '3♣', '4♦', '2♥', 'A♥'];
// var hole = ['4♥', 'A♣'];
// var board = ['8♥', '8♣', '4♦', '6♥', 'A♥'];

// var highfive = module.exports.checkHand(hole, board);
// console.log('\nBEST HAND (indexes, type) =', highfive,'\n')
// BEST HAND (indexes, type) = { indexes: [ 1, 0, 2, 5, 6 ], type: 5 } 


