// var orderedDeck = ()=> {
//     let suits = [ '♥', '♣', '♠', '♦' ];
//     let values = [ 'A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K' ];
//     let deck = [];

//     suits.forEach(function(suit) {
//       values.forEach(function(value) {
//         deck.push(value + suit);
//       });
//     });

//     return deck;
//   }
// ['A♥', 'K♥', 'K♣', '2♥', '3♥', '4♥', '5♥']

// var shuffledDeck = (deck)=> {
//     for (var i = deck.length - 1; i > 0; i--) {
//         var j = Math.floor(Math.random() * (i + 1));
//         var temp = deck[i];
//         deck[i] = deck[j];
//         deck[j] = temp;
//     }
//     return deck;
//   }

// var getHighFive = (hole, board)=>{

//   let copy = (array)=> array.slice(0);

//   let allSeven = hole.concat(board).map((card, i)=>{
//     let suit = card.slice(-1)
//     let rank = card.slice(0,-1);
//     if (parseInt(rank)) rank = parseInt(rank);
//     if (rank==='J') rank=11;
//     if (rank==='Q') rank=12;
//     if (rank==='K') rank=13;
//     if (rank==='A') rank=14;
//     if (suit==='♥') suit='Hearts';
//     if (suit==='♣') suit='Clubs';
//     if (suit==='♠') suit='Spades';
//     if (suit==='♦') suit='Diamonds';
//     card = [rank, suit]
//     return card;
//   })

//   let matches = {
//     suits: {
//       'Hearts': [], 
//       'Clubs': [],
//       'Spades': [],
//       'Diamonds': [],
//     },
//     ranks: {
//       2: [],
//       3: [],
//       4: [],
//       5: [],
//       6: [],
//       7: [],
//       8: [],
//       9: [],
//       10: [],
//       11: [],
//       12: [],
//       13: [],
//       14: [],
//     },
//     straightFlush: { 
//       count: 0,
//       cards: [],
//     },
//     fourOfAKind: { 
//       count: 0,
//       cards: [],
//     },
//     fullHouse: { 
//       count: 0,
//       cards: [],
//     },
//     flush: { 
//       count: 0,
//       cards: [],
//     },
//     straight: { 
//       count: 0,
//       cards: {},
//     },
//     set: { 
//       count: 0,
//       cards: [],
//     },
//     twoPair: { 
//       count: 0,
//       cards: [],
//     },
//     pair: { 
//       count: 0,
//       cards: [],
//     },
//     highCards: [],
//   };

//   let inspectCard = ()=> {
//     allSeven.forEach((card, i)=>{
//       let rank = card[0];
//       let suit = card[1];
//       matches.ranks[rank].push(i);
//       matches.highCards.push([rank, suit, i]);
//       if (rank===14) matches.highCards.push([1, suit, i])
//       if (matches.ranks[rank].length===2) {
//         matches.pair.count++;
//         matches.pair.cards.push(copy(matches.ranks[rank]));
//       };
//       if (matches.ranks[rank].length===3) {
//         matches.set.count++;
//         matches.set.cards.push(copy(matches.ranks[rank]));
//       };
//       if (matches.ranks[rank].length===4) {
//         matches.fourOfAKind.count++;
//         matches.fourOfAKind.cards.push(copy(matches.ranks[rank]));
//       };
//     });

//     matches.highCards.sort((a,b)=>b[0]-a[0]);
//     console.log(matches.highCards);
//     let topCard = matches.highCards[0];
//     let rank = topCard[0];
//     // let suit = topCard[1];
//     // let index = topCard[2];
//     let straights = {};
//     let straight = [topCard[0]];
//     let flushes = {};
//     let flush = [topCard[1]];
//     let straightIndex = [topCard[2]];
//     let flushIndex = [topCard[2]];
//     let lastCard = rank;

//     matches.highCards.forEach((card, i, cards)=>{
//       let rank = card[0];
//       let suit = card[1];
//       let index = card[2];
//       if (i >= 1) {
//         if (rank===(lastCard-1)) {
//           straight.push(rank); 
//           straightIndex.push(index);
//           straights[copy(straightIndex)] = copy(straight);
//         } else if (rank===lastCard) {  // duplicates
//           straight.pop();
//           straight.push(rank);
//           straightIndex.pop();
//           straightIndex.push(rank);
//           straights[copy(index)] = copy(straight);
//         } else {
//           straight = [rank];
//           straightIndex = [index];
//         }

//         if (matches.suits[suit].length===5) {
//           matches.flush.count++;
//           flushIndexes = copy(matches.suits[suit])
//           matches.flush.cards.push(flushIndexes);
//         }

//         if (straight.length===5 && !(straightIndexes in matches.straight.cards)) {
//           matches.straight.count++;
//           matches.straight.cards[straightIndexes]=copy(straight);
//           if (matches.flush.count && (JSON.stringify(matches.flush.cards[0])==JSON.stringify(straightIndexes))) {
//             matches.straightFlush.count++;
//             matches.straightFlush.cards.push(copy(straightIndexes));
//           }
//         } else if (straight.length===6) {
//           let nextStraightIndexes = straightIndexes.slice(1);
//           if (!(nextStraightIndexes in matches.straight.cards)) {
//             matches.straight.count++;
//             matches.straight.cards[nextStraightIndexes]=straight.slice(1);
//             if (matches.flush.count && (JSON.stringify(matches.flush.cards[0])===JSON.stringify(nextStraightIndexes))) {
//               matches.straightFlush.count++;
//               matches.straightFlush.cards.push(copy(nextStraightIndexes));
//             }
//           }
//         } else if (straight.length===7) {
//           let nextStraightIndexes = straightIndexes.slice(2);
//           if (!(nextStraightIndexes in matches.straight.cards)) {
//             matches.straight.count++;
//             matches.straight.cards[nextStraightIndexes]=straight.slice(2);
//             if (matches.flush.count && (JSON.stringify(matches.flush.cards[0])===JSON.stringify(nextStraightIndexes))) {
//               matches.straightFlush.count++;
//               matches.straightFlush.cards.push(copy(nextStraightIndexes));
//             }
//           }
//         }
//       }
//     });
//   };
//   inspectCard();

//   for (var x in matches) {
//     if (
//         x==='pair' ||
//         x==='set' ||
//         // x==='highCards' ||
//         x==='fourOfAKind' ||
//         x==='flush' ||
//         x==='straight' ||
//         x==='straightFlush'
//       ) {
//       let spaces = '=';
//       for (let i = 0; i < (15-x.length); i++) {
//         spaces = spaces.concat(' ');
//       }
//       console.log(x+spaces,matches[x]);
//     }
//   }
//   return allSeven;
// }

// // var deck = shuffledDeck(orderedDeck());
// // var hole = [deck.pop(),deck.pop()];
// // var board = [deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];

// // var hole = ['A♥', 'K♥'];
// // var board = ['K♣', '2♥', '3♥', '4♥', '5♥'];
// // var hole = ['A♥', 'K♥'];
// // var board = ['K♣', 'A♣', 'A♦', '4♥', '4♣'];
// var hole = ['A♥', 'Q♣'];
// var board = ['9♥', '5♥', '4♥', '3♥', '2♥'];
// // var hole = ['A♥', '2♥'];
// // var board = ['3♣', '4♣', '5♦', '6♥', '7♣'];
// var highfive = getHighFive(hole, board);
// // console.log(highfive)





  // if (flush && straight) {
    
  // } else if (fourOfAKind) {

  // } else if (pair && set) {

  // } else if (flush) {

  // } else if (straight) {

  // } else if (set) {

  // } else if (twoPair) {

  // } else if (pair) {

  // } else {
  //   // return highCard;
  // }




//   var orderedDeck = ()=> {
//     let suits = [ '♥', '♣', '♠', '♦' ];
//     let values = [ 'A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K' ];
//     let deck = [];

//     suits.forEach(function(suit) {
//       values.forEach(function(value) {
//         deck.push(value + suit);
//       });
//     });

//     return deck;
//   }
// ['A♥', 'K♥', 'K♣', '2♥', '3♥', '4♥', '5♥']

// var shuffledDeck = (deck)=> {
//     for (var i = deck.length - 1; i > 0; i--) {
//         var j = Math.floor(Math.random() * (i + 1));
//         var temp = deck[i];
//         deck[i] = deck[j];
//         deck[j] = temp;
//     }
//     return deck;
//   }

// var getHighFive = (hole, board)=>{

//   let copy = (array)=> array.slice(0);

//   let allSeven = hole.concat(board).map((card, i)=>{
//     let suit = card.slice(-1)
//     let rank = card.slice(0,-1);
//     if (parseInt(rank)) rank = parseInt(rank);
//     if (rank==='J') rank=11;
//     if (rank==='Q') rank=12;
//     if (rank==='K') rank=13;
//     if (rank==='A') rank=14;
//     if (suit==='♥') suit='Hearts';
//     if (suit==='♣') suit='Clubs';
//     if (suit==='♠') suit='Spades';
//     if (suit==='♦') suit='Diamonds';
//     card = [rank, suit]
//     return card;
//   })

//   let matches = {
//     suits: {
//       'Hearts': [], 
//       'Clubs': [],
//       'Spades': [],
//       'Diamonds': [],
//     },
//     ranks: {
//       2: [],
//       3: [],
//       4: [],
//       5: [],
//       6: [],
//       7: [],
//       8: [],
//       9: [],
//       10: [],
//       11: [],
//       12: [],
//       13: [],
//       14: [],
//     },
//     straightFlush: { 
//       count: 0,
//       cards: [],
//     },
//     fourOfAKind: { 
//       count: 0,
//       cards: [],
//     },
//     fullHouse: { 
//       count: 0,
//       cards: [],
//     },
//     flush: { 
//       count: 0,
//       cards: [],
//     },
//     straight: { 
//       count: 0,
//       cards: {},
//     },
//     set: { 
//       count: 0,
//       cards: [],
//     },
//     twoPair: { 
//       count: 0,
//       cards: [],
//     },
//     pair: { 
//       count: 0,
//       cards: [],
//     },
//     highCards: [],
//   };

//   let inspectCard = ()=> {
//     allSeven.forEach((card, i)=>{
//       let rank = card[0];
//       let suit = card[1];
//       matches.ranks[rank].push(i);
//       matches.highCards.push([rank, suit, i]);
//       if (rank===14) matches.highCards.push([1, suit, i])
//       if (matches.ranks[rank].length===2) {
//         matches.pair.count++;
//         matches.pair.cards.push(copy(matches.ranks[rank]));
//       };
//       if (matches.ranks[rank].length===3) {
//         matches.set.count++;
//         matches.set.cards.push(copy(matches.ranks[rank]));
//       };
//       if (matches.ranks[rank].length===4) {
//         matches.fourOfAKind.count++;
//         matches.fourOfAKind.cards.push(copy(matches.ranks[rank]));
//       };
//     });

//     matches.highCards.sort((a,b)=>b[0]-a[0]);
//     console.log(matches.highCards);
//     let topCard = matches.highCards[0];
//     let straight = [[topCard[0]]];
//     let straightIndexes = [[topCard[2]]];
//     let flush = [topCard[1]];
//     let flushIndexes = [topCard[2]];
//     for (var i = 0; i < matches.highCards.length; i++) {
//     // matches.highCards.forEach((card, i, cards)=>{
//       let straightsLength = straight.length;
//       console.log('ROUND I=',i)
//       if (i >= 1) {
//         for (var j = 0; j < straightsLength; j++) {
//           if (j > 10) {
//             console.log('XXXX LOOPING XXXX')
//             return;
//           }
//           let card = matches.highCards[i];
//           let rank = card[0];
//           let suit = card[1];
//           let index = card[2];
//           let straightJ = straight[j];
//           let straightIndexesJ = straightIndexes[j];
//           let lastStraightCard = straightJ[straightJ.length-1];
//           let lastFlushCard = flush[flush.length-1];
//           if (rank===(lastStraightCard-1)) {
//             straightJ.push(rank);
//             straightIndexesJ.push(index);
//             console.log('straightJ', straightJ, 'newStraightIndexes', straightIndexes,'j=',j)
//           } else if (rank===lastStraightCard) {  //same rank, must make new running straight
//             straightJ = copy(straightJ);
//             straightIndexesJ = copy(straightIndexesJ);
//             straightJ.pop();
//             straightJ.push(rank);
//             straightIndexesJ.pop();
//             straightIndexesJ.push(index);
//             straight.push(straightJ);
//             straightIndexes.push(straightIndexesJ);
//             console.log('new straightJ', straight, 'StraightIndexes', straightIndexes,'j=',j)
//             console.log('               big straight', straight, 'j=',j)
//           } else {
//             straight[j] = [rank];
//             straightJ = straight[j];
//             straightIndexes[j] = [index];
//             straightIndexesJ = straightIndexes[j];
//           }

//           // if (suit===(lastFlushCard)) {

//           // }
//           if (straightJ.length===5 && !(straightIndexesJ in matches.straight.cards)) {
//             matches.straight.count++;
//             matches.straight.cards[straightIndexesJ]=copy(straightJ);
//             console.log('copy J version', j, straightIndexesJ)
//             // if (matches.flush.count && (JSON.stringify(matches.flush.cards[0])==JSON.stringify(straightIndexes))) {
//             //   matches.straightFlush.count++;
//             //   matches.straightFlush.cards.push(copy(straightIndexes));
//             // }
//           } else if (straightJ.length===6) {
//             let nextStraightIndexes = straightIndexesJ.slice(1);
//             if (!(nextStraightIndexes in matches.straight.cards)) {
//               matches.straight.count++;
//               matches.straight.cards[nextStraightIndexes]=straightJ.slice(1);
//               // if (matches.flush.count && (JSON.stringify(matches.flush.cards[0])===JSON.stringify(nextStraightIndexes))) {
//               //   matches.straightFlush.count++;
//               //   matches.straightFlush.cards.push(copy(nextStraightIndexes));
//               // }
//             }
//           } else if (straightJ.length===7) {
//             let nextStraightIndexes = straightIndexesJ.slice(2);
//             if (!(nextStraightIndexes in matches.straight.cards)) {
//               matches.straight.count++;
//               matches.straight.cards[nextStraightIndexes]=straightJ.slice(2);
//               // if (matches.flush.count && (JSON.stringify(matches.flush.cards[0])===JSON.stringify(nextStraightIndexes))) {
//               //   matches.straightFlush.count++;
//               //   matches.straightFlush.cards.push(copy(nextStraightIndexes));
//               // }
//             }
//           }
//         }
//       }
//     };
//   };
//   inspectCard();

//   for (var x in matches) {
//     if (
//         x==='pair' ||
//         x==='set' ||
//         // x==='highCards' ||
//         x==='fourOfAKind' ||
//         x==='flush' ||
//         x==='straight' ||
//         x==='straightFlush'
//       ) {
//       let spaces = '=';
//       for (let i = 0; i < (15-x.length); i++) {
//         spaces = spaces.concat(' ');
//       }
//       console.log(x+spaces,matches[x]);
//     }
//   }
//   return allSeven;
// }

// // var deck = shuffledDeck(orderedDeck());
// // var hole = [deck.pop(),deck.pop()];
// // var board = [deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];

// // var hole = ['A♥', 'K♥'];
// // var board = ['K♣', '2♥', '3♥', '4♥', '5♥'];
// // var hole = ['A♥', 'K♥'];
// // var board = ['K♣', 'A♣', 'A♦', '4♥', '4♣'];
// // var hole = ['A♥', 'Q♣'];
// // var board = ['9♥', '5♥', '4♥', '3♥', '2♥'];
// // var hole = ['A♥', '2♥'];
// // var board = ['3♣', '4♣', '5♦', '6♥', '7♣'];
// // var hole = ['A♥', 'K♣'];
// // var board = ['K♥', 'Q♥', '11♦', '10♥', '10♣'];
// var hole = ['4♥', '5♣'];
// var board = ['2♥', 'A♥', 'A♦', 'A♠', 'A♣'];

// var highfive = getHighFive(hole, board);
// // console.log(highfive)



  var orderedDeck = ()=> {
    let suits = [ '♥', '♣', '♠', '♦' ];
    let values = [ 'A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K' ];
    let deck = [];

    suits.forEach(function(suit) {
      values.forEach(function(value) {
        deck.push(value + suit);
      });
    });

    return deck;
  }
['A♥', 'K♥', 'K♣', '2♥', '3♥', '4♥', '5♥']

var shuffledDeck = (deck)=> {
    for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    return deck;
  }

var getHighFive = (hole, board)=>{

  let copy = (array)=> array.slice(0);

  let allSeven = hole.concat(board).map((card, i)=>{
    let suit = card.slice(-1)
    let rank = card.slice(0,-1);
    if (parseInt(rank)) rank = parseInt(rank);
    if (rank==='J') rank=11;
    if (rank==='Q') rank=12;
    if (rank==='K') rank=13;
    if (rank==='A') rank=14;
    if (suit==='♥') suit='Hearts';
    if (suit==='♣') suit='Clubs';
    if (suit==='♠') suit='Spades';
    if (suit==='♦') suit='Diamonds';
    card = [rank, suit]
    return card;
  })

  let matches = {
    suits: {
      'Hearts': [], 
      'Clubs': [],
      'Spades': [],
      'Diamonds': [],
    },
    ranks: {
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      10: [],
      11: [],
      12: [],
      13: [],
      14: [],
    },
    straightFlush: { 
      count: 0,
      cards: [],
    },
    fourOfAKind: { 
      count: 0,
      cards: [],
    },
    fullHouse: { 
      count: 0,
      cards: [],
    },
    flush: { 
      count: 0,
      cards: [],
    },
    straight: { 
      count: 0,
      cards: {},
    },
    set: { 
      count: 0,
      cards: [],
    },
    twoPair: { 
      count: 0,
      cards: [],
    },
    pair: { 
      count: 0,
      cards: [],
    },
    highCards: [],
  };

  let inspectCard = ()=> {
    allSeven.forEach((card, i)=>{
      let rank = card[0];
      let suit = card[1];
      matches.ranks[rank].push(i);
      matches.highCards.push([rank, suit, i]);
      if (rank===14) matches.highCards.push([1, suit, i])
      if (matches.ranks[rank].length===2) {
        matches.pair.count++;
        matches.pair.cards.push(copy(matches.ranks[rank]));
      };
      if (matches.ranks[rank].length===3) {
        matches.set.count++;
        matches.set.cards.push(copy(matches.ranks[rank]));
      };
      if (matches.ranks[rank].length===4) {
        matches.fourOfAKind.count++;
        matches.fourOfAKind.cards.push(copy(matches.ranks[rank]));
      };
    });

    matches.highCards.sort((a,b)=>b[0]-a[0]);
    console.log(matches.highCards);
    let topCard = matches.highCards[0];
    let straight = [[topCard[0]]];
    let straightIndexes = [[topCard[2]]];
    let flush = [topCard[1]];
    let flushIndexes = [topCard[2]];
    for (var i = 0; i < matches.highCards.length; i++) {
      let copiedDupletsStore = {};
    // matches.highCards.forEach((card, i, cards)=>{
      let straightsLength = straight.length;
      // console.log('\n\nROUND I=',i)
      if (i >= 1) {
        for (var j = 0; j < straightsLength; j++) {
          if (j > 10) {
            console.log('XXXX LOOPING XXXX')
            return;
          }
          let card = matches.highCards[i];
          let rank = card[0];
          let suit = card[1];
          let index = card[2];
          let straightJ = straight[j];
          let straightIndexesJ = straightIndexes[j];
          let lastStraightCard = straightJ[straightJ.length-1];
          let lastFlushCard = flush[flush.length-1];
          // let lastStraightIndex= straightIndexes[straightIndexes.length-1]  
          // let lastStraightIndexLastIndex = lastStraightIndex[lastStraightIndex.length-1]
          // console.log('straightJ =', straightJ);
          // console.log('rank =', rank, 'lastStraightCard =', lastStraightCard)
          if (rank===(lastStraightCard-1)) {
            straightJ.push(rank);
            straightIndexesJ.push(index);
            // console.log('straightJ', straightJ, 'newStraightIndexes', straightIndexes,'j=',j)
          } else if (rank===lastStraightCard) {  //same rank, must make new running straight
            // console.log('copiedDupletsStore =', copiedDupletsStore);
            // if (lastStraightIndexLastIndex!==index) { // must check for repeat new straights (when straightJ.length === 1)
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
              // console.log('new straightJ', straight, 'StraightIndexes', straightIndexes,'j=',j)
              // console.log('               big straight', straight, 'j=',j)
            // }
          } else { 
            // if (lastStraightIndexLastIndex!==index || lastStraightIndex.length>1) {
            straight = [[rank]]
            straightIndexes = [[index]];
            straightJ = straight[0];
            straightIndexesJ = straightIndexes[0];
            straightsLength = straight.length;
            // console.log('last if block straightJ', straight, 'last if block StraightIndexes', straightIndexes,'j=',j)
            // console.log('               big straight', straight, 'j=',j)
            // }
          }

          // if (suit===(lastFlushCard)) {

          // }
          if (straightJ.length===5 && !(straightIndexesJ in matches.straight.cards)) {
            matches.straight.count++;
            matches.straight.cards[straightIndexesJ]=copy(straightJ);
            // console.log('copy J version', j, straightIndexesJ)
            // if (matches.flush.count && (JSON.stringify(matches.flush.cards[0])==JSON.stringify(straightIndexes))) {
            //   matches.straightFlush.count++;
            //   matches.straightFlush.cards.push(copy(straightIndexes));
            // }
          } else if (straightJ.length===6) {
            let nextStraightIndexes = straightIndexesJ.slice(1);
            if (!(nextStraightIndexes in matches.straight.cards)) {
              matches.straight.count++;
              matches.straight.cards[nextStraightIndexes]=straightJ.slice(1);
              // if (matches.flush.count && (JSON.stringify(matches.flush.cards[0])===JSON.stringify(nextStraightIndexes))) {
              //   matches.straightFlush.count++;
              //   matches.straightFlush.cards.push(copy(nextStraightIndexes));
              // }
            }
          } else if (straightJ.length===7) {
            let nextStraightIndexes = straightIndexesJ.slice(2);
            if (!(nextStraightIndexes in matches.straight.cards)) {
              matches.straight.count++;
              matches.straight.cards[nextStraightIndexes]=straightJ.slice(2);
              // if (matches.flush.count && (JSON.stringify(matches.flush.cards[0])===JSON.stringify(nextStraightIndexes))) {
              //   matches.straightFlush.count++;
              //   matches.straightFlush.cards.push(copy(nextStraightIndexes));
              // }
            }
          }
        }
      }
    };
  };
  inspectCard();

  for (var x in matches) {
    if (
        x==='pair' ||
        x==='set' ||
        // x==='highCards' ||
        x==='fourOfAKind' ||
        x==='flush' ||
        x==='straight' ||
        x==='straightFlush'
      ) {
      let spaces = '=';
      for (let i = 0; i < (15-x.length); i++) {
        spaces = spaces.concat(' ');
      }
      console.log(x+spaces,matches[x]);
    }
  }
  return allSeven;
}

// var deck = shuffledDeck(orderedDeck());
// var hole = [deck.pop(),deck.pop()];
// var board = [deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];

// var hole = ['A♥', 'K♥'];
// var board = ['K♣', '2♥', '3♥', '4♥', '5♥'];
// var hole = ['A♥', 'K♥'];
// var board = ['K♣', 'A♣', 'A♦', '4♥', '4♣'];
// var hole = ['A♥', 'Q♣'];
// var board = ['9♥', '5♥', '4♥', '3♥', '2♥'];
// var hole = ['A♥', '2♥'];
// var board = ['3♣', '4♣', '5♦', '6♥', '7♣'];
// var hole = ['A♥', 'K♣'];
// var board = ['K♥', 'Q♥', '11♦', '10♥', '10♣'];
// var hole = ['4♥', '4♣'];
// var board = ['2♥', 'A♥', 'A♦', '3♠', '5♣'];
var hole = ['10♥', 'Q♣'];
var board = ['10♣', 'J♥', 'K♦', 'A♠', 'A♣'];

// var hole = ['Q♥', 'Q♣'];
// var board = ['K♥', 'K♥', 'K♦', 'A♠', 'A♣'];

var highfive = getHighFive(hole, board);
// console.log(highfive)