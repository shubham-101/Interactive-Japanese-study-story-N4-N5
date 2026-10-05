const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;

function run(cmd, opts = {}) {
  console.log('+', cmd);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, shell: true, ...opts });
}

// 1. build kanji-map (static export to the-kanji-map/out)
try {
  run('bun install --frozen-lockfile', { cwd: path.join(ROOT, 'the-kanji-map') });
  run('bun run build', { cwd: path.join(ROOT, 'the-kanji-map') });
} catch (e) {
  console.warn('bun not available, falling back to local next build');
  const nextBin = path.join(ROOT, 'the-kanji-map', 'node_modules', '.bin', 'next.cmd');
  run(`"${nextBin}" build`, { cwd: path.join(ROOT, 'the-kanji-map') });
}

// 2. assemble deploy/
const TMP = path.join(__dirname, '.tmp_build');
const packSrc = path.join(__dirname, 'pack.js');
if (!fs.existsSync(packSrc)) fs.copyFileSync('C:/Users/kumbh/AppData/Local/Temp/opencode/pack.js', packSrc);
require(packSrc);
