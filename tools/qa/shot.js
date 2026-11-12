#!/usr/bin/env node
// Usage: node tools/qa/shot.js <url> <out.png> [width] [height] [full|viewport] [extraWaitMs]
const { spawn } = require('child_process');
const fs = require('fs');
const EDGE = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
const [url, out, w, h, mode, extraWait] = [
  process.argv[2], process.argv[3],
  +process.argv[4] || 1440, +process.argv[5] || 900,
  process.argv[6] || 'full', +process.argv[7] || 0,
];
const PORT = 9444;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!url || !out) {
    console.error('usage: node tools/qa/shot.js <url> <out.png> [width] [height] [full|viewport] [extraWaitMs]');
    process.exit(1);
  }
  const proc = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
    '--remote-debugging-port=' + PORT,
    '--window-size=' + Math.max(w, 500) + ',' + Math.max(h, 400), 'about:blank',
  ], { stdio: 'ignore' });
  const kill = () => { try { proc.kill('SIGKILL'); } catch (e) {} };
  setTimeout(() => { console.error('timeout'); kill(); process.exit(1); }, 120000);

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(1000);
    try {
      target = (await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json())
        .find(t => t.type === 'page' && t.webSocketDebuggerUrl);
    } catch (e) {}
  }
  if (!target) { console.error('no devtools target'); kill(); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method) events.push(m.method);
  };
  const send = (method, params) => new Promise(res => {
    const i = ++id;
    pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params: params || {} }));
  });
  await new Promise(res => ws.onopen = res);
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
  await send('Page.navigate', { url });
  for (let i = 0; i < 40 && !events.includes('Page.loadEventFired'); i++) await sleep(250);
  await sleep(3500 + extraWait);

  let clip;
  if (mode === 'full') {
    const lm = await send('Page.getLayoutMetrics');
    const cs = lm.result.cssContentSize || lm.result.contentSize;
    clip = { x: 0, y: 0, width: Math.min(cs.width, w), height: Math.min(cs.height, 12000), scale: 1 };
  } else {
    clip = { x: 0, y: 0, width: w, height: h, scale: 1 };
  }
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
  fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log('saved', out, clip.width + 'x' + clip.height);
  ws.close();
  kill();
}
main();
