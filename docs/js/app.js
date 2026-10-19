/* 应用主逻辑：数据加载、两种星图（我的 / 别人分享的）、三视图渲染、厂商双版本切换 */
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
  /* 浏览器禁用网站数据时 localStorage 一碰就抛错；包一层，存不了就当没存，页面照常能用 */
  function storeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function storeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* 存不了：这次访问的点亮记录刷新后会丢 */ }
  }

  /* URL ?v= 优先 → localStorage 记忆 → 默认 anthropic */
  const provider = (function () {
    const fromUrl = new URLSearchParams(location.search).get("v");
    const remembered = storeGet("cc-map-provider");
    const p = PROVIDERS[fromUrl] ? fromUrl : (PROVIDERS[remembered] ? remembered : "anthropic");
    storeSet("cc-map-provider", p);
    document.body.dataset.provider = p;
    return p;
  })();
  const P = PROVIDERS[provider];

  /* 「我的星图」的点亮记录。键名沿用早期的 preview 叫法，换名会丢掉访客已有的记录 */
  const PREVIEW_KEY = "cc-map-preview" + P.storageSuffix;
  /* 下面三份记录「清空」都不清：清空只是让星图重新变暗，答过的题、错过的题、拿到的成就仍算数 */
  const PASSED_KEY = "cc-map-quiz-passed" + P.storageSuffix;   /* 测验通过 { k0101: "2026-07-11" } */
  const WRONG_KEY = "cc-map-wrong" + P.storageSuffix;          /* 错题本 { k0101: [0, 2] }，值是题号（quiz.json 里的下标） */
  const ACHIEVED_KEY = "cc-map-achieved" + P.storageSuffix;
  const REVIEWED_KEY = "cc-map-reviewed" + P.storageSuffix;    /* 成就 { "first-star": "2026-10-18" } */
  /* 这些键必须定义在 state 之前：state 初始化时就要读它们。曾经 PASSED_KEY 写在 state 后面，
   * 读取时撞上「先用后定义」的报错又被 try/catch 吞掉，刷新后测验记录全读不出来 */
  function loadJSON(key) {
    try { return JSON.parse(storeGet(key)) || {}; }
    catch (e) { return {}; }
  }
  function saveJSON(key, value) {
    storeSet(key, JSON.stringify(value));
  }
  const STATUS_TEXT = { done: "已点亮", doing: "进行中", todo: "未点亮" };
  /* 「看中文笔记」「这题有问题？」链到的仓库，取自 index.html 的 <meta name="repo-url">，fork 后只改那一处 */
  const REPO = ((document.querySelector('meta[name="repo-url"]') || {}).content || "").replace(/\/$/, "");
  const today = () => new Date().toISOString().slice(0, 10);

  function tierColor(t) {
    return (state.data.tiers[t] || {}).colorHex || "#3987e5";
  }

  /* 两种星图互不混合：
   *   mine   我的星图：本浏览器里的点亮记录（localStorage），访客默认看到的就是它
   *   shared 别人分享的星图：网址 #s= 里解出来的点亮记录，只读
   * 星星靠答题点亮；行星（实战项目）没法在网页里检查，由访客自己标记完成，值存完成日期。 */
  const state = {
    data: null,
    view: "mine",
    shared: null, /* { name, lit: { "knowledge:k0101": true, "projects:p6": true } } */
    zoom: null,     /* 触屏上放大到的课程 id；null = 全图（桌面端忽略） */
    selected: null, /* 触屏放大后选中、还没打开的知识点 id */
    notice: "",   /* 分享链接解不开时的一次性提示 */
    preview: loadJSON(PREVIEW_KEY),
    passed: loadJSON(PASSED_KEY),
    wrong: loadJSON(WRONG_KEY),
    achieved: loadJSON(ACHIEVED_KEY),
    reviewed: loadJSON(REVIEWED_KEY), /* 已点亮的星最近一次温习全对的日期，和点亮日期分开存 */
    next: null, /* 推荐的下一颗星（知识点 id），renderAll 时算 */
    search: "", /* 列表页搜索框里的字 */
    statusOf(type, id) {
      const lit = this.view === "shared" ? this.shared.lit : this.preview;
      return lit[type + ":" + id] ? "done" : "todo";
    },
    dateOf(type, id) {
      if (this.view !== "mine") return null;
      if (type === "projects") {
        const v = this.preview["projects:" + id];
        return typeof v === "string" ? v : null;
      }
      return this.passed[id] || null;
    }
  };

  /* 按网址 # 决定看哪张星图；解不开的分享链接退回我的星图并提示一次 */
  function applyView() {
    const v = Share.parseHash(location.hash);
    state.shared = null;
    state.notice = "";
    if (v.type === "shared") {
      state.view = "shared";
      const lit = {};
      v.kids.forEach(kid => { if (state.data.kById[kid]) lit["knowledge:" + kid] = true; });
      v.pids.forEach(pid => { if (state.data.projects.some(p => p.id === pid)) lit["projects:" + pid] = true; });
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

  /* 「存为我的星图」：把正在看的分享星图合并进自己的（只加不减）。
   * 主要用途是换设备：在旧设备上分享、新设备上打开链接再存进来，不需要账号 */
  function importShared() {
    const lit = state.shared.lit;
    let nk = 0, np = 0;
    Object.keys(lit).forEach(key => {
      if (state.preview[key]) return;
      state.preview[key] = true; /* 行星的完成日期带不过来，只记「已达成」 */
      if (key.startsWith("projects:")) np++; else nk++;
    });
    savePreview();
    history.pushState(null, "", location.pathname + location.search);
    applyView();
    checkAchievements(true); /* 带过来的进度不逐个弹成就 */
    state.notice = nk + np
      ? "已把 " + nk + " 颗星" + (np ? "、" + np + " 个项目" : "") + "存进你的星图"
      : "这些星你都已经点亮了，星图没有变化";
    renderAll();
    window.scrollTo(0, 0);
  }

  function savePreview() { saveJSON(PREVIEW_KEY, state.preview); }
  function savePassed() { saveJSON(PASSED_KEY, state.passed); }

  function fetchJSON(u) {
    return fetch(u).then(r => {
      if (!r.ok) throw new Error(u + " → HTTP " + r.status);
      return r.json();
    });
  }

  /* 题库占全站下载量的八成，不让它挡住首屏：和另外三个文件同时开始下，但星图不等它。
   * 失败时清掉记录，下次打开知识点会重试 */
  let quizLoad = null;
  function loadQuiz(started) {
    if (!quizLoad) {
      quizLoad = (started || fetchJSON(P.dataDir + "quiz.json")).then(
        q => { state.data.quiz = q; },
        err => { quizLoad = null; throw err; });
    }
    return quizLoad;
  }

  async function loadData() {
    const quizStarted = fetchJSON(P.dataDir + "quiz.json");
    quizStarted.catch(() => {}); /* 首屏不管题库成败，打开知识点时再说 */
    const [courses, knowledge, projects] = await Promise.all(
      ["courses.json", "knowledge.json", "projects.json"].map(f => fetchJSON(P.dataDir + f))
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
      quiz: null, /* 题库到了才填，见 loadQuiz */
      kById: Object.fromEntries(knowledge.knowledge.map(k => [k.id, k]))
    };
    loadQuiz(quizStarted).catch(() => {});
    /* 梯队色的唯一数据源是 courses.json，同步到 CSS 变量，页面 chrome 与星图保持一致 */
    Object.keys(state.data.tiers).forEach(t => {
      document.documentElement.style.setProperty("--t" + t, state.data.tiers[t].colorHex);
    });
  }

  /* ---------- 课程/项目完成的推导 ---------- */
  function courseStatus(course) {
    /* 课程状态完全由知识点推导 */
    const ks = state.data.knowledgeByCourse[course.id] || [];
    if (ks.length && ks.every(k => state.statusOf("knowledge", k.id) === "done")) return "done";
    if (ks.some(k => state.statusOf("knowledge", k.id) !== "todo")) return "doing";
    return "todo";
  }

  /* ---------- 顶部统计 ---------- */
  function renderStats() {
    const s = countStats();
    document.getElementById("stat-stars").textContent = s.stars + " / " + s.totalStars + " 颗星已点亮";
    document.getElementById("stat-courses").textContent = s.courses + " / " + s.totalCourses + " 门课完成";
    document.getElementById("stat-projects").textContent = s.projects + " / " + s.totalProjects + " 个项目达成";
  }

  function countStats() {
    return {
      stars: state.data.knowledge.filter(k => state.statusOf("knowledge", k.id) === "done").length,
      totalStars: state.data.knowledge.length,
      courses: state.data.courses.filter(c => courseStatus(c) === "done").length,
      totalCourses: state.data.courses.length,
      projects: state.data.projects.filter(p => state.statusOf("projects", p.id) === "done").length,
      totalProjects: state.data.projects.length
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
    const s = countStats();
    const n = s.stars;

    if (state.view === "shared") {
      text.textContent = "你在看「" + (state.shared.name || "一位学习者") + "」分享的星图 · 已点亮 " + n + " 颗";
      actions.appendChild(barButton("开始点亮我自己的", "primary", () => goView("")));
      /* 合并进自己的星图，要点两次防手滑 */
      const save = barButton("存为我的星图", "quiet", () => {
        if (save.dataset.armed) { importShared(); return; }
        save.dataset.armed = "1";
        save.textContent = "确认合并进我的星图？";
        setTimeout(() => { delete save.dataset.armed; save.textContent = "存为我的星图"; }, 4000);
      });
      save.id = "import-shared";
      actions.appendChild(save);
    } else {
      text.textContent = state.notice ||
        (n ? "我的星图 · 已点亮 " + n + " 颗，记录保存在这个浏览器里"
           : "点任意一颗星，答对测验就能点亮它 · 记录只保存在这个浏览器里");
      const any = n + s.projects > 0;
      if (any) actions.appendChild(barButton("分享我的星图", "primary", openShare));
      if (any) {
        /* 清空要点两次，防手滑；星星和行星一起清，passed 记录保留，重新点亮仍需答题 */
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

  function plainStarmap() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const noop = () => {};
    Starmap.render(svg, state.data, state,
      { onStarClick: noop, onStarTap: noop, onCourseTap: noop, onStarHover: noop, onHoverEnd: noop },
      { plain: true });
    return svg;
  }

  function openShare() {
    Share.open({
      provider: provider,
      kids: state.data.knowledge.filter(k => state.preview["knowledge:" + k.id]).map(k => k.id),
      pids: state.data.projects.filter(p => state.preview["projects:" + p.id]).map(p => p.id),
      stats: countStats(),
      siteTitle: P.title,
      eyebrow: P.eyebrow,
      /* 另画一张宽屏样式的全图：屏幕上那张在手机上是两列长图，或者正放大在某个星座 */
      svg: plainStarmap()
    });
  }

  /* ---------- 知识点详情弹窗 ---------- */
  function toggleStar(kid) {
    const key = "knowledge:" + kid;
    if (state.preview[key]) delete state.preview[key];
    else state.preview[key] = true;
    savePreview();
    renderAll();
  }

  function openKnowledge(k, quizFailed) {
    const course = state.data.courses.find(c => c.id === k.course);
    /* 题库还在路上：先开弹窗显示「加载中」，到了再原地刷新；没到之前不能按「无题」处理，否则能绕过测验。
     * 下载失败就停在提示上，下次打开知识点再重试 */
    const quizState = state.data.quiz ? "ready" : quizFailed ? "error" : "loading";
    if (quizState === "loading") {
      const reopen = failed => { if (Quiz.currentId() === k.id) openKnowledge(k, failed); };
      loadQuiz().then(() => reopen(false), () => reopen(true));
    }
    Quiz.open({
      k: k,
      course: course,
      color: tierColor(course.tier),
      quizState: quizState,
      quiz: state.data.quiz ? state.data.quiz[k.id] || null : null,
      state: state,
      learnUrl: course.url,
      notesUrl: course.notes && REPO ? REPO + "/tree/main/" + course.notes.split("/").map(encodeURIComponent).join("/") : null,
      reportUrl: reportUrl,
      onAnswer: recordAnswer,
      wrongCount: () => (state.wrong[k.id] || []).length,
      onReview: () => startReview(k.id),
      nextStar: () => state.next && state.data.kById[state.next],
      onNext: next => openKnowledge(next),
      /* 别人的星图只读：测验要回自己的星图做 */
      readOnly: state.view !== "mine",
      onGoMine: () => { goView(""); openKnowledge(k); },
      passedDate: () => state.passed[k.id] || null,
      onToggleStar: () => toggleStar(k.id),
      onRefresh: () => markReviewed([k.id]),
      onPass: () => {
        state.passed[k.id] = today();
        savePassed();
        if (!state.preview["knowledge:" + k.id]) toggleStar(k.id);
        else renderAll();
      }
    });
  }

  /* ---------- 题目纠错：预填好 GitHub Issue 表单（.github/ISSUE_TEMPLATE/quiz-error.yml 的字段 id） ---------- */
  function reportUrl(k, qIdx) {
    const course = state.data.courses.find(c => c.id === k.course);
    const q = state.data.quiz[k.id].questions[qIdx];
    const params = new URLSearchParams({
      template: "quiz-error.yml",
      title: "[题目纠错] " + k.name + " 第 " + (qIdx + 1) + " 题",
      provider: provider === "openai" ? "OpenAI 版" : "Anthropic 版（默认）",
      location: course.en + " / " + k.name + "（" + k.id + " 第 " + (qIdx + 1) + " 题）",
      question: q.q
    });
    return REPO + "/issues/new?" + params.toString();
  }

  /* ---------- 错题本：答错记进去，之后任何一次答对就移出来 ---------- */
  function recordAnswer(kid, qIdx, right) {
    const list = (state.wrong[kid] || []).filter(i => i !== qIdx);
    if (!right) list.push(qIdx);
    if (list.length) state.wrong[kid] = list.sort((a, b) => a - b);
    else delete state.wrong[kid];
    saveJSON(WRONG_KEY, state.wrong);
    renderStudyBar();
  }

  /* 错题本里的题按知识点顺序排好；题库改过、题号已不存在的顺手清掉 */
  function wrongItems(onlyKid) {
    const items = [];
    state.data.knowledge.forEach(k => {
      if (onlyKid && k.id !== onlyKid) return;
      const qs = (state.data.quiz && state.data.quiz[k.id] || {}).questions || [];
      (state.wrong[k.id] || []).forEach(i => { if (qs[i]) items.push({ k: k, q: qs[i], qIdx: i }); });
    });
    return items;
  }
  function wrongTotal() {
    return Object.keys(state.wrong).reduce((n, kid) => n + (state.data.kById[kid] ? state.wrong[kid].length : 0), 0);
  }

  const REVIEW_BATCH = 10; /* 一轮最多 10 题，错题多时不至于一口气做不完 */
  function startReview(onlyKid) {
    loadQuiz().then(() => {
      const items = wrongItems(onlyKid).slice(0, REVIEW_BATCH);
      if (!items.length) { Quiz.close(); showToast("错题本是空的", null); return; }
      Quiz.review({
        review: "错题复习",
        items: items,
        reportUrl: reportUrl,
        onAnswer: recordAnswer,
        summarize: r => {
          const left = wrongTotal();
          return {
            note: (r.right ? "答对的 " + r.right + " 题已移出错题本。" : "") + (left ? "错题本里还有 " + left + " 题。" : "错题本已经清空 🎉"),
            more: left > 0
          };
        },
        onMore: () => startReview(onlyKid)
      });
    }, () => showToast("题目没有加载出来，请检查网络后再试", null));
  }

  /* ---------- 到期温习：点亮（或上次温习）满 30 天的星，每颗抽一道题再考一次 ---------- */
  const REVIEW_DAYS = 30;
  function lastStudied(kid) {
    const a = state.passed[kid] || "", b = state.reviewed[kid] || "";
    return a > b ? a : b; /* YYYY-MM-DD 按字符串比较就是按日期比较 */
  }
  /* 没有通过日期的星（从分享链接导入、或早年直接点亮的）不知道学了多久，不参与 */
  function dueStars() {
    if (state.view !== "mine") return [];
    const now = Date.parse(today());
    return state.data.knowledge
      .filter(k => state.preview["knowledge:" + k.id] && lastStudied(k.id) &&
        (now - Date.parse(lastStudied(k.id))) / 864e5 >= REVIEW_DAYS)
      .sort((a, b) => lastStudied(a.id) < lastStudied(b.id) ? -1 : 1);
  }
  function markReviewed(kids) {
    kids.forEach(kid => { state.reviewed[kid] = today(); });
    saveJSON(REVIEWED_KEY, state.reviewed);
    renderStudyBar();
  }

  function startDueReview() {
    loadQuiz().then(() => {
      const items = [];
      dueStars().forEach(k => {
        const qs = (state.data.quiz[k.id] || {}).questions || [];
        if (!qs.length || items.length >= REVIEW_BATCH) return;
        const i = Math.floor(Math.random() * qs.length);
        items.push({ k: k, q: qs[i], qIdx: i });
      });
      if (!items.length) { Quiz.close(); showToast("现在没有到期要温习的星", null); return; }
      Quiz.review({
        review: "温习",
        items: items,
        reportUrl: reportUrl,
        onAnswer: recordAnswer,
        summarize: r => {
          /* 答对的星重新计时；答错的题照常进错题本，那颗星留在温习清单里 */
          markReviewed(r.items.filter((it, i) => r.wrong.indexOf(i) < 0).map(it => it.k.id));
          const left = dueStars().length;
          return {
            note: (r.right ? "答对的 " + r.right + " 颗星，" + REVIEW_DAYS + " 天后再来温习。" : "") +
              (r.wrong.length ? "答错的 " + r.wrong.length + " 题已收进错题本。" : "") +
              (left ? "还有 " + left + " 颗星等着温习。" : ""),
            more: left > 0
          };
        },
        onMore: startDueReview
      });
    }, () => showToast("题目没有加载出来，请检查网络后再试", null));
  }

  /* ---------- 下一颗星：先把学了一半的课学完，否则按课程顺序挑一门先修已完成的新课 ---------- */
  function computeNext() {
    if (state.view !== "mine") return null;
    const lit = k => !!state.preview["knowledge:" + k.id];
    const ks = c => state.data.knowledgeByCourse[c.id] || [];
    const courses = state.data.courses.filter(c => ks(c).length);
    const half = courses.find(c => ks(c).some(lit) && !ks(c).every(lit));
    if (half) return ks(half).find(k => !lit(k)).id;
    const fresh = courses.filter(c => !ks(c).some(lit));
    const ready = fresh.find(c => (c.prereq || []).every(pid => {
      const pc = state.data.courses.find(x => x.id === pid);
      return !pc || ks(pc).every(lit);
    }));
    const c = ready || fresh[0];
    return c ? ks(c)[0].id : null;
  }

  /* 学习助手条：下一颗星 + 到期温习 + 错题本，只在我的星图出现 */
  /* 苹果的 Safari（iPhone / iPad 上所有浏览器都是它的内核）会清掉 7 天没打开过的网站存的数据，进度全在浏览器里，跟着一起丢 */
  const BACKUP_HINT_KEY = "cc-map-backup-hint";
  function isAppleWebKit() {
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua));
  }

  function renderStudyBar() {
    const bar = document.getElementById("study-bar");
    bar.textContent = "";
    const k = state.next && state.data.kById[state.next];
    const nWrong = state.view === "mine" ? wrongTotal() : 0;
    const nDue = dueStars().length;
    const backupHint = state.view === "mine" && countStats().stars > 0 && isAppleWebKit() && !storeGet(BACKUP_HINT_KEY);
    bar.hidden = state.view !== "mine" || (!k && !nWrong && !nDue && !backupHint);
    if (bar.hidden) return;
    if (k) {
      const course = state.data.courses.find(c => c.id === k.course);
      const fresh = !countStats().stars;
      bar.appendChild(barButton((fresh ? "✦ 从这里开始：" : "✦ 下一颗星：") + course.cn + " · " + k.name, "next-btn", () => openKnowledge(k)));
    }
    if (nDue) bar.appendChild(barButton("温习 · " + nDue + " 颗星到期", "due-btn", startDueReview));
    if (nWrong) bar.appendChild(barButton("错题本 · " + nWrong + " 题", "wrong-btn", () => startReview(null)));
    if (backupHint) {
      const hint = document.createElement("div");
      hint.className = "backup-hint";
      const text = document.createElement("span");
      text.textContent = "苹果设备上的 Safari 可能清掉 7 天没打开的网站数据，进度会跟着丢。建议存一份分享链接当备份。";
      hint.appendChild(text);
      hint.appendChild(barButton("存一份分享链接", "backup-btn", openShare));
      hint.appendChild(barButton("知道了", "", () => { storeSet(BACKUP_HINT_KEY, today()); renderStudyBar(); }));
      bar.appendChild(hint);
    }
  }

  /* ---------- 成就：只增不减，拿到时弹一条提示 ---------- */
  function achievementDefs() {
    const d = state.data;
    const lit = k => !!state.preview["knowledge:" + k.id];
    const courseDone = c => { const ks = d.knowledgeByCourse[c.id] || []; return ks.length > 0 && ks.every(lit); };
    const stars = d.knowledge.filter(lit).length;
    const defs = [{ id: "first-star", name: "第一颗星", desc: "点亮第一颗星", ok: stars >= 1 }];
    [10, 50, 100].forEach(n => {
      if (d.knowledge.length > n) defs.push({ id: "stars-" + n, name: n + " 颗星", desc: "点亮 " + n + " 颗星", ok: stars >= n });
    });
    defs.push({ id: "first-course", name: "第一个星座", desc: "把一门课的星星全部点亮", ok: d.courses.some(courseDone) });
    Object.keys(d.tiers).forEach(t => {
      const cs = d.courses.filter(c => String(c.tier) === t);
      if (!cs.length) return;
      const rg = (d.layout.regions || []).find(r => String(r.tier) === t);
      const area = rg ? rg.label.split(" · ")[0] : "第 " + t + " 梯队";
      defs.push({ id: "tier-" + t, name: "点满" + area, desc: area + "的 " + cs.length + " 门课全部完成", ok: cs.every(courseDone) });
    });
    defs.push({ id: "first-project", name: "第一颗行星", desc: "完成第一个实战项目", ok: d.projects.some(p => state.preview["projects:" + p.id]) });
    defs.push({ id: "all-stars", name: "满天星", desc: "全部 " + d.knowledge.length + " 颗星都点亮", ok: stars === d.knowledge.length });
    return defs;
  }

  /* silent：页面刚打开、或者从分享链接带进来的进度，只记下来不弹提示 */
  function checkAchievements(silent) {
    const fresh = achievementDefs().filter(a => a.ok && !state.achieved[a.id]);
    if (!fresh.length) return;
    fresh.forEach(a => { state.achieved[a.id] = today(); });
    saveJSON(ACHIEVED_KEY, state.achieved);
    if (!silent) showToast("🏆 成就解锁：" + fresh.map(a => a.name).join("、"), "分享我的星图");
  }

  const toast = document.getElementById("toast");
  let toastTimer = null;
  function showToast(text, actionLabel) {
    toast.textContent = "";
    const msg = document.createElement("span");
    msg.textContent = text;
    toast.appendChild(msg);
    if (actionLabel) {
      toast.appendChild(barButton(actionLabel, "primary", () => {
        toast.hidden = true;
        Quiz.close();
        openShare();
      }));
    }
    toast.appendChild(barButton("×", "quiet", () => { toast.hidden = true; }));
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 7000);
  }

  /* ---------- 星图 ---------- */
  const tooltip = document.getElementById("tooltip");
  const starmapSvg = document.getElementById("starmap");

  /* 触屏：换一个视野（放大到某星座 / 回全图），从当前 viewBox 平滑过渡 */
  function zoomTo(cid) {
    const from = starmapSvg.getAttribute("viewBox").split(" ").map(Number);
    const prev = state.zoom;
    state.zoom = cid;
    state.selected = null;
    renderStarmap(from);
    if (cid) {
      /* 星图很高，点的星座可能在屏幕下半截；放大后的画面占满整个星图元素，所以把元素顶到视野里 */
      if (typeof starmapSvg.scrollIntoView === "function") starmapSvg.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (prev && Starmap.isCompact()) {
      /* 窄屏回全图时星图一下变回好几屏高，把视野滚回刚才那个星座，免得用户找不着 */
      const c = starmapSvg._centers[prev];
      const r = starmapSvg.getBoundingClientRect();
      if (c && r.height) {
        window.scrollTo({ top: window.scrollY + r.top + c[1] / starmapSvg._fullH * r.height - window.innerHeight / 2 });
      }
    }
  }

  function renderZoomBar() {
    const bar = document.getElementById("zoom-bar");
    const on = Starmap.isTouchMode() && !!state.zoom;
    bar.hidden = !on;
    document.getElementById("map-hint").textContent = Starmap.isTouchMode()
      ? "点一个星座放大，再点星星查看知识点"
      : "点击星星查看知识点，答对测验即可点亮";
    if (!on) return;
    /* 放大栏吸在视图条下面；两条的高度都会随文字折行变，所以按实际高度算 */
    const top = document.getElementById("view-bar").offsetHeight;
    bar.style.top = top + "px";
    starmapSvg.style.scrollMarginTop = (top + bar.offsetHeight + 8) + "px";

    const text = document.getElementById("zoom-text");
    const open = document.getElementById("zoom-open");
    const k = state.selected && state.data.kById[state.selected];
    if (k) {
      const st = state.statusOf("knowledge", k.id);
      text.textContent = "✦ " + k.name + " · " + STATUS_TEXT[st];
      open.hidden = false;
    } else {
      const course = state.data.courses.find(c => c.id === state.zoom);
      const ks = state.data.knowledgeByCourse[course.id] || [];
      const lit = ks.filter(x => state.statusOf("knowledge", x.id) === "done").length;
      text.textContent = course.cn + " · " + lit + " / " + ks.length + " 颗已点亮 · 点星星或用 ‹ › 选";
      open.hidden = true;
    }
  }

  /* 大星座里有的星放大后也只隔几个像素，手指分不开；‹ › 按知识点顺序逐颗选，挨得再近也能选到 */
  function stepSelected(delta) {
    const ks = state.data.knowledgeByCourse[state.zoom] || [];
    if (!ks.length) return;
    const i = ks.findIndex(k => k.id === state.selected);
    const next = i < 0 ? (delta > 0 ? 0 : ks.length - 1) : (i + delta + ks.length) % ks.length;
    state.selected = ks[next].id;
    renderStarmap();
  }

  /* 手机转横屏、电脑把窗口拉窄：跨过 640px 就换一套排布重画 */
  function watchCompact() {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = () => { if (state.data) renderStarmap(); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  function setupZoomBar() {
    document.getElementById("zoom-back").addEventListener("click", () => zoomTo(null));
    document.getElementById("zoom-prev").addEventListener("click", () => stepSelected(-1));
    document.getElementById("zoom-next").addEventListener("click", () => stepSelected(1));
    document.getElementById("zoom-open").addEventListener("click", () => {
      const k = state.selected && state.data.kById[state.selected];
      if (k) openKnowledge(k);
    });
  }

  function renderStarmap(animateFrom) {
    Starmap.render(starmapSvg, state.data, state, {
      onStarClick(k) { openKnowledge(k); },
      /* 触屏放大后：第一次点只选中（名字出现在放大栏），再点同一颗才打开 */
      onStarTap(k) {
        if (state.selected === k.id) { openKnowledge(k); return; }
        state.selected = k.id;
        renderStarmap();
      },
      onCourseTap(c) { zoomTo(c.id); },
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
    }, { animateFrom: animateFrom });
    renderZoomBar();
  }

  /* ---------- 项目视图 ---------- */
  /* 项目做没做完网页查不了，由访客自己标记；值存当天日期，方便卡片上显示「已达成 · 日期」 */
  function toggleProject(pid) {
    const key = "projects:" + pid;
    if (state.preview[key]) delete state.preview[key];
    else state.preview[key] = new Date().toISOString().slice(0, 10);
    savePreview();
    renderAll();
  }

  /* 梯队色优先取 projects.json 的 tier；没有这字段时按位置三等分（n=5 时等价于旧的 [1,1,2,2,3]） */
  function projectColor(p, i) {
    const n = state.data.projects.length;
    return tierColor(p.tier || Math.min(3, Math.floor((i * 3) / n) + 1));
  }

  function renderProjects() {
    const track = document.getElementById("projects-track");
    track.textContent = "";
    /* 行星按顺序由小变大，尺寸随项目数摊开——别写死数组，加项目时后面几颗会全塌成同一个大小 */
    const n = state.data.projects.length;
    state.data.projects.forEach((p, i) => {
      const st = state.statusOf("projects", p.id);
      const size = n < 2 ? 96 : Math.round(48 + (i * 48) / (n - 1));
      const color = projectColor(p, i);

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
           todo: "○ 待启程" })[st] + "</p>";
      if (state.view === "mine") {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "kd-btn project-toggle" + (st === "done" ? "" : " primary");
        btn.textContent = st === "done" ? "撤销完成" : "我完成了";
        btn.addEventListener("click", () => toggleProject(p.id));
        body.appendChild(btn);
      }

      card.appendChild(planetWrap);
      card.appendChild(body);
      track.appendChild(card);
    });
  }

  /* ---------- 列表视图 ---------- */
  function renderList() {
    const root = document.getElementById("list-root");
    root.textContent = "";
    /* 搜索：课程名命中就列出整门课，否则只列名字或概要里含关键词的知识点，命中的课自动展开 */
    const query = state.search.trim().toLowerCase();
    const hit = t => (t || "").toLowerCase().indexOf(query) >= 0;
    const summaryOf = k => (state.data.quiz && state.data.quiz[k.id] || {}).summary;
    let found = 0;

    /* 课程 + 知识点 */
    const secCourse = document.createElement("section");
    secCourse.className = "list-section";
    secCourse.innerHTML = "<h2>课程 · 星座</h2>";
    state.data.courses.forEach(c => {
      const ks = state.data.knowledgeByCourse[c.id] || [];
      const shown = !query || hit(c.cn) || hit(c.en) ? ks : ks.filter(k => hit(k.name) || hit(summaryOf(k)));
      if (query && !shown.length) return;
      found += query ? shown.length : 0;
      const litN = ks.filter(k => state.statusOf("knowledge", k.id) === "done").length;
      const cst = courseStatus(c);
      const color = tierColor(c.tier);

      const details = document.createElement("details");
      details.className = "course-k";
      details.open = !!query;
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
      shown.forEach(k => {
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
    if (query) secCourse.querySelector("h2").textContent = "课程 · 星座 · 找到 " + found + " 个知识点";
    if (!query || found) root.appendChild(secCourse);

    /* 项目 */
    const secProj = document.createElement("section");
    secProj.className = "list-section";
    secProj.innerHTML = "<h2>实战项目 · 行星</h2>";
    let foundP = 0;
    state.data.projects.forEach((p, i) => {
      if (query && !hit(p.name)) return;
      foundP++;
      const st = state.statusOf("projects", p.id);
      const row = document.createElement("div");
      row.className = "list-row";
      row.innerHTML =
        '<span class="status-dot ' + st + '" style="color:' + projectColor(p, i) + '"></span>' +
        '<span class="name">' + p.name + '<span class="en">' + p.level + " · " + p.weeks + "</span></span>" +
        '<span class="meta">' + STATUS_TEXT[st] + (st === "done" && state.dateOf("projects", p.id) ? " · " + state.dateOf("projects", p.id) : "") + "</span>";
      secProj.appendChild(row);
    });
    if (foundP) root.appendChild(secProj);

    if (query) {
      if (!found && !foundP) {
        const empty = document.createElement("p");
        empty.className = "list-empty";
        empty.textContent = "没有找到和「" + state.search.trim() + "」相关的知识点、课程或项目";
        root.appendChild(empty);
      }
      return;
    }

    /* 成就只属于自己的星图 */
    if (state.view !== "mine") return;
    const defs = achievementDefs();
    const secAch = document.createElement("section");
    secAch.className = "list-section";
    secAch.innerHTML = "<h2>成就 · " + defs.filter(a => state.achieved[a.id]).length + " / " + defs.length + "</h2>";
    defs.forEach(a => {
      const got = state.achieved[a.id];
      const row = document.createElement("div");
      row.className = "list-row achievement" + (got ? " got" : "");
      row.innerHTML =
        '<span class="ach-icon">' + (got ? "🏆" : "·") + "</span>" +
        '<span class="name">' + a.name + '<span class="en">' + a.desc + "</span></span>" +
        '<span class="meta">' + (got ? got : "未解锁") + "</span>";
      secAch.appendChild(row);
    });
    root.appendChild(secAch);
  }

  /* ---------- 视图切换 ---------- */
  function setupSearch() {
    document.getElementById("list-search").addEventListener("input", e => { state.search = e.target.value; renderList(); });
  }

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
    if (state.view === "mine") checkAchievements(false);
    state.next = computeNext();
    renderStats();
    renderViewBar();
    renderStudyBar();
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
      storeSet("cc-map-provider", P.switchTo);
      location.search = "?v=" + P.switchTo; /* 整页刷新，状态最干净 */
    });
  }

  renderChrome();
  loadData()
    .then(() => { applyView(); checkAchievements(true); setupTabs(); setupSearch(); setupZoomBar(); watchCompact(); renderAll(); Heatmap.init(); })
    .catch(err => {
      document.querySelector("main").innerHTML =
        '<p style="text-align:center;color:#9aa5bd;padding:40px">数据加载失败：' + err.message +
        "<br>（本页需要通过 HTTP 服务访问，直接双击打开 HTML 文件会读不到数据）</p>";
    });
})();
