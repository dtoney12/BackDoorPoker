'use strict'
import React from 'react';

class Pot extends React.Component {
  constructor(props) {
    super();
    this.state = {
      chips1_stack: 0,
      chips5_stack: 0,
      chips25_stack: 0,
      chips100_stack: 0,
      chips500_stack: 0,
      chips2500_stack: 0,
      chips10000_stack: 0,
    };
    this.potValue = 0;
    this.updateStacks = this.updateStacks.bind(this);
  }
  componentDidUpdate() {
    console.log("For Seat " + this.props.seatNumber + " username = (" + this.props.username + "), Pot componentDidUpdate, this.props.value = " + this.props.value );
    if (this.props.value !== this.potValue) {
      // console.log('--> updateStacks says potValue=', this.props.value);
      this.updateStacks(this.props.value);
      this.potValue = this.props.value;
    } 
  }
  updateStacks(potValue) {
    for (var i=0; i < this.props.chipTypes.length; i++) {
      var chipType = this.props.chipTypes[i];
      var nextChipType = this.props.chipTypes[i+1] || 50000;
      var stackLimit;
      if (chipType===25 || chipType ===2500) {
        stackLimit = 3;
      } else {
        stackLimit = 4;
      }
      var stackTypeIndex = `chips${chipType}_stack`;
      var chipStackCount = 0;
      while ((potValue%nextChipType !==  0) && (chipStackCount <= stackLimit)) { // stackLimit condition only a precaution
        chipStackCount++;
        potValue -= chipType;
      }
      console.log('setting stacktypeIndex of', stackTypeIndex, 'to chip count', chipStackCount);
      this.setState({ [stackTypeIndex]: chipStackCount });
    }

  }
  render () {
    var context = this;
    return (
        <div className={this.props.classNameProp}>
            <span
              className={'pot-chips-description'}>
              {!!this.props.potType?this.props.potType+': ':null}
            </span>
          {Object.entries(this.state).map(function(chipStackEntry, i){
            var chipStackName = chipStackEntry[0];
            var chipStackCount = chipStackEntry[1];
            if (chipStackCount > 0) {
              return <img
                key={i}
                className={chipStackName+' chip'}
                src={context.props.chips[chipStackName+chipStackCount]}
              />
            }
          })}
        </div>
    )
  }
}

export default Pot;