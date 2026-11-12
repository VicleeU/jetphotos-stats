# Changelog

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
