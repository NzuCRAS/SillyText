// Reads the actual rendered font of a chat message and returns a CSS
// shorthand string suitable for pretext (e.g. "500 16px Inter").
//
// pretext requires shorthand because that is what canvas's measureText() also
// accepts. We deliberately avoid system-ui per pretext's README warning: on
// macOS its measurements diverge from canvas's ground truth.

const SYSTEM_UI_TOKENS = ['system-ui', '-apple-system', 'BlinkMacSystemFont'];

let cachedFont = null;
let cachedSampleSelector = null;

export function probeFont(sampleSelector = '#chat .mes_text', force = false) {
  if (!force && cachedFont && cachedSampleSelector === sampleSelector) {
    return cachedFont;
  }
  cachedSampleSelector = sampleSelector;

  const sample = document.querySelector(sampleSelector);
  if (!sample) {
    // Fall back to body font when no message is in the DOM yet (first load).
    return readShorthand(document.body);
  }
  cachedFont = readShorthand(sample);
  return cachedFont;
}

export function invalidateFontCache() {
  cachedFont = null;
}

export function isUntrustedFont(shorthand) {
  if (!shorthand) return true;
  return SYSTEM_UI_TOKENS.some((tok) => shorthand.includes(tok));
}

function readShorthand(el) {
  const cs = getComputedStyle(el);
  const weight = cs.fontWeight || '400';
  const size = cs.fontSize || '16px';
  // Use the first concrete family from the stack, stripping quotes. The
  // Canvas 2D API ignores generic families like "sans-serif" and falls back
  // to the platform default — that is fine; pretext just needs a value the
  // browser will resolve identically to what's painted.
  const family = (cs.fontFamily || 'sans-serif')
    .split(',')[0]
    .trim()
    .replace(/^['"]|['"]$/g, '') || 'sans-serif';
  return `${weight} ${size} "${family}"`;
}

export function readContentWidth(el) {
  if (!el) return 0;
  const cs = getComputedStyle(el);
  const w = el.clientWidth - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0');
  return Math.max(0, w);
}

export function readLineHeight(el) {
  if (!el) return 22;
  const cs = getComputedStyle(el);
  const lh = cs.lineHeight;
  if (lh === 'normal') {
    const fs = parseFloat(cs.fontSize || '16');
    return fs * 1.4;
  }
  const v = parseFloat(lh);
  return Number.isFinite(v) && v > 0 ? v : 22;
}
