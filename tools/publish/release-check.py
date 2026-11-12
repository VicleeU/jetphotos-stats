#!/usr/bin/env python3
"""Pre-release checks for the public repository.

Checks:
- version in tools/build-dist.py;
- generated userscripts (if present) use the same version;
- generated install page (if present) uses the same version;
- no private data files or build output are tracked;
- no absolute user paths are tracked.
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
fail = []


def version():
    m = re.search(r"VERSION\s*=\s*'([^']+)'", (ROOT / 'tools/build-dist.py').read_text(encoding='utf-8'))
    if not m:
        raise SystemExit('VERSION not found in tools/build-dist.py')
    return m.group(1)


def tracked():
    try:
        out = subprocess.check_output(['git', 'ls-files'], cwd=ROOT, text=True)
        return [line for line in out.splitlines() if line]
    except Exception:
        return []


ver = version()
print('version:', ver)

for name in ('dist/jp-stats.user.js', 'dist/jp-stats.greasyfork.user.js'):
    path = ROOT / name
    if path.exists():
        m = re.search(r'//\s*@version\s+(\S+)', path.read_text(encoding='utf-8', errors='ignore'))
        if not m or m.group(1) != ver:
            fail.append(f'{name}: @version mismatch ({m.group(1) if m else "missing"})')

site = ROOT / 'site/index.html'
if site.exists():
    text = site.read_text(encoding='utf-8', errors='ignore')
    if ver not in text:
        fail.append('site/index.html does not contain the current version')

forbidden_names = {'data.js', 'photos.jsonl', 'base-list.json', 'scrape-errors.json'}
bad_paths = []
for f in tracked():
    p = Path(f)
    if p.name in forbidden_names or f.startswith(('dist/', 'site/')) or f == 'start.html':
        bad_paths.append(f)
    if '/Users/' in f or f.startswith('/'):
        bad_paths.append(f)
if bad_paths:
    fail.append('forbidden tracked paths: ' + ', '.join(bad_paths[:10]))

if fail:
    print('\nFAILED')
    for f in fail:
        print(' -', f)
    sys.exit(1)
print('OK')
