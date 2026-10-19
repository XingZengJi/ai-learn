/* 知识点详情与测验弹窗：详情 → 逐题作答 → 全对自动点亮（记在本浏览器的「我的星图」）；
 * 另有复习（错题复习、到期温习）：从 app.js 挑好的题里逐题作答，不影响点亮 */
(function () {
  "use strict";

  const STATUS_TEXT = { done: "已点亮", doing: "进行中", todo: "未点亮" };

  let modal, panel, closeBtn;
  /* 每次 open 由 app.js 注入：
   *   { k, course, color, quizState, quiz, state, readOnly, learnUrl, notesUrl, wrongCount,
   *     onGoMine, passedDate, onPass, onRefresh, onToggleStar, onAnswer, reportUrl, nextStar, onNext, onReview }
   * 复习走 review()：{ review: "错题复习" | "温习", items, onAnswer, reportUrl, summarize, onMore }
   *   summarize({ total, right, items, wrong }) 返回 { note, more }：结算页的说明文字、要不要给「继续复习」 */
  let ctx = null;
  let opener = null; /* 打开弹窗前的焦点所在，关闭时还回去，键盘用户不会被甩回页首 */
  /* 一轮作答的进行状态：{ items: [{ k, q, qIdx }], idx, wrong[], order[][] }。
   * 完整测验和错题复习共用这一套，区别只在 items 从哪来、做完怎么结算 */
  let run = null;
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

  function show(options) {
    if (!modal) init();
    /* 题库加载完、或者从结果页直接去下一颗星，都会在弹窗开着时再 open 一次，那时焦点已在弹窗里，不能覆盖 */
    if (modal.hidden) opener = document.activeElement;
    ctx = options;
    run = null;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function open(options) {
    show(options);
    renderDetail();
    closeBtn.focus();
  }

  function review(options) {
    show(options);
    startRun(options.items);
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    ctx = null;
    run = null; /* 中途关闭不计成绩 */
    if (opener && typeof opener.focus === "function") opener.focus({ preventScroll: true });
    opener = null;
    /* 弹窗关掉、星星露出来之后才撒花——否则纸屑全被弹窗盖住 */
    if (pendingCelebrate) { const kid = pendingCelebrate; pendingCelebrate = null; celebrateAtStar(kid); }
  }

  function button(text, primary, onClick) {
    const b = document.createElement("button");
    b.className = "kd-btn" + (primary ? " primary" : "");
    b.type = "button";
    b.textContent = text;
    b.addEventListener("click", onClick);
    return b;
  }

  /* 「去学这门课」「看中文笔记」：答不上来时得有地方可去 */
  function learnLinks() {
    const row = document.createElement("p");
    row.className = "kd-links";
    [[ctx.learnUrl, "去学这门课 ↗"], [ctx.notesUrl, "看中文笔记 ↗"]].forEach(([href, text]) => {
      if (!href) return;
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = text;
      row.appendChild(a);
    });
    return row;
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
    /* 题库还没到（或没下下来）时不出任何按钮：此时分不清「没题」和「题没到」，给「直接点亮」就能绕过测验 */
    if (ctx.quizState !== "ready") {
      sum.textContent = ctx.quizState === "loading"
        ? "正在加载题目…"
        : "题目没有加载出来，请检查网络后关掉弹窗重新打开。";
      panel.appendChild(sum);
      return;
    }
    panel.appendChild(sum);
    panel.appendChild(learnLinks());

    const foot = document.createElement("div");
    foot.className = "kd-actions";

    if (ctx.readOnly) {
      /* 看别人分享的星图时不能在这里答题，否则成绩记到谁头上说不清 */
      foot.appendChild(button("去我的星图测验", true, ctx.onGoMine));
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
      foot.appendChild(button(
        (st === "done" ? "温习测验" : passed ? "重新测验" : "开始测验") + "（" + quiz.questions.length + " 题）",
        true, () => startRun(quiz.questions.map((q, i) => ({ k: k, q: q, qIdx: i })))));
      const nWrong = ctx.wrongCount();
      if (nWrong) foot.appendChild(button("只练这里的错题（" + nWrong + " 题）", false, ctx.onReview));
      if (st !== "done" && !passed) {
        const hint = document.createElement("p");
        hint.className = "kd-hint";
        hint.textContent = "全部答对即可点亮这颗星";
        foot.appendChild(hint);
      }
    } else if (st !== "done") {
      /* 题库待补充的知识点：保留直接点亮 */
      foot.appendChild(button("直接点亮", false, () => { ctx.onToggleStar(); renderDetail(); }));
    }
    panel.appendChild(foot);
  }

  /* ---------- 作答视图 ---------- */
  function shuffled(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function startRun(items) {
    run = { items: items, idx: 0, wrong: [], order: items.map(it => shuffled(it.q.options.length)) };
    renderQuestion();
  }

  function renderQuestion() {
    const item = run.items[run.idx];
    const q = item.q;
    const order = run.order[run.idx];
    panel.textContent = "";

    const head = document.createElement("div");
    head.className = "kq-head";
    head.innerHTML =
      '<span class="kq-progress mono">' + (run.idx + 1) + " / " + run.items.length + "</span>" +
      '<h2 id="k-modal-title" class="kq-title">' + item.k.name + " · " + (ctx.review || "测验") + "</h2>";
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
      /* 选项和解析按纯文本放：题库里有 <sales_records> 这类字面尖括号，走 innerHTML 会被当成标签吞掉 */
      const letter = document.createElement("span");
      letter.className = "kq-letter mono";
      letter.textContent = "ABCD"[i];
      const text = document.createElement("span");
      text.textContent = q.options[origIdx];
      btn.appendChild(letter);
      btn.appendChild(text);
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const right = origIdx === q.answer;
        if (!right) run.wrong.push(run.idx);
        ctx.onAnswer(item.k.id, item.qIdx, right); /* 记进 / 移出错题本 */
        opts.querySelectorAll(".kq-opt").forEach((b, bi) => {
          b.disabled = true;
          if (order[bi] === q.answer) b.classList.add("correct");
        });
        if (!right) btn.classList.add("wrong");
        showExplain(card, right, item);
      });
      opts.appendChild(btn);
    });
    card.appendChild(opts);
    panel.appendChild(card);
  }

  function showExplain(card, right, item) {
    const box = document.createElement("div");
    box.className = "kq-explain" + (right ? "" : " wrong");
    const verdict = document.createElement("strong");
    verdict.textContent = right ? "✓ 答对了" : "✗ 答错了";
    box.appendChild(verdict);
    box.appendChild(document.createTextNode(item.q.explain));
    /* 题目本身有错时给访客一个出口：直接去 GitHub 提 Issue，题干和位置都替他填好 */
    const report = document.createElement("a");
    report.className = "kq-report";
    report.href = ctx.reportUrl(item.k, item.qIdx);
    report.target = "_blank";
    report.rel = "noopener";
    report.textContent = "这题有问题？去反馈 ↗";
    box.appendChild(report);
    card.appendChild(box);

    const last = run.idx === run.items.length - 1;
    const next = button(last ? "查看结果" : "下一题", true, () => {
      if (last) (ctx.review ? renderReviewResult : renderResult)();
      else { run.idx++; renderQuestion(); }
    });
    card.appendChild(next);
    next.focus();
  }

  function renderResult() {
    const total = run.items.length;
    const nWrong = run.wrong.length;
    panel.textContent = "";
    const box = document.createElement("div");
    box.className = "kq-result";

    if (!nWrong) {
      const alreadyDone = ctx.state.statusOf("knowledge", ctx.k.id) === "done";
      if (!alreadyDone) ctx.onPass(); /* 记录通过 + 点亮 + 重绘星图 */
      else if (ctx.onRefresh) ctx.onRefresh(); /* 温习全对：重新计算下次该温习的时间 */
      pendingCelebrate = ctx.k.id; /* 关闭弹窗那一刻，在这颗星周围撒花 */
      box.innerHTML =
        '<div class="kq-star" style="color:' + ctx.color + '">✦</div>' +
        '<h2 id="k-modal-title">' + total + " 题全对，通过！</h2>" +
        (alreadyDone
          ? '<p class="kq-note">这颗星早已点亮，温习成功 🎓</p>'
          : '<p class="kq-note">这颗星<strong>已点亮</strong>，记录保存在这个浏览器里。' +
            '点顶部的「分享我的星图」，可以生成链接或图片。</p>');
      /* 趁热打铁：直接去推荐的下一颗星；撒花留到最后关弹窗时，在刚点亮的这颗周围放 */
      const nextK = ctx.nextStar();
      if (nextK) box.appendChild(button("下一颗：" + nextK.name + " →", true, () => ctx.onNext(nextK)));
      box.appendChild(button("完成", !nextK, close));
    } else {
      box.innerHTML =
        '<h2 id="k-modal-title">答对 ' + (total - nWrong) + " / " + total + " 题</h2>" +
        '<p class="kq-note">第 ' + run.wrong.map(i => i + 1).join("、") +
        " 题答错了，已记进错题本。需要全对才能点亮——再来一次！</p>";
      box.appendChild(button("再来一次", true, () => startRun(run.items)));
      box.appendChild(button("回到详情", false, renderDetail));
      const links = learnLinks();
      if (links.childNodes.length) {
        links.insertBefore(document.createTextNode("没把握的话先去补一补："), links.firstChild);
        box.appendChild(links);
      }
    }
    panel.appendChild(box);
  }

  function renderReviewResult() {
    const total = run.items.length;
    const nRight = total - run.wrong.length;
    const res = ctx.summarize({ total: total, right: nRight, items: run.items, wrong: run.wrong });
    panel.textContent = "";
    const box = document.createElement("div");
    box.className = "kq-result";
    box.innerHTML = '<h2 id="k-modal-title">' + ctx.review + "完成：答对 " + nRight + " / " + total + "</h2>";
    const note = document.createElement("p");
    note.className = "kq-note";
    note.textContent = res.note;
    box.appendChild(note);
    if (res.more) box.appendChild(button("继续复习", true, ctx.onMore));
    box.appendChild(button("完成", !res.more, close));
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

  /* 当前弹窗里的知识点 id，没开为 null；app.js 等题库到了用它判断要不要原地刷新 */
  function currentId() {
    return ctx && ctx.k ? ctx.k.id : null; /* 错题复习不属于某一颗星，没有 k */
  }

  window.Quiz = { open: open, review: review, close: close, currentId: currentId };
})();
