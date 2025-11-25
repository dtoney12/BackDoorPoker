'use strict';
import React from 'react';
import { createRoot } from 'react-dom/client'
import tableImg from './images/table.jpg';
import CommunityCards from './community-cards.jsx';
import Seat from './Seat.jsx';
import Pots from './pots.jsx';
import Inputs from './inputs.jsx';

class TableView extends React.Component {
    constructor(props) {
        super();
        this.state = {
            username: null,
            loggedIn: 0,
            clientReceived: false,
            code: null,
            status: '',
            room: null,
            seat: null,
            dealer: null,
            turn: null,
            update: '',
            inputOptions: {},
            tempInputOptions: {
                call: 50,
                raise: 100,
                fold: true,
                check: true,
                },
            accountCash: 0,
            tableCash: 0,
            potsBeginRound: [],
            pots: [],
            roundOnlyPotsCallValue: 0,
            winners: [],
            chats: [],
            holeCards: [],
            communityCards: [],
            winningCommunityCards: [],
            rejoinWaitTimer: 0,
            leftTable: false,
            showdown: true,
            deck: {},
            1:  {
                username: null,
                tableCash: 0,
                playerAction: '',
                playerState: '',
                holeCards: [],
                winningCards: [],
                location: 'bottom',
                },
            2:  {
                username: '',
                tableCash: 0,
                playerAction: '',
                playerState: '',
                holeCards: [],
                winningCards: [],
                location: 'bottom-left',
                },
            3:  {
                username: '',
                tableCash: 0,
                playerAction: '',
                playerState: '',
                holeCards: [],
                winningCards: [],
                location: 'lower-left',
                },
            4:  {
                username: '',
                tableCash: 0,
                playerAction: '',
                playerState: '',
                holeCards: [],
                winningCards: [],
                location: 'upper-left',
                },
            5:  {
                username: '',
                tableCash: 0,
                playerAction: '',
                playerState: '',
                holeCards: [],
                winningCards: [],
                location: 'top-left',
                },
            6:  {
                username: '',
                tableCash: 0,
                playerAction: '',
                playerState: '',
                holeCards: [],
                winningCards: [],
                location: 'top',
                },
            7:  {
                username: '',
                tableCash: 0,
                playerAction: '',
                playerState: '',
                holeCards: [],
                winningCards: [],
                location: 'top-right',
                },
            8:  {
                username: '',
                tableCash: 0,
                playerAction: '',
                playerState: '',
                holeCards: [],
                winningCards: [],
                location: 'upper-right',
                },
            9:  {
                username: '',
                tableCash: 0,
                playerAction: '',
                playerState: '',
                holeCards: [],
                winningCards: [],
                location: 'lower-right',
                },
            10: {
                username: '',
                tableCash: 0,
                playerAction: '',
                playerState: '',
                holeCards: [],
                winningCards: [],
                location: 'bottom-right',
                },
        };
        this.setTableState = this.setTableState.bind(this);
        this.sendInput = this.sendInput.bind(this);
        this.seatNumbers = [1,2,3,4,5,6,7,8,9,10];
        this.dealerButton;
        this.tableBackground = {};
        this.deck = {};
        this.chips = {};
        this.chipTypes = [1, 5, 25, 100, 500, 2500, 10000];
        this.avatars = {
            'Lieutenant Dan': null,
            'Mad Marcus': null,
            'Fredinator': null,
            'Tinkerer': null,
            'Avatar1': null,
            'Avatar2': null,
            'Avatar3': null,
            'Avatar4': null,
            'Avatar5': null,
            'Avatar6': null,
            'Avatar7': null,
            'Avatar8': null,
            'Avatar9': null,
            'Avatar10': null,
        };
        this.grabImages = this.grabImages.bind(this);
        this.grabImages();
        this.playerActionTypes = {
            check: true,
            call: true,
            bet: true,
            raise: true,
            fold: true,
            allIn: true,
        };
    }
    componentWillMount() {
        window.ws.onmessage = window.wsCreateListener((update)=>this.setTableState(update));
        window.ws.onopen = ()=>console.log("Opening a connection...");
        window.ws.onerror = (error)=>console.log("Connection error = ", error);
        window.ws.onclose = ()=>console.log("Connection closed...");
    }
    componentDidMount() {
          // fast login
        // setTimeout(()=>this.wsSend({editName: 'dts', password: '123'}), 700);
        // setTimeout(()=>this.wsSend({getCash: true}), 1200);
        // setTimeout(()=>this.wsSend({getTableCash: 300}), 1500);
        // setTimeout(()=>this.wsSend({clientReady: true}), 1800);
        // setTimeout(()=>this.wsSend({joinTable: true}), 2100);
        this.pollForOtherPlayerInfo = setInterval(()=>{
            if (!this.state.clientReceived) {
                console.log('requesting update from server')
                this.wsSend({clientReady: true});
            } else if (this.state.clientReceived) {
                console.log('clearing polling')
                clearInterval(this.pollForOtherPlayerInfo);
            }
        }, 500);
        // Object.assign polyfill for IE 11
        if (typeof Object.assign != 'function') {
            Object.assign = function(target) {
                'use strict';
                if (target == null) {
                  throw new TypeError('Cannot convert undefined or null to object');
                }

                target = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                  var source = arguments[index];
                  if (source != null) {
                    for (var key in source) {
                      if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                      }
                    }
                  }
                }
                return target;
            };
        }
        
    }
    componentDidUpdate() {
        // if (this.state.leftTable===true) {
        //     window.ws.onmessage = window.wsCreateListener();
        //     ReactDOM.unmountComponentAtNode(document.getElementById('room'));
        // }
    }
    wsSend(update) {
        window.ws.send(JSON.stringify(update));
    }
    sendInput(action) {
        this.wsSend(action);
    }
    setTableState(update) {
        console.log("---> update: ",update)
        if (update.chats) {
            update.chats = update.chats.concat(this.state.chats);
        }   
        if (update.seat) {  //updating about player
            if ('tableCash' in update) {
                console.log('TABLECASH SET TO ', this.state.tableCash);
            }
            for (var playerSeat in update.seat) {  // possible multiple updates functionality in future
                var serverSideSeatUpdate = update.seat[playerSeat];
                // console.log("serverSideSeatUpdate ", JSON.stringify(serverSideSeatUpdate));
                if ('winningCards' in serverSideSeatUpdate) {  // update winning community cards for css highlighting
                    this.setState({winningCommunityCards: serverSideSeatUpdate.winningCards.slice(2)});
                }
                var clientSideSeatState = Object.assign({}, this.state[playerSeat]);
                // console.log("clientSideSeatState ", JSON.stringify(clientSideSeatState));
                var updatedState = Object.assign(clientSideSeatState, serverSideSeatUpdate)  // copy state first then
                // console.log("---> setState([" + playerSeat + "]: updatedState = ", JSON.stringify(updatedState));
                // this.setState({[playerSeat]: updatedState});
                this.setState(prevState => {
                    // console.log("prevState = ",prevState)
                    const newState = {
                        ...prevState,
                        [playerSeat]: {
                            ...prevState[playerSeat],
                            ...serverSideSeatUpdate
                        }
                    }
                    // console.log("newState = ",newState);
                    return newState;
                });

                // this.setState({
                //     ...this.state,
                //     ...{...this.state[playerSeat],...update.seat[playerSeat]}
                // })
            }
        } else {
            if (update.status) {
                this.state.status = ''; //reset status to trigger update
                this.setState(update);
                this.state.status = '';
            } else {
                this.setState(update);
            }
        }
    }
    grabImages() {
        var context = this;
        context.tableBackground.backgroundImage = "url("+ tableImg +")";
        context.dealerButton = require('./images/dealerButton.png');
        const suits = [ '♥', '♣', '♠', '♦' ];
        const values = [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A' ];
        context.deck.reverse = require('./images/cards/reverse.png');
        suits.forEach(function(suit) {
            values.forEach(function(value) {
                var cardName = value+suit;
                context.deck[cardName] = require(`./images/cards/${cardName}.png`);
            });
        });
        context.chipTypes.forEach((chipValue)=> {
            for (var i = 1; i < 5; i++) {
            context.chips[`chips${chipValue}_stack${i}`] = require(`./images/chips/chips${chipValue}_stack${i}.png`);
            }
        });
        Object.keys(context.avatars).forEach(function(avatar){
            context.avatars[avatar] = require(`./images/avatars/${avatar}.jpg`);
        })
    }
    render() {
        return (
            <div className={'table-image-div-outter'} >
                <div className={'table-image-div'} style={this.tableBackground}>
                    <span className={'announceUpdate'}>{this.state.update}</span>
                    <Inputs
                        inputOptions={this.state.inputOptions}
                        accountCash={this.state.accountCash}
                        tableCash={this.state.tableCash}
                        sendInput={this.sendInput}
                        loggedIn={this.state.loggedIn}
                        room={this.state.room}
                        status={this.state.status}
                        roundOnlyPotsCallValue={this.state.roundOnlyPotsCallValue}
                    />
                    <CommunityCards
                        winningCommunityCards={this.state.winningCommunityCards}
                        communityCard1={(this.state.communityCards[0]) ? this.deck[(this.state.communityCards[0])] : null}
                        communityCard2={(this.state.communityCards[1]) ? this.deck[(this.state.communityCards[1])] : null}
                        communityCard3={(this.state.communityCards[2]) ? this.deck[(this.state.communityCards[2])] : null}
                        communityCard4={(this.state.communityCards[3]) ? this.deck[(this.state.communityCards[3])] : null}
                        communityCard5={(this.state.communityCards[4]) ? this.deck[(this.state.communityCards[4])] : null}
                    />
                    <Pots
                        pots={this.state.pots}
                        potsBeginRound={this.state.potsBeginRound}
                        chips={this.chips}
                        chipTypes={this.chipTypes}
                    />
                    {this.seatNumbers.map((seatNumber, i)=>{
                        return  <Seat
                                    seat={this.state[seatNumber]}
                                    deck={this.deck}
                                    key={i}
                                    seatNumber={seatNumber}
                                    turn={this.state.turn}
                                    dealerButton={this.dealerButton}
                                    dealer={this.state.dealer}
                                    avatars={this.avatars}
                                    chips={this.chips}
                                    chipTypes={this.chipTypes}
                                />
                    })}
                </div>
            </div>
        );
    }
}

const root = createRoot(document.getElementById('room'));
root.render(<TableView />);
// ReactDOM.render(<TableView />,   document.getElementById('room'));

