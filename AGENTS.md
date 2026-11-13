# AGENTS.md

## Project

Unofficial, client-side JetPhotos photographer statistics dashboard. The public repository contains the engine, install page, build scripts and fonts. Personal photographer data and caches belong outside this repository and must never be committed.

- Current version: **2.5.5**
- Repository: https://github.com/VicleeU/jetphotos-stats
- Install page: https://vicleeu.github.io/jetphotos-stats/
- Greasy Fork: https://greasyfork.org/zh-CN/scripts/605109

## Source of truth

- `main` — source code only (`engine/`, `tools/`, `fonts/`, docs).
- `gh-pages` — generated install page and download assets. Do not edit by hand.
- `dist/`, `site/`, `start.html` are build outputs and are ignored by git.

## Build

```bash
python3 tools/build-dist.py
```

With the public engine URL for the online bookmarklet:

```bash
python3 tools/build-dist.py https://vicleeu.github.io/jetphotos-stats/dist/jp-stats-engine.js
```

Outputs: `dist/jp-stats.user.js`, `dist/jp-stats.greasyfork.user.js`, `dist/jp-stats-engine.js`, `dist/bookmarklet-offline.txt`, `site/`.

## Test

```bash
node tools/qa/check-inline.js engine/dashboard.html engine/landing.html
python3 tools/qa/serve.py . 8877
node tools/qa/shot.js http://127.0.0.1:8877/engine/landing.html /tmp/landing.png 1440 900 viewport
```

See `tools/qa/checklist.md` for the manual regression checklist.

## Release

Follow `RELEASE.md`. Version numbers live in `tools/build-dist.py`. Publishing to GitHub, Pages or Greasy Fork requires the owner's approval and login; never store credentials or tokens in the repository.

- GitHub push may need a proxy and HTTP/1.1.
- Greasy Fork has no public API. Use the browser and let the owner complete login/2FA. A Safari JXA helper is in `tools/publish/greasyfork-safari.js`.
- Greasy Fork rejects code with any line longer than 5000 characters containing `function`; the `jp-stats.greasyfork.user.js` build splits the embedded dashboard string for this reason.

## Do not commit

- personal photographer IDs, names, photo records, API responses or caches;
- `data.js`, `photos.jsonl`, `base-list.json`, `scrape-errors.json`, logs;
- `dist/`, `site/`, `start.html`;
- tokens, cookies, passwords or private screenshots.

Use synthetic fixtures for testing. Do not add real photographer data to the repository or to public demos.

## Known constraints

- No server-side scraping. Runtime fetching happens in the visitor's browser and can be blocked by Cloudflare (403) or same-origin policy.
- Keep the built-in rate limits, backoff and retries.
- The official JetPhotos logo is used for identification only; the project is unofficial and unaffiliated. Keep the disclaimer.
- Qoder Sites publishing is paused. The install page is hosted twice from the same `site/` output: GitHub Pages (primary) and a WorkBuddy cloud mirror at `jetphotos-stats.app.workbuddy.host` for better reachability from mainland China. The mirror requires its `?sharecode=` query parameter on every request, so the online bookmarklet built against it embeds that sharecode; if the sharecode ever changes, rebuild and redeploy.
- Hosted assets live under `site/assets/`, not `site/dist/`: some hosts treat `dist/` as build output and skip it. `tools/build-dist.py` copies to `assets/` for this reason.
- No server-side scraping is technically possible on the mirror: it only serves static files. jetphotos.com returns `X-Frame-Options: SAMEORIGIN` and no CORS headers, and blocks non-browser clients with 403, so the engine can only ever run inside a jetphotos.com page.
