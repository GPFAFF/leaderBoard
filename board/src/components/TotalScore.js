import React from "react";
import { useFormatPoints } from "../hooks";

const TotalScore = ({ points, pointsBack }) => {
  return (
    <React.Fragment>
      <div className="player_score">
        <p>Total: {points}</p>
        {useFormatPoints(pointsBack)}
      </div>
    </React.Fragment>
  );
};

export default TotalScore;
