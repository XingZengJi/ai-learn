/* 分享我的星图：点亮记录 ⇄ 链接编码、分享弹窗（复制链接 / 生成图片）。
 * 不需要后台：进度编码在网址 # 后面，这部分不会发给任何服务器。 */
(function () {
  "use strict";

  /* ---------- 编码 ----------
   * 知识点 id 恒为 k + 课程两位 + 序号两位（check-data.py 校验，且序号的两位就是课程 id 的数字），
   * 所以按「课程号 → 序号位图」编码：k0203 = 第 2 门课的第 3 位。
   * 新增知识点只是多一个位，旧链接照样能解；只有删除或重新编号已有知识点才会让旧链接对不上。
   * 格式：版本号 "1"，后面每门课一段「课程号-位图」，都用 36 进制，段之间用 "."
   *   例：1.1-6.2-18  →  k0101、k0102 + k0202、k0203、k0205（6 = 2¹+2²，"18" = 44 = 2²+2³+2⁵） */
  const VERSION = "1";
  const MAX_SEQ = 52; /* 位图用 Number 的整数精度存，2^53 以内都精确 */

  function encode(kids) {
    const masks = {};
    kids.forEach(kid => {
      const m = /^k(\d{2})(\d{2})$/.exec(kid);
      if (!m) return;
      const c = +m[1], seq = +m[2];
      if (seq > MAX_SEQ) return;
      masks[c] = (masks[c] || 0) + Math.pow(2, seq);
    });
    const parts = Object.keys(masks).map(Number).sort((a, b) => a - b)
      .map(c => c.toString(36) + "-" + masks[c].toString(36));
    return [VERSION].concat(parts).join(".");
  }

  /* 返回知识点 id 数组；格式不对返回 null。只解码，不判断 id 是否存在（交给调用方按当前数据过滤） */
  function decode(code) {
    const parts = String(code || "").split(".");
    if (parts[0] !== VERSION) return null;
    const kids = [];
    for (let i = 1; i < parts.length; i++) {
      const m = /^([0-9a-z]{1,2})-([0-9a-z]{1,11})$/.exec(parts[i]);
      if (!m) return null;
      const c = parseInt(m[1], 36);
      let mask = parseInt(m[2], 36);
      for (let seq = 0; mask > 0 && seq <= MAX_SEQ; seq++) {
        if (mask % 2 === 1) kids.push("k" + String(c).padStart(2, "0") + String(seq).padStart(2, "0"));
        mask = Math.floor(mask / 2);
      }
    }
    return kids;
  }

  /* 读网址 # 后面：#author → 作者的星图；#s=<编码>&n=<昵称> → 别人分享的星图；其余 → 我的星图 */
  function parseHash(hash) {
    const h = String(hash || "").replace(/^#/, "");
    if (h === "author") return { type: "author" };
    if (!h.startsWith("s=")) return { type: "mine" };
    const params = new URLSearchParams(h);
    const kids = decode(params.get("s"));
    if (!kids) return { type: "invalid" };
    return { type: "shared", kids: kids, name: (params.get("n") || "").slice(0, 20) };
  }

  function buildLink(provider, kids, name) {
    const base = location.origin + location.pathname;
    /* 厂商必须写进链接：打开者浏览器里记忆的厂商可能和分享者不同 */
    let hash = "#s=" + encode(kids);
    if (name) hash += "&n=" + encodeURIComponent(name);
    return base + "?v=" + provider + hash;
  }

  /* ---------- 分享弹窗 ---------- */
  const NAME_KEY = "cc-map-nickname";
  let modal, ctx;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function initModal() {
    modal = document.getElementById("share-modal");
    const close = () => { modal.hidden = true; document.body.style.overflow = ""; };
    modal.querySelector(".k-modal-close").addEventListener("click", close);
    modal.querySelector(".k-modal-backdrop").addEventListener("click", close);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) close(); });
  }

  /* options: { provider, kids, stats: { stars, totalStars, courses, totalCourses }, siteTitle, eyebrow, svg } */
  function open(options) {
    if (!modal) initModal();
    ctx = options;
    const body = modal.querySelector(".k-modal-body");
    body.textContent = "";

    const head = el("div", "kd-head");
    const h2 = el("h2", null, "分享我的星图");
    h2.id = "share-modal-title";
    head.appendChild(h2);
    head.appendChild(el("p", "kd-status done",
      "已点亮 " + ctx.stats.stars + " / " + ctx.stats.totalStars + " 颗星 · " +
      ctx.stats.courses + " / " + ctx.stats.totalCourses + " 门课全座点亮"));
    body.appendChild(head);

    const nameRow = el("label", "sh-field");
    nameRow.appendChild(el("span", "sh-label", "显示的名字"));
    const nameInput = el("input", "sh-input");
    nameInput.type = "text";
    nameInput.maxLength = 20;
    nameInput.placeholder = "一位学习者";
    try { nameInput.value = localStorage.getItem(NAME_KEY) || ""; } catch (e) { /* 存储不可用就留空 */ }
    nameRow.appendChild(nameInput);
    body.appendChild(nameRow);

    const linkRow = el("label", "sh-field");
    linkRow.appendChild(el("span", "sh-label", "分享链接"));
    const linkInput = el("input", "sh-input mono");
    linkInput.type = "text";
    linkInput.readOnly = true;
    linkRow.appendChild(linkInput);
    body.appendChild(linkRow);

    const actions = el("div", "sh-actions");
    const copyBtn = el("button", "kd-btn primary", "复制链接");
    copyBtn.type = "button";
    const imgBtn = el("button", "kd-btn", "生成图片");
    imgBtn.type = "button";
    actions.appendChild(copyBtn);
    actions.appendChild(imgBtn);
    body.appendChild(actions);

    const note = el("p", "kd-hint sh-note", "打开链接的人看到的是你现在的星图；他们答题点亮的只会记在自己的星图上。");
    body.appendChild(note);
    const imgArea = el("div", "sh-image");
    body.appendChild(imgArea);

    const name = () => nameInput.value.trim();
    const refresh = () => { linkInput.value = buildLink(ctx.provider, ctx.kids, name()); };
    nameInput.addEventListener("input", () => {
      try { localStorage.setItem(NAME_KEY, name()); } catch (e) { /* 忽略 */ }
      refresh();
      imgArea.textContent = ""; /* 名字变了，旧图作废 */
    });
    refresh();

    copyBtn.addEventListener("click", () => {
      const done = ok => { note.textContent = ok ? "✓ 链接已复制，去粘贴吧" : "复制没成功，请长按上面的链接手动复制"; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkInput.value).then(() => done(true), () => fallbackCopy(linkInput, done));
      } else {
        fallbackCopy(linkInput, done);
      }
    });
    imgBtn.addEventListener("click", () => {
      imgArea.textContent = "";
      imgArea.appendChild(el("p", "kd-hint", "正在生成…"));
      makeImage(name() || "一位学习者").then(url => {
        imgArea.textContent = "";
        const img = el("img");
        img.src = url;
        img.alt = "我的星图";
        imgArea.appendChild(img);
        imgArea.appendChild(el("p", "kd-hint", "手机：长按图片保存；电脑：点下面的按钮下载"));
        const dl = el("a", "kd-btn", "下载图片");
        dl.href = url;
        dl.download = "我的星图.png";
        imgArea.appendChild(dl);
      }).catch(() => {
        imgArea.textContent = "";
        imgArea.appendChild(el("p", "kd-hint", "这个浏览器生成不了图片，可以直接截图星图分享。"));
      });
    });

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    nameInput.focus();
  }

  function fallbackCopy(input, done) {
    try {
      input.select();
      done(document.execCommand("copy"));
    } catch (e) { done(false); }
  }

  /* ---------- 生成图片：把当前星图 SVG 画到画布上，配上标题和网址 ---------- */
  const FONT = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
  const MONO = 'ui-monospace, "SF Mono", Consolas, monospace';
  /* SVG 单独画成图片时读不到页面样式表，星图用到的几个 class 在这里内联一份 */
  const SVG_STYLE =
    ".region-label{font-family:" + MONO + ";font-size:12px;letter-spacing:.3em;fill:#5d6880}" +
    ".course-label{font-family:" + FONT + ";font-size:13px;fill:#9aa5bd}" +
    ".course-label.done{fill:#e9edf6;font-weight:600}" +
    ".course-count{font-family:" + MONO + ";font-size:11px;fill:#5d6880}";

  function svgToImage(svg) {
    const clone = svg.cloneNode(true);
    const [, , vw, vh] = clone.getAttribute("viewBox").split(" ").map(Number);
    /* 不要手动 setAttribute("xmlns")：XMLSerializer 会自动带上命名空间，再加一个就成了重复属性，图片直接加载失败 */
    clone.setAttribute("width", vw);
    clone.setAttribute("height", vh);
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = SVG_STYLE;
    clone.insertBefore(style, clone.firstChild);
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve({ img: img, w: vw, h: vh }); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("svg load failed")); };
      img.src = url;
    });
  }

  function makeImage(name) {
    return svgToImage(ctx.svg).then(({ img, w, h }) => {
      const W = 1080, PAD = 64;
      const mapW = W - 40, mapH = Math.round(h * mapW / w);
      const TOP = 300, H = TOP + mapH + 150;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const g = canvas.getContext("2d");
      if (!g) throw new Error("no canvas");

      g.fillStyle = "#0a0e1a";
      g.fillRect(0, 0, W, H);
      const glow = g.createRadialGradient(W / 2, -60, 40, W / 2, -60, 760);
      glow.addColorStop(0, "#1a2442");
      glow.addColorStop(1, "rgba(10,14,26,0)");
      g.fillStyle = glow;
      g.fillRect(0, 0, W, 700);

      g.textBaseline = "alphabetic";
      g.fillStyle = "#9aa5bd";
      g.font = "26px " + MONO;
      g.fillText(ctx.eyebrow, PAD, 96);
      g.fillStyle = "#e9edf6";
      g.font = "bold 64px " + FONT;
      g.fillText(name + " 的星图", PAD, 180);
      g.fillStyle = "#c3cbdd";
      g.font = "32px " + FONT;
      g.fillText("已点亮 " + ctx.stats.stars + " / " + ctx.stats.totalStars + " 颗星  ·  " +
        ctx.stats.courses + " / " + ctx.stats.totalCourses + " 门课全座点亮", PAD, 240);

      g.drawImage(img, 20, TOP, mapW, mapH);

      g.fillStyle = "#e9edf6";
      g.font = "bold 32px " + FONT;
      g.fillText(ctx.siteTitle + " · 答对测验，点亮星星", PAD, H - 82);
      g.fillStyle = "#5d6880";
      g.font = "26px " + MONO;
      g.fillText(location.host + location.pathname.replace(/\/$/, ""), PAD, H - 40);

      return canvas.toDataURL("image/png");
    });
  }

  window.Share = { encode: encode, decode: decode, parseHash: parseHash, buildLink: buildLink, open: open };
})();
