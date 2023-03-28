'use strict'
import React from 'react';

class BetInput extends React.Component {
    constructor(props) {
        super();
        this.state = {
            betValue: 0,
        }
    }
    componentDidMount() {
        this.setState({betValue: this.props.inputOptions.bet });
    }
    handleBet(value) {
        // console.log(`You Bet ${this.state.betValue}`);
        this.props.sendInput({bet: this.state.betValue});
        this.setState({betValue: 0 }); // reset to 0 for next turn
    }
    handleBetSlider(value) {
        this.setState({betValue: document.getElementById('bet-slider').value });
        // console.log(`You Change BET-SLIDER TO ${this.state.betValue}`);
    }
    render () {
        return (
            <div>
            <div className='bet-input-container game-input-container'>
                <button className='bet-button game-input' onClick={this.handleBet.bind(this)}>{`BET ${this.state.betValue}`}</button>
            </div>
            <div className='bet-input-container game-input-container'>
                <input 
                    id="bet-slider"
                    className='bet-slider slider game-input'
                    type="range" 
                    min={`${this.props.inputOptions.bet}`}
                    max={`${this.props.tableCash}`}
                    step="10"
                    onChange={this.handleBetSlider.bind(this)}
                 />
            </div>
            </div>
        );
    }
}

export default BetInput;