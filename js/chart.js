import {
  FULL_WIDTH, FULL_HEIGHT, WIDTH, HEIGHT, MARGIN,
  MAX_BARS, BAR_PADDING, DECK_THEMES,
} from "./config.js";

/**
 * Build a horizontal bar-chart race.
 * Returns handles consumed by the animation module.
 */
export function buildChart({ raw, state }) {
  const svg = d3
    .select("#chart")
    .attr("viewBox", `0 0 ${FULL_WIDTH} ${FULL_HEIGHT}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  const tooltip = d3.select("#tooltip");
  const dateDisplay = d3.select("#date-display");

  // Shared defs for deck image shadow (cast onto bar from image right edge)
  const defs = svg.append("defs");
  const shadowR = defs.append("linearGradient")
    .attr("id", "deck-img-shadow-r")
    .attr("x1", "0").attr("y1", "0")
    .attr("x2", "1").attr("y2", "0");
  shadowR.append("stop").attr("offset", "0%").attr("stop-color", "rgba(0,0,0,0.7)");
  shadowR.append("stop").attr("offset", "25%").attr("stop-color", "rgba(0,0,0,0.35)");
  shadowR.append("stop").attr("offset", "60%").attr("stop-color", "rgba(0,0,0,0.1)");
  shadowR.append("stop").attr("offset", "100%").attr("stop-color", "rgba(0,0,0,0)");

  // ─── Scales ───
  const x = d3.scaleLinear().range([0, WIDTH]);
  const y = d3.scaleBand().range([0, HEIGHT]).padding(BAR_PADDING);

  // ─── Axis (x only — y labels are drawn inside bars) ───
  const xAxisG = svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${HEIGHT})`);

  // Grid lines
  const gridG = svg.append("g").attr("class", "grid");

  // Container for bars (below labels)
  const barG = svg.append("g").attr("class", "bars");

  // Deck views that show deck images
  const DECK_VIEWS = new Set(["deckwins", "deckpop", "deckdrawrate", "deckwinrate"]);

  // ─── Deck Count counter (centred SVG group, hidden by default) ───
  const counterG = svg.append("g")
    .attr("class", "deck-counter-group")
    .attr("transform", `translate(${WIDTH / 2}, ${HEIGHT / 2})`)
    .style("opacity", 0);

  counterG.append("text")
    .attr("class", "counter-number")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("dy", "-0.15em")
    .attr("fill", "#c9a84c")
    .attr("font-size", "8rem")
    .attr("font-weight", "700")
    .attr("font-family", "Cinzel, serif")
    .text("0");

  counterG.append("text")
    .attr("class", "counter-label")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .attr("dy", "3.5rem")
    .attr("fill", "#8b949e")
    .attr("font-size", "1.2rem")
    .attr("font-weight", "600")
    .attr("font-family", "Inter, sans-serif")
    .text("different decks played");

  // ─── Snapshot helpers (read live from state.data) ───
  function getPlayerSnapshot(idx) {
    const { playerData } = state.data;
    const colorMap = {};
    playerData.forEach((d) => (colorMap[d.name] = d.color));
    return playerData
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        played: d.values[idx].played,
        date: d.values[idx].date,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, MAX_BARS);
  }

  function getDeckSnapshot(idx) {
    const { deckData } = state.data;
    const colorMap = {};
    deckData.forEach((d) => (colorMap[d.name] = d.color));
    return deckData
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        date: d.values[idx].date,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, MAX_BARS);
  }

  function getPodiumSnapshot(idx) {
    const { podiumData } = state.data;
    const colorMap = {};
    podiumData.forEach((d) => (colorMap[d.name] = d.color));
    return podiumData
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        date: d.values[idx].date,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, MAX_BARS);
  }

  function getTop3Snapshot(idx) {
    const { top3Data } = state.data;
    const colorMap = {};
    top3Data.forEach((d) => (colorMap[d.name] = d.color));
    return top3Data
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        date: d.values[idx].date,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, MAX_BARS);
  }

  function getDeckPopSnapshot(idx) {
    const { deckPopData } = state.data;
    const colorMap = {};
    deckPopData.forEach((d) => (colorMap[d.name] = d.color));
    return deckPopData
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        date: d.values[idx].date,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, MAX_BARS);
  }

  function getWinRateSnapshot(idx) {
    const { winRateData } = state.data;
    const colorMap = {};
    winRateData.forEach((d) => (colorMap[d.name] = d.color));
    return winRateData
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        date: d.values[idx].date,
        wins: d.values[idx].wins,
        games: d.values[idx].games,
      }))
      .filter((d) => d.games > 0)
      .sort((a, b) => b.total - a.total || b.games - a.games)
      .slice(0, MAX_BARS);
  }

  function getAttendanceSnapshot(idx) {
    const { attendanceData } = state.data;
    const colorMap = {};
    attendanceData.forEach((d) => (colorMap[d.name] = d.color));
    return attendanceData
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        date: d.values[idx].date,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, MAX_BARS);
  }

  function getDeckDivSnapshot(idx) {
    const { deckDivData } = state.data;
    const colorMap = {};
    deckDivData.forEach((d) => (colorMap[d.name] = d.color));
    return deckDivData
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        date: d.values[idx].date,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, MAX_BARS);
  }

  function getPlayerDrawRateSnapshot(idx) {
    const { playerDrawRateData } = state.data;
    const colorMap = {};
    playerDrawRateData.forEach((d) => (colorMap[d.name] = d.color));
    return playerDrawRateData
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        date: d.values[idx].date,
        draws: d.values[idx].draws,
        games: d.values[idx].games,
      }))
      .filter((d) => d.games > 0 && d.draws > 0)
      .sort((a, b) => b.total - a.total || b.games - a.games)
      .slice(0, MAX_BARS);
  }

  function getDeckDrawRateSnapshot(idx) {
    const { deckDrawRateData } = state.data;
    const colorMap = {};
    deckDrawRateData.forEach((d) => (colorMap[d.name] = d.color));
    return deckDrawRateData
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        date: d.values[idx].date,
        draws: d.values[idx].draws,
        games: d.values[idx].games,
      }))
      .filter((d) => d.games > 0 && d.draws > 0)
      .sort((a, b) => b.total - a.total || b.games - a.games)
      .slice(0, MAX_BARS);
  }

  function getDeckWinRateSnapshot(idx) {
    const { deckWinRateData } = state.data;
    const colorMap = {};
    deckWinRateData.forEach((d) => (colorMap[d.name] = d.color));
    return deckWinRateData
      .map((d) => ({
        name: d.name,
        total: d.values[idx].total,
        color: colorMap[d.name],
        date: d.values[idx].date,
        wins: d.values[idx].wins,
        games: d.values[idx].games,
      }))
      .filter((d) => d.games > 0)
      .sort((a, b) => b.total - a.total || b.games - a.games)
      .slice(0, MAX_BARS);
  }

  // Helper: count all unique decks with data > 0 at given index
  function countDecksAtStep(idx) {
    const { deckPopData } = state.data;
    if (!deckPopData) return 0;
    return deckPopData.filter((d) => d.values[idx] && d.values[idx].total > 0).length;
  }

  // ─── Render one frame ───
  function renderStep(step, dur) {
    if (step === 0) {
      barG.selectAll("g").remove();
      x.domain([0, 1]);
      xAxisG.call(d3.axisBottom(x).ticks(5));
      gridG.selectAll("line").remove();
      counterG.style("opacity", 0);
      return;
    }

    const idx = Math.min(step - 1, state.data.dates.length - 1);
    let snapshot;
    if (state.viewMode === "deckwins") snapshot = getDeckSnapshot(idx);
    else if (state.viewMode === "podium") snapshot = getPodiumSnapshot(idx);
    else if (state.viewMode === "top3finishes") snapshot = getTop3Snapshot(idx);
    else if (state.viewMode === "deckpop") snapshot = getDeckPopSnapshot(idx);
    else if (state.viewMode === "winrate") snapshot = getWinRateSnapshot(idx);
    else if (state.viewMode === "attendance") snapshot = getAttendanceSnapshot(idx);
    else if (state.viewMode === "deckdiv") snapshot = getDeckDivSnapshot(idx);
    else if (state.viewMode === "playerdrawrate") snapshot = getPlayerDrawRateSnapshot(idx);
    else if (state.viewMode === "deckdrawrate") snapshot = getDeckDrawRateSnapshot(idx);
    else if (state.viewMode === "deckwinrate") snapshot = getDeckWinRateSnapshot(idx);
    else if (state.viewMode === "deckcount") snapshot = [];
    else snapshot = getPlayerSnapshot(idx);

    // Show / hide deck count counter view
    if (state.viewMode === "deckcount") {
      const totalDecks = countDecksAtStep(idx);
      barG.selectAll("g").remove();
      xAxisG.call(d3.axisBottom(x).ticks(0));
      gridG.selectAll("line").remove();
      counterG.select(".counter-number")
        .transition().duration(dur).ease(d3.easeLinear)
        .tween("text", function () {
          const prev = +this.textContent || 0;
          const interp = d3.interpolateRound(prev, totalDecks);
          return (t) => { this.textContent = interp(t); };
        });
      counterG.transition().duration(300).style("opacity", 1);
      return;
    } else {
      counterG.style("opacity", 0);
    }

    // Filter for top3 mode (only applies to player ranking)
    const visible =
      state.top3Mode && state.viewMode === "ranking"
        ? snapshot.slice(0, 3)
        : snapshot;
    const names = visible.map((d) => d.name);

    // Update scales
    const maxVal = d3.max(visible, (d) => d.total) || 1;
    const isPercentView = ["winrate", "playerdrawrate", "deckdrawrate", "deckwinrate"].includes(state.viewMode);
    const xMax = isPercentView ? 100 : maxVal * 1.12;
    x.domain([0, xMax]);
    y.domain(names);

    // Animate x axis
    xAxisG
      .transition()
      .duration(dur)
      .ease(d3.easeLinear)
      .call(d3.axisBottom(x).ticks(6).tickSize(4));

    // Grid
    gridG.selectAll("line").remove();
    const ticks = x.ticks(6);
    gridG
      .selectAll("line")
      .data(ticks)
      .join("line")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", 0)
      .attr("y2", HEIGHT)
      .attr("stroke", "#21262d")
      .attr("stroke-dasharray", "2,3");

    // ─── DATA JOIN ───
    const groups = barG.selectAll("g.bar-group").data(visible, (d) => d.name);

    // EXIT
    groups
      .exit()
      .transition()
      .duration(dur)
      .style("opacity", 0)
      .attr("transform", `translate(0,${HEIGHT + 50})`)
      .remove();

    // ENTER
    const enter = groups.enter().append("g").attr("class", "bar-group");

    enter
      .append("rect")
      .attr("class", "bar")
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("height", y.bandwidth())
      .attr("fill", (d) => d.color)
      .attr("width", 0);

    // Deck image with shadow cast onto bar
    enter.each(function (d) {
      const g = d3.select(this);
      const clipId = `clip-${d.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      g.append("clipPath").attr("id", clipId)
        .append("rect").attr("class", "clip-rect");
      g.append("image")
        .attr("class", "deck-img")
        .attr("clip-path", `url(#${clipId})`)
        .attr("preserveAspectRatio", "xMidYMid slice")
        .style("pointer-events", "none");
      // Shadow cast from image right edge onto bar
      g.append("rect")
        .attr("class", "deck-img-shadow-r")
        .attr("fill", "url(#deck-img-shadow-r)")
        .style("pointer-events", "none");
    });

    enter
      .append("text")
      .attr("class", "bar-name")
      .attr("dy", "0.35em")
      .attr("x", -8)
      .attr("text-anchor", "end")
      .attr("fill", "#e6edf3")
      .attr("font-size", "12px")
      .attr("font-weight", 600);

    enter
      .append("text")
      .attr("class", "bar-value")
      .attr("dy", "0.35em")
      .attr("fill", "#e6edf3")
      .attr("font-size", "12px")
      .attr("font-weight", 700);

    // Start entering groups at their target position
    enter.attr("transform", (d) => `translate(0,${y(d.name)})`).style("opacity", 0);

    // ENTER + UPDATE (merge)
    const merged = enter.merge(groups);

    merged
      .transition()
      .duration(dur)
      .ease(d3.easeLinear)
      .style("opacity", 1)
      .attr("transform", (d) => `translate(0,${y(d.name)})`);

    merged
      .select(".bar")
      .transition()
      .duration(dur)
      .ease(d3.easeLinear)
      .attr("width", (d) => Math.max(0, x(d.total)))
      .attr("height", y.bandwidth())
      .attr("fill", (d) => {
        const theme = DECK_THEMES[d.name];
        return (theme && DECK_VIEWS.has(state.viewMode)) ? theme.barColor : d.color;
      });

    // Update deck image + right shadow
    const bh = y.bandwidth();
    const imgW = bh * 2;

    const isDeckImg = (d) => {
      const theme = DECK_THEMES[d.name];
      return theme && theme.image && DECK_VIEWS.has(state.viewMode);
    };

    merged.select("clipPath .clip-rect")
      .attr("x", 0).attr("y", 0)
      .attr("width", imgW).attr("height", bh);

    merged.select(".deck-img")
      .attr("href", (d) => isDeckImg(d) ? DECK_THEMES[d.name].image : null)
      .attr("x", 0).attr("y", 0)
      .attr("width", imgW).attr("height", bh)
      .style("display", (d) => isDeckImg(d) ? null : "none");

    merged.select(".deck-img-shadow-r")
      .attr("x", imgW).attr("y", 0)
      .attr("width", imgW * 1.2).attr("height", bh)
      .style("display", (d) => isDeckImg(d) ? null : "none");

    merged
      .select(".bar-name")
      .text((d) => d.name)
      .attr("y", y.bandwidth() / 2);

    merged
      .select(".bar-value")
      .transition()
      .duration(dur)
      .ease(d3.easeLinear)
      .attr("x", (d) => x(d.total) + 6)
      .attr("y", y.bandwidth() / 2)
      .tween("text", function (d) {
        const prevText = (this.textContent.match(/[\d.]+/) || ["0"])[0];
        const prev = +prevText;
        if (state.viewMode === "winrate" || state.viewMode === "deckwinrate") {
          const interp = d3.interpolateNumber(prev, d.total);
          return (t) => (this.textContent = interp(t).toFixed(1) + "%  (" + d.games + " games)");
        }
        if (state.viewMode === "playerdrawrate" || state.viewMode === "deckdrawrate") {
          const interp = d3.interpolateNumber(prev, d.total);
          return (t) => (this.textContent = interp(t).toFixed(1) + "%  (" + d.games + " games)");
        }
        const interp = d3.interpolateRound(prev, d.total);
        return (t) => (this.textContent = interp(t));
      });

    // ─── Hover tooltip ───
    merged
      .select(".bar")
      .on("mouseover", function (event, d) {
        let html;
        if (state.viewMode === "deckwins") {
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>Cumulative wins: <strong>${d.total}</strong></div>`;
        } else if (state.viewMode === "podium") {
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>1st place finishes: <strong>${d.total}</strong></div>`;
        } else if (state.viewMode === "top3finishes") {
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>Top-3 finishes: <strong>${d.total}</strong></div>`;
        } else if (state.viewMode === "deckpop") {
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>Times played: <strong>${d.total}</strong></div>`;
        } else if (state.viewMode === "winrate") {
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>Win rate: <strong>${d.total}%</strong></div>`;
          html += `<div>${d.wins}W in ${d.games} games</div>`;
        } else if (state.viewMode === "attendance") {
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>Tournaments attended: <strong>${d.total}</strong></div>`;
        } else if (state.viewMode === "deckdiv") {
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>Unique decks used: <strong>${d.total}</strong></div>`;
        } else if (state.viewMode === "playerdrawrate") {
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>Draw rate: <strong>${d.total}%</strong></div>`;
          html += `<div>${d.draws}D in ${d.games} games</div>`;
        } else if (state.viewMode === "deckdrawrate") {
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>Draw rate: <strong>${d.total}%</strong></div>`;
          html += `<div>${d.draws}D in ${d.games} games</div>`;
        } else if (state.viewMode === "deckwinrate") {
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>Win rate: <strong>${d.total}%</strong></div>`;
          html += `<div>${d.wins}W in ${d.games} games</div>`;
        } else {
          const tourneyRows = raw.filter(
            (r) => r.date === d.date && r.name === d.name
          );
          html = `<div class="name" style="color:${d.color}">${d.name}</div>`;
          html += `<div>Cumulative: <strong>${d.total} pts</strong></div>`;
          if (tourneyRows.length) {
            const r = tourneyRows[0];
            html += `<div>This tourney: ${r.points} pts (${r.wins}W-${r.losses}L-${r.draws}D)</div>`;
            html += `<div>Deck: ${r.deck}</div>`;
            html += `<div>Position: #${r.position}</div>`;
          }
        }
        tooltip
          .html(html)
          .style("opacity", 1)
          .style("left", event.offsetX + 15 + "px")
          .style("top", event.offsetY - 10 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  }

  return { dateDisplay, renderStep };
}
