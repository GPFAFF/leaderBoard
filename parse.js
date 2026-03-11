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
   PLAYER SCORE LOOKUP & WD HANDLING
===================================================== */

/**
 * Build a map of player name → FPTS from the CSV rows.
 * The Player/FPTS columns appear on every row (both team rows
 * and the standalone player rows at the bottom).
 */
const buildPlayerScores = (rows) => {
  const scores = {};
  for (const row of rows) {
    const player = (row.Player || "").trim();
    const fpts = Number(row.FPTS) || 0;
    if (player) {
      scores[player] = fpts;
    }
  }
  return scores;
};

/**
 * Parse the Lineup string into an array of player names.
 * Format: "G Hideki Matsuyama G Si Woo Kim G Denny McCarthy ..."
 * Each player is prefixed with "G " (the roster position).
 */
const parseLineup = (lineupStr) => {
  if (!lineupStr) return [];
  return lineupStr
    .trim()
    .split(/\s+G\s+/)
    .map((name) => name.replace(/^G\s+/, "").trim())
    .filter(Boolean);
};

/**
 * Given a team's lineup and a list of WD player names,
 * check if the team rostered any of them. For each WD player
 * found, add the lowest non-zero score from the remaining
 * roster to the team's total.
 *
 * Returns the adjustment to ADD to the team's original Points.
 */
const adjustForWithdrawals = (lineupStr, playerScores, wdNames) => {
  if (wdNames.length === 0) return 0;

  const players = parseLineup(lineupStr);
  if (players.length === 0) return 0;

  // Check which WD players are on this roster (case-insensitive)
  const wdOnRoster = players.filter((p) =>
    wdNames.some((wd) => wd.toLowerCase() === p.toLowerCase()),
  );

  if (wdOnRoster.length === 0) return 0;

  // Get scores for the non-WD players on this roster
  const nonWdScores = players
    .filter((p) => !wdNames.some((wd) => wd.toLowerCase() === p.toLowerCase()))
    .map((p) => playerScores[p] ?? 0)
    .filter((s) => s > 0);

  if (nonWdScores.length === 0) return 0;

  const lowestNonZero = Math.min(...nonWdScores);

  let adjustment = 0;
  for (const wd of wdOnRoster) {
    console.log(`  WD fix: ${wd} → adding ${lowestNonZero} to team total`);
    adjustment += lowestNonZero;
  }

  return adjustment;
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

const findLowestScore = (data) =>
  Math.min(...data.map((d) => Number(d.points) || 0));

const addMissingTeams = (data) => {
  const lowest = findLowestScore(data);

  const missing = teamNames.filter(
    (name) => !data.find((d) => d.name.toLowerCase() === name.toLowerCase()),
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
    const found = leaderboard.find(
      (l) => l.name.toLowerCase() === entry.name.toLowerCase(),
    );

    if (!found) {
      leaderboard.push({
        name: entry.name,
        points: (Number(entry.points) || 0).toFixed(2),
        rank: { ...entry.rank },
      });
      continue;
    }

    found.points = (
      (Number(found.points) || 0) + (Number(entry.points) || 0)
    ).toFixed(2);

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

// Parse optional args from argv[4+]:
//   --wd=Player_Name   (underscores become spaces)
//   Team:Score          (manual score override)
const extraArgs = process.argv.slice(4);

if (extraArgs.length > 0) {
  console.log("Raw args:", extraArgs);
}

// Parse WD players: --wd=Gary_Woodland → "Gary Woodland"
const wdNames = extraArgs
  .filter((arg) => arg.startsWith("--wd="))
  .map((arg) => arg.slice(5).replace(/_/g, " ").trim())
  .filter(Boolean);

if (wdNames.length > 0) {
  console.log("WD players:");
  wdNames.forEach((name) => console.log(`  ${name}`));
}

// Parse manual overrides: Team:Score
const manualOverrides = extraArgs
  .filter((arg) => !arg.startsWith("--") && arg.includes(":"))
  .map((arg) => {
    const lastColon = arg.lastIndexOf(":");
    if (lastColon === -1) return null;
    const name = arg.slice(0, lastColon).trim();
    const score = Number(arg.slice(lastColon + 1).trim());
    if (!name || isNaN(score)) return null;
    return { name, score };
  })
  .filter(Boolean);

if (manualOverrides.length > 0) {
  console.log("Manual overrides:");
  manualOverrides.forEach((o) => console.log(`  ${o.name} → ${o.score}`));
}

// Parse all rows (both team entries and player-score rows)
const allRows = csvToArray(csvInput);

// Build player → FPTS lookup from ALL rows
const playerScores = buildPlayerScores(allRows);

// Process only team entries (rows with an EntryName)
const tournamentData = allRows
  .filter((row) => row.EntryName)
  .map((row) => {
    const originalPoints = Number(row.Points);
    const lineup = row.Lineup;

    // Add points for any WD players (replaced with roster's lowest non-zero)
    const wdAdjustment = adjustForWithdrawals(lineup, playerScores, wdNames);
    const finalPoints = originalPoints + wdAdjustment;

    return {
      name: row.EntryName,
      points: finalPoints * pointsMultiplier,
      rank: calculateRank(row.Rank),
    };
  });

// Apply manual overrides — update existing team or add new entry
for (const override of manualOverrides) {
  const existing = tournamentData.find(
    (t) => t.name.toLowerCase() === override.name.toLowerCase(),
  );
  if (existing) {
    console.log(
      `  Override: ${existing.name} points ${existing.points} → ${override.score}`,
    );
    existing.points = override.score;
  } else {
    console.log(`  Adding manual entry: ${override.name} → ${override.score}`);
    tournamentData.push({
      name: override.name,
      points: override.score,
      rank: { ...EMPTY_RANK },
    });
  }
}

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
