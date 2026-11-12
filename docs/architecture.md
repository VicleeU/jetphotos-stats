# Architecture

## Runtime

The distributed userscript is a single file. It injects a floating `统计台` button on `jetphotos.com`. Opening it creates a full-screen iframe whose `srcdoc` contains the dashboard engine.

```
jetphotos.com page
  └─ userscript / bookmarklet
       ├─ floating launcher
       └─ iframe (dashboard)
            ├─ fetch public photo list
            ├─ fetch photo detail pages (rate-limited)
            ├─ derive ranks and charts
            ├─ canvas globe
            └─ localStorage cache
```

All fetching and computation happen in the visitor's browser. There is no backend.

## Repository

```text
engine/
  dashboard.html     dashboard template (generic, no personal ID)
  landing.html       install/help page
  bootstrap.js       launcher, panel, iframe wrapper
  geo-data.js        packed airport coordinates, land mask, coastlines

tools/
  build-dist.py      builds userscript, engine, bookmarklets and site
  build-geo.py       regenerates geo-data.js from public datasets
  qa/                local build helpers and regression checklist
  publish/           release verification and Greasy Fork helper

fonts/               embedded OFL fonts and licenses
```

## Build variants

- `jp-stats.user.js` — standard userscript with minified dashboard template.
- `jp-stats.greasyfork.user.js` — the dashboard HTML is split into short string chunks so no line exceeds Greasy Fork's minification heuristic (a line >5000 characters containing `function`).
- `jp-stats-engine.js` — engine used by the online bookmarklet.
- `bookmarklet-offline.txt` — self-contained bookmarklet.
- `site/` — install page and downloadable assets deployed to `gh-pages`.

## Data model

The dashboard fetches the public photographer photo table, then optionally deep-fetches each detail page. Derived data lives only in memory and in `localStorage`, keyed by photographer ID. Camera/lens lists are empty when no photo carries gear information; after a complete deep fetch the UI must show “无设备信息” rather than a fetch lock.

## License boundary

Code is MIT. Fonts are OFL (see `fonts/`). Geographic data is public domain (OurAirports, Natural Earth). JetPhotos name/logo belong to JetPhotos and are used for identification only; the project is unofficial.
