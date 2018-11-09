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
          console.log('reduce', acc, currentValue)
          return acc + currentValue.tournamentType * currentValue.tournamentScore;
        }, 0)
        return newPlayer;
    }).sort((a,b) => {
      return b.totalScore - a.totalScore;
    });

    return (
      <div className="player_container">
        {players.map((player, i) => {
          return <PlayerCard key={i} player={player} />
        })}
      </div>
    );
  }
}

PlayerContainer.propTypes = {
  loading: PropTypes.bool.isRequired,
}


export default PlayerContainer;
