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
  '窓':{reading:'まど',meaning:'window'},
  '雨':{reading:'あめ',meaning:'rain'},
  '勉強':{reading:'べんきょう',meaning:'study'},
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
  '見る':{reading:'みる',meaning:'to see'},
};

const VOCAB = {};
for (const [k,v] of Object.entries(D.vocab)) {
  if (k.length === 1 && /^[぀-ゟ]$/.test(k)) continue;
  VOCAB[k] = v;
}
for (const [k,v] of Object.entries(SUP)) if (!VOCAB[k]) VOCAB[k] = v;

let EDITS = JSON.parse(localStorage.getItem('n4edits') || '{"removedWords":[],"removedKanji":[],"addedWords":{},"addedKanji":{}}');
function saveEdits(){ localStorage.setItem('n4edits', JSON.stringify(EDITS)); }
for (const w of EDITS.removedWords) delete VOCAB[w];
for (const [w,v] of Object.entries(EDITS.addedWords)) VOCAB[w] = v;
for (const k of EDITS.removedKanji) delete D.kanji[k];
for (const [k,v] of Object.entries(EDITS.addedKanji)) D.kanji[k] = v;

let SORTED_WORDS = Object.keys(VOCAB).sort((a,b)=>b.length-a.length);
function rebuildWords(){ SORTED_WORDS = Object.keys(VOCAB).sort((a,b)=>b.length-a.length); }

function lookupWord(w){
  if (VOCAB[w]) return VOCAB[w];
  if (D.kanji[w]) return {reading: D.kanji[w].readings, meaning: D.kanji[w].meaning};
  return null;
}
function segment(sentence){
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
      lastIdx = idx;
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
  let esc = text.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  esc = esc.replace(/([一-龯々〇ヶ]{1,6})（([^）]+)）/g, '<ruby>$1<rt>$2</rt></ruby>');
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

function buildSegmentedHtml(raw){
  const plain = stripReadings(raw);
  const segs = segment(plain);
  let pos = 0, html = '';
  for (const s of segs){
    let need = s.t.length, j = pos, rawChunk = '';
    while (j < raw.length && need > 0){
      const ch = raw[j];
      if (ch === '（'){ const end = raw.indexOf('）', j); rawChunk += raw.slice(j, end + 1); j = end + 1; continue; }
      rawChunk += ch; need--; j++;
    }
    pos = j;
    const chunkHtml = rawChunk.replace(/([一-龯々〇ヶ]{1,6})（([^）]+)）/g, '<ruby>$1<rt>$2</rt></ruby>');
    if (s.word) html += `<span class="w" data-w="${s.t}">${chunkHtml}</span>`;
    else html += chunkHtml;
  }
  return html;
}

function renderStory(){
  const root = document.getElementById('storyText');
  root.innerHTML = '';
  window.CHAPTERS.forEach((ch, ci) => {
    const h = document.createElement('h3');
    h.className = 'chapter'; h.textContent = ch.title; h.dataset.ci = ci;
    root.appendChild(h);
    const sents = ch.sentences && ch.sentences.length ? ch.sentences : splitSentences(ch.jp).map(s => ({jp:s, en:''}));
    sents.forEach((s, si) => {
      const p = document.createElement('p');
      p.className = 'sent';
      p.dataset.ch = ci; p.dataset.si = si;
      p.innerHTML = buildSegmentedHtml(s.jp);
      const star = document.createElement('button');
      star.className = 'star' + (bmIsSentence(ci, si) ? ' on' : '');
      star.textContent = bmIsSentence(ci, si) ? '★' : '☆';
      star.title = 'Bookmark sentence';
      star.addEventListener('click', e => { e.stopPropagation(); bmToggleSentence(ci, si); star.classList.toggle('on'); star.textContent = star.classList.contains('on') ? '★' : '☆'; });
      p.appendChild(star);
      p.addEventListener('click', () => showSentence(ci, s, p));
      root.appendChild(p);
    });
  });
  root.querySelectorAll('.w').forEach(sp => sp.addEventListener('click', e => {
    e.stopPropagation();
    openWordPopup(sp.dataset.w);
  }));
}

function openWordPopup(w){
  const v = lookupWord(w);
  const ks2 = kanjisIn(w);
  showPopup(`<h2>${w}</h2>
    <p class="sent-en">${v?v.reading:''}${v&&v.pos?' <span class="pos">'+v.pos+'</span>':''}</p>
    <p>${v?v.meaning:'—'}</p>
    ${ks2.length ? `<h3>Kanji</h3>` + ks2.map(k => { const v2 = D.kanji[k]; return `<p style="font-size:15px"><b style="font-family:'Noto Serif JP',serif;font-size:20px">${k}</b> — ${v2.readings} — ${v2.meaning}</p>`; }).join('') : ''}`);
}

function showSentence(ci, sent, el){
  document.querySelectorAll('#storyText p').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');
  const si = window.CHAPTERS[ci].sentences.indexOf(sent);
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
    <p class="sent-jp">${rawToHtml(raw)}</p>
    ${romajiOn ? `<p class="romaji-line">${window.wanakana ? wanakana.toRomaji(plain) : ''}</p>` : ''}
    <p class="sent-en" id="sentEn">${transText} <button class="editbtn" id="editTrans" title="Edit translation">✎</button></p>`;
  if (gs.length) html += `<h3>Grammar used</h3>` + gs.map(g=>`<span class="chip gold" data-gp="${g.pattern}" style="cursor:pointer">${g.pattern}</span>`).join('');
  if (ch.focus) html += `<h3>Grammar focus (chapter)</h3><p class="meaning" style="font-size:12px">${ch.focus}</p>`;
  html += `<h3>Words (${words.length}) <span style="font-weight:400;color:var(--muted);font-size:11px">— click a word</span></h3><table><thead><tr><th>Word</th><th>Reading</th><th>Meaning</th><th>POS</th><th></th><th></th></tr></thead><tbody>` +
    words.map(w=>{const v=lookupWord(w);return `<tr><td><a class="wlink" data-w="${w}">${w}</a></td><td>${v?v.reading:''}</td><td class="meaning">${v?v.meaning:''}</td><td><span class="pos">${v&&v.pos?v.pos:''}</span></td><td><button class="star ${bmIsWord(w)?'on':''}" data-bmw="${w}" title="Bookmark word">${bmIsWord(w)?'★':'☆'}</button></td><td><button class="del" data-delw="${w}" title="Remove">✕</button></td></tr>`}).join('') + `</tbody></table>
    <div class="addrow"><input id="addW" placeholder="word"><input id="addWR" placeholder="reading"><input id="addWM" placeholder="meaning"><button id="addWb">Add</button></div>`;
  if (ks.length) html += `<h3>Kanji (${ks.length})</h3><table><thead><tr><th>Kanji</th><th>Readings</th><th>Meaning</th><th></th><th></th></tr></thead><tbody>` +
    ks.map(k=>{const v=D.kanji[k];return `<tr><td style="font-family:'Noto Serif JP',serif;font-size:18px;cursor:pointer" class="klink" data-k="${k}">${k}</td><td class="meaning">${v.readings}</td><td class="meaning">${v.meaning}</td><td><button class="star ${bmIsKanji(k)?'on':''}" data-bmk="${k}" title="Bookmark kanji">${bmIsKanji(k)?'★':'☆'}</button></td><td><button class="del" data-delk="${k}" title="Remove">✕</button></td></tr>`}).join('') + `</tbody></table>`;
  html += `<div class="addrow"><input id="addK" placeholder="kanji"><input id="addKR" placeholder="readings"><input id="addKM" placeholder="meaning"><button id="addKb">Add</button></div>`;
  document.getElementById('detail').innerHTML = html;
  document.querySelectorAll('#detail .wlink').forEach(a => a.addEventListener('click', () => openWordPopup(a.dataset.w)));
  document.querySelectorAll('#detail [data-gp]').forEach(c => c.addEventListener('click', () => {
    const g = D.grammar.find(x => x.pattern === c.dataset.gp);
    if (!g) return;
    showPopup(`<h2>${g.pattern}</h2>
      <p class="sent-en">${g.romaji}</p>
      <p>${g.meaning}</p>
      ${g.example_jp ? `<h3>Example</h3><div class="gexample"><span class="gex-jp">${g.example_jp}</span><span class="gex-en">${g.example_en||''}</span></div>` : ''}`);
  }));
  document.querySelectorAll('#detail [data-delw]').forEach(b => b.addEventListener('click', () => {
    const w = b.dataset.delw;
    EDITS.removedWords.push(w); delete EDITS.addedWords[w]; delete VOCAB[w]; saveEdits(); rebuildWords(); showSentence(ci, sent, el);
  }));
  document.querySelectorAll('#detail [data-delk]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.delk;
    EDITS.removedKanji.push(k); delete EDITS.addedKanji[k]; delete D.kanji[k]; saveEdits(); showSentence(ci, sent, el);
  }));
  document.getElementById('addWb').addEventListener('click', () => {
    const w = document.getElementById('addW').value.trim();
    const r = document.getElementById('addWR').value.trim();
    const m = document.getElementById('addWM').value.trim();
    if (!w) return;
    VOCAB[w] = {reading: r, meaning: m}; EDITS.addedWords[w] = VOCAB[w];
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
  document.querySelectorAll('#detail .klink').forEach(td => td.addEventListener('click', () => {
    const v = D.kanji[td.dataset.k];
    showPopup(`<h2 style="font-family:'Noto Serif JP',serif;font-size:36px">${td.dataset.k}</h2>
      <p class="sent-en">${v.readings}</p><p>${v.meaning}</p>
      ${v.strokes ? `<p class="meaning" style="margin-top:8px">Strokes: ${v.strokes}</p>` : ''}`);
  }));

  const editBtn = document.getElementById('editTrans');
  if (editBtn) editBtn.addEventListener('click', () => {
    const enEl = document.getElementById('sentEn');
    const current = transText;
    enEl.innerHTML = `<input id="transInput" value="${current.replace(/"/g,'&quot;')}" style="width:100%;padding:6px 10px;border:1px solid var(--line);border-radius:8px;font-size:14px;background:#fff;color:var(--text)">
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
    EDITS.removedKanji.push(k); delete EDITS.addedKanji[k]; delete D.kanji[k]; saveEdits(); showWord(w);
  }));
  document.querySelectorAll('#detail [data-bmk]').forEach(b => b.addEventListener('click', () => {
    bmToggleKanji(b.dataset.bmk);
    showWord(w);
  }));
}

// Tabs
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  document.getElementById(t.dataset.tab).classList.add('active');
}));

// Furigana toggle
document.getElementById('furigana').addEventListener('change', e => {
  document.getElementById('storyText').classList.toggle('no-ruby', !e.target.checked);
});

// Romaji toggle
let romajiOn = false;
document.getElementById('romaji').addEventListener('change', e => {
  romajiOn = e.target.checked;
  document.querySelectorAll('#storyText p.sent').forEach(p => {
    let r = p.querySelector('.romaji-line');
    if (romajiOn){
      if (!r){
        r = document.createElement('div');
        r.className = 'romaji-line';
        const text = p.textContent.replace(/[☆★]/g,'').trim();
        r.textContent = window.wanakana ? wanakana.toRomaji(text) : '';
        p.appendChild(r);
      }
    } else if (r) r.remove();
  });
  if (romajiOn && fcCurrent) fcRender();
});

// Vocab tab
const vt = document.querySelector('#vocabTable tbody');
function renderVocab(f=''){
  const f2 = f.toLowerCase();
  vt.innerHTML = Object.entries(D.vocab)
    .filter(([w,v]) => w.includes(f) || v.reading.includes(f) || v.meaning.toLowerCase().includes(f2))
    .map(([w,v]) => `<tr><td>${w}</td><td>${v.reading}</td><td class="meaning">${v.meaning}</td></tr>`).join('');
}
document.getElementById('vocabSearch').addEventListener('input', e => renderVocab(e.target.value));

// Kanji tab
const kg = document.getElementById('kanjiGrid');
function renderKanji(f=''){
  const f2 = f.toLowerCase();
  kg.innerHTML = Object.entries(D.kanji)
    .filter(([k,v]) => k.includes(f) || v.readings.toLowerCase().includes(f2) || v.meaning.toLowerCase().includes(f2))
    .map(([k,v]) => `<div class="kcard" data-k="${k}"><div class="k">${k}</div><div class="r">${v.readings}</div><div class="m">${v.meaning}</div></div>`).join('');
}
document.getElementById('kanjiSearch').addEventListener('input', e => renderKanji(e.target.value));
kg.addEventListener('click', e => {
  const c = e.target.closest('.kcard'); if (!c) return;
  const v = D.kanji[c.dataset.k];
  toast(`${c.dataset.k} — ${v.readings} — ${v.meaning}`);
});

// Grammar tab
const gl = document.getElementById('grammarList');
function renderGrammar(f=''){
  const f2=f.toLowerCase();
  gl.innerHTML = D.grammar
    .filter(g => g.pattern.includes(f) || g.meaning.toLowerCase().includes(f2) || g.romaji.toLowerCase().includes(f2))
    .map(g => `<div class="gcard"><b>${g.pattern}</b><span class="rom">${g.romaji}</span><p>${g.meaning}</p>
      ${g.example_jp ? `<div class="gexample"><span class="gex-jp">${g.example_jp}</span><span class="gex-en">${g.example_en||''}</span></div>` : ''}
    </div>`).join('');
}
document.getElementById('grammarSearch').addEventListener('input', e => renderGrammar(e.target.value));

let toastT;
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2600); }

// N5 tabs
const vt5 = document.querySelector('#vocab5Table tbody');
function renderVocab5(f=''){
  const f2=f.toLowerCase();
  vt5.innerHTML = Object.entries(D.vocab5)
    .filter(([w,v]) => w.includes(f) || v.reading.includes(f) || v.meaning.toLowerCase().includes(f2))
    .map(([w,v]) => `<tr><td>${w}</td><td>${v.reading}</td><td class="meaning">${v.meaning}</td><td><span class="pos">${v.pos||''}</span></td></tr>`).join('');
}
document.getElementById('vocab5Search').addEventListener('input', e => renderVocab5(e.target.value));

const kg5 = document.getElementById('kanji5Grid');
function renderKanji5(f=''){
  const f2=f.toLowerCase();
  kg5.innerHTML = Object.entries(D.kanji5)
    .filter(([k,v]) => k.includes(f) || v.readings.toLowerCase().includes(f2) || v.meaning.toLowerCase().includes(f2))
    .map(([k,v]) => `<div class="kcard" data-k="${k}"><div class="k">${k}</div><div class="r">${v.readings}</div><div class="m">${v.meaning}</div></div>`).join('');
}
document.getElementById('kanji5Search').addEventListener('input', e => renderKanji5(e.target.value));
kg5.addEventListener('click', e => {
  const c = e.target.closest('.kcard'); if (!c) return;
  const v = D.kanji5[c.dataset.k]; toast(`${c.dataset.k} — ${v.readings} — ${v.meaning}`);
});

const gl5 = document.getElementById('grammar5List');
function renderGrammar5(f=''){
  const f2=f.toLowerCase();
  gl5.innerHTML = D.grammar5
    .filter(g => g.pattern.includes(f) || g.meaning.toLowerCase().includes(f2) || g.romaji.toLowerCase().includes(f2))
    .map(g => `<div class="gcard"><b>${g.pattern}</b><span class="rom">${g.romaji}</span><p>${g.meaning}</p>
      ${g.example_jp ? `<div class="gexample"><span class="gex-jp">${g.example_jp}</span><span class="gex-en">${g.example_en||''}</span></div>` : ''}
    </div>`).join('');
}
document.getElementById('grammar5Search').addEventListener('input', e => renderGrammar5(e.target.value));
renderVocab5(); renderKanji5(); renderGrammar5();

// ===== Flashcards / SRS =====
const SRS_KEY = 'n4srs';
let srs = {};
try { srs = JSON.parse(localStorage.getItem(SRS_KEY) || '{}'); } catch(e){ srs = {}; }
function saveSrs(){ localStorage.setItem(SRS_KEY, JSON.stringify(srs)); }

function buildDeck(kind){
  const cards = [];
  if (kind === 'vocab' || kind === 'all')
    for (const [w,v] of Object.entries(D.vocab)) cards.push({id:'v:'+w, type:'vocab', front:w, reading:v.reading, back:v.meaning});
  if (kind === 'vocab5' || kind === 'all')
    for (const [w,v] of Object.entries(D.vocab5)) cards.push({id:'v5:'+w, type:'vocab', front:w, reading:v.reading, back:v.meaning});
  if (kind === 'kanji' || kind === 'all')
    for (const [k,v] of Object.entries(D.kanji)) cards.push({id:'k:'+k, type:'kanji', front:k, reading:v.readings, back:v.meaning});
  if (kind === 'kanji5' || kind === 'all')
    for (const [k,v] of Object.entries(D.kanji5)) cards.push({id:'k5:'+k, type:'kanji', front:k, reading:v.readings, back:v.meaning});
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
    `<div class="fc-word">${fcCurrent.front}</div><div class="fc-type">${fcCurrent.type}</div>`;
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

function fcGrade(g){
  if (!fcCurrent || !fcRevealed) return;
  const now = Date.now();
  const s = srs[fcCurrent.id] || {due:0, interval:0, ease:2.5, reps:0};
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
  srs[fcCurrent.id] = s;
  saveSrs();
  fcNext();
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
});
document.getElementById('fcReset').addEventListener('click', () => {
  if (!confirm('Reset all progress for this deck?')) return;
  const prefix = {vocab:'v:', vocab5:'v5:', kanji:'k:', kanji5:'k5:', all:''}[document.getElementById('fcDeck').value];
  for (const id of Object.keys(srs)) if (!prefix || id.startsWith(prefix)) delete srs[id];
  saveSrs(); fcNext();
});
fcDeck = buildDeck('vocab');
fcNext();

// ===== Editable translations =====
const TRANS_KEY = 'n4translations';
let trans = {};
try { trans = JSON.parse(localStorage.getItem(TRANS_KEY) || '{}'); } catch(e){ trans = {}; }
function saveTrans(){ localStorage.setItem(TRANS_KEY, JSON.stringify(trans)); }
function getTrans(key){ return trans[key] || ''; }

// ===== Bookmarks =====
const BM_KEY = 'n4bookmarks';
let bms = {sentences: [], words: [], kanji: []};
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
  saveBms(); renderBms();
}
function bmToggleKanji(k){
  const idx = bms.kanji.findIndex(b => b.k === k);
  if (idx >= 0) bms.kanji.splice(idx, 1);
  else { const v = D.kanji[k]; bms.kanji.push({k, readings: v ? v.readings : '', meaning: v ? v.meaning : ''}); }
  saveBms(); renderBms();
}
function bmIsSentence(ci, si){ return bms.sentences.some(b => b.id === 'ch'+ci+':s'+si); }
function bmIsWord(w){ return bms.words.some(b => b.w === w); }
function bmIsKanji(k){ return bms.kanji.some(b => b.k === k); }

function renderBms(){
  const root = document.getElementById('bmList');
  if (!bms.sentences.length && !bms.words.length && !bms.kanji.length){
    root.innerHTML = '<p class="bm-empty">No bookmarks yet. Star sentences, words, or kanji while reading the story.</p>';
    return;
  }
  let html = '';
  if (bms.sentences.length){
    html += '<div class="bm-group">Sentences</div>';
    html += bms.sentences.map(b => `<div class="bm-item" data-bm="s" data-id="${b.id}">
      <div style="flex:1"><div class="bm-text">${b.text}</div><div class="bm-sub">${b.chapter}${b.en ? ' — ' + b.en : ''}</div></div>
      <button class="bm-del" data-bmdel="s" data-id="${b.id}">✕</button></div>`).join('');
  }
  if (bms.words.length){
    html += '<div class="bm-group">Words</div>';
    html += bms.words.map(b => `<div class="bm-item" data-bm="w" data-w="${b.w}">
      <div style="flex:1"><div class="bm-text">${b.w}</div><div class="bm-sub">${b.reading} — ${b.meaning}</div></div>
      <button class="bm-del" data-bmdel="w" data-w="${b.w}">✕</button></div>`).join('');
  }
  if (bms.kanji.length){
    html += '<div class="bm-group">Kanji</div>';
    html += bms.kanji.map(b => `<div class="bm-item" data-bm="k" data-k="${b.k}">
      <div style="flex:1"><div class="bm-text" style="font-size:22px">${b.k}</div><div class="bm-sub">${b.readings} — ${b.meaning}</div></div>
      <button class="bm-del" data-bmdel="k" data-k="${b.k}">✕</button></div>`).join('');
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
    }
  }));
  root.querySelectorAll('.bm-del').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.bmdel === 's') bms.sentences = bms.sentences.filter(x => x.id !== b.dataset.id);
    if (b.dataset.bmdel === 'w') bms.words = bms.words.filter(x => x.w !== b.dataset.w);
    if (b.dataset.bmdel === 'k') bms.kanji = bms.kanji.filter(x => x.k !== b.dataset.k);
    saveBms(); renderBms();
  }));
}

function showKanji(k){
  const v = D.kanji[k];
  if (!v) return;
  document.getElementById('detail').innerHTML = `<h2>Kanji</h2>
    <p class="sent-jp" style="font-size:40px">${k}</p>
    <p class="sent-en">${v.readings}</p><p>${v.meaning}</p>`;
}

renderBms();

// ===== Popup for grammar/kanji/vocab details =====
function showPopup(html){
  document.getElementById('popupPanel').innerHTML = html + '<button class="kbd-close" id="popupClose">Close</button>';
  document.getElementById('popup').classList.remove('hidden');
  document.getElementById('popupClose').addEventListener('click', () => document.getElementById('popup').classList.add('hidden'));
}
document.getElementById('popup').addEventListener('click', e => { if (e.target.id === 'popup') e.target.classList.add('hidden'); });

// ===== Keyboard shortcuts =====
let focusedSent = null;
function focusSentence(ci, si){
  document.querySelectorAll('#storyText p.sent').forEach(p => p.classList.remove('focused'));
  const p = document.querySelector(`#storyText p[data-ch="${ci}"][data-si="${si}"]`);
  if (p){ p.classList.add('focused'); p.scrollIntoView({behavior:'smooth', block:'nearest'}); focusedSent = {ci, si}; }
}
function moveFocus(dir){
  if (!focusedSent){
    const first = document.querySelector('#storyText p.sent');
    if (first){ focusSentence(+first.dataset.ch, +first.dataset.si); }
    return;
  }
  const {ci, si} = focusedSent;
  const ch = window.CHAPTERS[ci];
  const total = ch.sentences.length;
  let nsi = si + dir, nci = ci;
  if (nsi < 0){ nci = ci - 1; nsi = nci >= 0 ? window.CHAPTERS[nci].sentences.length - 1 : 0; }
  if (nsi >= total){ nci = ci + 1; nsi = 0; }
  if (nci >= 0 && nci < window.CHAPTERS.length) focusSentence(nci, nsi);
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
    document.querySelectorAll('#storyText p.sent').forEach(p => p.classList.remove('focused'));
    focusedSent = null;
    return;
  }

  const activeTab = document.querySelector('.tab.active').dataset.tab;

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

  if (e.ctrlKey && e.key >= '1' && e.key <= '7'){
    e.preventDefault();
    const tabs = ['story','vocab','kanji','grammar','vocab5','kanji5','grammar5'];
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
function renderProgress(){
  let total = 0, read = 0;
  window.CHAPTERS.forEach((c, ci) => c.sentences.forEach((s, si) => {
    total++;
    if (progress['ch'+ci+':s'+si]) read++;
  }));
  const pct = total ? Math.round(read/total*100) : 0;
  const bar = document.getElementById('progressBar');
  if (bar) bar.style.width = pct + '%';
  const lbl = document.getElementById('progressLabel');
  if (lbl) lbl.textContent = `${read}/${total} sentences studied (${pct}%)`;
  document.querySelectorAll('#storyText h3.chapter').forEach(h => {
    const ci = +h.dataset.ci;
    const ch = window.CHAPTERS[ci];
    let r = 0;
    ch.sentences.forEach((s, si) => { if (progress['ch'+ci+':s'+si]) r++; });
    let tag = h.querySelector('.ch-prog');
    if (!tag){ tag = document.createElement('span'); tag.className = 'ch-prog'; h.appendChild(tag); }
    tag.textContent = `${r}/${ch.sentences.length}`;
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
  sel.innerHTML = window.CHAPTERS.map((c,i) => `<option value="${i}">${c.title}</option>`).join('');
  sel.addEventListener('change', () => {
    const h = document.querySelector(`#storyText h3[data-ci="${sel.value}"]`);
    if (h) h.scrollIntoView({behavior:'smooth', block:'start'});
  });
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
    const w = el.querySelector('td').textContent;
    document.querySelector('[data-tab="story"]').click();
    showWord(w);
  } else if (tab === 'kanji' || tab === 'kanji5'){
    const k = el.dataset.k;
    const v = (tab === 'kanji' ? D.kanji : D.kanji5)[k];
    toast(`${k} — ${v.readings} — ${v.meaning}`);
  } else if (tab === 'grammar' || tab === 'grammar5'){
    el.scrollIntoView({behavior:'smooth', block:'center'});
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
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  const activeTab = document.querySelector('.tab.active').dataset.tab;

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

// ===== Init (must be last — all sections defined) =====
renderProgress();
renderStory(); renderVocab(); renderKanji(); renderGrammar();
