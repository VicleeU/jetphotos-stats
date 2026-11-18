const FR24 = 'https://www.flightradar24.com/';
const SESSION_KEY = 'jpfr24-state';
let winId = null;
let tabId = null;
let ready = false;
let token = '';
let waiters = [];
let restored = null;

function makeToken() {
  return 'ext' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function notifyReady() {
  const list = waiters;
  waiters = [];
  list.forEach(fn => fn(true));
}

function waitReady(ms) {
  if (ready) return Promise.resolve(true);
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(false), ms);
    waiters.push(() => { clearTimeout(timer); resolve(true); });
  });
}

async function saveState() {
  try {
    await chrome.storage.session.set({ [SESSION_KEY]: { winId, tabId, token } });
  } catch (e) {}
}

async function restoreState() {
  try {
    const got = await chrome.storage.session.get(SESSION_KEY);
    const s = got && got[SESSION_KEY];
    if (!s || !s.winId) return;
    await chrome.windows.get(s.winId);
    winId = s.winId;
    tabId = s.tabId || null;
    token = s.token || '';
  } catch (e) {
    winId = null; tabId = null; token = '';
  }
}

async function ensureWindow() {
  if (restored) { await restored; restored = null; }
  if (winId) {
    try {
      const w = await chrome.windows.get(winId, { populate: true });
      if (!tabId && w.tabs && w.tabs[0]) tabId = w.tabs[0].id;
      return;
    } catch (e) {
      winId = null; tabId = null; ready = false;
    }
  }
  token = makeToken();
  const url = FR24 + '#jpext=' + encodeURIComponent(token);
  let w;
  try {
    w = await chrome.windows.create({
      url,
      type: 'popup',
      focused: false,
      left: -10000,
      top: -10000,
      width: 420,
      height: 300
    });
  } catch (e) {
    w = await chrome.windows.create({
      url,
      type: 'popup',
      focused: false,
      width: 420,
      height: 300
    });
  }
  winId = w.id;
  tabId = (w.tabs && w.tabs[0] && w.tabs[0].id) || null;
  ready = false;
  await saveState();
}

async function focusWindow() {
  if (!winId) return;
  try {
    await chrome.windows.update(winId, { state: 'normal', focused: true });
  } catch (e) {}
}

async function minimizeWindow() {
  if (!winId) return;
  try {
    await chrome.windows.update(winId, { state: 'minimized', focused: false });
  } catch (e) {}
}

async function sendToFr24(reg) {
  if (!tabId) throw new Error('FR24 tab is not ready');
  try {
    return await chrome.tabs.sendMessage(tabId, { type: 'jpext-lookup', reg });
  } catch (e) {
    // A minimized/discarded tab can lose its receiver. Restore once, wait for
    // the content script to announce itself again, then retry.
    await chrome.windows.update(winId, { state: 'normal', focused: false });
    ready = false;
    await waitReady(15000);
    return await chrome.tabs.sendMessage(tabId, { type: 'jpext-lookup', reg });
  }
}

async function handleLookup(msg) {
  await ensureWindow();
  const ok = await waitReady(45000);
  if (!ok) return { ok: false, error: 'FR24 window is not ready (Cloudflare or load timeout)' };
  let res;
  try {
    res = await sendToFr24(msg.reg);
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
  if (res && res.ok) await minimizeWindow();
  else if (res && res.error === 'challenge') await focusWindow();
  return res || { ok: false, error: 'empty FR24 response' };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return;
  if (msg.type === 'fr24-ready') {
    tabId = sender.tab && sender.tab.id;
    ready = true;
    saveState();
    notifyReady();
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'jpfr24ext-connect') {
    ensureWindow().then(() => waitReady(45000)).then(ok => sendResponse({ ok, ready: ok }));
    return true;
  }
  if (msg.type === 'jpfr24ext-lookup') {
    handleLookup(msg).then(sendResponse, e => sendResponse({ ok: false, error: String((e && e.message) || e) }));
    return true;
  }
  if (msg.type === 'jpfr24ext-focus') {
    focusWindow().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'jpfr24ext-feed') {
    const reg = String(msg.reg || '');
    const url = 'https://data-cloud.flightradar24.com/zones/fcgi/feed.js?reg=!' + encodeURIComponent(reg);
    fetch(url, { credentials: 'include' }).then(r => r.json()).then(j => {
      sendResponse({ ok: true, data: j });
    }).catch(e => sendResponse({ ok: false, error: String(e && e.message || e) }));
    return true;
  }
});

chrome.windows.onRemoved.addListener(id => {
  if (id === winId) {
    winId = null; tabId = null; ready = false; token = '';
    waiters = [];
    chrome.storage.session.remove(SESSION_KEY).catch(() => {});
  }
});

chrome.tabs.onUpdated.addListener((id, info) => {
  if (id === tabId && info.status === 'loading') ready = false;
});

restored = restoreState();