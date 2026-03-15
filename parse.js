const fs = require("fs");
const { promises } = fs;

/* =====================================================
   CONFIG
===================================================== */

const teamNames = [
  "aceshigh1973",
  "American-Dream",
  "boyewsky",
  "brotherjonas",
  "cairnssj",
  "chicagoputz",
  "cmilly-97",
  "concord",
  "cubyblue",
  "darksidefan",
  "gapfaff",
  "Gm0ney720",
  "holth",
  "hupfdaddy",
  "jabella72",
  "JonBuc1",
  "Jph315",
  "Knock0ut12",
  "Lumberjac",
  "magic_21",
  "NPitz14",
  "ryanhupfer",
  "snyde167",
  "VOODOG23",
];

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

  let adjustment = 0;
  for (const wd of wdOnRoster) {
    console.log(`  WD fix: ${wd} → adding ${lowestNonZero} to team total`);
    adjustment += lowestNonZero;
  }

  return adjustment;
};

/* =====================================================
   RANK HANDLING — computed from sorted league standings
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

const addMissingTeams = (data) => {
  const lowest = findLowestScore(data);

  const missing = teamNames.filter(
    (name) => !data.find((d) => d.name.toLowerCase() === name.toLowerCase()),
  );

  if (missing.length > 0) {
    console.log(
      `  Backfilling ${missing.length} missing teams at ${lowest} pts:`,
    );
    missing.forEach((n) => console.log(`    ${n}`));
  }

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
   NAME VALIDATION — find mismatches
===================================================== */

const validateNames = (csvEntries) => {
  const csvNames = [...new Set(csvEntries.map((r) => r.EntryName))];
  const unknown = csvNames.filter(
    (n) => !teamNames.some((t) => t.toLowerCase() === n.toLowerCase()),
  );
  if (unknown.length > 0) {
    console.log("  ⚠ Unknown names (not in teamNames):", unknown.join(", "));
  }

  // Check for case mismatches
  for (const csvName of csvNames) {
    const match = teamNames.find(
      (t) => t.toLowerCase() === csvName.toLowerCase(),
    );
    if (match && match !== csvName) {
      console.log(
        `  ⚠ Case mismatch: CSV has "${csvName}", teamNames has "${match}"`,
      );
    }
  }
};

/* =====================================================
   MAIN
===================================================== */

let csvInput;

try {
  csvInput = fs.readFileSync(process.argv[2], "utf8");
} catch (err) {
  console.error("Failed to read CSV:", err.message);
  process.exit(1);
}

// Parse all args after the csv file path
const allArgs = process.argv.slice(3);

// Multiplier is the first non-flag arg (if it's a number)
const multiplierArg = allArgs.find(
  (a) => !a.startsWith("--") && !a.includes(":") && !isNaN(Number(a)),
);
const pointsMultiplier = multiplierArg ? Number(multiplierArg) : 1;
console.log(`\nProcessing: ${process.argv[2]} (${pointsMultiplier}x)`);

// Everything that isn't the multiplier
const extraArgs = allArgs.filter((a) => a !== multiplierArg);

const wdNames = extraArgs
  .filter((arg) => arg.startsWith("--wd="))
  .map((arg) => arg.slice(5).replace(/_/g, " ").trim())
  .filter(Boolean);

if (wdNames.length > 0) {
  console.log("WD players:", wdNames.join(", "));
}

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

// Parse all rows
const allRows = csvToArray(csvInput);
const playerScores = buildPlayerScores(allRows);

// Filter to team entries only
const teamRows = allRows.filter((row) => row.EntryName);

// Validate names
validateNames(teamRows);

// Build tournament data with WD adjustments
const tournamentData = teamRows.map((row) => {
  const originalPoints = Number(row.Points);
  const lineup = row.Lineup;
  const wdAdjustment = adjustForWithdrawals(lineup, playerScores, wdNames);
  const finalPoints = (originalPoints + wdAdjustment) * pointsMultiplier;

  return {
    name: row.EntryName,
    points: finalPoints,
    rank: { ...EMPTY_RANK }, // rank assigned below after sorting
  };
});

// Sort by points DESC and assign rank from league standings (not CSV Rank)
tournamentData.sort((a, b) => b.points - a.points);
tournamentData.forEach((entry, i) => {
  if (i < 5) {
    entry.rank[rankKeys[i]] = 1;
  }
});

// Apply manual overrides
for (const override of manualOverrides) {
  const existing = tournamentData.find(
    (t) => t.name.toLowerCase() === override.name.toLowerCase(),
  );
  if (existing) {
    console.log(
      `  Override: ${existing.name} ${existing.points} → ${override.score}`,
    );
    existing.points = override.score;
  } else {
    console.log(`  Adding: ${override.name} → ${override.score}`);
    tournamentData.push({
      name: override.name,
      points: override.score,
      rank: { ...EMPTY_RANK },
    });
  }
}

/* =====================================================
   CONFIRM PROMPT
===================================================== */

const readline = require("readline");

const confirm = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
};

/* =====================================================
   PREVIEW & WRITE
===================================================== */

const run = async () => {
  let json = [];

  try {
    const raw = await promises.readFile("./data.json", "utf8");
    json = JSON.parse(raw);
  } catch {
    json = [];
  }

  const leaderboard = json[0] ?? [];

  // ── Missing team names report ─────────────────────
  const csvNames = tournamentData.map((t) => t.name.toLowerCase());
  const missingFromCsv = teamNames.filter(
    (n) => !csvNames.includes(n.toLowerCase()),
  );
  const lowest =
    tournamentData.length > 0
      ? Math.min(...tournamentData.map((t) => t.points))
      : 0;

  console.log("\n── Tournament Summary ──────────────────────────");
  console.log(`  Entries found:  ${tournamentData.length}`);
  console.log(`  League members: ${teamNames.length}`);

  if (missingFromCsv.length > 0) {
    console.log(`\n  ⚠ Missing from CSV (${missingFromCsv.length}):`);
    console.log(`    Will be backfilled at ${lowest} pts`);
    missingFromCsv.forEach((n) => console.log(`    - ${n}`));
  } else {
    console.log("  ✓ All league members present");
  }

  // ── Preview standings ─────────────────────────────
  const normalizedTournament =
    tournamentData.length < teamNames.length
      ? addMissingTeams(tournamentData)
      : tournamentData;

  // Show this week's results
  console.log("\n── This Week's Results ─────────────────────────");
  const sorted = [...normalizedTournament].sort((a, b) => b.points - a.points);
  sorted.forEach((e, i) =>
    console.log(
      `  ${String(i + 1).padStart(3)}.  ${e.name.padEnd(20)} ${e.points.toFixed(2).padStart(10)}`,
    ),
  );

  console.log(
    `\n  ${normalizedTournament.length} entries → merging into leaderboard (${leaderboard.length} existing)`,
  );

  // ── Skip confirm with --yes flag ──────────────────
  if (!process.argv.includes("--yes")) {
    const answer = await confirm("\n  Proceed? (y/n): ");
    if (answer !== "y" && answer !== "yes") {
      console.log("  ✗ Aborted.\n");
      process.exit(0);
    }
  }

  // ── Write ─────────────────────────────────────────
  mergeTournamentIntoLeaderboard(leaderboard, normalizedTournament);

  await promises.writeFile(
    "./data.json",
    JSON.stringify([leaderboard], null, 2),
  );

  console.log("  ✓ Saved to data.json\n");

  // Print top 5
  console.log("  Current top 5:");
  leaderboard
    .slice(0, 5)
    .forEach((e, i) =>
      console.log(`    ${i + 1}. ${e.name.padEnd(20)} ${e.points}`),
    );
  console.log();
};

run().catch(console.error);
