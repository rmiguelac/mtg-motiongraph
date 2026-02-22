/**
 * Animation controller — play, pause, reset, speed & top-3 toggle.
 */
export function initAnimation({ chart, state }) {
  const { dateDisplay, dates, renderStep } = chart;

  let animTimer = null;

  function setStep(step) {
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
    if (state.currentStep >= dates.length) state.currentStep = 0;
    animTimer = setInterval(() => {
      state.currentStep++;
      setStep(state.currentStep);
      if (state.currentStep >= dates.length) stop();
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
    d3.select(mode === "ranking" ? "#btn-ranking" : "#btn-deckwins").classed("active", true);
    // Reset and replay so the chart rebuilds with the new data source
    reset();
    setTimeout(play, 300);
  }

  d3.select("#btn-ranking").on("click", () => switchView("ranking"));
  d3.select("#btn-deckwins").on("click", () => switchView("deckwins"));

  // Auto-play on load
  setTimeout(play, 600);
}
