import React, { Component } from 'react'
import TotalScore from './TotalScore';

 class PlayerCard extends Component {

  render() {

    const { user, icon, tournaments } = this.props.player;

    console.log(this.props.player);

    return (
      <div className="player_row">
        <h2>{user}</h2>
        {icon ? (
          <img className="player-icon" src={icon} alt="icon" />
        ): <img className="player-icon" src="https://www.placecage.com/g/200/300" alt="icon" />
      }
        <TotalScore tournaments={tournaments} />
      </div>
    )
  }
}

PlayerCard.propTypes = {

};

export default PlayerCard;

