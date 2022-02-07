import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlayerContainer from "./PlayerContainer";
import Header from "./Header";

import axios from "axios";

const Season = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateAndName, setDateAndName] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios(
      "https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/data.json"
    ).then((res) => setData(res.data));
    axios("https://api.github.com/users/GPFAFF/events/public").then((res) =>
      setDateAndName(res.data)
    );

    setLoading(false);
  }, []);

  let date;

  if (dateAndName) {
    date = dateAndName.find((commit) =>
      commit.repo.name.includes("leaderBoard")
    );
  }

  console.log(date);
  return (
    <div>
      <Header />
      <div className="league-container">
        <Link className="navigation-button" to="/">
          Home
        </Link>
        <h2 className="season-title">Regular Season</h2>
        <p>
          {date && `Last updated - ${new Date(date.created_at).toDateString()}`}
        </p>
        <PlayerContainer data={data} loading={loading} />
      </div>
    </div>
  );
};

export default Season;
