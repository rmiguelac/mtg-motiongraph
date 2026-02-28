import { DECK_THEMES } from "./config.js";

/**
 * Player Recap — modular slide-based "Year in Review".
 *
 * Architecture:
 *   slides[]  — ordered array of slide-builder functions
 *   Each slide fn receives (stats, container) and renders into the container.
 *   Adding a new slide = push a function into the array.
 */

// ─── Stats computation (full history, ignores month filter) ───
function computeStats(raw, playerName) {
  const rows = raw.filter((r) => r.name === playerName);
  if (!rows.length) return null;

  const tournaments = [...new Set(rows.map((r) => r.date))].sort();
  const totalWins = rows.reduce((s, r) => s + r.wins, 0);
  const totalLosses = rows.reduce((s, r) => s + r.losses, 0);
  const totalDraws = rows.reduce((s, r) => s + r.draws, 0);
  const totalPoints = rows.reduce((s, r) => s + r.points, 0);
  const totalGames = totalWins + totalLosses + totalDraws;
  const winRate = totalGames ? Math.round((totalWins / totalGames) * 1000) / 10 : 0;

  // Signature deck (most played)
  const deckCounts = {};
  rows.forEach((r) => {
    deckCounts[r.deck] = (deckCounts[r.deck] || 0) + 1;
  });
  const sortedDecks = Object.entries(deckCounts).sort((a, b) => b[1] - a[1]);
  const signatureDeck = sortedDecks[0] ? sortedDecks[0][0] : null;
  const signatureDeckCount = sortedDecks[0] ? sortedDecks[0][1] : 0;

  // All decks played
  const allDecks = sortedDecks.map(([name, count]) => ({ name, count }));

  // Best finish
  const bestRow = rows.reduce((best, r) => (r.position < best.position ? r : best), rows[0]);

  // Top 3 finishes
  const top3Count = rows.filter((r) => r.position <= 3).length;

  // First place finishes
  const firstCount = rows.filter((r) => r.position === 1).length;

  // Deck wins
  const deckWins = {};
  rows.forEach((r) => {
    deckWins[r.deck] = (deckWins[r.deck] || 0) + r.wins;
  });

  return {
    name: playerName,
    tournaments,
    tournamentsPlayed: tournaments.length,
    totalWins,
    totalLosses,
    totalDraws,
    totalPoints,
    totalGames,
    winRate,
    signatureDeck,
    signatureDeckCount,
    allDecks,
    bestFinish: bestRow.position,
    bestFinishDate: bestRow.date,
    bestFinishDeck: bestRow.deck,
    top3Count,
    firstCount,
    deckWins,
  };
}

// ─── Slide registry (modular — just push new functions) ───
const slides = [];

// Helper: format date string "2026.01.05" → "5 de janeiro, 2026"
function fmtDate(str) {
  const [y, m, d] = str.split(".").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

// ── Slide 0: Intro ──
slides.push((stats, el) => {
  el.innerHTML = `
    <div class="recap-slide recap-intro">
      <div class="recap-emoji">⚔</div>
      <h2 class="recap-title">Player Recap</h2>
      <div class="recap-player-name">${stats.name}</div>
      <div class="recap-subtitle">${stats.tournamentsPlayed} tournaments · ${stats.totalGames} games</div>
    </div>
  `;
});

// ── Slide 1: Signature Deck ──
slides.push((stats, el) => {
  const theme = DECK_THEMES[stats.signatureDeck];
  const imgSrc = theme && theme.image ? theme.image : null;
  const color = theme ? theme.barColor : "#c9a84c";
  const timesLabel = stats.signatureDeckCount === 1 ? "time" : "times";

  el.innerHTML = `
    <div class="recap-slide recap-signature">
      <div class="recap-label">Your signature deck</div>
      ${imgSrc
        ? `<div class="recap-deck-img-wrap">
             <img src="${imgSrc}" class="recap-deck-img" alt="${stats.signatureDeck}" />
           </div>`
        : `<div class="recap-deck-placeholder" style="background:${color}">${stats.signatureDeck.charAt(0)}</div>`
      }
      <div class="recap-deck-name" style="color:${color}">${stats.signatureDeck}</div>
      <div class="recap-stat-line">Played <strong>${stats.signatureDeckCount}</strong> ${timesLabel}</div>
      ${stats.deckWins[stats.signatureDeck]
        ? `<div class="recap-stat-line">${stats.deckWins[stats.signatureDeck]} wins with this deck</div>`
        : ""}
    </div>
  `;
});

// ── Slide 2: All Decks Grid ──
slides.push((stats, el) => {
  const deckCards = stats.allDecks.map((d) => {
    const theme = DECK_THEMES[d.name];
    const imgSrc = theme && theme.image ? theme.image : null;
    const color = theme ? theme.barColor : "#30363d";
    return `
      <div class="recap-deck-card">
        ${imgSrc
          ? `<img src="${imgSrc}" class="recap-deck-card-img" alt="${d.name}" />`
          : `<div class="recap-deck-card-fallback" style="background:${color}">${d.name.charAt(0)}</div>`
        }
        <div class="recap-deck-card-name">${d.name}</div>
        <div class="recap-deck-card-count">${d.count}×</div>
      </div>
    `;
  }).join("");

  el.innerHTML = `
    <div class="recap-slide recap-alldecks">
      <div class="recap-label">Your arsenal</div>
      <div class="recap-stat-big">${stats.allDecks.length}</div>
      <div class="recap-stat-line">different decks played</div>
      <div class="recap-deck-grid">${deckCards}</div>
    </div>
  `;
});

// ── Slide 3: Record ──
slides.push((stats, el) => {
  el.innerHTML = `
    <div class="recap-slide recap-record">
      <div class="recap-label">Your battle record</div>
      <div class="recap-record-row">
        <div class="recap-record-item win">
          <div class="recap-record-num">${stats.totalWins}</div>
          <div class="recap-record-lbl">Wins</div>
        </div>
        <div class="recap-record-item loss">
          <div class="recap-record-num">${stats.totalLosses}</div>
          <div class="recap-record-lbl">Losses</div>
        </div>
        <div class="recap-record-item draw">
          <div class="recap-record-num">${stats.totalDraws}</div>
          <div class="recap-record-lbl">Draws</div>
        </div>
      </div>
      <div class="recap-winrate">
        <svg viewBox="0 0 120 120" class="recap-ring">
          <circle cx="60" cy="60" r="52" stroke="#21262d" stroke-width="10" fill="none" />
          <circle cx="60" cy="60" r="52" stroke="#c9a84c" stroke-width="10" fill="none"
            stroke-dasharray="${2 * Math.PI * 52}"
            stroke-dashoffset="${2 * Math.PI * 52 * (1 - stats.winRate / 100)}"
            stroke-linecap="round"
            transform="rotate(-90 60 60)" class="recap-ring-fill" />
          <text x="60" y="58" text-anchor="middle" dominant-baseline="central"
            fill="#c9a84c" font-size="22" font-weight="700" font-family="Cinzel, serif">${stats.winRate}%</text>
          <text x="60" y="78" text-anchor="middle" fill="#8b949e" font-size="10" font-family="Inter, sans-serif">win rate</text>
        </svg>
      </div>
    </div>
  `;
});

// ── Slide 4: Best Moment ──
slides.push((stats, el) => {
  const theme = DECK_THEMES[stats.bestFinishDeck];
  const color = theme ? theme.barColor : "#c9a84c";

  let medal = "🏆";
  if (stats.bestFinish === 2) medal = "🥈";
  else if (stats.bestFinish === 3) medal = "🥉";
  else if (stats.bestFinish > 3) medal = "⭐";

  el.innerHTML = `
    <div class="recap-slide recap-best">
      <div class="recap-label">Your best moment</div>
      <div class="recap-emoji">${medal}</div>
      <div class="recap-stat-big">#${stats.bestFinish}</div>
      <div class="recap-stat-line">${fmtDate(stats.bestFinishDate)}</div>
      <div class="recap-stat-line">Playing <span style="color:${color};font-weight:700">${stats.bestFinishDeck}</span></div>
      ${stats.top3Count > 0
        ? `<div class="recap-stat-extra">${stats.top3Count} top-3 finishes total${stats.firstCount > 0 ? ` · ${stats.firstCount} 🥇` : ""}</div>`
        : ""}
    </div>
  `;
});

// ─── Modal controller ───
export function initRecap(raw) {
  const overlay = document.getElementById("recap-overlay");
  const closeBtn = document.getElementById("recap-close");
  const playerSelect = document.getElementById("recap-player");
  const slideContainer = document.getElementById("recap-slide-container");
  const prevBtn = document.getElementById("recap-prev");
  const nextBtn = document.getElementById("recap-next");
  const dotsContainer = document.getElementById("recap-dots");
  const trigger = document.getElementById("recap-trigger");

  let currentSlide = 0;
  let stats = null;

  // Populate player list
  const players = [...new Set(raw.map((r) => r.name))].sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" })
  );
  players.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    playerSelect.appendChild(opt);
  });

  function renderDots() {
    dotsContainer.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "recap-dot" + (i === currentSlide ? " active" : "");
      dot.addEventListener("click", () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });
  }

  function goToSlide(idx) {
    if (!stats) return;
    currentSlide = Math.max(0, Math.min(idx, slides.length - 1));

    // Animate out then in
    slideContainer.classList.add("recap-slide-exit");
    setTimeout(() => {
      slides[currentSlide](stats, slideContainer);
      slideContainer.classList.remove("recap-slide-exit");
      slideContainer.classList.add("recap-slide-enter");
      setTimeout(() => slideContainer.classList.remove("recap-slide-enter"), 400);
    }, 200);

    renderDots();
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === slides.length - 1;
  }

  function onPlayerChange() {
    const name = playerSelect.value;
    if (!name) {
      slideContainer.innerHTML = `<div class="recap-slide recap-empty"><div class="recap-label">Select a player above</div></div>`;
      dotsContainer.innerHTML = "";
      return;
    }
    stats = computeStats(raw, name);
    currentSlide = 0;
    goToSlide(0);
  }

  // Events
  trigger.addEventListener("click", () => {
    overlay.classList.add("open");
    onPlayerChange();
  });

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("open");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });

  playerSelect.addEventListener("change", onPlayerChange);
  prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));

  // Keyboard nav
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") overlay.classList.remove("open");
    if (e.key === "ArrowRight") goToSlide(currentSlide + 1);
    if (e.key === "ArrowLeft") goToSlide(currentSlide - 1);
  });
}
