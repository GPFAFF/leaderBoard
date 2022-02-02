console.log("loaded");

const getData = fetch("./test-data.json")
  .then((res) => res.json())
  .then((data) => {
    console.log("data:", data);
  });

console.log(getData);
