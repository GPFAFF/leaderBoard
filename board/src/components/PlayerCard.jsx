import React, { Fragment } from "react";
import TotalScore from "./TotalScore";

const PlayerCard = ({ player, pointsBack, value, icon }) => {
  const { name, points, rank } = player;

  return (
    <div className="player_row">
      <div className="player_row__title">
        <h2>
          <span className="player_row__place">{value}.</span> {name}
        </h2>
        <Fragment>
          {icon ? (
            <img className="player_row__icon" src={icon} alt="icon" />
          ) : (
            <img
              className="player_row__icon"
              src="https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/img/poop.jpg"
              alt="icon"
            />
          )}
        </Fragment>
      </div>
      <TotalScore
        pointsBack={pointsBack}
        points={points}
        tournamentPlaces={rank}
      />
    </div>
  );
};

export default PlayerCard;
