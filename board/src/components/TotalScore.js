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
    const { firstPlace, secondPlace, thirdPlace } = this.props.tournaments;

    return (
      <React.Fragment>

        <div className="player_score">
          <p>Total: {this.calculateTotal(tournaments)}</p>
          <p>Points Back: 0</p>
        </div>
        <div className="player_wins">
          <p>1st: {firstPlace} </p>
          <p>2nd: {secondPlace} </p>
          <p>3rd: {thirdPlace} </p>
        </div>

      </React.Fragment>
    )
  }
}

TotalScore.propTypes = {
  tournaments: PropTypes.array
};

export default TotalScore;
