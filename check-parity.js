/**
 * Guards against site/ and docs/ drifting apart.
 *
 * docs/ is the deployed GitHub Pages build; site/ is the source. They must
 * agree on every feature marker, otherwise a rebuild from site/ silently drops
 * UI that only ever existed in docs/ (this happened twice: the wordMenu
 * container and its CSS).
 *
 * Run: node check-parity.js
 */
const fs = require('fs');

const read = p => fs.readFileSync(p, 'utf8');
const siteApp = read('site/app.js');
const docsApp = read('docs/app.js');
const siteHtml = read('site/index.html');
const docsHtml = read('docs/index.html');
const siteCss = read('site/style.css');
const docsCss = read('docs/style.css');

// Feature markers that must exist on BOTH sides.
const markers = [
  { name: 'wordMenu container (html)', re: /id="wordMenu"/, files: { 'site/index.html': siteHtml, 'docs/index.html': docsHtml } },
  { name: 'openWordMenu (js)',        re: /function openWordMenu\(/, files: { 'site/app.js': siteApp, 'docs/app.js': docsApp } },
  { name: 'closeWordMenu (js)',       re: /function closeWordMenu\(/, files: { 'site/app.js': siteApp, 'docs/app.js': docsApp } },
  { name: 'kanjiCharsIn (js)',        re: /function kanjiCharsIn\(/, files: { 'site/app.js': siteApp, 'docs/app.js': docsApp } },
  { name: 'fileWordToVocab (js)',     re: /function fileWordToVocab\(/, files: { 'site/app.js': siteApp, 'docs/app.js': docsApp } },
  { name: 'fileWordToKanji (js)',     re: /function fileWordToKanji\(/, files: { 'site/app.js': siteApp, 'docs/app.js': docsApp } },
  { name: 'wordMenu css',             re: /#wordMenu\{/, files: { 'site/style.css': siteCss, 'docs/style.css': docsCss } },
  { name: 'toggleWordMenu (js)',      re: /function toggleWordMenu\(/, files: { 'site/app.js': siteApp, 'docs/app.js': docsApp } },
  { name: 'selectionText (js)',       re: /function selectionText\(/, files: { 'site/app.js': siteApp, 'docs/app.js': docsApp } },
  { name: 'drag-select mouseup',      re: /addEventListener\('mouseup'[\s\S]{0,800}selectionText\(sel\)/, files: { 'site/app.js': siteApp, 'docs/app.js': docsApp } },
  { name: 'resume marker (js)',       re: /function setResume\(/, files: { 'site/app.js': siteApp, 'docs/app.js': docsApp } },
  { name: 'resume banner (html)',     re: /id="resumeBanner"/, files: { 'site/index.html': siteHtml, 'docs/index.html': docsHtml } },
  { name: 'settings panel (html)',    re: /<section id="settings"/, files: { 'site/index.html': siteHtml, 'docs/index.html': docsHtml } },
  { name: 'n4resume in sync keys',    re: /'n4resume'/, files: { 'site/app.js': siteApp, 'docs/app.js': docsApp } },
];

let failed = 0;
for (const m of markers) {
  const missing = Object.entries(m.files).filter(([, c]) => !m.re.test(c)).map(([f]) => f);
  if (missing.length) {
    failed++;
    console.log('FAIL  ' + m.name + ' — missing in: ' + missing.join(', '));
  }
}

// docs/ must keep GitHub Pages absolute URLs; site/ may use localhost.
const pagesUrls = (docsApp.match(/Interactive-Japanese-study-story-N4-N5\/kanjimap/g) || []).length;
if (pagesUrls === 0) {
  failed++;
  console.log('FAIL  docs/app.js has no GitHub Pages kanjimap URLs (rebuild broke paths)');
}
const localhost = (docsApp.match(/localhost:3000/g) || []).length;
if (localhost > 0) {
  failed++;
  console.log('FAIL  docs/app.js still references localhost:3000 (' + localhost + ') — will 404 on Pages');
}

console.log(failed ? '\n' + failed + ' parity problem(s) found.' : '\nParity OK — site/ and docs/ agree.');
process.exit(failed ? 1 : 0);