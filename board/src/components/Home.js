import React from 'react'
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
  return (
    <div className="App">
      <Header />
      <div className="container">
        <img className="image-banner" src="https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/img/golf-funny.jpg" alt="funny golf" />
        <h2> Choose the season standings </h2>
        <Link className="navigation-button" to="/season"> Season </Link>
        <Link className="navigation-button" to="/fedex"> Fedex </Link>
      </div>
    </div>
  )
}

export default Home;
