(function () {
  window.addEventListener('message', function (ev) {
    var d = ev.data || {};
    if (!d || d.__jpfr24ext !== 1) return;
    var src = ev.source || window;
    function reply(payload) {
      payload.__jpfr24ext = 1;
      payload.token = d.token;
      try { src.postMessage(payload, '*'); } catch (e) {}
    }
    if (d.type === 'ping') { reply({ type: 'ext-ready' }); return; }
    if (d.type !== 'connect' && d.type !== 'lookup' && d.type !== 'focus') return;
    chrome.runtime.sendMessage({
      type: 'jpfr24ext-' + d.type,
      token: d.token,
      reg: d.reg,
      id: d.id
    }, function (resp) {
      if (chrome.runtime.lastError) resp = { ok: false, error: chrome.runtime.lastError.message };
      reply({ type: 'ext-result', kind: d.type, id: d.id, resp: resp || { ok: false, error: 'empty response' } });
    });
  });
})();