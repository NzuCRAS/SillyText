// SillyTavern's event_types enum changes between versions. Instead of
// importing constants we look up names at runtime, with sensible fallbacks
// (or graceful no-ops). This keeps the extension loadable across a wide
// range of ST versions.

const CANDIDATES = {
  appReady: ['APP_READY', 'app_ready'],
  chatChanged: ['CHAT_CHANGED', 'chat_changed'],
  characterMessageRendered: [
    'CHARACTER_MESSAGE_RENDERED',
    'character_message_rendered',
  ],
  userMessageRendered: ['USER_MESSAGE_RENDERED', 'user_message_rendered'],
  messageEdited: ['MESSAGE_EDITED', 'message_edited'],
  messageDeleted: ['MESSAGE_DELETED', 'message_deleted'],
  messageSwiped: ['MESSAGE_SWIPED', 'message_swiped'],
  generationStarted: ['GENERATION_STARTED', 'generation_started'],
  generationStopped: ['GENERATION_STOPPED', 'generation_stopped'],
  generationEnded: ['GENERATION_ENDED', 'generation_ended'],
  streamTokenReceived: [
    'STREAM_TOKEN_RECEIVED',
    'stream_token_received',
    'SMOOTH_STREAM_TOKEN_RECEIVED',
  ],
  settingsUpdated: ['SETTINGS_UPDATED', 'settings_updated'],
};

export function resolveEventNames(eventTypes) {
  const out = {};
  for (const [logical, names] of Object.entries(CANDIDATES)) {
    out[logical] = names.find((n) => eventTypes && n in eventTypes) || null;
  }
  return out;
}

export function makeRouter(eventSource, eventTypes) {
  const resolved = resolveEventNames(eventTypes);
  const bindings = [];

  function on(logical, handler) {
    const evt = resolved[logical];
    if (!evt) return false;
    const realName = eventTypes[evt];
    eventSource.on(realName, handler);
    bindings.push({ realName, handler });
    return true;
  }

  function offAll() {
    for (const { realName, handler } of bindings) {
      try {
        eventSource.removeListener?.(realName, handler);
      } catch (_) {
        // Older versions may use a different un-subscribe API; ignore.
      }
    }
    bindings.length = 0;
  }

  return { on, offAll, resolved };
}
