'use strict'
import React from 'react';

class CommunityCards extends React.Component {
  constructor(props) {
    super();
    this.state = {

    }
  }

  render () {
    return (this.props.communityCard1) 
      ? (
        <div className={'community-card-container'}>
            <img 
            className={(this.props.winningCommunityCards[0])
                ? 'card community-card community-card1 highlight'
                : 'card community-card community-card1'}
            src={this.props.communityCard1}
            />
            <img 
            className={(this.props.winningCommunityCards[1])
                ? 'card community-card community-card2 highlight'
                : 'card community-card community-card2'}
            src={this.props.communityCard2}
            />
            <img 
            className={(this.props.winningCommunityCards[2])
                ? 'card community-card community-card3 highlight'
                : 'card community-card community-card3'}
            src={this.props.communityCard3}
            />
            <img 
            className={(this.props.winningCommunityCards[3])
                ? 'card community-card community-card4 highlight'
                : 'card community-card community-card4'}
            src={this.props.communityCard4}
            />
            <img 
            className={(this.props.winningCommunityCards[4])
                ? 'card community-card community-card5 highlight'
                : 'card community-card community-card5'}
            src={this.props.communityCard5}
            />
        </div>
      )
    : null
  }
}

export default CommunityCards;