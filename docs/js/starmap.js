/* 星图渲染：知识点=星星，课程=星座，梯队=天区。
 * 宽屏：天区/槽位/梯队色全部来自 courses.json 的 layout 与 tiers 字段（按厂商数据驱动）。
 * 窄屏（≤ 640px，手机竖屏）：宽屏那张 1200 宽的图塞进手机只剩三分之一大，课程名看不清，
 *   所以不用 layout.slots，按天区自动排成两列（compactGeometry），课程名按宽度折行。
 *   星座内部的星星排布两边一样（都以课程 id 为种子），只是星座摆的位置不同。
 * 触屏上星星仍然太小、挨得太近，点击改成两步：
 *   全图点星座 → 放大到这个星座 → 点星星先选中，再点一次才打开。
 *   两步都按「离手指最近」来判定，不依赖每颗星那圈很小的点击热区。 */
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  function tierColor(data, t) {
    return (data.tiers[t] || {}).colorHex || "#3987e5";
  }

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

  /* 星云半径：星座大小只由星星数决定（CLAUDE.md「星座大小」一节的公式） */
  function nebulaR(n) {
    return n === 1 ? 0 : Math.min(30 + n * 7, 80);
  }

  /* 课程标签基线相对星云中心的下移量 */
  function labelOffset(n) {
    return n === 1 ? 24 : nebulaR(n) * 0.82 + 22;
  }

  function isCompact() {
    return !!(window.matchMedia && window.matchMedia("(max-width: 640px)").matches);
  }

  function isTouchMode() {
    return !!(window.matchMedia &&
      (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 640px)").matches));
  }

  /* ---------- 窄屏两列布局 ---------- */
  const COMPACT_W = 400;          /* 手机上约 0.9 px / 单位 */
  const COMPACT_COLS = [105, 295]; /* 两列星座中心 x；最大星云直径 160，两列之间还留 30 */
  const LABEL_EM = 11;            /* 课程名每行最多约 11 个汉字宽（14 号字 ≈ 154 单位，不越过列宽） */
  const LINE_H = 17;

  /* 估算文字宽度（em）：汉字算 1，拉丁字母数字按 0.55 */
  function textEm(s) {
    let w = 0;
    for (const ch of s) w += /[\u0000-\u024f]/.test(ch) ? 0.55 : 1;
    return w;
  }

  function tokenize(text) {
    return text.match(/[A-Za-z0-9&'’.+\-\/]+\s*|\s+|./gu) || [];
  }

  /* 按 maxEm 贪心折行：英文单词整个挪到下一行，汉字逐字断 */
  function greedyWrap(text, maxEm) {
    const lines = [];
    let cur = "";
    tokenize(text).forEach(t => {
      if (cur.trim() && textEm((cur + t).trimEnd()) > maxEm) { lines.push(cur.trimEnd()); cur = t.trimStart(); }
      else cur += t;
    });
    if (cur.trim()) lines.push(cur.trimEnd());
    return lines;
  }

  /* 课程名折行。现有课程名最多折两行：这时逐个断点试，取两行里较长那行最短的断法，
   * 在两个汉字中间断（「产品 / 人」）额外扣分，优先断在空格、斜杠处；
   * 贪心断法会出现「创业者/产品人的 AI 素 / 养」这种末行只剩一个字的情况 */
  function wrapLabel(text, maxEm) {
    const lines = greedyWrap(text, maxEm);
    if (lines.length !== 2) return lines;
    const tokens = tokenize(text);
    const cjk = /[^\u0000-\u024f]/;
    let best = lines, bestScore = Infinity;
    for (let i = 1; i < tokens.length; i++) {
      const a = tokens.slice(0, i).join("").trimEnd(), b = tokens.slice(i).join("").trimStart();
      const wa = textEm(a), wb = textEm(b);
      if (!a || !b || wa > maxEm || wb > maxEm) continue;
      const score = Math.max(wa, wb) + (cjk.test(a.slice(-1)) && cjk.test(b[0]) ? 3 : 0);
      if (score < bestScore) { bestScore = score; best = [a, b]; }
    }
    return best;
  }

  /* 星座摆放位置。宽屏按 courses.json 的槽位；窄屏按天区自上而下两个一行，行高取这一行里最大的星座与最长的标签 */
  function geometry(data, compact) {
    const byTier = {};
    data.courses.forEach(c => (byTier[c.tier] = byTier[c.tier] || []).push(c));
    const centers = {};
    if (!compact) {
      for (const tier of Object.keys(byTier)) {
        byTier[tier].forEach((course, i) => { centers[course.id] = (data.layout.slots[tier] || [])[i] || [600, 400]; });
      }
      return { compact: false, viewBox: data.layout.viewBox, centers: centers, regions: data.layout.regions, lines: null };
    }
    const lines = {}, regions = [];
    let y = 0;
    for (const tier of Object.keys(byTier)) {
      const rg = (data.layout.regions || []).find(r => String(r.tier) === String(tier));
      y += 34;
      regions.push({ tier: +tier, y: y, label: rg ? rg.label : data.tiers[tier].name });
      y += 14;
      const courses = byTier[tier];
      for (let i = 0; i < courses.length; i += 2) {
        const row = courses.slice(i, i + 2).map(c => {
          const n = (data.knowledgeByCourse[c.id] || []).length;
          lines[c.id] = wrapLabel(c.cn, LABEL_EM);
          return { c: c, n: n };
        });
        const cy = y + Math.max(...row.map(o => nebulaR(o.n) * 0.72)) + 22;
        row.forEach((o, j) => { centers[o.c.id] = [row.length === 1 ? COMPACT_W / 2 : COMPACT_COLS[j], cy]; });
        y = cy + Math.max(...row.map(o => labelOffset(o.n) + (lines[o.c.id].length - 1) * LINE_H + 15)) + 26;
      }
    }
    return { compact: true, viewBox: [COMPACT_W, Math.round(y + 10)], centers: centers, regions: regions, lines: lines };
  }

  /* 放大到某个星座时的 viewBox */
  function zoomBox(geo, center, n, nLines) {
    const [vw, vh] = geo.viewBox;
    const R = nebulaR(n);
    const w = Math.min(vw, Math.max(220, 2 * R + 100));
    const x = Math.max(0, Math.min(vw - w, center[0] - w / 2));
    if (geo.compact) {
      /* 窄屏全图本身就是细长一条，保持宽高比会把星座放进一根长条里；只框住星座和它的标签，星图元素随之变矮 */
      const top = center[1] - R * 0.72 - 30;
      const bottom = center[1] + labelOffset(n) + (nLines - 1) * LINE_H + 15 + 24;
      return [x, top, w, bottom - top];
    }
    /* 宽屏：宽高比与全图一致，星图元素的尺寸就不会跳，页面不会跟着抖 */
    const h = w * vh / vw;
    const midY = center[1] + (R * 0.82 + 30) / 2; /* 星座连同下方标签一起居中 */
    const y = Math.max(0, Math.min(vh - h, midY - h / 2));
    return [x, y, w, h];
  }

  function setBox(svg, box) {
    svg.setAttribute("viewBox", box.map(v => +v.toFixed(2)).join(" "));
  }

  function animateBox(svg, from, to) {
    cancelAnimationFrame(svg._zoomRaf);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !from) { setBox(svg, to); return; }
    const t0 = performance.now(), D = 320;
    const step = now => {
      const t = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - t, 3);
      setBox(svg, from.map((v, i) => v + (to[i] - v) * e));
      if (t < 1) svg._zoomRaf = requestAnimationFrame(step);
    };
    svg._zoomRaf = requestAnimationFrame(step);
  }

  /* 屏幕坐标 → 星图坐标。星图元素与 viewBox 宽高比一致，线性换算即可 */
  function toSvgPoint(svg, e) {
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const [x, y, w, h] = svg.getAttribute("viewBox").split(" ").map(Number);
    return [x + (e.clientX - r.left) / r.width * w, y + (e.clientY - r.top) / r.height * h];
  }

  /* items: [[对象, [x, y]], ...]；返回 maxDist 以内离 p 最近的对象 */
  function nearest(items, p, maxDist) {
    let best = null, bestD = maxDist;
    items.forEach(([obj, q]) => {
      const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d <= bestD) { best = obj; bestD = d; }
    });
    return best;
  }

  function el(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  /* 星星坐标：以星座中心为原点、课程 id 为种子，宽屏窄屏同一个形状 */
  function starPositions(data, centers) {
    const starPos = {};
    data.courses.forEach(course => {
      const c = centers[course.id];
      const stars = data.knowledgeByCourse[course.id] || [];
      const n = stars.length;
      const rng = mulberry32(seedOf(course.id));
      const R = nebulaR(n);
      stars.forEach((k, j) => {
        if (n === 1) { starPos[k.id] = c; return; }
        const angle = (j / n) * Math.PI * 2 + rng() * 0.9 - 0.45;
        const r = R * (0.5 + 0.5 * rng());
        starPos[k.id] = [c[0] + Math.cos(angle) * r, c[1] + Math.sin(angle) * r * 0.72];
      });
    });
    return starPos;
  }

  /* opts.animateFrom：上一刻的 viewBox，给了就从它平滑过渡到新视野（放大 / 换星座 / 回全图）
   * opts.plain：一律按宽屏桌面样式画全图（分享图片用），不看屏幕宽度、是不是触屏 */
  function render(svg, data, state, handlers, opts) {
    svg.textContent = "";
    const plain = !!(opts && opts.plain);
    const geo = geometry(data, !plain && isCompact());
    const [vw, vh] = geo.viewBox;
    const centers = geo.centers;
    const starPos = starPositions(data, centers);
    const full = [0, 0, vw, vh];
    /* app.js 回全图时要把视野滚回刚才那个星座，得知道它在图上的位置 */
    svg._centers = centers;
    svg._fullH = vh;
    /* 每次交互都整张重画；「闪亮」动画只给这次新亮的星，否则选一颗星、点一下 ‹ › 所有亮星都跟着闪。
     * 页面刚打开（还没有上一次）时全部闪一下，当作开场 */
    const prevLit = svg._lit;
    const nowLit = new Set();
    svg._lit = nowLit;

    const touch = !plain && isTouchMode();
    const zoomCourse = touch && state.zoom ? data.courses.find(c => c.id === state.zoom) : null;
    const box = zoomCourse
      ? zoomBox(geo, centers[zoomCourse.id], (data.knowledgeByCourse[zoomCourse.id] || []).length,
          geo.lines ? geo.lines[zoomCourse.id].length : 1)
      : full;
    /* 窄屏放大会改变星图元素的高度，逐帧过渡会让整页跟着上下抖，直接切换 */
    if (opts && opts.animateFrom && !geo.compact) animateBox(svg, opts.animateFrom, box);
    else { cancelAnimationFrame(svg._zoomRaf); setBox(svg, box); }
    svg.classList.toggle("zoomed", !!zoomCourse);
    svg.classList.toggle("compact", geo.compact);

    svg.onclick = !touch ? null : e => {
      const p = toSvgPoint(svg, e);
      if (!p) return;
      if (zoomCourse) {
        const ks = data.knowledgeByCourse[zoomCourse.id] || [];
        const k = nearest(ks.map(k => [k, starPos[k.id]]), p, 34);
        if (k) { handlers.onStarTap(k); return; }
      }
      /* 判定点取星云中心略偏下，把下方的课程标签也算进星座的范围 */
      const c = nearest(data.courses.map(c => {
        const R = nebulaR((data.knowledgeByCourse[c.id] || []).length);
        return [c, [centers[c.id][0], centers[c.id][1] + R * 0.3]];
      }), p, zoomCourse ? 120 : 150);
      if (c && c !== zoomCourse) handlers.onCourseTap(c);
    };

    const defs = el("defs", {});
    for (const t of Object.keys(data.tiers)) {
      const f = el("filter", { id: "glow-t" + t, x: "-120%", y: "-120%", width: "340%", height: "340%" });
      const blur = el("feGaussianBlur", { stdDeviation: "3.2", result: "b" });
      const merge = el("feMerge", {});
      merge.appendChild(el("feMergeNode", { in: "b" }));
      merge.appendChild(el("feMergeNode", { in: "SourceGraphic" }));
      f.appendChild(blur); f.appendChild(merge);
      defs.appendChild(f);

      /* 整座点亮时的光环渐变 */
      const grad = el("radialGradient", { id: "halo-t" + t });
      const s0 = el("stop", { offset: "0%", "stop-color": tierColor(data, t), "stop-opacity": "0.22" });
      const s1 = el("stop", { offset: "70%", "stop-color": tierColor(data, t), "stop-opacity": "0.07" });
      const s2 = el("stop", { offset: "100%", "stop-color": tierColor(data, t), "stop-opacity": "0" });
      grad.appendChild(s0); grad.appendChild(s1); grad.appendChild(s2);
      defs.appendChild(grad);
    }
    svg.appendChild(defs);

    /* 背景星尘（密度随画布面积缩放，保持视觉一致） */
    const dustRng = mulberry32(20260711);
    const dustN = Math.round(130 * (vw * vh) / (1200 * 980));
    for (let i = 0; i < dustN; i++) {
      const d = el("circle", {
        cx: (dustRng() * vw).toFixed(1), cy: (dustRng() * vh).toFixed(1),
        r: (0.5 + dustRng()).toFixed(2), fill: "#8fa3cc",
        opacity: (0.08 + dustRng() * 0.3).toFixed(2),
        class: "dust" + (dustRng() > 0.75 ? " tw" : "")
      });
      if (d.classList.contains("tw")) d.style.animationDelay = (dustRng() * 4).toFixed(1) + "s";
      svg.appendChild(d);
    }

    /* 天区标签 */
    geo.regions.forEach(rg => {
      const t = el("text", { x: 24, y: rg.y, class: "region-label" });
      t.textContent = rg.label;
      svg.appendChild(t);
      const tick = el("line", { x1: 24, y1: rg.y + 8, x2: 210, y2: rg.y + 8, stroke: tierColor(data, rg.tier), "stroke-width": 2, opacity: 0.9 });
      svg.appendChild(tick);
    });

    /* 课程先修关系（虚线，仅前两个梯队，避免杂乱）；窄屏两列排布下连线会横穿别的星座，不画 */
    data.courses.forEach(c => {
      if (c.tier === 3 || geo.compact) return;
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
      const color = tierColor(data, course.tier);
      const statuses = stars.map(k => state.statusOf("knowledge", k.id));
      const isLit = s => s === "done";
      const allLit = stars.length > 0 && statuses.every(isLit);

      const g = el("g", { "data-course": course.id, class: course === zoomCourse ? "focus" : "" });

      /* 整座点亮：星座背后浮起梯队色光环 */
      if (allLit) {
        const [hx, hy] = centers[course.id];
        const hr = stars.length === 1 ? 42 : nebulaR(stars.length) + 42;
        g.appendChild(el("ellipse", {
          cx: hx, cy: hy, rx: hr, ry: hr * 0.72 + 8,
          fill: "url(#halo-t" + course.tier + ")",
          class: "constellation-halo"
        }));
      }

      for (let i = 0; i < stars.length - 1; i++) {
        const a = starPos[stars[i].id], b = starPos[stars[i + 1].id];
        const bothLit = isLit(statuses[i]) && isLit(statuses[i + 1]);
        const attrs = {
          x1: a[0], y1: a[1], x2: b[0], y2: b[1],
          class: "constellation-line",
          stroke: allLit ? color : "#2a3454",
          "stroke-width": allLit ? 1.6 : 1,
          opacity: bothLit ? 0.9 : 0.55
        };
        if (allLit) attrs.filter = "url(#glow-t" + course.tier + ")";
        g.appendChild(el("line", attrs));
      }

      stars.forEach((k, i) => {
        const [x, y] = starPos[k.id];
        const st = statuses[i];
        /* data-k 供测验通过后的撒花定位这颗星（见 quiz.js 的 celebrateAtStar） */
        const lit = isLit(st);
        if (lit) nowLit.add(k.id);
        const flare = lit && (!prevLit || !prevLit.has(k.id));
        const sg = el("g", { class: "star" + (lit ? " lit" : "") + (flare ? " flare" : ""), "data-k": k.id, tabindex: "0", role: "button" });
        sg.setAttribute("aria-label", k.name + "（" + (lit ? "已点亮" : "未点亮") + "）");

        if (lit) {
          sg.appendChild(el("circle", { class: "core", cx: x, cy: y, r: 5.5, fill: color, filter: "url(#glow-t" + course.tier + ")" }));
          sg.appendChild(el("circle", { cx: x, cy: y, r: 1.8, fill: "#ffffff" }));
        } else {
          sg.appendChild(el("circle", { class: "core", cx: x, cy: y, r: 4, fill: "#2b3550", stroke: "#3a4666", "stroke-width": 1 }));
        }
        /* 触屏放大后选中的那颗：外面套一圈白环，名字显示在 app.js 的放大栏里 */
        if (state.selected === k.id && zoomCourse) {
          sg.appendChild(el("circle", { class: "star-selected-ring", cx: x, cy: y, r: 11 }));
        }
        /* 推荐的下一颗星（app.js 的 computeNext）：虚线圈慢慢转，告诉新访客从哪下手；分享图片里不画 */
        if (!plain && state.next === k.id) {
          sg.appendChild(el("circle", { class: "star-next-ring", cx: x, cy: y, r: 10, stroke: color }));
        }
        /* 更大的点击热区（透明填充必须内联，避免脱离 CSS 时变黑遮盖星星） */
        sg.appendChild(el("circle", { class: "star-hit", cx: x, cy: y, r: 14, fill: "transparent" }));

        sg.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handlers.onStarClick(k); } });
        /* 触屏的点击统一交给上面的 svg.onclick 判定；悬停提示在触屏上点一下会卡住不消失，也不挂 */
        if (!touch) {
          sg.addEventListener("click", () => handlers.onStarClick(k));
          sg.addEventListener("mouseenter", e => handlers.onStarHover(k, course, st, e));
          sg.addEventListener("mousemove", e => handlers.onStarHover(k, course, st, e));
          sg.addEventListener("mouseleave", handlers.onHoverEnd);
        }
        g.appendChild(sg);
      });

      /* 课程标签：点亮计数；整座点亮加 ✦ 徽记 */
      const [cx, cy] = centers[course.id];
      const litCount = statuses.filter(isLit).length;
      const labelY = cy + labelOffset(stars.length);
      const label = el("text", { x: cx, y: labelY, "text-anchor": "middle", class: "course-label" + (allLit ? " done" : "") });
      /* 窄屏按 geometry 算好的行折开（行数决定了行高，这里不能再加 ✦，否则可能多出一行压到下一排） */
      const labelLines = geo.lines ? geo.lines[course.id] : [allLit ? "✦ " + course.cn + " ✦" : course.cn];
      labelLines.forEach((line, li) => {
        const ts = el("tspan", { x: cx, dy: li ? LINE_H : 0 });
        ts.textContent = line;
        label.appendChild(ts);
      });
      if (allLit) {
        label.style.fill = color; /* 内联 style 才能压过样式表的 fill */
        label.setAttribute("filter", "url(#glow-t" + course.tier + ")");
      }
      g.appendChild(label);
      const count = el("text", { x: cx, y: labelY + (labelLines.length - 1) * LINE_H + 15, "text-anchor": "middle", class: "course-count" });
      count.textContent = allLit ? litCount + " / " + stars.length + " 全座点亮" : litCount + " / " + stars.length;
      if (allLit) count.style.fill = color;
      g.appendChild(count);

      svg.appendChild(g);
    });
  }

  window.Starmap = { render: render, isTouchMode: isTouchMode, isCompact: isCompact };
})();
