import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Player from './components/Player';

class App extends Component {

  state = {
    data: []
  }

  componentDidMount() {
    this.loadDepndency();
  }

  loadDepndency = async () => {

    const response = await fetch('https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/data.json')
    .then(res => res.json());

    const chunks = response.filter(chunk => chunk);

    this.setState({
      data: chunks
    });
  }

  render() {

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Golf Leaderboard</h1>
        </header>
        <p className="App-intro">
          PGA STANDINGS
        </p>
        <Player data={this.state.data} />
      </div>
    );
  }
}

export default App;
