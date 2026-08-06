// build.js

const fs = require('fs');
const path = require('path');

const pkg = require('./package.json');
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
// 正式檔名跟著 repo 名走，也是 GitHub Pages 上的檔名。
const outFile = path.join(distDir, 'law-item-labeler.user.js');
// 舊檔名：1.9.2 以前是從 GitHub Pages 的這個網址安裝的。2026-08-06 起安裝與更新又回到
// Pages（中間那段掛在 phenomcanvas.com，見 MAINTENANCE.md），所以這個檔名要一直留著，
// 當年從它安裝的副本才拿得到新版。內容與正式檔完全相同，別刪。
const legacyOutFile = path.join(distDir, 'law-item-label.user.js');
const templateHTML = path.join(__dirname, 'index.template.html');
const outputHTML = path.join(distDir, 'index.html');
const previewSrc = path.join(__dirname, 'preview');
const previewDest = path.join(distDir, 'preview');

// 1. metadata
let metadata = fs.readFileSync('./metadata.user.js', 'utf-8');
metadata = metadata.replace(/^\/\/\s*@version\s+.*$/m, `// @version      ${pkg.version}`);

// 2. combine modules
const files = ['injectLabel.js', 'uiButton.js', 'main.js'];
let combined = '';

for (const file of files) {
  const filePath = path.join(srcDir, file);
  const code = fs.readFileSync(filePath, 'utf-8')
    .replace(/^import .*$/gm, '')
    .replace(/^export /gm, '')
    .trim();
  combined += `\n\n// == ${file} ==\n\n${code}\n`;
}

// 3. output .user.js
const result = `${metadata}\n\n(function () {${combined}\n})();\n`;
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);
fs.writeFileSync(outFile, result, 'utf-8');
fs.writeFileSync(legacyOutFile, result, 'utf-8');
console.log(`✅ 打包完成 → ${outFile}`);
console.log(`✅ 舊檔名同內容 → ${legacyOutFile}`);

// 4. generate index.html from template
if (fs.existsSync(templateHTML)) {
  let html = fs.readFileSync(templateHTML, 'utf-8');
  html = html.replace(/{{version}}/g, pkg.version);
  fs.writeFileSync(outputHTML, html, 'utf-8');
  console.log(`✅ 已產生 index.html（含版本號） → ${outputHTML}`);
} else {
  console.warn('⚠️ 找不到 index.template.html，略過 HTML 輸出');
}

// 5. copy preview/
if (fs.existsSync(previewSrc)) {
  fs.cpSync(previewSrc, previewDest, { recursive: true });
  console.log('✅ 已複製 preview 圖片資料夾');
}