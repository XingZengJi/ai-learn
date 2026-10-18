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
 * opts.touch 模拟手机：matchMedia 报告触屏，星图元素按全图 1200×1780 的屏幕尺寸摆放（jsdom 自己不做布局） */
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
    window.matchMedia = q => ({ matches: /pointer: coarse|max-width: 640px/.test(q), addListener() {}, removeListener() {} });
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
    return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(fs.readFileSync(p, "utf8"))) });
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

  console.log("— 手机：点星座 → 放大 → 点星星 —");
  const winM = await makePage(null, "", { touch: true });
  const docM = winM.document;
  const svgM = docM.getElementById("starmap");
  const wait = ms => new Promise(r => setTimeout(r, ms));
  /* 在星图坐标 (sx, sy) 处点一下：按当前 viewBox 换算成屏幕坐标再派发 click */
  const tapAt = (sx, sy) => {
    const [x, y, w, h] = svgM.getAttribute("viewBox").split(" ").map(Number);
    svgM.dispatchEvent(new winM.MouseEvent("click", { bubbles: true, clientX: (sx - x) / w * 1200, clientY: (sy - y) / h * 1780 }));
  };
  const starXY = kid => {
    const c = svgM.querySelector('.star[data-k="' + kid + '"] circle.core');
    return [+c.getAttribute("cx"), +c.getAttribute("cy")];
  };
  const fullBox = svgM.getAttribute("viewBox");
  const zoomBar = docM.getElementById("zoom-bar");
  const modalM = docM.getElementById("k-modal");
  check("图例提示改成「点一个星座放大」", docM.getElementById("map-hint").textContent.includes("点一个星座放大"));
  check("全图时没有放大栏", zoomBar.hidden);
  const nCoursesM = readJSON("data/anthropic/courses.json").courses.length;
  check("全图星座下显示编号（" + svgM.querySelectorAll(".course-num").length + " 个），不画小字课程名",
    svgM.querySelectorAll(".course-num").length === nCoursesM && svgM.querySelectorAll(".course-label").length === 0);
  check("天区标题放大", svgM.classList.contains("numbered"));
  const idxRows = docM.querySelectorAll("#map-index .idx-row");
  check("星图下方有编号对照，" + nCoursesM + " 门课一行一门", !docM.getElementById("map-index").hidden && idxRows.length === nCoursesM);
  check("对照行写着编号和课程全名", idxRows[1].querySelector(".idx-num").textContent === "2" &&
    idxRows[1].querySelector(".idx-name").textContent === readJSON("data/anthropic/courses.json").courses[1].cn);

  const c02ks = knowledge.filter(k => k.course === "c02");
  const [ax, ay] = starXY(c02ks[0].id);
  tapAt(ax, ay);
  check("全图上点星星不会直接弹出测验", modalM.hidden);
  await wait(450);
  const zBox = svgM.getAttribute("viewBox").split(" ").map(Number);
  check("放大到 c02：viewBox 变小（" + zBox.map(Math.round).join(" ") + "）", zBox[2] < 400 && fullBox !== svgM.getAttribute("viewBox"));
  check("放大后视野宽高比与全图一致（星图元素不跳动）", Math.abs(zBox[3] / zBox[2] - 1780 / 1200) < 0.01);
  check("放大栏出现并显示课程名", !zoomBar.hidden &&
    docM.getElementById("zoom-text").textContent.includes(readJSON("data/anthropic/courses.json").courses.find(c => c.id === "c02").cn));
  check("其余星座淡化", svgM.classList.contains("zoomed") && svgM.querySelector('g[data-course="c02"]').classList.contains("focus"));
  check("放大后换回完整课程名", svgM.querySelectorAll(".course-label").length > 0 && svgM.querySelectorAll(".course-num").length === 0);

  const [bx, by] = starXY(c02ks[1].id);
  tapAt(bx + 6, by - 4);
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
  /* 截下交给 share.js 画图的那张星图：必须是桌面样式的全图，带完整课程名 */
  let sharedSvg = null;
  winM.Share.open = o => { sharedSvg = o.svg; };
  docM.querySelector("#projects-track .project-toggle").click(); /* 点亮一颗行星，「分享我的星图」才会出现 */
  [...docM.querySelectorAll("#view-bar-actions button")].find(b => b.textContent === "分享我的星图").click();
  check("放大着点分享：图片用的是全图", !!sharedSvg && sharedSvg.getAttribute("viewBox") === fullBox);
  check("分享图片带完整课程名、没有编号和选中环", sharedSvg.querySelectorAll(".course-label").length === nCoursesM &&
    !sharedSvg.querySelector(".course-num") && !sharedSvg.querySelector(".star-selected-ring") && !sharedSvg.classList.contains("zoomed"));
  check("分享时屏幕上的星图仍停在放大视野", svgM.getAttribute("viewBox") !== fullBox);
  docM.getElementById("zoom-next").click();
  check("› 选中下一颗", docM.getElementById("zoom-text").textContent.includes(c02ks[2].name));
  docM.getElementById("zoom-prev").click();
  docM.getElementById("zoom-prev").click();
  check("‹ 退回上一颗", docM.getElementById("zoom-text").textContent.includes(c02ks[0].name));
  docM.getElementById("zoom-prev").click();
  check("‹ 在第一颗时绕到最后一颗", docM.getElementById("zoom-text").textContent.includes(c02ks[c02ks.length - 1].name));

  docM.getElementById("zoom-back").click();
  await wait(450);
  check("「← 全图」回到完整星图", svgM.getAttribute("viewBox") === fullBox && zoomBar.hidden);
  check("回全图后选中状态清掉", !svgM.querySelector(".star-selected-ring"));
  docM.querySelectorAll("#map-index .idx-row")[4].click();
  await wait(450);
  check("点对照表第 5 行：放大到第 5 个星座", svgM.querySelector("g.focus") &&
    svgM.querySelector("g.focus").dataset.course === readJSON("data/anthropic/courses.json").courses[4].id);
  check("对照表高亮当前星座", docM.querySelectorAll("#map-index .idx-row")[4].classList.contains("current"));

  console.log("— 桌面端不受影响 —");
  check("桌面端图例仍是「点击星星」", document.getElementById("map-hint").textContent.includes("点击星星"));
  check("桌面端星图不挂整图点击判定", document.getElementById("starmap").onclick === null);
  check("桌面端照常显示课程名、没有编号对照", document.querySelectorAll("#starmap .course-label").length > 0 &&
    !document.querySelector("#starmap .course-num") && document.getElementById("map-index").hidden);

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
