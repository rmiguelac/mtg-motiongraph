import { loadData } from "./data.js";
import { buildChart } from "./chart.js";
import { initAnimation } from "./animation.js";

// Shared mutable state
const state = {
  speed: 1000,
  currentStep: 0,
  hiddenPlayers: new Set(),
  top3Mode: false,
  viewMode: "ranking",  // "ranking" | "deckwins"
};

async function main() {
  const { raw, dates, playerData, deckData } = await loadData("data/data.csv");
  const chart = buildChart({ raw, dates, playerData, deckData, state });
  initAnimation({ chart, state });
}

main();
