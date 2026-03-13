import { loadData, processData } from "./data.js";
import { buildChart } from "./chart.js";
import { initAnimation } from "./animation.js";
import { initRecap } from "./recap.js";
import { initSlideMode } from "./slidemode.js";

// Shared mutable state
const state = {
  speed: 1000,
  currentStep: 0,
  hiddenPlayers: new Set(),
  top3Mode: false,
  viewMode: "ranking",  // ... | "deckwinrate"
  monthFilter: null,     // null = all months
  // Mutable processed data — updated when month filter changes
  data: { dates: [], playerData: [], deckData: [], podiumData: [], top3Data: [], deckPopData: [], winRateData: [], attendanceData: [], deckDivData: [], playerDrawRateData: [], deckDrawRateData: [], deckWinRateData: [], deckDedicationData: [] },
};

async function main() {
  const { raw, months } = await loadData("data/data.csv");

  // Initial processing (all months)
  state.data = processData(raw, null);

  const chart = buildChart({ raw, state });
  const animControls = initAnimation({ chart, state, raw, months, processData });
  initRecap(raw);
  initSlideMode(animControls);
}

main();
