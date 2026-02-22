import { PALETTE, parseLocalDate } from "./config.js";

/**
 * Load the CSV once. Returns raw rows + unique month values.
 */
export async function loadData(csvPath) {
  const raw = await d3.csv(csvPath);

  // Parse numeric fields
  raw.forEach((d) => {
    d.points = +d.points;
    d.wins = +d.wins;
    d.losses = +d.losses;
    d.draws = +d.draws;
    d.position = +d.position;
    d.dateObj = parseLocalDate(d.date);
  });

  // Sort by date
  raw.sort((a, b) => a.dateObj - b.dateObj);

  // Unique months in order of appearance
  const months = [...new Set(raw.map((d) => d.month))];

  return { raw, months };
}

/**
 * Process raw data (optionally filtered by month) into
 * { dates, playerData, deckData } ready for the chart.
 */
export function processData(raw, monthFilter) {
  const filtered = monthFilter
    ? raw.filter((d) => d.month === monthFilter)
    : raw;

  // Unique sorted dates
  const dates = [...new Set(filtered.map((d) => d.date))].sort(
    (a, b) => parseLocalDate(a) - parseLocalDate(b)
  );

  // All unique players
  const allPlayers = [...new Set(filtered.map((d) => d.name))];

  // Build cumulative totals per player per date
  const cumulative = {};
  const runningTotals = {};
  allPlayers.forEach((p) => {
    cumulative[p] = [];
    runningTotals[p] = 0;
  });

  dates.forEach((date) => {
    const tourneyRows = filtered.filter((d) => d.date === date);
    const playersThisDate = new Set();

    tourneyRows.forEach((row) => {
      runningTotals[row.name] += row.points;
      playersThisDate.add(row.name);
    });

    allPlayers.forEach((p) => {
      cumulative[p].push({
        date,
        dateObj: parseLocalDate(date),
        total: runningTotals[p],
        played: playersThisDate.has(p),
      });
    });
  });

  const playerData = allPlayers.map((name, i) => ({
    name,
    color: PALETTE[i % PALETTE.length],
    values: cumulative[name],
  }));

  playerData.sort(
    (a, b) =>
      b.values[b.values.length - 1].total -
      a.values[a.values.length - 1].total
  );
  playerData.forEach((d, i) => (d.color = PALETTE[i % PALETTE.length]));

  // ─── Deck wins data ───
  const allDecks = [...new Set(filtered.map((d) => d.deck))];
  const deckCumulative = {};
  const deckRunning = {};
  allDecks.forEach((dk) => {
    deckCumulative[dk] = [];
    deckRunning[dk] = 0;
  });

  dates.forEach((date) => {
    const tourneyRows = filtered.filter((d) => d.date === date);
    tourneyRows.forEach((row) => {
      deckRunning[row.deck] += row.wins;
    });
    allDecks.forEach((dk) => {
      deckCumulative[dk].push({
        date,
        dateObj: parseLocalDate(date),
        total: deckRunning[dk],
      });
    });
  });

  const deckData = allDecks.map((name, i) => ({
    name,
    color: PALETTE[i % PALETTE.length],
    values: deckCumulative[name],
  }));

  deckData.sort(
    (a, b) =>
      b.values[b.values.length - 1].total -
      a.values[a.values.length - 1].total
  );
  deckData.forEach((d, i) => (d.color = PALETTE[i % PALETTE.length]));

  // ─── Podium (top-3 finishes) data ───
  const podiumCumulative = {};
  const podiumRunning = {};
  allPlayers.forEach((p) => {
    podiumCumulative[p] = [];
    podiumRunning[p] = 0;
  });

  dates.forEach((date) => {
    const tourneyRows = filtered.filter((d) => d.date === date);
    tourneyRows.forEach((row) => {
      if (row.position === 1) {
        podiumRunning[row.name] += 1;
      }
    });
    allPlayers.forEach((p) => {
      podiumCumulative[p].push({
        date,
        dateObj: parseLocalDate(date),
        total: podiumRunning[p],
      });
    });
  });

  const podiumData = allPlayers.map((name, i) => ({
    name,
    color: PALETTE[i % PALETTE.length],
    values: podiumCumulative[name],
  }));

  podiumData.sort(
    (a, b) =>
      b.values[b.values.length - 1].total -
      a.values[a.values.length - 1].total
  );
  podiumData.forEach((d, i) => (d.color = PALETTE[i % PALETTE.length]));

  // ─── Top-3 finishes data ───
  const top3Cumulative = {};
  const top3Running = {};
  allPlayers.forEach((p) => {
    top3Cumulative[p] = [];
    top3Running[p] = 0;
  });

  dates.forEach((date) => {
    const tourneyRows = filtered.filter((d) => d.date === date);
    tourneyRows.forEach((row) => {
      if (row.position <= 3) {
        top3Running[row.name] += 1;
      }
    });
    allPlayers.forEach((p) => {
      top3Cumulative[p].push({
        date,
        dateObj: parseLocalDate(date),
        total: top3Running[p],
      });
    });
  });

  const top3Data = allPlayers.map((name, i) => ({
    name,
    color: PALETTE[i % PALETTE.length],
    values: top3Cumulative[name],
  }));

  top3Data.sort(
    (a, b) =>
      b.values[b.values.length - 1].total -
      a.values[a.values.length - 1].total
  );
  top3Data.forEach((d, i) => (d.color = PALETTE[i % PALETTE.length]));

  // ─── Deck popularity data (cumulative appearances) ───
  const deckPopCumulative = {};
  const deckPopRunning = {};
  allDecks.forEach((dk) => {
    deckPopCumulative[dk] = [];
    deckPopRunning[dk] = 0;
  });

  dates.forEach((date) => {
    const tourneyRows = filtered.filter((d) => d.date === date);
    tourneyRows.forEach((row) => {
      deckPopRunning[row.deck] += 1;
    });
    allDecks.forEach((dk) => {
      deckPopCumulative[dk].push({
        date,
        dateObj: parseLocalDate(date),
        total: deckPopRunning[dk],
      });
    });
  });

  const deckPopData = allDecks.map((name, i) => ({
    name,
    color: PALETTE[i % PALETTE.length],
    values: deckPopCumulative[name],
  }));

  deckPopData.sort(
    (a, b) =>
      b.values[b.values.length - 1].total -
      a.values[a.values.length - 1].total
  );
  deckPopData.forEach((d, i) => (d.color = PALETTE[i % PALETTE.length]));

  return { dates, playerData, deckData, podiumData, top3Data, deckPopData };
}
