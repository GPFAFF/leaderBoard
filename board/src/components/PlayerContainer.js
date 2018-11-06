import React, { Component } from "react";
import PlayerCard from "./PlayerCard";
import Loader from "./Loader";
import PropTypes from "prop-types";

class PlayerContainer extends Component {

  componet

  render() {

    if (this.props.loading) {
      return (
        <Loader message="⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️ INCOMING SCORES ⛳️⛳️⛳️⛳️⛳️⛳️⛳️" />
      )
    }

    const sortedData = this.props.data.map((items, i) => {
      const scoresArray = items.tournaments.reduce((acc, currentValue) => {
        const totals =
          acc + currentValue.tournamentScore * currentValue.tournamentType;
        return totals;
      }, 0);

      return scoresArray;
    });


    sortedData.sort().reverse().map((item, i) => {
      console.log(item);
    });

    console.log(sortedData);

    return (
      <div className="player_container">
        {this.props.data.map((player, i) => {
          return <PlayerCard key={i} player={player}  />
        })}
      </div>
    );
  }
}

PlayerContainer.propTypes = {
  loading: PropTypes.bool.isRequired,
}


export default PlayerContainer;
