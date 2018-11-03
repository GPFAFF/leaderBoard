import React, { Component } from 'react';
import PlayerContainer from './components/PlayerContainer';
import './App.css';

class App extends Component {
  constructor(props) {
    super();

    this.state = {
      data: [],
      loading: true
    }
  }

  componentDidMount() {
    this.loadDependency();
  }

  loadDependency = async () => {

    const response = await fetch('https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/data.json')
    .then(res => res.json());

    const chunks = response.filter(chunk => chunk);

    this.setState({
      data: chunks,
      loading: false
    });

    console.log(this.state.data);
  }

  render() {

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Golf Leaderboard</h1>
        </header>
        <h2 className="App-intro">
          PGA DFS STANDINGS
        </h2>
        <PlayerContainer
          data={this.state.data}
          loading={this.state.loading}
        />
      </div>
    );
  }
}

export default App;
