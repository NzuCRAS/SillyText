// Centralized settings: schema, defaults, and read/write helpers bound to
// SillyTavern's extension_settings store.
//
// The default values err on the safe side: features kick in only when they
// help. Virtual scroll, in particular, only activates past a message-count
// threshold so small chats keep the native experience.

export const EXTENSION_NAME = 'sillytavern-pretext-render';

export const DEFAULT_SETTINGS = Object.freeze({
  enabled: true,
  virtualScroll: {
    enabled: true,
    threshold: 200,
    overscanPx: 800,
  },
  streamStabilizer: {
    enabled: true,
  },
  typography: {
    enabled: true,
    foldThresholdLines: 15,
    rewriteWrap: false,
  },
  debug: {
    overlay: false,
    log: false,
  },
});

function deepClone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const out = {};
  for (const k of Object.keys(value)) out[k] = deepClone(value[k]);
  return out;
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      deepMerge(target[key], sv);
    } else {
      target[key] = sv;
    }
  }
  return target;
}

export function loadSettings(context) {
  const all = context.extensionSettings || context.extension_settings;
  if (!all) return deepClone(DEFAULT_SETTINGS);
  if (!all[EXTENSION_NAME]) all[EXTENSION_NAME] = deepClone(DEFAULT_SETTINGS);
  // Merge defaults forward so newly-added fields appear without losing
  // user-tweaked values.
  const merged = deepMerge(deepClone(DEFAULT_SETTINGS), all[EXTENSION_NAME]);
  all[EXTENSION_NAME] = merged;
  return merged;
}

export function persistSettings(context) {
  const save = context.saveSettingsDebounced;
  if (typeof save === 'function') save();
}
