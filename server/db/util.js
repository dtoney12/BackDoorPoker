const Promise = require('bluebird');

module.exports = {
  assign: (template, transfer)=> {
  return Object.assign( JSON.parse(JSON.stringify(template)), transfer);
  },

  copy: (template)=> {
    return Object.assign( JSON.parse(JSON.stringify(template)));
  },

  extend: (target, transfer)=> {
    Object.entries(target).map((T)=>[T[0],transfer[T[0]]||T[1]])
    .forEach((newT)=>{target[newT[0]]=newT[1]});
    return target;
  },

  extendToCopy: (target, transfer)=> {
    var x = Object.assign( JSON.parse(JSON.stringify(target)))
    Object.entries(x).map((T)=>[T[0],transfer[T[0]]||T[1]])
    .forEach((newT)=>{x[newT[0]]=newT[1]});
    return x;
  },

  orderedDeck: ()=> {
    let suits = [ '♥', '♣', '♠', '♦' ];
    let values = [ 'A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K' ];
    let deck = [];

    suits.forEach(function(suit) {
      values.forEach(function(value) {
        deck.push(value + suit);
      });
    });

    return deck;
  },
  
  shuffledDeck: (deck)=> {
    for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    return deck;
  },

  getHighFive: (hole, board)=>{
    let allSeven = hole.concat(board).forEach((card)=>{
      card[0]==='J' && card[0]=11;
      card[0]==='Q' && card[0]=12;
      card[0]==='K' && card[0]=13;
      card[0]==='A' && card[0]=14;
      card[1]==='♥' && card[1]=1;
      card[1]==='♣' && card[1]=2;
      card[1]==='♠' && card[1]=3;
      card[1]==='♦' && card[1]=4;
    })
    let highCard, pair, twoPair, set, straight, flush, fourOfAKind;

    if (flush && straight) {
      
    } else if (fourOfAKind) {

    } else if (pair && set) {

    } else if (flush) {

    } else if (straight) {

    } else if (set) {

    } else if (twoPair) {

    } else if (pair) {

    } else {
      return highCard;
    }

    let getHighCard = (seven)=> {
      return seven.reduce((accum, card)=>,0)
    }
  },

  getWinner: (handsArray)=>{
    
  },
  
  promiseAllTimeout: (promises, timeout, resolvePartial=true)=> {
    return new Promise(function(resolve, reject) {
        let results = [],
            finished = 0,
            numPromises = promises.length;
        let onFinish = function() {
            if (finished < numPromises) {
                if (resolvePartial) {
                    (resolve)(results);
                } else {
                    throw new Error("Not all promises completed within the specified time");
                }
            } else {
                (resolve)(results);
            }
            onFinish = null;
        };
        for (let i = 0; i < numPromises; i += 1) {
            results[i] = undefined;
            promises[i].then(
                function(res) {
                    results[i] = res;
                    finished += 1;
                    if (finished === numPromises && onFinish) {
                        onFinish();
                    }
                },
                reject
            );
        }
        setTimeout(function() {
            if (onFinish) {
                onFinish();
            }
        }, timeout);
    });
  },
}