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

  // Category sub-row toggling
  const subPlayer = document.getElementById("sub-player");
  const subDeck = document.getElementById("sub-deck");

  function showSubRow(category) {
    d3.selectAll(".category-btn").classed("active", false);
    if (category === "player") {
      d3.select("#cat-player").classed("active", true);
      subPlayer.style.display = "flex";
      subDeck.style.display = "none";
    } else {
      d3.select("#cat-deck").classed("active", true);
      subDeck.style.display = "flex";
      subPlayer.style.display = "none";
    }
  }

  d3.select("#cat-player").on("click", () => {
    const isOpen = subPlayer.style.display === "flex";
    subPlayer.style.display = isOpen ? "none" : "flex";
    subDeck.style.display = "none";
    d3.select("#cat-player").classed("active", !isOpen);
    d3.select("#cat-deck").classed("active", false);
  });

  d3.select("#cat-deck").on("click", () => {
    const isOpen = subDeck.style.display === "flex";
    subDeck.style.display = isOpen ? "none" : "flex";
    subPlayer.style.display = "none";
    d3.select("#cat-deck").classed("active", !isOpen);
    d3.select("#cat-player").classed("active", false);
  });

  // Player Ranking hides sub-rows
  d3.select("#btn-ranking").on("click", () => {
    subPlayer.style.display = "none";
    subDeck.style.display = "none";
    d3.selectAll(".category-btn").classed("active", false);
    switchView("ranking");
  });

  // Player sub-views
  d3.select("#btn-podium").on("click", () => switchView("podium"));
  d3.select("#btn-top3finishes").on("click", () => switchView("top3finishes"));
  d3.select("#btn-winrate").on("click", () => switchView("winrate"));
  d3.select("#btn-attendance").on("click", () => switchView("attendance"));
  d3.select("#btn-playerdrawrate").on("click", () => switchView("playerdrawrate"));

  // Deck sub-views
  d3.select("#btn-deckwins").on("click", () => switchView("deckwins"));
  d3.select("#btn-deckpop").on("click", () => switchView("deckpop"));
  d3.select("#btn-deckdiv").on("click", () => switchView("deckdiv"));
  d3.select("#btn-deckdrawrate").on("click", () => switchView("deckdrawrate"));
  d3.select("#btn-deckwinrate").on("click", () => switchView("deckwinrate"));

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
