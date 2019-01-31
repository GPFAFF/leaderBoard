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
      <React.Fragment>

        <div className="player_score">
          <p>Total: {this.calculateTotal(tournaments)}</p>
          <p>Points Back: 0</p>
        </div>
        <div className="player_wins">
          <p>1st: 0</p>
          <p>2nd: 0</p>
          <p>3rd: 0</p>
        </div>

      </React.Fragment>
    )
  }
}

TotalScore.propTypes = {
  tournaments: PropTypes.array
};

export default TotalScore;
