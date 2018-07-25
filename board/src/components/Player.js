import React, { Component } from 'react';
import PropTypes from 'prop-types';


class Player extends Component {

  render() {

    const { user, tournament } = this.props.data;

    console.log(this.props.data)

    return (
      <div className="player_container">
        {this.props.data.map((item, index) => (
          <div className='player' key={index}>
            <h2>{item.user}</h2>
            <div className="player_row">
              {Array.from(item.tournaments).map(score => (
                <div>
                  <p>{score.tournament.tournamentName}</p>
                  <p>{score.tournament.score}</p>
                </div>
              ))}
              <p>Total</p>
            </div>
          </div>
        ))}
      </div>
    )
  }
}

export default Player;
