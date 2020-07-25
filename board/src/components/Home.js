import React from 'react'
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Golf Leaderboard</h1>
      </header>
      <div className="container">
        <h2> Choose the season standings </h2>
        <Link className="navigation-button" to="/season"> Season </Link>
        <Link className="navigation-button" to="/fedex"> Fedex </Link>
      </div>
    </div>
  )
}

export default Home;