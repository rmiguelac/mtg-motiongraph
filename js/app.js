import { loadData, processData } from "./data.js?v=2";
import { buildChart } from "./chart.js?v=2";
import { initAnimation } from "./animation.js?v=2";
import { initRecap } from "./recap.js?v=2";
import { initSlideMode } from "./slidemode.js?v=2";

// Shared mutable state
const state = {
  speed: 1000,
  currentStep: 0,
  hiddenPlayers: new Set(),
  top3Mode: false,
  viewMode: "ranking",  // ... | "deckwinrate"
  monthFilter: null,     // null = all months
  eventFilter: [],       // empty = all event types
  // Mutable processed data — updated when month filter changes
  data: { dates: [], playerData: [], deckData: [], podiumData: [], top3Data: [], deckPopData: [], winRateData: [], attendanceData: [], deckDivData: [], playerDrawRateData: [], deckDrawRateData: [], deckWinRateData: [], deckDedicationData: [] },
};

async function main() {
  const { raw, months, events } = await loadData("data/data.csv");

  // Initial processing (all months, all events)
  state.data = processData(raw, null, []);

  const chart = buildChart({ raw, state });
  const animControls = initAnimation({ chart, state, raw, months, events, processData });
  initRecap(raw);
  initSlideMode(animControls);
}

main();
