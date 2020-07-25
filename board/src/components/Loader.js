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
  </div>
);

Loader.propTypes = {
  message: PropTypes.string
};

export default Loader;