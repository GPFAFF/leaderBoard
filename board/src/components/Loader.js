import React from 'react';
import logo from '../logo.svg';
import PropTypes from 'prop-types';

// const baseUrl = process.env.PUBLIC_URL;

const Loader = (props) => (

  <div className="loader">
    {/* <img src={`${baseUrl}/img/fleur.svg`} alt="Loading..." /> */}
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