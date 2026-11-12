#!/usr/bin/env python3
"""Create a synthetic copy of a JP_DATA file with all camera/lens fields removed.

Usage: python3 tools/qa/blank-gear.py input-data.js output-data.js

Useful for checking the "无设备信息" state. Never commit the input or output:
they can contain personal photographer data.
"""
import json
import re
import sys
from pathlib import Path

if len(sys.argv) != 3:
    raise SystemExit(__doc__)
src, dst = Path(sys.argv[1]), Path(sys.argv[2])
text = src.read_text(encoding='utf-8')
m = re.search(r'window\.JP_DATA\s*=\s*(\{[\s\S]*\})\s*;?\s*$', text)
if not m:
    raise SystemExit('input does not look like window.JP_DATA = {...};')
data = json.loads(m.group(1))
for photo in data.get('photos', []):
    photo['camera'] = ''
    photo.pop('camBody', None)
    photo.pop('lens', None)
dst.write_text('window.JP_DATA = ' + json.dumps(data, ensure_ascii=False) + ';', encoding='utf-8')
print(f'wrote {dst} with {len(data.get("photos", []))} synthetic records')
