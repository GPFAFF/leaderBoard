/**
 * Tournament CSV → Cumulative Leaderboard
 */

const fs = require("fs");
const { promises } = fs;

/* =====================================================
   CONFIG
===================================================== */

const teamNames = [
  "jabella72",
  "gapfaff",
  "cmilly-97",
  "JonBuc1",
  "Knock0ut12",
  "SYNDE167",
  "aceshigh1973",
  "holth",
  "NPitz14",
  "chicagoputz",
  "cairnssj",
  "Jph315",
  "Lumberjac",
  "VOODOG23",
  "brotherjonas",
  "magic_21",
  "boyewsky",
  "ryanhupfer",
  "American-Dream",
  "Gm0ney720",
  "concord",
  "hupfdaddy",
  "darksidefan",
];

const EMPTY_RANK = {
  first: 0,
  second: 0,
  third: 0,
  fourth: 0,
  fifth: 0,
};

const rankMap = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
};

/* =====================================================
   CSV PARSING
===================================================== */

const csvToArray = (str, delimiter = ",") => {
  const [headerLine, ...lines] = str.trim().split("\n");
  const headers = headerLine.split(delimiter);

  return lines.map((line) => {
    const values = line.split(delimiter);
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  });
};

/* =====================================================
   RANK HANDLING
===================================================== */

const calculateRank = (rank) => {
  const result = { ...EMPTY_RANK };
  const key = rankMap[rank];
  if (key) result[key] = 1;
  return result;
};

const mergeRanks = (existing, incoming) => {
  for (const key of Object.keys(EMPTY_RANK)) {
    existing.rank[key] =
      (Number(existing.rank[key]) || 0) + (Number(incoming[key]) || 0);
  }
};

/* =====================================================
   TOURNAMENT NORMALIZATION
===================================================== */

const findLowestScore = (data) => Math.min(...data.map((d) => d.points));

const addMissingTeams = (data) => {
  const lowest = findLowestScore(data);

  const missing = teamNames.filter(
    (name) => !data.find((d) => d.name === name),
  );

  return [
    ...data,
    ...missing.map((name) => ({
      name,
      points: lowest,
      rank: { ...EMPTY_RANK },
    })),
  ];
};

/* =====================================================
   LEADERBOARD MERGE
===================================================== */

const mergeTournamentIntoLeaderboard = (leaderboard, tournament) => {
  for (const entry of tournament) {
    const found = leaderboard.find((l) => l.name === entry.name);

    if (!found) {
      leaderboard.push({
        name: entry.name,
        points: entry.points.toFixed(2),
        rank: { ...entry.rank },
      });
      continue;
    }

    found.points = (Number(found.points) + Number(entry.points)).toFixed(2);

    mergeRanks(found, entry.rank);
  }

  leaderboard.sort((a, b) => Number(b.points) - Number(a.points));
};

/* =====================================================
   MAIN
===================================================== */

let csvInput;

try {
  csvInput = fs.readFileSync(process.argv[2], "utf8");
} catch (err) {
  console.error("Failed to read CSV:", err);
  process.exit(1);
}

const pointsMultiplier = Number(process.argv[3] ?? 1);

const tournamentData = csvToArray(csvInput)
  .filter((row) => row.EntryName)
  .map((row) => ({
    name: row.EntryName,
    points: Number(row.Points) * pointsMultiplier,
    rank: calculateRank(row.Rank),
  }));

const write = async () => {
  let json = [];

  try {
    const raw = await promises.readFile("./data.json", "utf8");
    json = JSON.parse(raw);
  } catch {
    json = [];
  }

  const leaderboard = json[0] ?? [];

  const normalizedTournament =
    tournamentData.length < teamNames.length
      ? addMissingTeams(tournamentData)
      : tournamentData;

  mergeTournamentIntoLeaderboard(leaderboard, normalizedTournament);

  await promises.writeFile(
    "./data.json",
    JSON.stringify([leaderboard], null, 2),
  );

  console.log("File saved successfully!");
};

write().catch(console.error);
