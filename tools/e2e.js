/* 成就地图端到端冒烟测试（无需浏览器，用 jsdom 模拟）。
 * 改了 docs/ 下的 JS/HTML 之后跑；只补 quiz.json 数据的话跑 check-data.py 即可。
 * 用法：cd tools && npm install && node e2e.js
 * 流程覆盖：渲染 → 点星开详情 → 测验答错重试 → 全对预览点亮 → 无题库直点 → Esc/清除预览。
 */
const { JSDOM } = require("jsdom");
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

(async () => {
  const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "dangerously", pretendToBeVisual: true });
  const { window } = dom;
  const { document } = window;

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

  const quiz = JSON.parse(fs.readFileSync(path.join(DOCS, "data/quiz.json"), "utf8"));
  const knowledge = JSON.parse(fs.readFileSync(path.join(DOCS, "data/knowledge.json"), "utf8")).knowledge;

  console.log("— 初始渲染 —");
  const stars = document.querySelectorAll("#starmap .star");
  check("星图星数 = knowledge.json 条数（" + stars.length + "）", stars.length === knowledge.length);
  check("列表渲染出 20 门课程分组", document.querySelectorAll("#list-root details.course-k").length === 20);

  console.log("— 详情弹窗（有题库知识点 k0101）—");
  const modal = document.getElementById("k-modal");
  const kItems = [...document.querySelectorAll("#list-root .k-item")];
  const k0101Btn = kItems.find(b => b.textContent.includes("认识 Claude 与首次对话"));
  k0101Btn.click();
  check("弹窗打开", !modal.hidden);
  check("显示概要", modal.textContent.includes(quiz.k0101.summary.slice(0, 12)));
  const nQ = quiz.k0101.questions.length;
  const startBtn = [...modal.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("开始测验"));
  check("有「开始测验（" + nQ + " 题）」按钮", !!startBtn && startBtn.textContent.includes(nQ + " 题"));
  check("无「直接预览点亮」按钮", ![...modal.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("直接预览点亮")));

  console.log("— 测验：先答错一题再全对 —");
  startBtn.click();
  const answerCurrent = (correct) => {
    const q = quiz.k0101.questions[parseInt(modal.querySelector(".kq-progress").textContent) - 1];
    const rightText = q.options[q.answer];
    const opts = [...modal.querySelectorAll(".kq-opt")];
    const target = correct
      ? opts.find(o => o.textContent.includes(rightText))
      : opts.find(o => !o.textContent.includes(rightText));
    target.click();
  };
  const next = () => [...modal.querySelectorAll(".kd-btn")].find(b => /下一题|查看结果/.test(b.textContent)).click();

  answerCurrent(false); // 第 1 题故意答错
  check("答错后正确项高亮", !!modal.querySelector(".kq-opt.correct"));
  check("答错项标红", !!modal.querySelector(".kq-opt.wrong"));
  check("显示解析", !!modal.querySelector(".kq-explain"));
  next();
  for (let i = 0; i < nQ - 1; i++) { answerCurrent(true); next(); }
  check("结算：答对 " + (nQ - 1) + " / " + nQ, modal.textContent.includes("答对 " + (nQ - 1) + " / " + nQ));
  check("指出第 1 题错", modal.textContent.includes("第 1 题答错"));
  check("未点亮（localStorage 无记录）", !window.localStorage.getItem("cc-map-quiz-passed"));

  [...modal.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("再来一次")).click();
  for (let i = 0; i < nQ; i++) { answerCurrent(true); next(); }
  check("结算：全对通过", modal.textContent.includes("全对，通过"));
  check("提示回来喊 Claude 点亮", modal.textContent.includes("点亮 认识 Claude 与首次对话"));
  const passed = JSON.parse(window.localStorage.getItem("cc-map-quiz-passed") || "{}");
  check("通过记录已写入", !!passed.k0101);
  const preview = JSON.parse(window.localStorage.getItem("cc-map-preview") || "{}");
  check("预览点亮已写入", preview["knowledge:k0101"] === true);
  check("预览横幅出现", !document.getElementById("preview-banner").hidden);
  check("顶部计数含预览", document.getElementById("stat-stars").textContent.includes("+1 预览"));

  [...modal.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("完成")).click();
  check("点「完成」关闭弹窗", modal.hidden);

  console.log("— 重开详情：已通过态 —");
  [...document.querySelectorAll("#list-root .k-item")]
    .find(b => b.textContent.includes("认识 Claude 与首次对话")).click();
  check("显示「已通过测验」", modal.textContent.includes("已通过测验"));
  check("按钮变「重新测验」", [...modal.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("重新测验")));
  modal.querySelector(".k-modal-close").click();

  console.log("— 无题库知识点（k0201）：直接预览点亮 —");
  [...document.querySelectorAll("#list-root .k-item")]
    .find(b => b.textContent.includes("Claude Code 是什么")).click();
  check("显示占位文案", modal.textContent.includes("学到这门课时补充"));
  const directBtn = [...modal.querySelectorAll(".kd-btn")].find(b => b.textContent.includes("直接预览点亮"));
  check("有「直接预览点亮」按钮", !!directBtn);
  directBtn.click();
  const preview2 = JSON.parse(window.localStorage.getItem("cc-map-preview"));
  check("直接预览点亮生效", preview2["knowledge:k0201"] === true);
  check("按钮切换为「取消预览点亮」", [...modal.querySelectorAll(".kd-btn")].some(b => b.textContent.includes("取消预览点亮")));

  console.log("— Esc 关闭 & 清除预览 —");
  window.document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape" }));
  check("Esc 关闭弹窗", modal.hidden);
  document.getElementById("clear-preview").click();
  check("清除预览后 preview 为空", window.localStorage.getItem("cc-map-preview") === "{}");
  check("quiz-passed 记录保留", JSON.parse(window.localStorage.getItem("cc-map-quiz-passed")).k0101 != null);

  console.log(failures ? "\n✗ " + failures + " 项失败" : "\n✓ 全部通过");
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error("测试崩溃:", e); process.exit(1); });
