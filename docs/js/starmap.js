/* 星图渲染：知识点=星星，课程=星座，梯队=天区 */
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const TIER_COLOR = { 1: "#199e70", 2: "#3987e5", 3: "#c98500" };

  /* 每门课星座中心的固定槽位（按梯队分天区） */
  const SLOTS = {
    1: [ [180, 150], [530, 140], [890, 150], [190, 330], [540, 320], [900, 330] ],
    2: [ [190, 575], [520, 560], [850, 575], [350, 675], [730, 670] ],
    3: [ [140, 845], [375, 845], [610, 845], [845, 845], [1080, 845], [255, 925], [490, 925], [725, 925], [960, 925] ]
  };
  const REGIONS = [
    { tier: 1, y: 56, label: "第一天区 · 使用与协作" },
    { tier: 2, y: 480, label: "第二天区 · 工程与开发" },
    { tier: 3, y: 800, label: "第三天区 · 按需选修" }
  ];

  /* 稳定的伪随机数：同一课程每次渲染布局一致 */
  function seedOf(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(seed) {
    let a = seed;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function el(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  /* 计算全部星星坐标；返回 { starPos: {kid: [x,y]}, centers: {cid: [x,y]} } */
  function layout(data) {
    const centers = {}, starPos = {};
    const byTier = { 1: [], 2: [], 3: [] };
    data.courses.forEach(c => byTier[c.tier].push(c));
    for (const tier of [1, 2, 3]) {
      byTier[tier].forEach((course, i) => {
        const slot = SLOTS[tier][i] || [600, 400];
        centers[course.id] = slot;
        const stars = data.knowledgeByCourse[course.id] || [];
        const n = stars.length;
        const rng = mulberry32(seedOf(course.id));
        const R = n === 1 ? 0 : Math.min(30 + n * 7, 80);
        stars.forEach((k, j) => {
          if (n === 1) { starPos[k.id] = slot; return; }
          const angle = (j / n) * Math.PI * 2 + rng() * 0.9 - 0.45;
          const r = R * (0.5 + 0.5 * rng());
          starPos[k.id] = [slot[0] + Math.cos(angle) * r, slot[1] + Math.sin(angle) * r * 0.72];
        });
      });
    }
    return { centers, starPos };
  }

  function render(svg, data, state, handlers) {
    svg.textContent = "";
    const { centers, starPos } = layout(data);

    const defs = el("defs", {});
    for (const t of [1, 2, 3]) {
      const f = el("filter", { id: "glow-t" + t, x: "-120%", y: "-120%", width: "340%", height: "340%" });
      const blur = el("feGaussianBlur", { stdDeviation: "3.2", result: "b" });
      const merge = el("feMerge", {});
      merge.appendChild(el("feMergeNode", { in: "b" }));
      merge.appendChild(el("feMergeNode", { in: "SourceGraphic" }));
      f.appendChild(blur); f.appendChild(merge);
      defs.appendChild(f);
    }
    svg.appendChild(defs);

    /* 背景星尘 */
    const dustRng = mulberry32(20260711);
    for (let i = 0; i < 130; i++) {
      const d = el("circle", {
        cx: (dustRng() * 1200).toFixed(1), cy: (dustRng() * 980).toFixed(1),
        r: (0.5 + dustRng()).toFixed(2), fill: "#8fa3cc",
        opacity: (0.08 + dustRng() * 0.3).toFixed(2),
        class: "dust" + (dustRng() > 0.75 ? " tw" : "")
      });
      if (d.classList.contains("tw")) d.style.animationDelay = (dustRng() * 4).toFixed(1) + "s";
      svg.appendChild(d);
    }

    /* 天区标签 */
    REGIONS.forEach(rg => {
      const t = el("text", { x: 24, y: rg.y, class: "region-label" });
      t.textContent = rg.label;
      svg.appendChild(t);
      const tick = el("line", { x1: 24, y1: rg.y + 8, x2: 210, y2: rg.y + 8, stroke: TIER_COLOR[rg.tier], "stroke-width": 2, opacity: 0.5 });
      svg.appendChild(tick);
    });

    /* 课程先修关系（虚线，仅前两个梯队，避免杂乱） */
    data.courses.forEach(c => {
      if (c.tier === 3) return;
      (c.prereq || []).forEach(pid => {
        const from = centers[pid], to = centers[c.id];
        if (!from || !to) return;
        svg.appendChild(el("line", {
          x1: from[0], y1: from[1], x2: to[0], y2: to[1],
          stroke: "#26304e", "stroke-width": 1, "stroke-dasharray": "3 7", opacity: 0.8
        }));
      });
    });

    /* 星座连线 + 星星 + 课程标签 */
    data.courses.forEach(course => {
      const stars = data.knowledgeByCourse[course.id] || [];
      const color = TIER_COLOR[course.tier];
      const statuses = stars.map(k => state.statusOf("knowledge", k.id));
      const allDone = stars.length > 0 && statuses.every(s => s === "done");

      const g = el("g", { "data-course": course.id });

      for (let i = 0; i < stars.length - 1; i++) {
        const a = starPos[stars[i].id], b = starPos[stars[i + 1].id];
        const bothLit = statuses[i] !== "todo" && statuses[i + 1] !== "todo";
        g.appendChild(el("line", {
          x1: a[0], y1: a[1], x2: b[0], y2: b[1],
          class: "constellation-line",
          stroke: allDone ? color : "#2a3454",
          "stroke-width": allDone ? 1.6 : 1,
          opacity: bothLit ? 0.9 : 0.55
        }));
      }

      stars.forEach((k, i) => {
        const [x, y] = starPos[k.id];
        const st = statuses[i];
        const sg = el("g", { class: "star" + (st === "done" || st === "preview" ? " lit" : ""), tabindex: "0", role: "button" });
        sg.setAttribute("aria-label", k.name + "（" + ({ done: "已点亮", preview: "预览点亮", doing: "学习中", todo: "未点亮" })[st] + "）");

        if (st === "done") {
          sg.appendChild(el("circle", { class: "core", cx: x, cy: y, r: 5.5, fill: color, filter: "url(#glow-t" + course.tier + ")" }));
          sg.appendChild(el("circle", { cx: x, cy: y, r: 1.8, fill: "#ffffff" }));
        } else if (st === "preview") {
          sg.appendChild(el("circle", { class: "core", cx: x, cy: y, r: 5, fill: color, opacity: 0.85, filter: "url(#glow-t" + course.tier + ")" }));
          sg.appendChild(el("circle", { cx: x, cy: y, r: 9.5, fill: "none", stroke: "#c3cbdd", "stroke-width": 1.4, "stroke-dasharray": "3 3" }));
        } else {
          sg.appendChild(el("circle", { class: "core", cx: x, cy: y, r: 4, fill: "#2b3550", stroke: "#3a4666", "stroke-width": 1 }));
        }
        /* 更大的点击热区（透明填充必须内联，避免脱离 CSS 时变黑遮盖星星） */
        sg.appendChild(el("circle", { class: "star-hit", cx: x, cy: y, r: 14, fill: "transparent" }));

        sg.addEventListener("click", () => handlers.onStarClick(k));
        sg.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handlers.onStarClick(k); } });
        sg.addEventListener("mouseenter", e => handlers.onStarHover(k, course, st, e));
        sg.addEventListener("mousemove", e => handlers.onStarHover(k, course, st, e));
        sg.addEventListener("mouseleave", handlers.onHoverEnd);
        g.appendChild(sg);
      });

      /* 课程标签 */
      const [cx, cy] = centers[course.id];
      const litCount = statuses.filter(s => s === "done").length;
      const labelY = cy + (stars.length === 1 ? 24 : Math.min(30 + stars.length * 7, 80) * 0.82 + 22);
      const label = el("text", { x: cx, y: labelY, "text-anchor": "middle", class: "course-label" + (allDone ? " done" : "") });
      label.textContent = course.cn;
      if (allDone) label.setAttribute("fill", color);
      g.appendChild(label);
      const count = el("text", { x: cx, y: labelY + 15, "text-anchor": "middle", class: "course-count" });
      count.textContent = litCount + " / " + stars.length;
      g.appendChild(count);

      svg.appendChild(g);
    });
  }

  window.Starmap = { render: render, TIER_COLOR: TIER_COLOR };
})();
