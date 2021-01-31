import React from 'react'
import { useCalculateTotal, useFormatPoints } from '../hooks';

const TotalScore = ({ tournaments, pointsBack, tournamentPlaces }) => {
  const { firstPlace, secondPlace, thirdPlace, fourthPlace, fifthPlace } = tournamentPlaces;
  return (
    <React.Fragment>
      <div className="player_score">
        <p>Total: {useCalculateTotal(tournaments)}</p>
        {useFormatPoints(pointsBack)}
      </div>
      <div className="player_wins">
        <p>1st: {firstPlace} </p>
        <p>2nd: {secondPlace} </p>
        <p>3rd: {thirdPlace} </p>
        <p>4th: {fourthPlace} </p>
        <p>5th: {fifthPlace} </p>
      </div>
    </React.Fragment>
  )
}

export default TotalScore;
