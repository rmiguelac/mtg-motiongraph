import {
  FULL_WIDTH, FULL_HEIGHT, WIDTH, HEIGHT, MARGIN,
  MAX_BARS, BAR_PADDING,
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

  // ─── Render one frame ───
  function renderStep(step, dur) {
    if (step === 0) {
      barG.selectAll("g").remove();
      x.domain([0, 1]);
      xAxisG.call(d3.axisBottom(x).ticks(5));
      gridG.selectAll("line").remove();
      return;
    }

    const idx = Math.min(step - 1, state.data.dates.length - 1);
    let snapshot;
    if (state.viewMode === "deckwins") snapshot = getDeckSnapshot(idx);
    else if (state.viewMode === "podium") snapshot = getPodiumSnapshot(idx);
    else if (state.viewMode === "top3finishes") snapshot = getTop3Snapshot(idx);
    else snapshot = getPlayerSnapshot(idx);

    // Filter for top3 mode (only applies to player ranking)
    const visible =
      state.top3Mode && state.viewMode === "ranking"
        ? snapshot.slice(0, 3)
        : snapshot;
    const names = visible.map((d) => d.name);

    // Update scales
    const maxVal = d3.max(visible, (d) => d.total) || 1;
    x.domain([0, maxVal * 1.12]);
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
      .attr("fill", (d) => d.color);

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
        const prev = +this.textContent || 0;
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
