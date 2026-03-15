const {
  EMPTY_RANK,
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
} = require("./scoring");

/* =====================================================
   csvToArray
===================================================== */

describe("csvToArray", () => {
  it("parses a simple CSV string into an array of objects", () => {
    const csv = "Name,Score\nAlice,100\nBob,200";
    const result = csvToArray(csv);
    expect(result).toEqual([
      { Name: "Alice", Score: "100" },
      { Name: "Bob", Score: "200" },
    ]);
  });

  it("handles a custom delimiter", () => {
    const csv = "Name;Score\nAlice;100";
    const result = csvToArray(csv, ";");
    expect(result).toEqual([{ Name: "Alice", Score: "100" }]);
  });

  it("returns an empty array for header-only CSV", () => {
    expect(csvToArray("Name,Score")).toEqual([]);
  });
});

/* =====================================================
   buildPlayerScores
===================================================== */

describe("buildPlayerScores", () => {
  it("builds a map of player names to FPTS scores", () => {
    const rows = [
      { Player: "Tiger Woods", FPTS: "85.5" },
      { Player: "Rory McIlroy", FPTS: "72" },
    ];
    expect(buildPlayerScores(rows)).toEqual({
      "Tiger Woods": 85.5,
      "Rory McIlroy": 72,
    });
  });

  it("ignores rows with empty player names", () => {
    const rows = [
      { Player: "", FPTS: "50" },
      { Player: "Phil", FPTS: "60" },
    ];
    expect(buildPlayerScores(rows)).toEqual({ Phil: 60 });
  });

  it("treats non-numeric FPTS as 0", () => {
    const rows = [{ Player: "Phil", FPTS: "N/A" }];
    expect(buildPlayerScores(rows)).toEqual({ Phil: 0 });
  });
});

/* =====================================================
   parseLineup
===================================================== */

describe("parseLineup", () => {
  it("parses a DraftKings-style lineup string", () => {
    const lineup = "G Tiger Woods G Rory McIlroy G Phil Mickelson";
    expect(parseLineup(lineup)).toEqual([
      "Tiger Woods",
      "Rory McIlroy",
      "Phil Mickelson",
    ]);
  });

  it("returns empty array for null/undefined", () => {
    expect(parseLineup(null)).toEqual([]);
    expect(parseLineup(undefined)).toEqual([]);
    expect(parseLineup("")).toEqual([]);
  });
});

/* =====================================================
   adjustForWithdrawals
===================================================== */

describe("adjustForWithdrawals", () => {
  const playerScores = {
    "Tiger Woods": 80,
    "Rory McIlroy": 60,
    "Phil Mickelson": 40,
    "Jon Rahm": 100,
  };

  it("returns 0 when no WD names provided", () => {
    const lineup = "G Tiger Woods G Rory McIlroy";
    expect(adjustForWithdrawals(lineup, playerScores, [])).toBe(0);
  });

  it("returns 0 when WD player is not on the roster", () => {
    const lineup = "G Tiger Woods G Rory McIlroy";
    expect(adjustForWithdrawals(lineup, playerScores, ["Jon Rahm"])).toBe(0);
  });

  it("adds lowest non-WD score for each WD player on roster", () => {
    const lineup = "G Tiger Woods G Rory McIlroy G Phil Mickelson";
    // Tiger WDs — lowest of remaining (Rory=60, Phil=40) is 40
    const adj = adjustForWithdrawals(lineup, playerScores, ["Tiger Woods"]);
    expect(adj).toBe(40);
  });

  it("handles multiple WD players on same roster", () => {
    const lineup = "G Tiger Woods G Rory McIlroy G Phil Mickelson G Jon Rahm";
    // Tiger + Rory WD — lowest of remaining (Phil=40, Jon=100) is 40
    // 2 WD players * 40 = 80
    const adj = adjustForWithdrawals(lineup, playerScores, [
      "Tiger Woods",
      "Rory McIlroy",
    ]);
    expect(adj).toBe(80);
  });

  it("is case-insensitive for WD name matching", () => {
    const lineup = "G Tiger Woods G Rory McIlroy";
    const adj = adjustForWithdrawals(lineup, playerScores, ["tiger woods"]);
    expect(adj).toBe(60); // lowest non-WD is Rory at 60
  });

  it("returns 0 when all non-WD players have 0 scores", () => {
    const scores = { "Tiger Woods": 80, "Phil Mickelson": 0 };
    const lineup = "G Tiger Woods G Phil Mickelson";
    const adj = adjustForWithdrawals(lineup, scores, ["Tiger Woods"]);
    expect(adj).toBe(0); // Phil has 0, filtered out
  });
});

/* =====================================================
   mergeRanks
===================================================== */

describe("mergeRanks", () => {
  it("accumulates rank counts into existing entry", () => {
    const existing = {
      rank: { first: 1, second: 0, third: 2, fourth: 0, fifth: 0 },
    };
    const incoming = { first: 0, second: 1, third: 0, fourth: 0, fifth: 1 };
    mergeRanks(existing, incoming);
    expect(existing.rank).toEqual({
      first: 1,
      second: 1,
      third: 2,
      fourth: 0,
      fifth: 1,
    });
  });

  it("handles string numbers in existing ranks", () => {
    const existing = {
      rank: { first: "2", second: "0", third: "0", fourth: "0", fifth: "0" },
    };
    mergeRanks(existing, { first: 1, second: 0, third: 0, fourth: 0, fifth: 0 });
    expect(existing.rank.first).toBe(3);
  });
});

/* =====================================================
   findLowestScore
===================================================== */

describe("findLowestScore", () => {
  it("finds the minimum points value", () => {
    const data = [
      { name: "A", points: 300 },
      { name: "B", points: 100 },
      { name: "C", points: 200 },
    ];
    expect(findLowestScore(data)).toBe(100);
  });

  it("handles string point values", () => {
    const data = [
      { name: "A", points: "150.50" },
      { name: "B", points: "75.25" },
    ];
    expect(findLowestScore(data)).toBe(75.25);
  });
});

/* =====================================================
   addMissingTeams
===================================================== */

describe("addMissingTeams", () => {
  it("backfills missing teams at the lowest score", () => {
    const data = [
      { name: "teamA", points: 200, rank: { ...EMPTY_RANK } },
      { name: "teamB", points: 100, rank: { ...EMPTY_RANK } },
    ];
    const allTeams = ["teamA", "teamB", "teamC"];
    const result = addMissingTeams(data, allTeams);

    expect(result).toHaveLength(3);
    const teamC = result.find((t) => t.name === "teamC");
    expect(teamC).toBeDefined();
    expect(teamC.points).toBe(100);
    expect(teamC.rank).toEqual(EMPTY_RANK);
  });

  it("is case-insensitive when matching team names", () => {
    const data = [{ name: "TeamA", points: 50, rank: { ...EMPTY_RANK } }];
    const allTeams = ["teama", "teamB"];
    const result = addMissingTeams(data, allTeams);
    expect(result).toHaveLength(2); // TeamA matched, teamB added
  });

  it("returns original data when no teams are missing", () => {
    const data = [
      { name: "teamA", points: 100, rank: { ...EMPTY_RANK } },
    ];
    const result = addMissingTeams(data, ["teamA"]);
    expect(result).toHaveLength(1);
  });
});

/* =====================================================
   mergeTournamentIntoLeaderboard
===================================================== */

describe("mergeTournamentIntoLeaderboard", () => {
  it("adds new entries to an empty leaderboard", () => {
    const leaderboard = [];
    const tournament = [
      { name: "teamA", points: 150, rank: { first: 1, second: 0, third: 0, fourth: 0, fifth: 0 } },
      { name: "teamB", points: 100, rank: { first: 0, second: 1, third: 0, fourth: 0, fifth: 0 } },
    ];
    mergeTournamentIntoLeaderboard(leaderboard, tournament);

    expect(leaderboard).toHaveLength(2);
    expect(leaderboard[0].name).toBe("teamA");
    expect(leaderboard[0].points).toBe("150.00");
    expect(leaderboard[0].rank.first).toBe(1);
  });

  it("accumulates points for existing entries", () => {
    const leaderboard = [
      { name: "teamA", points: "200.00", rank: { first: 1, second: 0, third: 0, fourth: 0, fifth: 0 } },
    ];
    const tournament = [
      { name: "teamA", points: 150, rank: { first: 0, second: 1, third: 0, fourth: 0, fifth: 0 } },
    ];
    mergeTournamentIntoLeaderboard(leaderboard, tournament);

    expect(leaderboard[0].points).toBe("350.00");
    expect(leaderboard[0].rank.first).toBe(1);
    expect(leaderboard[0].rank.second).toBe(1);
  });

  it("sorts leaderboard by points descending after merge", () => {
    const leaderboard = [
      { name: "teamA", points: "100.00", rank: { ...EMPTY_RANK } },
      { name: "teamB", points: "300.00", rank: { ...EMPTY_RANK } },
    ];
    const tournament = [
      { name: "teamA", points: 500, rank: { ...EMPTY_RANK } },
    ];
    mergeTournamentIntoLeaderboard(leaderboard, tournament);

    expect(leaderboard[0].name).toBe("teamA");
    expect(leaderboard[0].points).toBe("600.00");
    expect(leaderboard[1].name).toBe("teamB");
  });

  it("handles case-insensitive name matching", () => {
    const leaderboard = [
      { name: "TeamA", points: "100.00", rank: { ...EMPTY_RANK } },
    ];
    const tournament = [
      { name: "teama", points: 50, rank: { ...EMPTY_RANK } },
    ];
    mergeTournamentIntoLeaderboard(leaderboard, tournament);

    expect(leaderboard).toHaveLength(1);
    expect(leaderboard[0].points).toBe("150.00");
  });
});

/* =====================================================
   buildTournamentData
===================================================== */

describe("buildTournamentData", () => {
  const makeRow = (name, points, lineup = "") => ({
    EntryName: name,
    Points: String(points),
    Lineup: lineup,
  });

  it("converts team rows into scored tournament entries", () => {
    const rows = [makeRow("teamA", 200), makeRow("teamB", 300)];
    const result = buildTournamentData(rows, {}, [], 1);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("teamB"); // sorted by points DESC
    expect(result[0].points).toBe(300);
    expect(result[1].points).toBe(200);
  });

  it("applies points multiplier", () => {
    const rows = [makeRow("teamA", 100)];
    const result = buildTournamentData(rows, {}, [], 1.5);

    expect(result[0].points).toBe(150);
  });

  it("assigns ranks to the top 5 entries", () => {
    const rows = Array.from({ length: 7 }, (_, i) =>
      makeRow(`team${i}`, (7 - i) * 100),
    );
    const result = buildTournamentData(rows, {}, [], 1);

    expect(result[0].rank.first).toBe(1);
    expect(result[1].rank.second).toBe(1);
    expect(result[2].rank.third).toBe(1);
    expect(result[3].rank.fourth).toBe(1);
    expect(result[4].rank.fifth).toBe(1);
    // 6th and 7th get no rank
    expect(result[5].rank).toEqual(EMPTY_RANK);
    expect(result[6].rank).toEqual(EMPTY_RANK);
  });

  it("applies WD adjustments before multiplier", () => {
    const playerScores = { "Tiger Woods": 80, "Rory McIlroy": 50 };
    const rows = [
      {
        EntryName: "teamA",
        Points: "100",
        Lineup: "G Tiger Woods G Rory McIlroy",
      },
    ];
    // Tiger WDs: adjustment = 50 (lowest non-WD). Total = (100+50) * 1 = 150
    const result = buildTournamentData(rows, playerScores, ["Tiger Woods"], 1);
    expect(result[0].points).toBe(150);
  });

  it("applies WD adjustments then multiplier correctly", () => {
    const playerScores = { "Tiger Woods": 80, "Rory McIlroy": 50 };
    const rows = [
      {
        EntryName: "teamA",
        Points: "100",
        Lineup: "G Tiger Woods G Rory McIlroy",
      },
    ];
    // (100 + 50) * 2 = 300
    const result = buildTournamentData(rows, playerScores, ["Tiger Woods"], 2);
    expect(result[0].points).toBe(300);
  });
});

/* =====================================================
   calculateTotal (frontend scoring)
===================================================== */

describe("calculateTotal", () => {
  it("sums scores multiplied by their tournament type", () => {
    const scores = [
      { tournamentScore: 100, tournamentType: 1 },
      { tournamentScore: 200, tournamentType: 1.5 },
    ];
    expect(calculateTotal(scores)).toBe(400); // 100*1 + 200*1.5
  });

  it("returns 0 for an empty array", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("handles a single tournament", () => {
    const scores = [{ tournamentScore: 250, tournamentType: 2 }];
    expect(calculateTotal(scores)).toBe(500);
  });
});

/* =====================================================
   Integration: full scoring pipeline
===================================================== */

describe("full scoring pipeline", () => {
  it("processes CSV through to leaderboard merge correctly", () => {
    const csv = [
      "Rank,EntryName,Points,Lineup,Player,FPTS",
      "1,teamA,300,G Tiger G Rory,Tiger,80",
      "2,teamB,200,G Phil G Jon,Phil,60",
      "3,teamA,300,G Tiger G Rory,Rory,70",
      "4,teamB,200,G Phil G Jon,Jon,90",
    ].join("\n");

    const allRows = csvToArray(csv);
    const playerScores = buildPlayerScores(allRows);
    const teamRows = allRows.filter((r) => r.EntryName);
    const tournament = buildTournamentData(teamRows, playerScores, [], 1);

    // teamA appears twice with 300 pts each, teamB twice with 200 each
    // After dedup in buildTournamentData, we get 4 entries (it doesn't dedup)
    // But in a real CSV each row is one entry
    expect(tournament.length).toBe(4);
    expect(tournament[0].points).toBe(300);

    // Merge into leaderboard
    const leaderboard = [];
    mergeTournamentIntoLeaderboard(leaderboard, tournament);

    // teamA: 300+300=600, teamB: 200+200=400
    const teamA = leaderboard.find((e) => e.name === "teamA");
    const teamB = leaderboard.find((e) => e.name === "teamB");
    expect(teamA.points).toBe("600.00");
    expect(teamB.points).toBe("400.00");

    // Sorted by points DESC
    expect(leaderboard[0].name).toBe("teamA");
  });

  it("accumulates across multiple tournaments", () => {
    const leaderboard = [];

    // Tournament 1
    const t1 = [
      { name: "teamA", points: 100, rank: { first: 1, second: 0, third: 0, fourth: 0, fifth: 0 } },
      { name: "teamB", points: 80, rank: { first: 0, second: 1, third: 0, fourth: 0, fifth: 0 } },
    ];
    mergeTournamentIntoLeaderboard(leaderboard, t1);

    expect(leaderboard[0].points).toBe("100.00");

    // Tournament 2 — teamB wins
    const t2 = [
      { name: "teamB", points: 150, rank: { first: 1, second: 0, third: 0, fourth: 0, fifth: 0 } },
      { name: "teamA", points: 50, rank: { first: 0, second: 1, third: 0, fourth: 0, fifth: 0 } },
    ];
    mergeTournamentIntoLeaderboard(leaderboard, t2);

    // teamA: 100+50=150, teamB: 80+150=230
    expect(leaderboard[0].name).toBe("teamB");
    expect(leaderboard[0].points).toBe("230.00");
    // teamB: t1 second=1, t2 first=1
    expect(leaderboard[0].rank.first).toBe(1);
    expect(leaderboard[0].rank.second).toBe(1);

    expect(leaderboard[1].name).toBe("teamA");
    expect(leaderboard[1].points).toBe("150.00");
    expect(leaderboard[1].rank.first).toBe(1);
    expect(leaderboard[1].rank.second).toBe(1);
  });
});
