/* =====================================================
   SCORING — pure functions extracted for testability
===================================================== */

const EMPTY_RANK = {
  first: 0,
  second: 0,
  third: 0,
  fourth: 0,
  fifth: 0,
};

const rankKeys = ["first", "second", "third", "fourth", "fifth"];

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

const parseLineup = (lineupStr) => {
  if (!lineupStr) return [];
  return lineupStr
    .trim()
    .split(/\s+G\s+/)
    .map((name) => name.replace(/^G\s+/, "").trim())
    .filter(Boolean);
};

const adjustForWithdrawals = (lineupStr, playerScores, wdNames) => {
  if (wdNames.length === 0) return 0;

  const players = parseLineup(lineupStr);
  if (players.length === 0) return 0;

  const wdOnRoster = players.filter((p) =>
    wdNames.some((wd) => wd.toLowerCase() === p.toLowerCase()),
  );

  if (wdOnRoster.length === 0) return 0;

  const nonWdScores = players
    .filter((p) => !wdNames.some((wd) => wd.toLowerCase() === p.toLowerCase()))
    .map((p) => playerScores[p] ?? 0)
    .filter((s) => s > 0);

  if (nonWdScores.length === 0) return 0;

  const lowestNonZero = Math.min(...nonWdScores);

  return wdOnRoster.length * lowestNonZero;
};

/* =====================================================
   RANK HANDLING
===================================================== */

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

const addMissingTeams = (data, teamNames) => {
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
   TOURNAMENT SCORING PIPELINE
===================================================== */

const buildTournamentData = (teamRows, playerScores, wdNames, pointsMultiplier) => {
  const tournamentData = teamRows.map((row) => {
    const originalPoints = Number(row.Points);
    const lineup = row.Lineup;
    const wdAdjustment = adjustForWithdrawals(lineup, playerScores, wdNames);
    const finalPoints = (originalPoints + wdAdjustment) * pointsMultiplier;

    return {
      name: row.EntryName,
      points: finalPoints,
      rank: { ...EMPTY_RANK },
    };
  });

  tournamentData.sort((a, b) => b.points - a.points);
  tournamentData.forEach((entry, i) => {
    if (i < 5) {
      entry.rank[rankKeys[i]] = 1;
    }
  });

  return tournamentData;
};

/* =====================================================
   CALCULATE TOTAL (frontend logic)
===================================================== */

const calculateTotal = (scores) => {
  return scores.reduce((acc, currentValue) => {
    return acc + currentValue.tournamentScore * currentValue.tournamentType;
  }, 0);
};

module.exports = {
  EMPTY_RANK,
  rankKeys,
  csvToArray,
  buildPlayerScores,
  parseLineup,
  adjustForWithdrawals,
  mergeRanks,
  findLowestScore,
  addMissingTeams,
  mergeTournamentIntoLeaderboard,
  buildTournamentData,
  calculateTotal,
};
