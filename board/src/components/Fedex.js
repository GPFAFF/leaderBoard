import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import PlayerContainer from './PlayerContainer';
import axios from 'axios';

const Fedex = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios('https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/fedex.json')
    .then(res => setData(res.data));
    setLoading(false)
  }, [])

  return (
    <div>
      <header className="App-header">
        <h1 className="App-title">Golf Leaderboard</h1>
      </header>
      <div className="league-container">
        <Link className="navigation-button" to="/"> Home </Link>
        <h2>Fedex Season</h2>
        <PlayerContainer
          data={data}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default Fedex;