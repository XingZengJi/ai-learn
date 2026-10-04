/* 知识点详情与测验弹窗：详情 → 逐题作答 → 全对自动点亮（记在本浏览器的「我的星图」） */
(function () {
  "use strict";

  const STATUS_TEXT = { done: "已点亮", doing: "进行中", todo: "未点亮" };

  let modal, panel, closeBtn;
  let ctx = null; /* 每次 open 由 app.js 注入：{ k, course, color, quiz, state, readOnly, onGoMine, passedDate, onPass, onTogglePreview } */
  let run = null; /* 一次测验的进行状态：{ idx, wrong[], order[][] } */
  let pendingCelebrate = null; /* 刚测验通过的知识点 id，等弹窗关闭后在那颗星周围撒花 */

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
    /* 弹窗关掉、星星露出来之后才撒花——否则纸屑全被弹窗盖住 */
    if (pendingCelebrate) { const kid = pendingCelebrate; pendingCelebrate = null; celebrateAtStar(kid); }
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

    if (ctx.readOnly) {
      /* 看作者的 / 别人的星图时不能在这里答题，否则成绩记到谁头上说不清 */
      const go = document.createElement("button");
      go.className = "kd-btn primary";
      go.type = "button";
      go.textContent = "去我的星图测验";
      go.addEventListener("click", ctx.onGoMine);
      foot.appendChild(go);
      const hint = document.createElement("p");
      hint.className = "kd-hint";
      hint.textContent = "这是别人的星图，测验成绩只记在你自己的星图上";
      foot.appendChild(hint);
    } else if (quiz && quiz.questions.length) {
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
      /* 题库待补充的知识点：保留直接点亮 */
      const btn = document.createElement("button");
      btn.className = "kd-btn";
      btn.type = "button";
      btn.textContent = "直接点亮";
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
      if (!alreadyDone) ctx.onPass(); /* 记录通过 + 点亮 + 重绘星图 */
      pendingCelebrate = ctx.k.id; /* 关闭弹窗那一刻，在这颗星周围撒花 */
      box.innerHTML =
        '<div class="kq-star" style="color:' + ctx.color + '">✦</div>' +
        '<h2 id="k-modal-title">' + total + " 题全对，通过！</h2>" +
        (alreadyDone
          ? '<p class="kq-note">这颗星早已点亮，温习成功 🎓</p>'
          : '<p class="kq-note">这颗星<strong>已点亮</strong>，记录保存在这个浏览器里。' +
            '点顶部的「分享我的星图」，可以生成链接或图片。</p>');
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

  /* ---------- 全对撒花：只在被点亮的那颗星周围小范围炸开 ---------- */
  const CONFETTI_COLORS = ["#ff5c8a", "#ffd166", "#5fe0a8", "#4cc9f0", "#b98cff", "#ff9f4d", "#fff3b0"];

  function celebrateAtStar(kid) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* 知识点 id 恒为 k+4 位数字（check-data.py 校验），可直接拼进选择器，无需 CSS.escape */
    const star = document.querySelector('#starmap .star[data-k="' + kid + '"]');
    if (!star) return;
    /* 星图现在很高，这颗星可能在视野外——先滚进来，等滚动停下再撒 */
    const box = star.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if ((box.top < 80 || box.bottom > vh - 60) && typeof star.scrollIntoView === "function") {
      star.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => burst(star), 520);
    } else {
      burst(star);
    }
  }

  function burst(star) {
    const box = star.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const layer = document.createElement("div");
    layer.className = "confetti-burst";

    /* 一圈扩散的光晕，标记「就是这颗亮了」 */
    const ring = document.createElement("span");
    ring.className = "confetti-ring";
    ring.style.left = cx + "px";
    ring.style.top = cy + "px";
    layer.appendChild(ring);

    const n = 26;
    for (let i = 0; i < n; i++) {
      const bit = document.createElement("span");
      bit.className = "confetti-bit";
      /* 均匀铺满一圈再加抖动，避免出现明显的空档 */
      const angle = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      const dist = 46 + Math.random() * 74; /* 小范围：46–120px */
      bit.style.left = cx + "px";
      bit.style.top = cy + "px";
      bit.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      /* +18 让尾段略微下沉，像纸屑受重力 */
      bit.style.setProperty("--dy", (Math.sin(angle) * dist * 0.8 + 18) + "px");
      bit.style.setProperty("--rot", ((Math.random() * 2 - 1) * 420) + "deg");
      bit.style.setProperty("--c", CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
      bit.style.setProperty("--w", (4 + Math.random() * 4).toFixed(1) + "px");
      bit.style.setProperty("--h", (7 + Math.random() * 5).toFixed(1) + "px");
      bit.style.setProperty("--br", Math.random() < 0.35 ? "50%" : "1px"); /* 三成做成小圆点，混着纸条更热闹 */
      bit.style.setProperty("--dur", (0.75 + Math.random() * 0.5).toFixed(2) + "s");
      bit.style.setProperty("--delay", (Math.random() * 0.12).toFixed(2) + "s");
      layer.appendChild(bit);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1800);
  }

  window.Quiz = { open: open };
})();
