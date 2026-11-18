# JetPhotos Stats FR24 Companion (Chrome / Edge)

This extension is the optional minimized-window companion for the “随机图片 / RANDOM PHOTO” card in JetPhotos Stats. It uses the public FR24 web endpoints through a real browser page, not the paid FR24 API.

## What it does

- The stats page asks the extension for an FR24 lookup.
- The extension creates a small FR24 popup offscreen (`left:-10000`, `top:-10000`).
- The popup loads FR24 and passes Cloudflare using the normal browser session.
- A content script in the popup queries:
  - `/v1/search/web/find`
  - `/api/v2/flights/{id}`
  - `/api/v2/flights?fetchBy=reg`
  - `/api/v2/airports/{id}`
- The result is relayed to the stats page.
- After a successful lookup, the popup window is minimized and unfocused.

If the window needs Cloudflare verification, the stats card shows a verification message and an “打开 FR24 窗口” button.

## Install (unpacked)

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this `extension/` folder.
4. Keep the extension enabled while using the random photo card.

The extension only runs on:

- `jetphotos.com`
- `vicleeu.github.io`
- `flightradar24.com`

It stores only the popup window/tab id and a random token in `chrome.storage.session`; it does not store credentials or photo data.

## Behavior and limits

- A single FR24 popup window is reused.
- The window is initially placed offscreen; Chrome/Edge may still show it in the Dock, taskbar or window list.
- It is minimized only after a successful lookup, because a minimized page may not complete the first Cloudflare/load.
- Positions come from the FR24 search endpoint (about 11 km precision), not LiveFeed.
- If no live position exists, the userscript/extension falls back to the last operated flight and destination airport.
- This is an unofficial companion. FR24 frontend changes or Cloudflare policy changes can break it.

## Relationship to the userscript / bookmarklet

- **Userscript + extension:** the extension is preferred and no popup is created by the userscript.
- **Userscript without extension:** the userscript falls back to its own small FR24 companion popup.
- **Bookmarklet only:** the spotlight intentionally shows the photo plus a direct FR24 aircraft link; it does not query FR24.