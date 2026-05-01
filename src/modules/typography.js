// Typography: small wins that add up.
// 1. CSS rules that improve multilingual line breaking and prevent ugly
//    half-broken English words inside Chinese paragraphs.
// 2. An automatic "expand / collapse" affordance on very long messages, with
//    pretext doing the line-counting so the threshold honors the actual
//    rendered width (not a naive character count).

import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext';
import { probeFont, readContentWidth, isUntrustedFont } from '../lib/font-probe.js';

const STYLE_ID = 'pretext-typography-style';
const FOLD_BTN_CLASS = 'pretext-fold-btn';
const FOLD_STATE_ATTR = 'data-pretext-fold';
const FOLD_LIMIT_ATTR = 'data-pretext-fold-line-limit';

let active = false;
let context = null;
let cfg = null;
let chatEl = null;
let chatMutationObserver = null;
let logger = null;
let foldDelegationHandler = null;

export function mount(ctx) {
  context = ctx;
  cfg = ctx.settings.typography;
  logger = ctx.logger;
  injectStyle();
  chatEl = document.querySelector('#chat');
  if (!chatEl) return;
  // Re-evaluate fold state when messages change.
  chatMutationObserver = new MutationObserver(() => evaluateAll());
  chatMutationObserver.observe(chatEl, { childList: true, subtree: true });
  // Single delegated click handler instead of one per button.
  foldDelegationHandler = (ev) => {
    const btn = ev.target.closest?.(`.${FOLD_BTN_CLASS}`);
    if (!btn) return;
    toggleFold(btn);
  };
  chatEl.addEventListener('click', foldDelegationHandler);
  active = true;
  evaluateAll();
}

export function unmount() {
  if (!active) return;
  active = false;
  chatMutationObserver?.disconnect();
  chatMutationObserver = null;
  if (chatEl && foldDelegationHandler) {
    chatEl.removeEventListener('click', foldDelegationHandler);
  }
  removeStyle();
  // Strip everything we added from existing messages.
  if (chatEl) {
    chatEl.querySelectorAll(`.${FOLD_BTN_CLASS}`).forEach((b) => b.remove());
    chatEl
      .querySelectorAll(`[${FOLD_STATE_ATTR}]`)
      .forEach((el) => {
        el.removeAttribute(FOLD_STATE_ATTR);
        el.style.maxHeight = '';
        el.style.overflow = '';
      });
  }
  chatEl = null;
  context = null;
  cfg = null;
  logger = null;
  foldDelegationHandler = null;
}

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const css = `
#chat .mes_text {
  overflow-wrap: anywhere;
  word-break: normal;
  line-break: auto;
  text-wrap: pretty;
}
#chat .mes_text[${FOLD_STATE_ATTR}="collapsed"] {
  overflow: hidden;
}
.${FOLD_BTN_CLASS} {
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
.${FOLD_BTN_CLASS}:hover { opacity: 1; }
`;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

function removeStyle() {
  document.getElementById(STYLE_ID)?.remove();
}

function evaluateAll() {
  if (!chatEl) return;
  const messages = chatEl.querySelectorAll('.mes_text');
  messages.forEach(evaluateOne);
}

function evaluateOne(textEl) {
  if (!textEl || textEl.dataset.pretextFoldChecked === '1') return;
  textEl.dataset.pretextFoldChecked = '1';

  const text = textEl.textContent || '';
  if (text.length < 200) return; // cheap rejection for short messages

  const font = probeFont('#chat .mes_text');
  const width = readContentWidth(textEl);
  if (isUntrustedFont(font) || width <= 0) return;

  let lineCount = 0;
  try {
    const prepared = prepareWithSegments(text, font);
    lineCount = walkLineRanges(prepared, width, () => {});
  } catch (e) {
    log('typography: prepareWithSegments failed', e);
    return;
  }

  if (lineCount <= cfg.foldThresholdLines) return;

  attachFold(textEl, lineCount);
}

function attachFold(textEl, totalLines) {
  if (textEl.querySelector(`.${FOLD_BTN_CLASS}`)) return;
  textEl.setAttribute(FOLD_STATE_ATTR, 'collapsed');
  textEl.setAttribute(FOLD_LIMIT_ATTR, String(cfg.foldThresholdLines));
  applyCollapse(textEl);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = FOLD_BTN_CLASS;
  btn.textContent = collapseLabel(totalLines);
  btn.dataset.totalLines = String(totalLines);
  // Sit the button just after the text element so the fold itself can
  // shrink without hiding it.
  textEl.parentElement?.insertBefore(btn, textEl.nextSibling);
}

function applyCollapse(textEl) {
  const limit = Number(textEl.getAttribute(FOLD_LIMIT_ATTR)) || 15;
  const lh = parseFloat(getComputedStyle(textEl).lineHeight) || 22;
  textEl.style.maxHeight = `${limit * lh}px`;
  textEl.style.overflow = 'hidden';
}

function applyExpand(textEl) {
  textEl.style.maxHeight = '';
  textEl.style.overflow = '';
}

function toggleFold(btn) {
  const textEl = btn.previousElementSibling;
  if (!textEl || !textEl.classList.contains('mes_text')) return;
  const state = textEl.getAttribute(FOLD_STATE_ATTR);
  if (state === 'collapsed') {
    textEl.setAttribute(FOLD_STATE_ATTR, 'expanded');
    applyExpand(textEl);
    btn.textContent = '收起';
  } else {
    textEl.setAttribute(FOLD_STATE_ATTR, 'collapsed');
    applyCollapse(textEl);
    btn.textContent = collapseLabel(Number(btn.dataset.totalLines) || 0);
  }
}

function collapseLabel(totalLines) {
  return totalLines ? `展开 (共 ${totalLines} 行)` : '展开';
}

function log(...args) {
  if (logger) logger(...args);
}
