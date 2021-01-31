import React from "react";
import PlayerCard from "./PlayerCard";
import Loader from "./Loader";

const PlayerContainer = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Loader message="⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️ INCOMING SCORES ⛳️⛳️⛳️⛳️⛳️⛳️⛳️" />
    )
  }

  const players = data.map((item, i) => {
    const newPlayer = { ...item };
    newPlayer.totalScore = newPlayer.tournaments.reduce((acc, currentValue) => {
      return acc + currentValue.tournamentType * currentValue.tournamentScore;
    }, 0)
    return newPlayer;
  }).sort((a, b) => {
    return b.totalScore - a.totalScore;
  });

  function pointsBack(player) {
    const leader = players[0].totalScore;
    const playerScore = player.totalScore;
    return (leader - playerScore).toFixed(2);
  }

  return (
    <div className="player_container">
      {players.map((player, i) => (
        <PlayerCard key={i} value={i + 1}
          pointsBack={pointsBack(player)} player={player}
        />
      ))}
    </div>
  )
}

export default PlayerContainer;
