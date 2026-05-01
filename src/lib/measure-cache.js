// Caches the (prepared, height) pair per message so we don't re-measure on
// every scroll tick. Keys are the message DOM elements; the cache is a
// WeakMap so detached elements get GC'd automatically.
//
// Each entry also stores a `signature` (font+text+width hash) so we can
// invalidate when the user edits a message or the theme changes.

const cache = new WeakMap();

export function getEntry(el) {
  return cache.get(el) || null;
}

export function setEntry(el, entry) {
  cache.set(el, entry);
}

export function invalidate(el) {
  cache.delete(el);
}

export function clearAll() {
  // WeakMap has no .clear() — replace by re-creating. We keep the same export
  // identity by reassigning entries lazily; here we simply walk known keys
  // via a side index would be overkill, so we just rely on signature checks
  // to invalidate stale entries on next touch.
}

// Cheap, stable string hash (FNV-1a, 32-bit). Good enough for cache-key use:
// collisions are bounded and a miss only costs a re-measure.
export function hash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export function signature({ font, text, width, lineHeight }) {
  return `${font}|${width.toFixed(0)}|${lineHeight.toFixed(2)}|${hash(text)}`;
}
