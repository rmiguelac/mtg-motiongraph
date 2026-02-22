/**
 * Animation controller — play, pause, reset, speed, views & month filter.
 */
export function initAnimation({ chart, state, raw, months, processData }) {
  const { dateDisplay, renderStep } = chart;

  let animTimer = null;

  function getDates() {
    return state.data.dates;
  }

  function setStep(step) {
    const dates = getDates();
    state.currentStep = Math.min(step, dates.length);
    const dur = state.speed * 0.85;

    if (state.currentStep === 0) {
      renderStep(0, 0);
      dateDisplay.text("");
      return;
    }

    renderStep(state.currentStep, dur);

    const [y, m, d] = dates[state.currentStep - 1].split(".").map(Number);
    const dt = new Date(y, m - 1, d);
    dateDisplay.text(
      dt.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    );
  }

  function play() {
    stop();
    const dates = getDates();
    if (state.currentStep >= dates.length) state.currentStep = 0;
    animTimer = setInterval(() => {
      state.currentStep++;
      setStep(state.currentStep);
      if (state.currentStep >= getDates().length) stop();
    }, state.speed);
    // Kick off immediately
    state.currentStep++;
    setStep(state.currentStep);
  }

  function stop() {
    if (animTimer) clearInterval(animTimer);
    animTimer = null;
  }

  function reset() {
    stop();
    state.currentStep = 0;
    dateDisplay.text("");
    renderStep(0, 200);
  }

  // ─── Wire buttons ───
  d3.select("#btn-play").on("click", play);
  d3.select("#btn-pause").on("click", stop);
  d3.select("#btn-reset").on("click", reset);

  d3.selectAll(".speed-btn").on("click", function () {
    d3.selectAll(".speed-btn").classed("active", false);
    d3.select(this).classed("active", true);
    state.speed = +this.dataset.speed;
    if (animTimer) {
      stop();
      play();
    }
  });

  // ─── View switching ───
  function switchView(mode) {
    state.viewMode = mode;
    d3.selectAll(".view-btn").classed("active", false);
    d3.select(`#btn-${mode}`).classed("active", true);
    reset();
    setTimeout(play, 300);
  }

  d3.select("#btn-ranking").on("click", () => switchView("ranking"));
  d3.select("#btn-deckwins").on("click", () => switchView("deckwins"));
  d3.select("#btn-podium").on("click", () => switchView("podium"));
  d3.select("#btn-top3finishes").on("click", () => switchView("top3finishes"));
  d3.select("#btn-deckpop").on("click", () => switchView("deckpop"));
  d3.select("#btn-winrate").on("click", () => switchView("winrate"));
  d3.select("#btn-attendance").on("click", () => switchView("attendance"));
  d3.select("#btn-deckdiv").on("click", () => switchView("deckdiv"));

  // ─── Month filter ───
  const monthSelect = d3.select("#month-filter");

  // Populate options from data
  months.forEach((m) => {
    const label = m.charAt(0).toUpperCase() + m.slice(1);
    monthSelect.append("option").attr("value", m).text(label);
  });

  monthSelect.on("change", function () {
    const val = this.value || null;
    state.monthFilter = val;
    state.data = processData(raw, val);
    reset();
    setTimeout(play, 300);
  });

  // Auto-play on load
  setTimeout(play, 600);
}
