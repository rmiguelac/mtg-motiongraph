import { loadData } from "./data.js";
import { buildChart } from "./chart.js";
import { initAnimation } from "./animation.js";

// Shared mutable state
const state = {
  speed: 1000,
  currentStep: 0,
  hiddenPlayers: new Set(),
  top3Mode: false,
};

async function main() {
  const { raw, dates, playerData } = await loadData("data/data.csv");
  const chart = buildChart({ raw, dates, playerData, state });
  initAnimation({ chart, state });
}

main();
