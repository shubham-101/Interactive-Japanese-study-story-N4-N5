const D = window.JLPT;
const SUP = {
  '毎朝':{reading:'まいあさ',meaning:'every morning'},
  '起きる':{reading:'おきる',meaning:'to wake up, to get up'},
  'テスト':{reading:'テスト',meaning:'test, exam'},
  '勉強':{reading:'べんきょう',meaning:'study, studying'},
  'コーヒー':{reading:'コーヒー',meaning:'coffee'},
  '降る':{reading:'ふる',meaning:'to fall (rain, snow)'},
  '分かる':{reading:'わかる',meaning:'to understand'},
  '学校':{reading:'がっこう',meaning:'school'},
  '歩く':{reading:'あるく',meaning:'to walk'},
  '駅':{reading:'えき',meaning:'station'},
  '電話':{reading:'でんわ',meaning:'telephone, phone call'},
  '犬':{reading:'いぬ',meaning:'dog'},
  '遊ぶ':{reading:'あそぶ',meaning:'to play'},
  '電車':{reading:'でんしゃ',meaning:'train'},
  '出る':{reading:'でる',meaning:'to leave, to go out'},
  '母':{reading:'はは',meaning:'(my) mother'},
  'お金':{reading:'おかね',meaning:'money'},
  '新しい':{reading:'あたらしい',meaning:'new'},
  '本':{reading:'ほん',meaning:'book'},
  '買う':{reading:'かう',meaning:'to buy'},
  '見る':{reading:'みる',meaning:'to see, to watch'},
  'うれしい':{reading:'うれしい',meaning:'happy, pleased'},
  '友だち':{reading:'ともだち',meaning:'friend'},
  '欲しい':{reading:'ほしい',meaning:'want (something)'},
  '突然':{reading:'とつぜん',meaning:'suddenly'},
  '窓':{reading:'まど',meaning:'window'},
  '読む':{reading:'よむ',meaning:'to read'},
  '散歩':{reading:'さんぽ',meaning:'a walk, stroll'},
  '空':{reading:'そら',meaning:'sky, air'},
  '鳥':{reading:'とり',meaning:'bird'},
  '難しい':{reading:'むずかしい',meaning:'difficult, hard'},
  'できる':{reading:'できる',meaning:'to be able to, can do'},
  '公園':{reading:'こうえん',meaning:'park'},
  '聞く':{reading:'きく',meaning:'to listen, to ask'},
  '食べる':{reading:'たべる',meaning:'to eat'},
  '着く':{reading:'つく',meaning:'to arrive'},
  '朝ごはん':{reading:'あさごはん',meaning:'breakfast'},
  '来週':{reading:'らいしゅう',meaning:'next week'},
  '今':{reading:'いま',meaning:'now'},
  '元気':{reading:'げんき',meaning:'healthy, well'},
  '図書館':{reading:'としょかん',meaning:'library'},
  '入る':{reading:'はいる',meaning:'to enter'},
  '閉める':{reading:'しめる',meaning:'to close'},
  '明るい':{reading:'あかるい',meaning:'bright, cheerful'},
  '友':{reading:'とも',meaning:'friend'},
  '先週':{reading:'せんしゅう',meaning:'last week'},
  '夕方':{reading:'ゆうがた',meaning:'evening, dusk'},
  '急':{reading:'きゅう',meaning:'sudden, urgent'},
  '間に合う':{reading:'まにあう',meaning:'to be in time'},
  '部屋':{reading:'へや',meaning:'room'},
  '長い':{reading:'ながい',meaning:'long'},
  '大きい':{reading:'おおきい',meaning:'big, large'},
  '小さい':{reading:'ちいさい',meaning:'small'},
  '雨':{reading:'あめ',meaning:'rain'},
  '仕事':{reading:'しごと',meaning:'work, job'},
  '先生':{reading:'せんせい',meaning:'teacher'},
  '学生':{reading:'がくせい',meaning:'student'},
  '大学':{reading:'だいがく',meaning:'university'},
  '友達':{reading:'ともだち',meaning:'friend'},
  '休む':{reading:'やすむ',meaning:'to rest, to be absent'},
  '休み':{reading:'やすみ',meaning:'rest, holiday'},
  '思う':{reading:'おもう',meaning:'to think'},
  '笑う':{reading:'わらう',meaning:'to laugh'},
  '飲む':{reading:'のむ',meaning:'to drink'},
};

const VOCAB = {};
for (const [k,v] of Object.entries(D.vocab)) {
  if (k.length === 1 && /^[぀-ゟ]$/.test(k)) continue;
  VOCAB[k] = v;
}
for (const [k,v] of Object.entries(SUP)) if (!VOCAB[k]) VOCAB[k] = v;

let EDITS = JSON.parse(localStorage.getItem('n4edits') || '{"removedWords":[],"removedKanji":[],"addedWords":{},"addedKanji":{}}');
function saveEdits(){ localStorage.setItem('n4edits', JSON.stringify(EDITS)); storyIndex._c = null; }
for (const w of EDITS.removedWords) delete VOCAB[w];
for (const [w,v] of Object.entries(EDITS.addedWords)) VOCAB[w] = v;
for (const k of EDITS.removedKanji) delete D.kanji[k];
for (const [k,v] of Object.entries(EDITS.addedKanji)) D.kanji[k] = v;

let SORTED_WORDS = Object.keys(VOCAB).sort((a,b)=>b.length-a.length);
function rebuildWords(){ SORTED_WORDS = Object.keys(VOCAB).sort((a,b)=>b.length-a.length); }

let SEG = {};
try { SEG = JSON.parse(localStorage.getItem('n4segs') || '{}'); } catch(e){ SEG = {}; }
function saveSegs(){ localStorage.setItem('n4segs', JSON.stringify(SEG)); }

// Active study filter per list tab (see filterPass below)
const FILTERS = {vocab:'all', vocab5:'all', kanji:'all', kanji5:'all', grammar:'all', grammar5:'all'};
const FILTER_TOTAL = {}, FILTER_SHOWN = {};

function lookupWord(w){
  if (VOCAB[w]) return VOCAB[w];
  if (D.vocab5[w]) return D.vocab5[w];
  if (D.kanji[w]) return {reading: D.kanji[w].readings, meaning: D.kanji[w].meaning};
  return null;
}
// Which list an entry really belongs to. lookupWord() prefers the merged VOCAB
// index, so checking D.vocab first sent N5-only words into the N4 store.
// The active N4/N5 parent also carries .active, so read the leaf tab only.
function activeLeafTab(){
  const el = document.querySelector('.tab.active[data-tab]');
  return el ? el.dataset.tab : '';
}
function wordSource(w){
  const activeTab = activeLeafTab();
  if (activeTab === 'vocab5' && D.vocab5[w]) return 'vocab5';
  if (D.vocab[w]) return 'vocab';
  if (D.vocab5[w]) return 'vocab5';
  return 'vocab';
}
function kanjiSource(k){
  const activeTab = activeLeafTab();
  if (activeTab === 'kanji5' && D.kanji5[k]) return 'kanji5';
  if (D.kanji[k]) return 'kanji';
  if (D.kanji5[k]) return 'kanji5';
  return 'kanji';
}
function segment(sentence){
  const custom = SEG[sentence];
  if (custom && custom.length){
    return custom.map(t => ({t, word: !!lookupWord(t)}));
  }
  const out = []; let i = 0;
  while (i < sentence.length){
    let hit = null;
    for (const w of SORTED_WORDS){
      if (sentence.startsWith(w, i)){ hit = w; break; }
    }
    if (hit){ out.push({t:hit, word:true}); i += hit.length; }
    else if (/[\u4e00-\u9fff々]/.test(sentence[i]) && D.kanji[sentence[i]]){
      out.push({t:sentence[i], word:true, kanji:true}); i++;
    }
    else { out.push({t:sentence[i], word:false}); i++; }
  }
  return out;
}
function kanjisIn(text){
  const seen = new Set(); const out = [];
  for (const ch of text){
    if (/[\u4e00-\u9fff々]/.test(ch) && !seen.has(ch) && D.kanji[ch]){ seen.add(ch); out.push(ch); }
  }
  return out;
}
function grammarMatch(g, sentence){
  const p = g.pattern;
  if (p.includes('〜') || p.includes('～') || p.includes('~')){
    const parts = p.split(/[〜～~]/).map(s=>s.trim()).filter(Boolean);
    let lastIdx = -1;
    for (const part of parts){
      const idx = sentence.indexOf(part, lastIdx + 1);
      if (idx === -1) return false;
      lastIdx = idx + part.length;
    }
    return true;
  }
  if (p.length <= 2){
    const idx = sentence.indexOf(p);
    if (idx <= 0) return false;
    const prev = sentence[idx-1];
    return /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(prev);
  }
  if (p === 'ば'){
    return /[えけせてねれめ]ば/.test(sentence) || /[行食見来帰急使言思]ば/.test(sentence);
  }
  if (p === 'はずだ'){
    return /[\u4e00-\u9fff\u3040-\u309f]はずだ/.test(sentence);
  }
  if (p === 'だけ'){
    return /[\u4e00-\u9fff\u3040-\u309f]だけ/.test(sentence) && !sentence.includes('だけで');
  }
  if (p === 'でも'){
    return /[\u4e00-\u9fff\u3040-\u309f]でも/.test(sentence) && !sentence.includes('でも、');
  }
  return sentence.includes(p);
}

function grammarInSentence(sentence){
  const hits = D.grammar.filter(g => grammarMatch(g, sentence));
  return hits.filter(g => !hits.some(other =>
    other !== g &&
    other.pattern.length > g.pattern.length &&
    other.pattern.includes(g.pattern) &&
    other.meaning === g.meaning
  ));
}

function rawToHtml(text){
  let esc = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  esc = esc.replace(/([一-龯々〇ヶ]{1,10})（([^）]+)）/g, '<ruby>$1<rt>$2</rt></ruby>');
  return esc;
}
function stripReadings(s){ return s.replace(/（[^）]*）/g,''); }
function splitSentences(text){
  const out = []; let buf = '';
  for (let i=0;i<text.length;i++){
    buf += text[i];
    if (/[。！？]/.test(text[i])){
      if (text[i+1] === '」' || text[i+1] === '』'){ buf += text[i+1]; i++; }
      out.push(buf.trim()); buf = '';
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

const KANJI = /[一-龯々〇ヶ]/;
// Turn Kanji（reading） into <ruby> anywhere in a string, for text that is not
// segmented into words (chapter titles, popup headings).
function rubyText(text){
  if (!text) return '';
  return String(text).replace(/([一-龯々〇ヶ]{1,12})（([^）]+)）/g, (m, kanji, read) =>
    '<ruby>' + kanji + '<rt>' + read + '</rt></ruby>').replace(/（([^）]+)）/g, '');
}
function buildSegmentedHtml(raw){
  // Readings are stored after the kanji they annotate: 玄関（げんかん）.
  // Segmentation runs on the reading-free text, so a reading would end up
  // detached from its kanji. Build a per-character list first, tagging every
  // character of the annotated kanji run with the same reading, then render
  // segments from that list.
  const cells = [];   // { ch, read }
  for (let i = 0; i < raw.length; i++){
    const ch = raw[i];
    if (ch === '（'){
      const end = raw.indexOf('）', i);
      if (end > 0){
        const read = raw.slice(i + 1, end);
        // Walk back over the contiguous kanji run that just ended.
        let k = cells.length - 1;
        while (k >= 0 && KANJI.test(cells[k].ch)) k--;
        for (let m = k + 1; m < cells.length; m++) cells[m].read = read;
        i = end;
        continue;
      }
    }
    cells.push({ ch: ch, read: '' });
  }
  const plain = cells.map(c => c.ch).join('');

  const segs = segment(plain);
  let pos = 0, html = '', i = 0;
  for (const s of segs){
    const to = pos + s.t.length;
    let body = '';
    // A ruby run can swallow characters belonging to later segments, so track
    // the cursor independently of the segment offsets.
    if (i < pos) i = pos;
    while (i < to){
      const c = cells[i];
      if (!c.read || !KANJI.test(c.ch)){ body += c.ch; i++; continue; }
      let kanji = c.ch, j = i + 1;
      while (j < cells.length && cells[j].read === c.read && KANJI.test(cells[j].ch)){ kanji += cells[j].ch; j++; }
      body += '<ruby>' + kanji + '<rt>' + c.read + '</rt></ruby>';
      i = j;
    }
    pos = to;
    if (s.word) html += `<span class="w${isKnownW(s.t) ? ' known' : ''}" data-w="${s.t}">${body}</span>`;
    else html += body;
  }
  return html;
}

function chSentences(ci){
  const ch = window.CHAPTERS[ci];
  if (!ch) return [];
  return ch.sentences && ch.sentences.length ? ch.sentences : splitSentences(ch.jp).map(s => ({jp:s, en:''}));
}
// Which chapters are visible in the story. Persisted; defaults to all.
let CHAP_ON = (() => {
  try {
    const raw = JSON.parse(localStorage.getItem('n4chapters') || 'null');
    if (Array.isArray(raw)) return new Set(raw.filter(i => Number.isInteger(i) && i >= 0 && i < window.CHAPTERS.length));
  } catch(e){}
  return new Set(window.CHAPTERS.map((c,i) => i));
})();
function saveChapters(){ localStorage.setItem('n4chapters', JSON.stringify([...CHAP_ON].sort((a,b)=>a-b))); }
function chapterVisible(ci){ return CHAP_ON.has(ci); }

function renderStory(){
  const root = document.getElementById('storyText');
  root.innerHTML = '';
  const on = window.CHAPTERS.map((c,i) => i).filter(chapterVisible);
  if (!on.length){
    const d = document.createElement('div');
    d.className = 'story-empty';
    d.innerHTML = 'No chapters selected.<br>Use the <b>Chapters</b> menu in the toolbar to pick which stories to read.';
    root.appendChild(d);
    renderProgress();
    renderResumeBanner();
    return;
  }
  on.forEach(ci => {
    const ch = window.CHAPTERS[ci];
    const h = document.createElement('h3');
    h.className = 'chapter'; h.innerHTML = rubyText(ch.title); h.dataset.ci = ci;
    root.appendChild(h);
    chSentences(ci).forEach((s, si) => {
      if (isSentRemoved(ci, si, ch)) return;
      const p = document.createElement('p');
      p.className = 'sent';
      p.dataset.ch = ci; p.dataset.si = si;
      p.dataset.jp = stripReadings(s.jp);
      p.innerHTML = buildSegmentedHtml(s.jp);
      const star = document.createElement('button');
      star.className = 'star' + (bmIsSentence(ci, si) ? ' on' : '');
      star.textContent = bmIsSentence(ci, si) ? '★' : '☆';
      star.title = 'Bookmark sentence';
      star.addEventListener('click', e => { e.stopPropagation(); bmToggleSentence(ci, si); star.classList.toggle('on'); star.textContent = star.classList.contains('on') ? '★' : '☆'; });
      p.appendChild(star);
      const res = document.createElement('button');
      res.className = 'star resume-mark' + (isResumeSent(ci, si) ? ' on' : '');
      res.textContent = isResumeSent(ci, si) ? '📍' : '⚑';
      res.title = isResumeSent(ci, si) ? 'Reading position — click to clear' : 'Mark as reading position (resume here next time)';
      res.addEventListener('click', e => { e.stopPropagation(); const r = getResume(); if (r && r.ch === ci && r.si === si){ clearResume(); } else { setResume(ci, si); toast('📍 Saved — you\'ll resume here next time.'); } });
      p.appendChild(res);
      const tts = document.createElement('button');
      tts.className = 'star tts'; tts.textContent = '🔊'; tts.title = 'Listen';
      tts.addEventListener('click', e => { e.stopPropagation(); speak(s.jp); });
      p.appendChild(tts);
      const ed = document.createElement('button'); ed.className = 'star sent-ed'; ed.textContent = '✎'; ed.title = 'Edit sentence';
      ed.addEventListener('click', e => { e.stopPropagation(); editSent(ci, si); });
      p.appendChild(ed);
      const del = document.createElement('button'); del.className = 'star sent-del'; del.textContent = '✕'; del.title = 'Remove sentence';
      del.addEventListener('click', e => { e.stopPropagation(); deleteSent(ci, si); });
      p.appendChild(del);
      p.addEventListener('click', () => showSentence(ci, s, p, si));
      root.appendChild(p);
    });
    const addBtn = document.createElement('button');
    addBtn.textContent = '＋ 文を追加';
    addBtn.style.cssText = 'background:none;border:1px dashed var(--line);border-radius:8px;padding:4px 12px;cursor:pointer;font-size:11px;color:var(--muted);margin:4px 0 10px;display:block';
    addBtn.addEventListener('click', () => addSent(ci));
    root.appendChild(addBtn);
  });
  root.querySelectorAll('.w').forEach(sp => sp.addEventListener('click', e => {
    e.stopPropagation();
    const r = sp.getBoundingClientRect();
    toggleWordMenu(sp.dataset.w, r.left, r.bottom + 4);
  }));
  if (romajiOn) applyRomaji();
  renderResumeBanner();
}

function speak(text){
  if (!('speechSynthesis' in window)) { alert('Speech not supported in this browser.'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/（[^）]*）/g,''));
  u.lang = 'ja-JP';
  speechSynthesis.speak(u);
}

function entryEditForm(fields, vals){
  return fields.map(f => `<p style="margin:6px 0"><label style="font-size:12px;color:var(--muted)">${f.label}</label><br><input data-ef="${f.key}" value="${(vals[f.key]||'').replace(/"/g,'&quot;')}" style="width:100%;padding:6px 10px;border:1px solid var(--line);border-radius:8px;margin-top:2px"></p>`).join('') +
    `<div style="margin-top:10px;display:flex;gap:6px"><button id="eSave" style="background:#AEDD94;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-weight:700">Save</button><button id="eCancel" style="background:#FFC1CC;border:none;border-radius:8px;padding:6px 14px;cursor:pointer">Cancel</button></div>`;
}

function collectEdit(fields){
  const vals = {};
  document.querySelectorAll('#popupPanel [data-ef]').forEach(inp => vals[inp.dataset.ef] = inp.value.trim());
  return vals;
}

function kanjiCharsIn(text){
  const out = []; const seen = new Set();
  for (const ch of text){ if (/[\u4e00-\u9fff?]/.test(ch) && !seen.has(ch)){ seen.add(ch); out.push(ch); } }
  return out;
}
function fileWordToVocab(w){
  const v = lookupWord(w);
  if (D.vocab[w]){ toast('Already in Words: ' + w); return; }
  D.vocab[w] = {reading: v ? v.reading : '', meaning: v ? v.meaning : '', ...(v && v.pos ? {pos: v.pos} : {})};
  EDITS.removedWords = EDITS.removedWords.filter(x => x !== w);
  EDITS.addedWords[w] = D.vocab[w]; saveEdits();
  PAGE_EDITS.vocab[w] = D.vocab[w]; savePageEdits();
  VOCAB[w] = D.vocab[w]; rebuildWords();
  renderVocab();
  toast('Added to Words: ' + w);
}
function fileWordToKanji(w){
  const ks = kanjiCharsIn(w);
  if (!ks.length){ toast('No kanji in this word'); return; }
  const added = [];
  for (const k of ks){
    if (D.kanji[k]) continue;
    D.kanji[k] = {readings: '', meaning: '', strokes: ''};
    EDITS.removedKanji = EDITS.removedKanji.filter(x => x !== k);
    EDITS.addedKanji[k] = D.kanji[k]; saveEdits();
    PAGE_EDITS.kanji[k] = D.kanji[k];
    added.push(k);
  }
  savePageEdits();
  renderKanji();
  toast(added.length ? 'Added to Kanji: ' + added.join('') : 'Kanji already in list');
}
let wordMenuTarget = null;
function openWordMenu(w, x, y){
  const m = document.getElementById('wordMenu');
  if (!m) return;
  wordMenuTarget = w;
  m.innerHTML = `<div class="wm-title">${w}</div>
    <button data-act="words">→ Words<span class="wm-sub">add this word to the vocabulary list</span></button>
    <button data-act="kanji">→ Kanji<span class="wm-sub">add its kanji to the kanji list</span></button>
    <button data-act="details">Details…<span class="wm-sub">open the word popup</span></button>`;
  m.classList.remove('hidden');
  const mw = m.offsetWidth, mh = m.offsetHeight;
  let left = x, top = y;
  if (left + mw > window.innerWidth - 8) left = window.innerWidth - mw - 8;
  if (top + mh > window.innerHeight - 8) top = window.innerHeight - mh - 8;
  if (left < 8) left = 8;
  if (top < 8) top = 8;
  m.style.left = left + 'px'; m.style.top = top + 'px';
  m.querySelectorAll('button').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const act = b.dataset.act;
    closeWordMenu();
    if (act === 'words') fileWordToVocab(w);
    else if (act === 'kanji') fileWordToKanji(w);
    else openWordPopup(w);
  }));
}
function toggleWordMenu(w, x, y){
  const m = document.getElementById('wordMenu');
  if (!m) return;
  if (!m.classList.contains('hidden') && wordMenuTarget === w){ closeWordMenu(); return; }
  openWordMenu(w, x, y);
}
function closeWordMenu(){ const m = document.getElementById('wordMenu'); if (m) m.classList.add('hidden'); wordMenuTarget = null; }
document.addEventListener('click', e => { if (!e.target.closest('#wordMenu')) closeWordMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWordMenu(); });

// Drag-select text in the story: offer the same quick actions on the selection.
// Reading <rt> elements are dropped from the clone so the menu acts on the
// base text (私, not 私（わたし）).
function selectionText(sel){
  if (!sel || !sel.rangeCount) return '';
  const frag = sel.getRangeAt(0).cloneContents();
  frag.querySelectorAll('rt').forEach(n => n.remove());
  frag.querySelectorAll('rp').forEach(n => n.remove());
  // Furigana may also be inlined as literal text, e.g. 私（わたし）.
  return stripReadings(frag.textContent || '').replace(/\s+/g, '').trim();
}
let selectMenuTimer = null;
document.addEventListener('mouseup', e => {
  clearTimeout(selectMenuTimer);
  // A click on the menu (or any control) must not re-trigger this via a
  // selection that is still active from an earlier drag.
  if (e.target && e.target.closest && e.target.closest('#wordMenu, button, select, input, textarea')) {
    const sel0 = window.getSelection();
    if (sel0) sel0.removeAllRanges();
    return;
  }
  selectMenuTimer = setTimeout(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = selectionText(sel);
    if (!text || text.length > 60) return;
    const story = document.getElementById('storyText');
    if (!story || !sel.anchorNode || !story.contains(sel.anchorNode)) return;
    const m = document.getElementById('wordMenu');
    if (m && m.contains(sel.anchorNode)) return;
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect || (!rect.width && !rect.height)) return;
    openWordMenu(text, rect.left, rect.bottom + 4);
  }, 10);
});

function openWordPopup(w){
  const v = lookupWord(w);
  const ks2 = kanjisIn(w);
  showPopup(`<div class="puplayout"><div class="pupl-left">${w}</div><div class="pupl-div"></div><div class="pupl-right">
    <p class="sent-en">${v?v.reading:''}${v&&v.pos?' <span class="pos">'+v.pos+'</span>':''} <button id="ttsWord" title="Listen" style="background:none;border:none;cursor:pointer;font-size:16px">🔊</button></p>
    <p>${v?v.meaning:'—'}</p>
    ${ks2.filter(k => !isKnown(k)).length ? `<h3>Kanji</h3>` + ks2.filter(k => !isKnown(k)).map(k => { const v2 = D.kanji[k]; return `<p style="font-size:15px"><b class="pop-klink" data-k="${k}" style="font-family:'Noto Serif JP',serif;font-size:20px;cursor:pointer;color:#d1567f">${k}</b> — ${v2.readings} — ${v2.meaning}</p>`; }).join('') : ''}
    <button class="star ${bmIsWord(w)?'on':''}" id="bmWord" style="margin-top:10px" title="Bookmark word">${bmIsWord(w)?'★':'☆'} Bookmark</button>
    <button class="star ${isKnownW(w)?'on':''}" id="wpKnown" style="margin-top:10px;margin-left:8px" title="Mark as known">${isKnownW(w)?'✓ Known':'Mark as known'}</button>
    <button id="btnEdit" style="margin-top:10px;background:none;border:1px solid var(--line);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:12px">Edit</button></div></div>`);
  const bw = document.getElementById('bmWord');
  document.querySelectorAll('#popupPanel .pop-klink').forEach(el => el.addEventListener('click', () => openKanjiPopup(el.dataset.k)));
  if (bw) bw.addEventListener('click', () => { bmToggleWord(w); openWordPopup(w); });
  const wpK = document.getElementById('wpKnown');
  if (wpK) wpK.addEventListener('click', () => { toggleKnownW(w); openWordPopup(w); renderKnown(); renderVocab(); renderVocab5(); renderBms(); refreshFilterViews(); renderStory(); const selW2 = document.querySelector('#storyText p.sent.sel'); if (selW2) selW2.click(); });
  const be = document.getElementById('btnEdit');
  if (be) be.addEventListener('click', () => {
    const src = wordSource(w);
    if (!(src === 'vocab' ? D.vocab[w] : D.vocab5[w])) {
      (src === 'vocab' ? D.vocab : D.vocab5)[w] = {reading: v?v.reading:'', meaning: v?v.meaning:'', ...(v && v.pos ? {pos: v.pos} : {})};
    }
    document.getElementById('popupPanel').innerHTML = entryEditForm(
      [{key:'reading',label:'Reading'},{key:'meaning',label:'Meaning'},{key:'pos',label:'POS'}],
      {reading: v?v.reading:'', meaning: v?v.meaning:'', pos: v?v.pos:''});
    document.getElementById('eCancel').addEventListener('click', () => openWordPopup(w));
    document.getElementById('eSave').addEventListener('click', () => {
      const vals = collectEdit();
      const ds = src === 'vocab' ? D.vocab : D.vocab5;
      ds[w] = {...ds[w], reading: vals.reading, meaning: vals.meaning, ...(vals.pos ? {pos: vals.pos} : {})};
      PAGE_EDITS[src][w] = ds[w]; savePageEdits();
      EDITS.addedWords[w] = ds[w]; saveEdits();
      VOCAB[w] = ds[w]; rebuildWords();
      renderVocab(); renderVocab5();
      openWordPopup(w);
      const selW = document.querySelector('#storyText p.sent.sel'); if (selW) selW.click();
    });
  });
}

function showSentence(ci, sent, el, si){
  document.querySelectorAll('#storyText p').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');
  if (si === undefined) si = window.CHAPTERS[ci].sentences.indexOf(sent);
  if (si >= 0) markRead(ci, si);
  const ch = window.CHAPTERS[ci];
  const raw = sent.jp;
  const plain = stripReadings(raw);
  const words = []; const seen = new Set();
  segment(plain).forEach(seg => { if (seg.word && !seen.has(seg.t)){ seen.add(seg.t); words.push(seg.t); } });
  const ks = kanjisIn(plain);
  const gs = grammarInSentence(plain);
  const customTrans = getTrans(plain);
  const transText = customTrans || sent.en || (ch.en ? 'Chapter summary: ' + ch.en : '');
  let html = `<h2>Sentence — ${ch.title}</h2>
    <p class="sent-jp">${rawToHtml(raw)}</p> <button id="ttsSent" title="Listen" style="background:none;border:none;cursor:pointer;font-size:16px;vertical-align:middle">🔊</button>
    ${romajiOn ? `<p class="romaji-line">${window.wanakana ? wanakana.toRomaji(plain) : ''}</p>` : ''}
    <p class="sent-en" id="sentEn">${transText} <button class="editbtn" id="editTrans" title="Edit translation">✎</button></p>`;
  if (gs.filter(g => !isKnownG(g.pattern)).length) html += `<h3>Grammar used</h3>` + gs.filter(g => !isKnownG(g.pattern)).map(g=>`<span class="chip gold" data-gp="${g.pattern}" style="cursor:pointer">${g.pattern}</span>`).join('');
  if (ch.focus) html += `<h3>Grammar focus (chapter)</h3><p class="meaning" style="font-size:12px">${ch.focus}</p>`;
       html += `<h3>Words (${words.filter(w => !isKnownW(w)).length}) <span style="font-weight:400;color:var(--muted);font-size:11px">— click a word</span> <button id="editSeg" style="float:right;background:none;border:1px solid var(--line);border-radius:8px;padding:2px 10px;cursor:pointer;font-size:11px;color:var(--muted)">Edit split</button></h3><table><thead><tr><th>Word</th><th>Reading</th><th>Meaning</th><th>POS</th><th></th><th></th><th></th></tr></thead><tbody>` +
    words.filter(w => !isKnownW(w)).map(w=>{const v=lookupWord(w);return `<tr><td><a class="wlink" data-w="${w}">${w}</a></td><td>${v?v.reading:''}</td><td class="meaning">${v?v.meaning:''}</td><td><span class="pos">${v&&v.pos?v.pos:''}</span></td><td><button class="star ${bmIsWord(w)?'on':''}" data-bmw="${w}" title="Bookmark word">${bmIsWord(w)?'★':'☆'}</button></td><td><button class="edbtn" data-edw="${w}" title="Edit">✎</button></td><td><button class="del" data-delw="${w}" title="Remove">✕</button></td></tr>`}).join('') + `</tbody></table>
    <div class="addrow"><input id="addW" placeholder="word"><input id="addWR" placeholder="reading"><input id="addWM" placeholder="meaning"><input id="addWP" placeholder="pos"><button id="addWb">Add</button></div>`;
  const ksv = ks.filter(k => !isKnown(k));
  if (ksv.length) html += `<h3>Kanji (${ksv.length})</h3><table><thead><tr><th>Kanji</th><th>Readings</th><th>Meaning</th><th></th><th></th><th></th></tr></thead><tbody>` +
    ksv.map(k=>{const v=D.kanji[k];return `<tr><td style="font-family:'Noto Serif JP',serif;font-size:18px;cursor:pointer" class="klink" data-k="${k}">${k}</td><td class="meaning">${v.readings}</td><td class="meaning">${v.meaning}</td><td><button class="star ${bmIsKanji(k)?'on':''}" data-bmk="${k}" title="Bookmark kanji">${bmIsKanji(k)?'★':'☆'}</button></td><td><button class="edbtn" data-edk="${k}" title="Edit">✎</button></td><td><button class="del" data-delk="${k}" title="Remove">✕</button></td></tr>`}).join('') + `</tbody></table>`;
  html += `<div class="addrow"><input id="addK" placeholder="kanji"><input id="addKR" placeholder="readings"><input id="addKM" placeholder="meaning"><button id="addKb">Add</button></div>`;
  document.getElementById('detail').innerHTML = html;
  document.querySelectorAll('#detail .wlink').forEach(a => a.addEventListener('click', () => openWordPopup(a.dataset.w)));
  document.querySelectorAll('#detail [data-gp]').forEach(c => c.addEventListener('click', () => {
    const g = D.grammar.find(x => x.pattern === c.dataset.gp);
    if (!g) return;
    showPopup(`<div class="puplayout"><div class="pupl-left">${g.pattern}</div><div class="pupl-div"></div><div class="pupl-right">
      <p class="sent-en">${g.romaji} <button class="ttsbtn" data-speak="${g.example_jp||g.pattern}" title="Listen">🔊</button></p>
      <p>${g.meaning}</p>
      ${g.example_jp ? `<h3>Example</h3><div class="gexample"><span class="gex-jp">${g.example_jp}</span><span class="gex-en">${g.example_en||''}</span></div>` : ''}
      <button class="star ${isKnownG(g.pattern)?'on':''}" id="cgpKnown" style="margin-top:10px" title="Mark as known">${isKnownG(g.pattern)?'✓ Known':'Mark as known'}</button></div></div>`);
    const kk = document.getElementById('cgpKnown');
    if (kk) kk.addEventListener('click', () => { toggleKnownG(g.pattern); document.querySelector('p.sent.sel') && document.querySelector('p.sent.sel').click(); renderKnown(); renderGrammar(); renderGrammar5(); renderBms(); refreshFilterViews(); });
  }));
  document.querySelectorAll('#detail [data-delw]').forEach(b => b.addEventListener('click', () => {
    const w = b.dataset.delw;
    EDITS.removedWords.push(w); delete EDITS.addedWords[w]; delete VOCAB[w]; saveEdits(); rebuildWords(); showSentence(ci, sent, el);
    if (D.vocab[w]) { renderVocab(); } else { renderVocab5(); }
    refreshFilterViews();
  }));
  document.querySelectorAll('#detail [data-delk]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.delk;
    EDITS.removedKanji.push(k); delete EDITS.addedKanji[k]; delete D.kanji[k]; saveEdits(); showSentence(ci, sent, el);
    if (D.kanji5[k]) { renderKanji5(); } else { renderKanji(); }
    refreshFilterViews();
  }));
  document.querySelectorAll('#detail [data-edw]').forEach(b => b.addEventListener('click', () => { openWordPopup(b.dataset.edw); const be = document.getElementById('btnEdit'); if (be) be.click(); }));
  document.querySelectorAll('#detail [data-edk]').forEach(b => b.addEventListener('click', () => { openKanjiPopup(b.dataset.edk); const be = document.getElementById('btnEdit'); if (be) be.click(); }));
  document.getElementById('addWb').addEventListener('click', () => {
    const w = document.getElementById('addW').value.trim();
    const r = document.getElementById('addWR').value.trim();
    const m = document.getElementById('addWM').value.trim();
    const p = document.getElementById('addWP').value.trim();
    if (!w) return;
    VOCAB[w] = {reading: r, meaning: m, ...(p ? {pos: p} : {})}; EDITS.addedWords[w] = VOCAB[w];
    EDITS.removedWords = EDITS.removedWords.filter(x => x !== w);
    saveEdits(); rebuildWords(); showSentence(ci, sent, el);
  });
  document.getElementById('addKb').addEventListener('click', () => {
    const k = document.getElementById('addK').value.trim();
    const r = document.getElementById('addKR').value.trim();
    const m = document.getElementById('addKM').value.trim();
    if (!k) return;
    D.kanji[k] = {readings: r, meaning: m, strokes: ''}; EDITS.addedKanji[k] = D.kanji[k];
    EDITS.removedKanji = EDITS.removedKanji.filter(x => x !== k);
    saveEdits(); showSentence(ci, sent, el);
  });
  document.querySelectorAll('#detail [data-bmw]').forEach(b => b.addEventListener('click', () => {
    bmToggleWord(b.dataset.bmw);
    showSentence(ci, sent, el);
  }));
  document.querySelectorAll('#detail [data-bmk]').forEach(b => b.addEventListener('click', () => {
    bmToggleKanji(b.dataset.bmk);
    showSentence(ci, sent, el);
  }));
  document.querySelectorAll('#detail .klink').forEach(td => td.addEventListener('click', () => openKanjiPopup(td.dataset.k)));

  const editBtn = document.getElementById('editTrans');
  const ttsSentBtn = document.getElementById('ttsSent');
  if (ttsSentBtn) ttsSentBtn.addEventListener('click', () => speak(plain));
  if (editBtn) editBtn.addEventListener('click', () => {
    const enEl = document.getElementById('sentEn');
    const current = transText;
    enEl.innerHTML = `<input id="transInput" value="${current.replace(/"/g,'&quot;')}" style="width:100%;padding:6px 10px;border:1px solid var(--line);border-radius:8px;font-size:14px">
      <div style="margin-top:6px;display:flex;gap:6px">
        <button id="transSave" style="background:#AEDD94;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-weight:700">Save</button>
        <button id="transCancel" style="background:#FFC1CC;border:none;border-radius:8px;padding:6px 14px;cursor:pointer">Cancel</button>
      </div>`;
    document.getElementById('transInput').focus();
    document.getElementById('transCancel').addEventListener('click', () => showSentence(ci, sent, el));
    document.getElementById('transSave').addEventListener('click', () => {
      const val = document.getElementById('transInput').value.trim();
      trans[plain] = val;
      saveTrans();
      showSentence(ci, sent, el);
    });
  });

  const segBtn = document.getElementById('editSeg');
  if (segBtn) segBtn.addEventListener('click', () => {
    const existing = segBtn.closest('h3').parentElement.querySelector('.seg-edit-area');
    if (existing) existing.remove();
    const tokens = segment(plain).map(s => s.t).join(' | ');
    const area = document.createElement('div');
    area.className = 'seg-edit-area';
    area.innerHTML = `<p class="meaning" style="font-size:12px;margin:8px 0">Separate words with | (pipe):</p>
      <input id="segInput" value="${tokens.replace(/"/g,'&quot;')}" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:14px;font-family:'Noto Serif JP',serif">
      <div style="margin-top:8px;display:flex;gap:6px">
        <button id="segSave" style="background:#AEDD94;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-weight:700">Save</button>
        <button id="segCancel" style="background:#FFC1CC;border:none;border-radius:8px;padding:6px 14px;cursor:pointer">Cancel</button>
        <button id="segReset" style="background:none;border:1px solid var(--line);border-radius:8px;padding:6px 14px;cursor:pointer">Auto</button>
      </div>`;
    segBtn.closest('h3').after(area);
    document.getElementById('segCancel').addEventListener('click', () => area.remove());
    document.getElementById('segReset').addEventListener('click', () => { delete SEG[plain]; saveSegs(); renderStory(); showSentence(ci, sent, el); });
    document.getElementById('segSave').addEventListener('click', () => {
      const parts = document.getElementById('segInput').value.split('|').map(s => s.trim()).filter(Boolean);
      SEG[plain] = parts; saveSegs(); renderStory(); showSentence(ci, sent, el);
    });
  });
}

function showWord(w){
  const v = lookupWord(w) || {};
  const ks = kanjisIn(w);
  let html = `<h2>Word</h2><p class="sent-jp">${w}</p>
    <p class="sent-en">${v.reading||''}</p><p>${v.meaning||'—'}</p>`;
  if (ks.length) html += `<h3>Kanji in this word</h3><table><thead><tr><th>Kanji</th><th>Readings</th><th>Meaning</th><th></th></tr></thead><tbody>` +
    ks.map(k=>{const v2=D.kanji[k];return `<tr><td style="font-family:'Noto Serif JP',serif;font-size:18px">${k}</td><td class="meaning">${v2.readings}</td><td class="meaning">${v2.meaning}</td><td><button class="star ${bmIsKanji(k)?'on':''}" data-bmk="${k}">${bmIsKanji(k)?'★':'☆'}</button></td></tr>`}).join('') + `</tbody></table>`;
  document.getElementById('detail').innerHTML = html;
  document.querySelectorAll('#detail [data-delk]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.delk;
    EDITS.removedKanji.push(k); delete EDITS.addedKanji[k]; delete D.kanji[k]; delete D.kanji5[k]; saveEdits(); showWord(w);
  }));
  document.querySelectorAll('#detail [data-bmk]').forEach(b => b.addEventListener('click', () => {
    bmToggleKanji(b.dataset.bmk);
    showWord(w);
  }));
}

// Tabs
const TAB_GROUP = { vocab:'n4', kanji:'n4', grammar:'n4', vocab5:'n5', kanji5:'n5', grammar5:'n5' };
function markActiveTab(id){
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  const leaf = document.querySelector(`.tab[data-tab="${id}"]`);
  if (leaf) leaf.classList.add('active');
  // Keep the level parent (N4/N5) lit while one of its pages is open.
  const grp = TAB_GROUP[id];
  if (grp){
    const parent = document.querySelector(`.menu-btn[data-group="${grp}"]`);
    if (parent) parent.classList.add('active');
  }
}
document.querySelectorAll('.tab').forEach(t => {
  if (t.classList.contains('menu-btn')) return;
  if (!t.dataset.tab) return;
  t.addEventListener('click', () => {
    document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
    document.getElementById(t.dataset.tab).classList.add('active');
    markActiveTab(t.dataset.tab);
    document.querySelectorAll('.menu').forEach(m=>m.classList.remove('open'));
  });
});
document.querySelectorAll('.menu-btn').forEach(b => b.addEventListener('click', e => {
  e.stopPropagation();
  const m = b.closest('.menu');
  document.querySelectorAll('.menu').forEach(x => { if (x !== m) x.classList.remove('open'); });
  m.classList.toggle('open');
}));
document.addEventListener('click', () => document.querySelectorAll('.menu').forEach(m=>m.classList.remove('open')));

// Furigana toggle
document.getElementById('furigana').addEventListener('change', e => {
  document.getElementById('storyText').classList.toggle('no-ruby', !e.target.checked);
});

// Romaji toggle
let romajiOn = false;
function applyRomaji(){
  document.querySelectorAll('#storyText p.sent').forEach(p => {
    let r = p.querySelector('.romaji-line');
    if (romajiOn){
      if (!r){
        r = document.createElement('div');
        r.className = 'romaji-line';
        // use the clean Japanese source (readings live in <rt>, and p.textContent would mix them in)
        const jp = p.dataset.jp || '';
        r.textContent = window.wanakana && jp ? wanakana.toRomaji(jp) : '';
        p.appendChild(r);
      }
    } else if (r) r.remove();
  });
}
document.getElementById('romaji').addEventListener('change', e => {
  romajiOn = e.target.checked;
  applyRomaji();
  if (romajiOn && fcCurrent) fcRender();
});

// Vocab tab
const vt = document.querySelector('#vocabTable tbody');
function renderVocab(f='', fl){
  fl = fl || FILTERS.vocab; FILTERS.vocab = fl;
  const f2 = f.toLowerCase();
  const si = storyIndex();
  const entries = Object.entries(D.vocab)
    .filter(([w,v]) => !isKnownW(w) && filterPass(fl, 'v:'+w, {bm: bmIsWord(w), edited: !!(PAGE_EDITS.vocab[w] || EDITS.addedWords[w]), story: si.words.has(w)}));
  FILTER_TOTAL.vocab = Object.keys(D.vocab).length;
  FILTER_SHOWN.vocab = entries.length;
  vt.innerHTML = entries
    .filter(([w,v]) => w.includes(f) || v.reading.includes(f) || v.meaning.toLowerCase().includes(f2))
    .map(([w,v]) => `<tr><td>${w}</td><td>${v.reading}</td><td class="meaning">${v.meaning}</td><td>${v.pos?`<span class="pos">${v.pos}</span>`:''}</td><td><button class="ttsbtn" data-speak="${w}" title="Listen">🔊</button><button class="knwbtn" data-t="w" data-k="${w}" title="Mark as known">✓</button></td></tr>`).join('');
}
document.getElementById('vocabSearch').addEventListener('input', e => renderVocab(e.target.value));
document.querySelectorAll('input[name="vocabFilter"]').forEach(r => r.addEventListener('change', () => setFilter('vocab', r.value)));

// Kanji tab
const kg = document.getElementById('kanjiGrid');
function openKanjiPopup(k){
  const v = D.kanji[k] || D.kanji5[k];
  if (!v) return;
  showPopup(`<div class="puplayout"><div class="pupl-left">${k}</div><div class="pupl-div"></div><div class="pupl-right">
    <p class="sent-en">${v.readings} <button class="ttsbtn" data-speak="${k}" title="Listen">🔊</button></p>
    <p>${v.meaning}</p>
    ${v.strokes ? `<p class="meaning" style="margin-top:8px">Strokes: ${v.strokes}</p>` : ''}
    <button class="star ${bmIsKanji(k)?'on':''}" id="bmKanji" style="margin-top:10px" title="Bookmark kanji">${bmIsKanji(k)?'★':'☆'} Bookmark</button>
    <button class="star ${isKnown(k)?'on':''}" id="kpKnown" style="margin-top:10px;margin-left:8px" title="Mark as known">${isKnown(k)?'✓ Known':'Mark as known'}</button>
    <button id="btnEdit" style="margin-top:10px;background:none;border:1px solid var(--line);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:12px">Edit</button>
    <a href="http://localhost:3000/${encodeURIComponent(k)}.html" target="_blank" rel="noopener" style="display:inline-block;margin-top:10px;margin-left:8px;background:none;border:1px solid var(--line);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:12px;color:#d1567f;text-decoration:none">🗺 Open in Kanji Map</a></div></div>
    <div class="mapwrap"><iframe src="http://localhost:3000/${encodeURIComponent(k)}.html" title="The Kanji Map" style="height:520px"></iframe><div class="zone z-graph" data-src="http://localhost:3000/${encodeURIComponent(k)}.html" data-param="?graph=big"><span>Graph — enlarge</span></div><div class="zone z-kanji" data-src="http://localhost:3000/${encodeURIComponent(k)}.html" data-param="?panel=kanji"><span>Kanji — enlarge</span></div><div class="zone z-radical" data-src="http://localhost:3000/${encodeURIComponent(k)}.html" data-param="?panel=radical"><span>Radical — enlarge</span></div><div class="zone z-examples" data-src="http://localhost:3000/${encodeURIComponent(k)}.html" data-param="?panel=examples"><span>Examples — enlarge</span></div></div>`);
  const bk = document.getElementById('bmKanji');
  if (bk) bk.addEventListener('click', () => { bmToggleKanji(k); openKanjiPopup(k); });
  const kpK = document.getElementById('kpKnown');
  if (kpK) kpK.addEventListener('click', () => { toggleKnown(k); openKanjiPopup(k); renderKnown(); renderKanji(); renderKanji5(); renderBms(); refreshFilterViews(); renderStory(); const selK2 = document.querySelector('#storyText p.sent.sel'); if (selK2) selK2.click(); });
  const be = document.getElementById('btnEdit');
  if (be) be.addEventListener('click', () => {
    const src = kanjiSource(k);
    document.getElementById('popupPanel').innerHTML = entryEditForm(
      [{key:'readings',label:'Readings'},{key:'meaning',label:'Meaning'},{key:'strokes',label:'Strokes'}],
      {readings: v.readings, meaning: v.meaning, strokes: v.strokes});
    document.getElementById('eCancel').addEventListener('click', () => openKanjiPopup(k));
    document.getElementById('eSave').addEventListener('click', () => {
      const vals = collectEdit();
      const ds = src === 'kanji' ? D.kanji : D.kanji5;
      ds[k] = {...ds[k], readings: vals.readings, meaning: vals.meaning, strokes: vals.strokes};
      PAGE_EDITS[src][k] = ds[k]; savePageEdits();
      EDITS.addedKanji[k] = ds[k]; saveEdits();
      renderKanji(); renderKanji5();
      openKanjiPopup(k);
      const selK = document.querySelector('#storyText p.sent.sel'); if (selK) selK.click();
    });
  });
}

function openGrammarPopup(g){
  if (!g) return;
  showPopup(`<div class="puplayout"><div class="pupl-left">${g.pattern}</div><div class="pupl-div"></div><div class="pupl-right">
    <p class="sent-en">${g.romaji} <button class="ttsbtn" data-speak="${g.example_jp||g.pattern}" title="Listen">🔊</button></p>
    <p>${g.meaning}</p>
    ${g.example_jp ? `<h3>Example</h3><div class="gexample"><span class="gex-jp">${g.example_jp}</span><span class="gex-en">${g.example_en||''}</span></div>` : ''}
    <button class="star ${bmIsGrammar(g.pattern)?'on':''}" id="bmGrammar" style="margin-top:10px" title="Bookmark grammar">${bmIsGrammar(g.pattern)?'★':'☆'} Bookmark</button>
    <button class="star ${isKnownG(g.pattern)?'on':''}" id="gpKnown" style="margin-top:10px;margin-left:8px" title="Mark as known">${isKnownG(g.pattern)?'✓ Known':'Mark as known'}</button>
    <button id="btnEdit" style="margin-top:10px;background:none;border:1px solid var(--line);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:12px">Edit</button></div></div>`);
  const bg = document.getElementById('bmGrammar');
  if (bg) bg.addEventListener('click', () => { bmToggleGrammar(g.pattern); openGrammarPopup(g); refreshFilterViews(); });
  const gpK = document.getElementById('gpKnown');
  if (gpK) gpK.addEventListener('click', () => { toggleKnownG(g.pattern); openGrammarPopup(g); renderKnown(); renderGrammar(); renderGrammar5(); renderBms(); refreshFilterViews(); const selG2 = document.querySelector('#storyText p.sent.sel'); if (selG2) selG2.click(); });
  const be = document.getElementById('btnEdit');
  if (be) be.addEventListener('click', () => {
    const src = D.grammar.includes(g) ? 'grammar' : 'grammar5';
    document.getElementById('popupPanel').innerHTML = entryEditForm(
      [{key:'romaji',label:'Romaji'},{key:'meaning',label:'Meaning'},{key:'example_jp',label:'Example (JP)'},{key:'example_en',label:'Example (EN)'}],
      {romaji: g.romaji, meaning: g.meaning, example_jp: g.example_jp||'', example_en: g.example_en||''});
    document.getElementById('eCancel').addEventListener('click', () => openGrammarPopup(g));
    document.getElementById('eSave').addEventListener('click', () => {
      const vals = collectEdit();
      Object.assign(g, {romaji: vals.romaji, meaning: vals.meaning, example_jp: vals.example_jp, example_en: vals.example_en});
      PAGE_EDITS[src][g.pattern] = g; savePageEdits();
      renderGrammar(); renderGrammar5();
      openGrammarPopup(g);
      const selG = document.querySelector('#storyText p.sent.sel'); if (selG) selG.click();
    });
  });
}

document.getElementById('vocabTable').addEventListener('click', e => {
  if (e.target.closest('.ttsbtn') || e.target.closest('.knwbtn')) return;
  const tr = e.target.closest('tbody tr');
  if (tr) openWordPopup(tr.querySelector('td').textContent);
});
document.getElementById('vocab5Table').addEventListener('click', e => {
  if (e.target.closest('.ttsbtn') || e.target.closest('.knwbtn')) return;
  const tr = e.target.closest('tbody tr');
  if (tr) openWordPopup(tr.querySelector('td').textContent);
});
document.getElementById('grammarList').addEventListener('click', e => {
  if (e.target.closest('.ttsbtn') || e.target.closest('.knwbtn')) return;
  const card = e.target.closest('.gcard');
  if (!card) return;
  const pattern = card.querySelector('b').textContent;
  openGrammarPopup(D.grammar.find(g => g.pattern === pattern));
});
document.getElementById('grammar5List').addEventListener('click', e => {
  if (e.target.closest('.ttsbtn') || e.target.closest('.knwbtn')) return;
  const card = e.target.closest('.gcard');
  if (!card) return;
  const pattern = card.querySelector('b').textContent;
  openGrammarPopup(D.grammar5.find(g => g.pattern === pattern));
});

function renderKanji(f='', fl){
  fl = fl || FILTERS.kanji; FILTERS.kanji = fl;
  const f2 = f.toLowerCase();
  const si = storyIndex();
  const entries = Object.entries(D.kanji)
    .filter(([k,v]) => !isKnown(k) && filterPass(fl, 'k:'+k, {bm: bmIsKanji(k), edited: !!(PAGE_EDITS.kanji[k] || EDITS.addedKanji[k]), story: si.kanji.has(k)}));
  FILTER_TOTAL.kanji = Object.keys(D.kanji).length;
  FILTER_SHOWN.kanji = entries.length;
  kg.innerHTML = entries
    .filter(([k,v]) => k.includes(f) || v.readings.toLowerCase().includes(f2) || v.meaning.toLowerCase().includes(f2))
    .map(([k,v]) => `<div class="kcard" data-k="${k}"><button class="ttsbtn kcard-tts" data-speak="${k}" title="Listen">🔊</button><button class="knwbtn" data-t="k" data-k="${k}" title="Mark as known">✓</button><div class="k">${k}</div><div class="r">${v.readings}</div><div class="m">${v.meaning}</div></div>`).join('');
}
document.getElementById('kanjiSearch').addEventListener('input', e => renderKanji(e.target.value));
document.querySelectorAll('input[name="kanjiFilter"]').forEach(r => r.addEventListener('change', () => setFilter('kanji', r.value)));

// Kanji tab click handler
kg.addEventListener('click', e => {
  if (e.target.closest('.ttsbtn') || e.target.closest('.knwbtn')) return;
  const c = e.target.closest('.kcard'); if (!c) return;
  openKanjiPopup(c.dataset.k);
});

// Grammar tab
const gl = document.getElementById('grammarList');
function renderGrammar(f='', fl){
  fl = fl || FILTERS.grammar; FILTERS.grammar = fl;
  const f2 = f.toLowerCase();
  const si = storyIndex();
  const entries = D.grammar
    .filter(g => !isKnownG(g.pattern) && filterPass(fl, 'g:'+g.pattern, {bm: bmIsGrammar(g.pattern), edited: !!PAGE_EDITS.grammar[g.pattern], story: si.gram.has(g.pattern)}));
  FILTER_TOTAL.grammar = D.grammar.length;
  FILTER_SHOWN.grammar = entries.length;
  gl.innerHTML = entries
    .filter(g => g.pattern.includes(f) || g.meaning.toLowerCase().includes(f2) || g.romaji.toLowerCase().includes(f2))
    .map(g => `<div class="gcard"><button class="ttsbtn gcard-tts" data-speak="${g.example_jp||g.pattern}" title="Listen">🔊</button><button class="knwbtn" data-t="g" data-k="${g.pattern}" title="Mark as known">✓</button><b>${g.pattern}</b><span class="rom">${g.romaji}</span><p>${g.meaning}</p>
      ${g.example_jp ? `<div class="gexample"><span class="gex-jp">${g.example_jp}</span><span class="gex-en">${g.example_en||''}</span></div>` : ''}
    </div>`).join('');
}
document.getElementById('grammarSearch').addEventListener('input', e => renderGrammar(e.target.value));
document.querySelectorAll('input[name="grammarFilter"]').forEach(r => r.addEventListener('change', () => setFilter('grammar', r.value)));

let toastT;
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2600); }

// N5 tabs
const vt5 = document.querySelector('#vocab5Table tbody');
function renderVocab5(f='', fl){
  fl = fl || FILTERS.vocab5; FILTERS.vocab5 = fl;
  const f2 = f.toLowerCase();
  const si = storyIndex();
  const entries = Object.entries(D.vocab5)
    .filter(([w,v]) => !isKnownW(w) && filterPass(fl, 'v5:'+w, {bm: bmIsWord(w), edited: !!(PAGE_EDITS.vocab5[w] || EDITS.addedWords[w]), story: si.words.has(w)}));
  FILTER_TOTAL.vocab5 = Object.keys(D.vocab5).length;
  FILTER_SHOWN.vocab5 = entries.length;
  vt5.innerHTML = entries
    .filter(([w,v]) => w.includes(f) || v.reading.includes(f) || v.meaning.toLowerCase().includes(f2))
    .map(([w,v]) => `<tr><td>${w}</td><td>${v.reading}</td><td class="meaning">${v.meaning}</td><td>${v.pos?`<span class="pos">${v.pos}</span>`:''}</td><td><button class="ttsbtn" data-speak="${w}" title="Listen">🔊</button><button class="knwbtn" data-t="w" data-k="${w}" title="Mark as known">✓</button></td></tr>`).join('');
}
document.getElementById('vocab5Search').addEventListener('input', e => renderVocab5(e.target.value));
document.querySelectorAll('input[name="vocab5Filter"]').forEach(r => r.addEventListener('change', () => setFilter('vocab5', r.value)));

const kg5 = document.getElementById('kanji5Grid');
function renderKanji5(f='', fl){
  fl = fl || FILTERS.kanji5; FILTERS.kanji5 = fl;
  const f2 = f.toLowerCase();
  const si = storyIndex();
  const entries = Object.entries(D.kanji5)
    .filter(([k,v]) => !isKnown(k) && filterPass(fl, 'k5:'+k, {bm: bmIsKanji(k), edited: !!(PAGE_EDITS.kanji5[k] || EDITS.addedKanji[k]), story: si.kanji.has(k)}));
  FILTER_TOTAL.kanji5 = Object.keys(D.kanji5).length;
  FILTER_SHOWN.kanji5 = entries.length;
  kg5.innerHTML = entries
    .filter(([k,v]) => k.includes(f) || v.readings.toLowerCase().includes(f2) || v.meaning.toLowerCase().includes(f2))
    .map(([k,v]) => `<div class="kcard" data-k="${k}"><button class="ttsbtn kcard-tts" data-speak="${k}" title="Listen">🔊</button><button class="knwbtn" data-t="k" data-k="${k}" title="Mark as known">✓</button><div class="k">${k}</div><div class="r">${v.readings}</div><div class="m">${v.meaning}</div></div>`).join('');
}
document.getElementById('kanji5Search').addEventListener('input', e => renderKanji5(e.target.value));
document.querySelectorAll('input[name="kanji5Filter"]').forEach(r => r.addEventListener('change', () => setFilter('kanji5', r.value)));
kg5.addEventListener('click', e => {
  if (e.target.closest('.ttsbtn') || e.target.closest('.knwbtn')) return;
  const c = e.target.closest('.kcard'); if (!c) return;
  openKanjiPopup(c.dataset.k);
});

const gl5 = document.getElementById('grammar5List');
function renderGrammar5(f='', fl){
  fl = fl || FILTERS.grammar5; FILTERS.grammar5 = fl;
  const f2 = f.toLowerCase();
  const si = storyIndex();
  const entries = D.grammar5
    .filter(g => !isKnownG(g.pattern) && filterPass(fl, 'g5:'+g.pattern, {bm: bmIsGrammar(g.pattern), edited: !!PAGE_EDITS.grammar5[g.pattern], story: si.gram.has(g.pattern)}));
  FILTER_TOTAL.grammar5 = D.grammar5.length;
  FILTER_SHOWN.grammar5 = entries.length;
  gl5.innerHTML = entries
    .filter(g => g.pattern.includes(f) || g.meaning.toLowerCase().includes(f2) || g.romaji.toLowerCase().includes(f2))
    .map(g => `<div class="gcard"><button class="ttsbtn gcard-tts" data-speak="${g.example_jp||g.pattern}" title="Listen">🔊</button><button class="knwbtn" data-t="g" data-k="${g.pattern}" title="Mark as known">✓</button><b>${g.pattern}</b><span class="rom">${g.romaji}</span><p>${g.meaning}</p>
      ${g.example_jp ? `<div class="gexample"><span class="gex-jp">${g.example_jp}</span><span class="gex-en">${g.example_en||''}</span></div>` : ''}
    </div>`).join('');
}
document.getElementById('grammar5Search').addEventListener('input', e => renderGrammar5(e.target.value));
document.querySelectorAll('input[name="grammar5Filter"]').forEach(r => r.addEventListener('change', () => setFilter('grammar5', r.value)));

// ===== Page add-entry forms =====
let PAGE_EDITS = {vocab:{}, vocab5:{}, kanji:{}, kanji5:{}, grammar:{}, grammar5:{}};
try { PAGE_EDITS = Object.assign(PAGE_EDITS, JSON.parse(localStorage.getItem('n4pageedits') || '{}')); } catch(e){}
function savePageEdits(){ localStorage.setItem('n4pageedits', JSON.stringify(PAGE_EDITS)); storyIndex._c = null; }
for (const [k,v] of Object.entries(PAGE_EDITS.vocab)) D.vocab[k] = v;
for (const [k,v] of Object.entries(PAGE_EDITS.vocab5)) D.vocab5[k] = v;
for (const [k,v] of Object.entries(PAGE_EDITS.kanji)) D.kanji[k] = v;
for (const [k,v] of Object.entries(PAGE_EDITS.kanji5)) D.kanji5[k] = v;
for (const [k,v] of Object.entries(PAGE_EDITS.grammar)) {
  const i = D.grammar.findIndex(g => g.pattern === k);
  if (i >= 0) D.grammar[i] = v; else D.grammar.push(v);
}
for (const [k,v] of Object.entries(PAGE_EDITS.grammar5)) {
  const i = D.grammar5.findIndex(g => g.pattern === k);
  if (i >= 0) D.grammar5[i] = v; else D.grammar5.push(v);
}

// Rebuild VOCAB from updated D.vocab so edits persist in lookups
Object.keys(VOCAB).forEach(k => delete VOCAB[k]);
for (const [k,v] of Object.entries(D.vocab)) {
  if (k.length === 1 && /^[぀-ゟ]$/.test(k)) continue;
  VOCAB[k] = v;
}
for (const [k,v] of Object.entries(SUP)) if (!VOCAB[k]) VOCAB[k] = v;
for (const w of EDITS.removedWords) delete VOCAB[w];
for (const [w,v] of Object.entries(EDITS.addedWords)) VOCAB[w] = v;
SORTED_WORDS = Object.keys(VOCAB).sort((a,b)=>b.length-a.length);
function rebuildWords(){ SORTED_WORDS = Object.keys(VOCAB).sort((a,b)=>b.length-a.length); }

function setupAddForm(sectionId, opts){
  const sec = document.getElementById(sectionId);
  if (!sec) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `<button class="fc-select add-toggle" style="margin-bottom:10px">+ Add entry</button>
    <div class="add-form" style="display:none;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:14px">
      ${opts.fields.map(f => `<input data-f="${f.key}" placeholder="${f.label}" style="border:1px solid var(--line);border-radius:8px;padding:6px 10px;font-size:12px;margin:0 6px 6px 0">`).join('')}
      <button class="add-go" style="background:linear-gradient(135deg,#AEDD94,#9CD6A3);border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-weight:700">Add</button>
    </div>`;
  sec.insertBefore(wrap, sec.firstChild);
  const toggle = wrap.querySelector('.add-toggle');
  const form = wrap.querySelector('.add-form');
  toggle.addEventListener('click', () => { form.style.display = form.style.display === 'none' ? 'block' : 'none'; });
  wrap.querySelector('.add-go').addEventListener('click', () => {
    const vals = {};
    form.querySelectorAll('input').forEach(inp => vals[inp.dataset.f] = inp.value.trim());
    opts.add(vals);
  });
}

function existsAnywhere(key, keyOf){
  if (D.vocab[keyOf]) return 'N4';
  if (D.vocab5[keyOf]) return 'N5';
  return null;
}
function existsKanjiAnywhere(k){
  if (D.kanji[k]) return 'N4';
  if (D.kanji5[k]) return 'N5';
  return null;
}
function existsGrammarAnywhere(p){
  if (D.grammar.some(g => g.pattern === p)) return 'N4';
  if (D.grammar5.some(g => g.pattern === p)) return 'N5';
  return null;
}

setupAddForm('vocab', {
  fields: [{key:'word',label:'word'},{key:'reading',label:'reading'},{key:'meaning',label:'meaning'}],
  add(v){ if (!v.word) return;
    const ex = existsAnywhere(v.word, v.word);
    if (ex) return showPopup(`<h2>${v.word}</h2><p>Already exists in <b>${ex}</b> vocabulary.</p>`);
    D.vocab[v.word] = {reading: v.reading, meaning: v.meaning}; PAGE_EDITS.vocab[v.word] = D.vocab[v.word]; savePageEdits();
    // New entries must also live in the merged VOCAB index and the durable
    // EDITS store, otherwise lookupWord() returns nothing and the edit popup
    // opens with empty fields.
    VOCAB[v.word] = D.vocab[v.word]; EDITS.addedWords[v.word] = D.vocab[v.word]; saveEdits(); rebuildWords();
    renderVocab();
  }
});
setupAddForm('vocab5', {
  fields: [{key:'word',label:'word'},{key:'reading',label:'reading'},{key:'meaning',label:'meaning'},{key:'pos',label:'POS'}],
  add(v){ if (!v.word) return;
    const ex = existsAnywhere(v.word, v.word);
    if (ex) return showPopup(`<h2>${v.word}</h2><p>Already exists in <b>${ex}</b> vocabulary.</p>`);
    D.vocab5[v.word] = {reading: v.reading, meaning: v.meaning, pos: v.pos}; PAGE_EDITS.vocab5[v.word] = D.vocab5[v.word]; savePageEdits();
    VOCAB[v.word] = D.vocab5[v.word]; EDITS.addedWords[v.word] = D.vocab5[v.word]; saveEdits(); rebuildWords();
    renderVocab5();
  }
});
setupAddForm('kanji', {
  fields: [{key:'k',label:'kanji'},{key:'readings',label:'readings'},{key:'meaning',label:'meaning'}],
  add(v){ if (!v.k) return;
    const ex = existsKanjiAnywhere(v.k);
    if (ex) return showPopup(`<h2>${v.k}</h2><p>Already exists in <b>${ex}</b> kanji.</p>`);
    D.kanji[v.k] = {readings: v.readings, meaning: v.meaning, strokes: ''}; PAGE_EDITS.kanji[v.k] = D.kanji[v.k]; savePageEdits();
    EDITS.addedKanji[v.k] = D.kanji[v.k]; saveEdits();
    renderKanji();
  }
});
setupAddForm('kanji5', {
  fields: [{key:'k',label:'kanji'},{key:'readings',label:'readings'},{key:'meaning',label:'meaning'}],
  add(v){ if (!v.k) return;
    const ex = existsKanjiAnywhere(v.k);
    if (ex) return showPopup(`<h2>${v.k}</h2><p>Already exists in <b>${ex}</b> kanji.</p>`);
    D.kanji5[v.k] = {readings: v.readings, meaning: v.meaning, strokes: ''}; PAGE_EDITS.kanji5[v.k] = D.kanji5[v.k]; savePageEdits();
    EDITS.addedKanji[v.k] = D.kanji5[v.k]; saveEdits();
    renderKanji5();
  }
});
setupAddForm('grammar', {
  fields: [{key:'pattern',label:'pattern'},{key:'romaji',label:'romaji'},{key:'meaning',label:'meaning'}],
  add(v){ if (!v.pattern) return;
    const ex = existsGrammarAnywhere(v.pattern);
    if (ex) return showPopup(`<h2>${v.pattern}</h2><p>Already exists in <b>${ex}</b> grammar.</p>`);
    const g = {pattern: v.pattern, romaji: v.romaji, meaning: v.meaning, example_jp:'', example_en:'', example_rom:''};
    D.grammar.push(g); PAGE_EDITS.grammar[v.pattern] = g; savePageEdits(); renderGrammar();
  }
});
setupAddForm('grammar5', {
  fields: [{key:'pattern',label:'pattern'},{key:'romaji',label:'romaji'},{key:'meaning',label:'meaning'}],
  add(v){ if (!v.pattern) return;
    const ex = existsGrammarAnywhere(v.pattern);
    if (ex) return showPopup(`<h2>${v.pattern}</h2><p>Already exists in <b>${ex}</b> grammar.</p>`);
    const g = {pattern: v.pattern, romaji: v.romaji, meaning: v.meaning, example_jp:'', example_en:'', example_rom:''};
    D.grammar5.push(g); PAGE_EDITS.grammar5[v.pattern] = g; savePageEdits(); renderGrammar5();
  }
});

// ===== Flashcards / SRS =====
const SRS_KEY = 'n4srs';
let srs = {};
try { srs = JSON.parse(localStorage.getItem(SRS_KEY) || '{}'); } catch(e){ srs = {}; }
function saveSrs(){ localStorage.setItem(SRS_KEY, JSON.stringify(srs)); }

 // Known items (kanji + vocab)
 const KNOWN_KEY = 'n4known';
 let known = {};
 try { known = JSON.parse(localStorage.getItem(KNOWN_KEY) || '{}'); } catch(e){ known = {}; }
 function isKnown(k){ return !!known[k]; }
 function toggleKnown(k){ if (known[k]) delete known[k]; else known[k] = true; saveKnown(); }
 function saveKnown(){ localStorage.setItem(KNOWN_KEY, JSON.stringify(known)); storyIndex._c = null; }
 const KNOWNV_KEY = 'n4knownv';
 let knownV = {};
 try { knownV = JSON.parse(localStorage.getItem(KNOWNV_KEY) || '{}'); } catch(e){ knownV = {}; }
 function isKnownW(w){ return !!knownV[w]; }
 function toggleKnownW(w){ if (knownV[w]) delete knownV[w]; else knownV[w] = true; saveKnownW(); }
 function saveKnownW(){ localStorage.setItem(KNOWNV_KEY, JSON.stringify(knownV)); storyIndex._c = null; }
 const KNOWNG_KEY = 'n4knowng';
 let knownG = {};
 try { knownG = JSON.parse(localStorage.getItem(KNOWNG_KEY) || '{}'); } catch(e){ knownG = {}; }
 function isKnownG(p){ return !!knownG[p]; }
 function toggleKnownG(p){ if (knownG[p]) delete knownG[p]; else knownG[p] = true; saveKnownG(); }
 function saveKnownG(){ localStorage.setItem(KNOWNG_KEY, JSON.stringify(knownG)); storyIndex._c = null; }

 // ===== Story sentence edits =====
 const STORY_KEY = 'n4storyedits';
 let STORY_EDITS = {removed:{}, edited:{}, added:{}};
 try { STORY_EDITS = Object.assign({removed:{}, edited:{}, added:{}}, JSON.parse(localStorage.getItem(STORY_KEY) || '{}')); } catch(e){ STORY_EDITS = {removed:{}, edited:{}, added:{}}; }
 function saveStoryEdits(){ localStorage.setItem(STORY_KEY, JSON.stringify(STORY_EDITS)); storyIndex._c = null; }
 function sentKey(ci, si, ch){ return si < ch._origLen ? 'O'+ci+':'+si : 'A'+ci+':'+(si - ch._origLen); }
 function isSentRemoved(ci, si, ch){ return !!STORY_EDITS.removed[sentKey(ci, si, ch)]; }
 (function applyStoryEdits(){
   window.CHAPTERS.forEach((ch, ci) => { ch._origLen = ch.sentences ? ch.sentences.length : splitSentences(ch.jp).length; });
   Object.entries(STORY_EDITS.edited).forEach(([key, v]) => {
     const ci = +key.slice(1, key.indexOf(':'));
     const si = +key.slice(key.indexOf(':') + 1);
     const ch = window.CHAPTERS[ci]; if (!ch) return;
     if (!ch.sentences) ch.sentences = splitSentences(ch.jp).map(s => ({jp:s, en:''}));
     if (ch.sentences[si]){ ch.sentences[si].jp = v.jp; ch.sentences[si].en = v.en; }
   });
   Object.entries(STORY_EDITS.added).forEach(([ci, list]) => {
     const ch = window.CHAPTERS[+ci]; if (!ch) return;
     if (!ch.sentences) ch.sentences = splitSentences(ch.jp).map(s => ({jp:s, en:''}));
     list.forEach(s => ch.sentences.push({jp: s.jp, en: s.en}));
   });
 })();
 function materializeSentences(ci){ const ch = window.CHAPTERS[ci]; if (!ch.sentences){ ch.sentences = splitSentences(ch.jp).map(s => ({jp:s, en:''})); if (ch._origLen === undefined) ch._origLen = ch.sentences.length; } return ch.sentences; }
 function editSent(ci, si){
   const ch = window.CHAPTERS[ci]; const arr = chSentences(ci); const s = arr[si] || {jp:'', en:''};
   showPopup('<h2>Edit sentence</h2><p style="margin:6px 0"><label style="font-size:12px;color:var(--muted)">Japanese</label><br><input id="edSentJp" value="' + (s.jp||'').replace(/"/g,'&quot;') + '" style="width:100%;padding:6px 10px;border:1px solid var(--line);border-radius:8px;margin-top:2px"></p><p style="margin:6px 0"><label style="font-size:12px;color:var(--muted)">English</label><br><input id="edSentEn" value="' + (s.en||'').replace(/"/g,'&quot;') + '" style="width:100%;padding:6px 10px;border:1px solid var(--line);border-radius:8px;margin-top:2px"></p><button id="edSentSave" style="background:#AEDD94;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-weight:700;margin-top:8px">Save</button> <button id="edSentCancel" style="background:#FFC1CC;border:none;border-radius:8px;padding:6px 14px;cursor:pointer">Cancel</button>');
   document.getElementById('edSentCancel').addEventListener('click', closePopup);
   document.getElementById('edSentSave').addEventListener('click', () => {
     const jp = document.getElementById('edSentJp').value.trim(); const en = document.getElementById('edSentEn').value.trim();
     if (!jp) return;
     const a = materializeSentences(ci);
     const cur = a[si]; if (cur){ cur.jp = jp; cur.en = en; } else if (si >= a.length){ a.push({jp, en}); }
     if (si < ch._origLen) { STORY_EDITS.edited[sentKey(ci, si, ch)] = {jp, en}; }
     else { const n = si - ch._origLen; (STORY_EDITS.added[''+ci] = STORY_EDITS.added[''+ci] || []); STORY_EDITS.added[''+ci][n] = {jp, en}; }
     saveStoryEdits(); closePopup(); renderStory();
     const p = document.querySelector(`#storyText p.sent[data-ch="${ci}"][data-si="${si}"]`); if (p) p.click();
   });
 }
 function deleteSent(ci, si){
   const ch = window.CHAPTERS[ci];
   STORY_EDITS.removed[sentKey(ci, si, ch)] = true;
   saveStoryEdits(); renderStory(); closePopup();
 }
 function addSent(ci){
   const a = materializeSentences(ci);
   a.push({jp: '新しい文（にほんご）', en: ''});
   chSentencesForSave();
   STORY_EDITS.added[''+ci] = STORY_EDITS.added[''+ci] || [];
   STORY_EDITS.added[''+ci].push({jp: '新しい文（にほんご）', en: ''});
   saveStoryEdits(); renderStory();
   editSent(ci, a.length - 1);
 }
 function chSentencesForSave(){}

function buildDeck(kind){
  const cards = [];
  if (kind === 'vocab' || kind === 'all')
    for (const [w,v] of Object.entries(D.vocab)) if (!isKnownW(w)) cards.push({id:'v:'+w, type:'vocab', front:w, reading:v.reading, back:v.meaning});
  if (kind === 'vocab5' || kind === 'all')
    for (const [w,v] of Object.entries(D.vocab5)) if (!isKnownW(w)) cards.push({id:'v5:'+w, type:'vocab', front:w, reading:v.reading, back:v.meaning});
  if (kind === 'kanji' || kind === 'all')
    for (const [k,v] of Object.entries(D.kanji)) if (!isKnown(k)) cards.push({id:'k:'+k, type:'kanji', front:k, reading:v.readings, back:v.meaning});
  if (kind === 'kanji5' || kind === 'all')
    for (const [k,v] of Object.entries(D.kanji5)) if (!isKnown(k)) cards.push({id:'k5:'+k, type:'kanji', front:k, reading:v.readings, back:v.meaning});
  if (kind === 'grammar' || kind === 'all')
    for (const g of D.grammar) if (!isKnownG(g.pattern)) cards.push({id:'g:'+g.pattern, type:'grammar', front:g.pattern, reading:g.romaji, back:g.meaning});
  if (kind === 'grammar5' || kind === 'all')
    for (const g of D.grammar5) if (!isKnownG(g.pattern)) cards.push({id:'g5:'+g.pattern, type:'grammar', front:g.pattern, reading:g.romaji, back:g.meaning});
  return cards;
}

let fcDeck = [], fcCurrent = null, fcRevealed = false;

function fcStats(){
  const now = Date.now();
  let neu = 0, due = 0, review = 0, learned = 0;
  for (const c of fcDeck){
    const s = srs[c.id];
    if (!s) neu++;
    else if (s.due <= now) due++;
    else if (s.interval >= 21) learned++;
    else review++;
  }
  document.getElementById('fcStats').innerHTML =
    `New: <b>${neu}</b> &nbsp; Due: <b>${due}</b> &nbsp; Review: <b>${review}</b> &nbsp; Learned: <b>${learned}</b>`;
}

function fcRender(){
  const card = document.getElementById('fcCard');
  if (!fcCurrent){
    card.style.display = 'none';
    document.getElementById('fcFront').innerHTML = '';
    document.getElementById('fcBack').innerHTML = '';
    document.querySelector('.fc-hint').style.display = 'none';
    document.querySelector('.fc-grades').style.display = 'none';
    fcStats();
    return;
  }
  card.style.display = 'block';
  document.querySelector('.fc-hint').style.display = 'block';
  document.querySelector('.fc-grades').style.display = 'flex';
  card.classList.remove('flipped');
  fcRevealed = false;
  document.getElementById('fcFront').innerHTML =
    `<div class="fc-word${fcCurrent.type === 'kanji' ? ' fc-kanji' : ''}">${fcCurrent.front}</div>`;
  document.getElementById('fcBack').innerHTML =
    `<div class="fc-reading">${fcCurrent.reading}</div><div class="fc-meaning">${fcCurrent.back}</div>`;
  document.querySelectorAll('.fc-grade').forEach(b => b.disabled = true);
  fcStats();
}

function fcNext(){
  const now = Date.now();
  const due = fcDeck.filter(c => { const s = srs[c.id]; return s && s.due <= now; });
  const fresh = fcDeck.filter(c => !srs[c.id]);
  let pool = due.length ? due : fresh.slice(0, 20);
  if (!pool.length){
    fcCurrent = null;
    document.getElementById('fcCard').style.display = 'none';
    document.querySelector('.fc-hint').style.display = 'none';
    document.querySelector('.fc-grades').style.display = 'none';
    document.getElementById('fcStats').innerHTML = `<div class="fc-done"><b>All caught up!</b>No cards due right now. Come back later, or reset the deck to start over.</div>`;
    return;
  }
  fcCurrent = pool[Math.floor(Math.random() * pool.length)];
  fcRender();
}

function applyGrade(id, g){
  const now = Date.now();
  const s = srs[id] || {due:0, interval:0, ease:2.5, reps:0};
  s.reps++;
  if (g === 'again'){
    s.interval = 0; s.ease = Math.max(1.3, s.ease - 0.2); s.due = now + 10*60*1000;
  } else if (g === 'hard'){
    s.interval = Math.max(1, (s.interval || 0.5) * 1.2); s.ease = Math.max(1.3, s.ease - 0.15);
    s.due = now + s.interval * 86400000;
  } else if (g === 'good'){
    s.interval = s.interval < 1 ? 1 : s.interval * s.ease;
    s.due = now + s.interval * 86400000;
  } else {
    s.interval = (s.interval < 1 ? 1 : s.interval * s.ease) * 1.3; s.ease += 0.15;
    s.due = now + s.interval * 86400000;
  }
  srs[id] = s;
  return s;
}

function fcGrade(g){
  if (!fcCurrent || !fcRevealed) return;
  applyGrade(fcCurrent.id, g);
  saveSrs();
  fcNext();
  renderFcLearned();
  refreshFilterViews();
}

document.getElementById('fcCard').addEventListener('click', () => {
  if (!fcCurrent) return;
  document.getElementById('fcCard').classList.add('flipped');
  fcRevealed = true;
  document.querySelectorAll('.fc-grade').forEach(b => b.disabled = false);
});
document.querySelectorAll('.fc-grade').forEach(b => b.addEventListener('click', () => fcGrade(b.dataset.g)));
document.getElementById('fcDeck').addEventListener('change', e => {
  fcDeck = buildDeck(e.target.value);
  fcNext();
  renderFcLearned();
});
document.getElementById('fcReset').addEventListener('click', () => {
  const deck = document.getElementById('fcDeck').value;
  if (!confirm('Reset all progress for this deck?')) return;
  const prefix = {vocab:'v:', vocab5:'v5:', kanji:'k:', kanji5:'k5:', grammar:'g:', grammar5:'g5:', all:''}[deck];
  if (prefix === undefined){ toast('Unknown deck'); return; }
  for (const id of Object.keys(srs)) if (!prefix || id.startsWith(prefix)) delete srs[id];
  saveSrs(); fcNext(); renderFcLearned(); refreshFilterViews();
});
function renderFcLearned(){
  const root = document.getElementById('fcLearned');
  if (!root) return;
  const seen = [];
  const all = buildDeck(document.getElementById('fcDeck').value);
  for (const c of all){
    const s = srs[c.id];
    if (s && s.reps > 0) seen.push({c, s});
  }
  seen.sort((a,b) => b.s.interval - a.s.interval);
  if (!seen.length){ root.innerHTML = '<p class="bm-empty">No cards studied yet.</p>'; return; }
  root.innerHTML = seen.map(({c, s}) => `<div class="bm-item">
    <div style="flex:1"><div class="bm-text">${c.front} <span class="meaning" style="font-size:13px">— ${c.back}</span></div>
    <div class="bm-sub">${c.type} · interval ${s.interval ? Math.round(s.interval*10)/10 + 'd' : 'new'} · ease ${s.ease.toFixed(1)} · reps ${s.reps}</div></div>
    <button class="ttsbtn" data-speak="${c.front}" title="Listen">🔊</button></div>`).join('');
}

fcDeck = buildDeck('vocab');
fcNext();
renderFcLearned();

// ===== Editable translations =====
const TRANS_KEY = 'n4translations';
let trans = {};
try { trans = JSON.parse(localStorage.getItem(TRANS_KEY) || '{}'); } catch(e){ trans = {}; }
function saveTrans(){ localStorage.setItem(TRANS_KEY, JSON.stringify(trans)); }
function getTrans(key){ return trans[key] || ''; }

// ===== Bookmarks =====
const BM_KEY = 'n4bookmarks';
let bms = {sentences: [], words: [], kanji: [], grammar: []};
try { bms = Object.assign(bms, JSON.parse(localStorage.getItem(BM_KEY) || '{}')); } catch(e){}
function saveBms(){ localStorage.setItem(BM_KEY, JSON.stringify(bms)); }

function bmToggleSentence(ci, si){
  const id = 'ch'+ci+':s'+si;
  const idx = bms.sentences.findIndex(b => b.id === id);
  if (idx >= 0) bms.sentences.splice(idx, 1);
  else {
    const ch = window.CHAPTERS[ci];
    const s = ch.sentences[si];
    bms.sentences.push({id, text: s.jp, en: s.en, chapter: ch.title});
  }
  saveBms(); renderBms();
}
function bmToggleWord(w){
  const idx = bms.words.findIndex(b => b.w === w);
  if (idx >= 0) bms.words.splice(idx, 1);
  else { const v = lookupWord(w); bms.words.push({w, reading: v ? v.reading : '', meaning: v ? v.meaning : ''}); }
  saveBms(); renderBms(); refreshFilterViews();
}
function bmToggleKanji(k){
  const idx = bms.kanji.findIndex(b => b.k === k);
  if (idx >= 0) bms.kanji.splice(idx, 1);
  else { const v = D.kanji[k] || D.kanji5[k]; bms.kanji.push({k, readings: v ? v.readings : '', meaning: v ? v.meaning : ''}); }
  saveBms(); renderBms(); refreshFilterViews();
}
function bmIsSentence(ci, si){ return bms.sentences.some(b => b.id === 'ch'+ci+':s'+si); }
function bmIsWord(w){ return bms.words.some(b => b.w === w); }
function bmIsKanji(k){ return bms.kanji.some(b => b.k === k); }
function bmIsGrammar(p){ return (bms.grammar || []).some(b => b.p === p); }
function bmToggleGrammar(p){
  if (!bms.grammar) bms.grammar = [];
  const g = D.grammar.find(x => x.pattern === p) || D.grammar5.find(x => x.pattern === p);
  const idx = bms.grammar.findIndex(b => b.p === p);
  if (idx >= 0) bms.grammar.splice(idx, 1);
  else bms.grammar.push({p, romaji: g ? g.romaji : '', meaning: g ? g.meaning : ''});
  saveBms(); renderBms();
}

// ===== Study filters =====
function srsState(id){
  const s = srs[id];
  if (!s) return 'new';
  if (s.interval >= 21) return 'mastered';
  return s.due <= Date.now() ? 'due' : 'learning';
}
function storyIndex(){
  if (storyIndex._c) return storyIndex._c;
  const words = new Set(), kanji = new Set(), gram = new Set();
  window.CHAPTERS.forEach((c, ci) => {
    if (!chapterVisible(ci)) return; // "In story" follows the chapters you have selected
    const arr = chSentences(ci);
    for (let si=0; si<arr.length; si++){
      if (isSentRemoved(ci, si, c)) continue;
      const s = arr[si];
      const plain = stripReadings(s.jp);
      segment(plain).forEach(g => { if (g.word) words.add(g.t); });
      kanjisIn(plain).forEach(k => kanji.add(k));
      grammarInSentence(plain).forEach(g => gram.add(g.pattern));
    }
  });
  return storyIndex._c = {words, kanji, gram};
}
function filterPass(fl, id, opts){
  if (!fl || fl === 'all') return true;
  const st = srsState(id);
  switch(fl){
    case 'new': return st === 'new';
    case 'learning': return st === 'learning' || st === 'due';
    case 'mastered': return st === 'mastered';
    case 'due': return st === 'due';
    case 'bookmarked': return !!(opts && opts.bm);
    case 'edited': return !!(opts && opts.edited);
    case 'story': return !!(opts && opts.story);
    default: return true;
  }
}
function setFilter(name, val){
  FILTERS[name] = val;
  listFocus[name] = -1;
  const searchId = {vocab:'vocabSearch', vocab5:'vocab5Search', kanji:'kanjiSearch', kanji5:'kanji5Search', grammar:'grammarSearch', grammar5:'grammar5Search'}[name];
  const fns = {vocab:renderVocab, vocab5:renderVocab5, kanji:renderKanji, kanji5:renderKanji5, grammar:renderGrammar, grammar5:renderGrammar5};
  const input = searchId ? document.getElementById(searchId) : null;
  if (fns[name]) fns[name](input ? input.value : '');
  updateFilterCounts();
}
function refreshFilterViews(){
  for (const name of Object.keys(FILTERS)){
    if (FILTERS[name] === 'all') continue;
    const fns = {vocab:renderVocab, vocab5:renderVocab5, kanji:renderKanji, kanji5:renderKanji5, grammar:renderGrammar, grammar5:renderGrammar5};
    const searchId = {vocab:'vocabSearch', vocab5:'vocab5Search', kanji:'kanjiSearch', kanji5:'kanji5Search', grammar:'grammarSearch', grammar5:'grammar5Search'}[name];
    const input = searchId ? document.getElementById(searchId) : null;
    if (fns[name]) fns[name](input ? input.value : '');
  }
  updateFilterCounts();
}
function updateFilterCounts(){
  for (const name of Object.keys(FILTERS)){
    const el = document.getElementById(name + 'Count');
    if (!el) continue;
    const total = FILTER_TOTAL[name] || 0;
    const shown = FILTER_SHOWN[name] || 0;
    const radio = document.querySelector('input[name="' + name + 'Filter"]:checked');
    if (!radio || radio.value === 'all'){ el.textContent = total + ' entries'; el.classList.remove('active'); }
    else { el.textContent = shown + ' of ' + total; el.classList.add('active'); }
  }
}

function renderBms(){
  const root = document.getElementById('bmList');
  if (!bms.sentences.length && !bms.words.length && !bms.kanji.length && !(bms.grammar || []).length){
    root.innerHTML = '<p class="bm-empty">No bookmarks yet. Star sentences, words, or kanji while reading the story.</p>';
    return;
  }
  let html = '';
  if (bms.sentences.length){
    html += '<div class="bm-group">Sentences</div>';
    html += bms.sentences.map(b => `<div class="bm-item" data-bm="s" data-id="${b.id}">
      <div style="flex:1"><div class="bm-text">${b.text}</div><div class="bm-sub">${b.chapter}${b.en ? ' — ' + b.en : ''}</div></div>
      <button class="ttsbtn" data-speak="${b.text}" title="Listen">🔊</button>
      <button class="bm-del" data-bmdel="s" data-id="${b.id}">✕</button></div>`).join('');
  }
  const knownWms = bms.words.filter(b => !isKnownW(b.w));
  if (knownWms.length){
    html += '<div class="bm-group">Words</div>';
    html += knownWms.map(b => `<div class="bm-item" data-bm="w" data-w="${b.w}">
      <div style="flex:1"><div class="bm-text">${b.w}</div><div class="bm-sub">${b.reading} — ${b.meaning}</div></div>
      <button class="ttsbtn" data-speak="${b.w}" title="Listen">🔊</button>
      <button class="bm-del" data-bmdel="w" data-w="${b.w}">✕</button></div>`).join('');
  }
  const knownBms = bms.kanji.filter(b => !isKnown(b.k));
  if (knownBms.length){
    html += '<div class="bm-group">Kanji</div>';
    html += knownBms.map(b => `<div class="bm-item" data-bm="k" data-k="${b.k}">
      <div style="flex:1"><div class="bm-text" style="font-size:22px">${b.k}</div><div class="bm-sub">${b.readings} — ${b.meaning}</div></div>
      <button class="ttsbtn" data-speak="${b.k}" title="Listen">🔊</button>
      <button class="bm-del" data-bmdel="k" data-k="${b.k}">✕</button></div>`).join('');
  }
  if ((bms.grammar || []).filter(b => !isKnownG(b.p)).length){
    html += '<div class="bm-group">Grammar</div>';
    html += bms.grammar.filter(b => !isKnownG(b.p)).map(b => `<div class="bm-item" data-bm="g" data-p="${b.p}">
      <div style="flex:1"><div class="bm-text">${b.p}</div><div class="bm-sub">${b.romaji} — ${b.meaning}</div></div>
      <button class="ttsbtn" data-speak="${b.p}" title="Listen">🔊</button>
      <button class="bm-del" data-bmdel="g" data-p="${b.p}">✕</button></div>`).join('');
  }
  root.innerHTML = html;
  root.querySelectorAll('.bm-item').forEach(el => el.addEventListener('click', e => {
    if (e.target.closest('.bm-del')) return;
    if (el.dataset.bm === 's'){
      const [ci, si] = el.dataset.id.replace('ch','').split(':s').map(Number);
      document.querySelector('[data-tab="story"]').click();
      const p = document.querySelector(`#storyText p[data-ch="${ci}"][data-si="${si}"]`);
      if (p){ p.scrollIntoView({behavior:'smooth', block:'center'}); p.classList.add('sel'); }
    } else if (el.dataset.bm === 'w'){
      document.querySelector('[data-tab="story"]').click();
      showWord(el.dataset.w);
    } else if (el.dataset.bm === 'k'){
      document.querySelector('[data-tab="story"]').click();
      showKanji(el.dataset.k);
    } else if (el.dataset.bm === 'g'){
      openGrammarPopup(D.grammar.find(x => x.pattern === el.dataset.p) || D.grammar5.find(x => x.pattern === el.dataset.p));
    }
  }));
  root.querySelectorAll('.bm-del').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.bmdel === 's') bms.sentences = bms.sentences.filter(x => x.id !== b.dataset.id);
    if (b.dataset.bmdel === 'w') bms.words = bms.words.filter(x => x.w !== b.dataset.w);
    if (b.dataset.bmdel === 'k') bms.kanji = bms.kanji.filter(x => x.k !== b.dataset.k);
    if (b.dataset.bmdel === 'g') bms.grammar = (bms.grammar || []).filter(x => x.p !== b.dataset.p);
    saveBms(); renderBms(); refreshFilterViews();
  }));
}

function showKanji(k){
  const v = D.kanji[k] || D.kanji5[k];
  if (!v) return;
  document.getElementById('detail').innerHTML = `<h2>Kanji</h2>
    <p class="sent-jp" style="font-size:40px">${k}</p> <button class="ttsbtn" data-speak="${k}" title="Listen">🔊</button>
    <p class="sent-en">${v.readings}</p><p>${v.meaning}</p>
    <button id="skKnown" style="background:none;border:1px solid var(--line);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:12px;margin-top:8px">${isKnown(k)?'✓ Unmark known':'✓ Mark known'}</button>
    <div class="mapwrap"><iframe src="http://localhost:3000/${encodeURIComponent(k)}.html" title="The Kanji Map" style="height:420px"></iframe><div class="zone z-graph" data-src="http://localhost:3000/${encodeURIComponent(k)}.html" data-param="?graph=big"><span>Graph — enlarge</span></div><div class="zone z-kanji" data-src="http://localhost:3000/${encodeURIComponent(k)}.html" data-param="?panel=kanji"><span>Kanji — enlarge</span></div><div class="zone z-radical" data-src="http://localhost:3000/${encodeURIComponent(k)}.html" data-param="?panel=radical"><span>Radical — enlarge</span></div><div class="zone z-examples" data-src="http://localhost:3000/${encodeURIComponent(k)}.html" data-param="?panel=examples"><span>Examples — enlarge</span></div></div>`;
  const skK = document.getElementById('skKnown');
  if (skK) skK.addEventListener('click', () => { toggleKnown(k); showKanji(k); renderKnown(); renderKanji(); renderKanji5(); renderBms(); refreshFilterViews(); });
  storyIndex._c = null;
}

renderBms();

function renderKnown(f=''){
  const g = document.getElementById('knownGrid');
  const f2 = f.toLowerCase();
  const lvl = (document.querySelector('input[name="knownLevel"]:checked') || {}).value || 'all';
  const okLvl = (x) => lvl === 'all' || x === lvl;
  const kRows = Object.keys(known)
    .sort((a,b) => a.localeCompare(b, 'ja'))
    .map(k => [k, D.kanji[k] || D.kanji5[k], D.kanji[k] ? 'N4' : 'N5'])
    .filter(([k,v,lv]) => okLvl(lv) && (k.includes(f) || (v && v.readings.toLowerCase().includes(f2)) || (v && v.meaning.toLowerCase().includes(f2))));
  const wRows = Object.keys(knownV)
    .sort((a,b) => a.localeCompare(b, 'ja'))
    .map(w => [w, lookupWord(w), D.vocab[w] ? 'N4' : (D.vocab5[w] ? 'N5' : 'N4')])
    .filter(([w,v,lv]) => okLvl(lv) && (w.includes(f) || (v && v.reading.toLowerCase().includes(f2)) || (v && v.meaning.toLowerCase().includes(f2))));
  const gRows = Object.keys(knownG)
    .map(p => D.grammar.find(g => g.pattern === p) ? [p, D.grammar.find(g => g.pattern === p), 'N4'] : (D.grammar5.find(g => g.pattern === p) ? [p, D.grammar5.find(g => g.pattern === p), 'N5'] : [p, null, '']))
    .filter(([p,g,lv]) => okLvl(lv) && (p.includes(f) || (g && g.meaning.toLowerCase().includes(f2)) || (g && g.romaji.toLowerCase().includes(f2))));
  g.innerHTML =
    (kRows.length ? '<h3 style="grid-column:1/-1">Kanji</h3>' + kRows.map(([k,v,lv]) => `<div class="kcard" data-k="${k}"><button class="ttsbtn kcard-tts" data-speak="${k}" title="Listen">🔊</button><button class="knwbtn" data-t="k" data-k="${k}" title="Mark as known">✓</button><div class="k">${k}</div><div class="r">${v?v.readings:''}</div><div class="m">${v?v.meaning:''}</div><div style="margin-top:6px"><span class="pos">${lv}</span></div><button class="bm-del" data-unk="${k}" title="Remove from known" style="position:absolute;top:6px;right:8px">✕</button></div>`).join('') : '') +
    (wRows.length ? '<h3 style="grid-column:1/-1">Vocabulary</h3>' + wRows.map(([w,v,lv]) => `<div class="kcard" data-w="${w}"><button class="ttsbtn kcard-tts" data-speak="${w}" title="Listen">🔊</button><div class="k">${w}</div><div class="r">${v?v.reading:''}</div><div class="m">${v?v.meaning:''}</div><div style="margin-top:6px"><span class="pos">${lv}</span></div><button class="bm-del" data-unw="${w}" title="Remove from known" style="position:absolute;top:6px;right:8px">✕</button></div>`).join('') : '') +
    (gRows.length ? '<h3 style="grid-column:1/-1">Grammar</h3>' + gRows.map(([p,g,lv]) => `<div class="kcard" data-g="${p}"><button class="ttsbtn kcard-tts" data-speak="${p}" title="Listen">🔊</button><div class="k" style="font-size:20px">${p}</div><div class="r">${g?g.romaji:''}</div><div class="m">${g?g.meaning:''}</div><div style="margin-top:6px"><span class="pos">${lv}</span></div><button class="bm-del" data-ung="${p}" title="Remove from known" style="position:absolute;top:6px;right:8px">✕</button></div>`).join('') : '') ||
    '<p class="hint" style="grid-column:1/-1">No known items yet. Open a kanji or word, click “✓ Mark as known”.</p>';
}
document.getElementById('knownSearch') && document.getElementById('knownSearch').addEventListener('input', e => renderKnown(e.target.value));
document.getElementById('knownGrid') && document.getElementById('knownGrid').addEventListener('click', e => {
  const del = e.target.closest('[data-unk]');
  if (del){ delete known[del.dataset.unk]; saveKnown(); renderKnown(); renderKanji(); renderKanji5(); renderBms(); refreshFilterViews(); return; }
  const delW = e.target.closest('[data-unw]');
  if (delW){ delete knownV[delW.dataset.unw]; saveKnownW(); renderKnown(); renderVocab(); renderVocab5(); renderBms(); refreshFilterViews(); return; }
  const delG = e.target.closest('[data-ung]');
  if (delG){ delete knownG[delG.dataset.ung]; saveKnownG(); renderKnown(); renderGrammar(); renderGrammar5(); renderBms(); refreshFilterViews(); return; }
  const tts = e.target.closest('.ttsbtn');
  if (tts) return;
  const c = e.target.closest('.kcard'); if (!c) return;
  if (c.dataset.w) openWordPopup(c.dataset.w);
  else if (c.dataset.g) openGrammarPopup(D.grammar.find(x => x.pattern === c.dataset.g) || D.grammar5.find(x => x.pattern === c.dataset.g));
  else openKanjiPopup(c.dataset.k);
});
document.addEventListener('click', e => {
  const b = e.target.closest('.knwbtn');
  if (!b) return;
  e.stopPropagation(); e.preventDefault();
  const t = b.dataset.t, k = b.dataset.k;
  if (t === 'k'){ toggleKnown(k); renderKnown(); renderKanji(); renderKanji5(); buildDeckReset(); }
  else if (t === 'w'){ toggleKnownW(k); renderKnown(); renderVocab(); renderVocab5(); buildDeckReset(); }
  else { toggleKnownG(k); renderKnown(); renderGrammar(); renderGrammar5(); buildDeckReset(); }
  renderBms(); refreshFilterViews();
  const sel = document.querySelector('#storyText p.sent.sel'); if (sel) sel.click();
});
function buildDeckReset(){ fcDeck = buildDeck(document.getElementById('fcDeck').value || 'vocab'); fcStats(); }
document.querySelectorAll('input[name="knownLevel"]').forEach(r => r.addEventListener('change', () => renderKnown(document.getElementById('knownSearch').value)));

// ===== Popup for grammar/kanji/vocab details =====
function showPopup(html){
  document.getElementById('popupPanel').innerHTML = html + '<button class="kbd-close" id="popupClose">Close</button>';
  document.getElementById('popup').classList.remove('hidden');
  document.getElementById('popupClose').addEventListener('click', closePopup);
  const tw = document.getElementById('ttsWord');
  if (tw) tw.addEventListener('click', () => {
    const panel = tw.closest('.kbd-panel');
    const left = panel && panel.querySelector('.pupl-left');
    speak(left ? left.textContent : '');
  });
}
function closePopup(){
  const p = document.getElementById('popup');
  if (!p || p.classList.contains('hidden')) return;
  p.classList.add('hidden');
  document.getElementById('popupPanel').innerHTML = '';
}
document.getElementById('popup').addEventListener('click', e => { if (e.target.id === 'popup') closePopup(); });
document.addEventListener('click', e => {
  const z = e.target.closest('.zone');
   if (z){ const f = document.getElementById('mapBigFrame'); f.src = z.dataset.src + z.dataset.param; document.getElementById('mapBig') && document.getElementById('mapBig').classList.remove('hidden'); }
 });
 document.getElementById('mapBigClose') && document.getElementById('mapBigClose').addEventListener('click', () => { document.getElementById('mapBig').classList.add('hidden'); document.getElementById('mapBigFrame').src = ''; });
 document.getElementById('mapBig') && document.getElementById('mapBig').addEventListener('click', e => { if (e.target.id === 'mapBig'){ document.getElementById('mapBig').classList.add('hidden'); document.getElementById('mapBigFrame').src = ''; } });

// ===== Keyboard shortcuts =====
let focusedSent = null;
function focusSentence(ci, si){
  document.querySelectorAll('#storyText p.sent').forEach(p => p.classList.remove('focused'));
  const p = document.querySelector(`#storyText p[data-ch="${ci}"][data-si="${si}"]`);
  if (p){ p.classList.add('focused'); p.scrollIntoView({behavior:'smooth', block:'nearest'}); focusedSent = {ci, si}; }
}
function moveFocus(dir){
  // Navigate the visible sentences in document order, so hidden chapters are skipped
  const ps = [...document.querySelectorAll('#storyText p.sent')];
  if (!ps.length) return;
  if (!focusedSent){ focusSentence(+ps[0].dataset.ch, +ps[0].dataset.si); return; }
  let idx = ps.findIndex(p => +p.dataset.ch === focusedSent.ci && +p.dataset.si === focusedSent.si);
  if (idx < 0) idx = 0;
  const next = idx + dir;
  if (next < 0 || next >= ps.length) return;
  focusSentence(+ps[next].dataset.ch, +ps[next].dataset.si);
}
function selectFocused(){
  if (!focusedSent) return;
  const {ci, si} = focusedSent;
  const p = document.querySelector(`#storyText p[data-ch="${ci}"][data-si="${si}"]`);
  if (p) p.click();
}

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

  if (e.key === '?' || (e.shiftKey && e.key === '/')){
    document.getElementById('kbdHelp').classList.toggle('hidden');
    return;
  }
  if (e.key === 'Escape'){
    document.getElementById('kbdHelp').classList.add('hidden');
    closePopup();
    document.querySelectorAll('#storyText p.sent').forEach(p => p.classList.remove('focused'));
    focusedSent = null;
    return;
  }

  const activeTab = activeLeafTab();

  if (activeTab === 'story'){
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp'){ e.preventDefault(); moveFocus(-1); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown'){ e.preventDefault(); moveFocus(1); }
    else if (e.key === 'Enter'){ e.preventDefault(); selectFocused(); }
    else if (e.key === 'f' || e.key === 'F'){ document.getElementById('furigana').click(); }
    else if (e.key === 'r' || e.key === 'R'){ document.getElementById('romaji').click(); }
  } else if (activeTab === 'flashcards'){
    if (e.key === ' '){ e.preventDefault(); document.getElementById('fcCard').click(); }
    else if (e.key === '1') fcGrade('again');
    else if (e.key === '2') fcGrade('hard');
    else if (e.key === '3') fcGrade('good');
    else if (e.key === '4') fcGrade('easy');
  }

  if (e.ctrlKey && e.key >= '1' && e.key <= '8'){
    e.preventDefault();
    const tabs = ['story','vocab','kanji','grammar','vocab5','kanji5','grammar5','study','bookmarks','known'];
    const idx = +e.key - 1;
    if (tabs[idx]) document.querySelector(`[data-tab="${tabs[idx]}"]`).click();
  }
});
document.getElementById('kbdClose').addEventListener('click', () => document.getElementById('kbdHelp').classList.add('hidden'));
document.getElementById('kbdHelp').addEventListener('click', e => { if (e.target.id === 'kbdHelp') e.target.classList.add('hidden'); });
document.getElementById('kbdBtn').addEventListener('click', () => document.getElementById('kbdHelp').classList.remove('hidden'));

// ===== Reading progress =====
const PROG_KEY = 'n4progress';
let progress = {};
try { progress = JSON.parse(localStorage.getItem(PROG_KEY) || '{}'); } catch(e){ progress = {}; }
function saveProgress(){ localStorage.setItem(PROG_KEY, JSON.stringify(progress)); }
function markRead(ci, si){ progress['ch'+ci+':s'+si] = true; saveProgress(); renderProgress(); }
// ===== Reading position ("resume here") =====
const RESUME_KEY = 'n4resume';
function getResume(){ try { const r = JSON.parse(localStorage.getItem(RESUME_KEY) || 'null'); return (r && typeof r.ch === 'number' && typeof r.si === 'number') ? r : null; } catch(e){ return null; } }
function setResume(ci, si){ try { localStorage.setItem(RESUME_KEY, JSON.stringify({ch: ci, si: si, at: new Date().toISOString()})); } catch(e){} renderResumeMarks(); renderResumeBanner(); }
function clearResume(){ try { localStorage.removeItem(RESUME_KEY); } catch(e){} renderResumeMarks(); renderResumeBanner(); }
function isResumeSent(ci, si){ const r = getResume(); return !!(r && r.ch === ci && r.si === si); }
function renderResumeMarks(){ document.querySelectorAll('#storyText p.sent').forEach(p => { const b = p.querySelector('.resume-mark'); if (!b) return; const on = isResumeSent(+p.dataset.ch, +p.dataset.si); b.classList.toggle('on', on); b.textContent = on ? '📍' : '⚑'; b.title = on ? 'Reading position — click to clear' : 'Mark as reading position (resume here next time)'; }); }
function resumeSentenceText(r){ const ch = window.CHAPTERS[r.ch]; if (!ch) return ''; const s = chSentences(r.ch)[r.si]; return s ? stripReadings(s.jp) : ''; }
function renderResumeBanner(){
  const el = document.getElementById('resumeBanner');
  if (!el) return;
  const r = getResume();
  if (!r){ el.classList.add('hidden'); el.innerHTML = ''; return; }
  const txt = resumeSentenceText(r);
  if (!txt){ el.classList.add('hidden'); el.innerHTML = ''; return; }
  el.classList.remove('hidden');
  el.innerHTML = '<span class="resume-txt">📍 You stopped here: <b></b></span>'
    + '<button id="resumeGo" class="resume-btn">Resume</button>'
    + '<button id="resumeClear" class="resume-btn ghost">Clear</button>';
  el.querySelector('b').textContent = txt.slice(0, 60) + (txt.length > 60 ? '…' : '');
  const go = document.getElementById('resumeGo');
  if (go) go.addEventListener('click', () => goToResume());
  const cl = document.getElementById('resumeClear');
  if (cl) cl.addEventListener('click', () => { clearResume(); });
}
function goToResume(){
  const r = getResume();
  if (!r) return;
  const p = document.querySelector(`#storyText p.sent[data-ch="${r.ch}"][data-si="${r.si}"]`);
  if (!p){ toast('That sentence is in a chapter you have hidden, or it was removed.'); return; }
  p.scrollIntoView({behavior:'smooth', block:'center'});
  p.classList.add('sel');
  const ch = window.CHAPTERS[r.ch];
  const s = chSentences(r.ch)[r.si];
  if (s) showSentence(r.ch, s, p, r.si);
}
function renderProgress(){
  let total = 0, read = 0;
  window.CHAPTERS.forEach((c, ci) => {
    if (!chapterVisible(ci)) return;
    chSentences(ci).forEach((s, si) => {
      total++;
      if (progress['ch'+ci+':s'+si]) read++;
    });
  });
  const pct = total ? Math.round(read/total*100) : 0;
  const bar = document.getElementById('progressBar');
  if (bar) bar.style.width = pct + '%';
  const lbl = document.getElementById('progressLabel');
  if (lbl) lbl.textContent = `${read}/${total} sentences studied (${pct}%)`;
  document.querySelectorAll('#storyText h3.chapter').forEach(h => {
    const ci = +h.dataset.ci;
    const ch = window.CHAPTERS[ci];
    const sents = chSentences(ci);
    let r = 0;
    sents.forEach((s, si) => { if (progress['ch'+ci+':s'+si]) r++; });
    let tag = h.querySelector('.ch-prog');
    if (!tag){ tag = document.createElement('span'); tag.className = 'ch-prog'; h.appendChild(tag); }
    tag.textContent = `${r}/${sents.length}`;
  });
}

// ===== Theme toggle =====
const themeBtn = document.getElementById('themeToggle');
try { if (localStorage.getItem('n4theme') === 'dark'){ document.body.classList.add('dark'); themeBtn.textContent = '☀️'; } } catch(e){}
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  themeBtn.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('n4theme', dark ? 'dark' : 'light');
});

// ===== Chapter jump menu =====
(function(){
  const sel = document.getElementById('chapterJump');
  function fillJump(){
    const on = window.CHAPTERS.map((c,i) => i).filter(chapterVisible);
    const prev = sel.value;
    sel.innerHTML = on.map(i => `<option value="${i}">${window.CHAPTERS[i].title}</option>`).join('');
    if (on.includes(+prev)) sel.value = prev;
    sel.disabled = !on.length;
  }
  fillJump();
  sel.addEventListener('change', () => {
    const h = document.querySelector(`#storyText h3[data-ci="${sel.value}"]`);
    if (h) h.scrollIntoView({behavior:'smooth', block:'start'});
  });
  window.chapFillJump = fillJump;
})();

// ===== Chapter multi-select =====
(function(){
  const boxes = document.getElementById('chapBoxes');
  const btn = document.getElementById('chapBtn');
  const countEl = document.getElementById('chapCount');

  boxes.innerHTML = window.CHAPTERS.map((c,i) =>
    `<label class="chap-row" data-ci="${i}">
       <input type="checkbox" value="${i}" ${chapterVisible(i) ? 'checked' : ''}>
       <span class="t">${c.title}</span>
       <span class="n">${chSentences(i).length}</span>
     </label>`).join('');

  function sync(){
    const n = CHAP_ON.size, total = window.CHAPTERS.length;
    btn.innerHTML = n === total ? 'Chapters · all <span class="caret">▾</span>'
      : n === 0 ? 'Chapters · none <span class="caret">▾</span>'
      : n === 1 ? `Chapters · 1 <span class="caret">▾</span>`
      : `Chapters · ${n} <span class="caret">▾</span>`;
    countEl.textContent = `${n} / ${total}`;
    boxes.querySelectorAll('input').forEach(inp => { inp.checked = CHAP_ON.has(+inp.value); });
    saveChapters();
    renderStory();
    renderProgress();
    window.chapFillJump();
    storyIndex._c = null; // story vocab/kanji index must follow the visible set
    refreshFilterViews();
  }
  window.chapSync = sync;

  boxes.addEventListener('change', e => {
    const i = +e.target.value;
    if (e.target.checked) CHAP_ON.add(i); else CHAP_ON.delete(i);
    sync();
  });
  document.querySelectorAll('[data-chap-all]').forEach(b => b.addEventListener('click', () => {
    CHAP_ON = new Set(window.CHAPTERS.map((c,i) => i)); sync();
  }));
  document.querySelectorAll('[data-chap-none]').forEach(b => b.addEventListener('click', () => {
    CHAP_ON = new Set(); sync();
  }));
  document.querySelectorAll('[data-chap-inv]').forEach(b => b.addEventListener('click', () => {
    const next = new Set();
    window.CHAPTERS.forEach((c,i) => { if (!CHAP_ON.has(i)) next.add(i); });
    CHAP_ON = next; sync();
  }));
  // keep the dropdown open while ticking boxes
  document.getElementById('chapList').addEventListener('click', e => e.stopPropagation());

  sync();
})();

// Mouse click sets keyboard focus origin
function bindListClicks(tab, containerId, itemSelector){
  const container = document.getElementById(containerId);
  if (!container) return;
  container.addEventListener('click', e => {
    const item = e.target.closest(itemSelector);
    if (!item) return;
    const items = getVisibleItems(tab);
    const idx = Array.from(items).indexOf(item);
    if (idx >= 0){
      listFocus[tab] = idx;
      items.forEach((el, i) => el.classList.toggle('focused', i === idx));
    }
  });
}
bindListClicks('vocab', 'vocabTable', 'tbody tr');
bindListClicks('vocab5', 'vocab5Table', 'tbody tr');
bindListClicks('kanji', 'kanjiGrid', '.kcard');
bindListClicks('kanji5', 'kanji5Grid', '.kcard');
bindListClicks('grammar', 'grammarList', '.gcard');
bindListClicks('grammar5', 'grammar5List', '.gcard');
bindListClicks('bookmarks', 'bmList', '.bm-item');

// ===== List navigation for other tabs =====
let listFocus = {vocab: -1, vocab5: -1, kanji: -1, kanji5: -1, grammar: -1, grammar5: -1, bookmarks: -1};

function getVisibleItems(tab){
  if (tab === 'vocab') return document.querySelectorAll('#vocabTable tbody tr');
  if (tab === 'vocab5') return document.querySelectorAll('#vocab5Table tbody tr');
  if (tab === 'kanji') return document.querySelectorAll('#kanjiGrid .kcard');
  if (tab === 'kanji5') return document.querySelectorAll('#kanji5Grid .kcard');
  if (tab === 'grammar') return document.querySelectorAll('#grammarList .gcard');
  if (tab === 'grammar5') return document.querySelectorAll('#grammar5List .gcard');
  if (tab === 'bookmarks') return document.querySelectorAll('#bmList .bm-item');
  return [];
}

function moveListFocus(tab, dir){
  const items = getVisibleItems(tab);
  if (!items.length) return;

  if (tab === 'kanji' || tab === 'kanji5'){
    const grid = document.getElementById(tab === 'kanji' ? 'kanjiGrid' : 'kanji5Grid');
    const cards = Array.from(grid.querySelectorAll('.kcard'));
    if (!cards.length) return;
    const cols = Math.max(1, Math.floor(grid.offsetWidth / (cards[0].offsetWidth + 12)));
    let idx = listFocus[tab];
    if (idx < 0) idx = 0;
    if (dir === 'left') idx = Math.max(0, idx - 1);
    else if (dir === 'right') idx = Math.min(cards.length - 1, idx + 1);
    else if (dir === 'up') idx = Math.max(0, idx - cols);
    else if (dir === 'down') idx = Math.min(cards.length - 1, idx + cols);
    else idx = Math.max(0, Math.min(cards.length - 1, idx + dir));
    listFocus[tab] = idx;
    cards.forEach((el, i) => el.classList.toggle('focused', i === idx));
    cards[idx].scrollIntoView({behavior:'smooth', block:'nearest'});
    return;
  }

  listFocus[tab] = Math.max(0, Math.min(items.length - 1, listFocus[tab] + dir));
  items.forEach((el, i) => el.classList.toggle('focused', i === listFocus[tab]));
  items[listFocus[tab]].scrollIntoView({behavior:'smooth', block:'nearest'});
}

function selectListFocus(tab){
  const items = getVisibleItems(tab);
  if (!items.length || listFocus[tab] < 0) return;
  const el = items[listFocus[tab]];
  if (tab === 'vocab' || tab === 'vocab5'){
    const cell = el.querySelector('td');
    if (!cell) return;
    if (el.querySelector('.ttsbtn') && el.querySelector('.ttsbtn').dataset.speak === cell.textContent) openWordPopup(cell.textContent);
    else showWord(cell.textContent);
  } else if (tab === 'kanji' || tab === 'kanji5'){
    openKanjiPopup(el.dataset.k);
  } else if (tab === 'grammar' || tab === 'grammar5'){
    const b = el.querySelector('b');
    if (!b) return;
    openGrammarPopup(D.grammar.find(x => x.pattern === b.textContent) || D.grammar5.find(x => x.pattern === b.textContent));
  } else if (tab === 'bookmarks'){
    el.click();
  }
}

function deleteListFocus(tab){
  if (tab !== 'bookmarks') return;
  const items = getVisibleItems(tab);
  if (!items.length || listFocus[tab] < 0) return;
  const el = items[listFocus[tab]];
  const del = el.querySelector('.bm-del');
  if (del) del.click();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !document.getElementById('popup').classList.contains('hidden')){ closePopup(); return; }
  if (session){
    if (e.key === ' '){ e.preventDefault(); ssReveal(); return; }
    if (!session.revealed) return;
    const map = {'1':'again','2':'hard','3':'good','4':'easy'};
    if (map[e.key]){ e.preventDefault(); ssGrade(map[e.key]); return; }
  }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT'){
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  const activeTab = activeLeafTab();

  if (['vocab','vocab5','kanji','kanji5','grammar','grammar5','bookmarks'].includes(activeTab)){
    const isGrid = activeTab === 'kanji' || activeTab === 'kanji5';
    if (e.key === 'j' || (e.key === 'ArrowDown' && !isGrid)){ e.preventDefault(); moveListFocus(activeTab, 1); }
    else if (e.key === 'k' || (e.key === 'ArrowUp' && !isGrid)){ e.preventDefault(); moveListFocus(activeTab, -1); }
    else if (e.key === 'ArrowDown' && isGrid){ e.preventDefault(); moveListFocus(activeTab, 'down'); }
    else if (e.key === 'ArrowUp' && isGrid){ e.preventDefault(); moveListFocus(activeTab, 'up'); }
    else if (e.key === 'ArrowLeft'){ e.preventDefault(); moveListFocus(activeTab, 'left'); }
    else if (e.key === 'ArrowRight'){ e.preventDefault(); moveListFocus(activeTab, 'right'); }
    else if (e.key === 'Enter'){ e.preventDefault(); selectListFocus(activeTab); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && activeTab === 'bookmarks'){ e.preventDefault(); deleteListFocus(activeTab); }
    else if (e.key === '/'){ e.preventDefault(); document.getElementById(activeTab + 'Search').focus(); }
    return;
  }
});

// Global TTS button delegation
document.addEventListener('click', e => {
  const b = e.target.closest('.ttsbtn');
  if (b){ e.stopPropagation(); speak(b.dataset.speak || b.textContent); }
});

// ===== Study session =====
let session = null;

function ssPool(){
  const deck = document.getElementById('ssDeck').value;
  const mode = document.getElementById('ssMode').value;
  let cards = buildDeck(deck);
  const now = Date.now();
  if (mode === 'due') cards = cards.filter(c => { const s = srs[c.id]; return s && s.due <= now; });
  else if (mode === 'new') cards = cards.filter(c => !srs[c.id]);
  else if (mode === 'weak'){
    // "weakest" = seen most often (reps) and lowest ease — i.e. what you keep failing
    cards = cards.filter(c => { const s = srs[c.id]; return s && s.interval < 21; })
                 .sort((a,b) => (srs[a.id].ease||2.5) - (srs[b.id].ease||2.5)
                                 || (srs[b.id].reps||0) - (srs[a.id].reps||0));
  }
  const limit = +document.getElementById('ssCount').value;
  return cards.slice(0, limit);
}
function ssDescribe(){
  const total = buildDeck(document.getElementById('ssDeck').value).length;
  const n = ssPool().length;
  const mode = document.getElementById('ssMode').selectedOptions[0].textContent;
  document.getElementById('ssPreview').innerHTML =
    `Ready: <b>${n}</b> card${n === 1 ? '' : 's'} — mode <b>${mode}</b>, deck size <b>${total}</b>` +
    (n === 0 ? ' — nothing matches right now.' : '');
}
function ssStart(forceMode){
  if (forceMode) document.getElementById('ssMode').value = forceMode;
  const queue = ssPool();
  if (!queue.length){ ssDescribe(); return; }
  session = {queue, idx: 0, revealed: false, seen: new Set(), tally: {again:0, hard:0, good:0, easy:0}, start: Date.now()};
  document.getElementById('ssPreview').innerHTML = '';
  document.getElementById('ssDone').style.display = 'none';
  document.getElementById('ssActive').style.display = 'block';
  ssRender();
}
function ssRender(){
  if (!session) return;
  if (session.idx >= session.queue.length){ ssFinish(); return; }
  const c = session.queue[session.idx];
  session.revealed = false;
  document.getElementById('ssCard').classList.remove('flipped');
  document.querySelectorAll('#ssActive .fc-grade').forEach(b => b.disabled = true);
  document.getElementById('ssHint').textContent = 'Click the card (or press Space) to reveal — then grade it';
  document.getElementById('ssFront').innerHTML =
    `<div style="font-family:'Noto Serif JP',serif;font-size:44px;margin-bottom:8px">${c.front}</div>
     <button class="ttsbtn" data-speak="${c.front}" title="Listen" style="font-size:18px">🔊</button>`;
  const extra = c.type === 'grammar'
    ? (D.grammar.find(g => g.pattern === c.front) || D.grammar5.find(g => g.pattern === c.front) || {}).example_jp || ''
    : '';
  document.getElementById('ssBack').innerHTML =
    `<div style="font-size:20px;color:var(--gold2);margin-bottom:6px">${c.reading || ''}</div>
     <div style="font-size:15px">${c.back || ''}</div>
     ${extra ? `<div class="gexample" style="margin-top:10px"><span class="gex-jp">${extra}</span></div>` : ''}`;
  const done = session.idx, total = session.queue.length;
  document.getElementById('ssBar').style.width = (done / total * 100) + '%';
  document.getElementById('ssMeta').innerHTML =
    `<span>Card ${done + 1} of ${total}</span><span>${Math.round(done / total * 100)}% · ${session.tally.again + session.tally.hard + session.tally.good + session.tally.easy} graded</span>`;
}
function ssReveal(){
  if (!session || session.revealed) return;
  session.revealed = true;
  document.getElementById('ssCard').classList.add('flipped');
  document.querySelectorAll('#ssActive .fc-grade').forEach(b => b.disabled = false);
  document.getElementById('ssHint').textContent = 'How well did you know it? (1–4)';
}
function ssGrade(g){
  if (!session || !session.revealed) return;
  const c = session.queue[session.idx];
  applyGrade(c.id, g);
  saveSrs();
  session.tally[g]++;
  session.seen.add(c.id);
  session.idx++;
  ssRender();
}
function ssFinish(){
  const t = session.tally;
  const total = t.again + t.hard + t.good + t.easy;
  const secs = Math.round((Date.now() - session.start) / 1000);
  const acc = total ? Math.round((total - t.again) / total * 100) : 0;
  document.getElementById('ssActive').style.display = 'none';
  document.getElementById('ssDone').style.display = 'block';
  document.getElementById('ssSummary').innerHTML =
    `<div class="ss-stat"><b>${total}</b><span>cards</span></div>
     <div class="ss-stat again"><b>${t.again}</b><span>again</span></div>
     <div class="ss-stat hard"><b>${t.hard}</b><span>hard</span></div>
     <div class="ss-stat good"><b>${t.good}</b><span>good</span></div>
     <div class="ss-stat easy"><b>${t.easy}</b><span>easy</span></div>
     <div class="ss-stat"><b>${acc}%</b><span>recalled</span></div>
     <div class="ss-stat"><b>${secs}s</b><span>time</span></div>`;
  session = null;
  renderFcLearned(); refreshFilterViews(); ssDescribe();
}
function ssQuit(){
  if (!session) return;
  if (session.idx > 0 && session.idx < session.queue.length && !confirm('End the session now? Your grades so far are kept.')) return;
  session = null;
  document.getElementById('ssActive').style.display = 'none';
  document.getElementById('ssDone').style.display = 'none';
  ssDescribe();
}
document.getElementById('ssStart').addEventListener('click', () => ssStart());
document.getElementById('ssQuit').addEventListener('click', ssQuit);
document.getElementById('ssAgain').addEventListener('click', () => ssStart());
document.getElementById('ssWeakest').addEventListener('click', () => { ssStart('weak'); });
['ssDeck','ssMode','ssCount'].forEach(id => document.getElementById(id).addEventListener('change', ssDescribe));
document.getElementById('ssCard').addEventListener('click', ssReveal);
document.querySelectorAll('#ssActive .fc-grade').forEach(b => b.addEventListener('click', () => ssGrade(b.dataset.sg)));

// ===== Backup / import =====
const BACKUP_KEYS = ['n4srs','n4bookmarks','n4edits','n4pageedits','n4translations','n4segs','n4progress','n4theme','n4known','n4knownv','n4knowng','n4chapters','n4storyedits','n4resume'];
const BACKUP_LABELS = {
  'n4srs':'cards scheduled', 'n4bookmarks':'bookmarks', 'n4edits':'removed/added words',
  'n4pageedits':'edited entries', 'n4translations':'custom translations',
  'n4segs':'word-splittings', 'n4progress':'sentences read', 'n4theme':'theme',
  'n4known':'known kanji', 'n4knownv':'known vocab', 'n4knowng':'known grammar',
  'n4chapters':'chapter selection', 'n4storyedits':'story edits', 'n4resume':'reading position'
};
function bkCount(key){
  try {
    const v = JSON.parse(localStorage.getItem(key) || 'null');
    if (v == null) return 0;
    if (Array.isArray(v)) return v.length;
    if (typeof v === 'object') return Object.keys(v).length;
    return 1;
  } catch(e){ return 0; }
}
function bkRenderSummary(){
  document.getElementById('bkSummary').innerHTML = BACKUP_KEYS.map(k => {
    const n = bkCount(k);
    return `<span class="bk-chip ${n ? '' : 'zero'}">${BACKUP_LABELS[k] || k}: <b>${n}</b></span>`;
  }).join('');
}
function bkExport(){
  const data = {_app: 'jlpt-n4-study-ground', _version: 1, _exported: new Date().toISOString(), data: {}};
  for (const k of BACKUP_KEYS){
    const raw = localStorage.getItem(k);
    if (raw == null) continue;
    try { data.data[k] = JSON.parse(raw); } catch(e){ data.data[k] = raw; }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url; a.download = `jlpt-progress-${stamp}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  document.getElementById('bkMsg').innerHTML = `✅ Exported ${Object.keys(data.data).length} data sets. Keep this file somewhere safe.`;
}
function bkApply(imported, mode){
  const report = [];
  const touchedKeys = new Set();
  for (const k of Object.keys(imported)){
    if (!BACKUP_KEYS.includes(k)) continue;
    const incoming = imported[k];
    if (mode === 'replace'){
      localStorage.setItem(k, JSON.stringify(incoming));
      report.push(k); touchedKeys.add(k);
    } else {
      const cur = JSON.parse(localStorage.getItem(k) || '{}');
      if (Array.isArray(incoming)){
        const seenKeys = new Set(cur.map(x => typeof x === 'object' ? JSON.stringify(x) : x));
        let added = 0;
        for (const it of incoming){
          const key = typeof it === 'object' ? JSON.stringify(it) : it;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key); cur.push(it); added++;
        }
        localStorage.setItem(k, JSON.stringify(cur));
        if (added){ report.push(`${k} (+${added})`); touchedKeys.add(k); }
      } else if (incoming && typeof incoming === 'object'){
        let added = 0;
        for (const [ik, iv] of Object.entries(incoming)){
          const c = cur[ik];
          if (JSON.stringify(c) === JSON.stringify(iv)) continue;
          if (Array.isArray(c) && Array.isArray(iv)){
            const seenKeys = new Set(c.map(x => typeof x === 'object' ? JSON.stringify(x) : x));
            let n = 0;
            for (const it of iv){
              const key = typeof it === 'object' ? JSON.stringify(it) : it;
              if (seenKeys.has(key)) continue;
              seenKeys.add(key);
              c.push(it); n++;
            }
            if (n) added += n;
            continue;
          }
          if (c === undefined || iv === null || JSON.stringify(iv).length >= JSON.stringify(c).length){ cur[ik] = iv; added++; }
        }
        localStorage.setItem(k, JSON.stringify(cur));
        if (added){ report.push(`${k} (+${added})`); touchedKeys.add(k); }
      } else if (typeof incoming === 'string'){
        localStorage.setItem(k, k === 'n4theme' ? incoming : JSON.stringify(incoming));
        report.push(k); touchedKeys.add(k);
      }
    }
  }
  return {report, touched: touchedKeys.size};
}
function bkReload(){
  renderProgress(); renderStory(); renderVocab(); renderKanji(); renderGrammar();
  renderVocab5(); renderKanji5(); renderGrammar5();
  renderBms(); renderFcLearned(); bkRenderSummary(); updateFilterCounts(); renderKnown();
}
document.getElementById('bkExport').addEventListener('click', bkExport);
document.getElementById('bkImportBtn').addEventListener('click', () => document.getElementById('bkFile').click());
document.getElementById('bkFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try { parsed = JSON.parse(reader.result); }
    catch(err){ document.getElementById('bkMsg').innerHTML = '❌ That file is not valid JSON.'; return; }
    const payload = parsed && parsed.data ? parsed.data : parsed;
    if (!payload || typeof payload !== 'object'){ document.getElementById('bkMsg').innerHTML = '❌ Unrecognised backup format.'; return; }
    const known = Object.keys(payload).filter(k => BACKUP_KEYS.includes(k));
    if (!known.length){ document.getElementById('bkMsg').innerHTML = '❌ No recognisable study data in that file.'; return; }
    const mode = document.getElementById('bkMode').value;
    const {report} = bkApply(payload, mode);
    bkReload();
    document.getElementById('bkMsg').innerHTML =
      `✅ Imported (${mode}) from ${file.name}: ${report.length ? report.join(', ') : 'no changes'} — reloading data.`;
  };
  reader.readAsText(file);
  e.target.value = '';
});
document.getElementById('bkReset').addEventListener('click', () => {
  if (!confirm('Delete ALL study progress — cards, bookmarks, edits, translations and reading progress?\n\nThis cannot be undone. Export first if unsure.')) return;
  if (!confirm('Really delete everything? Consider exporting a backup first.')) return;
  for (const k of BACKUP_KEYS) if (k !== 'n4theme') localStorage.removeItem(k);
  bkReload();
  document.getElementById('bkMsg').innerHTML = '🗑 All study progress deleted (theme kept).';
});

// The 💾 header button now just opens Settings, which hosts the full
// backup/restore UI (bkExport / bkImport / bkReset).
document.getElementById('dataBtn') && document.getElementById('dataBtn').addEventListener('click', () => {
  const t = document.querySelector('[data-tab="settings"]');
  if (t) t.click();
});

// ===== Cloud sync (GitHub Gist) =====
const SYNC_KEYS = ['n4srs','n4bookmarks','n4edits','n4pageedits','n4translations','n4segs','n4progress','n4theme','n4known','n4knownv','n4knowng','n4chapters','n4storyedits','n4resume'];
const SYNC_CFG_KEY = 'n4sync';
function getSyncCfg(){ try { return JSON.parse(localStorage.getItem(SYNC_CFG_KEY) || '{}'); } catch(e){ return {}; } }
function setSyncCfg(c){ localStorage.setItem(SYNC_CFG_KEY, JSON.stringify(c)); }
function syncConfigured(){ const c = getSyncCfg(); return c && c.token && c.gistId ? c : null; }
function collectProgress(){ const o = {_updatedAt: new Date().toISOString()}; for (const k of SYNC_KEYS){ const v = localStorage.getItem(k); if (v !== null) try { o[k] = JSON.parse(v); } catch(e){} } return o; }
function applyProgress(d){ if (!d) return false; for (const k of SYNC_KEYS){ if (d[k] !== undefined) try { localStorage.setItem(k, JSON.stringify(d[k])); } catch(e){} } try { localStorage.setItem('n4syncedAt', d._updatedAt || new Date().toISOString()); } catch(e){} return true; }
let pushTimer = null;
function schedulePush(){ clearTimeout(pushTimer); if (!syncConfigured()) return; pushTimer = setTimeout(pushToRemote, 1500); }
(function patchStorage(){
  const _set = window.localStorage.setItem.bind(window.localStorage);
  window.localStorage.setItem = function(k, v){ _set(k, v); if (k.indexOf('n4') === 0 && k !== SYNC_CFG_KEY && k !== 'n4syncedAt') schedulePush(); };
})();
let lastSyncState = '';
function setSyncStatus(msg){ lastSyncState = msg; updateSyncBtn(); refreshSettings(); }
function syncError(msg){ lastSyncState = '⚠ ' + msg; try { toast('⚠ ' + msg); } catch(e){} updateSyncBtn(); refreshSettings(); }
function showSyncCode(msg){ const code = makeSyncCode(); let copied = false; try { if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(code); copied = true; } } catch(e){} prompt(msg + '\n\n' + (copied ? '(Sync code copied to clipboard — press Ctrl/Cmd+C here if not.)' : '(Press Ctrl/Cmd+C here to copy the sync code.)'), code); return code; }
async function remoteFetch(){ const cfg = getSyncCfg(); if (!cfg.token || !cfg.gistId) return { error:'not configured' }; try { const r = await fetch('https://api.github.com/gists/' + cfg.gistId, {headers:{ 'Authorization':'token ' + cfg.token }}); if (!r.ok) return { error:'HTTP ' + r.status + (r.status === 401 ? ' (bad token or missing gist scope — use a classic token)' : r.status === 404 ? ' (gist not found)' : '') }; const j = await r.json(); const f = j.files && j.files['n4-progress.json']; if (!f || !f.content) return { error:'gist has no saved progress yet' }; return { data: JSON.parse(f.content) }; } catch(e){ return { error: e.message }; } }
async function pushToRemote(){ const cfg = getSyncCfg(); if (!cfg.token) return false; const dump = collectProgress(); const payload = { description:'N4 Study progress', public:false, files:{ 'n4-progress.json':{ content: JSON.stringify(dump, null, 2) } } }; try { let r; if (cfg.gistId){ r = await fetch('https://api.github.com/gists/' + cfg.gistId, {method:'PATCH', headers:{'Authorization':'token ' + cfg.token, 'Content-Type':'application/json'}, body:JSON.stringify(payload)}); } else { r = await fetch('https://api.github.com/gists', {method:'POST', headers:{'Authorization':'token ' + cfg.token, 'Content-Type':'application/json'}, body:JSON.stringify(payload)}); if (r.ok){ const j = await r.json(); cfg.gistId = j.id; setSyncCfg(cfg); } } if (!r.ok){ syncError('push failed: HTTP ' + r.status + (r.status === 401 ? ' — token is invalid or lacks the gist scope (use a classic token)' : r.status === 404 ? ' — gist not found' : r.status === 422 ? ' — data too large for a gist' : '')); return false; } try { localStorage.setItem('n4syncedAt', dump._updatedAt); } catch(e){} setSyncStatus('Synced ' + new Date().toLocaleTimeString()); return true; } catch(e){ syncError('push error: ' + e.message); return false; } }
async function pullFromRemote(force){ const cfg = getSyncCfg(); if (!cfg.token || !cfg.gistId) return false; const res = await remoteFetch(); if (res.error){ syncError('pull failed: ' + res.error); return false; } const d = res.data; if (!d || !d._updatedAt){ syncError('pull failed: gist has no saved progress yet'); return false; } let cur = ''; try { cur = localStorage.getItem('n4syncedAt') || ''; } catch(e){} if (force || d._updatedAt > cur){ applyProgress(d); location.reload(); return true; } setSyncStatus('Already up to date'); return false; }
function makeSyncCode(){ const c = getSyncCfg(); return btoa(c.token + '|' + c.gistId); }
function parseSyncCode(raw){
  const s = String(raw == null ? '' : raw).trim();
  if (!s) return null;
  const clean = s.replace(/^['"]|['"]$/g, '').trim();
  if (clean.includes('|') && !/^[A-Za-z0-9+/=]+$/.test(clean)) {
    const i = clean.indexOf('|');
    const t = clean.slice(0, i).trim();
    const g = clean.slice(i + 1).trim();
    return (t && g) ? { token: t, gistId: g } : null;
  }
  try {
    const d = atob(clean);
    const i = d.indexOf('|');
    if (i < 1) return null;
    const t = d.slice(0, i).trim();
    const g = d.slice(i + 1).trim();
    return (t && g) ? { token: t, gistId: g } : null;
  } catch(e){ return { error: e.name || 'decode error' }; }
}
async function ensureSync(){ try { if (sessionStorage.getItem('n4synced') !== '1' && syncConfigured()){ sessionStorage.setItem('n4synced', '1'); await pullFromRemote(); } } catch(e){} }
function updateSyncBtn(){ const el = document.getElementById('syncBtn'); if (!el) return; const isErr = lastSyncState.indexOf('⚠') === 0; el.style.opacity = syncConfigured() ? '1' : '0.45'; el.style.background = isErr ? '#c0392b' : ''; el.style.color = isErr ? '#fff' : ''; el.textContent = isErr ? '☁ !' : '☁'; el.title = isErr ? 'Cloud sync problem: ' + lastSyncState + '\nClick for details.' : syncConfigured() ? 'Cloud sync ON' + (lastSyncState ? ' — ' + lastSyncState : '') + '. Click to open Settings.' : 'Set up cloud sync (saves progress to a private GitHub Gist for use on any device).'; }
document.getElementById('syncBtn') && document.getElementById('syncBtn').addEventListener('click', () => {
  const t = document.querySelector('[data-tab="settings"]');
  if (t) t.click();
});
ensureSync(); setTimeout(updateSyncBtn, 0);

// ===== Settings page controls =====
function setSyncLine(txt, isErr){ const el = document.getElementById('setSyncStatus'); if (el) el.textContent = txt; const g = document.getElementById('setSyncGist'); const c = getSyncCfg(); if (g) g.textContent = c && c.gistId ? c.gistId : 'not connected'; }
function setSyncErr(msg){ setSyncLine(msg, true); }
function refreshSettings(){
  const c = getSyncCfg();
  setSyncLine(syncConfigured() ? (lastSyncState || 'Connected') : 'Not connected', !syncConfigured());
  const g = document.getElementById('setSyncGist'); if (g) g.textContent = (c && c.gistId) ? c.gistId : 'not connected';
  const t = document.getElementById('setThemeState'); if (t) t.textContent = document.body.classList.contains('dark') ? 'Dark' : 'Light';
  bkRenderSummary();
}
document.getElementById('setThemeBtn') && document.getElementById('setThemeBtn').addEventListener('click', () => { themeBtn.click(); setTimeout(refreshSettings, 0); });
document.getElementById('setSyncNow') && document.getElementById('setSyncNow').addEventListener('click', async () => {
  if (!syncConfigured()) { setSyncErr('Not connected. Use "Connect / change account" first.'); return; }
  setSyncLine('Syncing…'); await pullFromRemote(true); refreshSettings();
});
document.getElementById('setSyncPush') && document.getElementById('setSyncPush').addEventListener('click', async () => {
  if (!syncConfigured()) { setSyncErr('Not connected. Use "Connect / change account" first.'); return; }
  setSyncLine('Pushing…'); const ok = await pushToRemote(); refreshSettings();
  if (ok) alert('Progress pushed to your gist.');
});
document.getElementById('setSyncCode') && document.getElementById('setSyncCode').addEventListener('click', () => {
  if (!syncConfigured()) { setSyncErr('Not connected. Use "Connect / change account" first.'); return; }
  showSyncCode('Sync code — paste this on your other device:');
});
document.getElementById('setSyncSetup') && document.getElementById('setSyncSetup').addEventListener('click', async () => {
  const raw = prompt('Paste your sync code here.\n\nEither format works:\n  base64 code (copied from another device)\n  or plain:  YOUR_TOKEN|YOUR_GIST_ID\n\nLeave blank to enter a fresh token and create a new gist.');
  if (!raw || !raw.trim()) {
    const token = prompt('Paste a GitHub personal access token (CLASSIC, with the "gist" scope):');
    if (!token) return;
    setSyncCfg({ token: token.trim() });
    const ok = await pushToRemote();
    refreshSettings();
    if (!ok || !getSyncCfg().gistId) { setSyncErr(lastSyncState || 'Setup failed — token may be fine-grained or missing the gist scope.'); alert('Setup failed.\n\n' + (lastSyncState || '') + '\n\nUse a CLASSIC token with the gist checkbox checked.'); return; }
    showSyncCode('Cloud sync is ready. Paste this code on your other devices:');
    return;
  }
  const p = parseSyncCode(raw);
  if (!p || !p.token) { setSyncErr('Could not parse that sync code' + (p && p.error ? ' (' + p.error + ')' : '') + '. Paste it as plain TOKEN|GISTID.'); alert('Could not parse that sync code' + (p && p.error ? ' (' + p.error + ')' : '') + '.\n\nPaste it as plain text: YOUR_TOKEN|YOUR_GIST_ID'); return; }
  setSyncCfg({ token: p.token, gistId: p.gistId });
  const ok = await pullFromRemote(true);
  refreshSettings();
  if (!ok) setSyncErr('Connected, but the download failed: ' + lastSyncState);
});
document.getElementById('setSyncDisconnect') && document.getElementById('setSyncDisconnect').addEventListener('click', () => {
  if (!confirm('Disconnect cloud sync on this device?\n\nYour progress stays in this browser. You will need a sync code to reconnect.')) return;
  try { localStorage.removeItem(SYNC_CFG_KEY); } catch(e){}
  updateSyncBtn(); refreshSettings(); setSyncLine('Not connected');
});
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setTimeout(refreshSettings, 0)));

// ===== Init (must be last — all sections defined) =====
renderProgress();
renderStory(); renderVocab(); renderKanji(); renderGrammar();
renderVocab5(); renderKanji5(); renderGrammar5();
updateFilterCounts();
ssDescribe(); bkRenderSummary(); refreshSettings();
