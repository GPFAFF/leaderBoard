import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlayerContainer from "./PlayerContainer";
import Header from "./Header";

import axios from "axios";

const Season = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios(
      "https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/data.json"
    ).then((res) => setData(res.data));

    setLoading(false);
  }, []);

  const date = new Date(document.lastModified);
  const [month, day, year] = [
    date.getMonth(),
    date.getDate(),
    date.getFullYear(),
  ];

  return (
    <div>
      <Header />
      <div className="league-container">
        <Link className="navigation-button" to="/">
          Home
        </Link>
        <h2 className="season-title">Regular Season</h2>
        <p>
          Page last updated - {day}/{month}/{year}
        </p>
        <PlayerContainer data={data} loading={loading} />
      </div>
    </div>
  );
};

export default Season;
