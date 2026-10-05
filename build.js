process.env.NODE_ENV = 'production';
const { execSync } = require('child_process');
const path = require('path');

const ROOT = __dirname;

function run(cmd, opts = {}) {
  console.log('+', cmd);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, shell: true, ...opts });
}

const kmDir = path.join(ROOT, 'the-kanji-map');
try {
  run('bun install --frozen-lockfile', { cwd: kmDir });
  run('bun run build', { cwd: kmDir });
} catch (e) {
  console.warn('bun not available, falling back to npm');
  run('npm ci', { cwd: kmDir });
  run('npm run build', { cwd: kmDir });
}

require('./pack.js');
