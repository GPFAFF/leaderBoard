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
        first: 1,
      };
      break;
    case "2":
      return {
        second: 1,
      };
      break;
    case "3":
      return {
        third: 1,
      };
      break;
    case "4":
      return {
        fourth: 1,
      };
      break;
    case "5":
      return {
        fifth: 1,
      };
      break;
    default:
      return {};
  }
};

const mergeRanks = (found, r) => {
  const hasRankObj = Object.keys(r).length;
  // look at the found ranks, if key is found increment
  // otherwise add the rank
  if (hasRankObj) {
    console.log(r, found);
    console.log("F", Object.keys(r)[0] === Object.values(found.rank)[0]);
    console.log("fmmfmff", Object.keys(found.rank)[0]);
    if (Object.keys(r)[0] === Object.keys(found.rank)[0]) {
      found.rank = {
        [Object.keys(found.rank)]: Object.values(found.rank)[0] + 1,
      };
    } else {
      found.rank = {
        ...found.rank,
        ...r,
      };
    }
  } else {
    found.rank = {
      ...found.rank,
      ...r,
    };
  }
};

const tournamentData = data
  .map((item) => {
    if (!item.EntryName) return;
    if (undefined) return;
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
    tournamentData.map(async (item) => {
      const found = json[0].find((foundItem) => foundItem.name === item.name);

      found.points = Number(found.points) + Number(item.points);
      found.ranks = await mergeRanks(found, item.rank);
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
