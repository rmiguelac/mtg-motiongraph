import { PALETTE } from "./config.js";

/**
 * Load and process the CSV data.
 * Returns { raw, dates, playerData }.
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
    d.dateObj = new Date(d.date.replace(/\./g, "-"));
  });

  // Sort by date
  raw.sort((a, b) => a.dateObj - b.dateObj);

  // Unique sorted dates
  const dates = [...new Set(raw.map((d) => d.date))].sort(
    (a, b) =>
      new Date(a.replace(/\./g, "-")) - new Date(b.replace(/\./g, "-"))
  );

  // All unique players
  const allPlayers = [...new Set(raw.map((d) => d.name))];

  // Build cumulative totals per player per date
  const cumulative = {};
  const runningTotals = {};
  allPlayers.forEach((p) => {
    cumulative[p] = [];
    runningTotals[p] = 0;
  });

  dates.forEach((date) => {
    const tourneyRows = raw.filter((d) => d.date === date);
    const playersThisDate = new Set();

    tourneyRows.forEach((row) => {
      runningTotals[row.name] += row.points;
      playersThisDate.add(row.name);
    });

    allPlayers.forEach((p) => {
      cumulative[p].push({
        date,
        dateObj: new Date(date.replace(/\./g, "-")),
        total: runningTotals[p],
        played: playersThisDate.has(p),
      });
    });
  });

  // Build array and sort by final total (desc)
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

  // Re-assign colors after sort so top players get distinct colors
  playerData.forEach((d, i) => (d.color = PALETTE[i % PALETTE.length]));

  return { raw, dates, playerData };
}
