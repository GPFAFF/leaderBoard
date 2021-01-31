import React, { Component } from 'react'
import TotalScore from './TotalScore';

const PlayerCard = ({ player, pointsBack, value }) => {
  const { user, icon, tournaments, tournamentPlaces } = player;

  return (
    <div className="player_row">
      <div className="player_row__title">
        <h2>
          <span className='player_row__place'>{value}.</span>
          {user}
        </h2>
        {icon
          ? <img className="player_row__icon" src={icon} alt="icon" />
          : <img className="player_row__icon" src="https://www.placecage.com/g/300/300" alt="icon" />
        }
      </div>
      <TotalScore
        pointsBack={pointsBack}
        tournaments={tournaments}
        tournamentPlaces={tournamentPlaces}
      />
    </div>
  )
}

class PlayerCard extends Component {
  render() {
    const { user, icon, tournaments, tournamentPlaces } = this.props.player;
    const { pointsBack, value } = this.props;

    return (
      <div className="player_row">
        <div className="player_row__title">
          <h2>
            <span className='player_row__place'>{value}.</span>
            {user}
          </h2>
          {icon
            ? <img className="player_row__icon" src={icon} alt="icon" />
            : <img className="player_row__icon" src="https://www.placecage.com/g/300/300" alt="icon" />
          }
        </div>
        <TotalScore
          pointsBack={pointsBack}
          tournaments={tournaments}
          tournamentPlaces={tournamentPlaces}
        />
      </div>
    )
  }
}

PlayerCard.propTypes = {

};

export default PlayerCard;

