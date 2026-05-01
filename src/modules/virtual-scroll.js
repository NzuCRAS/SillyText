// Virtual scroll: replaces off-screen messages with same-height placeholders,
// keeping the DOM lean during scrolling on long chats.
//
// Strategy
// --------
// We never reorder or recreate SillyTavern's own message nodes. Instead, for
// each message currently in the chat (`#chat > .mes`), we either keep its
// real subtree mounted or, when it's far enough from the viewport, swap its
// inner content with a `<div class="pretext-placeholder">` of the measured
// height. The outer `.mes` element stays put — that's important because ST
// keys a lot of behavior off `mesid` attributes on those wrappers.
//
// Heights come from pretext.layout() (cheap, no DOM hit). After a real-node
// pass we correct the cached height with getBoundingClientRect, since
// markdown/HTML rendering can add a few px that pretext (text-only) misses.

import { prepare, layout } from '@chenglou/pretext';
import { probeFont, readContentWidth, readLineHeight, isUntrustedFont } from '../lib/font-probe.js';
import { getEntry, setEntry, signature } from '../lib/measure-cache.js';

const PLACEHOLDER_CLASS = 'pretext-placeholder';
const HOLDER_DATASET = 'pretextOriginal';

let chatEl = null;
let scrollHandler = null;
let resizeObserver = null;
let mutationObserver = null;
let rafId = 0;
let active = false;
let cfg = null;
let context = null;
let logger = null;

function log(...args) {
  if (logger) logger(...args);
}

export function mount(ctx) {
  context = ctx;
  cfg = ctx.settings.virtualScroll;
  chatEl = document.querySelector('#chat');
  logger = ctx.logger;
  if (!chatEl) {
    log('virtual-scroll: #chat not found, retrying via observer');
    waitForChat();
    return;
  }
  bind();
  schedulePass();
}

function waitForChat() {
  const obs = new MutationObserver(() => {
    chatEl = document.querySelector('#chat');
    if (chatEl) {
      obs.disconnect();
      bind();
      schedulePass();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

function bind() {
  scrollHandler = () => schedulePass();
  chatEl.addEventListener('scroll', scrollHandler, { passive: true });

  resizeObserver = new ResizeObserver(() => {
    invalidateAllHeights();
    schedulePass();
  });
  resizeObserver.observe(chatEl);

  mutationObserver = new MutationObserver((records) => {
    let needsPass = false;
    for (const r of records) {
      if (r.type === 'childList' && r.addedNodes.length) needsPass = true;
    }
    if (needsPass) schedulePass();
  });
  mutationObserver.observe(chatEl, { childList: true });

  active = true;
}

export function unmount() {
  if (!active) return;
  active = false;
  if (chatEl && scrollHandler) chatEl.removeEventListener('scroll', scrollHandler);
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  // Restore every placeholder we left behind.
  if (chatEl) {
    const stashed = chatEl.querySelectorAll(`.mes[data-${HOLDER_DATASET}="1"]`);
    stashed.forEach(restoreReal);
  }
  chatEl = null;
  scrollHandler = null;
  resizeObserver = null;
  mutationObserver = null;
  context = null;
  cfg = null;
  logger = null;
}

function schedulePass() {
  if (!active || rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    pass();
  });
}

function pass() {
  if (!chatEl) return;
  const messages = chatEl.querySelectorAll(':scope > .mes');
  if (messages.length < cfg.threshold) return; // below threshold: do nothing.

  const font = probeFont('#chat .mes_text');
  const trustFont = !isUntrustedFont(font);

  const viewportTop = chatEl.scrollTop - cfg.overscanPx;
  const viewportBottom = chatEl.scrollTop + chatEl.clientHeight + cfg.overscanPx;

  let runningTop = 0;
  for (let i = 0; i < messages.length; i++) {
    const mes = messages[i];
    const height = ensureHeight(mes, font, trustFont);
    const top = runningTop;
    const bottom = top + height;
    runningTop = bottom;

    const isVisible = bottom >= viewportTop && top <= viewportBottom;
    const isPlaceholder = mes.dataset[HOLDER_DATASET] === '1';

    if (isVisible && isPlaceholder) {
      restoreReal(mes);
    } else if (!isVisible && !isPlaceholder) {
      stashReal(mes, height);
    }
  }
}

function ensureHeight(mes, font, trustFont) {
  const textEl = mes.querySelector('.mes_text');
  if (!textEl) return mes.getBoundingClientRect().height;

  const text = textEl.textContent || '';
  const width = readContentWidth(textEl);
  const lineHeight = readLineHeight(textEl);
  const sig = signature({ font, text, width, lineHeight });
  const cached = getEntry(mes);
  if (cached && cached.signature === sig && cached.height) return cached.height;

  let measured = 0;
  if (trustFont && width > 0) {
    try {
      const prepared = prepare(text, font);
      const r = layout(prepared, width, lineHeight);
      measured = r.height;
    } catch (e) {
      log('virtual-scroll: pretext.prepare failed, falling back to bbox', e);
    }
  }

  if (!measured) {
    measured = mes.getBoundingClientRect().height || lineHeight;
  } else {
    // Add chrome: padding/borders/buttons around .mes_text. Estimate as the
    // diff between mes height and mes_text height the first time we see a
    // real node. After that the cached delta is reused.
    const realDelta =
      mes.getBoundingClientRect().height - textEl.getBoundingClientRect().height;
    if (Number.isFinite(realDelta) && realDelta > 0) measured += realDelta;
  }

  setEntry(mes, { signature: sig, height: measured });
  return measured;
}

function invalidateAllHeights() {
  if (!chatEl) return;
  // We don't iterate WeakMap, so just touch each visible message and let
  // the signature check rebuild on next pass.
  const messages = chatEl.querySelectorAll(':scope > .mes');
  for (const m of messages) setEntry(m, null);
}

function stashReal(mes, height) {
  const inner = Array.from(mes.children);
  const fragment = document.createDocumentFragment();
  for (const child of inner) fragment.appendChild(child);

  const stash = document.createElement('template');
  stash.content.appendChild(fragment);

  // Stash markup as an HTML string so the DOM is fully detached and GC'd.
  // Heavier on string conversion but lighter on memory across long sessions.
  const html = templateInnerHTML(stash);
  mes.dataset[HOLDER_DATASET] = '1';
  mes.dataset.pretextHeight = String(height);
  mes.innerHTML = `<div class="${PLACEHOLDER_CLASS}" style="height:${height}px"></div>`;
  // Keep the original markup in a hidden script so we can put it back.
  const stashNode = document.createElement('script');
  stashNode.type = 'text/x-pretext-stash';
  stashNode.textContent = html;
  mes.appendChild(stashNode);
}

function restoreReal(mes) {
  const stashNode = mes.querySelector(':scope > script[type="text/x-pretext-stash"]');
  if (!stashNode) {
    delete mes.dataset[HOLDER_DATASET];
    return;
  }
  const html = stashNode.textContent || '';
  mes.innerHTML = html;
  delete mes.dataset[HOLDER_DATASET];
  delete mes.dataset.pretextHeight;
}

function templateInnerHTML(tpl) {
  const wrapper = document.createElement('div');
  wrapper.appendChild(tpl.content.cloneNode(true));
  return wrapper.innerHTML;
}
