import React, { Component } from "react";
import PlayerCard from "./PlayerCard";
import Loader from "./Loader";
import PropTypes from "prop-types";

class PlayerContainer extends Component {

  // calculateTotal = tournamentList => {
  //   const scoresArray = tournamentList.reduce((acc, currentValue) => {
  //     const total =
  //       acc + currentValue.tournamentScore * currentValue.tournamentType;
  //     return total;
  //   }, 0);

  //   return scoresArray;
  // };

  render() {

    if (this.props.loading) {
      return (
        <Loader message="⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️ INCOMING SCORES ⛳️⛳️⛳️⛳️⛳️⛳️⛳️" />
      )
    }

    const tournamentList = this.props.data.map(data => {
      console.log(data.tournaments);
      return data.tournaments;
    });

    console.log(tournamentList)

    const newList = tournamentList.forEach(item => {
      return item;
    })

    console.log(newList);


    return (
      <div className="player_container">
        {this.props.data.map((player, i) => <PlayerCard key={i} player={player} />
        )}
       {/* <p> {this.calculateTotal()} </p> */}
      </div>
    );
  }
}

PlayerContainer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool.isRequired,
}


export default PlayerContainer;
