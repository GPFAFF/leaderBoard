import React, { Component } from "react";
import PlayerData from "./playerData";
import PropTypes from "prop-types";

class Player extends Component {
  static propTypes = {
    data: PropTypes.array
  };

  state = {
    playersTotalArray: []
  };

  calculateTotal = scores => {
    const scoresArray = scores.reduce((acc, currentValue) => {
      const total =
        acc + currentValue.tournamentScore * currentValue.tournamentType;
      return total;
    }, 0);

    return scoresArray;
  };

  sortStandings = scoresArray => {
    const { x } = this.state;
    const newItem = "a";
    this.setState({
      playersTotalArray: [...this.state.playersTotalArray, newItem]
    });
    //this.setState({playersTotalArray: scores})
  };

  render() {
    return (
      <div className="player_container">
        {this.props.data.map((item, index) => (
          /* sort these */
          <div className="player" key={index}>
            {/* <h2>{item.user}</h2>
            <p>Total: {this.calculateTotal(item.tournaments)}</p> */}
            <div className="player-score">
              <h2>{item.user}</h2>
              <img className="player-icon" src={item.icon} alt="icon" />
            </div>
            {/* <p>Total: {this.calculateTotal(item.tournaments)}</p> */}
            {/*  <PlayerData data={item.tournaments} /> */}
          </div>
        ))}
      </div>
    );
  }
}

export default Player;
