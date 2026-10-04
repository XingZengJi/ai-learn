/* 应用主逻辑：数据加载、三种星图（我的 / 作者的 / 别人分享的）、三视图渲染、厂商双版本切换 */
(function () {
  "use strict";

  /* ---------- 双版本厂商配置 ---------- */
  const PROVIDERS = {
    anthropic: {
      switchTo: "openai",
      switchLabel: "⇄ OpenAI 课程",
      title: "CC 学习成就地图",
      eyebrow: "ANTHROPIC SKILLJAR · 2026",
      dataDir: "data/anthropic/",
      storageSuffix: "",           /* 无后缀 = 兼容既有 localStorage 数据 */
      sourceLabel: "Anthropic 课程",
      sourceUrl: "https://anthropic.skilljar.com/",
      planLink: true
    },
    openai: {
      switchTo: "anthropic",
      switchLabel: "⇄ Anthropic 课程",
      title: "OpenAI 学习成就地图",
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

  /* 「我的星图」的点亮记录。键名沿用早期的 preview 叫法，换名会丢掉访客已有的记录 */
  const PREVIEW_KEY = "cc-map-preview" + P.storageSuffix;
  const STATUS_TEXT = { done: "已点亮", doing: "进行中", todo: "未点亮" };

  function tierColor(t) {
    return (state.data.tiers[t] || {}).colorHex || "#3987e5";
  }

  /* 三种星图互不混合：
   *   mine   我的星图：本浏览器里答题点亮的记录（localStorage），访客默认看到的就是它
   *   author 作者的星图：progress.json 里的正式进度（网址 #author）
   *   shared 别人分享的星图：网址 #s= 里解出来的点亮记录，只读
   * 项目（行星）是作者的实战项目，访客做不了，所以三种视图下都显示作者的项目进度。 */
  const state = {
    data: null,
    progress: null,
    view: "mine",
    shared: null, /* { name, lit: { "knowledge:k0101": true } } */
    notice: "",   /* 分享链接解不开时的一次性提示 */
    preview: loadPreview(),
    passed: loadPassed(), /* 测验通过记录 { k0101: "2026-07-11" }，「清空」不清它 */
    statusOf(type, id) {
      if (type === "projects" || this.view === "author") {
        const auth = (this.progress[type] || {})[id];
        return auth && (auth.status === "done" || auth.status === "doing") ? auth.status : "todo";
      }
      const lit = this.view === "shared" ? this.shared.lit : this.preview;
      return lit[type + ":" + id] ? "done" : "todo";
    },
    dateOf(type, id) {
      if (type === "projects" || this.view === "author") {
        const auth = (this.progress[type] || {})[id];
        return auth ? auth.date : null;
      }
      return this.view === "mine" && type === "knowledge" ? this.passed[id] || null : null;
    }
  };

  /* 按网址 # 决定看哪张星图；解不开的分享链接退回我的星图并提示一次 */
  function applyView() {
    const v = Share.parseHash(location.hash);
    state.shared = null;
    state.notice = "";
    if (v.type === "author") {
      state.view = "author";
    } else if (v.type === "shared") {
      state.view = "shared";
      const lit = {};
      v.kids.forEach(kid => { if (state.data.kById[kid]) lit["knowledge:" + kid] = true; });
      state.shared = { name: v.name, lit: lit };
    } else {
      state.view = "mine";
      if (v.type === "invalid") state.notice = "这个分享链接无法识别，已为你打开自己的星图";
    }
    document.body.dataset.view = state.view;
  }

  function goView(hash) {
    history.pushState(null, "", location.pathname + location.search + hash);
    applyView();
    renderAll();
    window.scrollTo(0, 0);
  }

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
    /* 课程级的手写状态只属于作者的星图，其余视图完全由知识点推导 */
    const auth = state.view === "author" ? (state.progress.courses || {})[course.id] : null;
    if (auth && auth.status === "done") return "done";
    const ks = state.data.knowledgeByCourse[course.id] || [];
    if (ks.length && ks.every(k => state.statusOf("knowledge", k.id) === "done")) return "done";
    if (auth && auth.status === "doing") return "doing";
    if (ks.some(k => state.statusOf("knowledge", k.id) !== "todo")) return "doing";
    return "todo";
  }

  /* ---------- 顶部统计 ---------- */
  function renderStats() {
    const s = countStats();
    const doneProjects = state.data.projects.filter(p => state.statusOf("projects", p.id) === "done").length;
    document.getElementById("stat-stars").textContent = s.stars + " / " + s.totalStars + " 颗星已点亮";
    document.getElementById("stat-courses").textContent = s.courses + " / " + s.totalCourses + " 门课完成";
    document.getElementById("stat-projects").textContent = doneProjects + " / " + state.data.projects.length + " 个项目达成";
    /* 项目是作者的，只在作者的星图里计入统计行 */
    const showProjects = state.view === "author";
    document.getElementById("stat-projects").hidden = !showProjects;
    document.getElementById("stat-projects-sep").hidden = !showProjects;
  }

  function countStats() {
    return {
      stars: state.data.knowledge.filter(k => state.statusOf("knowledge", k.id) === "done").length,
      totalStars: state.data.knowledge.length,
      courses: state.data.courses.filter(c => courseStatus(c) === "done").length,
      totalCourses: state.data.courses.length
    };
  }

  /* ---------- 顶部视图条：告诉访客现在看的是谁的星图 ---------- */
  function barButton(text, cls, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls || "";
    b.textContent = text;
    b.addEventListener("click", onClick);
    return b;
  }

  function renderViewBar() {
    const text = document.getElementById("view-bar-text");
    const actions = document.getElementById("view-bar-actions");
    actions.textContent = "";
    const n = countStats().stars;

    if (state.view === "author") {
      text.textContent = "你在看作者的星图（正式学习进度）";
      actions.appendChild(barButton("回到我的星图", "primary", () => goView("")));
    } else if (state.view === "shared") {
      text.textContent = "你在看「" + (state.shared.name || "一位学习者") + "」分享的星图 · 已点亮 " + n + " 颗";
      actions.appendChild(barButton("开始点亮我自己的", "primary", () => goView("")));
    } else {
      text.textContent = state.notice ||
        (n ? "我的星图 · 已点亮 " + n + " 颗，记录保存在这个浏览器里"
           : "点任意一颗星，答对测验就能点亮它 · 记录只保存在这个浏览器里");
      if (n) actions.appendChild(barButton("分享我的星图", "primary", openShare));
      actions.appendChild(barButton("看作者的星图", "", () => goView("#author")));
      if (n) {
        /* 清空要点两次，防手滑；passed 记录保留，重新点亮仍需答题 */
        const clear = barButton("清空", "quiet", () => {
          if (clear.dataset.armed) {
            state.preview = {};
            savePreview();
            renderAll();
            return;
          }
          clear.dataset.armed = "1";
          clear.textContent = "确认清空？";
          setTimeout(() => { delete clear.dataset.armed; clear.textContent = "清空"; }, 4000);
        });
        clear.id = "clear-mine";
        actions.appendChild(clear);
      }
    }
  }

  function openShare() {
    Share.open({
      provider: provider,
      kids: state.data.knowledge.filter(k => state.preview["knowledge:" + k.id]).map(k => k.id),
      stats: countStats(),
      siteTitle: P.title,
      eyebrow: P.eyebrow,
      svg: document.getElementById("starmap")
    });
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
      /* 作者的 / 别人的星图只读：测验要回自己的星图做 */
      readOnly: state.view !== "mine",
      onGoMine: () => { goView(""); openKnowledge(k); },
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
    /* 行星按顺序由小变大，尺寸随项目数摊开——别写死数组，加项目时后面几颗会全塌成同一个大小 */
    const n = state.data.projects.length;
    state.data.projects.forEach((p, i) => {
      const st = state.statusOf("projects", p.id);
      const size = n < 2 ? 96 : Math.round(48 + (i * 48) / (n - 1));
      /* 梯队色优先取 projects.json 的 tier；没有这字段时按位置三等分（n=5 时等价于旧的 [1,1,2,2,3]） */
      const color = tierColor(p.tier || Math.min(3, Math.floor((i * 3) / n) + 1));

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
      const litN = ks.filter(k => state.statusOf("knowledge", k.id) === "done").length;
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
    secProj.innerHTML = "<h2>作者的实战项目 · 行星</h2>";
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
    renderViewBar();
    renderStarmap();
    renderProjects();
    renderList();
  }

  /* 浏览器前进 / 后退在几张星图之间切换 */
  window.addEventListener("popstate", () => { if (state.data) { applyView(); renderAll(); } });

  /* ---------- 厂商相关的页面 chrome：眉题、页脚链接、切换按钮 ---------- */
  function renderChrome() {
    document.getElementById("site-title").textContent = P.title;
    document.title = P.title;
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
    .then(() => { applyView(); setupTabs(); renderAll(); Heatmap.init(); })
    .catch(err => {
      document.querySelector("main").innerHTML =
        '<p style="text-align:center;color:#9aa5bd;padding:40px">数据加载失败：' + err.message +
        "<br>（本页需要通过 HTTP 服务访问，直接双击打开 HTML 文件会读不到数据）</p>";
    });
})();
