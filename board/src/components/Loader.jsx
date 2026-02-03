import React from 'react';
import logo from '../logo.svg';

const Loader = ({message}) => (
  <div className="loader">
    <img
      src={logo}
      alt='loading...'
      className="App-logo"
    />
    <h2>{message}</h2>
  </div>
);

export default Loader;
