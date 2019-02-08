import React, { Component } from 'react'
import TotalScore from './TotalScore';

 class PlayerCard extends Component {

  render() {

    const { user, icon, tournaments } = this.props.player;
    const { pointsBack, value } = this.props;

    return (
      <div className="player_row">
        <div className="player_row__title">
          <h2>
            <span className='player_row__place'>{value}. </span>
            {user}
          </h2>
          {icon ? (
            <img className="player_row__icon" src={icon} alt="icon" />
          ): <img className="player_row__icon" src="https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/img/poop.jpg" alt="icon" />
          }
        </div>
        <TotalScore pointsBack={pointsBack} tournaments={tournaments} />
      </div>
    )
  }
}

PlayerCard.propTypes = {

};

export default PlayerCard;

