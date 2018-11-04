import React, { Component } from 'react'
import PropTypes from 'prop-types'

 class TotalScore extends Component {

  calculateTotal = scores => {
    const scoresArray = scores.reduce((acc, currentValue) => {
      const total =
        acc + currentValue.tournamentScore * currentValue.tournamentType;
      return total;
    }, 0);

    return scoresArray;
  };

  render() {

    const { tournaments } = this.props;

    return (
      <div className="player_score">
        <p>Total: {this.calculateTotal(tournaments)}</p>
      </div>
    )
  }
}

TotalScore.propTypes = {
  tournaments: PropTypes.array
};

export default TotalScore;