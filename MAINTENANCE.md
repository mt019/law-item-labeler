# MAINTENANCE.md

法規條文項次顯示器（law-item-labeler）維護流程說明  
最後更新：2025-06-01 21:53:58

---

## 🚀 發布版本流程（建議順序）

```bash
# 1. 升級版本號（依照修改內容選擇 patch / minor / major）
npm version patch

# 2. 自動打包 + 建立 commit + 建立 tag + 推送（會觸發 GitHub Actions）
npm run release

# 3. 確保把本地的 main 與 tags 推上遠端
git push
git push --tags
```

---

## 📦 正式安裝檔在哪裡

正式安裝檔是 `https://mt019.github.io/law-item-labeler/law-item-labeler.user.js`，也就是腳本自己宣告的
`@updateURL`／`@downloadURL`。它的來源是 canvas 倉庫的 `public/scripts/law-item-labeler.user.js`。

發版時 `npm run release` 之外還要多一步——**跑同步，不要手動複製**：

```bash
node sync-to-canvas.mjs --canvas ../../1142/my-canvas-lab   # 路徑照你機器上的位置
```

它會重新打包、把 `dist/law-item-labeler.user.js` 送進 canvas 的 `public/scripts/`，並回寫
`src/data/userscripts.json` 的版號、`@match`、`@grant`。**canvas 只管前端**：那三個欄位是這個倉
的事實，不在 canvas 手改；落地頁的介紹文字與版本紀錄才是 canvas 那邊寫的，同步不碰它們。

漏掉這一步，站上寫著新版號、使用者永遠拿到舊檔，兩邊都不會報錯——所以 canvas 那邊有
`npm run validate:userscripts` 逐欄比對，同步完跑一次。

`dist/law-item-label.user.js`（少一個 `er`）是 1.9.2 以前的檔名，GitHub Pages 仍然照樣端出來，
內容與正式檔完全相同，作用是讓已安裝的舊副本拿到帶 `@updateURL` 的版本後自己轉過去。別刪。

## 🤖 自動化內容

### `.github/workflows/build-and-deploy.yml`

- 每次 push 到 `main` 時執行
- 自動執行 `npm run build`
- 將打包後的 `dist/` 部署至 GitHub Pages

### `.github/workflows/release.yml`

- 當 push 的 tag 以 `v` 開頭（如 `v1.9.2`）時執行
- 會：
  - 安裝依賴
  - 執行 `npm run build`
  - 上傳 `dist/` 內以下檔案至 GitHub Release
    - `law-item-labeler.user.js`
    - `law-item-label.user.js`（舊檔名，同內容）
    - `index.html`
    - `preview/image.png`

---

## 📁 專案目錄說明

```
├── dist/                   # 編譯輸出目錄
│   ├── law-item-labeler.user.js   # 正式檔名
│   ├── law-item-label.user.js     # 舊檔名，同內容，給 1.9.2 以前的安裝
│   ├── index.html
│   └── preview/image.png
├── src/                   # 原始碼模組
│   ├── injectLabel.js
│   ├── uiButton.js
│   └── main.js
├── build.js               # 自訂建置腳本（組合模組 + 插入版本）
├── metadata.user.js       # 使用者腳本的 metadata block
├── index.template.html    # HTML 模板，含 {version} 變數
├── LICENSE
├── README.md
├── MAINTENANCE.md         # 維護文件
└── package.json           # 版本號、scripts、套件資訊
```

---

## 🔄 VS Code 注意事項

- 若看到 `Sync Changes ↑` 代表尚未 push 的提交，記得按下或手動 `git push`
- 每次版本釋出請確認 tags 也同步：`git push --tags`
