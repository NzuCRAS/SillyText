// Entry point for the Pretext Render Optimizer SillyTavern extension.
//
// Loading flow
// ------------
// 1. SillyTavern reads `manifest.json` and dynamically imports `dist/index.js`
//    (this file, after Vite bundling).
// 2. Top-level code runs. We avoid heavy work here and just set up a deferred
//    bootstrap that waits for `APP_READY`.
// 3. SillyTavern calls the function named in `manifest.json:hooks.activate`
//    (if any) — we use that as a second entry point in case `APP_READY` has
//    already fired before we got here.
// 4. On `APP_READY` we discover events, mount modules, and inject the
//    settings UI.
//
// Cross-version safety
// --------------------
// SillyTavern internals shift between releases. We resolve event names at
// runtime via lib/event-router.js and gracefully degrade if a hook is
// missing (e.g. STREAM_TOKEN_RECEIVED on older builds).

import { loadSettings, persistSettings, EXTENSION_NAME } from './settings.js';
import { mountSettingsUI, unmountSettingsUI } from './settings-ui.js';
import { makeRouter } from './lib/event-router.js';
import { invalidateFontCache } from './lib/font-probe.js';
import { clearCache as clearPretextCache } from '@chenglou/pretext';

import * as virtualScroll from './modules/virtual-scroll.js';
import * as streamStabilizer from './modules/stream-stabilizer.js';
import * as typography from './modules/typography.js';

const MODULES = [
  { key: 'virtualScroll', mod: virtualScroll },
  { key: 'streamStabilizer', mod: streamStabilizer },
  { key: 'typography', mod: typography },
];

let booted = false;
let context = null;
let settings = null;
let router = null;
let mountedKeys = new Set();

const logger = (...args) => {
  if (settings?.debug?.log) console.log('[pretext-render]', ...args);
};

function ensureContext() {
  // SillyTavern.getContext is the stable surface; fall back to the older
  // window.SillyTavern global in case some forks expose it differently.
  const root = globalThis.SillyTavern;
  if (root && typeof root.getContext === 'function') return root.getContext();
  return null;
}

function boot() {
  if (booted) return;
  const ctx = ensureContext();
  if (!ctx) {
    // The global isn't ready yet. Try again in a tick.
    setTimeout(boot, 50);
    return;
  }
  context = ctx;
  settings = loadSettings(context);

  router = makeRouter(context.eventSource, context.eventTypes || context.event_types);

  // Re-mount modules whenever the chat changes; cache invalidation is
  // implicit (signature mismatch on next pass).
  router.on('chatChanged', () => {
    invalidateFontCache();
    clearPretextCache();
    remountModules();
  });
  router.on('settingsUpdated', () => {
    invalidateFontCache();
    clearPretextCache();
    remountModules();
  });
  router.on('messageEdited', () => {
    invalidateFontCache();
  });

  // Mount UI + modules now.
  mountSettingsUI(context, settings, () => remountModules());

  booted = true;

  // If the chat container isn't yet in the DOM (early APP_READY), the modules
  // self-defer via MutationObserver.
  remountModules();

  logger('booted with settings', settings);
}

function remountModules() {
  // Unmount everything currently active.
  for (const { mod } of MODULES) {
    try {
      mod.unmount();
    } catch (e) {
      console.warn('[pretext-render] unmount failed', e);
    }
  }
  mountedKeys.clear();

  if (!settings.enabled) return;

  const sharedCtx = {
    settings,
    router,
    logger,
    sillyTavern: context,
  };

  for (const { key, mod } of MODULES) {
    if (!settings[key]?.enabled) continue;
    try {
      mod.mount(sharedCtx);
      mountedKeys.add(key);
    } catch (e) {
      console.error(`[pretext-render] mount(${key}) failed`, e);
    }
  }
}

// --- top-level bootstrap ----------------------------------------------------

const ctxOnLoad = ensureContext();
if (ctxOnLoad) {
  // APP_READY may already have fired by the time the bundle evaluates.
  const eventTypes = ctxOnLoad.eventTypes || ctxOnLoad.event_types || {};
  const appReadyName = eventTypes.APP_READY || 'APP_READY';
  ctxOnLoad.eventSource.on(appReadyName, () => boot());
  // Defensive: if APP_READY already fired (no replay), boot anyway after a
  // micro-delay so modules can find DOM nodes.
  setTimeout(() => boot(), 0);
} else {
  // Global not ready yet — wait until SillyTavern.getContext exists.
  const start = Date.now();
  const poll = setInterval(() => {
    if (ensureContext()) {
      clearInterval(poll);
      boot();
    } else if (Date.now() - start > 30_000) {
      clearInterval(poll);
      console.warn('[pretext-render] gave up waiting for SillyTavern.getContext');
    }
  }, 100);
}

// --- lifecycle hooks declared in manifest.json ------------------------------

export function onActivate() {
  // Manifest hook. Re-boot in case the user toggled the extension on after
  // load. boot() is idempotent.
  boot();
}

export function onDisable() {
  if (!booted) return;
  for (const { mod } of MODULES) {
    try { mod.unmount(); } catch (_) { /* swallow */ }
  }
  mountedKeys.clear();
  unmountSettingsUI();
  router?.offAll();
  router = null;
  booted = false;
}

export function onDelete() {
  // Clean up any leftover state owned by this extension. Settings are
  // wiped by SillyTavern itself when the extension is removed.
  onDisable();
  if (context?.extensionSettings) delete context.extensionSettings[EXTENSION_NAME];
  if (context?.extension_settings) delete context.extension_settings[EXTENSION_NAME];
  persistSettings(context);
}
