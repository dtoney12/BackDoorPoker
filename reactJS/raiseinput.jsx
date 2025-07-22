'use strict'
import React from 'react';

class RaiseInput extends React.Component {
    constructor(props) {
        super();
        this.state = {
            raiseValue: 0,
        }
    }
    componentDidMount() {
        this.setState({raiseValue: this.props.inputOptions.raise });
    }
    handleRaise(value) {
        // console.log(`You Raise to ${this.state.raiseValue}`);
        this.props.sendInput({raise: this.state.raiseValue});
        this.setState({raiseValue: 0 }); // reset to 0 for next turn
    }
    handleRaiseSlider(value) {
        this.setState({raiseValue: document.getElementById('raise-slider').value });
        // console.log(`You Change RAISE-SLIDER TO ${this.state.raiseValue}`);
    }
    render () {
        return (
            <div>
            <div className='raise-input-container game-input-container'>
                <button className='raise-button game-input' onClick={this.handleRaise.bind(this)}>{`RAISE ${this.state.raiseValue}`}</button>
            </div>
            <div className='raise-input-container game-input-container'>   
                <input 
                    id="raise-slider"
                    className='raise-slider slider game-input'
                    type="range" 
                    min={`${this.props.inputOptions.raise}`}
                    max={`${this.props.tableCash}`}
                    step="10"
                    onChange={this.handleRaiseSlider.bind(this)}
                 />
            </div>
            </div>
        );
    }
}

export default RaiseInput;