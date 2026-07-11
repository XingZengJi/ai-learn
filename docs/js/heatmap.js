/* GitHub 贡献热力图：客户端读取公开贡献数据，SVG 自绘 */
(function () {
  "use strict";

  const USER = "XingZengJi";
  const API = "https://github-contributions-api.jogruber.de/v4/" + USER + "?y=last";
  /* GitHub 深色模式官方序列色带（亮度单调递增） */
  const RAMP = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
  const SVG_NS = "http://www.w3.org/2000/svg";
  const CELL = 12, GAP = 3, LEFT = 30, TOP = 20;

  function el(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function fmtDate(iso) {
    const [y, m, d] = iso.split("-");
    return y + " 年 " + Number(m) + " 月 " + Number(d) + " 日";
  }

  async function init() {
    const mount = document.getElementById("heatmap");
    const totalEl = document.getElementById("heatmap-total");
    let data;
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("HTTP " + res.status);
      data = await res.json();
    } catch (err) {
      totalEl.textContent = "";
      mount.innerHTML = '<p class="hm-fallback">热力图数据暂时读取不到（数据源无响应）。' +
        '可以直接到 <a href="https://github.com/' + USER + '">github.com/' + USER + '</a> 查看贡献记录。</p>';
      return;
    }

    const days = data.contributions || [];
    if (!days.length) { totalEl.textContent = "暂无贡献数据"; return; }

    const total = days.reduce((s, d) => s + d.count, 0);
    totalEl.textContent = "@" + USER + " · 过去一年 " + total + " 次贡献 · 每一格都是一天的学习足迹";

    /* 排成 周×星期 网格：列 = 周，行 = 周日..周六 */
    const firstDow = new Date(days[0].date + "T00:00:00").getDay();
    const weeks = Math.ceil((days.length + firstDow) / 7);
    const width = LEFT + weeks * (CELL + GAP) + 10;
    const height = TOP + 7 * (CELL + GAP) + 34;
    const svg = el("svg", { viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": "GitHub 贡献热力图" });

    /* 星期标签（一 / 三 / 五） */
    [["一", 1], ["三", 3], ["五", 5]].forEach(([txt, row]) => {
      const t = el("text", { x: LEFT - 8, y: TOP + row * (CELL + GAP) + CELL - 2, "text-anchor": "end", class: "hm-label" });
      t.textContent = txt;
      svg.appendChild(t);
    });

    const tooltip = document.getElementById("tooltip");
    let lastMonth = -1;
    days.forEach((d, idx) => {
      const pos = idx + firstDow;
      const week = Math.floor(pos / 7), dow = pos % 7;
      const x = LEFT + week * (CELL + GAP), y = TOP + dow * (CELL + GAP);

      /* 月份标签：每月第一次出现的那一列 */
      const m = Number(d.date.slice(5, 7));
      if (m !== lastMonth && dow === 0) {
        const t = el("text", { x: x, y: TOP - 8, class: "hm-label" });
        t.textContent = m + "月";
        svg.appendChild(t);
        lastMonth = m;
      }

      const level = Math.max(0, Math.min(4, d.level));
      const rect = el("rect", {
        x: x, y: y, width: CELL, height: CELL, rx: 2.5,
        fill: RAMP[level],
        stroke: level >= 3 ? RAMP[4] : "none", "stroke-opacity": 0.25
      });
      rect.addEventListener("mouseenter", e => {
        tooltip.innerHTML = "<strong>" + d.count + " 次贡献</strong><div class='tt-sub'>" + fmtDate(d.date) + "</div>";
        tooltip.hidden = false;
        positionTooltip(e);
      });
      rect.addEventListener("mousemove", positionTooltip);
      rect.addEventListener("mouseleave", () => { tooltip.hidden = true; });
      svg.appendChild(rect);
    });

    /* 图例：少 → 多 */
    const legendX = width - 5 * (CELL + GAP) - 60, legendY = height - 18;
    const less = el("text", { x: legendX - 8, y: legendY + CELL - 2, "text-anchor": "end", class: "hm-legend-label" });
    less.textContent = "少";
    svg.appendChild(less);
    RAMP.forEach((c, i) => {
      svg.appendChild(el("rect", { x: legendX + i * (CELL + GAP), y: legendY, width: CELL, height: CELL, rx: 2.5, fill: c }));
    });
    const more = el("text", { x: legendX + 5 * (CELL + GAP) + 5, y: legendY + CELL - 2, class: "hm-legend-label" });
    more.textContent = "多";
    svg.appendChild(more);

    mount.appendChild(svg);
  }

  function positionTooltip(e) {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.left = Math.min(e.clientX + 14, window.innerWidth - 200) + "px";
    tooltip.style.top = (e.clientY - 40) + "px";
  }

  window.Heatmap = { init: init };
})();
