# QA checklist

Run before each release. Use a local server and synthetic data where possible.

## Build

- [ ] `python3 tools/build-dist.py` completes without errors.
- [ ] `node tools/qa/check-inline.js engine/dashboard.html engine/landing.html` passes.
- [ ] `dist/jp-stats.user.js` and `dist/jp-stats.greasyfork.user.js` have the expected version.
- [ ] No personal data, logs, caches or `dist/` files are staged.

## Desktop

- [ ] Install page loads at 1440 px; bookmark and userscript cards align.
- [ ] Userscript installs and the floating 统计台 button appears on a JetPhotos page.
- [ ] Launcher panel opens; ID or profile URL starts a scan.
- [ ] Themes: yellow (default), soft green, FR24 switch instantly and persist.
- [ ] Language: EN/中 toggle swaps headings and dynamic status text.
- [ ] Gallery filters, chips, sorting and reset work.
- [ ] Photo modal keeps its size; remarks scroll inside their fixed box.
- [ ] Deep fetch completes or fails transparently with reasons.

## Gear edge case (2.4.0)

- [ ] With synthetic data whose photos have no camera/lens, after complete deep fetch the gear card shows 「无设备信息」 and no lock.
- [ ] Before deep fetch completes, the gear card still shows the deep-fetch lock.
- [ ] If only camera or lens is empty, that tab shows the empty message and the other tab still lists data.

## Globe

- [ ] Default rotation is enabled; static state stops drawing and rAF after settling.
- [ ] Rotation pauses when the card is mostly offscreen or the tab is hidden.
- [ ] Dragging, zoom reset, airport selection and theme changes still render correctly.
- [ ] No stale frame or jump when returning from offscreen.

## Mobile

- [ ] 390 px and 320 px: no horizontal overflow.
- [ ] KPI numbers and toggles fit.
- [ ] Install page explains iOS/Android limitations.

## Publish checks

- [ ] GitHub Pages install page and `dist/jp-stats.user.js` return 200.
- [ ] Greasy Fork listing shows the new version and install asset `@version` matches.
- [ ] `CHANGELOG.md` updated.
