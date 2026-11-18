# Changelog

## 2.8.0 — 2026-11-13

- Random photo now uses the full-resolution JetPhotos image, falling back to the thumbnail/placeholder on error.
- The spotlight card uses a faded OpenStreetMap background centered on the aircraft position, with a theme-coloured aircraft marker and an OpenStreetMap attribution. Numeric latitude/longitude and airport-coordinate rows were removed.
- The card now shows explicit photo location and photo date fields. Aircraft age is intentionally not displayed, since JetPhotos has no age field and Planespotters is not reliably accessible from the page. A free OSM background map replaces the numeric coordinates.
- Live rows keep altitude, speed/track, flight and route; last-flight rows keep airport, flight status and next flight.
- Userscript: the floating “统计此摄影师” pill remains available on JetPhotos content pages, including photo detail, `/photographer/<id>/photos` and `/members/photostats.php`. It is suppressed on upload-related pages (`/addphotos`, `/upload*`, `/submit`, etc.). The manual bookmarklet has no page restriction.
- Bookmarklet/link mode now uses the same high-resolution photo, photo location/date and map background, with a theme-coloured location pin at the photo airport. Its right panel shows large photo date/location/aircraft values, hides the unavailable FR24 status link, removes the duplicate small aircraft line and enlarges the airline name, and has no manual photo-change limit (the 2/minute limit applies only to FR24-enabled userscript/extension mode).

## 2.7.1 — 2026-11-13

- Added an optional unpacked Chrome/Edge companion in `extension/`. It creates an offscreen FR24 popup, queries the public FR24 web endpoints through a content script, and minimizes the window after a successful lookup.
- The stats dashboard now detects the extension and prefers it over the userscript popup. Without the extension it falls back to the userscript popup; bookmarklets still show the photo + direct FR24 link.
- The companion window is created offscreen and unfocused, then minimized after the first successful lookup. A minimized page may need to be restored if the browser freezes its content script; the background retries once by restoring it.
- Positions still come from the FR24 search API (about 11 km precision); no paid FR24 API is used.

## 2.7.0 — 2026-11-13

- Added a random spotlight above the distribution section: a random photo from the gallery is paired with a FR24 live/status lookup.
- The userscript now also matches flightradar24.com and runs a companion mode. It opens a small FR24 popup, queries the public FR24 web APIs in-page, and returns live position, current flight, or the last flight/airport via postMessage.
- Added an optional unpacked Chrome/Edge companion in `extension/`: it creates an offscreen FR24 popup and minimizes it after a successful lookup. The userscript companion popup remains the fallback when the extension is not installed.
- Civil passenger/cargo/military classification remains official-genre based with the common-freighter backstop added in 2.6.3.
- If FR24 has no live position, the last operated flight's destination airport is used. If there is no flight record, the spotlight automatically tries another photo (up to four attempts).
- Manual “next photo” is limited to two changes per rolling minute; automatic fallback attempts do not consume that quota.
- Bookmarklet-only installs show the random photo plus a direct FR24 aircraft link; automatic FR24 lookup is available only with the userscript companion.
- Limitation: positions come from the FR24 search API (about 11 km precision); exact LiveFeed decoding is not included in this version. No FR24 paid API is used.

## 2.6.3 — 2026-11-13

- Classification: military/civilian now follows JetPhotos' official genre filter (`genre=2` on the photographer's photo results) instead of the model/airline heuristic.
- Cargo: within civilian photos, cargo uses the official "Cargo Aircraft Photos" category first, then a built-in common-freighter database pass (freighter conversions and known cargo models such as the 777F, IL-76 and An-124) catches cargo aircraft missing from the official category. Military classification takes precedence, so military cargo is counted as military.
- The previous heuristic remains as a local fallback when the official endpoints are unavailable, and official ID sets are cached per photographer.

## 2.6.2 — 2026-11-13

- FR24 theme: the floating "statistics for this photographer" trigger now uses a dark-gray background with a yellow border and yellow text, matching the rest of the FR24 controls.

## 2.6.1 — 2026-11-13

- Cache menu: the trash button now offers clearing the current photographer's cache or all photographers' caches; theme and language settings are preserved.
- FR24 theme: popup headers use the dark header/yellow title treatment, the family/subtype tabs follow FR24 pill controls, and collapse rows are transparent with gold text.
- FR24 theme: the gallery filter toggle is black with a yellow border and yellow text in both expanded and collapsed states.
- Mobile gallery: registration and like badges are smaller and sit closer to the top-left corner; the gallery filter bar starts collapsed and auto-collapses when scrolling down through the gallery.
- Gallery cards: the registration badge text and border now follow the active theme color instead of blue.
- Fixes: mobile filter layout, fixed-height type/manufacturer cards, and exact special-livery category results.

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
