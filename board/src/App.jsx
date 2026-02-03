import React from "react";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import Home from "./components/Home";
import Fedex from "./components/Fedex";
import Season from "./components/Season";

import "./App.scss";

const App = () => {
  return (
    <Router basename="/leaderBoard">
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/season">
          <Season />
        </Route>
        <Route path="/fedex">
          <Fedex />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
