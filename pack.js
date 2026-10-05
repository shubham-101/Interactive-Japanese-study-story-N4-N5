const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DEPLOY = path.join(ROOT, 'deploy');

// clean
fs.rmSync(DEPLOY, { recursive: true, force: true });
fs.mkdirSync(DEPLOY, { recursive: true });

// copy site (main site)
function copyDir(src, dest, transform) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d, transform);
    else {
      let data = fs.readFileSync(s);
      if (transform) {
        const out = transform(entry.name, data);
        if (out !== null) fs.writeFileSync(d, out);
        continue;
      }
      fs.writeFileSync(d, data);
    }
  }
}

copyDir(path.join(ROOT, 'site'), DEPLOY, (name, data) => {
  if (!/\.(html|js|css|json|md)$/i.test(name)) return data;
  let s = data.toString('utf8');
  s = s.split('http://localhost:3000/').join('/kanjimap/');
  s = s.split('http://localhost:3000').join('/kanjimap/');
  s = s.split('http://localhost:8000/').join('/');
  s = s.split('http://localhost:8000').join('/');
  return Buffer.from(s, 'utf8');
});

// copy kanji-map export to /kanjimap
copyDir(path.join(ROOT, 'the-kanji-map/out'), path.join(DEPLOY, 'kanjimap'), (name, data) => {
  if (!/\.(html|js|css|json|ts|txt)$/i.test(name)) return data;
  let s = data.toString('utf8');
  s = s.split('http://localhost:8000').join('/');
  return Buffer.from(s, 'utf8');
});

console.log('done');
