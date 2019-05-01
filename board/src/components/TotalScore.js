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

    const { tournaments, pointsBack } = this.props;
    const { firstPlace, secondPlace, thirdPlace } = this.props.tournamentPlaces;

    const formatPoints = (pointsBack) => {
      if (pointsBack === "0.00") {
        return <p>Points Back: 0</p>;
      }
      return <p>Points Back: -{pointsBack} </p>;
    }

    return (
      <React.Fragment>

        <div className="player_score">
          <p>Total: {this.calculateTotal(tournaments)}</p>
          {formatPoints(pointsBack)}
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
