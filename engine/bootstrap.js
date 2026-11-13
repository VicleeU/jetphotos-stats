(function () {
'use strict';
if (window.__JP_STATS__) { if (window.__JP_OPEN_PANEL) window.__JP_OPEN_PANEL(); return; }
window.__JP_STATS__ = true;

var DASH_HTML = __DASH_HTML__;
var VERSION = '1.0.0';

function detectId() {
  var m = location.pathname.match(/\/photographer\/(\d+)/);
  if (m) return m[1];
  m = (location.search || '').match(/[?&]photog_id=(\d+)/);
  if (m) return m[1];
  var links = document.querySelectorAll('a[href*="/photographer/"]');
  for (var i = 0; i < links.length; i++) {
    var mm = (links[i].getAttribute('href') || '').match(/\/photographer\/(\d+)/);
    if (mm) return mm[1];
  }
  return '';
}
function parseInput(s) {
  s = (s || '').trim();
  var m = s.match(/photographer\/(\d+)/) || s.match(/photog_id=(\d+)/) || s.match(/^(\d{2,9})$/);
  return m ? m[1] : null;
}
function themeName() {
  try {
    var t = localStorage.getItem('jpstats.theme');
    if (t === 'green' || t === 'fr24' || t === 'yellow') return t;
  } catch (e) {}
  return 'yellow';
}
function applyTheme() {
  var cls = 'jpst-' + themeName();
  if (pill) { pill.classList.remove('jpst-yellow', 'jpst-green', 'jpst-fr24'); pill.classList.add(cls); }
  if (panel) { panel.classList.remove('jpst-yellow', 'jpst-green', 'jpst-fr24'); panel.classList.add(cls); }
}

var css = '' +
'.jpst-pill,.jpst-panel,.jpst-panel *,.jpst-ov{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;box-sizing:border-box}' +
'.jpst-pill{position:fixed;right:18px;bottom:84px;z-index:2147483640;display:flex;align-items:center;gap:9px;padding:11px 18px;border-radius:26px;border:1px solid rgba(var(--jpa-rgb,245,197,24),.4);background:linear-gradient(160deg,#171a1e,#141619);color:#f2f3ef;font-size:13.5px;font-weight:600;letter-spacing:.03em;cursor:grab;touch-action:none;user-select:none;box-shadow:0 8px 28px #000a,0 0 18px rgba(var(--jpa-rgb,245,197,24),.13);transition:transform .2s,box-shadow .2s}.jpst-pill:active{cursor:grabbing}' +
'.jpst-pill:hover{transform:translateY(-2px);box-shadow:0 12px 32px #000c,0 0 26px rgba(var(--jpa-rgb,245,197,24),.25)}' +
'.jpst-pill .jpst-dot{width:8px;height:8px;border-radius:50%;background:var(--jpa,#f5c518);box-shadow:0 0 9px var(--jpa,#f5c518);animation:jpst-blink 2.4s infinite}' +
'@keyframes jpst-blink{0%,100%{opacity:1}50%{opacity:.3}}' +
'.jpst-panel{--jpa:#f5c518;--jpa-rgb:245,197,24;position:fixed;right:18px;bottom:76px;z-index:2147483641;width:330px;max-width:calc(100vw - 36px);border-radius:16px;border:1px solid #3a4148;background:linear-gradient(180deg,#171a1e,#141619);box-shadow:0 24px 60px #000d;padding:18px;color:#f2f3ef;animation:jpst-pop .22s cubic-bezier(.2,.9,.3,1.2)}' +
'@keyframes jpst-pop{from{transform:translateY(10px) scale(.97);opacity:0}}' +
'.jpst-panel h3{margin:0 0 2px;padding-right:34px;font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px}' +
'.jpst-panel h3 .jpst-v{margin-left:auto;font-size:9.5px;font-weight:500;color:var(--jpa);background:rgba(var(--jpa-rgb),.06);border:1px solid rgba(var(--jpa-rgb),.25);border-radius:9px;padding:1px 7px;font-family:ui-monospace,Menlo,monospace;white-space:nowrap}' +
'.jpst-panel .jpst-sub{font-size:11.5px;color:#a5aca6;margin:0 0 12px}' +
'.jpst-panel input{width:100%;background:#16181b;border:1px solid #272c32;color:#f2f3ef;border-radius:9px;padding:10px 12px;font-size:13.5px;outline:none}' +
'.jpst-panel input:focus{border-color:rgba(var(--jpa-rgb),.4)}' +
'.jpst-panel .jpst-err{font-size:11.5px;margin-top:7px;min-height:15px}' +
'.jpst-panel .jpst-err.ok{color:var(--jpa)}' +
'.jpst-panel .jpst-err.bad{color:#ff6b8a}' +
'.jpst-panel .jpst-go{width:100%;margin-top:9px;padding:11px;border-radius:10px;border:1px solid var(--jpa);background:rgba(var(--jpa-rgb),.06);color:var(--jpa);font-size:14px;font-weight:700;cursor:pointer;transition:background .2s,border-color .2s}' +
'.jpst-panel .jpst-go:hover{background:rgba(var(--jpa-rgb),.14);border-color:var(--jpa)}' +
'.jpst-panel .jpst-note{margin-top:11px;font-size:10.5px;color:#6d746f;line-height:1.6}' +
'.jpst-panel .jpst-x{position:absolute;top:10px;right:12px;background:none;border:none;color:#6d746f;font-size:15px;cursor:pointer;padding:4px}' +
'.jpst-panel .jpst-x:hover{color:#f2f3ef}' +
'.jpst-pill.jpst-green,.jpst-panel.jpst-green{--jpa:#d3f36b;--jpa-rgb:211,243,107}' +
'.jpst-fr24.jpst-pill{background:#24282c;border-color:#f5c518;color:#f5c518;box-shadow:0 10px 26px #0007,0 0 0 1px rgba(245,197,24,.25)}' +
'.jpst-fr24.jpst-pill:hover{background:#2c3136;box-shadow:0 14px 30px #0008,0 0 0 1px rgba(245,197,24,.55)}' +
'.jpst-fr24.jpst-pill .jpst-dot{background:#f5c518;box-shadow:0 0 0 3px rgba(245,197,24,.22)}' +
'.jpst-fr24.jpst-panel{background:#fff;border-color:#d7dbe0;color:#1b1f23;padding:0 18px 18px}' +
'.jpst-fr24.jpst-panel h3{margin:0 -18px 12px;padding:14px 42px 14px 18px;background:#24282c;color:#f5c518;border-radius:15px 15px 0 0;font-size:15px}' +
'.jpst-fr24.jpst-panel h3 .jpst-v{color:#e9edf0;background:#ffffff12;border-color:#ffffff2e}' +
'.jpst-fr24.jpst-panel .jpst-sub{color:#4a525a}' +
'.jpst-fr24.jpst-panel input{background:#fff;border-color:#d7dbe0;color:#1b1f23}' +
'.jpst-fr24.jpst-panel input:focus{border-color:#f5c518}' +
'.jpst-fr24.jpst-panel .jpst-go{background:#f5c518;border-color:#f5c518;color:#1b1f23}' +
'.jpst-fr24.jpst-panel .jpst-go:hover{background:#ffd83d;border-color:#ffd83d}' +
'.jpst-fr24.jpst-panel .jpst-note{color:#7d858e}' +
'.jpst-fr24.jpst-panel .jpst-x{color:#c7ced5}' +
'.jpst-fr24.jpst-panel .jpst-x:hover{color:#fff}' +
'.jpst-fr24.jpst-panel .jpst-err.ok{color:#b98800}' +
'.jpst-fr24.jpst-panel .jpst-err.bad{color:#c0304a}' +
'.jpst-ov{position:fixed;inset:0;z-index:2147483647;background:#0b0c0d}' +
'.jpst-ov iframe{width:100%;height:100%;border:0;display:block}' +
'@media (max-width:600px){.jpst-pill{right:12px;bottom:76px;padding:10px 15px;font-size:12.5px}}';

var styleEl = document.createElement('style');
styleEl.textContent = css;
(document.head || document.documentElement).appendChild(styleEl);

var pill = document.createElement('button');
pill.className = 'jpst-pill';
pill.type = 'button';
var detected = detectId();
pill.innerHTML = '<span class="jpst-dot"></span>' + (detected ? '统计此摄影师' : '统计台');
applyTheme();
pill.setAttribute('aria-label', '打开统计台');
document.body.appendChild(pill);

// 悬浮按钮可拖动，位置记忆
(function () {
  var KEY = 'jpstat.pillpos', drag = null, moved = 0;
  function place(x, y) {
    var r = pill.getBoundingClientRect();
    var maxX = Math.max(8, window.innerWidth - r.width - 8);
    var maxY = Math.max(8, window.innerHeight - r.height - 8);
    x = Math.max(8, Math.min(maxX, x));
    y = Math.max(8, Math.min(maxY, y));
    pill.style.left = x + 'px';
    pill.style.top = y + 'px';
    pill.style.right = 'auto';
    pill.style.bottom = 'auto';
    return { x: x, y: y };
  }
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') place(saved.x, saved.y);
  } catch (e) {}
  pill.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    var r = pill.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    moved = 0;
    pill.style.transition = 'none';
    try { pill.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
  });
  pill.addEventListener('pointermove', function (e) {
    if (!drag) return;
    moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
    place(e.clientX - drag.dx, e.clientY - drag.dy);
  });
  function endDrag() {
    if (!drag) return;
    drag = null;
    pill.style.transition = '';
    try {
      var r = pill.getBoundingClientRect();
      localStorage.setItem(KEY, JSON.stringify({ x: r.left, y: r.top }));
    } catch (err) {}
  }
  pill.addEventListener('pointerup', endDrag);
  pill.addEventListener('pointercancel', endDrag);
  pill.addEventListener('click', function (e) {
    if (moved > 6) { moved = 0; e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  window.addEventListener('resize', function () {
    var r = pill.getBoundingClientRect();
    if (pill.style.left) place(r.left, r.top);
  });
})();

var panel = null, ov = null, prevOverflow = '';

function closePanel() { if (panel) { panel.remove(); panel = null; } }
function positionPanel() {
  if (!panel) return;
  var pr = pill.getBoundingClientRect();
  var r = panel.getBoundingClientRect();
  var left = Math.min(Math.max(8, pr.right - r.width), window.innerWidth - r.width - 8);
  var top = pr.top - r.height - 12;
  if (top < 8) top = Math.min(window.innerHeight - r.height - 8, pr.bottom + 12);
  panel.style.right = 'auto';
  panel.style.bottom = 'auto';
  panel.style.left = Math.max(8, left) + 'px';
  panel.style.top = Math.max(8, top) + 'px';
}
function openPanel() {
  closePanel();
  detected = detectId();
  panel = document.createElement('div');
  panel.className = 'jpst-panel';
  panel.innerHTML =
    '<button class="jpst-x" type="button" aria-label="关闭">✕</button>' +
    '<h3>统计台 <span class="jpst-v">v' + VERSION + '</span></h3>' +
    '<p class="jpst-sub">任意摄影师的全量照片统计 · 免登录</p>' +
    '<input type="text" inputmode="numeric" placeholder="输入 ID 或主页链接" aria-label="摄影师 ID 或主页链接">' +
    '<div class="jpst-err"></div>' +
    '<button class="jpst-go" type="button">开始统计 ✈</button>' +
    '<p class="jpst-note">输入纯数字 ID，或 jetphotos.com/photographer/… 链接。<br>数据只留在你的浏览器本地，不经过任何服务器。</p>';
  document.body.appendChild(panel);
  applyTheme();
  positionPanel();
  setTimeout(positionPanel, 40);
  var input = panel.querySelector('input');
  var err = panel.querySelector('.jpst-err');
  if (detected) {
    input.value = detected;
    err.textContent = '已检测到当前页面摄影师：' + detected;
    err.className = 'jpst-err ok';
  }
  panel.querySelector('.jpst-x').addEventListener('click', closePanel);
  function go() {
    var id = parseInput(input.value);
    if (!id) {
      err.className = 'jpst-err bad';
      err.textContent = '请输入有效的数字 ID 或摄影师主页链接';
      input.focus();
      return;
    }
    openOverlay(id);
  }
  panel.querySelector('.jpst-go').addEventListener('click', go);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  setTimeout(function () { input.focus(); input.select(); }, 60);
}
function openOverlay(id) {
  closePanel();
  closeOverlay();
  prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  ov = document.createElement('div');
  ov.className = 'jpst-ov';
  var f = document.createElement('iframe');
  f.title = '统计台';
  f.setAttribute('allow', 'clipboard-write');
  f.srcdoc = DASH_HTML.split('__JP_ID__').join(id);
  ov.appendChild(f);
  document.body.appendChild(ov);
  pill.style.display = 'none';
}
function closeOverlay() {
  if (ov) { ov.remove(); ov = null; }
  document.body.style.overflow = prevOverflow || '';
  pill.style.display = '';
}
window.__JP_CLOSE = closeOverlay;
window.__JP_OPEN_PANEL = function () { closeOverlay(); openPanel(); };
pill.addEventListener('click', function () { if (panel) closePanel(); else openPanel(); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && ov && !panel) closeOverlay();
});
try {
  window.addEventListener('storage', function (e) {
    if (!e.key || e.key === 'jpstats.theme') applyTheme();
  });
} catch (e) {}
})();