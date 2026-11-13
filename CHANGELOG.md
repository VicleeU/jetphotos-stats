# Changelog

## 2.5.5 — 2026-11-13

- Mobile layout: KPI cards fit narrow screens; filter bar collapses to one row when it exceeds three rows; taller mobile globe stage.
- Badges: parse earned profile badges, show them under the hero meta, and add badge filtering with exact category-page photo IDs; packaged 31 unique high-resolution SVG badge assets and catalog.
- Photo categories: add the full official JetPhotos Category filter, including Special Paint Schemes and Night/Sunrise/Sunset.
- Type filter: strictly separate civil passenger, civil cargo, and military aircraft; airport scenes are excluded.
- Category stats: add three donut charts for type, special livery, and night/dusk above the timeline.
- Type/manufacturer cards: use full-width cards with larger clickable pie charts, fixed height, internal scrolling, and local-only pie highlighting that does not refresh the dashboard or gallery.
- Fixes: exact special-livery category results use only the authoritative category pages; badges, categories, and items stay in sync with all pages of each category.

## 2.4.4 — 2026-11-13

- Globe: clicking an airport light point now rotates the globe smoothly until that point is centered.
- Uses the existing 650ms cubic in-out transition at 60fps, taking the shortest rotation path.
- Dense clusters center on the nearest clicked point while still selecting the whole cluster.
- Personal dashboard and public engine are aligned.

## 2.4.3 — 2026-11-13

- Globe: all rendering is now capped at 60fps; the idle auto-spin no longer drops to 30fps.
- Globe: the ＋ / － zoom buttons now use the same 460ms eased zoom transition as “reset to default size”; zooming in still stops auto-spin and syncs the toggle.
- Airport list transitions, drag/inertia, and zoom reset remain 60fps.
- Personal dashboard and public engine are aligned.

## 2.4.2 — 2026-11-13

- Dashboard: the top-right ✕ now only exits the dashboard and keeps the local cache.
- Added a trash-can button to the left of ✕ for clearing cached photo details; theme and language preferences are preserved.
- Both actions pause an active deep fetch on the first click to avoid accidental data loss.
- English and Chinese labels/tooltips updated.

## 2.4.1 — 2026-11-13

- Install page: added a one-click Greasy Fork install button with an auto-update note; the standalone `jp-stats.user.js` download remains as an offline/manual fallback.
- Documentation: clarify that Greasy Fork installs are updated by the userscript manager, while downloaded files must be replaced manually.
- No dashboard behavior changes.

## 2.4.0 — 2026-11-12

- Fix: after a complete deep fetch, if a photographer has no camera or lens information, the gear card now removes the deep-fetch lock and shows “无设备信息” instead of “待深度抓取解锁”.
- The empty message is also shown per tab when only one of camera/lens has no data.
- Personal and engine dashboards are aligned.

## 2.3.14 — 2026-11-12

- First public Greasy Fork release.
- Three themes: yellow (default), soft green, FR24.
- Demand-driven globe rendering: static state without rAF, 30 fps auto-spin, 60 fps interaction, offscreen/hidden pause.
- Gulfstream models split into model series.
- Optional gear/detail handling, fixed-size photo modal, bilingual UI and mobile fixes.

Earlier 2.3.x builds were local-only iterations of the dashboard, globe, themes, filters and packaging.
