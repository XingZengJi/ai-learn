/* 成就地图端到端冒烟测试（无需浏览器，用 jsdom 模拟）。
 * 改了 docs/ 下的 JS/HTML 之后跑；只补 quiz.json 数据的话跑 check-data.py 即可。
 * 用法：cd tools && npm install && node e2e.js
 * 覆盖：Anthropic 全流程（渲染→点星→测验答错重试→全对点亮→有题必考无绕过→行星自助点亮→分享弹窗→Esc/清空）
 *      + 两种星图（我的 / 别人分享的 #s=）、旧 #author 链接回退与分享链接编码
 *      + OpenAI 实例（主题标记、星数、概要展示、完整答题、localStorage 键隔离、切换按钮）。
 */
const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs");
const path = require("path");

const DOCS = path.resolve(__dirname, "..", "docs");
const html = fs.readFileSync(path.join(DOCS, "index.html"), "utf8")
  .replace(/<script src="[^"]*"><\/script>/g, ""); // 脚本手动注入，便于控制时序

let failures = 0;
function check(name, cond) {
  console.log((cond ? "  ✓ " : "  ✗ ") + name);
  if (!cond) failures++;
}

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(DOCS, rel), "utf8"));
}

/* 创建一个加载完成的页面实例；provider 为 null 时不预置 localStorage；hash 形如 "#s=1.1"；
 * opts.blockStorage 模拟浏览器禁用网站数据：一碰 localStorage 就抛 SecurityError
 * opts.quiz 控制题库那一个文件："hold"（一直不到，返回的 window 上挂 __releaseQuiz() 放行）或 "fail"（下载失败）
 * opts.touch 模拟触屏："phone"（窄屏 + 触屏）或 "tablet"（宽屏 + 触屏）。jsdom 不做布局，
 *   星图元素统一按 1200×1780 的屏幕尺寸摆放，点击换算见 tapAt。返回的 window 上挂 __media 可改屏幕宽度并触发 change */
async function makePage(provider, hash, opts = {}) {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => {}); /* jsdom 不支持导航跳转，静默这类噪音 */
  const dom = new JSDOM(html, {
    url: "http://localhost/" + (hash || ""), runScripts: "dangerously",
    pretendToBeVisual: true, virtualConsole
  });
  const { window } = dom;
  if (provider) window.localStorage.setItem("cc-map-provider", provider);
  if (opts.touch) {
    const media = { narrow: opts.touch === "phone", listeners: [] };
    media.fire = () => media.listeners.forEach(f => f());
    window.__media = media;
    window.matchMedia = q => ({
      get matches() { return /pointer: coarse/.test(q) || (/max-width: 640px/.test(q) && media.narrow); },
      addEventListener(type, f) { media.listeners.push(f); }, addListener(f) { media.listeners.push(f); }, removeListener() {}
    });
  }
  if (opts.blockStorage) {
    Object.defineProperty(window, "localStorage", {
      get() { throw new window.DOMException("blocked in test", "SecurityError"); }
    });
  }

  // fetch shim：本地数据从文件系统读取；外部 API（热力图）直接失败走 fallback
  window.fetch = (u) => {
    if (/^https?:\/\//.test(u) && !u.startsWith("http://localhost/")) {
      return Promise.reject(new Error("external blocked in test"));
    }
    const p = path.join(DOCS, u.replace("http://localhost/", ""));
    const res = { ok: true, json: () => Promise.resolve(JSON.parse(fs.readFileSync(p, "utf8"))) };
    if (/quiz\.json$/.test(u) && opts.quiz === "fail") return Promise.resolve({ ok: false, status: 503 });
    if (/quiz\.json$/.test(u) && opts.quiz === "hold") return new Promise(r => { window.__releaseQuiz = () => r(res); });
    return Promise.resolve(res);
  };

  if (opts.touch) {
    window.document.getElementById("starmap").getBoundingClientRect = () => ({ left: 0, top: 0, width: 1200, height: 1780 });
  }
  for (const f of ["js/starmap.js", "js/quiz.js", "js/heatmap.js", "js/share.js", "js/app.js"]) {
    window.eval(fs.readFileSync(path.join(DOCS, f), "utf8"));
  }
  await new Promise(r => setTimeout(r, 300)); // 等 loadData + renderAll
  return window;
}

(async () => {
  /* ==================== Anthropic 实例（默认）==================== */
  const win = await makePage(null);
  const document = win.document;
  const quiz = readJSON("data/anthropic/quiz.json");
  const knowledge = readJSON("data/anthropic/knowledge.json").knowledge;

  console.log("— Anthropic · 初始渲染 —");
  check("默认厂商为 anthropic", document.body.dataset.provider === "anthropic");
  const stars = document.querySelectorAll("#starmap .star");
  check("星图星数 = knowledge.json 条数（" + stars.length + "）", stars.length === knowledge.length);
  /* 课程数从 courses.json 推导，别写死——加课时不该让测试失效 */
  const nCourses = readJSON("data/anthropic/courses.json").courses.length;
  check("列表渲染出 " + nCourses + " 门课程分组",
    document.querySelectorAll("#list-root details.course-k").length === nCourses);
  check("统计行课程数动态化", document.getElementById("stat-courses").textContent.includes("/ " + nCourses + " 门课"));
  /* 项目数也从数据推导。行星尺寸曾是写死的 5 元素数组，加到第 6 个起会全塌成同一大小——这里盯住它 */
  const projects = readJSON("data/anthropic/projects.json").projects;
  const cards = document.querySelectorAll("#projects-track .project-card");
  check("项目视图渲染出 " + projects.length + " 颗行星", cards.length === projects.length);
  const radii = Array.from(cards).map(c => +c.querySelector("circle").getAttribute("r"));
  check("行星半径逐颗递增，没有塌成同一尺寸（" + radii.join("/") + "）",
    radii.every((r, i) => i === 0 || r > radii[i - 1]));
  const t1Hex = readJSON("data/anthropic/courses.json").tiers["1"].colorHex;
  check("初始所有行星都未达成（没有作者进度混进来）",
    Array.from(cards).every(c => c.querySelector("circle").getAttribute("fill") === "#1c2540"));
  check("统计行显示 0 个项目达成", document.getElementById("stat-projects").textContent === "0 / " + projects.length + " 个项目达成");
  check("每个项目的 covers 都指向存在的知识点",
    projects.every(p => p.covers.every(kid => knowledge.some(k => k.id === kid))));
  check("切换按钮文案为「⇄ OpenAI 课程」", document.getElementById("switch-provider").textContent === "⇄ OpenAI 课程");
  check("大标题为「CC 学习成就地图」", document.getElementById("site-title").textContent === "CC 学习成就地图");

  console.log("— Anthropic · 详情弹窗（有题库知识点 k0101）—");
  const modal = document.getElementById("k-modal");
  [...document.querySelectorAll("#list-root .k-item")]
    .find(b => b.textContent.includes("认识 Claude 与首次对话")).click();
  check("弹窗打开", !modal.hidden);
  check("显示概要", modal.textContent.includes(quiz.k0101.summary.slice(0, 12)));
  const nQ = quiz.k0101.questions.length;
  const startBtn = [...modal.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("开始测验"));
  check("有「开始测验（" + nQ + " 题）」按钮", !!startBtn && startBtn.textContent.includes(nQ + " 题"));
  check("无「直接点亮」按钮", ![...modal.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("直接点亮")));

  console.log("— Anthropic · 测验：先答错一题再全对 —");
  startBtn.click();
  const answerCurrent = (correct) => {
    const q = quiz.k0101.questions[parseInt(modal.querySelector(".kq-progress").textContent) - 1];
    const rightText = q.options[q.answer];
    const opts = [...modal.querySelectorAll(".kq-opt")];
    (correct ? opts.find(o => o.textContent.includes(rightText))
             : opts.find(o => !o.textContent.includes(rightText))).click();
  };
  const next = () => [...modal.querySelectorAll(".kd-btn")].find(b => /下一题|查看结果/.test(b.textContent)).click();

  answerCurrent(false); // 第 1 题故意答错
  check("答错后正确项高亮", !!modal.querySelector(".kq-opt.correct"));
  check("答错项标红", !!modal.querySelector(".kq-opt.wrong"));
  check("显示解析", !!modal.querySelector(".kq-explain"));
  next();
  for (let i = 0; i < nQ - 1; i++) { answerCurrent(true); next(); }
  check("结算：答对 " + (nQ - 1) + " / " + nQ, modal.textContent.includes("答对 " + (nQ - 1) + " / " + nQ));
  check("未点亮（localStorage 无记录）", !win.localStorage.getItem("cc-map-quiz-passed"));

  [...modal.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("再来一次")).click();
  for (let i = 0; i < nQ; i++) { answerCurrent(true); next(); }
  check("结算：全对通过", modal.textContent.includes("全对，通过"));
  const passed = JSON.parse(win.localStorage.getItem("cc-map-quiz-passed") || "{}");
  check("通过记录已写入", !!passed.k0101);
  const preview = JSON.parse(win.localStorage.getItem("cc-map-preview") || "{}");
  check("点亮记录已写入（无后缀键）", preview["knowledge:k0101"] === true);
  check("视图条显示「已点亮 1 颗」", document.getElementById("view-bar-text").textContent.includes("已点亮 1 颗"));

  check("弹窗还开着时不撒花（否则纸屑被弹窗盖住）", !document.querySelector(".confetti-burst"));
  [...modal.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("完成")).click();
  check("点「完成」关闭弹窗", modal.hidden);

  console.log("— Anthropic · 撒花：只在点亮的那颗星周围 —");
  const burst = document.querySelector(".confetti-burst");
  check("关闭弹窗后出现撒花层", !!burst);
  check("纸屑数量克制（不铺满屏幕）", burst && burst.querySelectorAll(".confetti-bit").length === 26);
  check("有一圈点亮光环", !!(burst && burst.querySelector(".confetti-ring")));
  const litStar = document.querySelector('#starmap .star[data-k="k0101"]');
  check("星图上能按 data-k 定位到这颗星", !!litStar);
  const bit0 = burst && burst.querySelector(".confetti-bit");
  check("纸屑定点在星星坐标上（而非 vw 满屏散布）",
    !!bit0 && bit0.style.left.endsWith("px") && !!bit0.style.getPropertyValue("--dx"));

  console.log("— Anthropic · 重开详情：已通过态 —");
  [...document.querySelectorAll("#list-root .k-item")]
    .find(b => b.textContent.includes("认识 Claude 与首次对话")).click();
  check("显示「已通过测验」", modal.textContent.includes("已通过测验"));
  check("已点亮的星按钮变「温习测验」", [...modal.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("温习测验")));
  modal.querySelector(".k-modal-close").click();

  /* Anthropic 侧已无「题库为空」的知识点（175 个全部有题），所以这里改为反向断言：
     有题必考——任何知识点都不该出现「直接点亮」的绕过入口。
     OpenAI 侧同理（c01–c03 已补齐），空题库分支的说明见下面的 OpenAI 段落。 */
  console.log("— Anthropic · 有题必考：无直接点亮入口 —");
  const aQuiz = readJSON("data/anthropic/quiz.json");
  const emptyA = Object.keys(aQuiz).filter(k => !k.startsWith("_") && !aQuiz[k].questions.length);
  check("所有知识点都有题（无题库知识点：" + (emptyA.length || "无") + "）", emptyA.length === 0);
  [...document.querySelectorAll("#list-root .k-item")]
    .find(b => b.textContent.includes("Claude Code 是什么")).click();
  check("有「开始测验」按钮", [...modal.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("测验（")));
  check("无「直接点亮」绕过入口",
    ![...modal.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("直接点亮")));
  check("未答题则不写入预览", JSON.parse(win.localStorage.getItem("cc-map-preview"))["knowledge:k0201"] === undefined);
  modal.querySelector(".k-modal-close").click();

  console.log("— Anthropic · 行星自助点亮 —");
  const firstToggle = () => document.querySelector("#projects-track .project-card .project-toggle");
  check("每张项目卡都有「我完成了」按钮",
    [...document.querySelectorAll("#projects-track .project-card")].every(c => c.querySelector(".project-toggle").textContent === "我完成了"));
  firstToggle().click();
  const firstCard = document.querySelector("#projects-track .project-card");
  check("点了之后行星按 tier 上色（" + projects[0].id + " → tier1）",
    firstCard.querySelector("circle").getAttribute("fill") === t1Hex);
  check("卡片显示「已达成 · 日期」", /已达成 · \d{4}-\d{2}-\d{2}/.test(firstCard.querySelector(".project-status").textContent));
  check("记录写入 preview，值为完成日期",
    /^\d{4}-\d{2}-\d{2}$/.test(JSON.parse(win.localStorage.getItem("cc-map-preview"))["projects:" + projects[0].id]));
  check("统计行变成 1 个项目达成", document.getElementById("stat-projects").textContent.startsWith("1 / "));
  check("按钮变成「撤销完成」", firstToggle().textContent === "撤销完成");
  firstToggle().click();
  check("撤销后回到未达成", firstToggle().textContent === "我完成了" &&
    JSON.parse(win.localStorage.getItem("cc-map-preview"))["projects:" + projects[0].id] === undefined);
  firstToggle().click(); /* 重新点亮，留给下面的分享链接用 */

  console.log("— Anthropic · 分享弹窗 —");
  const shareBtn = [...document.querySelectorAll("#view-bar-actions button")].find(b => b.textContent === "分享我的星图");
  check("点亮后视图条出现「分享我的星图」", !!shareBtn);
  shareBtn.click();
  const shareModal = document.getElementById("share-modal");
  check("分享弹窗打开", !shareModal.hidden);
  const [nameInput, linkInput] = shareModal.querySelectorAll(".sh-input");
  check("链接带厂商并编码了 k0101 与 p1（" + linkInput.value + "）", linkInput.value.endsWith("?v=anthropic#s=1.1-2&p=2"));
  nameInput.value = "小明";
  nameInput.dispatchEvent(new win.Event("input"));
  check("填昵称后链接带上 &n=", linkInput.value.endsWith("&n=" + encodeURIComponent("小明")));
  check("昵称被记住", win.localStorage.getItem("cc-map-nickname") === "小明");
  check("有「生成图片」按钮", [...shareModal.querySelectorAll(".kd-btn")].some(b => b.textContent === "生成图片"));
  shareModal.querySelector(".k-modal-close").click();
  check("分享弹窗可关闭", shareModal.hidden);

  console.log("— Anthropic · Esc 关闭 & 清空我的星图 —");
  document.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape" }));
  check("Esc 关闭弹窗", modal.hidden);
  document.getElementById("clear-mine").click();
  check("清空要点两次：第一次只变成确认态", win.localStorage.getItem("cc-map-preview") !== "{}" &&
    document.getElementById("clear-mine").textContent === "确认清空？");
  document.getElementById("clear-mine").click();
  check("确认后点亮记录为空（星星和行星一起清）", win.localStorage.getItem("cc-map-preview") === "{}");
  check("quiz-passed 记录保留", JSON.parse(win.localStorage.getItem("cc-map-quiz-passed")).k0101 != null);

  /* ==================== 两种星图互不混合 ==================== */
  console.log("— 分享链接编码 —");
  const allIds = knowledge.map(k => k.id);
  const round = win.Share.decode(win.Share.encode(allIds));
  check("全部 " + allIds.length + " 个知识点编码后能原样解回",
    !!round && round.slice().sort().join() === allIds.slice().sort().join());
  check("编码与 share.js 注释里的例子一致",
    win.Share.encode(["k0101", "k0102", "k0202", "k0203", "k0205"]) === "1.1-6.2-18");
  const fullLen = win.Share.encode(allIds).length;
  check("全部点亮的链接也够短（" + fullLen + " 字符 ≤ 200）", fullLen <= 200);
  check("格式不对的编码返回 null", win.Share.decode("2.zz") === null && win.Share.decode("1.!!") === null);
  const allPids = projects.map(p => p.id);
  check("全部 " + allPids.length + " 个项目编码后能原样解回",
    win.Share.decodeProjects(win.Share.encodeProjects(allPids)).sort().join() === allPids.slice().sort().join());
  check("项目编码按编号：p6 → 1s", win.Share.encodeProjects(["p6"]) === "1s");
  check("格式不对的项目编码直接忽略", win.Share.decodeProjects("!!").length === 0 && win.Share.decodeProjects(null).length === 0);

  console.log("— 旧的作者星图链接（#author，已下线）—");
  const winA = await makePage(null, "#author");
  const docA = winA.document;
  check("退回我的星图", docA.body.dataset.view === "mine");
  check("星星和行星都不亮", docA.querySelectorAll("#starmap .star.lit").length === 0 &&
    docA.getElementById("stat-projects").textContent.startsWith("0 / "));
  check("视图条没有「看作者的星图」入口",
    ![...docA.querySelectorAll("#view-bar-actions button")].some(b => b.textContent.includes("作者")));

  console.log("— 别人分享的星图（#s=）—");
  const sharedHash = "#s=" + win.Share.encode(["k0101", "k0102", "k9999"]) + "&p=" + win.Share.encodeProjects(["p6", "p99"]) +
    "&n=" + encodeURIComponent("小红");
  const winS = await makePage(null, sharedHash);
  const docS = winS.document;
  check("body 标记 data-view=shared", docS.body.dataset.view === "shared");
  check("视图条显示昵称和点亮数（不存在的 k9999 被忽略）",
    /「小红」.*已点亮 2 颗/.test(docS.getElementById("view-bar-text").textContent));
  check("星图上亮 2 颗", docS.querySelectorAll("#starmap .star.lit").length === 2);
  check("分享者的 p6 行星亮起（不存在的 p99 被忽略）", docS.getElementById("stat-projects").textContent.startsWith("1 / "));
  check("只读：项目卡上没有「我完成了」按钮", docS.querySelectorAll("#projects-track .project-toggle").length === 0);
  check("打开分享链接不写入访客自己的记录", winS.localStorage.getItem("cc-map-preview") === null);
  [...docS.querySelectorAll("#list-root .k-item")].find(b => b.textContent.includes("认识 Claude 与首次对话")).click();
  const modalS = docS.getElementById("k-modal");
  const goMine = [...modalS.querySelectorAll(".kd-btn")].find(b => b.textContent === "去我的星图测验");
  check("只读：有「去我的星图测验」", !!goMine);
  goMine.click();
  check("点了之后切回我的星图", docS.body.dataset.view === "mine" && winS.location.hash === "");
  check("并在我的星图里打开同一个知识点的测验入口",
    !modalS.hidden && [...modalS.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("开始测验")));
  check("我的星图是空的（没继承分享者的点亮）", docS.querySelectorAll("#starmap .star.lit").length === 0);

  console.log("— 题目里的尖括号原样显示（k1106 第 2 题）—");
  const winT = await makePage(null);
  const docT = winT.document;
  const kTag = knowledge.find(k => k.id === "k1106");
  [...docT.querySelectorAll("#list-root .k-item")].find(b => b.textContent.includes(kTag.name)).click();
  const modalT = docT.getElementById("k-modal");
  [...modalT.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("开始测验")).click();
  modalT.querySelector(".kq-opt").click();
  [...modalT.querySelectorAll(".kd-btn")].find(b => b.textContent === "下一题").click();
  check("选项里的 <sales_records> 没被吞掉",
    [...modalT.querySelectorAll(".kq-opt")].some(o => o.textContent.includes("把销售记录包进 <sales_records> 标签")));
  modalT.querySelector(".kq-opt").click();
  check("解析里的 <sales_records> 与 <data> 也在",
    /<sales_records> 好过 <data>/.test(modalT.querySelector(".kq-explain").textContent));

  console.log("— 浏览器禁用存储时页面照常可用 —");
  const winB = await makePage(null, "", { blockStorage: true });
  const docB = winB.document;
  check("星图照常渲染", docB.querySelectorAll("#starmap .star").length === knowledge.length);
  check("没有出现「数据加载失败」", !docB.querySelector("main").textContent.includes("数据加载失败"));
  docB.querySelector("#projects-track .project-toggle").click();
  check("点「我完成了」不报错，当前页面照样亮起", docB.getElementById("stat-projects").textContent.startsWith("1 / "));

  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* 题库占全站下载量的八成，首屏不等它。没到之前打开知识点只能显示「加载中」，
   * 绝不能当成「没题」给出「直接点亮」——那等于绕过测验 */
  console.log("— 题库还在下载时：星图先出来，弹窗等题 —");
  const winQ = await makePage(null, "", { quiz: "hold" });
  const docQ = winQ.document, modalQ = docQ.getElementById("k-modal");
  check("题库没到，星图已经渲染", docQ.querySelectorAll("#starmap .star").length === knowledge.length);
  const kItemQ = docQ.querySelector("#list-root .k-item");
  kItemQ.focus(); /* jsdom 的 click() 不会像真浏览器那样顺带聚焦按钮 */
  kItemQ.click();
  check("弹窗显示「正在加载题目」", !modalQ.hidden && modalQ.textContent.includes("正在加载题目"));
  check("加载中不给任何按钮（没有「直接点亮」）", modalQ.querySelectorAll(".kd-btn").length === 0);
  winQ.__releaseQuiz();
  await wait(20);
  check("题库到了，弹窗原地换成测验入口",
    [...modalQ.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("开始测验")));
  modalQ.querySelector(".k-modal-close").click();
  check("关掉弹窗，焦点回到刚才点的那一项", docQ.activeElement === kItemQ);

  console.log("— 题库下载失败：星图照常，弹窗提示重试 —");
  const winF = await makePage(null, "", { quiz: "fail" });
  const docF = winF.document, modalF = docF.getElementById("k-modal");
  check("星图照常渲染", docF.querySelectorAll("#starmap .star").length === knowledge.length);
  docF.querySelector("#list-root .k-item").click();
  await wait(20);
  check("弹窗提示题目没加载出来", modalF.textContent.includes("没有加载出来"));
  check("失败时同样不给「直接点亮」", modalF.querySelectorAll(".kd-btn").length === 0);

  const coursesA = readJSON("data/anthropic/courses.json").courses;
  /* 在星图坐标 (sx, sy) 处点一下：按当前 viewBox 换算成屏幕坐标再派发 click */
  const tapper = (win, svg) => (sx, sy) => {
    const [x, y, w, h] = svg.getAttribute("viewBox").split(" ").map(Number);
    svg.dispatchEvent(new win.MouseEvent("click", { bubbles: true, clientX: (sx - x) / w * 1200, clientY: (sy - y) / h * 1780 }));
  };
  const starXYin = svg => kid => {
    const c = svg.querySelector('.star[data-k="' + kid + '"] circle.core');
    return [+c.getAttribute("cx"), +c.getAttribute("cy")];
  };
  /* 文字宽度估算与 starmap.js 的 textEm 一致：汉字 1em，拉丁字母数字 0.55em */
  const textEm = str => [...str].reduce((w, ch) => w + (/[\u0000-ɏ]/.test(ch) ? 0.55 : 1), 0);

  console.log("— 手机竖屏：两列布局，课程名看得清、互不压盖 —");
  const winM = await makePage(null, "", { touch: "phone" });
  const docM = winM.document;
  const svgM = docM.getElementById("starmap");
  const fullBox = svgM.getAttribute("viewBox");
  const [, , fw, fh] = fullBox.split(" ").map(Number);
  check("用窄屏布局：viewBox 宽 400（" + fullBox + "）", svgM.classList.contains("compact") && fw === 400);
  check("每门课都画了课程名", svgM.querySelectorAll(".course-label").length === coursesA.length);
  check("不画先修虚线", !svgM.querySelector('line[stroke-dasharray="3 7"]'));
  /* 每门课标签的占位框：宽按 14 号字估算，高从首行顶到计数行底 */
  const boxes = [...svgM.querySelectorAll("g[data-course]")].map(g => {
    const label = g.querySelector(".course-label");
    const lines = [...label.querySelectorAll("tspan")].map(t => t.textContent);
    const cx = +label.getAttribute("x"), y = +label.getAttribute("y");
    const w = Math.max(...lines.map(textEm)) * 14;
    const stars = [...g.querySelectorAll(".star circle.core")].map(c => [+c.getAttribute("cx"), +c.getAttribute("cy")]);
    return { id: g.dataset.course, lines, x0: cx - w / 2, x1: cx + w / 2, y0: y - 14, y1: y + (lines.length - 1) * 17 + 18, stars };
  });
  check("最长的课程名折成多行", boxes.some(b => b.lines.length >= 2));
  check("课程名不超出画面左右边界", boxes.every(b => b.x0 >= 0 && b.x1 <= fw));
  const overlaps = [];
  boxes.forEach((a, i) => boxes.forEach((b, j) => {
    if (j <= i) return;
    if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) overlaps.push(a.id + "/" + b.id + " 标签");
    const near = a.stars.some(p => b.stars.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < 24));
    if (near) overlaps.push(a.id + "/" + b.id + " 星星");
  }));
  boxes.forEach(a => boxes.forEach(b => {
    if (a !== b && b.stars.some(([x, y]) => x > a.x0 - 4 && x < a.x1 + 4 && y > a.y0 - 4 && y < a.y1 + 4)) overlaps.push(a.id + " 标签压到 " + b.id);
  }));
  check("标签之间、星座之间、标签与别的星座都不压盖" + (overlaps.length ? "：" + overlaps.slice(0, 4).join("，") : ""), overlaps.length === 0);
  const regionYs = [...svgM.querySelectorAll(".region-label")].map(t => +t.getAttribute("y"));
  const tierOf = id => coursesA.find(c => c.id === id).tier;
  check("天区标题在本天区所有星星之上、在上一天区所有标签之下", regionYs.every((ry, i) => {
    const mine = boxes.filter(b => tierOf(b.id) === i + 1), prev = boxes.filter(b => tierOf(b.id) === i);
    return mine.every(b => b.stars.every(p => p[1] > ry + 12)) && prev.every(b => b.y1 < ry - 12);
  }));
  check("Anthropic 窄屏全图约 " + Math.round(fh * 0.9) + "px 高（预估 2500 左右）", fh > 2000 && fh < 3200);

  console.log("— 手机：点星座 → 放大 → 点星星 —");
  const tapAt = tapper(winM, svgM), starXY = starXYin(svgM);
  const zoomBar = docM.getElementById("zoom-bar");
  const modalM = docM.getElementById("k-modal");
  check("图例提示改成「点一个星座放大」", docM.getElementById("map-hint").textContent.includes("点一个星座放大"));
  check("全图时没有放大栏", zoomBar.hidden);

  const c02ks = knowledge.filter(k => k.course === "c02");
  const [ax, ay] = starXY(c02ks[0].id);
  tapAt(ax, ay);
  check("全图上点星星不会直接弹出测验", modalM.hidden);
  const zBox = svgM.getAttribute("viewBox").split(" ").map(Number);
  check("放大到 c02：只框住这一座（" + zBox.map(Math.round).join(" ") + "）", zBox[2] <= 260 && zBox[3] < 320);
  const c02box = boxes.find(b => b.id === "c02");
  check("放大视野装得下 c02 的全部星星和课程名", c02box.stars.every(([x, y]) => x > zBox[0] && x < zBox[0] + zBox[2] && y > zBox[1] && y < zBox[1] + zBox[3]) &&
    c02box.y1 < zBox[1] + zBox[3] && c02box.x0 >= zBox[0] - 1 && c02box.x1 <= zBox[0] + zBox[2] + 1);
  check("放大栏出现并显示课程名", !zoomBar.hidden &&
    docM.getElementById("zoom-text").textContent.includes(coursesA.find(c => c.id === "c02").cn));
  check("其余星座淡化", svgM.classList.contains("zoomed") && svgM.querySelector('g[data-course="c02"]').classList.contains("focus"));

  const [bx, by] = starXY(c02ks[1].id);
  tapAt(bx + 3, by - 2);
  check("第一次点星星只选中，不弹测验", modalM.hidden);
  check("放大栏显示选中星星的名字", docM.getElementById("zoom-text").textContent.includes(c02ks[1].name));
  check("选中的星星套上白环", !!svgM.querySelector('.star[data-k="' + c02ks[1].id + '"] .star-selected-ring'));
  check("出现「打开」按钮", !docM.getElementById("zoom-open").hidden);
  tapAt(bx, by);
  check("再点同一颗：打开这颗星的详情", !modalM.hidden && modalM.querySelector("#k-modal-title").textContent === c02ks[1].name);
  modalM.querySelector(".k-modal-close").click();
  docM.getElementById("zoom-open").click();
  check("点「打开」也能打开", !modalM.hidden && modalM.querySelector("#k-modal-title").textContent === c02ks[1].name);
  modalM.querySelector(".k-modal-close").click();
  check("关掉弹窗后仍停在放大视野", !zoomBar.hidden && svgM.getAttribute("viewBox") !== fullBox);
  docM.getElementById("zoom-next").click();
  check("› 选中下一颗", docM.getElementById("zoom-text").textContent.includes(c02ks[2].name));
  docM.getElementById("zoom-prev").click();
  docM.getElementById("zoom-prev").click();
  check("‹ 退回上一颗", docM.getElementById("zoom-text").textContent.includes(c02ks[0].name));
  docM.getElementById("zoom-prev").click();
  check("‹ 在第一颗时绕到最后一颗", docM.getElementById("zoom-text").textContent.includes(c02ks[c02ks.length - 1].name));

  /* 截下交给 share.js 画图的那张星图：必须是宽屏样式的全图，与屏幕上的窄屏放大态无关 */
  let sharedSvg = null;
  winM.Share.open = o => { sharedSvg = o.svg; };
  docM.querySelector("#projects-track .project-toggle").click(); /* 点亮一颗行星，「分享我的星图」才会出现 */
  [...docM.querySelectorAll("#view-bar-actions button")].find(b => b.textContent === "分享我的星图").click();
  const desktopBox = "0 0 " + readJSON("data/anthropic/courses.json").layout.viewBox.join(" ");
  check("分享图片用宽屏全图（" + (sharedSvg && sharedSvg.getAttribute("viewBox")) + "）", !!sharedSvg && sharedSvg.getAttribute("viewBox") === desktopBox);
  check("分享图片课程名单行、没有选中环和放大态", [...sharedSvg.querySelectorAll(".course-label")].every(l => l.querySelectorAll("tspan").length === 1) &&
    !sharedSvg.querySelector(".star-selected-ring") && !sharedSvg.classList.contains("zoomed") && !sharedSvg.classList.contains("compact"));
  check("分享时屏幕上的星图仍停在放大视野", svgM.getAttribute("viewBox") !== fullBox);

  docM.getElementById("zoom-back").click();
  check("「← 全图」回到完整星图", svgM.getAttribute("viewBox") === fullBox && zoomBar.hidden);
  check("回全图后选中状态清掉", !svgM.querySelector(".star-selected-ring"));

  console.log("— 手机转横屏（跨过 640px）自动重排 —");
  winM.__media.narrow = false;
  winM.__media.fire();
  check("换成宽屏布局", !svgM.classList.contains("compact") && svgM.getAttribute("viewBox") === desktopBox);
  winM.__media.narrow = true;
  winM.__media.fire();
  check("转回竖屏又换回两列", svgM.classList.contains("compact") && svgM.getAttribute("viewBox") === fullBox);

  console.log("— 平板（宽屏触屏）：宽屏布局 + 放大交互 —");
  const winP = await makePage(null, "", { touch: "tablet" });
  const svgP = winP.document.getElementById("starmap");
  check("平板用宽屏布局", !svgP.classList.contains("compact") && svgP.getAttribute("viewBox") === desktopBox);
  tapper(winP, svgP)(...starXYin(svgP)(c02ks[0].id));
  await wait(450);
  const pBox = svgP.getAttribute("viewBox").split(" ").map(Number);
  check("平板放大后宽高比与全图一致（星图元素不跳动）", pBox[2] < 400 && Math.abs(pBox[3] / pBox[2] - 1780 / 1200) < 0.01);
  winP.document.getElementById("zoom-back").click();
  await wait(450);
  check("平板回全图", svgP.getAttribute("viewBox") === desktopBox);

  console.log("— 桌面端不受影响 —");
  check("桌面端图例仍是「点击星星」", document.getElementById("map-hint").textContent.includes("点击星星"));
  check("桌面端星图不挂整图点击判定", document.getElementById("starmap").onclick === null);
  check("桌面端用宽屏布局、课程名单行", document.getElementById("starmap").getAttribute("viewBox") === desktopBox &&
    [...document.querySelectorAll("#starmap .course-label")].every(l => l.querySelectorAll("tspan").length === 1));

  console.log("— 解不开的分享链接 —");
  const winX = await makePage(null, "#s=garbage");
  check("退回我的星图", winX.document.body.dataset.view === "mine");
  check("并提示链接无法识别", winX.document.getElementById("view-bar-text").textContent.includes("无法识别"));

  /* ==================== OpenAI 实例 ==================== */
  const win2 = await makePage("openai");
  const doc2 = win2.document;
  const oKnowledge = readJSON("data/openai/knowledge.json").knowledge;
  const oQuiz = readJSON("data/openai/quiz.json");

  console.log("— OpenAI · 渲染与主题 —");
  check("body 打上 openai 标记", doc2.body.dataset.provider === "openai");
  check("大标题为「OpenAI 学习成就地图」", doc2.getElementById("site-title").textContent === "OpenAI 学习成就地图");
  check("眉题为 OPENAI ACADEMY", doc2.getElementById("eyebrow").textContent.includes("OPENAI ACADEMY"));
  const oStars = doc2.querySelectorAll("#starmap .star");
  check("星数 = openai knowledge 条数（" + oStars.length + " / 应为 " + oKnowledge.length + "）", oStars.length === oKnowledge.length);
  check("统计行为 3 门课", doc2.getElementById("stat-courses").textContent.includes("/ 3 门课"));
  const oProjects = readJSON("data/openai/projects.json").projects;
  check("项目视图渲染出 " + oProjects.length + " 颗行星（openai）",
    doc2.querySelectorAll("#projects-track .project-card").length === oProjects.length);
  check("切换按钮指向 Anthropic", doc2.getElementById("switch-provider").textContent.includes("Anthropic"));
  check("页脚课程链接指向 OpenAI Academy", doc2.getElementById("source-link").href.includes("academy.openai.com"));
  check("学习计划链接隐藏", doc2.getElementById("plan-link-wrap").hidden === true);
  check("梯队色注入 CSS 变量", win2.document.documentElement.style.getPropertyValue("--t1") === "#12a5bd");
  check("星图 viewBox 用紧凑布局", doc2.getElementById("starmap").getAttribute("viewBox") === "0 0 1200 520");

  /* c01–c03 补齐题库后，OpenAI 侧也不再有 questions 为空的知识点，
     因此这里同样走「有题必考」，并用一次完整答题验证 :openai 键隔离。
     空题库那条渲染分支目前两个厂商都没有真实数据覆盖了——它仍是活代码
     （新增知识点尚未出题时会走到），改 quiz.js 时别把它删掉。 */
  console.log("— OpenAI · 有题必考 + 完整答题流程 —");
  const modal2 = doc2.getElementById("k-modal");
  const emptyO = Object.keys(oQuiz).filter(k => !k.startsWith("_") && !oQuiz[k].questions.length);
  check("所有知识点都有题（无题库知识点：" + (emptyO.length || "无") + "）", emptyO.length === 0);
  [...doc2.querySelectorAll("#list-root .k-item")]
    .find(b => b.textContent.includes("从「提问」到「派活」")).click();
  check("弹窗显示课时概要", modal2.textContent.includes(oQuiz.k0301.summary.slice(0, 12)));
  const oStart = [...modal2.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("开始测验"));
  check("有「开始测验」按钮", !!oStart);
  check("无「直接点亮」绕过入口",
    ![...modal2.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("直接点亮")));

  oStart.click();
  const oQs = oQuiz.k0301.questions;
  const oAnswer = () => {
    const q = oQs[parseInt(modal2.querySelector(".kq-progress").textContent) - 1];
    [...modal2.querySelectorAll(".kq-opt")].find(o => o.textContent.includes(q.options[q.answer])).click();
  };
  const oNext = () => [...modal2.querySelectorAll(".kd-btn")].find(b => /下一题|查看结果/.test(b.textContent)).click();
  for (let i = 0; i < oQs.length; i++) { oAnswer(); oNext(); }
  check("结算：全对通过", modal2.textContent.includes("全对，通过"));
  check("预览写入带 :openai 后缀的键", JSON.parse(win2.localStorage.getItem("cc-map-preview:openai") || "{}")["knowledge:k0301"] === true);
  check("通过记录写入带 :openai 后缀的键", !!JSON.parse(win2.localStorage.getItem("cc-map-quiz-passed:openai") || "{}").k0301);
  check("不污染 Anthropic 的预览键", win2.localStorage.getItem("cc-map-preview") === null);

  console.log("— OpenAI · 切换按钮 —");
  doc2.getElementById("switch-provider").click(); /* jsdom 不支持真实跳转，只验证记忆写入 */
  check("点击后记忆切换目标", win2.localStorage.getItem("cc-map-provider") === "anthropic");

  console.log(failures ? "\n✗ " + failures + " 项失败" : "\n✓ 全部通过");
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error("测试崩溃:", e); process.exit(1); });
