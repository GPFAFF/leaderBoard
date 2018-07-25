console.log('loaded');

const getData = fetch('https://raw.githubusercontent.com/GPFAFF/leaderBoard/master/data.json')
  .then((res) => res.json())
  .then((data) => {
    console.log('data:', data);
  })

console.log(getData);
