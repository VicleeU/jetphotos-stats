# JetPhotos 统计台（非官方）

在任意 JetPhotos 摄影师主页上，用右下角悬浮按钮输入摄影师 ID 或主页链接，生成该摄影师的全量照片统计仪表盘。免登录、无服务器，数据只保存在浏览器本地。

> 非官方社区工具，与 JetPhotos 官方无关联。请遵守 JetPhotos 服务条款，仅用于个人统计欣赏。

## 功能

- 总览：照片数、浏览量、点赞、机场、航空公司、机型
- 世界机场地球仪、热门机场 / 国家地区排行
- 机型系列 / 子型号、制造商、航司机型分布
- 上传时间线、拍摄器材、人气照片
- 可搜索、可筛选的照片图库与详情灯箱
- 中英文界面、三套主题（黄色 / 淡绿色 / FR24）
- 基础统计快速返回；深度抓取逐张补齐机场、日期、器材、缩略图
- 内置限速、退避与重试，数据只存 localStorage

## 安装

### 油猴脚本（推荐）

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)
2. 打开 [Greasy Fork 脚本页](https://greasyfork.org/zh-CN/scripts/605109) 并点击「安装此脚本」
3. 打开任意 `jetphotos.com` 页面，点击右下角「统计台」按钮

### 书签 / 离线版

安装页（二选一，内容相同）：

- [云端镜像](https://jetphotos-stats.app.workbuddy.host/?sharecode=HKO7DWA6IW) — 国内访问更稳定
- [GitHub Pages](https://vicleeu.github.io/jetphotos-stats/)

## 使用

1. 打开任意 JetPhotos 摄影师主页；
2. 点击右下角「统计台」；
3. 输入纯数字 ID，或 `jetphotos.com/photographer/...` 链接；
4. 基础统计约 2 秒出结果；需要机场、时间线、器材与缩略图时再启动深度抓取。

## 隐私

- 无服务器、无需登录；
- 抓取和统计全部在浏览器内完成，直连 jetphotos.com；
- 结果保存在浏览器 `localStorage`，按摄影师 ID 隔离；
- 不上传、不同步、无埋点；清除站点数据即可删除；
- 内置限速、退避与重试，请勿高频抓取或批量转售数据。

## 开发

要求：Python 3，无第三方依赖。

```bash
python3 tools/build-dist.py
# 生成 dist/、site/、start.html

# 指定线上引擎地址（用于在线书签）
python3 tools/build-dist.py https://vicleeu.github.io/jetphotos-stats/dist/jp-stats-engine.js
```

### 发布 GitHub Pages

`main` 分支只放源码；安装页发布在 `gh-pages` 分支：

```bash
python3 tools/build-dist.py https://<owner>.github.io/jetphotos-stats/dist/jp-stats-engine.js
# 将生成的 site/ 内容提交并推送到 gh-pages 分支
```

构建产物：

- `dist/jp-stats.user.js`：标准油猴脚本
- `dist/jp-stats.greasyfork.user.js`：拆分内嵌字符串的 Greasy Fork 变体
- `dist/jp-stats-engine.js`：在线书签加载的引擎
- `dist/bookmarklet-offline.txt`：离线书签
- `site/`：安装说明静态页

## 目录

```
engine/      引擎与安装页（dashboard.html / landing.html / bootstrap.js / geo-data.js）
tools/       构建脚本
fonts/       字体与 OFL 许可证
```

## 维护与交接

- [AGENTS.md](AGENTS.md) — 给接手 agent 的构建、测试、发布和隐私约束
- [RELEASE.md](RELEASE.md) — 版本发布 SOP
- [CHANGELOG.md](CHANGELOG.md) — 版本记录
- [CONTRIBUTING.md](CONTRIBUTING.md) — 贡献流程
- `docs/` — 架构与隐私说明
- `tools/qa/` — 本地 QA 工具和检查清单

## 许可

代码以 MIT License 发布，见 [LICENSE](LICENSE)。字体、地理数据与 JetPhotos 商标的说明见 [NOTICE.md](NOTICE.md)。

## English

An unofficial browser userscript that turns any public JetPhotos photographer profile into a local, searchable statistics dashboard. No server, no login, data stays in `localStorage`. Install via the Greasy Fork link above; see `NOTICE.md` for third-party assets and the non-affiliation disclaimer.
