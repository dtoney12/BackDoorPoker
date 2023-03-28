'use strict'
import React from 'react';

class GetTableCash extends React.Component {
    constructor(props) {
        super();
        this.state = {
            getTableCashValue: 0,
        }
    }
    handleSubmitGetTableCash(value) {
        // console.log(`You transfer $${this.state.getTableCashValue} to Table Cash`);
        this.props.sendInput({getTableCash: this.state.getTableCashValue});
        this.setState({getTableCashValue: 0 }); // reset to 0 for next turn
        document.getElementById("getTableCash-slider").value = "0";
    }
    handleGetTableCashSlider(value) {
        this.setState({getTableCashValue: document.getElementById('getTableCash-slider').value });
        // console.log(`You Change GET TABLE CASH SLIDER TO ${this.state.getTableCashValue}`);
    }
    render () {
        return (
            <div className='getTableCash-inputs-container'>
                <div
                    className='getTableCash-input-container lobby-input-container'>
                    <button
                        className='lobby-input'
                        onClick={this.handleSubmitGetTableCash.bind(this)}>
                        {`$${this.state.getTableCashValue} =>Table`}
                    </button>
                </div>
                <div
                    className='getTableCash-slider-container lobby-input-container'>
                    <input 
                        id="getTableCash-slider" 
                        type="range" 
                        min="0"
                        max={`${this.props.accountCash}`}
                        step="10"
                        onChange={this.handleGetTableCashSlider.bind(this)}
                     />
                </div>
            </div>
        );
    }
}

export default GetTableCash;