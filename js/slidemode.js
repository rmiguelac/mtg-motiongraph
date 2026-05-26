/**
 * Slide Mode — fullscreen presentation for game store displays.
 * Cycles through chart views automatically during championships.
 */

const SLIDES = [
  { mode: "ranking",          label: "🏆 Player Ranking" },
  { mode: "podium",           label: "🥇 1st Place" },
  { mode: "top3finishes",     label: "🏅 Top 3 Finishes" },
  { mode: "winrate",          label: "📈 Win Rate" },
  { mode: "attendance",       label: "📅 Attendance" },
  { mode: "playerdrawrate",   label: "🤝 Player Draw Rate" },
  { mode: "deckdiv",          label: "🎲 Deck Diversity" },
  { mode: "deckdedication",   label: "💜 Deck Dedication" },
  { mode: "deckwins",         label: "🃏 Deck Wins" },
  { mode: "deckpodium",       label: "🥇 Deck 1st Place" },
  { mode: "deckpop",          label: "📊 Popularity" },
  { mode: "deckdrawrate",     label: "🤝 Deck Draw Rate" },
  { mode: "deckwinrate",      label: "🎯 Deck Win Rate" },
  { mode: "deckcount",        label: "🔢 Deck Count" },
];

const PAUSE_AFTER_ANIMATION = 3000; // ms to hold final frame before advancing

export function initSlideMode(animControls) {
  const overlay = document.getElementById("slide-overlay");
  const slideLabel = document.getElementById("slide-label");
  const slideDots = document.getElementById("slide-dots");
  const btnEnter = document.getElementById("btn-slidemode");
  const btnExit = document.getElementById("slide-exit");
  const btnPrev = document.getElementById("slide-prev");
  const btnNext = document.getElementById("slide-next");
  const btnPause = document.getElementById("slide-pause");

  let active = false;
  let currentIdx = 0;
  let advanceTimer = null;
  let paused = false;

  const chartContainer = document.getElementById("chart-container");
  const chartWrap = document.getElementById("slide-chart-wrap");
  let chartOriginalParent = null;
  let chartNextSibling = null;

  function renderDots() {
    slideDots.innerHTML = "";
    SLIDES.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "slide-dot" + (i === currentIdx ? " active" : "");
      dot.addEventListener("click", () => goTo(i));
      slideDots.appendChild(dot);
    });
  }

  function showSlide(idx) {
    currentIdx = ((idx % SLIDES.length) + SLIDES.length) % SLIDES.length;
    const slide = SLIDES[currentIdx];
    slideLabel.textContent = slide.label;
    renderDots();
    animControls.switchView(slide.mode);
  }

  function scheduleAdvance() {
    clearTimeout(advanceTimer);
    if (paused) return;
    advanceTimer = setTimeout(() => {
      goTo(currentIdx + 1);
    }, PAUSE_AFTER_ANIMATION);
  }

  function goTo(idx) {
    clearTimeout(advanceTimer);
    showSlide(idx);
    // Animation end callback will trigger next advance
  }

  function enter() {
    active = true;
    paused = false;
    currentIdx = 0;
    overlay.classList.add("open");
    document.body.classList.add("slide-active");
    btnPause.textContent = "⏸";

    // Move chart into the slide overlay
    chartOriginalParent = chartContainer.parentNode;
    chartNextSibling = chartContainer.nextSibling;
    chartWrap.appendChild(chartContainer);

    // Try browser fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});

    // When each animation finishes, wait then advance
    animControls.setOnAnimationEnd(() => {
      if (active && !paused) scheduleAdvance();
    });

    showSlide(0);
  }

  function exit() {
    active = false;
    clearTimeout(advanceTimer);
    overlay.classList.remove("open");
    document.body.classList.remove("slide-active");
    animControls.setOnAnimationEnd(null);
    animControls.stop();

    // Move chart back to original position
    if (chartOriginalParent) {
      chartOriginalParent.insertBefore(chartContainer, chartNextSibling);
    }

    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  function togglePause() {
    paused = !paused;
    btnPause.textContent = paused ? "▶" : "⏸";
    if (paused) {
      clearTimeout(advanceTimer);
      animControls.stop();
    } else {
      animControls.play();
    }
  }

  // Wire buttons
  btnEnter.addEventListener("click", enter);
  btnExit.addEventListener("click", exit);
  btnPrev.addEventListener("click", () => goTo(currentIdx - 1));
  btnNext.addEventListener("click", () => goTo(currentIdx + 1));
  btnPause.addEventListener("click", togglePause);

  // Speed buttons
  document.querySelectorAll(".slide-speed-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".slide-speed-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      animControls.setSpeed(+btn.dataset.speed);
    });
  });

  // Keyboard controls
  document.addEventListener("keydown", (e) => {
    if (!active) return;
    switch (e.key) {
      case "Escape":
        exit();
        break;
      case "ArrowRight":
        goTo(currentIdx + 1);
        break;
      case "ArrowLeft":
        goTo(currentIdx - 1);
        break;
      case " ":
        e.preventDefault();
        togglePause();
        break;
    }
  });

  // Exit if user presses Escape to leave fullscreen
  document.addEventListener("fullscreenchange", () => {
    if (active && !document.fullscreenElement) exit();
  });
}
