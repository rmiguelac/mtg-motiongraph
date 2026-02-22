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

    const dt = new Date(dates[state.currentStep - 1].replace(/\./g, "-"));
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

  d3.select("#btn-top3").on("click", function () {
    state.top3Mode = !state.top3Mode;
    d3.select(this).classed("active", state.top3Mode);
    // Re-render current frame with the filter
    if (state.currentStep > 0) renderStep(state.currentStep, 500);
  });

  // Auto-play on load
  setTimeout(play, 600);
}
