import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./components/Home";
import Fedex from "./components/Fedex";
import Season from "./components/Season";

import "./App.scss";

const App = () => {
  return (
    <Router basename="/leaderBoard">
      <Routes>
        <Route path="/" element={<Home />} exact />
        <Route path="/season" element={<Season />} />
      </Routes>
    </Router>
  );
};

export default App;
