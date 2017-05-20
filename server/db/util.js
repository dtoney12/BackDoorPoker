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

  extendKeysToArray: (targetArray, addParamsObject)=> {
    let targetArrayToObject = {};
    targetArray.forEach((element)=> {
      targetArrayToObject[element] = true;
    });
    for (let x in addParamsObject) {
      if (!(x in targetArrayToObject)) {
        targetArray.push(x);
      }
    }
    // console.log('in util, targetArray = ', targetArray)
    return targetArray;
  },

  unExtend: (target, stripParams)=> {  //untested
    for (let x in target) {
      if (x in stripParams) {
        delete target[x];
      }
    }
    return target;
  },

  unExtendFromArray: (targetArray, stripParamsObject)=> {
    return targetArray.reduce((accum, element)=>{
      if (element in stripParamsObject) {
        return accum;
      } else {
        return accum.concat([element]);
      }
    }, []);
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

  integerCardValue: (card)=> {
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

    card = [rank,suit];
    return card;
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