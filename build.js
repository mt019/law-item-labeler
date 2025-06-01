// build.js

const fs = require('fs');
const path = require('path');

const pkg = require('./package.json');
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const outFile = path.join(distDir, 'law-item-label.user.js');

// 讀取 metadata 並自動注入版本號
let metadata = fs.readFileSync('./metadata.user.js', 'utf-8');
metadata = metadata.replace(/^\/\/\s*@version\s+.*$/m, `// @version      ${pkg.version}`);

// 讀取 source 模組
const files = ['injectLabel.js', 'uiButton.js', 'main.js'];
let combined = '';

for (const file of files) {
  const code = fs.readFileSync(path.join(srcDir, file), 'utf-8')
    .replace(/^import .*$/gm, '')     // 移除 import
    .replace(/^export /gm, '');       // 移除 export
  combined += `\n\n// == ${file} ==\n\n` + code.trim() + '\n';
}

// 組合
const result = `${metadata}\n\n(function () {${combined}\n})();\n`;

// 輸出
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);
fs.writeFileSync(outFile, result, 'utf-8');

console.log(`✅ 打包完成 → ${outFile}`);