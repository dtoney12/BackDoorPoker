'use strict'
import React, {useEffect, useRef, useState} from 'react';

// class Pot extends React.Component {
//   constructor(props) {
//     super();
//     this.state = {
//       chips1_stack: 0,
//       chips5_stack: 0,
//       chips25_stack: 0,
//       chips100_stack: 0,
//       chips500_stack: 0,
//       chips2500_stack: 0,
//       chips10000_stack: 0,
//     };
//     this.potValue = 0;
//     this.updateStacks = this.updateStacks.bind(this);
//   }
//   componentDidUpdate() {
//     console.log("---> Pot action changed for seat " + this.props.seatNumber + ", action = ", this.props.action);
//     if (this.props.action[1] !== this.potValue) {
//       // console.log('--> updateStacks says potValue=', this.props.action[1]);
//       this.updateStacks(this.props.action[1]);
//       this.potValue = this.props.action[1];
//     } 
//   }
//   updateStacks(potValue) {
//     for (var i=0; i < this.props.chipTypes.length; i++) {
//       var chipType = this.props.chipTypes[i];
//       var nextChipType = this.props.chipTypes[i+1] || 50000;
//       var stackLimit;
//       if (chipType===25 || chipType ===2500) {
//         stackLimit = 3;
//       } else {
//         stackLimit = 4;
//       }
//       var stackTypeIndex = `chips${chipType}_stack`;
//       var chipStackCount = 0;
//       while ((potValue%nextChipType !==  0) && (chipStackCount <= stackLimit)) { // stackLimit condition only a precaution
//         chipStackCount++;
//         potValue -= chipType;
//       }
//       // console.log('setting stacktypeIndex of', stackTypeIndex, 'to chip count', chipStackCount);
//       this.setState({ [stackTypeIndex]: chipStackCount });
//     }

//   }
//   render () {
//     var context = this;
//     return (
//         <div className={this.props.classNameProp}>
//             <span
//               className={'pot-chips-description'}>
//               {!!this.props.potType?this.props.potType+': ':null}
//             </span>
//           {Object.entries(this.state).map(function(chipStackEntry, i){
//             var chipStackName = chipStackEntry[0];
//             var chipStackCount = chipStackEntry[1];
//             if (chipStackCount > 0) {
//               return <img
//                 key={i}
//                 className={chipStackName+' chip'}
//                 src={context.props.chips[chipStackName+chipStackCount]}
//               />
//             }
//           })}
//         </div>
//     )
//   }
// }

const Pot = (props)=> {

  const potValueRef = useRef(0);

  const [chips, setChips] = useState({
      chips1_stack: 0,
      chips5_stack: 0,
      chips25_stack: 0,
      chips100_stack: 0,
      chips500_stack: 0,
      chips2500_stack: 0,
      chips10000_stack: 0,
    });

  useEffect(()=>{
    if (props.action) {
      // console.log("---> Pot action changed for seat " + props.seatNumber + ", action = ", props.action);
      potValueRef.current = props.action[1];
      updateStacks(potValueRef.current);
    }
  }, [props.action]);

  const updateStacks = (potValue) => {
    var updatedChips = {};
    for (var i=0; i < props.chipTypes.length; i++) {
      var chipType = props.chipTypes[i];
      var nextChipType = props.chipTypes[i+1] || 50000;
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
      updatedChips = {...updatedChips, [stackTypeIndex]: chipStackCount};
    }
    setChips(updatedChips);
  }

  return (
        <div className={props.classNameProp}>
            <span
              className={'pot-chips-description'}>
              {!!props.potType?props.potType+': ':null}
            </span>
          {Object.entries(chips).map(function(chipStackEntry, i){
            var chipStackName = chipStackEntry[0];
            var chipStackCount = chipStackEntry[1];
            if (chipStackCount > 0) {
              return <img
                key={i}
                className={chipStackName+' chip'}
                src={props.chips[chipStackName+chipStackCount]}
              />
            }
          })}
        </div>
    )

}

export default Pot;