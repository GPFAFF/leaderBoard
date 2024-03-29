const { promises } = require("fs");
const fs = require("fs");

const teamNames = [
  "gapfaff",
  "ryanhupfer",
  "jimm743",
  "mlewicki",
  "NPitz14",
  "chicagoputz",
  "andcohen2525",
  "concord",
  "cubyblue",
  "jabella72",
  "darksidefan",
  "boyewsky",
  "JonBuc1",
  "American-Dream",
  "Jph315",
  "magic_21",
  "cmilly-97",
];

let second;
try {
  const data = fs.readFileSync(process.argv[2], "utf8");
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
  const hasRankObj = found.rank.hasOwnProperty(Object.keys(r));
  // look at the found ranks, if key is found increment
  // otherwise add the rank
  if (hasRankObj) {
    const returnCurrentTotal = Object.keys(found.rank)
      .filter((key) => key.includes(Object.keys(r)[0]))
      .reduce((obj, key) => {
        return Object.assign(obj, {
          [key]: found.rank[key],
        });
      }, {});

    if (Object.keys(found.rank).find((rank) => rank === Object.keys(r)[0])) {
      found.rank = {
        ...found.rank,
        [Object.keys(r)]: Number(Object.values(returnCurrentTotal)) + 1,
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

    const points = process.argv[3] ?? 1;

    return {
      name: item.EntryName,
      points: item.Points * Number(points),
      rank: calculateRank(item.Rank),
    };
  })
  .filter((item) => item !== undefined);

const write = async () => {
  const data = await promises.readFile("./data.json");

  const json = JSON.parse(data);

  if (!json.length) {
    json.push(tournamentData);
  } else {
    if (tournamentData.length < 20) {
      // find missing lineups
      // create object entries
      // merge missing data
      // add missing data
      const findLowestScore = () => {
        return tournamentData.reduce((a, b) => {
          const aEnd = a.points !== null ? a.points : 0;
          const bEnd = b.points !== null ? b.points : 0;
          return aEnd < bEnd ? a : b;
        });
      };

      const missingNames = teamNames
        .map((item) => item)
        .filter((name) => !tournamentData.find((item) => item.name === name));

      console.log("missingNames", missingNames);

      const calculateMissedEntries = missingNames.map((item) => {
        return {
          name: item,
          points: findLowestScore().points,
          rank: {},
        };
      });

      let data = [...tournamentData, ...calculateMissedEntries];

      data.map(async (item) => {
        const found = json[0].find((foundItem) => foundItem.name === item.name);

        found.points = (Number(found.points) + Number(item.points)).toFixed(2);
        found.ranks = await mergeRanks(found, item.rank);
      });
    } else {
      tournamentData.map(async (item) => {
        const found = json[0].find((foundItem) => foundItem.name === item.name);

        found.points = (Number(found.points) + Number(item.points)).toFixed(2);
        found.ranks = await mergeRanks(found, item.rank);
      });
    }

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
