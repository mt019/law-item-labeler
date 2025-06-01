# 專案維護流程：law-item-labeler

## 一、日常修改

### 1. 修改腳本功能
請修改下列模組檔案：
- `src/main.js`
- `src/injectLabel.js`
- `src/uiButton.js`

### 2. 修改預覽頁樣式或說明
請編輯：
- `index.template.html`（支援版本自動插入）

---

## 二、發佈新版本

### 1. 選擇版本號
根據修改幅度選擇其一：

```bash
npm version patch   # 小改（ex: v1.9.1 → v1.9.2）
npm version minor   # 中改（ex: v1.9.2 → v1.10.0）
npm version major   # 大改（ex: v1.10.0 → v2.0.0）
```

### 2. 自動打包 + 發布：

```bash
npm run release
```

這將會：

- 自動執行 `build.js` 打包 `.user.js` 與 `index.html`
- 自動插入當前版本號
- 自動 Git commit + tag + push
- 自動觸發 GitHub Actions：
  - `release.yml` 建立 GitHub Release（附檔案）
  - `build-and-deploy.yml` 更新 GitHub Pages

---

## 三、發生錯誤怎麼辦？

### 發布時出現錯誤：tag 已存在

```bash
fatal: tag 'v1.x.x' already exists
```

執行以下指令手動推送該版本 tag：

```bash
git push origin v1.x.x
```

---

## 四、額外命令

| 指令 | 說明 |
|------|------|
| `npm run build` | 手動打包 `.user.js` + 預覽頁 |
| `npm run release` | 自動 commit + tag + push（需先執行 `npm version ...`） |

---

## 五、檔案結構概要

```
.
├── dist/                   # 打包後產物（發佈用）
│   ├── law-item-label.user.js
│   ├── index.html
│   └── preview/image.png
├── src/                   # 原始模組碼
│   ├── injectLabel.js
│   ├── main.js
│   └── uiButton.js
├── index.template.html    # index.html 模板（含 {{version}}）
├── build.js               # 打包與版本處理腳本
├── metadata.user.js       # UserScript 標頭模板
├── package.json           # NPM 腳本設定與版本管理
├── .github/workflows/
│   ├── build-and-deploy.yml
│   └── release.yml
└── README.md              # 專案簡介與安裝方式
```