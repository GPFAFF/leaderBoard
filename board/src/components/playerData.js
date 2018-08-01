import React, { Component } from 'react'

 class PlayerData extends Component {
  render() {
    return (
      <div className="player_row">
        {this.props.data.map((items, index) => {
          const {
            tournamentName,
            tournamentScore
          } = items;
          return (
            <div key={index}>
              <p>{tournamentName}</p>
              <p>{tournamentScore}</p>
            </div>
          )
        })}
      </div>
    )
  }
}

export default PlayerData;

