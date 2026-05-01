// Settings UI binding: renders settings.html into the SillyTavern extension
// settings panel and wires every input to the in-memory settings object.
//
// We deliberately avoid SillyTavern's `renderExtensionTemplateAsync` here:
// it requires the extension to be served from the third-party folder and
// expects a specific path scheme. Instead we ship the markup as a string
// constant produced at build time (see vite text loader workaround below)
// and inject it directly. This works whether the extension is mounted as a
// "third-party" extension or as a manual install for power users.

import settingsHtml from '../settings.html?raw';
import { EXTENSION_NAME, persistSettings } from './settings.js';

let mounted = false;
let onSettingsChanged = null;

export function mountSettingsUI(context, settings, onChange) {
  if (mounted) return;
  onSettingsChanged = onChange;

  const host =
    document.getElementById('extensions_settings2') ||
    document.getElementById('extensions_settings');
  if (!host) {
    // Retry once the extensions panel renders.
    const obs = new MutationObserver(() => {
      if (
        document.getElementById('extensions_settings2') ||
        document.getElementById('extensions_settings')
      ) {
        obs.disconnect();
        mountSettingsUI(context, settings, onChange);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.id = `${EXTENSION_NAME}-settings`;
  wrapper.innerHTML = settingsHtml;
  host.appendChild(wrapper);
  mounted = true;

  bind(wrapper, context, settings);
}

export function unmountSettingsUI() {
  document.getElementById(`${EXTENSION_NAME}-settings`)?.remove();
  mounted = false;
  onSettingsChanged = null;
}

function bind(root, context, settings) {
  const $ = (id) => root.querySelector(`#${id}`);

  // Initial population
  $('pretext_enabled').checked = settings.enabled;
  $('pretext_vs_enabled').checked = settings.virtualScroll.enabled;
  $('pretext_vs_threshold').value = settings.virtualScroll.threshold;
  $('pretext_vs_overscan').value = settings.virtualScroll.overscanPx;
  $('pretext_ss_enabled').checked = settings.streamStabilizer.enabled;
  $('pretext_ty_enabled').checked = settings.typography.enabled;
  $('pretext_ty_fold').value = settings.typography.foldThresholdLines;
  $('pretext_debug_log').checked = settings.debug.log;
  $('pretext_debug_overlay').checked = settings.debug.overlay;

  // Wire every input to settings + persist
  const wireBool = (id, path) =>
    $(id).addEventListener('change', (e) => {
      writePath(settings, path, e.target.checked);
      flushed(context);
    });
  const wireInt = (id, path, min, max) =>
    $(id).addEventListener('change', (e) => {
      let v = parseInt(e.target.value, 10);
      if (!Number.isFinite(v)) v = readPath(settings, path);
      v = Math.max(min, Math.min(max, v));
      e.target.value = String(v);
      writePath(settings, path, v);
      flushed(context);
    });

  wireBool('pretext_enabled', ['enabled']);
  wireBool('pretext_vs_enabled', ['virtualScroll', 'enabled']);
  wireInt('pretext_vs_threshold', ['virtualScroll', 'threshold'], 20, 5000);
  wireInt('pretext_vs_overscan', ['virtualScroll', 'overscanPx'], 0, 4000);
  wireBool('pretext_ss_enabled', ['streamStabilizer', 'enabled']);
  wireBool('pretext_ty_enabled', ['typography', 'enabled']);
  wireInt('pretext_ty_fold', ['typography', 'foldThresholdLines'], 5, 200);
  wireBool('pretext_debug_log', ['debug', 'log']);
  wireBool('pretext_debug_overlay', ['debug', 'overlay']);
}

function flushed(context) {
  persistSettings(context);
  onSettingsChanged?.();
}

function writePath(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
  cur[path[path.length - 1]] = value;
}

function readPath(obj, path) {
  let cur = obj;
  for (let i = 0; i < path.length; i++) cur = cur?.[path[i]];
  return cur;
}
