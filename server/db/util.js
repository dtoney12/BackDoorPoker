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
    var suits = [ '♥', '♣', '♠', '♦' ];
    var values = [ 'A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K' ];
    var deck = [];

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