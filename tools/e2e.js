/* 成就地图端到端冒烟测试（无需浏览器，用 jsdom 模拟）。
 * 改了 docs/ 下的 JS/HTML 之后跑；只补 quiz.json 数据的话跑 check-data.py 即可。
 * 用法：cd tools && npm install && node e2e.js
 * 覆盖：Anthropic 全流程（渲染→点星→测验答错重试→全对预览点亮→无题库直点→Esc/清除预览）
 *      + OpenAI 实例（主题标记、星数、概要展示、直接预览点亮、localStorage 键隔离、切换按钮）。
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

/* 创建一个加载完成的页面实例；provider 为 null 时不预置 localStorage */
async function makePage(provider) {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => {}); /* jsdom 不支持导航跳转，静默这类噪音 */
  const dom = new JSDOM(html, {
    url: "http://localhost/", runScripts: "dangerously",
    pretendToBeVisual: true, virtualConsole
  });
  const { window } = dom;
  if (provider) window.localStorage.setItem("cc-map-provider", provider);

  // fetch shim：本地数据从文件系统读取；外部 API（热力图）直接失败走 fallback
  window.fetch = (u) => {
    if (/^https?:\/\//.test(u) && !u.startsWith("http://localhost/")) {
      return Promise.reject(new Error("external blocked in test"));
    }
    const p = path.join(DOCS, u.replace("http://localhost/", ""));
    return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(fs.readFileSync(p, "utf8"))) });
  };

  for (const f of ["js/starmap.js", "js/quiz.js", "js/heatmap.js", "js/app.js"]) {
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
  check("列表渲染出 20 门课程分组", document.querySelectorAll("#list-root details.course-k").length === 20);
  check("统计行课程数动态化", document.getElementById("stat-courses").textContent.includes("/ 20 门课"));
  check("切换按钮指向 OpenAI", document.getElementById("switch-provider").textContent.includes("OpenAI"));

  console.log("— Anthropic · 详情弹窗（有题库知识点 k0101）—");
  const modal = document.getElementById("k-modal");
  [...document.querySelectorAll("#list-root .k-item")]
    .find(b => b.textContent.includes("认识 Claude 与首次对话")).click();
  check("弹窗打开", !modal.hidden);
  check("显示概要", modal.textContent.includes(quiz.k0101.summary.slice(0, 12)));
  const nQ = quiz.k0101.questions.length;
  const startBtn = [...modal.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("开始测验"));
  check("有「开始测验（" + nQ + " 题）」按钮", !!startBtn && startBtn.textContent.includes(nQ + " 题"));
  check("无「直接预览点亮」按钮", ![...modal.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("直接预览点亮")));

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
  check("预览点亮已写入（无后缀键）", preview["knowledge:k0101"] === true);
  check("预览横幅出现", !document.getElementById("preview-banner").hidden);

  [...modal.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("完成")).click();
  check("点「完成」关闭弹窗", modal.hidden);

  console.log("— Anthropic · 重开详情：已通过态 —");
  [...document.querySelectorAll("#list-root .k-item")]
    .find(b => b.textContent.includes("认识 Claude 与首次对话")).click();
  check("显示「已通过测验」", modal.textContent.includes("已通过测验"));
  check("按钮变「重新测验」", [...modal.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("重新测验")));
  modal.querySelector(".k-modal-close").click();

  console.log("— Anthropic · 无题库知识点（k0201）：直接预览点亮 —");
  [...document.querySelectorAll("#list-root .k-item")]
    .find(b => b.textContent.includes("Claude Code 是什么")).click();
  check("显示占位文案", modal.textContent.includes("学到这门课时补充"));
  const directBtn = [...modal.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("直接预览点亮"));
  check("有「直接预览点亮」按钮", !!directBtn);
  directBtn.click();
  check("直接预览点亮生效", JSON.parse(win.localStorage.getItem("cc-map-preview"))["knowledge:k0201"] === true);

  console.log("— Anthropic · Esc 关闭 & 清除预览 —");
  document.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape" }));
  check("Esc 关闭弹窗", modal.hidden);
  document.getElementById("clear-preview").click();
  check("清除预览后 preview 为空", win.localStorage.getItem("cc-map-preview") === "{}");
  check("quiz-passed 记录保留", JSON.parse(win.localStorage.getItem("cc-map-quiz-passed")).k0101 != null);

  /* ==================== OpenAI 实例 ==================== */
  const win2 = await makePage("openai");
  const doc2 = win2.document;
  const oKnowledge = readJSON("data/openai/knowledge.json").knowledge;
  const oQuiz = readJSON("data/openai/quiz.json");

  console.log("— OpenAI · 渲染与主题 —");
  check("body 打上 openai 标记", doc2.body.dataset.provider === "openai");
  check("眉题为 OPENAI ACADEMY", doc2.getElementById("eyebrow").textContent.includes("OPENAI ACADEMY"));
  const oStars = doc2.querySelectorAll("#starmap .star");
  check("星数 = openai knowledge 条数（" + oStars.length + " / 应为 " + oKnowledge.length + "）", oStars.length === oKnowledge.length);
  check("统计行为 3 门课", doc2.getElementById("stat-courses").textContent.includes("/ 3 门课"));
  check("项目视图有 5 个草稿", doc2.querySelectorAll("#projects-track .project-card").length === 5);
  check("切换按钮指向 Anthropic", doc2.getElementById("switch-provider").textContent.includes("Anthropic"));
  check("页脚课程链接指向 OpenAI Academy", doc2.getElementById("source-link").href.includes("academy.openai.com"));
  check("学习计划链接隐藏", doc2.getElementById("plan-link-wrap").hidden === true);
  check("梯队色注入 CSS 变量", win2.document.documentElement.style.getPropertyValue("--t1") === "#10a37f");
  check("星图 viewBox 用紧凑布局", doc2.getElementById("starmap").getAttribute("viewBox") === "0 0 1200 520");

  console.log("— OpenAI · 详情：概要 + 直接预览点亮（题库为空）—");
  const modal2 = doc2.getElementById("k-modal");
  [...doc2.querySelectorAll("#list-root .k-item")]
    .find(b => b.textContent.includes("从「提问」到「派活」")).click();
  check("弹窗显示课时概要", modal2.textContent.includes(oQuiz.k0301.summary.slice(0, 12)));
  check("无测验按钮（questions 为空）", ![...modal2.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("测验（")));
  const oDirect = [...modal2.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("直接预览点亮"));
  check("有「直接预览点亮」按钮", !!oDirect);
  oDirect.click();
  check("预览写入带 :openai 后缀的键", JSON.parse(win2.localStorage.getItem("cc-map-preview:openai") || "{}")["knowledge:k0301"] === true);
  check("不污染 Anthropic 的预览键", win2.localStorage.getItem("cc-map-preview") === null);

  console.log("— OpenAI · 切换按钮 —");
  doc2.getElementById("switch-provider").click(); /* jsdom 不支持真实跳转，只验证记忆写入 */
  check("点击后记忆切换目标", win2.localStorage.getItem("cc-map-provider") === "anthropic");

  console.log(failures ? "\n✗ " + failures + " 项失败" : "\n✓ 全部通过");
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error("测试崩溃:", e); process.exit(1); });
