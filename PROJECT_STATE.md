# N4 Story Study Ground — Project State

A static HTML/CSS/JS website for studying JLPT N4/N5, built from the PDFs and
`japanese_master_story.md` in this folder. No build step, no framework.

## File locations

- Site: `S:\Japanease\N4\site\`
  - `index.html` — page structure (tabs, panels, popups)
  - `style.css` — all styling (light pastel theme)
  - `app.js` — all logic (~570 lines)
  - `data.js` — generated data: `window.JLPT` + `window.CHAPTERS`
  - `data.json` — source JSON that `data.js` is regenerated from
  - `chapters.json` — parsed story chapters with sentence translations
- Source PDFs (N4 + N5) are parsed into `data.json`. Do NOT edit `data.js`
  by hand; regenerate it from `data.json` + `chapters.json`.

## Data model (data.js)

`window.JLPT` contains:
- `vocab` (681 words: `{reading, meaning}`), `kanji` (157: `{readings, meaning, strokes}`),
  `grammar` (102: `{pattern, romaji, meaning, example_jp, example_en, example_rom}`)
- `vocab5` (756 words, includes `pos`), `kanji5` (77), `grammar5` (50, with examples)

`window.CHAPTERS` contains 12 chapters:
`{title, jp, en, focus, sentences: [{jp, en}]}`.
`jp` keeps the original `漢字（よみ）` furigana parentheticals; `en` is a
machine translation (MyMemory) of that sentence.

## Features implemented

- Story tab: 12 chapters, sentences are clickable → side panel shows
  translation, grammar chips, word table, kanji table. Furigana + Romaji
  toggles. `?` or Keyboard shortcuts button opens shortcut help.
- Side panel is editable: each word/kanji row has a ✕ remove button and
  Add-input rows. Edits persist in localStorage (`n4edits`) and affect
  segmentation/lookup.
- Grammar chips, words, and kanji in the side panel open a popup with their
  explanation.
- Vocab / Kanji / Grammar tabs (N4 + N5), each searchable. POS tags shown.
- Grammar cards show example sentences parsed from the PDFs.
- Flashcards tab: SM-2 style SRS, decks = N4/N5 vocab/kanji/all, card flip,
  Again/Hard/Good/Easy, stats, localStorage `n4srs`.
- Bookmarks tab: star sentences/words/kanji, localStorage `n4bookmarks`,
  click to jump back, Delete key removes.
- Editable translations: ✎ button on the sentence translation, localStorage
  `n4translations`.
- Grammar false-positive fix: word-boundary matching, ordered `～` matching,
  special-case rules (ば, はずだ, だけ, でも), deduplication.
- Romaji toggle via wanakana CDN.
- Keyboard shortcuts everywhere: story arrows/Enter, flashcards Space/1-4,
  lists J/K/arrows/Enter/Delete/`/`, Ctrl+1-7 tab switch, F/R toggles, Esc.
  Mouse click sets keyboard focus origin on all list pages.
  Kanji grid: arrows move in 2D (columns/rows).

## localStorage keys

`n4edits`, `n4srs`, `n4bookmarks`, `n4translations`.

## Important gotchas

- In `app.js`, ALL init calls (`renderStory()`, `renderBms()`, etc.) must stay
  at the very end of the file. Calling them before `let bms`/`let srs`
  declarations causes a temporal-dead-zone crash that blanks the whole page.
- `chapters.json` was translated with MyMemory (`translate.py` in the temp
  folder). 402/427 sentences translated; the rest fall back to chapter summary.
- data.js is regenerated with a one-line Python script; re-run it after
  editing `data.json` or `chapters.json`.

## Future work (from the original request, not yet done)

- Chapter jump menu (dropdown/sidebar to jump between chapters)
- Click words directly in the story text
- Dark/light theme toggle
- Reading progress tracking
- Offline support (service worker)
- Better word segmentation (manual correction)
- Accessibility pass (ARIA, focus states, screen reader)
- Export/import edits; reset-edits button
- TTS audio for sentences/words
