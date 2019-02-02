import React from 'react';
import logo from '../logo.svg';
import PropTypes from 'prop-types';

const Loader = (props) => (

  <div className="loader">
    <img
      src={logo}
      alt='loading...'
      className="App-logo"
    />
    <h2>{props.message}</h2>
    <p>This is going to be the new commit</p>
  </div>
);

Loader.propTypes = {
  message: PropTypes.string
};

export default Loader;
