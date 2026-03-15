const fs = require("fs");
const { promises } = fs;
const {
  EMPTY_RANK,
  rankKeys,
  csvToArray,
  buildPlayerScores,
  adjustForWithdrawals,
  addMissingTeams,
  mergeTournamentIntoLeaderboard,
  buildTournamentData,
} = require("./scoring");

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
const tournamentData = buildTournamentData(teamRows, playerScores, wdNames, pointsMultiplier);

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
      ? addMissingTeams(tournamentData, teamNames)
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
