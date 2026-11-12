# Release process

## 1. Prepare

```bash
git checkout main
git pull
```

Edit `VERSION` in `tools/build-dist.py`, then update `CHANGELOG.md`.

## 2. Build and verify

```bash
python3 tools/build-dist.py https://vicleeu.github.io/jetphotos-stats/dist/jp-stats-engine.js
node tools/qa/check-inline.js engine/dashboard.html engine/landing.html
python3 tools/publish/release-check.py
```

Check:

- `dist/jp-stats.user.js` and `dist/jp-stats.greasyfork.user.js` contain the new `@version`;
- no personal data, logs or caches are staged;
- install page contains the new version;
- core QA from `tools/qa/checklist.md` passes.

## 3. GitHub source

```bash
git add engine tools fonts README.md AGENTS.md RELEASE.md CHANGELOG.md docs tools/qa tools/publish
git commit -m "Release vX.Y.Z"
git push origin main
```

Network note: GitHub push may require the local proxy and HTTP/1.1:

```bash
https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 \
  git -c http.version=HTTP/1.1 push origin main
```

## 4. GitHub Pages

`gh-pages` is a generated branch. Rebuild and publish the contents of `site/`:

```bash
python3 tools/build-dist.py https://vicleeu.github.io/jetphotos-stats/dist/jp-stats-engine.js
# copy site/ to a temporary git repository and push to gh-pages
```

Do not commit `site/` to `main`. Verify the install page and `assets/jp-stats.user.js` return HTTP 200 and the new version.

## 5. Greasy Fork

1. Open https://greasyfork.org/zh-CN/scripts/605109/versions/new
2. Upload `dist/jp-stats.greasyfork.user.js`
3. Fill the changelog
4. Submit

If browser automation is unavailable, `tools/publish/greasyfork-safari.js` can write the code into the form from an already logged-in Safari session. Login/2FA must be completed by the owner.

Verify the installed asset returns the new `@version`:

```bash
curl -s "https://update.greasyfork.org/scripts/605109/<encoded name>.user.js" | grep '@version'
```

## 6. Post-release

- Confirm GitHub Pages and Greasy Fork both show the same version.
- Confirm no personal data is present in the repository or release assets.
- Add the release note to `CHANGELOG.md`.

Publishing is a public action: ask the owner before pushing, deploying or submitting to Greasy Fork.
