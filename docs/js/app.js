/* 应用主逻辑：数据加载、进度状态合并（权威 + 预览）、三视图渲染、厂商双版本切换 */
(function () {
  "use strict";

  /* ---------- 双版本厂商配置 ---------- */
  const PROVIDERS = {
    anthropic: {
      switchTo: "openai",
      switchLabel: "⇄ 切换到 OpenAI 课程",
      eyebrow: "ANTHROPIC SKILLJAR · 2026",
      dataDir: "data/anthropic/",
      storageSuffix: "",           /* 无后缀 = 兼容既有 localStorage 数据 */
      sourceLabel: "Anthropic 课程",
      sourceUrl: "https://anthropic.skilljar.com/",
      planLink: true
    },
    openai: {
      switchTo: "anthropic",
      switchLabel: "⇄ 切换到 Anthropic 课程",
      eyebrow: "OPENAI ACADEMY · 2026",
      dataDir: "data/openai/",
      storageSuffix: ":openai",
      sourceLabel: "OpenAI 课程",
      sourceUrl: "https://academy.openai.com/",
      planLink: false
    }
  };
  /* URL ?v= 优先 → localStorage 记忆 → 默认 anthropic */
  const provider = (function () {
    const fromUrl = new URLSearchParams(location.search).get("v");
    const remembered = localStorage.getItem("cc-map-provider");
    const p = PROVIDERS[fromUrl] ? fromUrl : (PROVIDERS[remembered] ? remembered : "anthropic");
    localStorage.setItem("cc-map-provider", p);
    document.body.dataset.provider = p;
    return p;
  })();
  const P = PROVIDERS[provider];

  const PREVIEW_KEY = "cc-map-preview" + P.storageSuffix;
  const STATUS_TEXT = { done: "已点亮", preview: "预览点亮", doing: "进行中", todo: "未点亮" };

  function tierColor(t) {
    return (state.data.tiers[t] || {}).colorHex || "#3987e5";
  }

  const state = {
    data: null,
    progress: null,
    preview: loadPreview(),
    passed: loadPassed(), /* 测验通过记录 { k0101: "2026-07-11" }，独立于预览 */
    /* 权威优先：done > preview > doing > todo */
    statusOf(type, id) {
      const auth = (this.progress[type] || {})[id];
      if (auth && auth.status === "done") return "done";
      if (this.preview[type + ":" + id]) return "preview";
      if (auth && auth.status === "doing") return "doing";
      return "todo";
    },
    dateOf(type, id) {
      const auth = (this.progress[type] || {})[id];
      return auth ? auth.date : null;
    }
  };

  function loadPreview() {
    try { return JSON.parse(localStorage.getItem(PREVIEW_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function savePreview() {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(state.preview));
  }

  const PASSED_KEY = "cc-map-quiz-passed" + P.storageSuffix;
  function loadPassed() {
    try { return JSON.parse(localStorage.getItem(PASSED_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function savePassed() {
    localStorage.setItem(PASSED_KEY, JSON.stringify(state.passed));
  }

  async function loadData() {
    const [courses, knowledge, projects, progress, quiz] = await Promise.all(
      ["courses.json", "knowledge.json", "projects.json", "progress.json", "quiz.json"]
        .map(f => P.dataDir + f)
        .map(u => fetch(u).then(r => {
          if (!r.ok) throw new Error(u + " → HTTP " + r.status);
          return r.json();
        }))
    );
    const knowledgeByCourse = {};
    knowledge.knowledge.forEach(k => {
      (knowledgeByCourse[k.course] = knowledgeByCourse[k.course] || []).push(k);
    });
    state.data = {
      courses: courses.courses,
      tiers: courses.tiers,
      layout: courses.layout,
      knowledge: knowledge.knowledge,
      knowledgeByCourse: knowledgeByCourse,
      projects: projects.projects,
      quiz: quiz,
      kById: Object.fromEntries(knowledge.knowledge.map(k => [k.id, k]))
    };
    state.progress = progress;
    /* 梯队色的唯一数据源是 courses.json，同步到 CSS 变量，页面 chrome 与星图保持一致 */
    Object.keys(state.data.tiers).forEach(t => {
      document.documentElement.style.setProperty("--t" + t, state.data.tiers[t].colorHex);
    });
  }

  /* ---------- 课程/项目完成的推导 ---------- */
  function courseStatus(course) {
    const auth = (state.progress.courses || {})[course.id];
    if (auth && auth.status === "done") return "done";
    const ks = state.data.knowledgeByCourse[course.id] || [];
    if (ks.length && ks.every(k => state.statusOf("knowledge", k.id) === "done")) return "done";
    if (auth && auth.status === "doing") return "doing";
    if (ks.some(k => state.statusOf("knowledge", k.id) !== "todo")) return "doing";
    return "todo";
  }

  /* ---------- 顶部统计 ---------- */
  function renderStats() {
    const doneStars = state.data.knowledge.filter(k => state.statusOf("knowledge", k.id) === "done").length;
    const previewStars = state.data.knowledge.filter(k => state.statusOf("knowledge", k.id) === "preview").length;
    const doneCourses = state.data.courses.filter(c => courseStatus(c) === "done").length;
    const doneProjects = state.data.projects.filter(p => state.statusOf("projects", p.id) === "done").length;
    document.getElementById("stat-stars").textContent =
      doneStars + " / " + state.data.knowledge.length + " 颗星已点亮" + (previewStars ? "（+" + previewStars + " 预览）" : "");
    document.getElementById("stat-courses").textContent = doneCourses + " / " + state.data.courses.length + " 门课完成";
    document.getElementById("stat-projects").textContent = doneProjects + " / " + state.data.projects.length + " 个项目达成";
  }

  /* ---------- 预览横幅 ---------- */
  function renderBanner() {
    const banner = document.getElementById("preview-banner");
    const n = Object.keys(state.preview).length;
    if (!n) { banner.hidden = true; return; }
    banner.hidden = false;
    document.getElementById("preview-banner-text").textContent =
      "有 " + n + " 个未保存的预览点亮 — 学完后告诉 Claude「点亮」正式保存进仓库";
  }

  /* ---------- 知识点详情弹窗 ---------- */
  function togglePreview(kid) {
    const key = "knowledge:" + kid;
    if (state.preview[key]) delete state.preview[key];
    else state.preview[key] = true;
    savePreview();
    renderAll();
  }

  function openKnowledge(k) {
    const course = state.data.courses.find(c => c.id === k.course);
    Quiz.open({
      k: k,
      course: course,
      color: tierColor(course.tier),
      quiz: state.data.quiz[k.id] || null,
      state: state,
      passedDate: () => state.passed[k.id] || null,
      onTogglePreview: () => togglePreview(k.id),
      onPass: () => {
        state.passed[k.id] = new Date().toISOString().slice(0, 10);
        savePassed();
        if (!state.preview["knowledge:" + k.id]) togglePreview(k.id);
        else renderAll();
      }
    });
  }

  /* ---------- 星图 ---------- */
  const tooltip = document.getElementById("tooltip");
  function renderStarmap() {
    Starmap.render(document.getElementById("starmap"), state.data, state, {
      onStarClick(k) { openKnowledge(k); },
      onStarHover(k, course, st, e) {
        tooltip.innerHTML = "<strong>" + k.name + "</strong>" +
          "<div class='tt-sub'>" + course.cn + " · " + STATUS_TEXT[st] +
          (st === "done" && state.dateOf("knowledge", k.id) ? " · " + state.dateOf("knowledge", k.id) : "") +
          "</div>";
        tooltip.hidden = false;
        tooltip.style.left = Math.min(e.clientX + 14, window.innerWidth - 280) + "px";
        tooltip.style.top = (e.clientY - 44) + "px";
      },
      onHoverEnd() { tooltip.hidden = true; }
    });
  }

  /* ---------- 项目视图 ---------- */
  function renderProjects() {
    const track = document.getElementById("projects-track");
    track.textContent = "";
    const sizes = [48, 58, 68, 80, 96];
    state.data.projects.forEach((p, i) => {
      const st = state.statusOf("projects", p.id);
      const size = sizes[i] || 68;
      const color = tierColor([1, 1, 2, 2, 3][i] || 3);

      const card = document.createElement("article");
      card.className = "project-card";

      const planetWrap = document.createElement("div");
      planetWrap.className = "planet";
      planetWrap.innerHTML =
        '<svg width="96" height="' + (size + 20) + '" viewBox="0 0 96 ' + (size + 20) + '">' +
        (st === "done"
          ? '<ellipse cx="48" cy="' + (size / 2 + 10) + '" rx="' + (size / 2 + 9) + '" ry="' + (size / 5) + '" fill="none" stroke="' + color + '" stroke-width="1.5" opacity="0.7" transform="rotate(-18 48 ' + (size / 2 + 10) + ')"/>'
          : "") +
        '<circle cx="48" cy="' + (size / 2 + 10) + '" r="' + (size / 2) + '" fill="' + (st === "done" ? color : "#1c2540") + '" ' +
        (st === "done" ? 'style="filter: drop-shadow(0 0 10px ' + color + '66)"' : 'stroke="#2f3a5c" stroke-width="1.5"') + '/>' +
        "</svg>";

      const body = document.createElement("div");
      body.className = "project-body";
      const covers = p.covers.map(kid => {
        const k = state.data.kById[kid];
        if (!k) return "";
        const done = state.statusOf("knowledge", kid) === "done";
        return '<span class="chip' + (done ? " done" : "") + '">' + k.name + "</span>";
      }).join("");
      const extras = p.extraSkills.map(s => '<span class="chip extra">' + s + "</span>").join("");
      body.innerHTML =
        "<h3>" + p.name + '<span class="level">' + p.level + " · " + p.weeks + "</span></h3>" +
        '<p class="desc">' + p.desc + "</p>" +
        '<div class="chips">' + covers + extras + "</div>" +
        '<p class="project-status ' + st + '">' +
        ({ done: "✦ 已达成" + (state.dateOf("projects", p.id) ? " · " + state.dateOf("projects", p.id) : ""),
           doing: "◐ 进行中", preview: "◌ 预览", todo: "○ 待启程" })[st] + "</p>";

      card.appendChild(planetWrap);
      card.appendChild(body);
      track.appendChild(card);
    });
  }

  /* ---------- 列表视图 ---------- */
  function renderList() {
    const root = document.getElementById("list-root");
    root.textContent = "";

    /* 课程 + 知识点 */
    const secCourse = document.createElement("section");
    secCourse.className = "list-section";
    secCourse.innerHTML = "<h2>课程 · 星座</h2>";
    state.data.courses.forEach(c => {
      const ks = state.data.knowledgeByCourse[c.id] || [];
      /* 计数含预览点亮，和星图视觉一致 */
      const litN = ks.filter(k => {
        const s = state.statusOf("knowledge", k.id);
        return s === "done" || s === "preview";
      }).length;
      const cst = courseStatus(c);
      const color = tierColor(c.tier);

      const details = document.createElement("details");
      details.className = "course-k";
      const summary = document.createElement("summary");
      summary.innerHTML =
        '<div class="list-row">' +
        '<span class="status-dot ' + cst + '" style="color:' + color + '"></span>' +
        '<span class="name">' + c.cn + '<span class="en">' + c.en + "</span></span>" +
        '<span class="tier-chip" style="color:' + color + '">' + state.data.tiers[c.tier].name + "</span>" +
        '<span class="meta">' + litN + " / " + ks.length + (litN === ks.length && ks.length ? " ✦" : "") + "</span>" +
        "</div>";
      details.appendChild(summary);

      const kwrap = document.createElement("div");
      kwrap.className = "k-items";
      ks.forEach(k => {
        const st = state.statusOf("knowledge", k.id);
        const btn = document.createElement("button");
        btn.className = "k-item";
        btn.type = "button";
        btn.innerHTML =
          '<span class="status-dot ' + st + '" style="color:' + color + '"></span>' +
          "<span>" + k.name + "</span>" +
          '<span class="kdate">' + (st === "done" ? (state.dateOf("knowledge", k.id) || "") : STATUS_TEXT[st]) + "</span>";
        btn.addEventListener("click", () => openKnowledge(k));
        kwrap.appendChild(btn);
      });
      details.appendChild(kwrap);
      secCourse.appendChild(details);
    });
    root.appendChild(secCourse);

    /* 项目 */
    const secProj = document.createElement("section");
    secProj.className = "list-section";
    secProj.innerHTML = "<h2>项目 · 行星</h2>";
    state.data.projects.forEach(p => {
      const st = state.statusOf("projects", p.id);
      const row = document.createElement("div");
      row.className = "list-row";
      row.innerHTML =
        '<span class="status-dot ' + st + '" style="color:#c98500"></span>' +
        '<span class="name">' + p.name + '<span class="en">' + p.level + " · " + p.weeks + "</span></span>" +
        '<span class="meta">' + STATUS_TEXT[st] + (st === "done" && state.dateOf("projects", p.id) ? " · " + state.dateOf("projects", p.id) : "") + "</span>";
      secProj.appendChild(row);
    });
    root.appendChild(secProj);
  }

  /* ---------- 视图切换 ---------- */
  function setupTabs() {
    const tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => {
          const on = t === tab;
          t.setAttribute("aria-selected", on ? "true" : "false");
          document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
        });
      });
    });
  }

  function renderAll() {
    renderStats();
    renderBanner();
    renderStarmap();
    renderProjects();
    renderList();
  }

  document.getElementById("clear-preview").addEventListener("click", () => {
    state.preview = {};
    savePreview();
    renderAll();
  });

  /* ---------- 厂商相关的页面 chrome：眉题、页脚链接、切换按钮 ---------- */
  function renderChrome() {
    document.getElementById("eyebrow").textContent = P.eyebrow;
    const src = document.getElementById("source-link");
    src.textContent = P.sourceLabel;
    src.href = P.sourceUrl;
    document.getElementById("plan-link-wrap").hidden = !P.planLink;
    const sw = document.getElementById("switch-provider");
    sw.textContent = P.switchLabel;
    sw.addEventListener("click", () => {
      localStorage.setItem("cc-map-provider", P.switchTo);
      location.search = "?v=" + P.switchTo; /* 整页刷新，状态最干净 */
    });
  }

  renderChrome();
  loadData()
    .then(() => { setupTabs(); renderAll(); Heatmap.init(); })
    .catch(err => {
      document.querySelector("main").innerHTML =
        '<p style="text-align:center;color:#9aa5bd;padding:40px">数据加载失败：' + err.message +
        "<br>（本页需要通过 HTTP 服务访问，直接双击打开 HTML 文件会读不到数据）</p>";
    });
})();
