import React from "react";
import PlayerCard from "./PlayerCard";
import Loader from "./Loader";
import axios from "axios";

const PlayerContainer = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Loader message="⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️ INCOMING SCORES ⛳️⛳️⛳️⛳️⛳️⛳️⛳️" />
    );
  }

  const players = data[0];

  function pointsBack(player) {
    const leader = Number(players[0].points);
    const playerScore = Number(player.points);
    return (leader - playerScore).toFixed(2);
  }

  const [iconData, setIconData] = React.useState([]);
  React.useEffect(() => {
    axios(
      "https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/icon-data.json"
    ).then((res) => setIconData(res.data));
  }, []);

  const findIcon = (player) => {
    if (!iconData) return null;
    const id = iconData.find(
      (item) => item.user.toLowerCase() === player.name.toLowerCase()
    );
    if (!id) return;
    return id.icon;
  };

  return (
    <div className="player_container">
      {players.map((player, i) => (
        <PlayerCard
          key={i}
          value={i + 1}
          icon={findIcon(player)}
          pointsBack={pointsBack(player)}
          player={player}
        />
      ))}
    </div>
  );
};

export default PlayerContainer;
