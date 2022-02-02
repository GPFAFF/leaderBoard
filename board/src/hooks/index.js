import * as React from "react";
import axios from "axios";

export const useCalculateTotal = (scores) => {
  const scoresArray = scores.reduce((acc, currentValue) => {
    const total =
      acc + currentValue.tournamentScore * currentValue.tournamentType;
    return total;
  }, 0);

  return scoresArray;
};

export const useFormatPoints = (pointsBack) => {
  if (pointsBack === "0.00") {
    return <p>Points Back: 0</p>;
  }
  return <p>Points Back: -{pointsBack} </p>;
};

export const useIcon = (player) => {
  const [isIconLoading, setIsIconLoading] = React.useState(true);
  const [icon, setIcon] = React.useState("");
  const [data, setData] = React.useState([]);
  React.useEffect(() => {
    setIsIconLoading(true);
    axios(
      "https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/data.json"
    ).then((res) => setData(res.data));

    setIsIconLoading(false);
  }, []);

  console.log(data);

  const iconData = data.find(
    (item) => item.name.toLowerCase() === player.name.toLowerCase()
  );
  setIcon(iconData);

  return {
    icon,
    isIconLoading,
  };
};
