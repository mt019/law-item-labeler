// 把這支腳本的事實欄位（版號、@match、@grant）回寫進 canvas 落地頁的資料檔。
//
// 2026-08-06 改：以前這裡還會把 .user.js 複製進 canvas 的 public/scripts/，讓
// phenomcanvas.com 當安裝與更新來源。那使整個網域被 Google Safe Browsing 標成不實網頁
// （散布會自我更新的瀏覽器可執行程式碼），連子網域一起被蓋到。安裝與更新已移回
// GitHub Pages，canvas 只負責落地頁的內容、不放安裝檔——複製的動作因此刪掉了，別加回去，
// canvas 的 validate:userscripts 會擋下來。
//
// 落地頁的版號仍要跟著這裡走：站上寫著新版號、Pages 上還是舊檔的話，兩邊都不會報錯。
//
// 事實欄位（版號、@match、@grant）由這裡回寫，文案欄位（介紹、每條 @match 為什麼要、
// 版本紀錄）是 canvas 那邊的東西，不碰。
//
// 用法：node sync-to-canvas.mjs --canvas ../../1142/my-canvas-lab
//       （或設 CANVAS_REPO 環境變數。路徑不寫進檔案裡——每台機器擺的位置不一樣。）

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
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
