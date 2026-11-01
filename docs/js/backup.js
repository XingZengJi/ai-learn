/* 进度备份：把浏览器里的全部记录（两个版本的点亮、测验通过、错题本、温习、成就）存成一个 JSON 文件，
 * 换设备或浏览器数据被清掉后再导回来。分享链接只带得走点亮了哪些星，这个文件什么都带得走。
 * 导入只合并不覆盖：本机已有的记录一条都不会少，和「存为我的星图」一样只加不减。
 * 这里只管文件格式与合并规则，不碰页面；读写 localStorage 由 app.js 传进来 */
(function () {
  "use strict";

  const APP = "cc-learning-map";
  const VERSION = 1;
  const DATE = /^\d{4}-\d{2}-\d{2}$/;
  const isDate = v => typeof v === "string" && DATE.test(v);

  /* 每类记录：键名前缀、条目 id 的格式、值的格式、两边都有时怎么合 */
  const KINDS = {
    "cc-map-preview": {
      id: /^(knowledge:k\d{4}|projects:p\d+)$/,
      ok: v => v === true || isDate(v),
      /* 行星的值是完成日期，星星是 true；本机只有 true 而备份里有日期时补上日期 */
      merge: (a, b) => (a === true && isDate(b) ? b : a)
    },
    "cc-map-quiz-passed": { id: /^k\d{4}$/, ok: isDate, merge: (a, b) => (b > a ? b : a) },   /* 取较晚的通过日期 */
    "cc-map-reviewed": { id: /^k\d{4}$/, ok: isDate, merge: (a, b) => (b > a ? b : a) },      /* 取较晚的温习日期 */
    "cc-map-achieved": { id: /^[a-z0-9-]+$/, ok: isDate, merge: (a, b) => (b < a ? b : a) },  /* 成就记最早拿到的那天 */
    "cc-map-wrong": {
      id: /^k\d{4}$/,
      ok: v => Array.isArray(v) && v.length > 0 && v.every(i => Number.isInteger(i) && i >= 0),
      merge: (a, b) => [...new Set(a.concat(b))].sort((x, y) => x - y)                        /* 两边的错题都留着 */
    }
  };

  /* 只留格式对的条目：备份文件可能被手改过，坏条目丢掉，好的照常用 */
  function clean(kind, obj) {
    const out = {};
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return out;
    Object.keys(obj).forEach(id => {
      if (kind.id.test(id) && kind.ok(obj[id])) out[id] = obj[id];
    });
    return out;
  }

  function readAll(suffixes, get) {
    const data = {};
    suffixes.forEach(sfx => {
      Object.keys(KINDS).forEach(name => {
        let v = null;
        try { v = JSON.parse(get(name + sfx)); } catch (e) { /* 坏的就当没有 */ }
        const c = clean(KINDS[name], v);
        if (Object.keys(c).length) data[name + sfx] = c;
      });
    });
    return data;
  }

  /* 生成备份文件的文字内容；本机什么记录都没有时返回 null */
  function make(suffixes, get, today) {
    const data = readAll(suffixes, get);
    if (!Object.keys(data).length) return null;
    return JSON.stringify({ app: APP, version: VERSION, exportedAt: today, data: data }, null, 2);
  }

  /* 解析备份文件；不是这个网站的备份就抛错（错误信息直接给访客看） */
  function parse(text) {
    let f;
    try { f = JSON.parse(text); } catch (e) { throw new Error("这个文件不是成就地图的备份（读不出内容）"); }
    if (!f || f.app !== APP || typeof f.data !== "object" || !f.data) throw new Error("这个文件不是成就地图的备份");
    if (f.version > VERSION) throw new Error("这份备份来自更新版本的网站，请刷新页面后再试");
    return f;
  }

  /* 把备份合并进本机。返回每个版本新增了多少：{ "": { stars, projects, other }, ":openai": {...} } */
  function merge(file, suffixes, get, set) {
    const added = {};
    suffixes.forEach(sfx => {
      const n = { stars: 0, projects: 0, other: 0 };
      Object.keys(KINDS).forEach(name => {
        const kind = KINDS[name];
        const incoming = clean(kind, file.data[name + sfx]);
        if (!Object.keys(incoming).length) return;
        let cur = {};
        try { cur = clean(kind, JSON.parse(get(name + sfx))); } catch (e) { /* 本机这份坏了就从空的开始 */ }
        let changed = false;
        Object.keys(incoming).forEach(id => {
          if (!(id in cur)) {
            cur[id] = incoming[id];
            changed = true;
            if (name === "cc-map-preview") n[id.startsWith("projects:") ? "projects" : "stars"]++;
            else n.other++;
            return;
          }
          const m = kind.merge(cur[id], incoming[id]);
          if (JSON.stringify(m) !== JSON.stringify(cur[id])) { cur[id] = m; changed = true; n.other++; }
        });
        if (changed) set(name + sfx, JSON.stringify(cur));
      });
      added[sfx] = n;
    });
    return added;
  }

  window.Backup = { make: make, parse: parse, merge: merge };
})();
