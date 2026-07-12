/* 知识点详情与测验弹窗：详情 → 逐题作答 → 全对自动预览点亮 */
(function () {
  "use strict";

  const STATUS_TEXT = { done: "已点亮", preview: "预览点亮", doing: "进行中", todo: "未点亮" };

  let modal, panel, closeBtn;
  let ctx = null; /* 每次 open 由 app.js 注入：{ k, course, color, quiz, state, passedDate, onPass, onTogglePreview } */
  let run = null; /* 一次测验的进行状态：{ idx, wrong[], order[][] } */

  function init() {
    modal = document.getElementById("k-modal");
    panel = modal.querySelector(".k-modal-body");
    closeBtn = modal.querySelector(".k-modal-close");
    closeBtn.addEventListener("click", close);
    modal.querySelector(".k-modal-backdrop").addEventListener("click", close);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !modal.hidden) close();
    });
  }

  function open(options) {
    if (!modal) init();
    ctx = options;
    run = null;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    renderDetail();
    closeBtn.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
    ctx = null;
    run = null; /* 中途关闭不计成绩 */
  }

  /* ---------- 详情视图 ---------- */
  function renderDetail() {
    const k = ctx.k, quiz = ctx.quiz;
    const st = ctx.state.statusOf("knowledge", k.id);
    const doneDate = ctx.state.dateOf("knowledge", k.id);
    panel.textContent = "";

    const head = document.createElement("div");
    head.className = "kd-head";
    head.innerHTML =
      '<span class="tier-chip" style="color:' + ctx.color + '">' + ctx.course.cn + "</span>" +
      '<h2 id="k-modal-title">' + k.name + "</h2>" +
      '<p class="kd-status ' + st + '">' + STATUS_TEXT[st] +
      (st === "done" && doneDate ? " · " + doneDate : "") + "</p>";
    panel.appendChild(head);

    const sum = document.createElement("p");
    sum.className = "kd-summary" + (quiz ? "" : " empty");
    sum.textContent = quiz ? quiz.summary : "概要与题库将在学到这门课时补充。";
    panel.appendChild(sum);

    const foot = document.createElement("div");
    foot.className = "kd-actions";

    if (quiz && quiz.questions.length) {
      const passed = ctx.passedDate();
      if (passed) {
        const ok = document.createElement("p");
        ok.className = "kd-passed";
        ok.textContent = "✓ 已通过测验 · " + passed;
        foot.appendChild(ok);
      }
      const btn = document.createElement("button");
      btn.className = "kd-btn primary";
      btn.type = "button";
      btn.textContent =
        (st === "done" ? "温习测验" : passed ? "重新测验" : "开始测验") +
        "（" + quiz.questions.length + " 题）";
      btn.addEventListener("click", startQuiz);
      foot.appendChild(btn);
      if (st !== "done" && !passed) {
        const hint = document.createElement("p");
        hint.className = "kd-hint";
        hint.textContent = "全部答对即可点亮这颗星";
        foot.appendChild(hint);
      }
    } else if (st !== "done") {
      /* 题库待补充的知识点：保留直接预览点亮 */
      const btn = document.createElement("button");
      btn.className = "kd-btn";
      btn.type = "button";
      btn.textContent = st === "preview" ? "取消预览点亮" : "直接预览点亮";
      btn.addEventListener("click", () => { ctx.onTogglePreview(); renderDetail(); });
      foot.appendChild(btn);
    }
    panel.appendChild(foot);
  }

  /* ---------- 测验视图 ---------- */
  function shuffled(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function startQuiz() {
    run = { idx: 0, wrong: [], order: ctx.quiz.questions.map(q => shuffled(q.options.length)) };
    renderQuestion();
  }

  function renderQuestion() {
    const qs = ctx.quiz.questions;
    const q = qs[run.idx];
    const order = run.order[run.idx];
    panel.textContent = "";

    const head = document.createElement("div");
    head.className = "kq-head";
    head.innerHTML =
      '<span class="kq-progress mono">' + (run.idx + 1) + " / " + qs.length + "</span>" +
      '<h2 id="k-modal-title" class="kq-title">' + ctx.k.name + " · 测验</h2>";
    panel.appendChild(head);

    const card = document.createElement("div");
    card.className = "kq-card";
    const qEl = document.createElement("p");
    qEl.className = "kq-q";
    qEl.textContent = q.q;
    card.appendChild(qEl);

    const opts = document.createElement("div");
    opts.className = "kq-options";
    let answered = false;
    order.forEach((origIdx, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "kq-opt";
      btn.innerHTML = '<span class="kq-letter mono">' + "ABCD"[i] + "</span><span>" + q.options[origIdx] + "</span>";
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const right = origIdx === q.answer;
        if (!right) run.wrong.push(run.idx);
        opts.querySelectorAll(".kq-opt").forEach((b, bi) => {
          b.disabled = true;
          if (order[bi] === q.answer) b.classList.add("correct");
        });
        if (!right) btn.classList.add("wrong");
        showExplain(card, right, q.explain);
      });
      opts.appendChild(btn);
    });
    card.appendChild(opts);
    panel.appendChild(card);
  }

  function showExplain(card, right, explain) {
    const box = document.createElement("div");
    box.className = "kq-explain" + (right ? "" : " wrong");
    box.innerHTML = "<strong>" + (right ? "✓ 答对了" : "✗ 答错了") + "</strong>" + explain;
    card.appendChild(box);

    const next = document.createElement("button");
    next.className = "kd-btn primary";
    next.type = "button";
    const last = run.idx === ctx.quiz.questions.length - 1;
    next.textContent = last ? "查看结果" : "下一题";
    next.addEventListener("click", () => {
      if (last) renderResult();
      else { run.idx++; renderQuestion(); }
    });
    card.appendChild(next);
    next.focus();
  }

  function renderResult() {
    const total = ctx.quiz.questions.length;
    const nWrong = run.wrong.length;
    panel.textContent = "";
    const box = document.createElement("div");
    box.className = "kq-result";

    if (!nWrong) {
      const alreadyDone = ctx.state.statusOf("knowledge", ctx.k.id) === "done";
      if (!alreadyDone) ctx.onPass(); /* 记录通过 + 预览点亮 + 重绘星图 */
      box.innerHTML =
        '<div class="kq-star" style="color:' + ctx.color + '">✦</div>' +
        '<h2 id="k-modal-title">' + total + " 题全对，通过！</h2>" +
        (alreadyDone
          ? '<p class="kq-note">这颗星早已正式点亮，温习成功 🎓</p>'
          : '<p class="kq-note">这颗星已<strong>预览点亮</strong>。回到 Claude Code 说一句「点亮 ' +
            ctx.k.name + '」，即可正式写入仓库并计入热力图。</p>');
      const done = document.createElement("button");
      done.className = "kd-btn primary";
      done.type = "button";
      done.textContent = "完成";
      done.addEventListener("click", close);
      box.appendChild(done);
    } else {
      box.innerHTML =
        '<h2 id="k-modal-title">答对 ' + (total - nWrong) + " / " + total + " 题</h2>" +
        '<p class="kq-note">第 ' + run.wrong.map(i => i + 1).join("、") +
        " 题答错了。需要全对才能点亮——再来一次！</p>";
      const retry = document.createElement("button");
      retry.className = "kd-btn primary";
      retry.type = "button";
      retry.textContent = "再来一次";
      retry.addEventListener("click", startQuiz);
      const back = document.createElement("button");
      back.className = "kd-btn";
      back.type = "button";
      back.textContent = "回到详情";
      back.addEventListener("click", renderDetail);
      box.appendChild(retry);
      box.appendChild(back);
    }
    panel.appendChild(box);
  }

  window.Quiz = { open: open };
})();
