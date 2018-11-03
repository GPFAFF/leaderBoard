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

    console.log(this.props.data);

    return (
      <div className="player_container">
        {this.props.data.map((player, i) => <PlayerCard key={i} player={player} />
        )}
      </div>
    );
  }
}

PlayerContainer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool.isRequired,
}


export default PlayerContainer;
