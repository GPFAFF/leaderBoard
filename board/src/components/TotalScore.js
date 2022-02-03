import React from "react";
import { useFormatPoints } from "../hooks";

const TotalScore = ({ points, pointsBack, tournamentPlaces }) => {
  const { first, second, third, fourth, fifth } = tournamentPlaces;

  return (
    <React.Fragment>
      <div className="player_score">
        <p>Total: {points}</p>
        {useFormatPoints(pointsBack)}
      </div>
      <div className="player_wins">
        <p>1st: {first ? first : "0"} </p>
        <p>2nd: {second ? second : "0"} </p>
        <p>3rd: {third ? third : "0"} </p>
        <p>4th: {fourth ? fourth : "0"} </p>
        <p>5th: {fifth ? fifth : "0"} </p>
      </div>
    </React.Fragment>
  );
};

export default TotalScore;
