// build.js

const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, 'dist', 'law-item-label.user.js');
const metadata = fs.readFileSync(path.join(__dirname, 'metadata.user.js'), 'utf-8');

const sources = [
  path.join(__dirname, 'src', 'injectLabel.js'),
  path.join(__dirname, 'src', 'uiButton.js'),
  path.join(__dirname, 'src', 'main.js'),
];

let combinedCode = metadata + '\n\n';

for (const file of sources) {
  let content = fs.readFileSync(file, 'utf-8');
  // 移除 export / import
  content = content
    .replace(/^export\s+/gm, '')
    .replace(/^import.*$/gm, '');
  combinedCode += content + '\n\n';
}

fs.writeFileSync(outputFile, combinedCode.trim());
console.log('✅ 構建完成：' + outputFile);