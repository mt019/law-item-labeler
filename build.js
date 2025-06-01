// build.js

const fs = require('fs');
const path = require('path');

const pkg = require('./package.json');
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const outFile = path.join(distDir, 'law-item-label.user.js');
const indexSrc = path.join(__dirname, 'index.html');
const indexDest = path.join(distDir, 'index.html');

// 讀取 metadata，注入版本號
let metadata = fs.readFileSync('./metadata.user.js', 'utf-8');
metadata = metadata.replace(/^\/\/\s*@version\s+.*$/m, `// @version      ${pkg.version}`);

// 讀取模組並移除 import/export
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

// 組合腳本內容
const result = `${metadata}\n\n(function () {${combined}\n})();\n`;

// 確保輸出資料夾存在
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

// 輸出腳本
fs.writeFileSync(outFile, result, 'utf-8');
console.log(`✅ 打包完成 → ${outFile}`);

// 複製 index.html 到 dist/
fs.copyFileSync(indexSrc, indexDest);
console.log(`✅ 已複製 index.html → ${indexDest}`);