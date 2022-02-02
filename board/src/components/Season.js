import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlayerContainer from "./PlayerContainer";
import Header from "./Header";

import axios from "axios";
import test from "../test-data.json";

const Season = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  let merged = [];

  const [one, two] = test;

  console.log("one", one);
  console.log("two", two);

  // const findSecond = (item, index) => {
  //   return two.find((itmInner) => {
  //     if (itmInner.name.toLowerCase() === one[index].name.toLowerCase()) {
  //       console.log("find", itmInner);
  //       // console.log(
  //       //   "fuck",
  //       //   Number(one[index].points) + Number(itmInner.points)
  //       // );
  //       one[index].points = Number(one[index].points) + Number(itmInner.points);
  //     }
  //   });
  // };

  // let count = 0;

  // one.map((item, index) => {
  //   console.log(count++);
  //   return {
  //     ...one[index],
  //     points: item.points + findSecond(item, index),
  //   };
  // });

  // console.log("one", one);

  // const rd = test.map((t, i) => {
  //   let arr = [...t];

  //   console.log("arr", arr);
  //   return arr.map((item, index) => {
  //     // console.log("item", item);

  //     const found = arr.find((found) => {
  //       if (item.name.toLowerCase()) return found;
  //       return [];
  //     });

  //     // console.log("found", found, item);

  //     if (!found) {
  //       arr.push(item);
  //     } else {
  //       // console.log("meh");
  //       // console.log(item.points, found.points);
  //       // found.points = found.points + item.points;
  //     }
  //     return arr;
  //   });
  // });
  // const rd = test.reduce((acc, curr, index) => {
  //   console.log("++++++++++++++++++");
  //   let arr = [];
  //   return curr.map((item, index) => {
  //     console.log("item", item);
  //     if (!arr.includes(item.name)) {
  //       arr.push(item);
  //     } else {
  //       const found = arr.find((found) => found.name === item.name);
  //       found.points += item.points;
  //     }
  //     return arr;
  //   });
  // }, []);

  // console.log("RD", rd);

  useEffect(() => {
    setLoading(true);
    axios(
      "https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/data.json"
    ).then((res) => setData(res.data));

    setLoading(false);
  }, []);

  return (
    <div>
      <Header />
      <div className="league-container">
        <Link className="navigation-button" to="/">
          Home
        </Link>
        <h2 className="season-title">Regular Season</h2>
        <PlayerContainer data={data} loading={loading} />
      </div>
    </div>
  );
};

export default Season;
