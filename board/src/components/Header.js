import React from 'react'
import flag from '../flag.svg';

const Header = () => {
  return (
    <header className="App-header">
      <h1 className="App-title">Golf Leaderboard</h1>
      <img className="flag" src={flag} alt="flag" />
    </header>
  )
}

export default Header;
