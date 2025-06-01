// build.js

const fs = require('fs');
const path = require('path');

const pkg = require('./package.json');
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const outFile = path.join(distDir, 'law-item-label.user.js');
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
console.log(`✅ 打包完成 → ${outFile}`);

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