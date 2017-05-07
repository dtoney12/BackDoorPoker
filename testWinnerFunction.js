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

  let copy = (array)=> [].concat(array);

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
    straighFlush: { 
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
      cards: [],
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
      matches.suits[suit].push(i);
      matches.highCards.push(rank);
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
      if (matches.suits[suit].length===5) {
        matches.flush.count++;
        matches.flush.cards.push(copy(matches.flush[suit]));
      };
      // if (matches.suits[suit].length===5) {
      //   matches.flush.count++;
      //   matches.flush.cards.push(copy(matches.flush[suit]));
      // };

    });
    matches.highCards.sort((a,b)=>b-a);
  };
  inspectCard();

  for (var x in matches) {
    if (
        x==='pair' ||
        x==='set' ||
        x==='highCards' ||
        x==='fourOfAKind' ||
        x==='flush'
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
var hole = ['A♥', 'K♥'];
var board = ['K♣', 'A♣', 'A♦', '4♥', '4♣'];
var highfive = getHighFive(hole, board);
console.log(highfive)





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