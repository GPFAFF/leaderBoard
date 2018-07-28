import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Player extends Component {

  static propTypes = {
    data: PropTypes.array
  }

  calculateTotal = (scores) => {
    const scoresArray = scores.reduce((acc, currentValue) => {
      return acc + currentValue;
    });
    return scoresArray;
  }

  render() {

    return (
      <div className="player_container">
        {this.props.data.map((item, index) => (
          <div className='player' key={index}>
            <h2>{item.user}</h2>
            <div className="player_row">
              {item.tournaments.map((data, index) => {
                const { tournamentName, tournamentScore } = data;
                return (
                  <div key={index}>
                    <p>{tournamentName}</p>
                    <p>{tournamentScore}</p>
                  </div>
                )
              })}
            </div>
            <p> {this.calculateTotal(item.totalScores)} - Total </p>
          </div>
        ))}
      </div>
    )
  }
}

export default Player;
