import React, { Component } from "react";
import PlayerCard from "./PlayerCard";
import Loader from "./Loader";
import PropTypes from "prop-types";

class PlayerContainer extends Component {

  render() {

    if (this.props.loading) {
      return (
        <Loader message="⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️ INCOMING SCORES ⛳️⛳️⛳️⛳️⛳️⛳️⛳️" />
      )
    }

    const players = this.props.data.map((item, i) => {
      const newPlayer = {...item};
      newPlayer.totalScore = newPlayer.tournaments.reduce((acc, currentValue) => {
          return acc + currentValue.tournamentType * currentValue.tournamentScore;
        }, 0)
        return newPlayer;
    }).sort((a,b) => {
      return b.totalScore - a.totalScore;
    });

    console.log(players);

    function pointsBack(player) {
      const leader = players[0].totalScore;
      return leader - player.totalScore;
    }

    return (
      <div className="player_container">
        {players.map((player, i) => {
          return <PlayerCard key={i} value={i + 1} pointsBack={pointsBack(player)} player={player} />
        })}
      </div>
    );
  }
}

PlayerContainer.propTypes = {
  loading: PropTypes.bool.isRequired,
}


export default PlayerContainer;
