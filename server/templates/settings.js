module.exports = {
  default_user: {
    type: 'user',
    username: '',
    editName: '',
    password: '',
    sessionId: '',
    room: null,
    seat: null,
    loggedIn: false,
    logout: false,
    clientReady: false,
    clientReceived: false,
    accountCash: 0,
    getCash: false,
    getTableCash: -1,  // this must be a number for Number.isInteger check on handleInput
    getCashWait: 0,
    rejoinWaitTimer: 0,
    message: '',
    chats: [],
    update: 'nothing to report',
    dcRound: 0,
    dcRemain: 1,
    inFilter: [],
    outFilter: [],

    tableCash: 0,
    playerAction: {},
    playerState: null,
    holeCards: [],
    winningCards: [false,false,false,false,false,false,false], 
    post: 0,
    check: false,     
    call: 0,
    bet: 0,
    raise: 0,
    fold: false,
    allIn: 0,
    addToPot: 0,
    show: false,
    muck: false,
    leftToCall: 0,
    callAmountThisRound: 0,

    sitOut: false,
    joinTable: false,
    leaveTable: false,
    disconnect: false,
    topFiveCards: null,
    topFiveCardsStrings: null,
    topFiveCardIndexes: null,
    topFiveCardsType: null,
    seat1: {},
    seat2: {},
    seat3: {},
    seat4: {},
    seat5: {},
    seat6: {},
    seat7: {},
    seat8: {},
    seat9: {},
    seat10: {},
    filters: {
      in: {
        editName: true,
        password: true,
        getCash: true,
        getTableCash: true,
        joinTable: true,
        message: true,
        logout: true,
        disconnect: true,
        clientReady: true,
      },
      out: {
        username: true,
        loggedIn: true,
        code: true,
        status: true,
        room: true,
        seat: true,
        dealer: true,
        turn: true,
        accountCash: true,
        // tableCash: true,
        playerAction: true,
        playerState: true,
        chats: true,
        update: true,
        rejoinWaitTimer: true,
        holeCards: true,
        dcRound: true,
        dcRemain: true,
        seat1: true,
        seat2: true,
        seat3: true,
        seat4: true,
        seat5: true,
        seat6: true,
        seat7: true,
        seat8: true,
        seat9: true,
        seat10: true,
      },
    },
  },
  dbUser: {
    username: '',

  },
  lobby: {
    name: 'LOBBY',
    type: 'lobby',
  },
  table1: {
    type: 'table',
    name: 'TABLE1',
    pollTimer: 1000,
    pollForStartTimer: null,
    checkedBet: 0,
    // currentBet: 0,  // need to compare bet against currentBet to start sidePots
    addToPot: 0,
    emptySeats: [1,2,3,4,5,6,7,8,9,10],
    leaveQueue: [],
    leaveQueueHash: {},
    joinQueue: [],
    joinQueueHash: {},
    disconnectQueue: [],
    disconnectQueueHash: {},
    seat: { // empty = null for takeSeats()
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
      9: null,
      10: null,
    },
  },
  state: {
    dealer: null,
    deck: [],
    update: '',
    communityCards: [],
    smallBlindSeat: null,
    bigBlindSeat: null,
    smallBlindAmount: 10,
    bigBlindAmount: 20,
    playersInHand: 0,
    betPlaced: false,
    checkedBet: 0,
    calledBet: 0,
    allInBet: 0,
    calledBetIncrementTypes: {
      bet: true,
      call: true,
      raise: true,
    },
    turnCounter: 0,
    roundOnlyPotsCallValue: 0,
    beginRoundPotsCallValue: 0,
    potsBeginRound: [{
      value: 0,
    }],
    pots: [{ 
      value: 0,
      callAmount: 0,
      sidePot: false,
      nextPotIndex: null,
      winners: null,
      playersInPot: {}, //   { seat: { playerName: username, holeCards: [hole cards], }
    }],
    round: 0,
    roundNames: {
      1: 'Pre-Flop',
      2: 'Flop',
      3: 'Turn',
      4: 'River',
      5: 'Select Winner',
    },
    turn: null,
    filterForTurn: {},
    filters: {
      inDefault: {
          clientReady: true,
          message: true,
          leaveTable: true,
          disconnect: true,
          pause: true,
          unpause: true,
      },
      preFlopNoRaise: {
        call: true,
        bet: true,
        fold: true,
        allIn: true,
      },
      preFlopPostRaise: {
        call: true,
        raise: true,
        fold: true,
        allIn: true,
      },
      flopNoBet: {
        check: true,
        bet: true,
        fold: true,
        allIn: true,
      },
      flopPostBet: {
        call: true,
        raise: true,
        fold: true,
        allIn: true,
      },
      showDown: {
        show: true,
        noShow: true,
        much: true,
      },
      otherPlayerOut: {
        username: true,
        tableCash: true,
        playerAction: true,
        playerState: true,
      }
    },
    waitForTurn: null,
    turnTimer: 40000,
    turnTimerRobot: 1000,
    waitBeforeDeclareWinners: null,
    waitBeforeDeclareWinnersTimer: 500,
    waitAfterLastPlayOfRound: null,
    waitAfterLastPlayOfRoundTimer: 1500,
    waitBetweenRounds: null,
    waitBetweenRoundsTimer: 2500,
    waitBetweenHands: null,
    waitBetweenHandsTimer: 3000,
    waitBetweenWinners: null,
    waitBetweenWinnersTimer: 1500,
    waitForTransitions: null,
    transitionsTimer: 1000,
    announcementSetInterval: null,
    announcementSetIntervalTimer: 1000,
    announcementClearIntervalDuration: 4000,

    seat: { // empty = null for takeSeats()  
      1: null, // seats are player.attributes reference
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
      9: null,
      10: null,
    },
  }
}

