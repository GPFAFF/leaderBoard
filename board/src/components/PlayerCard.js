import React, { Component } from 'react'
import TotalScore from './TotalScore';

 class PlayerCard extends Component {

  render() {

    const { user, icon, tournaments } = this.props.player;
    const { pointsBack, value } = this.props;

    return (
      <div className="player_row">
        <h2>
          <span className='player_place'>{value}. </span>
          {user}
        </h2>
        {icon ? (
          <img className="player-icon" src={icon} alt="icon" />
        ): <img className="player-icon" src="https://www.placecage.com/g/200/300" alt="icon" />
      }
        <TotalScore pointsBack={pointsBack} tournaments={tournaments} />
      </div>
    )
  }
}

PlayerCard.propTypes = {

};

export default PlayerCard;

