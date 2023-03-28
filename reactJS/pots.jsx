'use strict'
import React from 'react';
import Pot from './pot.jsx';

class Pots extends React.Component {

  render () {
    return (
      <div>
      <div className={'pots-container'}>
        <table className={'pots-table'}>
          <tbody>
            {(false&&!!(this.props.pots[0]))
              ? (this.props.pots.map( function(pot, i) {
                var value = String(pot.value);
                var potType = pot.sidePot?'sidepot':'main_pot'
                var playersInPot = Object.values(pot.playersInPot).map(function(seat){
                  ' '+seat.playerName.slice(0,10).replace(/\s+/g, '_')+'_$'+seat.putIn}).join(',');
                // console.log('playersInPot =', playersInPot);
                return  <div key={i}>
                          <tr >
                              <td className="pots-table-type">{potType}</td>
                              <td className="pots-table-value">${value}</td> 
                          </tr>
                          <tr className="row-for-players-in-pot">
                              <td className="tableWholeRow" >({playersInPot})</td> 
                          </tr>
                          <tr className="pots-table-divider">-------------</tr>
                        </div>
              }))
              :null}
          </tbody>
        </table>
      </div>
        {this.props.potsBeginRound.map((pot, i)=>{
            return  <Pot
                        key={i}
                        value={pot.value}
                        // playersInPot={pot.playersInPot}
                        // sidePot={pot.sidePot}
                        potType={pot.sidePot?'side pot':'main pot'}
                        chips={this.props.chips}
                        chipTypes={this.props.chipTypes}
                        classNameProp={'pot-chips-container'} />
          })}
      </div>
    )
  }
}

export default Pots;
