// Stream stabilizer: prevents the chat bubble from jumping in height as
// streaming tokens arrive.
//
// Approach
// --------
// During generation, we locate the currently-streaming `.mes_text` node and
// continuously predict its final wrapped height with pretext. We pin a
// `min-height` on the bubble so visible height grows monotonically — the
// bubble can still get taller (more text than predicted) but never shrinks
// mid-frame. That alone removes 90% of the perceived "jitter".
//
// We never replace the text content; SillyTavern's own renderer keeps doing
// that. We only touch `style.minHeight`.

import { prepare, layout } from '@chenglou/pretext';
import { probeFont, readContentWidth, readLineHeight, isUntrustedFont } from '../lib/font-probe.js';

let active = false;
let pollHandle = 0;
let rafId = 0;
let context = null;
let logger = null;
let streamingMes = null;
let streamingTextEl = null;
let lastPin = 0;

export function mount(ctx) {
  context = ctx;
  logger = ctx.logger;
  active = true;
  // Subscribe through the event router; ctx exposes router.
  ctx.router.on('generationStarted', onGenStart);
  ctx.router.on('generationEnded', onGenEnd);
  ctx.router.on('generationStopped', onGenEnd);
  ctx.router.on('streamTokenReceived', onToken);
}

export function unmount() {
  active = false;
  stopWatch();
  releasePin();
  context = null;
  logger = null;
  streamingMes = null;
  streamingTextEl = null;
}

function onGenStart() {
  // The streaming target appears slightly after generation starts; poll the
  // last `.mes` until we see one with `data-mesid` and an empty/short
  // `.mes_text`. As a fallback, also begin a token-driven pass.
  startWatch();
}

function onGenEnd() {
  stopWatch();
  releasePin();
  streamingMes = null;
  streamingTextEl = null;
}

function onToken() {
  if (!active) return;
  if (!streamingTextEl) attachToLatest();
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    pin();
  });
}

function startWatch() {
  if (pollHandle) return;
  let attempts = 0;
  const tick = () => {
    if (!active) return;
    if (attachToLatest()) return; // success
    attempts += 1;
    if (attempts > 40) return; // ~4s give-up
    pollHandle = window.setTimeout(tick, 100);
  };
  tick();
}

function stopWatch() {
  if (pollHandle) {
    clearTimeout(pollHandle);
    pollHandle = 0;
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

function attachToLatest() {
  const chat = document.querySelector('#chat');
  if (!chat) return false;
  // The streaming message is always the last `.mes` and typically has no
  // user-edit affordances yet. We don't filter on author here; the user can
  // also stream their own message in some flows.
  const mes = chat.querySelector(':scope > .mes:last-of-type');
  if (!mes) return false;
  const textEl = mes.querySelector('.mes_text');
  if (!textEl) return false;
  streamingMes = mes;
  streamingTextEl = textEl;
  return true;
}

function pin() {
  if (!streamingTextEl || !streamingMes) return;
  const text = streamingTextEl.textContent || '';
  if (!text) return;

  const font = probeFont('#chat .mes_text');
  if (isUntrustedFont(font)) return; // bail to avoid bad predictions

  const width = readContentWidth(streamingTextEl);
  const lineHeight = readLineHeight(streamingTextEl);
  if (width <= 0) return;

  let predicted = 0;
  try {
    const prepared = prepare(text, font);
    predicted = layout(prepared, width, lineHeight).height;
  } catch (e) {
    log('stream-stabilizer: prepare failed', e);
    return;
  }

  // Account for chrome (padding, borders, surrounding buttons inside .mes).
  const delta =
    streamingMes.getBoundingClientRect().height -
    streamingTextEl.getBoundingClientRect().height;
  const target = predicted + (Number.isFinite(delta) && delta > 0 ? delta : 0);

  // Monotonic: only ever grow. This is what kills the layout-shift feel.
  if (target > lastPin) {
    lastPin = target;
    streamingMes.style.minHeight = `${Math.ceil(target)}px`;
  }
}

function releasePin() {
  if (streamingMes) streamingMes.style.minHeight = '';
  lastPin = 0;
}

function log(...args) {
  if (logger) logger(...args);
}
