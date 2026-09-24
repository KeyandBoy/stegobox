# 隐匣 StegoBox

**把图片、任意文件或文本藏进另一张图片**，抵抗 JPEG/WebP 重压缩与等比缩放。纯浏览器本地运行，不上传服务器。

Derived from [RAC-Hide](https://github.com/tuoPzf/rac-hide) (GPL-3.0-or-later). Original author notices retained in `LICENSE` and the UI footer.

> **Dual use / 双重用途.** Steganography is a general information-hiding technique. This project is released for research, digital watermarking / copyright protection and lawful covert communication. Do **not** use it to distribute illegal content or to evade lawful moderation.

---

## Features / 特性

- **图片 / 文件 / 文本** — STG2 typed payload；兼容旧版 STG1 图片格式
- **批量嵌入 / 批量提取** — 多文件处理，ZIP 打包下载
- **中英双语 UI** — 一键切换
- **Anti-JPEG / Anti-rescale / Blind extraction**
- **Zero dependencies** — pure ES modules, no build step
- **Local only** — nothing leaves your device

## Quick start / 快速开始

```bash
# tests
npm test

# local web (ES modules need HTTP)
npm start
# open http://localhost:8000/demo/
```

### API (library)

```js
import {
  buildPayload, buildTypedPayload, embed, extract, capacityBytes,
} from './src/core.js';

// or browser helpers
import { embedFile, embedText, extractAny } from './src/browser.js';
```

## Deploy / 部署网页版

仓库根目录已有 `vercel.json`。将本仓库导入 [Vercel](https://vercel.com/new)（Framework: Other，Build: 留空）即可。

```bash
npx vercel deploy --prod
```

## Local launcher / 本地启动器

双击 `启动网页版.bat`（或 `start-web.bat`）→ 自动起本地服务并打开 `http://127.0.0.1:端口/demo/`，关窗口即停。仅需 Python 3。

## Payload format / 载荷格式

| Magic | Header | Body |
|-------|--------|------|
| `STG1` | 11 bytes | JPEG bytes (legacy) |
| `STG2` | 13 + nameLen | typed: image(0) / file(1) / text(2) + UTF-8 filename |

## Project structure

```
src/          codec (DCT, RS, ruler, core, browser)
demo/         StegoBox UI (i18n, batch, zip)
test/         node:test suite
docs/         algorithm notes (from upstream)
```

## License

GNU General Public License v3.0 or later — see [LICENSE](./LICENSE).

上游项目：[tuoPzf/rac-hide](https://github.com/tuoPzf/rac-hide) · Algorithm: [docs/algorithm.md](./docs/algorithm.md)
