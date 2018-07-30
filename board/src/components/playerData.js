import React, { Component } from 'react'

 class playerData extends Component {
  render() {
    return (
      <div className="player_row">
        {item.tournaments.map((data, index) => {
          const { tournamentName, tournamentScore } = data;
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

export default playerData;

