// 把打包好的腳本送進 canvas（phenomcanvas.com 的前端倉），並回寫它在落地頁資料裡的
// 那幾個事實欄位。
//
// 為什麼要有這支：正式安裝檔的網址是 https://phenomcanvas.com/scripts/law-item-labeler.user.js，
// 檔案實際端出來的地方在 canvas 的 public/scripts/。這個倉是那個檔的來源，canvas 只負責
// 端出去與畫落地頁——所以搬運要有一支腳本，不能靠人記得複製。手動複製漏掉的話，站上寫著
// 新版號、使用者永遠拿到舊檔，而且兩邊都不會報錯。
//
// 事實欄位（版號、@match、@grant）由這裡回寫，文案欄位（介紹、每條 @match 為什麼要、
// 版本紀錄）是 canvas 那邊的東西，不碰。
//
// 用法：node sync-to-canvas.mjs --canvas ../../1142/my-canvas-lab
//       （或設 CANVAS_REPO 環境變數。路徑不寫進檔案裡——每台機器擺的位置不一樣。）

import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ID = 'law-item-labeler';
const FILE = 'law-item-labeler.user.js';
const BUILT = join(HERE, 'dist', FILE);

const argIndex = process.argv.indexOf('--canvas');
const canvasArg = argIndex === -1 ? process.env.CANVAS_REPO : process.argv[argIndex + 1];
if (!canvasArg) {
  console.error('要指定 canvas 倉的位置：node sync-to-canvas.mjs --canvas <路徑>（或設 CANVAS_REPO）');
  process.exit(1);
}
const CANVAS = resolve(process.cwd(), canvasArg);

execFileSync('node', [join(HERE, 'build.js')], { stdio: 'inherit' });
copyFileSync(BUILT, join(CANVAS, 'public', 'scripts', FILE));
console.log(`已送出 → ${join(CANVAS, 'public', 'scripts', FILE)}`);

const source = readFileSync(BUILT, 'utf8');
const meta = {};
for (const line of source.slice(0, source.indexOf('// ==/UserScript==')).split('\n')) {
  const m = /^\/\/\s*@(\S+)\s+(.*)$/.exec(line.trim());
  if (m) (meta[m[1]] ??= []).push(m[2].trim());
}

const dataPath = join(CANVAS, 'src', 'data', 'userscripts.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const entry = data.scripts.find((s) => s.id === ID);
if (!entry) {
  console.error(`canvas 的 userscripts.json 裡沒有 id=${ID} 這一筆，先在那邊建好文案再同步`);
  process.exit(1);
}

entry.version = meta.version[0];
entry.file = FILE;
// 每條 @match／@grant 的「為什麼」是 canvas 那邊寫的文案，按 pattern／name 對回去；
// 新增的條目留空字串，讓 canvas 那邊的人補——不要替他編一句。
const keepWhy = (list, key, incoming) => incoming.map((v) => ({
  [key]: v,
  why: list.find((old) => old[key] === v)?.why ?? '',
}));
entry.matches = keepWhy(entry.matches ?? [], 'pattern', meta.match ?? []);
entry.grants = keepWhy(entry.grants ?? [], 'name', (meta.grant ?? []).filter((g) => g !== 'none'));

writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`已回寫 → ${dataPath}（版號 ${entry.version}）`);

const blank = [...entry.matches, ...entry.grants].filter((x) => !x.why);
if (blank.length) console.log(`⚠️ 有 ${blank.length} 條還沒寫說明，去 canvas 的 userscripts.json 補`);
if (data.scripts.find((s) => s.id === ID).changelog?.[0]?.version !== entry.version) {
  console.log('⚠️ canvas 的版本紀錄最上面那條不是這個版號，去補一條');
}
console.log('接著在 canvas 跑 npm run validate:userscripts');
