import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Player extends Component {

  static propTypes = {
    data: PropTypes.array
  }

  state = {
    playersTotalArray: []
  }

  calculateTotal = (scores) => {
    const scoresArray = scores.reduce((acc, currentValue) => {
      return acc + currentValue.tournamentScore * currentValue.tournamentType;
    }, 0);

    return scoresArray;
  }

  sortStandings = (scoresArray) => {
    console.log('yo');
  }

  render() {

    return (
      <div className="player_container">
        {this.props.data.map((item, index) => (

          <div className='player' key={index}>
            <h2>{item.user}</h2>
            <img src={item.icon} alt="icon" />
            <p>Total: {this.calculateTotal(item.tournaments)}</p>
          </div>
        ))}
      </div>
    )
  }
}

export default Player;
