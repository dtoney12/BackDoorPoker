'use strict'
import React from 'react';
import Pot from './pot.jsx';

class Seat extends React.Component {
  constructor(props) {
    super();
    this.state = {
      avatar: null,
    }
  }
  componentDidUpdate() {
    console.log("Seat " + this.props.seatNumber + " username = (" + this.props.seat.username + ") componentDidUpdate")
    if (!(this.state.avatar) && this.props.seat.username) {
      if (!!this.props.avatars[this.props.seat.username]) {
        this.setState({avatar: this.props.avatars[this.props.seat.username] });
      } else if (!!this.props.avatars['Avatar'+this.props.seatNumber]) {
        this.setState({avatar: this.props.avatars['Avatar'+this.props.seatNumber] });
      }
    }
  }
  render () {
    var context = this;
    return (
      <div className={'seat seat-'+this.props.seat.location} >
          {this.props.seat.holeCards[0]? 
            <img  className={(this.props.seat.winningCards[0])
                      ? 'card holeCard1 '+this.props.seat.location+'-card highlight highlight-radius'
                      : 'card holeCard1 '+this.props.seat.location+'-card'}
                  src={this.props.deck[this.props.seat.holeCards[0]]} /> :null}

          {this.props.seat.holeCards[1]? 
            <img  className={this.props.seat.winningCards[1]
                          ? 'card holeCard2 '+this.props.seat.location+'-card highlight highlight-radius'
                          : 'card holeCard2 '+this.props.seat.location+'-card'}
                  src={this.props.deck[this.props.seat.holeCards[1]]} /> :null}

          {(this.props.dealer===this.props.seatNumber)? 
            <img  className={'dealer-button '+this.props.seat.location} src={this.props.dealerButton} /> :null}
          
          {this.state.avatar? 
            <img  className={(this.props.turn===this.props.seatNumber)
                            ? 'avatar highlight'
                            : 'avatar'}
                  src={this.state.avatar} /> :null}

          {this.props.seat.username?
            <div  className={'username'} >{this.props.seat.username}</div> :null}

          {this.props.seat.tableCash?
            <div  className={this.props.seat.location+'-tableCash tableCash'} >${this.props.seat.tableCash}</div> :null}

          {this.props.seat.playerAction?
            Object.entries(this.props.seat.playerAction).map(function(action, i) {
              console.log("PlayerAction " + JSON.stringify(action) + " for seat " + context.props.seat.username)
              var amount = action[1];
              if (amount===true) {
                return  <div key={i}
                          className={context.props.seat.location+'-playerAction playerAction'}>
                          {action[0]}
                        </div>
              } else if (amount > 0) {
                return  <div key={i}>
                          <div 
                            className={context.props.seat.location+'-playerAction playerAction'}>
                            { action[0]+' $'+amount}
                          </div>
                          <Pot
                            value={amount}
                            chips={context.props.chips}
                            chipTypes={context.props.chipTypes}
                            classNameProp={context.props.seat.location+'-chips-container seat-chips-container'}
                            username={context.props.seat.username}
                            seatNumber={context.props.seatNumber}
                            />
                        </div>
              }}) :null}
      </div>
    )
  }
}

export default Seat;