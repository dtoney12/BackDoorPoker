'use strict'
import React from 'react';
import RaiseInput from './raiseinput.jsx';
import BetInput from './betinput.jsx';
import GetTableCash from './getTableCash.jsx';

class Inputs extends React.Component {
    constructor(props) {
        super();
        this.state = {
            editName: '',
            password: '',
            message: '',
            getCash: true,
            getTableCash: 0,
            joinTable: true,
            logout: true,
            status: '',
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event) {
        var attr = event.target.name;
        this.setState({[attr]: event.target.value});
    }
    handleSubmit(event) {
        event.preventDefault();
        var attr = event.target.name;
        this.props.sendInput({[attr]: this.state[attr] });
    }
    handleCall() {
        this.props.sendInput({call: this.props.inputOptions.call });
        // console.log(`You CALL FOR ${this.props.inputOptions.call}`);
    }
    handleAllIn() {
        this.props.sendInput({allIn: this.props.inputOptions.allIn });
        // console.log(`You go All-IN FOR ${this.props.inputOptions.allIn}`);
    }
    handleFold() {
        this.props.sendInput({fold: true });
        // console.log("You FOLD");
    }
    handleCheck() {
        this.props.sendInput({check: true });
        // console.log("You Check");
    }
    handleLeaveTable() {
        this.props.sendInput({leaveTable: true });
        console.log("You leave the table");
    }
    pause() {
        this.props.sendInput({pause: true });
        console.log("You pause");
    }
    unpause() {
        this.props.sendInput({unpause: true });
        console.log("You unpause");
    }
    componentDidUpdate() {
        if (this.props.status!=='') {
            var newStatus = document.createElement('div');
            newStatus.className = 'status-display hideMe';
            newStatus.innerHTML = 'Status: ' + this.props.status;
            var statusContainer = document.getElementsByClassName('status-display-container')[0];
            while (statusContainer.firstChild) {
                statusContainer.removeChild(statusContainer.firstChild);
            }
            statusContainer.appendChild(newStatus);
            // this.setState({status: this.props.status });
        }
    }
    render () {
        return (
            <div className={'inputs-container'}>
                <div 
                    className={this.props.room!=='TABLE1'?'lobby-inputs-container':'lobby-inputs-container room-inputs-container'}>
                    <div className='lobby-forms-box'>

                        {!(this.props.loggedIn)
                        ?   <div>
                                <form 
                                    className='form form-container' 
                                    name='editName' 
                                    onSubmit={this.handleSubmit}>
                                    <div
                                        className='editName-input-text-container lobby-input-container'>
                                        <input 
                                            className='form form-text-input' 
                                            type="text" 
                                            name='editName' 
                                            value={this.state.editName} 
                                            onChange={this.handleChange} />
                                    </div>
                                    <div
                                        className='editName-input-container lobby-input-container'>
                                        <input 
                                            className='form form-submit-input lobby-input' 
                                            type="submit" 
                                            value="Enter Username"/>
                                    </div>
                                </form>
                                <form 
                                    className='form form-container' 
                                    name='password' 
                                    onSubmit={this.handleSubmit}>
                                    <div
                                        className='password-input-text-container lobby-input-container'>
                                        <input 
                                            className='form form-text-input' 
                                            type="text" 
                                            name='password' 
                                            value={this.state.password} 
                                            onChange={this.handleChange} />
                                    </div>
                                    <div
                                        className='password-input-container lobby-input-container'>
                                        <input 
                                            className='form form-submit-input lobby-input' 
                                            type="submit"
                                            value="Enter Password"/>
                                    </div>
                                </form>
                            </div>
                        :null}

                        {(this.props.loggedIn && this.props.room==='LOBBY')
                        ?   <div>
                                <div
                                    className='getCash-input-container lobby-input-container'>
                                    <button
                                        className='lobby-input'
                                        name='getCash' 
                                        onClick={this.handleSubmit}>Get $1000 (daily)</button>
                                </div>
                                <GetTableCash
                                    sendInput={this.props.sendInput}
                                    accountCash={this.props.accountCash}
                                />
                            </div>
                        : null}

                        {(this.props.loggedIn && this.props.room==='TABLE1')
                        ?   <div 
                                className='leaveTable-input-container lobby-input-container'>
                                <button
                                    className='lobby-input'
                                    onClick={this.handleLeaveTable.bind(this)}>
                                    LEAVE TABLE
                                </button>
                            </div>
                        :null}

                        {(this.props.loggedIn)
                        ?   <div
                                className='cash-displays-container'>
                                <span 
                                    className='account-cash cash-displays'>
                                    Account: ${this.props.accountCash}
                                </span>
                                <span 
                                    className='table-cash cash-displays'>
                                    Table: ${this.props.tableCash}
                                </span>
                            </div>
                        :null}

                        {(this.props.loggedIn && this.props.room==='LOBBY')
                        ?   <div>
                                <div
                                    className='joinTable-input-container lobby-input-container'>
                                    <button
                                        className='lobby-input'
                                        name='joinTable' 
                                        onClick={this.handleSubmit}>
                                        Join Table
                                    </button>
                                </div>
                                <div
                                    className='logout-input-container lobby-input-container'>
                                    <button
                                        className='lobby-input'
                                        name='logout'
                                        onClick={this.handleSubmit}>
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        : null}
                    </div>
                </div>
                <div className='status-display-container'></div>

                <div className='game-inputs-container'>

                   {('fold' in this.props.inputOptions) 
                    ?   <div className='fold-input-container game-input-container'>
                            <button className='fold-button game-input' onClick={this.handleFold.bind(this)}>FOLD</button>
                        </div>
                    : null
                    }
                    {('check' in this.props.inputOptions) 
                    ?   <div className='check-input-container game-input-container'>
                            <button className='check-button game-input' onClick={this.handleCheck.bind(this)}>CHECK</button>
                        </div>
                    : null
                    }
                    {('bet' in this.props.inputOptions) 
                    ?   <BetInput 
                            inputOptions={this.props.inputOptions} 
                            sendInput={this.props.sendInput}
                            tableCash={this.props.tableCash}
                        />
                    : null
                    }
                    {('call' in this.props.inputOptions) 
                    ?   <div className='call-input-container game-input-container'>
                            <button className='call-button game-input' onClick={this.handleCall.bind(this)}>{`CALL ${this.props.inputOptions.call}`}</button>
                        </div>
                    : null
                    }
                    {('raise' in this.props.inputOptions) 
                    ?   <RaiseInput 
                            inputOptions={this.props.inputOptions} 
                            sendInput={this.props.sendInput}
                            tableCash={this.props.tableCash}
                            roundOnlyPotsCallValue={this.props.roundOnlyPotsCallValue}
                        />
                    : null
                    }
                    {('allIn' in this.props.inputOptions) 
                    ?   <div className='allIn-input-container game-input-container'>
                            <button className='allIn-button game-input' onClick={this.handleAllIn.bind(this)}>{`ALL-IN for ${this.props.inputOptions.allIn}`}</button>
                        </div>
                    : null
                    }

                </div>
            </div>
        );
    }
}

export default Inputs;