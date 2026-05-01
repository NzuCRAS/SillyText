const j = "sillytavern-pretext-render", we = Object.freeze({
  enabled: !0,
  virtualScroll: {
    enabled: !0,
    threshold: 200,
    overscanPx: 800
  },
  streamStabilizer: {
    enabled: !0
  },
  typography: {
    enabled: !0,
    foldThresholdLines: 15,
    rewriteWrap: !1
  },
  debug: {
    overlay: !1,
    log: !1
  }
});
function ie(e) {
  if (e === null || typeof e != "object") return e;
  if (Array.isArray(e)) return e.map(ie);
  const t = {};
  for (const n of Object.keys(e)) t[n] = ie(e[n]);
  return t;
}
function pt(e, t) {
  for (const n of Object.keys(t)) {
    const r = t[n];
    r && typeof r == "object" && !Array.isArray(r) ? ((!e[n] || typeof e[n] != "object") && (e[n] = {}), pt(e[n], r)) : e[n] = r;
  }
  return e;
}
function Jt(e) {
  const t = e.extensionSettings || e.extension_settings;
  if (!t) return ie(we);
  t[j] || (t[j] = ie(we));
  const n = pt(ie(we), t[j]);
  return t[j] = n, n;
}
function Ct(e) {
  const t = e.saveSettingsDebounced;
  typeof t == "function" && t();
}
const Qt = `<div class="pretext-render-settings">
  <div class="inline-drawer">
    <div class="inline-drawer-toggle inline-drawer-header">
      <b>Pretext Render Optimizer</b>
      <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>
    <div class="inline-drawer-content">
      <p class="pretext-hint">
        基于 <a href="https://github.com/chenglou/pretext" target="_blank" rel="noopener">@chenglou/pretext</a>
        的前端显示优化套件：长聊天虚拟滚动、流式抗抖动、多语言排版优化。
      </p>

      <label class="checkbox_label">
        <input type="checkbox" id="pretext_enabled" />
        <span>启用插件</span>
      </label>

      <hr />

      <h4>虚拟滚动</h4>
      <label class="checkbox_label">
        <input type="checkbox" id="pretext_vs_enabled" />
        <span>启用虚拟滚动（视口外消息以占位符代替）</span>
      </label>
      <label class="pretext-row">
        <span>消息阈值（≥ 多少条才启用）</span>
        <input type="number" id="pretext_vs_threshold" min="20" max="5000" step="10" class="text_pole" />
      </label>
      <label class="pretext-row">
        <span>视口缓冲（px，越大越平滑越费内存）</span>
        <input type="number" id="pretext_vs_overscan" min="0" max="4000" step="100" class="text_pole" />
      </label>

      <hr />

      <h4>流式抗抖动</h4>
      <label class="checkbox_label">
        <input type="checkbox" id="pretext_ss_enabled" />
        <span>流式输出时预测高度，避免气泡跳动</span>
      </label>

      <hr />

      <h4>排版优化</h4>
      <label class="checkbox_label">
        <input type="checkbox" id="pretext_ty_enabled" />
        <span>启用排版优化（更整洁的中英混排换行 + 长消息折叠）</span>
      </label>
      <label class="pretext-row">
        <span>折叠阈值（行数）</span>
        <input type="number" id="pretext_ty_fold" min="5" max="200" step="1" class="text_pole" />
      </label>

      <hr />

      <h4>调试</h4>
      <label class="checkbox_label">
        <input type="checkbox" id="pretext_debug_log" />
        <span>在控制台打印调试日志</span>
      </label>
      <label class="checkbox_label">
        <input type="checkbox" id="pretext_debug_overlay" />
        <span>在每条消息右上显示测量值（开发用）</span>
      </label>
    </div>
  </div>
</div>
`;
let Re = !1, Ue = null;
function gt(e, t, n) {
  if (Re) return;
  Ue = n;
  const r = document.getElementById("extensions_settings2") || document.getElementById("extensions_settings");
  if (!r) {
    const x = new MutationObserver(() => {
      (document.getElementById("extensions_settings2") || document.getElementById("extensions_settings")) && (x.disconnect(), gt(e, t, n));
    });
    x.observe(document.body, { childList: !0, subtree: !0 });
    return;
  }
  const i = document.createElement("div");
  i.id = `${j}-settings`, i.innerHTML = Qt, r.appendChild(i), Re = !0, Vt(i, e, t);
}
function Yt() {
  document.getElementById(`${j}-settings`)?.remove(), Re = !1, Ue = null;
}
function Vt(e, t, n) {
  const r = (l) => e.querySelector(`#${l}`);
  r("pretext_enabled").checked = n.enabled, r("pretext_vs_enabled").checked = n.virtualScroll.enabled, r("pretext_vs_threshold").value = n.virtualScroll.threshold, r("pretext_vs_overscan").value = n.virtualScroll.overscanPx, r("pretext_ss_enabled").checked = n.streamStabilizer.enabled, r("pretext_ty_enabled").checked = n.typography.enabled, r("pretext_ty_fold").value = n.typography.foldThresholdLines, r("pretext_debug_log").checked = n.debug.log, r("pretext_debug_overlay").checked = n.debug.overlay;
  const i = (l, u) => r(l).addEventListener("change", (c) => {
    rt(n, u, c.target.checked), xt(t);
  }), x = (l, u, c, s) => r(l).addEventListener("change", (o) => {
    let a = parseInt(o.target.value, 10);
    Number.isFinite(a) || (a = Xt(n, u)), a = Math.max(c, Math.min(s, a)), o.target.value = String(a), rt(n, u, a), xt(t);
  });
  i("pretext_enabled", ["enabled"]), i("pretext_vs_enabled", ["virtualScroll", "enabled"]), x("pretext_vs_threshold", ["virtualScroll", "threshold"], 20, 5e3), x("pretext_vs_overscan", ["virtualScroll", "overscanPx"], 0, 4e3), i("pretext_ss_enabled", ["streamStabilizer", "enabled"]), i("pretext_ty_enabled", ["typography", "enabled"]), x("pretext_ty_fold", ["typography", "foldThresholdLines"], 5, 200), i("pretext_debug_log", ["debug", "log"]), i("pretext_debug_overlay", ["debug", "overlay"]);
}
function xt(e) {
  Ct(e), Ue?.();
}
function rt(e, t, n) {
  let r = e;
  for (let i = 0; i < t.length - 1; i++) r = r[t[i]];
  r[t[t.length - 1]] = n;
}
function Xt(e, t) {
  let n = e;
  for (let r = 0; r < t.length; r++) n = n?.[t[r]];
  return n;
}
const Zt = {
  appReady: ["APP_READY", "app_ready"],
  chatChanged: ["CHAT_CHANGED", "chat_changed"],
  characterMessageRendered: [
    "CHARACTER_MESSAGE_RENDERED",
    "character_message_rendered"
  ],
  userMessageRendered: ["USER_MESSAGE_RENDERED", "user_message_rendered"],
  messageEdited: ["MESSAGE_EDITED", "message_edited"],
  messageDeleted: ["MESSAGE_DELETED", "message_deleted"],
  messageSwiped: ["MESSAGE_SWIPED", "message_swiped"],
  generationStarted: ["GENERATION_STARTED", "generation_started"],
  generationStopped: ["GENERATION_STOPPED", "generation_stopped"],
  generationEnded: ["GENERATION_ENDED", "generation_ended"],
  streamTokenReceived: [
    "STREAM_TOKEN_RECEIVED",
    "stream_token_received",
    "SMOOTH_STREAM_TOKEN_RECEIVED"
  ],
  settingsUpdated: ["SETTINGS_UPDATED", "settings_updated"]
};
function e0(e) {
  const t = {};
  for (const [n, r] of Object.entries(Zt))
    t[n] = r.find((i) => e && i in e) || null;
  return t;
}
function t0(e, t) {
  const n = e0(t), r = [];
  function i(l, u) {
    const c = n[l];
    if (!c) return !1;
    const s = t[c];
    return e.on(s, u), r.push({ realName: s, handler: u }), !0;
  }
  function x() {
    for (const { realName: l, handler: u } of r)
      try {
        e.removeListener?.(l, u);
      } catch {
      }
    r.length = 0;
  }
  return { on: i, offAll: x, resolved: n };
}
const n0 = ["system-ui", "-apple-system", "BlinkMacSystemFont"];
let re = null, it = null;
function qe(e = "#chat .mes_text", t = !1) {
  if (!t && re && it === e)
    return re;
  it = e;
  const n = document.querySelector(e);
  return n ? (re = st(n), re) : st(document.body);
}
function Te() {
  re = null;
}
function Je(e) {
  return e ? n0.some((t) => e.includes(t)) : !0;
}
function st(e) {
  const t = getComputedStyle(e), n = t.fontWeight || "400", r = t.fontSize || "16px", i = (t.fontFamily || "sans-serif").split(",")[0].trim().replace(/^['"]|['"]$/g, "") || "sans-serif";
  return `${n} ${r} "${i}"`;
}
function Qe(e) {
  if (!e) return 0;
  const t = getComputedStyle(e), n = e.clientWidth - parseFloat(t.paddingLeft || "0") - parseFloat(t.paddingRight || "0");
  return Math.max(0, n);
}
function Mt(e) {
  if (!e) return 22;
  const t = getComputedStyle(e), n = t.lineHeight;
  if (n === "normal")
    return parseFloat(t.fontSize || "16") * 1.4;
  const r = parseFloat(n);
  return Number.isFinite(r) && r > 0 ? r : 22;
}
const x0 = [
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "S",
  "B",
  "S",
  "WS",
  "B",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "B",
  "B",
  "B",
  "S",
  "WS",
  "ON",
  "ON",
  "ET",
  "ET",
  "ET",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ES",
  "CS",
  "ES",
  "CS",
  "CS",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "CS",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "ON",
  "ON",
  "ON",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "B",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "CS",
  "ON",
  "ET",
  "ET",
  "ET",
  "ET",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "ON",
  "ON",
  "BN",
  "ON",
  "ON",
  "ET",
  "ET",
  "EN",
  "EN",
  "ON",
  "L",
  "ON",
  "ON",
  "ON",
  "EN",
  "L",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L"
], ot = [
  [697, 698, "ON"],
  [706, 719, "ON"],
  [722, 735, "ON"],
  [741, 749, "ON"],
  [751, 767, "ON"],
  [768, 879, "NSM"],
  [884, 885, "ON"],
  [894, 894, "ON"],
  [900, 901, "ON"],
  [903, 903, "ON"],
  [1014, 1014, "ON"],
  [1155, 1161, "NSM"],
  [1418, 1418, "ON"],
  [1421, 1422, "ON"],
  [1423, 1423, "ET"],
  [1424, 1424, "R"],
  [1425, 1469, "NSM"],
  [1470, 1470, "R"],
  [1471, 1471, "NSM"],
  [1472, 1472, "R"],
  [1473, 1474, "NSM"],
  [1475, 1475, "R"],
  [1476, 1477, "NSM"],
  [1478, 1478, "R"],
  [1479, 1479, "NSM"],
  [1480, 1535, "R"],
  [1536, 1541, "AN"],
  [1542, 1543, "ON"],
  [1544, 1544, "AL"],
  [1545, 1546, "ET"],
  [1547, 1547, "AL"],
  [1548, 1548, "CS"],
  [1549, 1549, "AL"],
  [1550, 1551, "ON"],
  [1552, 1562, "NSM"],
  [1563, 1610, "AL"],
  [1611, 1631, "NSM"],
  [1632, 1641, "AN"],
  [1642, 1642, "ET"],
  [1643, 1644, "AN"],
  [1645, 1647, "AL"],
  [1648, 1648, "NSM"],
  [1649, 1749, "AL"],
  [1750, 1756, "NSM"],
  [1757, 1757, "AN"],
  [1758, 1758, "ON"],
  [1759, 1764, "NSM"],
  [1765, 1766, "AL"],
  [1767, 1768, "NSM"],
  [1769, 1769, "ON"],
  [1770, 1773, "NSM"],
  [1774, 1775, "AL"],
  [1776, 1785, "EN"],
  [1786, 1808, "AL"],
  [1809, 1809, "NSM"],
  [1810, 1839, "AL"],
  [1840, 1866, "NSM"],
  [1867, 1957, "AL"],
  [1958, 1968, "NSM"],
  [1969, 1983, "AL"],
  [1984, 2026, "R"],
  [2027, 2035, "NSM"],
  [2036, 2037, "R"],
  [2038, 2041, "ON"],
  [2042, 2044, "R"],
  [2045, 2045, "NSM"],
  [2046, 2069, "R"],
  [2070, 2073, "NSM"],
  [2074, 2074, "R"],
  [2075, 2083, "NSM"],
  [2084, 2084, "R"],
  [2085, 2087, "NSM"],
  [2088, 2088, "R"],
  [2089, 2093, "NSM"],
  [2094, 2136, "R"],
  [2137, 2139, "NSM"],
  [2140, 2143, "R"],
  [2144, 2191, "AL"],
  [2192, 2193, "AN"],
  [2194, 2198, "AL"],
  [2199, 2207, "NSM"],
  [2208, 2249, "AL"],
  [2250, 2273, "NSM"],
  [2274, 2274, "AN"],
  [2275, 2306, "NSM"],
  [2362, 2362, "NSM"],
  [2364, 2364, "NSM"],
  [2369, 2376, "NSM"],
  [2381, 2381, "NSM"],
  [2385, 2391, "NSM"],
  [2402, 2403, "NSM"],
  [2433, 2433, "NSM"],
  [2492, 2492, "NSM"],
  [2497, 2500, "NSM"],
  [2509, 2509, "NSM"],
  [2530, 2531, "NSM"],
  [2546, 2547, "ET"],
  [2555, 2555, "ET"],
  [2558, 2558, "NSM"],
  [2561, 2562, "NSM"],
  [2620, 2620, "NSM"],
  [2625, 2626, "NSM"],
  [2631, 2632, "NSM"],
  [2635, 2637, "NSM"],
  [2641, 2641, "NSM"],
  [2672, 2673, "NSM"],
  [2677, 2677, "NSM"],
  [2689, 2690, "NSM"],
  [2748, 2748, "NSM"],
  [2753, 2757, "NSM"],
  [2759, 2760, "NSM"],
  [2765, 2765, "NSM"],
  [2786, 2787, "NSM"],
  [2801, 2801, "ET"],
  [2810, 2815, "NSM"],
  [2817, 2817, "NSM"],
  [2876, 2876, "NSM"],
  [2879, 2879, "NSM"],
  [2881, 2884, "NSM"],
  [2893, 2893, "NSM"],
  [2901, 2902, "NSM"],
  [2914, 2915, "NSM"],
  [2946, 2946, "NSM"],
  [3008, 3008, "NSM"],
  [3021, 3021, "NSM"],
  [3059, 3064, "ON"],
  [3065, 3065, "ET"],
  [3066, 3066, "ON"],
  [3072, 3072, "NSM"],
  [3076, 3076, "NSM"],
  [3132, 3132, "NSM"],
  [3134, 3136, "NSM"],
  [3142, 3144, "NSM"],
  [3146, 3149, "NSM"],
  [3157, 3158, "NSM"],
  [3170, 3171, "NSM"],
  [3192, 3198, "ON"],
  [3201, 3201, "NSM"],
  [3260, 3260, "NSM"],
  [3276, 3277, "NSM"],
  [3298, 3299, "NSM"],
  [3328, 3329, "NSM"],
  [3387, 3388, "NSM"],
  [3393, 3396, "NSM"],
  [3405, 3405, "NSM"],
  [3426, 3427, "NSM"],
  [3457, 3457, "NSM"],
  [3530, 3530, "NSM"],
  [3538, 3540, "NSM"],
  [3542, 3542, "NSM"],
  [3633, 3633, "NSM"],
  [3636, 3642, "NSM"],
  [3647, 3647, "ET"],
  [3655, 3662, "NSM"],
  [3761, 3761, "NSM"],
  [3764, 3772, "NSM"],
  [3784, 3790, "NSM"],
  [3864, 3865, "NSM"],
  [3893, 3893, "NSM"],
  [3895, 3895, "NSM"],
  [3897, 3897, "NSM"],
  [3898, 3901, "ON"],
  [3953, 3966, "NSM"],
  [3968, 3972, "NSM"],
  [3974, 3975, "NSM"],
  [3981, 3991, "NSM"],
  [3993, 4028, "NSM"],
  [4038, 4038, "NSM"],
  [4141, 4144, "NSM"],
  [4146, 4151, "NSM"],
  [4153, 4154, "NSM"],
  [4157, 4158, "NSM"],
  [4184, 4185, "NSM"],
  [4190, 4192, "NSM"],
  [4209, 4212, "NSM"],
  [4226, 4226, "NSM"],
  [4229, 4230, "NSM"],
  [4237, 4237, "NSM"],
  [4253, 4253, "NSM"],
  [4957, 4959, "NSM"],
  [5008, 5017, "ON"],
  [5120, 5120, "ON"],
  [5760, 5760, "WS"],
  [5787, 5788, "ON"],
  [5906, 5908, "NSM"],
  [5938, 5939, "NSM"],
  [5970, 5971, "NSM"],
  [6002, 6003, "NSM"],
  [6068, 6069, "NSM"],
  [6071, 6077, "NSM"],
  [6086, 6086, "NSM"],
  [6089, 6099, "NSM"],
  [6107, 6107, "ET"],
  [6109, 6109, "NSM"],
  [6128, 6137, "ON"],
  [6144, 6154, "ON"],
  [6155, 6157, "NSM"],
  [6158, 6158, "BN"],
  [6159, 6159, "NSM"],
  [6277, 6278, "NSM"],
  [6313, 6313, "NSM"],
  [6432, 6434, "NSM"],
  [6439, 6440, "NSM"],
  [6450, 6450, "NSM"],
  [6457, 6459, "NSM"],
  [6464, 6464, "ON"],
  [6468, 6469, "ON"],
  [6622, 6655, "ON"],
  [6679, 6680, "NSM"],
  [6683, 6683, "NSM"],
  [6742, 6742, "NSM"],
  [6744, 6750, "NSM"],
  [6752, 6752, "NSM"],
  [6754, 6754, "NSM"],
  [6757, 6764, "NSM"],
  [6771, 6780, "NSM"],
  [6783, 6783, "NSM"],
  [6832, 6877, "NSM"],
  [6880, 6891, "NSM"],
  [6912, 6915, "NSM"],
  [6964, 6964, "NSM"],
  [6966, 6970, "NSM"],
  [6972, 6972, "NSM"],
  [6978, 6978, "NSM"],
  [7019, 7027, "NSM"],
  [7040, 7041, "NSM"],
  [7074, 7077, "NSM"],
  [7080, 7081, "NSM"],
  [7083, 7085, "NSM"],
  [7142, 7142, "NSM"],
  [7144, 7145, "NSM"],
  [7149, 7149, "NSM"],
  [7151, 7153, "NSM"],
  [7212, 7219, "NSM"],
  [7222, 7223, "NSM"],
  [7376, 7378, "NSM"],
  [7380, 7392, "NSM"],
  [7394, 7400, "NSM"],
  [7405, 7405, "NSM"],
  [7412, 7412, "NSM"],
  [7416, 7417, "NSM"],
  [7616, 7679, "NSM"],
  [8125, 8125, "ON"],
  [8127, 8129, "ON"],
  [8141, 8143, "ON"],
  [8157, 8159, "ON"],
  [8173, 8175, "ON"],
  [8189, 8190, "ON"],
  [8192, 8202, "WS"],
  [8203, 8205, "BN"],
  [8207, 8207, "R"],
  [8208, 8231, "ON"],
  [8232, 8232, "WS"],
  [8233, 8233, "B"],
  [8234, 8238, "BN"],
  [8239, 8239, "CS"],
  [8240, 8244, "ET"],
  [8245, 8259, "ON"],
  [8260, 8260, "CS"],
  [8261, 8286, "ON"],
  [8287, 8287, "WS"],
  [8288, 8303, "BN"],
  [8304, 8304, "EN"],
  [8308, 8313, "EN"],
  [8314, 8315, "ES"],
  [8316, 8318, "ON"],
  [8320, 8329, "EN"],
  [8330, 8331, "ES"],
  [8332, 8334, "ON"],
  [8352, 8399, "ET"],
  [8400, 8432, "NSM"],
  [8448, 8449, "ON"],
  [8451, 8454, "ON"],
  [8456, 8457, "ON"],
  [8468, 8468, "ON"],
  [8470, 8472, "ON"],
  [8478, 8483, "ON"],
  [8485, 8485, "ON"],
  [8487, 8487, "ON"],
  [8489, 8489, "ON"],
  [8494, 8494, "ET"],
  [8506, 8507, "ON"],
  [8512, 8516, "ON"],
  [8522, 8525, "ON"],
  [8528, 8543, "ON"],
  [8585, 8587, "ON"],
  [8592, 8721, "ON"],
  [8722, 8722, "ES"],
  [8723, 8723, "ET"],
  [8724, 9013, "ON"],
  [9083, 9108, "ON"],
  [9110, 9257, "ON"],
  [9280, 9290, "ON"],
  [9312, 9351, "ON"],
  [9352, 9371, "EN"],
  [9450, 9899, "ON"],
  [9901, 10239, "ON"],
  [10496, 11123, "ON"],
  [11126, 11263, "ON"],
  [11493, 11498, "ON"],
  [11503, 11505, "NSM"],
  [11513, 11519, "ON"],
  [11647, 11647, "NSM"],
  [11744, 11775, "NSM"],
  [11776, 11869, "ON"],
  [11904, 11929, "ON"],
  [11931, 12019, "ON"],
  [12032, 12245, "ON"],
  [12272, 12287, "ON"],
  [12288, 12288, "WS"],
  [12289, 12292, "ON"],
  [12296, 12320, "ON"],
  [12330, 12333, "NSM"],
  [12336, 12336, "ON"],
  [12342, 12343, "ON"],
  [12349, 12351, "ON"],
  [12441, 12442, "NSM"],
  [12443, 12444, "ON"],
  [12448, 12448, "ON"],
  [12539, 12539, "ON"],
  [12736, 12773, "ON"],
  [12783, 12783, "ON"],
  [12829, 12830, "ON"],
  [12880, 12895, "ON"],
  [12924, 12926, "ON"],
  [12977, 12991, "ON"],
  [13004, 13007, "ON"],
  [13175, 13178, "ON"],
  [13278, 13279, "ON"],
  [13311, 13311, "ON"],
  [19904, 19967, "ON"],
  [42128, 42182, "ON"],
  [42509, 42511, "ON"],
  [42607, 42610, "NSM"],
  [42611, 42611, "ON"],
  [42612, 42621, "NSM"],
  [42622, 42623, "ON"],
  [42654, 42655, "NSM"],
  [42736, 42737, "NSM"],
  [42752, 42785, "ON"],
  [42888, 42888, "ON"],
  [43010, 43010, "NSM"],
  [43014, 43014, "NSM"],
  [43019, 43019, "NSM"],
  [43045, 43046, "NSM"],
  [43048, 43051, "ON"],
  [43052, 43052, "NSM"],
  [43064, 43065, "ET"],
  [43124, 43127, "ON"],
  [43204, 43205, "NSM"],
  [43232, 43249, "NSM"],
  [43263, 43263, "NSM"],
  [43302, 43309, "NSM"],
  [43335, 43345, "NSM"],
  [43392, 43394, "NSM"],
  [43443, 43443, "NSM"],
  [43446, 43449, "NSM"],
  [43452, 43453, "NSM"],
  [43493, 43493, "NSM"],
  [43561, 43566, "NSM"],
  [43569, 43570, "NSM"],
  [43573, 43574, "NSM"],
  [43587, 43587, "NSM"],
  [43596, 43596, "NSM"],
  [43644, 43644, "NSM"],
  [43696, 43696, "NSM"],
  [43698, 43700, "NSM"],
  [43703, 43704, "NSM"],
  [43710, 43711, "NSM"],
  [43713, 43713, "NSM"],
  [43756, 43757, "NSM"],
  [43766, 43766, "NSM"],
  [43882, 43883, "ON"],
  [44005, 44005, "NSM"],
  [44008, 44008, "NSM"],
  [44013, 44013, "NSM"],
  [64285, 64285, "R"],
  [64286, 64286, "NSM"],
  [64287, 64296, "R"],
  [64297, 64297, "ES"],
  [64298, 64335, "R"],
  [64336, 64450, "AL"],
  [64451, 64466, "ON"],
  [64467, 64829, "AL"],
  [64830, 64847, "ON"],
  [64848, 64911, "AL"],
  [64912, 64913, "ON"],
  [64914, 64967, "AL"],
  [64968, 64975, "ON"],
  [64976, 65007, "BN"],
  [65008, 65020, "AL"],
  [65021, 65023, "ON"],
  [65024, 65039, "NSM"],
  [65040, 65049, "ON"],
  [65056, 65071, "NSM"],
  [65072, 65103, "ON"],
  [65104, 65104, "CS"],
  [65105, 65105, "ON"],
  [65106, 65106, "CS"],
  [65108, 65108, "ON"],
  [65109, 65109, "CS"],
  [65110, 65118, "ON"],
  [65119, 65119, "ET"],
  [65120, 65121, "ON"],
  [65122, 65123, "ES"],
  [65124, 65126, "ON"],
  [65128, 65128, "ON"],
  [65129, 65130, "ET"],
  [65131, 65131, "ON"],
  [65136, 65278, "AL"],
  [65279, 65279, "BN"],
  [65281, 65282, "ON"],
  [65283, 65285, "ET"],
  [65286, 65290, "ON"],
  [65291, 65291, "ES"],
  [65292, 65292, "CS"],
  [65293, 65293, "ES"],
  [65294, 65295, "CS"],
  [65296, 65305, "EN"],
  [65306, 65306, "CS"],
  [65307, 65312, "ON"],
  [65339, 65344, "ON"],
  [65371, 65381, "ON"],
  [65504, 65505, "ET"],
  [65506, 65508, "ON"],
  [65509, 65510, "ET"],
  [65512, 65518, "ON"],
  [65520, 65528, "BN"],
  [65529, 65533, "ON"],
  [65534, 65535, "BN"],
  [65793, 65793, "ON"],
  [65856, 65932, "ON"],
  [65936, 65948, "ON"],
  [65952, 65952, "ON"],
  [66045, 66045, "NSM"],
  [66272, 66272, "NSM"],
  [66273, 66299, "EN"],
  [66422, 66426, "NSM"],
  [67584, 67870, "R"],
  [67871, 67871, "ON"],
  [67872, 68096, "R"],
  [68097, 68099, "NSM"],
  [68100, 68100, "R"],
  [68101, 68102, "NSM"],
  [68103, 68107, "R"],
  [68108, 68111, "NSM"],
  [68112, 68151, "R"],
  [68152, 68154, "NSM"],
  [68155, 68158, "R"],
  [68159, 68159, "NSM"],
  [68160, 68324, "R"],
  [68325, 68326, "NSM"],
  [68327, 68408, "R"],
  [68409, 68415, "ON"],
  [68416, 68863, "R"],
  [68864, 68899, "AL"],
  [68900, 68903, "NSM"],
  [68904, 68911, "AL"],
  [68912, 68921, "AN"],
  [68922, 68927, "AL"],
  [68928, 68937, "AN"],
  [68938, 68968, "R"],
  [68969, 68973, "NSM"],
  [68974, 68974, "ON"],
  [68975, 69215, "R"],
  [69216, 69246, "AN"],
  [69247, 69290, "R"],
  [69291, 69292, "NSM"],
  [69293, 69311, "R"],
  [69312, 69327, "AL"],
  [69328, 69336, "ON"],
  [69337, 69369, "AL"],
  [69370, 69375, "NSM"],
  [69376, 69423, "R"],
  [69424, 69445, "AL"],
  [69446, 69456, "NSM"],
  [69457, 69487, "AL"],
  [69488, 69505, "R"],
  [69506, 69509, "NSM"],
  [69510, 69631, "R"],
  [69633, 69633, "NSM"],
  [69688, 69702, "NSM"],
  [69714, 69733, "ON"],
  [69744, 69744, "NSM"],
  [69747, 69748, "NSM"],
  [69759, 69761, "NSM"],
  [69811, 69814, "NSM"],
  [69817, 69818, "NSM"],
  [69826, 69826, "NSM"],
  [69888, 69890, "NSM"],
  [69927, 69931, "NSM"],
  [69933, 69940, "NSM"],
  [70003, 70003, "NSM"],
  [70016, 70017, "NSM"],
  [70070, 70078, "NSM"],
  [70089, 70092, "NSM"],
  [70095, 70095, "NSM"],
  [70191, 70193, "NSM"],
  [70196, 70196, "NSM"],
  [70198, 70199, "NSM"],
  [70206, 70206, "NSM"],
  [70209, 70209, "NSM"],
  [70367, 70367, "NSM"],
  [70371, 70378, "NSM"],
  [70400, 70401, "NSM"],
  [70459, 70460, "NSM"],
  [70464, 70464, "NSM"],
  [70502, 70508, "NSM"],
  [70512, 70516, "NSM"],
  [70587, 70592, "NSM"],
  [70606, 70606, "NSM"],
  [70608, 70608, "NSM"],
  [70610, 70610, "NSM"],
  [70625, 70626, "NSM"],
  [70712, 70719, "NSM"],
  [70722, 70724, "NSM"],
  [70726, 70726, "NSM"],
  [70750, 70750, "NSM"],
  [70835, 70840, "NSM"],
  [70842, 70842, "NSM"],
  [70847, 70848, "NSM"],
  [70850, 70851, "NSM"],
  [71090, 71093, "NSM"],
  [71100, 71101, "NSM"],
  [71103, 71104, "NSM"],
  [71132, 71133, "NSM"],
  [71219, 71226, "NSM"],
  [71229, 71229, "NSM"],
  [71231, 71232, "NSM"],
  [71264, 71276, "ON"],
  [71339, 71339, "NSM"],
  [71341, 71341, "NSM"],
  [71344, 71349, "NSM"],
  [71351, 71351, "NSM"],
  [71453, 71453, "NSM"],
  [71455, 71455, "NSM"],
  [71458, 71461, "NSM"],
  [71463, 71467, "NSM"],
  [71727, 71735, "NSM"],
  [71737, 71738, "NSM"],
  [71995, 71996, "NSM"],
  [71998, 71998, "NSM"],
  [72003, 72003, "NSM"],
  [72148, 72151, "NSM"],
  [72154, 72155, "NSM"],
  [72160, 72160, "NSM"],
  [72193, 72198, "NSM"],
  [72201, 72202, "NSM"],
  [72243, 72248, "NSM"],
  [72251, 72254, "NSM"],
  [72263, 72263, "NSM"],
  [72273, 72278, "NSM"],
  [72281, 72283, "NSM"],
  [72330, 72342, "NSM"],
  [72344, 72345, "NSM"],
  [72544, 72544, "NSM"],
  [72546, 72548, "NSM"],
  [72550, 72550, "NSM"],
  [72752, 72758, "NSM"],
  [72760, 72765, "NSM"],
  [72850, 72871, "NSM"],
  [72874, 72880, "NSM"],
  [72882, 72883, "NSM"],
  [72885, 72886, "NSM"],
  [73009, 73014, "NSM"],
  [73018, 73018, "NSM"],
  [73020, 73021, "NSM"],
  [73023, 73029, "NSM"],
  [73031, 73031, "NSM"],
  [73104, 73105, "NSM"],
  [73109, 73109, "NSM"],
  [73111, 73111, "NSM"],
  [73459, 73460, "NSM"],
  [73472, 73473, "NSM"],
  [73526, 73530, "NSM"],
  [73536, 73536, "NSM"],
  [73538, 73538, "NSM"],
  [73562, 73562, "NSM"],
  [73685, 73692, "ON"],
  [73693, 73696, "ET"],
  [73697, 73713, "ON"],
  [78912, 78912, "NSM"],
  [78919, 78933, "NSM"],
  [90398, 90409, "NSM"],
  [90413, 90415, "NSM"],
  [92912, 92916, "NSM"],
  [92976, 92982, "NSM"],
  [94031, 94031, "NSM"],
  [94095, 94098, "NSM"],
  [94178, 94178, "ON"],
  [94180, 94180, "NSM"],
  [113821, 113822, "NSM"],
  [113824, 113827, "BN"],
  [117760, 117973, "ON"],
  [118e3, 118009, "EN"],
  [118010, 118012, "ON"],
  [118016, 118451, "ON"],
  [118458, 118480, "ON"],
  [118496, 118512, "ON"],
  [118528, 118573, "NSM"],
  [118576, 118598, "NSM"],
  [119143, 119145, "NSM"],
  [119155, 119162, "BN"],
  [119163, 119170, "NSM"],
  [119173, 119179, "NSM"],
  [119210, 119213, "NSM"],
  [119273, 119274, "ON"],
  [119296, 119361, "ON"],
  [119362, 119364, "NSM"],
  [119365, 119365, "ON"],
  [119552, 119638, "ON"],
  [120513, 120513, "ON"],
  [120539, 120539, "ON"],
  [120571, 120571, "ON"],
  [120597, 120597, "ON"],
  [120629, 120629, "ON"],
  [120655, 120655, "ON"],
  [120687, 120687, "ON"],
  [120713, 120713, "ON"],
  [120745, 120745, "ON"],
  [120771, 120771, "ON"],
  [120782, 120831, "EN"],
  [121344, 121398, "NSM"],
  [121403, 121452, "NSM"],
  [121461, 121461, "NSM"],
  [121476, 121476, "NSM"],
  [121499, 121503, "NSM"],
  [121505, 121519, "NSM"],
  [122880, 122886, "NSM"],
  [122888, 122904, "NSM"],
  [122907, 122913, "NSM"],
  [122915, 122916, "NSM"],
  [122918, 122922, "NSM"],
  [123023, 123023, "NSM"],
  [123184, 123190, "NSM"],
  [123566, 123566, "NSM"],
  [123628, 123631, "NSM"],
  [123647, 123647, "ET"],
  [124140, 124143, "NSM"],
  [124398, 124399, "NSM"],
  [124643, 124643, "NSM"],
  [124646, 124646, "NSM"],
  [124654, 124655, "NSM"],
  [124661, 124661, "NSM"],
  [124928, 125135, "R"],
  [125136, 125142, "NSM"],
  [125143, 125251, "R"],
  [125252, 125258, "NSM"],
  [125259, 126063, "R"],
  [126064, 126143, "AL"],
  [126144, 126207, "R"],
  [126208, 126287, "AL"],
  [126288, 126463, "R"],
  [126464, 126703, "AL"],
  [126704, 126705, "ON"],
  [126706, 126719, "AL"],
  [126720, 126975, "R"],
  [126976, 127019, "ON"],
  [127024, 127123, "ON"],
  [127136, 127150, "ON"],
  [127153, 127167, "ON"],
  [127169, 127183, "ON"],
  [127185, 127221, "ON"],
  [127232, 127242, "EN"],
  [127243, 127247, "ON"],
  [127279, 127279, "ON"],
  [127338, 127343, "ON"],
  [127405, 127405, "ON"],
  [127584, 127589, "ON"],
  [127744, 128728, "ON"],
  [128732, 128748, "ON"],
  [128752, 128764, "ON"],
  [128768, 128985, "ON"],
  [128992, 129003, "ON"],
  [129008, 129008, "ON"],
  [129024, 129035, "ON"],
  [129040, 129095, "ON"],
  [129104, 129113, "ON"],
  [129120, 129159, "ON"],
  [129168, 129197, "ON"],
  [129200, 129211, "ON"],
  [129216, 129217, "ON"],
  [129232, 129240, "ON"],
  [129280, 129623, "ON"],
  [129632, 129645, "ON"],
  [129648, 129660, "ON"],
  [129664, 129674, "ON"],
  [129678, 129734, "ON"],
  [129736, 129736, "ON"],
  [129741, 129756, "ON"],
  [129759, 129770, "ON"],
  [129775, 129784, "ON"],
  [129792, 129938, "ON"],
  [129940, 130031, "ON"],
  [130032, 130041, "EN"],
  [130042, 130042, "ON"],
  [131070, 131071, "BN"],
  [196606, 196607, "BN"],
  [262142, 262143, "BN"],
  [327678, 327679, "BN"],
  [393214, 393215, "BN"],
  [458750, 458751, "BN"],
  [524286, 524287, "BN"],
  [589822, 589823, "BN"],
  [655358, 655359, "BN"],
  [720894, 720895, "BN"],
  [786430, 786431, "BN"],
  [851966, 851967, "BN"],
  [917502, 917759, "BN"],
  [917760, 917999, "NSM"],
  [918e3, 921599, "BN"],
  [983038, 983039, "BN"],
  [1048574, 1048575, "BN"],
  [1114110, 1114111, "BN"]
];
function r0(e) {
  if (e <= 255)
    return x0[e];
  let t = 0, n = ot.length - 1;
  for (; t <= n; ) {
    const r = t + n >> 1, i = ot[r];
    if (e < i[0]) {
      n = r - 1;
      continue;
    }
    if (e > i[1]) {
      t = r + 1;
      continue;
    }
    return i[2];
  }
  return "L";
}
function i0(e) {
  const t = e.length;
  if (t === 0)
    return null;
  const n = new Array(t);
  let r = !1;
  for (let s = 0; s < t; ) {
    const o = e.charCodeAt(s);
    let a = o, F = 1;
    if (o >= 55296 && o <= 56319 && s + 1 < t) {
      const p = e.charCodeAt(s + 1);
      p >= 56320 && p <= 57343 && (a = (o - 55296 << 10) + (p - 56320) + 65536, F = 2);
    }
    const S = r0(a);
    (S === "R" || S === "AL" || S === "AN") && (r = !0);
    for (let p = 0; p < F; p++)
      n[s + p] = S;
    s += F;
  }
  if (!r)
    return null;
  let i = 0;
  for (let s = 0; s < t; s++) {
    const o = n[s];
    if (o === "L") {
      i = 0;
      break;
    }
    if (o === "R" || o === "AL") {
      i = 1;
      break;
    }
  }
  const x = new Int8Array(t);
  for (let s = 0; s < t; s++)
    x[s] = i;
  const l = i & 1 ? "R" : "L", u = l;
  let c = u;
  for (let s = 0; s < t; s++)
    n[s] === "NSM" ? n[s] = c : c = n[s];
  c = u;
  for (let s = 0; s < t; s++) {
    const o = n[s];
    o === "EN" ? n[s] = c === "AL" ? "AN" : "EN" : (o === "R" || o === "L" || o === "AL") && (c = o);
  }
  for (let s = 0; s < t; s++)
    n[s] === "AL" && (n[s] = "R");
  for (let s = 1; s < t - 1; s++)
    n[s] === "ES" && n[s - 1] === "EN" && n[s + 1] === "EN" && (n[s] = "EN"), n[s] === "CS" && (n[s - 1] === "EN" || n[s - 1] === "AN") && n[s + 1] === n[s - 1] && (n[s] = n[s - 1]);
  for (let s = 0; s < t; s++) {
    if (n[s] !== "EN")
      continue;
    let o;
    for (o = s - 1; o >= 0 && n[o] === "ET"; o--)
      n[o] = "EN";
    for (o = s + 1; o < t && n[o] === "ET"; o++)
      n[o] = "EN";
  }
  for (let s = 0; s < t; s++) {
    const o = n[s];
    (o === "WS" || o === "ES" || o === "ET" || o === "CS") && (n[s] = "ON");
  }
  c = u;
  for (let s = 0; s < t; s++) {
    const o = n[s];
    o === "EN" ? n[s] = c === "L" ? "L" : "EN" : (o === "R" || o === "L") && (c = o);
  }
  for (let s = 0; s < t; s++) {
    if (n[s] !== "ON")
      continue;
    let o = s + 1;
    for (; o < t && n[o] === "ON"; )
      o++;
    const a = s > 0 ? n[s - 1] : u, F = o < t ? n[o] : u, S = a !== "L" ? "R" : "L";
    if (S === (F !== "L" ? "R" : "L"))
      for (let B = s; B < o; B++)
        n[B] = S;
    s = o - 1;
  }
  for (let s = 0; s < t; s++)
    n[s] === "ON" && (n[s] = l);
  for (let s = 0; s < t; s++) {
    const o = n[s];
    x[s] & 1 ? (o === "L" || o === "AN" || o === "EN") && x[s]++ : o === "R" ? x[s]++ : (o === "AN" || o === "EN") && (x[s] += 2);
  }
  return x;
}
function s0(e, t) {
  const n = i0(e);
  if (n === null)
    return null;
  const r = new Int8Array(t.length);
  for (let i = 0; i < t.length; i++)
    r[i] = n[t[i]];
  return r;
}
const o0 = /[ \t\n\r\f]+/g, l0 = /[\t\n\r\f]| {2,}|^ | $/;
function u0(e) {
  const t = e ?? "normal";
  return t === "pre-wrap" ? { mode: t, preserveOrdinarySpaces: !0, preserveHardBreaks: !0 } : { mode: t, preserveOrdinarySpaces: !1, preserveHardBreaks: !1 };
}
function c0(e) {
  if (!l0.test(e))
    return e;
  let t = e.replace(o0, " ");
  return t.charCodeAt(0) === 32 && (t = t.slice(1)), t.length > 0 && t.charCodeAt(t.length - 1) === 32 && (t = t.slice(0, -1)), t;
}
function a0(e) {
  return /[\r\f]/.test(e) ? e.replace(/\r\n/g, `
`).replace(/[\r\f]/g, `
`) : e;
}
let de = null, F0;
function f0() {
  return de === null && (de = new Intl.Segmenter(F0, { granularity: "word" })), de;
}
function N0() {
  de = null;
}
const d0 = /\p{Script=Arabic}/u, Le = /\p{M}/u, Bt = /\p{Nd}/u;
function lt(e) {
  return d0.test(e);
}
function ut(e) {
  return e >= 19968 && e <= 40959 || e >= 13312 && e <= 19903 || e >= 131072 && e <= 173791 || e >= 173824 && e <= 177983 || e >= 177984 && e <= 178207 || e >= 178208 && e <= 183983 || e >= 183984 && e <= 191471 || e >= 191472 && e <= 192093 || e >= 194560 && e <= 195103 || e >= 196608 && e <= 201551 || e >= 201552 && e <= 205743 || e >= 205744 && e <= 210041 || e >= 63744 && e <= 64255 || e >= 12288 && e <= 12351 || e >= 12352 && e <= 12447 || e >= 12448 && e <= 12543 || e >= 12592 && e <= 12687 || e >= 44032 && e <= 55215 || e >= 65280 && e <= 65519;
}
function Y(e) {
  for (let t = 0; t < e.length; t++) {
    const n = e.charCodeAt(t);
    if (!(n < 12288)) {
      if (n >= 55296 && n <= 56319 && t + 1 < e.length) {
        const r = e.charCodeAt(t + 1);
        if (r >= 56320 && r <= 57343) {
          const i = (n - 55296 << 10) + (r - 56320) + 65536;
          if (ut(i))
            return !0;
          t++;
          continue;
        }
      }
      if (ut(n))
        return !0;
    }
  }
  return !1;
}
function S0(e) {
  const t = be(e);
  return t !== null && (Ye.has(t) || V.has(t));
}
const h0 = /* @__PURE__ */ new Set([
  " ",
  " ",
  "⁠",
  "\uFEFF"
]);
function E0(e) {
  return Y(e);
}
function A0(e) {
  const t = be(e);
  return t !== null && h0.has(t);
}
function p0(e) {
  return !S0(e) && !A0(e);
}
const Ye = /* @__PURE__ */ new Set([
  "，",
  "．",
  "！",
  "：",
  "；",
  "？",
  "、",
  "。",
  "・",
  "）",
  "〕",
  "〉",
  "》",
  "」",
  "』",
  "】",
  "〗",
  "〙",
  "〛",
  "ー",
  "々",
  "〻",
  "ゝ",
  "ゞ",
  "ヽ",
  "ヾ"
]), Oe = /* @__PURE__ */ new Set([
  '"',
  "(",
  "[",
  "{",
  "“",
  "‘",
  "«",
  "‹",
  "（",
  "〔",
  "〈",
  "《",
  "「",
  "『",
  "【",
  "〖",
  "〘",
  "〚"
]), Ve = /* @__PURE__ */ new Set([
  "'",
  "’"
]), V = /* @__PURE__ */ new Set([
  ".",
  ",",
  "!",
  "?",
  ":",
  ";",
  "،",
  "؛",
  "؟",
  "।",
  "॥",
  "၊",
  "။",
  "၌",
  "၍",
  "၏",
  ")",
  "]",
  "}",
  "%",
  '"',
  "”",
  "’",
  "»",
  "›",
  "…"
]), C0 = /* @__PURE__ */ new Set([
  ":",
  ".",
  "،",
  "؛"
]), g0 = /* @__PURE__ */ new Set([
  "၏"
]), M0 = /* @__PURE__ */ new Set([
  "”",
  "’",
  "»",
  "›",
  "」",
  "』",
  "】",
  "》",
  "〉",
  "〕",
  "）"
]);
function B0(e) {
  if (Xe(e))
    return !0;
  let t = !1;
  for (const n of e) {
    if (V.has(n)) {
      t = !0;
      continue;
    }
    if (!(t && Le.test(n)))
      return !1;
  }
  return t;
}
function D0(e) {
  for (const t of e)
    if (!Ye.has(t) && !V.has(t))
      return !1;
  return e.length > 0;
}
function m0(e) {
  if (Xe(e))
    return !0;
  for (const t of e)
    if (!Oe.has(t) && !Ve.has(t) && !Le.test(t))
      return !1;
  return e.length > 0;
}
function Xe(e) {
  let t = !1;
  for (const n of e)
    if (!(n === "\\" || Le.test(n))) {
      if (Oe.has(n) || V.has(n) || Ve.has(n)) {
        t = !0;
        continue;
      }
      return !1;
    }
  return t;
}
function Dt(e, t) {
  const n = t - 1;
  if (n <= 0)
    return Math.max(n, 0);
  const r = e.charCodeAt(n);
  if (r < 56320 || r > 57343)
    return n;
  const i = n - 1;
  if (i < 0)
    return n;
  const x = e.charCodeAt(i);
  return x >= 55296 && x <= 56319 ? i : n;
}
function be(e) {
  if (e.length === 0)
    return null;
  const t = Dt(e, e.length);
  return e.slice(t);
}
function L0(e) {
  const t = Array.from(e);
  let n = t.length;
  for (; n > 0; ) {
    const r = t[n - 1];
    if (Le.test(r)) {
      n--;
      continue;
    }
    if (Oe.has(r) || Ve.has(r)) {
      n--;
      continue;
    }
    break;
  }
  return n <= 0 || n === t.length ? null : {
    head: t.slice(0, n).join(""),
    tail: t.slice(n).join("")
  };
}
function O0(e, t, n) {
  return n === "text" && !t && e.length === 1 && e !== "-" && e !== "—" ? e : null;
}
function ct(e, t, n, r) {
  const i = t[r], x = e[r];
  if (i == null)
    return x;
  const l = n[r];
  if (x.length === l)
    return x;
  const u = i.repeat(l);
  return e[r] = u, u;
}
function at(e, t) {
  return e && t !== null && C0.has(t);
}
function b0(e) {
  const t = be(e);
  return t !== null && g0.has(t);
}
function k0(e) {
  if (e.length < 2 || e[0] !== " ")
    return null;
  const t = e.slice(1);
  return /^\p{M}+$/u.test(t) ? { space: " ", marks: t } : null;
}
function We(e) {
  let t = e.length;
  for (; t > 0; ) {
    const n = Dt(e, t), r = e.slice(n, t);
    if (M0.has(r))
      return !0;
    if (!V.has(r))
      return !1;
    t = n;
  }
  return !1;
}
function y0(e, t) {
  if (t.preserveOrdinarySpaces || t.preserveHardBreaks) {
    if (e === " ")
      return "preserved-space";
    if (e === "	")
      return "tab";
    if (t.preserveHardBreaks && e === `
`)
      return "hard-break";
  }
  return e === " " ? "space" : e === " " || e === " " || e === "⁠" || e === "\uFEFF" ? "glue" : e === "​" ? "zero-width-break" : e === "­" ? "soft-hyphen" : "text";
}
const v0 = /[\x20\t\n\xA0\xAD\u200B\u202F\u2060\uFEFF]/;
function I(e) {
  return e.length === 1 ? e[0] : e.join("");
}
function _0(e, t) {
  const n = [];
  for (let r = e.length - 1; r >= 0; r--)
    n.push(e[r]);
  return n.push(t), I(n);
}
function w0(e, t, n, r) {
  if (!v0.test(e))
    return [{ text: e, isWordLike: t, kind: "text", start: n }];
  const i = [];
  let x = null, l = [], u = n, c = !1, s = 0;
  for (const o of e) {
    const a = y0(o, r), F = a === "text" && t;
    if (x !== null && a === x && F === c) {
      l.push(o), s += o.length;
      continue;
    }
    x !== null && i.push({
      text: I(l),
      isWordLike: c,
      kind: x,
      start: u
    }), x = a, l = [o], u = n + s, c = F, s += o.length;
  }
  return x !== null && i.push({
    text: I(l),
    isWordLike: c,
    kind: x,
    start: u
  }), i;
}
function Pe(e) {
  return e === "space" || e === "preserved-space" || e === "zero-width-break" || e === "hard-break";
}
const T0 = /^[A-Za-z][A-Za-z0-9+.-]*:$/;
function R0(e, t) {
  const n = e.texts[t];
  return n.startsWith("www.") ? !0 : T0.test(n) && t + 1 < e.len && e.kinds[t + 1] === "text" && e.texts[t + 1] === "//";
}
function W0(e) {
  return e.includes("?") && (e.includes("://") || e.startsWith("www."));
}
function P0(e) {
  const t = e.texts.slice(), n = e.isWordLike.slice(), r = e.kinds.slice(), i = e.starts.slice();
  for (let l = 0; l < e.len; l++) {
    if (r[l] !== "text" || !R0(e, l))
      continue;
    const u = [t[l]];
    let c = l + 1;
    for (; c < e.len && !Pe(r[c]); ) {
      u.push(t[c]), n[l] = !0;
      const s = t[c].includes("?");
      if (r[c] = "text", t[c] = "", c++, s)
        break;
    }
    t[l] = I(u);
  }
  let x = 0;
  for (let l = 0; l < t.length; l++) {
    const u = t[l];
    u.length !== 0 && (x !== l && (t[x] = u, n[x] = n[l], r[x] = r[l], i[x] = i[l]), x++);
  }
  return t.length = x, n.length = x, r.length = x, i.length = x, {
    len: x,
    texts: t,
    isWordLike: n,
    kinds: r,
    starts: i
  };
}
function I0(e) {
  const t = [], n = [], r = [], i = [];
  for (let x = 0; x < e.len; x++) {
    const l = e.texts[x];
    if (t.push(l), n.push(e.isWordLike[x]), r.push(e.kinds[x]), i.push(e.starts[x]), !W0(l))
      continue;
    const u = x + 1;
    if (u >= e.len || Pe(e.kinds[u]))
      continue;
    const c = [], s = e.starts[u];
    let o = u;
    for (; o < e.len && !Pe(e.kinds[o]); )
      c.push(e.texts[o]), o++;
    c.length > 0 && (t.push(I(c)), n.push(!0), r.push("text"), i.push(s), x = o - 1);
  }
  return {
    len: t.length,
    texts: t,
    isWordLike: n,
    kinds: r,
    starts: i
  };
}
const $0 = /* @__PURE__ */ new Set([
  ":",
  "-",
  "/",
  "×",
  ",",
  ".",
  "+",
  "–",
  "—"
]), Ft = /^[A-Za-z0-9_]+[,:;]*$/, ft = /[,:;]+$/;
function mt(e) {
  for (const t of e)
    if (Bt.test(t))
      return !0;
  return !1;
}
function Ee(e) {
  if (e.length === 0)
    return !1;
  for (const t of e)
    if (!(Bt.test(t) || $0.has(t)))
      return !1;
  return !0;
}
function H0(e) {
  const t = [], n = [], r = [], i = [];
  for (let x = 0; x < e.len; x++) {
    const l = e.texts[x], u = e.kinds[x];
    if (u === "text" && Ee(l) && mt(l)) {
      const c = [l];
      let s = x + 1;
      for (; s < e.len && e.kinds[s] === "text" && Ee(e.texts[s]); )
        c.push(e.texts[s]), s++;
      t.push(I(c)), n.push(!0), r.push("text"), i.push(e.starts[x]), x = s - 1;
      continue;
    }
    t.push(l), n.push(e.isWordLike[x]), r.push(u), i.push(e.starts[x]);
  }
  return {
    len: t.length,
    texts: t,
    isWordLike: n,
    kinds: r,
    starts: i
  };
}
function G0(e) {
  const t = [], n = [], r = [], i = [];
  for (let x = 0; x < e.len; x++) {
    const l = e.texts[x], u = e.kinds[x], c = e.isWordLike[x];
    if (u === "text" && c && Ft.test(l)) {
      const s = [l];
      let o = ft.test(l), a = x + 1;
      for (; o && a < e.len && e.kinds[a] === "text" && e.isWordLike[a] && Ft.test(e.texts[a]); ) {
        const F = e.texts[a];
        s.push(F), o = ft.test(F), a++;
      }
      t.push(I(s)), n.push(!0), r.push("text"), i.push(e.starts[x]), x = a - 1;
      continue;
    }
    t.push(l), n.push(c), r.push(u), i.push(e.starts[x]);
  }
  return {
    len: t.length,
    texts: t,
    isWordLike: n,
    kinds: r,
    starts: i
  };
}
function j0(e) {
  const t = [], n = [], r = [], i = [];
  for (let x = 0; x < e.len; x++) {
    const l = e.texts[x];
    if (e.kinds[x] === "text" && l.includes("-")) {
      const u = l.split("-");
      let c = u.length > 1;
      for (let s = 0; s < u.length; s++) {
        const o = u[s];
        if (!c)
          break;
        (o.length === 0 || !mt(o) || !Ee(o)) && (c = !1);
      }
      if (c) {
        let s = 0;
        for (let o = 0; o < u.length; o++) {
          const a = u[o], F = o < u.length - 1 ? `${a}-` : a;
          t.push(F), n.push(!0), r.push("text"), i.push(e.starts[x] + s), s += F.length;
        }
        continue;
      }
    }
    t.push(l), n.push(e.isWordLike[x]), r.push(e.kinds[x]), i.push(e.starts[x]);
  }
  return {
    len: t.length,
    texts: t,
    isWordLike: n,
    kinds: r,
    starts: i
  };
}
function z0(e) {
  const t = [], n = [], r = [], i = [];
  let x = 0;
  for (; x < e.len; ) {
    const l = [e.texts[x]];
    let u = e.isWordLike[x], c = e.kinds[x], s = e.starts[x];
    if (c === "glue") {
      const o = [l[0]], a = s;
      for (x++; x < e.len && e.kinds[x] === "glue"; )
        o.push(e.texts[x]), x++;
      const F = I(o);
      if (x < e.len && e.kinds[x] === "text")
        l[0] = F, l.push(e.texts[x]), u = e.isWordLike[x], c = "text", s = a, x++;
      else {
        t.push(F), n.push(!1), r.push("glue"), i.push(a);
        continue;
      }
    } else
      x++;
    if (c === "text")
      for (; x < e.len && e.kinds[x] === "glue"; ) {
        const o = [];
        for (; x < e.len && e.kinds[x] === "glue"; )
          o.push(e.texts[x]), x++;
        const a = I(o);
        if (x < e.len && e.kinds[x] === "text") {
          l.push(a, e.texts[x]), u = u || e.isWordLike[x], x++;
          continue;
        }
        l.push(a);
      }
    t.push(I(l)), n.push(u), r.push(c), i.push(s);
  }
  return {
    len: t.length,
    texts: t,
    isWordLike: n,
    kinds: r,
    starts: i
  };
}
function K0(e) {
  const t = e.texts.slice(), n = e.isWordLike.slice(), r = e.kinds.slice(), i = e.starts.slice();
  for (let x = 0; x < t.length - 1; x++) {
    if (r[x] !== "text" || r[x + 1] !== "text" || !Y(t[x]) || !Y(t[x + 1]))
      continue;
    const l = L0(t[x]);
    l !== null && (t[x] = l.head, t[x + 1] = l.tail + t[x + 1], i[x + 1] = i[x] + l.head.length);
  }
  return {
    len: t.length,
    texts: t,
    isWordLike: n,
    kinds: r,
    starts: i
  };
}
function Nt(e, t, n) {
  const r = f0();
  let i = 0;
  const x = [], l = [], u = [], c = [], s = [], o = [], a = [], F = [], S = [], p = [], B = [], g = [];
  for (const f of r.segment(e))
    for (const E of w0(f.segment, f.isWordLike ?? !1, f.index, n)) {
      let A = function() {
        o[N] !== null && (l[N] = [
          ct(x, o, a, N)
        ], o[N] = null), l[N].push(E.text), u[N] = u[N] || E.isWordLike, F[N] = F[N] || C, S[N] = S[N] || b, p[N] = y, B[N] = $, g[N] = at(S[N], k);
      };
      const M = E.kind === "text", h = O0(E.text, E.isWordLike, E.kind), C = Y(E.text), b = lt(E.text), k = be(E.text), y = We(E.text), $ = b0(E.text), N = i - 1;
      t.carryCJKAfterClosingQuote && M && i > 0 && c[N] === "text" && C && F[N] && p[N] || M && i > 0 && c[N] === "text" && D0(E.text) && F[N] || M && i > 0 && c[N] === "text" && B[N] ? A() : M && i > 0 && c[N] === "text" && E.isWordLike && b && g[N] ? (A(), u[N] = !0) : h !== null && i > 0 && c[N] === "text" && o[N] === h ? a[N] = (a[N] ?? 1) + 1 : M && !E.isWordLike && i > 0 && c[N] === "text" && !F[N] && (B0(E.text) || E.text === "-" && u[N]) ? A() : (x[i] = E.text, l[i] = [E.text], u[i] = E.isWordLike, c[i] = E.kind, s[i] = E.start, o[i] = h, a[i] = h === null ? 0 : 1, F[i] = C, S[i] = b, p[i] = y, B[i] = $, g[i] = at(b, k), i++);
    }
  for (let f = 0; f < i; f++) {
    if (o[f] !== null) {
      x[f] = ct(x, o, a, f);
      continue;
    }
    x[f] = I(l[f]);
  }
  for (let f = 1; f < i; f++)
    c[f] === "text" && !u[f] && Xe(x[f]) && c[f - 1] === "text" && !F[f - 1] && (x[f - 1] += x[f], u[f - 1] = u[f - 1] || u[f], x[f] = "");
  const m = Array.from({ length: i }, () => null);
  let v = -1;
  for (let f = i - 1; f >= 0; f--) {
    const E = x[f];
    if (E.length !== 0) {
      if (c[f] === "text" && !u[f] && m0(E) && v >= 0 && c[v] === "text") {
        const M = m[v] ?? [];
        M.push(E), m[v] = M, s[v] = s[f], x[f] = "";
        continue;
      }
      v = f;
    }
  }
  for (let f = 0; f < i; f++) {
    const E = m[f];
    E != null && (x[f] = _0(E, x[f]));
  }
  let L = 0;
  for (let f = 0; f < i; f++) {
    const E = x[f];
    E.length !== 0 && (L !== f && (x[L] = E, u[L] = u[f], c[L] = c[f], s[L] = s[f]), L++);
  }
  x.length = L, u.length = L, c.length = L, s.length = L;
  const w = z0({
    len: L,
    texts: x,
    isWordLike: u,
    kinds: c,
    starts: s
  }), D = K0(G0(j0(H0(I0(P0(w))))));
  for (let f = 0; f < D.len - 1; f++) {
    const E = k0(D.texts[f]);
    E !== null && (D.kinds[f] !== "space" && D.kinds[f] !== "preserved-space" || D.kinds[f + 1] !== "text" || !lt(D.texts[f + 1]) || (D.texts[f] = E.space, D.isWordLike[f] = !1, D.kinds[f] = D.kinds[f] === "preserved-space" ? "preserved-space" : "space", D.texts[f + 1] = E.marks + D.texts[f + 1], D.starts[f + 1] = D.starts[f] + E.space.length));
  }
  return D;
}
function U0(e, t) {
  if (e.len === 0)
    return [];
  if (!t.preserveHardBreaks)
    return [{
      startSegmentIndex: 0,
      endSegmentIndex: e.len,
      consumedEndSegmentIndex: e.len
    }];
  const n = [];
  let r = 0;
  for (let i = 0; i < e.len; i++)
    e.kinds[i] === "hard-break" && (n.push({
      startSegmentIndex: r,
      endSegmentIndex: i,
      consumedEndSegmentIndex: i + 1
    }), r = i + 1);
  return r < e.len && n.push({
    startSegmentIndex: r,
    endSegmentIndex: e.len,
    consumedEndSegmentIndex: e.len
  }), n;
}
function q0(e) {
  if (e.len <= 1)
    return e;
  const t = [], n = [], r = [], i = [];
  let x = null, l = !1, u = 0, c = !1, s = !1;
  function o() {
    x !== null && (t.push(I(x)), n.push(l), r.push("text"), i.push(u), x = null);
  }
  for (let a = 0; a < e.len; a++) {
    const F = e.texts[a], S = e.kinds[a], p = e.isWordLike[a], B = e.starts[a];
    if (S === "text") {
      const g = E0(F), m = p0(F);
      if (x !== null && c && s) {
        x.push(F), l = l || p, c = c || g, s = m;
        continue;
      }
      o(), x = [F], l = p, u = B, c = g, s = m;
      continue;
    }
    o(), t.push(F), n.push(p), r.push(S), i.push(B);
  }
  return o(), {
    len: t.length,
    texts: t,
    isWordLike: n,
    kinds: r,
    starts: i
  };
}
function J0(e, t, n = "normal", r = "normal") {
  const i = u0(n), x = i.mode === "pre-wrap" ? a0(e) : c0(e);
  if (x.length === 0)
    return {
      normalized: x,
      chunks: [],
      len: 0,
      texts: [],
      isWordLike: [],
      kinds: [],
      starts: []
    };
  const l = r === "keep-all" ? q0(Nt(x, t, i)) : Nt(x, t, i);
  return {
    normalized: x,
    chunks: U0(l, i),
    ...l
  };
}
let Z = null;
const Ie = /* @__PURE__ */ new Map();
let ee = null;
const Q0 = 96, Y0 = /\p{Emoji_Presentation}/u, V0 = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u20E3]/u;
let Se = null;
const $e = /* @__PURE__ */ new Map();
function Ze() {
  if (Z !== null)
    return Z;
  if (typeof OffscreenCanvas < "u")
    return Z = new OffscreenCanvas(1, 1).getContext("2d"), Z;
  if (typeof document < "u")
    return Z = document.createElement("canvas").getContext("2d"), Z;
  throw new Error("Text measurement requires OffscreenCanvas or a DOM canvas context.");
}
function X0(e) {
  let t = Ie.get(e);
  return t || (t = /* @__PURE__ */ new Map(), Ie.set(e, t)), t;
}
function z(e, t) {
  let n = t.get(e);
  return n === void 0 && (n = {
    width: Ze().measureText(e).width,
    containsCJK: Y(e)
  }, t.set(e, n)), n;
}
function ke() {
  if (ee !== null)
    return ee;
  if (typeof navigator > "u")
    return ee = {
      lineFitEpsilon: 5e-3,
      carryCJKAfterClosingQuote: !1,
      preferPrefixWidthsForBreakableRuns: !1,
      preferEarlySoftHyphenBreak: !1
    }, ee;
  const e = navigator.userAgent, n = navigator.vendor === "Apple Computer, Inc." && e.includes("Safari/") && !e.includes("Chrome/") && !e.includes("Chromium/") && !e.includes("CriOS/") && !e.includes("FxiOS/") && !e.includes("EdgiOS/"), r = e.includes("Chrome/") || e.includes("Chromium/") || e.includes("CriOS/") || e.includes("Edg/");
  return ee = {
    lineFitEpsilon: n ? 1 / 64 : 5e-3,
    carryCJKAfterClosingQuote: r,
    preferPrefixWidthsForBreakableRuns: n,
    preferEarlySoftHyphenBreak: n
  }, ee;
}
function Z0(e) {
  const t = e.match(/(\d+(?:\.\d+)?)\s*px/);
  return t ? parseFloat(t[1]) : 16;
}
function Lt() {
  return Se === null && (Se = new Intl.Segmenter(void 0, { granularity: "grapheme" })), Se;
}
function en(e) {
  return Y0.test(e) || e.includes("️");
}
function tn(e) {
  return V0.test(e);
}
function nn(e, t) {
  let n = $e.get(e);
  if (n !== void 0)
    return n;
  const r = Ze();
  r.font = e;
  const i = r.measureText("😀").width;
  if (n = 0, i > t + 0.5 && typeof document < "u" && document.body !== null) {
    const x = document.createElement("span");
    x.style.font = e, x.style.display = "inline-block", x.style.visibility = "hidden", x.style.position = "absolute", x.textContent = "😀", document.body.appendChild(x);
    const l = x.getBoundingClientRect().width;
    document.body.removeChild(x), i - l > 0.5 && (n = i - l);
  }
  return $e.set(e, n), n;
}
function xn(e) {
  let t = 0;
  const n = Lt();
  for (const r of n.segment(e))
    en(r.segment) && t++;
  return t;
}
function rn(e, t) {
  return t.emojiCount === void 0 && (t.emojiCount = xn(e)), t.emojiCount;
}
function U(e, t, n) {
  return n === 0 ? t.width : t.width - rn(e, t) * n;
}
function sn(e, t, n, r, i) {
  if (t.breakableFitAdvances !== void 0 && t.breakableFitMode === i)
    return t.breakableFitAdvances;
  t.breakableFitMode = i;
  const x = Lt(), l = [];
  for (const o of x.segment(e))
    l.push(o.segment);
  if (l.length <= 1)
    return t.breakableFitAdvances = null, t.breakableFitAdvances;
  if (i === "sum-graphemes") {
    const o = [];
    for (const a of l) {
      const F = z(a, n);
      o.push(U(a, F, r));
    }
    return t.breakableFitAdvances = o, t.breakableFitAdvances;
  }
  if (i === "pair-context" || l.length > Q0) {
    const o = [];
    let a = null, F = 0;
    for (const S of l) {
      const p = z(S, n), B = U(S, p, r);
      if (a === null)
        o.push(B);
      else {
        const g = a + S, m = z(g, n);
        o.push(U(g, m, r) - F);
      }
      a = S, F = B;
    }
    return t.breakableFitAdvances = o, t.breakableFitAdvances;
  }
  const u = [];
  let c = "", s = 0;
  for (const o of l) {
    c += o;
    const a = z(c, n), F = U(c, a, r);
    u.push(F - s), s = F;
  }
  return t.breakableFitAdvances = u, t.breakableFitAdvances;
}
function on(e, t) {
  const n = Ze();
  n.font = e;
  const r = X0(e), i = Z0(e), x = t ? nn(e, i) : 0;
  return { cache: r, fontSize: i, emojiCorrection: x };
}
function ln() {
  Ie.clear(), $e.clear(), Se = null;
}
function un(e) {
  return e === "space" || e === "zero-width-break" || e === "soft-hyphen";
}
function Ot(e) {
  return e === "space" || e === "preserved-space" || e === "tab" || e === "zero-width-break" || e === "soft-hyphen";
}
function bt(e, t, n = e.widths.length) {
  for (; t < n; ) {
    const r = e.kinds[t];
    if (!un(r))
      break;
    t++;
  }
  return t;
}
function cn(e, t) {
  if (t <= 0)
    return 0;
  const n = e % t;
  return Math.abs(n) <= 1e-6 ? t : t - n;
}
function an(e, t, n) {
  return e.letterSpacing !== 0 && t && e.spacingGraphemeCounts[n] > 0 ? e.letterSpacing : 0;
}
function et(e, t) {
  return t === 0 ? 0 : e + t;
}
function Fn(e, t) {
  return e.letterSpacing !== 0 && e.spacingGraphemeCounts[t] > 0 ? e.letterSpacing : 0;
}
function fn(e, t, n, r, i) {
  const x = t === "tab" ? i + Fn(e, n) : e.lineEndFitAdvances[n];
  return et(r, x);
}
function dt(e, t, n, r) {
  const i = t === "tab" ? 0 : e.lineEndFitAdvances[n];
  return et(r, i);
}
function St(e, t, n, r, i) {
  const x = t === "tab" ? i : e.lineEndPaintAdvances[n];
  return et(r, x);
}
function Nn(e, t, n) {
  return e.letterSpacing !== 0 && t ? n + e.letterSpacing : n;
}
function dn(e, t) {
  return e.letterSpacing === 0 ? t : t + e.letterSpacing;
}
function Sn(e, t, n, r, i, x) {
  let l = 0, u = t;
  for (; l < e.length; ) {
    const c = u + e[l] + x;
    if ((l + 1 < e.length ? c + i : c) > n + r)
      break;
    u = c, l++;
  }
  return { fitCount: l, fittedWidth: u };
}
function hn(e, t) {
  return kt(e, t);
}
function En(e, t, n) {
  const { widths: r, kinds: i, breakableFitAdvances: x } = e;
  if (r.length === 0)
    return 0;
  const u = ke().lineFitEpsilon, c = t + u;
  let s = 0, o = 0, a = !1, F = 0, S = 0, p = 0, B = 0, g = -1, m = 0;
  function v() {
    g = -1, m = 0;
  }
  function L(h = p, C = B, b = o) {
    s++, n?.(b, F, S, h, C), o = 0, a = !1, v();
  }
  function w(h, C) {
    a = !0, F = h, S = 0, p = h + 1, B = 0, o = C;
  }
  function D(h, C, b) {
    a = !0, F = h, S = C, p = h, B = C + 1, o = b;
  }
  function f(h, C) {
    if (!a) {
      w(h, C);
      return;
    }
    o += C, p = h + 1, B = 0;
  }
  function E(h, C) {
    const b = x[h];
    for (let k = C; k < b.length; k++) {
      const y = b[k];
      a ? o + y > c ? (L(), D(h, k, y)) : (o += y, p = h, B = k + 1) : D(h, k, y);
    }
    a && p === h && B === b.length && (p = h + 1, B = 0);
  }
  let M = 0;
  for (; M < r.length && !(!a && (M = bt(e, M), M >= r.length)); ) {
    const h = r[M], C = i[M], b = Ot(C);
    if (!a) {
      h > c && x[M] !== null ? E(M, 0) : w(M, h), b && (g = M + 1, m = o - h), M++;
      continue;
    }
    if (o + h > c) {
      if (b) {
        f(M, h), L(M + 1, 0, o - h), M++;
        continue;
      }
      if (g >= 0) {
        if (p > g || p === g && B > 0) {
          L();
          continue;
        }
        L(g, 0, m);
        continue;
      }
      if (h > c && x[M] !== null) {
        L(), E(M, 0), M++;
        continue;
      }
      L();
      continue;
    }
    f(M, h), b && (g = M + 1, m = o - h), M++;
  }
  return a && L(), s;
}
function kt(e, t, n) {
  if (e.simpleLineWalkFastPath)
    return En(e, t, n);
  const { widths: r, kinds: i, breakableFitAdvances: x, discretionaryHyphenWidth: l, chunks: u } = e;
  if (r.length === 0 || u.length === 0)
    return 0;
  const c = ke(), s = c.lineFitEpsilon, o = t + s;
  let a = 0, F = 0, S = !1, p = 0, B = 0, g = 0, m = 0, v = -1, L = 0, w = 0, D = null;
  function f() {
    v = -1, L = 0, w = 0, D = null;
  }
  function E(N = g, A = m, d = F) {
    a++, n?.(d, p, B, N, A), F = 0, S = !1, f();
  }
  function M(N, A) {
    S = !0, p = N, B = 0, g = N + 1, m = 0, F = A;
  }
  function h(N, A, d) {
    S = !0, p = N, B = A, g = N, m = A + 1, F = d;
  }
  function C(N, A) {
    if (!S) {
      M(N, A);
      return;
    }
    F += A, g = N + 1, m = 0;
  }
  function b(N, A, d, O, T, R) {
    if (!A)
      return;
    const H = dt(e, N, d, T), X = St(e, N, d, T, O);
    v = d + 1, L = F - R + H, w = F - R + X, D = N;
  }
  function k(N, A) {
    const d = x[N];
    for (let O = A; O < d.length; O++) {
      const T = d[O];
      if (!S)
        h(N, O, T);
      else {
        const R = Nn(e, !0, T), H = F + R;
        dn(e, H) > o ? (E(), h(N, O, T)) : (F = H, g = N, m = O + 1);
      }
    }
    S && g === N && m === d.length && (g = N + 1, m = 0);
  }
  function y(N) {
    if (D !== "soft-hyphen")
      return !1;
    const A = x[N];
    if (A == null)
      return !1;
    const { fitCount: d, fittedWidth: O } = Sn(A, F, t, s, l, e.letterSpacing);
    return d === 0 ? !1 : (F = O, g = N, m = d, f(), d === A.length ? (g = N + 1, m = 0, !0) : (E(N, d, O + l), k(N, d), !0));
  }
  function $(N) {
    a++, n?.(0, N.startSegmentIndex, 0, N.consumedEndSegmentIndex, 0), f();
  }
  for (let N = 0; N < u.length; N++) {
    const A = u[N];
    if (A.startSegmentIndex === A.endSegmentIndex) {
      $(A);
      continue;
    }
    S = !1, F = 0, p = A.startSegmentIndex, B = 0, g = A.startSegmentIndex, m = 0, f();
    let d = A.startSegmentIndex;
    for (; d < A.endSegmentIndex && !(!S && (d = bt(e, d, A.endSegmentIndex), d >= A.endSegmentIndex)); ) {
      const O = i[d], T = Ot(O), R = an(e, S, d), H = O === "tab" ? cn(F + R, e.tabStopAdvance) : r[d], X = R + H, _e = fn(e, O, d, R, H);
      if (O === "soft-hyphen") {
        S && (g = d + 1, m = 0, v = d + 1, L = F + l, w = F + l, D = O), d++;
        continue;
      }
      if (!S) {
        _e > o && x[d] !== null ? k(d, 0) : M(d, H), b(O, T, d, H, R, X), d++;
        continue;
      }
      if (F + _e > o) {
        const Ut = F + dt(e, O, d, R), qt = F + St(e, O, d, R, H);
        if (D === "soft-hyphen" && c.preferEarlySoftHyphenBreak && L <= o) {
          E(v, 0, w);
          continue;
        }
        if (D === "soft-hyphen" && y(d)) {
          d++;
          continue;
        }
        if (T && Ut <= o) {
          C(d, X), E(d + 1, 0, qt), d++;
          continue;
        }
        if (v >= 0 && L <= o) {
          if (g > v || g === v && m > 0) {
            E();
            continue;
          }
          const nt = v;
          E(nt, 0, w), d = nt;
          continue;
        }
        if (_e > o && x[d] !== null) {
          E(), k(d, 0), d++;
          continue;
        }
        E();
        continue;
      }
      C(d, X), b(O, T, d, H, R, X), d++;
    }
    if (S) {
      const O = v === A.consumedEndSegmentIndex ? w : F;
      E(A.consumedEndSegmentIndex, 0, O);
    }
  }
  return a;
}
let he = null;
function An() {
  return he === null && (he = new Intl.Segmenter(void 0, { granularity: "grapheme" })), he;
}
function pn(e) {
  return e ? {
    widths: [],
    lineEndFitAdvances: [],
    lineEndPaintAdvances: [],
    kinds: [],
    simpleLineWalkFastPath: !0,
    segLevels: null,
    breakableFitAdvances: [],
    letterSpacing: 0,
    spacingGraphemeCounts: [],
    discretionaryHyphenWidth: 0,
    tabStopAdvance: 0,
    chunks: [],
    segments: []
  } : {
    widths: [],
    lineEndFitAdvances: [],
    lineEndPaintAdvances: [],
    kinds: [],
    simpleLineWalkFastPath: !0,
    segLevels: null,
    breakableFitAdvances: [],
    letterSpacing: 0,
    spacingGraphemeCounts: [],
    discretionaryHyphenWidth: 0,
    tabStopAdvance: 0,
    chunks: []
  };
}
function Cn(e, t) {
  const n = [];
  let r = [], i = 0, x = !1, l = !1, u = !1;
  function c() {
    r.length !== 0 && (n.push({
      text: r.length === 1 ? r[0] : r.join(""),
      start: i
    }), r = [], x = !1, l = !1, u = !1);
  }
  function s(a, F, S) {
    r = [a], i = F, x = S, l = We(a), u = Oe.has(a);
  }
  function o(a, F) {
    r.push(a), x = x || F;
    const S = We(a);
    a.length === 1 && V.has(a) ? l = l || S : l = S, u = !1;
  }
  for (const a of An().segment(e)) {
    const F = a.segment, S = Y(F);
    if (r.length === 0) {
      s(F, a.index, S);
      continue;
    }
    if (u || Ye.has(F) || V.has(F) || t.carryCJKAfterClosingQuote && S && l) {
      o(F, S);
      continue;
    }
    if (!x && !S) {
      o(F, S);
      continue;
    }
    c(), s(F, a.index, S);
  }
  return c(), n;
}
function gn(e, t, n) {
  return e;
}
function Mn(e, t, n, r, i) {
  const x = ke(), { cache: l, emojiCorrection: u } = on(t, tn(e.normalized)), c = U("-", z("-", l), u) + 0, o = U(" ", z(" ", l), u) * 8;
  if (e.len === 0)
    return pn(n);
  const a = [], F = [], S = [], p = [];
  let B = e.chunks.length <= 1 && !0;
  const g = n ? [] : null, m = [], v = [], L = n ? [] : null, w = Array.from({ length: e.len });
  function D(h, C, b, k, y, $, N, A) {
    y !== "text" && y !== "space" && y !== "zero-width-break" && (B = !1), a.push(C), F.push(b), S.push(k), p.push(y), g?.push($), m.push(N), L !== null && L.push(h);
  }
  function f(h, C, b, k, y) {
    const $ = z(h, l), N = gn(U(h, $, u)), A = C === "space" || C === "preserved-space" || C === "zero-width-break" ? 0 : N, d = A === 0 ? 0 : A + 0, O = C === "space" || C === "zero-width-break" ? 0 : N;
    if (y && k && h.length > 1) {
      let T = "sum-graphemes";
      Ee(h) ? T = "pair-context" : x.preferPrefixWidthsForBreakableRuns && (T = "segment-prefixes");
      const R = sn(h, $, l, u, T);
      D(h, N, d, O, C, b, R);
      return;
    }
    D(h, N, d, O, C, b, null);
  }
  for (let h = 0; h < e.len; h++) {
    w[h] = a.length;
    const C = e.texts[h], b = e.isWordLike[h], k = e.kinds[h], y = e.starts[h];
    if (k === "soft-hyphen") {
      D(C, 0, c, c, k, y, null);
      continue;
    }
    if (k === "hard-break") {
      D(C, 0, 0, 0, k, y, null);
      continue;
    }
    if (k === "tab") {
      D(C, 0, 0, 0, k, y, null);
      continue;
    }
    const $ = z(C, l);
    if (k === "text" && $.containsCJK) {
      const A = Cn(C, x);
      for (let d = 0; d < A.length; d++) {
        const O = A[d];
        f(O.text, "text", y + O.start, b, !Y(O.text));
      }
      continue;
    }
    f(C, k, y, b, !0);
  }
  const E = Bn(e.chunks, w, a.length), M = g === null ? null : s0(e.normalized, g);
  return L !== null ? {
    widths: a,
    lineEndFitAdvances: F,
    lineEndPaintAdvances: S,
    kinds: p,
    simpleLineWalkFastPath: B,
    segLevels: M,
    breakableFitAdvances: m,
    letterSpacing: i,
    spacingGraphemeCounts: v,
    discretionaryHyphenWidth: c,
    tabStopAdvance: o,
    chunks: E,
    segments: L
  } : {
    widths: a,
    lineEndFitAdvances: F,
    lineEndPaintAdvances: S,
    kinds: p,
    simpleLineWalkFastPath: B,
    segLevels: M,
    breakableFitAdvances: m,
    letterSpacing: i,
    spacingGraphemeCounts: v,
    discretionaryHyphenWidth: c,
    tabStopAdvance: o,
    chunks: E
  };
}
function Bn(e, t, n) {
  const r = [];
  for (let i = 0; i < e.length; i++) {
    const x = e[i], l = x.startSegmentIndex < t.length ? t[x.startSegmentIndex] : n, u = x.endSegmentIndex < t.length ? t[x.endSegmentIndex] : n, c = x.consumedEndSegmentIndex < t.length ? t[x.consumedEndSegmentIndex] : n;
    r.push({
      startSegmentIndex: l,
      endSegmentIndex: u,
      consumedEndSegmentIndex: c
    });
  }
  return r;
}
function yt(e, t, n, r) {
  const i = "normal", l = J0(e, ke(), r?.whiteSpace, i);
  return Mn(l, t, n, i, 0);
}
function vt(e, t, n) {
  return yt(e, t, !1, n);
}
function Dn(e, t, n) {
  return yt(e, t, !0, n);
}
function _t(e, t, n) {
  const r = hn(e, t);
  return { lineCount: r, height: r * n };
}
function mn(e, t, n) {
  return e.widths.length === 0 ? 0 : kt(e, t, (r, i, x, l, u) => {
  });
}
function ht() {
  N0(), he = null, ln();
}
const wt = /* @__PURE__ */ new WeakMap();
function Ln(e) {
  return wt.get(e) || null;
}
function Tt(e, t) {
  wt.set(e, t);
}
function On(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n++)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(36);
}
function bn({ font: e, text: t, width: n, lineHeight: r }) {
  return `${e}|${n.toFixed(0)}|${r.toFixed(2)}|${On(t)}`;
}
const kn = "pretext-placeholder", Fe = "pretextOriginal";
let _ = null, se = null, Ae = null, pe = null, te = 0, Ce = !1, oe = null, ge = null;
function Rt(...e) {
  ge && ge(...e);
}
function yn(e) {
  if (oe = e.settings.virtualScroll, _ = document.querySelector("#chat"), ge = e.logger, !_) {
    Rt("virtual-scroll: #chat not found, retrying via observer"), vn();
    return;
  }
  Wt(), le();
}
function vn() {
  const e = new MutationObserver(() => {
    _ = document.querySelector("#chat"), _ && (e.disconnect(), Wt(), le());
  });
  e.observe(document.body, { childList: !0, subtree: !0 });
}
function Wt() {
  se = () => le(), _.addEventListener("scroll", se, { passive: !0 }), Ae = new ResizeObserver(() => {
    Rn(), le();
  }), Ae.observe(_), pe = new MutationObserver((e) => {
    let t = !1;
    for (const n of e)
      n.type === "childList" && n.addedNodes.length && (t = !0);
    t && le();
  }), pe.observe(_, { childList: !0 }), Ce = !0;
}
function _n() {
  Ce && (Ce = !1, _ && se && _.removeEventListener("scroll", se), Ae?.disconnect(), pe?.disconnect(), te && cancelAnimationFrame(te), te = 0, _ && _.querySelectorAll(`.mes[data-${Fe}="1"]`).forEach(Pt), _ = null, se = null, Ae = null, pe = null, oe = null, ge = null);
}
function le() {
  !Ce || te || (te = requestAnimationFrame(() => {
    te = 0, wn();
  }));
}
function wn() {
  if (!_) return;
  const e = _.querySelectorAll(":scope > .mes");
  if (e.length < oe.threshold) return;
  const t = qe("#chat .mes_text"), n = !Je(t), r = _.scrollTop - oe.overscanPx, i = _.scrollTop + _.clientHeight + oe.overscanPx;
  let x = 0;
  for (let l = 0; l < e.length; l++) {
    const u = e[l], c = Tn(u, t, n), s = x, o = s + c;
    x = o;
    const a = o >= r && s <= i, F = u.dataset[Fe] === "1";
    a && F ? Pt(u) : !a && !F && Wn(u, c);
  }
}
function Tn(e, t, n) {
  const r = e.querySelector(".mes_text");
  if (!r) return e.getBoundingClientRect().height;
  const i = r.textContent || "", x = Qe(r), l = Mt(r), u = bn({ font: t, text: i, width: x, lineHeight: l }), c = Ln(e);
  if (c && c.signature === u && c.height) return c.height;
  let s = 0;
  if (n && x > 0)
    try {
      const o = vt(i, t);
      s = _t(o, x, l).height;
    } catch (o) {
      Rt("virtual-scroll: pretext.prepare failed, falling back to bbox", o);
    }
  if (!s)
    s = e.getBoundingClientRect().height || l;
  else {
    const o = e.getBoundingClientRect().height - r.getBoundingClientRect().height;
    Number.isFinite(o) && o > 0 && (s += o);
  }
  return Tt(e, { signature: u, height: s }), s;
}
function Rn() {
  if (!_) return;
  const e = _.querySelectorAll(":scope > .mes");
  for (const t of e) Tt(t, null);
}
function Wn(e, t) {
  const n = Array.from(e.children), r = document.createDocumentFragment();
  for (const u of n) r.appendChild(u);
  const i = document.createElement("template");
  i.content.appendChild(r);
  const x = Pn(i);
  e.dataset[Fe] = "1", e.dataset.pretextHeight = String(t), e.innerHTML = `<div class="${kn}" style="height:${t}px"></div>`;
  const l = document.createElement("script");
  l.type = "text/x-pretext-stash", l.textContent = x, e.appendChild(l);
}
function Pt(e) {
  const t = e.querySelector(':scope > script[type="text/x-pretext-stash"]');
  if (!t) {
    delete e.dataset[Fe];
    return;
  }
  const n = t.textContent || "";
  e.innerHTML = n, delete e.dataset[Fe], delete e.dataset.pretextHeight;
}
function Pn(e) {
  const t = document.createElement("div");
  return t.appendChild(e.content.cloneNode(!0)), t.innerHTML;
}
const In = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  mount: yn,
  unmount: _n
}, Symbol.toStringTag, { value: "Module" }));
let ye = !1, ue = 0, ne = 0, Me = null, K = null, G = null, He = 0;
function $n(e) {
  Me = e.logger, ye = !0, e.router.on("generationStarted", Gn), e.router.on("generationEnded", Et), e.router.on("generationStopped", Et), e.router.on("streamTokenReceived", jn);
}
function Hn() {
  ye = !1, It(), Ht(), Me = null, K = null, G = null;
}
function Gn() {
  zn();
}
function Et() {
  It(), Ht(), K = null, G = null;
}
function jn() {
  ye && (G || $t(), !ne && (ne = requestAnimationFrame(() => {
    ne = 0, Kn();
  })));
}
function zn() {
  if (ue) return;
  let e = 0;
  const t = () => {
    ye && ($t() || (e += 1, !(e > 40) && (ue = window.setTimeout(t, 100))));
  };
  t();
}
function It() {
  ue && (clearTimeout(ue), ue = 0), ne && (cancelAnimationFrame(ne), ne = 0);
}
function $t() {
  const e = document.querySelector("#chat");
  if (!e) return !1;
  const t = e.querySelector(":scope > .mes:last-of-type");
  if (!t) return !1;
  const n = t.querySelector(".mes_text");
  return n ? (K = t, G = n, !0) : !1;
}
function Kn() {
  if (!G || !K) return;
  const e = G.textContent || "";
  if (!e) return;
  const t = qe("#chat .mes_text");
  if (Je(t)) return;
  const n = Qe(G), r = Mt(G);
  if (n <= 0) return;
  let i = 0;
  try {
    const u = vt(e, t);
    i = _t(u, n, r).height;
  } catch (u) {
    Un("stream-stabilizer: prepare failed", u);
    return;
  }
  const x = K.getBoundingClientRect().height - G.getBoundingClientRect().height, l = i + (Number.isFinite(x) && x > 0 ? x : 0);
  l > He && (He = l, K.style.minHeight = `${Math.ceil(l)}px`);
}
function Ht() {
  K && (K.style.minHeight = ""), He = 0;
}
function Un(...e) {
  Me && Me(...e);
}
const qn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  mount: $n,
  unmount: Hn
}, Symbol.toStringTag, { value: "Module" })), Ge = "pretext-typography-style", xe = "pretext-fold-btn", J = "data-pretext-fold", Gt = "data-pretext-fold-line-limit";
let je = !1, ve = null, W = null, Be = null, De = null, ce = null;
function Jn(e) {
  ve = e.settings.typography, De = e.logger, Yn(), W = document.querySelector("#chat"), W && (Be = new MutationObserver(() => At()), Be.observe(W, { childList: !0, subtree: !0 }), ce = (t) => {
    const n = t.target.closest?.(`.${xe}`);
    n && tx(n);
  }, W.addEventListener("click", ce), je = !0, At());
}
function Qn() {
  je && (je = !1, Be?.disconnect(), Be = null, W && ce && W.removeEventListener("click", ce), Vn(), W && (W.querySelectorAll(`.${xe}`).forEach((e) => e.remove()), W.querySelectorAll(`[${J}]`).forEach((e) => {
    e.removeAttribute(J), e.style.maxHeight = "", e.style.overflow = "";
  })), W = null, ve = null, De = null, ce = null);
}
function Yn() {
  if (document.getElementById(Ge)) return;
  const e = `
#chat .mes_text {
  overflow-wrap: anywhere;
  word-break: normal;
  line-break: auto;
  text-wrap: pretty;
}
#chat .mes_text[${J}="collapsed"] {
  overflow: hidden;
}
.${xe} {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 10px;
  font-size: 0.85em;
  border-radius: 4px;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
}
.${xe}:hover { opacity: 1; }
`, t = document.createElement("style");
  t.id = Ge, t.textContent = e, document.head.appendChild(t);
}
function Vn() {
  document.getElementById(Ge)?.remove();
}
function At() {
  if (!W) return;
  W.querySelectorAll(".mes_text").forEach(Xn);
}
function Xn(e) {
  if (!e || e.dataset.pretextFoldChecked === "1") return;
  e.dataset.pretextFoldChecked = "1";
  const t = e.textContent || "";
  if (t.length < 200) return;
  const n = qe("#chat .mes_text"), r = Qe(e);
  if (Je(n) || r <= 0) return;
  let i = 0;
  try {
    const x = Dn(t, n);
    i = mn(x, r, () => {
    });
  } catch (x) {
    nx("typography: prepareWithSegments failed", x);
    return;
  }
  i <= ve.foldThresholdLines || Zn(e, i);
}
function Zn(e, t) {
  if (e.querySelector(`.${xe}`)) return;
  e.setAttribute(J, "collapsed"), e.setAttribute(Gt, String(ve.foldThresholdLines)), jt(e);
  const n = document.createElement("button");
  n.type = "button", n.className = xe, n.textContent = zt(t), n.dataset.totalLines = String(t), e.parentElement?.insertBefore(n, e.nextSibling);
}
function jt(e) {
  const t = Number(e.getAttribute(Gt)) || 15, n = parseFloat(getComputedStyle(e).lineHeight) || 22;
  e.style.maxHeight = `${t * n}px`, e.style.overflow = "hidden";
}
function ex(e) {
  e.style.maxHeight = "", e.style.overflow = "";
}
function tx(e) {
  const t = e.previousElementSibling;
  if (!t || !t.classList.contains("mes_text")) return;
  t.getAttribute(J) === "collapsed" ? (t.setAttribute(J, "expanded"), ex(t), e.textContent = "收起") : (t.setAttribute(J, "collapsed"), jt(t), e.textContent = zt(Number(e.dataset.totalLines) || 0));
}
function zt(e) {
  return e ? `展开 (共 ${e} 行)` : "展开";
}
function nx(...e) {
  De && De(...e);
}
const xx = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  mount: Jn,
  unmount: Qn
}, Symbol.toStringTag, { value: "Module" })), ze = [
  { key: "virtualScroll", mod: In },
  { key: "streamStabilizer", mod: qn },
  { key: "typography", mod: xx }
];
let me = !1, P = null, Q = null, q = null, Ke = /* @__PURE__ */ new Set();
const Kt = (...e) => {
  Q?.debug?.log && console.log("[pretext-render]", ...e);
};
function tt() {
  const e = globalThis.SillyTavern;
  return e && typeof e.getContext == "function" ? e.getContext() : null;
}
function ae() {
  if (me) return;
  const e = tt();
  if (!e) {
    setTimeout(ae, 50);
    return;
  }
  P = e, Q = Jt(P), q = t0(P.eventSource, P.eventTypes || P.event_types), q.on("chatChanged", () => {
    Te(), ht(), fe();
  }), q.on("settingsUpdated", () => {
    Te(), ht(), fe();
  }), q.on("messageEdited", () => {
    Te();
  }), gt(P, Q, () => fe()), me = !0, fe(), Kt("booted with settings", Q);
}
function fe() {
  for (const { mod: t } of ze)
    try {
      t.unmount();
    } catch (n) {
      console.warn("[pretext-render] unmount failed", n);
    }
  if (Ke.clear(), !Q.enabled) return;
  const e = {
    settings: Q,
    router: q,
    logger: Kt,
    sillyTavern: P
  };
  for (const { key: t, mod: n } of ze)
    if (Q[t]?.enabled)
      try {
        n.mount(e), Ke.add(t);
      } catch (r) {
        console.error(`[pretext-render] mount(${t}) failed`, r);
      }
}
const Ne = tt();
if (Ne) {
  const t = (Ne.eventTypes || Ne.event_types || {}).APP_READY || "APP_READY";
  Ne.eventSource.on(t, () => ae()), setTimeout(() => ae(), 0);
} else {
  const e = Date.now(), t = setInterval(() => {
    tt() ? (clearInterval(t), ae()) : Date.now() - e > 3e4 && (clearInterval(t), console.warn("[pretext-render] gave up waiting for SillyTavern.getContext"));
  }, 100);
}
function sx() {
  ae();
}
function rx() {
  if (me) {
    for (const { mod: e } of ze)
      try {
        e.unmount();
      } catch {
      }
    Ke.clear(), Yt(), q?.offAll(), q = null, me = !1;
  }
}
function ox() {
  rx(), P?.extensionSettings && delete P.extensionSettings[j], P?.extension_settings && delete P.extension_settings[j], Ct(P);
}
export {
  sx as onActivate,
  ox as onDelete,
  rx as onDisable
};
//# sourceMappingURL=index.js.map
