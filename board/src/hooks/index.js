import * as React from 'react'

export const useCalculateTotal = (scores) => {
  const scoresArray = scores.reduce((acc, currentValue) => {
    const total =
      acc + currentValue.tournamentScore * currentValue.tournamentType;
    return total;
  }, 0);

  return scoresArray;
}

export const useFormatPoints = (pointsBack) => {
  if (pointsBack === "0.00") {
    return <p>Points Back: 0</p>;
  }
  return <p>Points Back: -{pointsBack} </p>;
}
