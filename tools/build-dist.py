#!/usr/bin/env python3
import base64, gzip, json, re, shutil, sys, urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENGINE = ROOT / 'engine'
DIST = ROOT / 'dist'
SITE = ROOT / 'site'
DIST.mkdir(exist_ok=True)

VERSION = '2.4.4'
ENGINE_URL = sys.argv[1] if len(sys.argv) > 1 else ''


def minify_dashboard(html):
    parts = re.split(r'(<style[\s\S]*?</style>|<script[\s\S]*?</script>)', html)
    out = []
    for p in parts:
        if p.startswith('<style'):
            inner = p[p.index('>') + 1:p.rindex('</style>')]
            inner = re.sub(r'/\*[\s\S]*?\*/', '', inner)
            inner = re.sub(r'\s+', ' ', inner).strip()
            out.append('<style>' + inner + '</style>')
        elif p.startswith('<script'):
            inner = p[p.index('>') + 1:p.rindex('</script>')]
            lines = []
            for ln in inner.split('\n'):
                t = ln.strip()
                if not t or t.startswith('//'):
                    continue
                lines.append(t)
            out.append('<script>' + '\n'.join(lines) + '</script>')
        else:
            p = re.sub(r'<!--[\s\S]*?-->', '', p)
            p = re.sub(r'\s+', ' ', p)
            p = re.sub(r'> <', '><', p)
            out.append(p.strip())
    return ''.join(out)


dash = (ENGINE / 'dashboard.html').read_text(encoding='utf-8')
geo = (ENGINE / 'geo-data.js').read_text(encoding='utf-8')
dash = dash.replace('/*__GEO__*/', geo)

fonts_css = []
for fam, weights, fname in [
    ('Barlow Condensed', '500 700', 'BarlowCondensed-700.woff2'),
    ('IBM Plex Mono', '400 600', 'IBMPlexMono-400.woff2'),
]:
    b64 = base64.b64encode((ROOT / 'fonts' / fname).read_bytes()).decode()
    fonts_css.append(
        "@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;"
        "src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, weights, b64)
    )
dash = dash.replace('/*__FONTS_CSS__*/', '\n'.join(fonts_css))
(DIST / 'dashboard.html').write_text(dash.replace('__JP_ID__', '000000'), encoding='utf-8')

dash_min = minify_dashboard(dash)
dash_json = json.dumps(dash_min, ensure_ascii=False).replace('</', '<\\/')
boot = (ENGINE / 'bootstrap.js').read_text(encoding='utf-8')
boot = re.sub(r"var VERSION = '[^']*';", "var VERSION = '" + VERSION + "';", boot, count=1)
assert boot.count('__DASH_HTML__') == 1
engine_js = boot.replace('__DASH_HTML__', dash_json)
(DIST / 'jp-stats-engine.js').write_text(engine_js, encoding='utf-8')

header = f"""// ==UserScript==
// @name         JetPhotos 统计台（非官方）
// @namespace    jp-stats
// @version      {VERSION}
// @description  任意摄影师的 JetPhotos 全量照片统计仪表盘：免登录、本地缓存、增量更新，内置限速；非官方社区工具。
// @author       JP Stats
// @match        https://www.jetphotos.com/*
// @match        https://jetphotos.com/*
// @grant        none
// @run-at       document-idle
// @noframes
// @license      MIT
// ==/UserScript==

"""
(DIST / 'jp-stats.user.js').write_text(header + engine_js, encoding='utf-8')

# Greasy Fork variant: keep the embedded dashboard unminified so the listing passes
# Greasy Fork's "no minified code" check.
dash_chunks = [dash[i:i + 2500] for i in range(0, len(dash), 2500)]
dash_gf_expr = ' +\n'.join(json.dumps(c, ensure_ascii=False).replace('</', '<\\/') for c in dash_chunks)
engine_gf = boot.replace('__DASH_HTML__', dash_gf_expr)
(DIST / 'jp-stats.greasyfork.user.js').write_text(header + engine_gf, encoding='utf-8')

bm_offline = 'javascript:' + urllib.parse.quote(engine_js + '\nvoid 0;', safe='')
(DIST / 'bookmarklet-offline.txt').write_text(bm_offline, encoding='utf-8')

if ENGINE_URL:
    # 引擎地址可能已带查询串（例如托管平台的 sharecode），此时用 & 追加版本号
    sep = '&' if '?' in ENGINE_URL else '?'
    loader = (
        "javascript:(function(){if(window.__JP_STATS__){window.__JP_OPEN_PANEL&&window.__JP_OPEN_PANEL();return;}"
        "var s=document.createElement('script');s.src='" + ENGINE_URL + sep + "v=" + VERSION + "';"
        "s.onerror=function(){alert('JP 统计引擎加载失败，请检查网络或使用离线版书签。')};"
        "document.body.appendChild(s);})();void 0;"
    )
    bm_online = 'javascript:' + urllib.parse.quote(loader[len('javascript:'):], safe='')
    (DIST / 'bookmarklet-online.txt').write_text(bm_online, encoding='utf-8')

landing = ENGINE / 'landing.html'
if landing.exists():
    html = landing.read_text(encoding='utf-8')
    html = html.replace('__BM_OFFLINE__', '#')
    html = html.replace('@@BMRAW@@', bm_offline)
    html = html.replace('__BM_ONLINE__', bm_online if ENGINE_URL else '')
    html = html.replace('__ENGINE_URL__', ENGINE_URL)
    html = html.replace('__VERSION__', VERSION)
    (ROOT / 'start.html').write_text(html, encoding='utf-8')

    # 静态托管输出：落地页即首页（个人统计页与原始数据不发布）
    for stale in ('demo.html', 'data.js'):
        try: (SITE / stale).unlink()
        except FileNotFoundError: pass
    # 静态托管把资源放在 assets/：部分托管平台会把 dist/ 当成构建产物跳过
    (SITE / 'assets').mkdir(parents=True, exist_ok=True)
    (SITE / 'index.html').write_text(html, encoding='utf-8')
    shutil.copytree(ROOT / 'fonts', SITE / 'fonts', dirs_exist_ok=True)
    for fn in ('jp-stats-engine.js', 'jp-stats.user.js', 'bookmarklet-offline.txt'):
        shutil.copyfile(DIST / fn, SITE / 'assets' / fn)

print('engine.js      %8d bytes' % len(engine_js.encode()))
print('user.js        %8d bytes' % len((header + engine_js).encode()))
print('bm-offline URL %8d chars' % len(bm_offline))
if ENGINE_URL:
    print('bm-online URL  %8d chars' % len(bm_online))
print('dashboard.html %8d bytes' % len(dash.encode()))