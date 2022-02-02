const { promises } = require("fs");
const fs = require("fs");

let second;
try {
  const data = fs.readFileSync("csv/farmers.csv", "utf8");
  second = data;
} catch (err) {
  console.error(err);
}

let jsonData = [];

function csvToArray(str, delimiter = ",") {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

const data = csvToArray(second);

const calculateRank = (rank) => {
  switch (rank) {
    case "1":
      return {
        rank: {
          first: 1,
        },
      };
      break;
    case "2":
      return {
        rank: {
          second: 1,
        },
      };
      break;
    case "3":
      return {
        rank: {
          third: 1,
        },
      };
      break;
    case "4":
      return {
        rank: {
          fourth: 1,
        },
      };
      break;
    case "5":
      return {
        rank: {
          fifth: 1,
        },
      };
      break;
    default:
      return null;
  }
};

const tournamentData = data
  .map((item) => {
    if (!item.EntryName) return;
    if (undefined) return;
    console.log("rank", item.Rank === 1);
    return {
      name: item.EntryName,
      points: item.Points,
      rank: calculateRank(item.Rank),
    };
  })
  .filter((item) => item !== undefined);

const write = async () => {
  console.log("before");
  const data = await promises.readFile("./data.json");

  const json = JSON.parse(data);

  if (!json.length) {
    json.push(tournamentData);
  } else {
    tournamentData.map((item) => {
      const found = json[0].find((foundItem) => foundItem.name === item.name);

      found.points = Number(found.points) + Number(item.points);
    });

    json[0].sort((a, b) => {
      return b.points - a.points;
    });
  }

  try {
    await promises.writeFile("data.json", JSON.stringify(json));
    console.log("File saved successfully!");
  } catch (err) {
    if (err) {
      return console.error(err);
    }
  }
};
write();
