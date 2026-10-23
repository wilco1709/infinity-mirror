/* desk-ui.js: the desk drawer (bottom, above the music bar; tab "Desk", key K). Look and behaviour of "Control panel mockup/index.html",
   wired to window.DESK (desk-core.js), window.DESK_SONG (desk-songmap.js) and the Director's hooks (show-director.js).
   The page mounts it with DESK_UI.mount(host); host = { pat(), setPat(p), src(), player(), title(), dir(), bpm(), setBpm(b) }
   (see "DESK mount" at the end of Infinity Mirror Pixel Grid.html). All code lives here.
   Prep = a song file plays (map built from the file, stems from the helper); live = anything else (computer sound, microphone, demo, video, Spotify). */
(function (root) {
'use strict';
const D = root.DESK, SONG = root.DESK_SONG;
const UIKEY = 'infinity-desk-ui-v1', DIRECTOR = 55, H0 = 430;
const KCOL = { intro: '#30353a', groove: '#26403a', breakdown: '#35313f', build: '#4a4228', drop: '#4d3029', outro: '#30353a' };
const HITS = ['white flash', 'black frame', 'black frame then white flash', 'white square flies out', 'none'];
const RULES = [['bars', 'changes land on bar lines'], ['preBlack', 'go black when the music drops away before a drop'], ['white', 'white screens only in builds and just after drops'],
  ['loops', 'loop when the music repeats'], ['mono', 'shake things up when nothing moves'], ['ant', 'pull in a little the beat before a change']];
const SN = D ? Object.fromEntries(D.STRIPS.map(s => [s.id, s.name])) : {};
const fmt = t => D.fmt(t);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const CSS = `
.dsk{position:relative;z-index:35;background:var(--panel,#101216);border-top:1px solid var(--line,#242830);color:var(--fg,#dde1e8);font:13px/1.4 var(--ui,system-ui,sans-serif);min-width:0}
.dsk button,.dsk select,.dsk input{font:inherit;color:inherit}
.dsk button{background:var(--panel-2,#161920);border:1px solid var(--line,#242830);border-radius:6px;padding:3px 10px;cursor:pointer;min-height:26px}
.dsk button:hover{border-color:var(--mute,#8c95a3)}
.dsk button.pri{background:var(--accent,#ffb23d);color:var(--accent-ink,#1c1200);border-color:var(--accent,#ffb23d);font-weight:600}
.dsk button.ghost{background:none}.dsk button:disabled{opacity:.4;cursor:default}
.dsk select{background:var(--panel-2,#161920);border:1px solid var(--line,#242830);border-radius:6px;padding:3px 6px}
.dsk .dgrip{position:absolute;left:0;right:0;top:-4px;height:9px;cursor:ns-resize;z-index:3;touch-action:none}
.dsk .dgrip:hover,.dsk .dgrip.on{background:linear-gradient(0deg,transparent 3px,var(--accent,#ffb23d) 3px,var(--accent,#ffb23d) 5px,transparent 5px)}
.dsk.shut .dgrip{display:none}
.dsk .dbar{display:flex;align-items:center;gap:8px;padding:4px 10px;flex-wrap:wrap;min-height:36px}
.dsk .dbar .sp{flex:1}
.dsk .dtab{font-weight:600}
.dsk .dmode{font:700 11px var(--ui,system-ui);padding:2px 8px;border-radius:10px;letter-spacing:.06em}
.dsk .dmode.prep{background:#1d3350;color:#9cc8ff}.dsk .dmode.live{background:#4a1a16;color:#ff9b8f}
.dsk .dstat{font-size:12px;color:var(--mute,#8c95a3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:46ch}
.dsk .dsaved{font-size:12px;color:var(--ok,#5fd6a0)}
.dsk .dbody{display:flex;flex-direction:column;overflow:hidden;border-top:1px solid var(--line,#242830)}
.dsk.shut .dbody{display:none}
.dsk .dsteer{display:none;align-items:center;gap:10px;padding:6px 14px;background:#2a2110;color:#ffd58a;font-size:12px;border-bottom:1px solid #4a3a18}
.dsk .dtlw{padding:6px 14px 0;border-bottom:1px solid var(--line,#242830);flex:0 0 auto}
.dsk canvas.dtl{width:100%;height:132px;display:block;cursor:crosshair}
.dsk .dhelp{font-size:11px;color:#596176;display:flex;justify-content:space-between;gap:10px}
.dsk .dmid{flex:1;display:grid;grid-template-columns:260px minmax(0,1fr);min-height:0}
.dsk .dleft{border-right:1px solid var(--line,#242830);padding:8px 10px;overflow:auto}
.dsk h4{margin:0 0 6px;font-size:11px;color:var(--mute,#8c95a3);font-weight:600;text-transform:uppercase;letter-spacing:.06em}
.dsk .note{color:var(--mute,#8c95a3);font-size:12px}
.dsk .dnow{font-size:12px;color:var(--mute,#8c95a3);margin:0 0 6px}
.dsk .dperf{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:8px}
.dsk .dperf button{padding:7px 2px;font-weight:600}
.dsk .dperf button.on{background:#5aa8ff;color:#06121f;border-color:#5aa8ff}
.dsk .dperf .dropb{background:#3b2a10;border-color:#6a4d1a;color:var(--accent,#ffb23d)}
.dsk .dperf .blk{background:#000}.dsk .dperf kbd{font:600 10px var(--ui,system-ui);opacity:.85;border:1px solid currentColor;border-radius:4px;padding:0 4px;margin-left:4px}
.dsk .leg{font-size:11px;color:#596176;cursor:help}
.dsk.cmp canvas.dtl{height:84px}.dsk.cmp .dhelp,.dsk.cmp .dnow,.dsk.cmp .dctx .note:not(.leg),.dsk.cmp .strip .src,.dsk.cmp .dhist{display:none}
.dsk.cmp .dstrips{padding:4px 8px;gap:4px}.dsk.cmp .strip{padding:3px 2px;gap:1px}.dsk.cmp .strip .bar{min-height:40px}.dsk.cmp .strip .nm{min-height:16px}.dsk.cmp .dctx{padding:3px 10px}.dsk.cmp .dleft{padding:4px 8px}.dsk.cmp .dperf button{padding:3px 2px}.dsk.cmp .dtlw{padding-top:2px}
.dsk .notice{background:var(--panel-2,#161920);border:1px solid var(--line,#242830);border-left:3px solid var(--warn,#ff7a5c);border-radius:8px;padding:6px 8px;margin-bottom:6px;font-size:12px}
.dsk .notice .row{display:flex;gap:6px;margin-top:5px}.dsk .notice button{padding:1px 8px;font-size:12px;min-height:22px}
.dsk .darea{display:flex;flex-direction:column;min-width:0;min-height:0}
.dsk .dctx{display:flex;align-items:center;gap:10px;padding:6px 12px;border-bottom:1px solid var(--line,#242830);font-size:12px;flex-wrap:wrap}
.dsk .dwhere{background:#232a3a;border:1px solid var(--line,#242830);border-radius:14px;padding:2px 10px}
.dsk .dwhere.sec{border-color:#5aa8ff;color:#bfe0ff}
.dsk .dstrips{flex:1;display:flex;gap:6px;padding:8px 12px;overflow:auto;align-items:stretch;min-height:0}
.dsk .strip{width:86px;flex:0 0 86px;background:var(--panel-2,#161920);border:1px solid var(--line,#242830);border-radius:9px;padding:5px 4px;display:flex;flex-direction:column;align-items:center;gap:3px;position:relative;min-height:min-content}
.dsk .strip.fam{background:#1c2029;width:92px;flex-basis:92px}.dsk .strip.sub{background:#12151c;width:84px;flex-basis:84px}
.dsk .strip.master{background:#1f1a12;border-color:#3e3220}
.dsk .strip .nm{font-size:11px;font-weight:600;text-align:center;line-height:1.15;min-height:24px;display:flex;align-items:center;justify-content:center;gap:2px}
.dsk .strip .est{color:var(--accent,#ffb23d);font-weight:700;cursor:help}
.dsk .strip .open{position:absolute;top:3px;right:4px;font-size:11px;color:var(--mute,#8c95a3);cursor:pointer}
.dsk .strip .bar{display:flex;gap:6px;align-items:flex-end;flex:1;min-height:70px}
.dsk .meter{width:8px;height:100%;background:#0b0d12;border-radius:3px;position:relative;overflow:hidden}
.dsk .meter i{position:absolute;left:0;right:0;bottom:0;height:0;border-radius:3px}
.dsk input.v{writing-mode:vertical-lr;direction:rtl;width:22px;height:100%;margin:0;accent-color:var(--accent,#ffb23d);cursor:ns-resize}
.dsk .light{font-size:12px;font-weight:800;height:16px;min-width:22px;text-align:center;border-radius:8px}
.dsk .light.ok{color:var(--ok,#5fd6a0)}.dsk .light.gap{color:#fff;background:#d94a3a;padding:0 4px}.dsk .light.q,.dsk .light.mute{color:#596176}
.dsk .val{font-size:11px;color:var(--mute,#8c95a3);text-align:center;line-height:1.2}.dsk .val b{color:var(--fg,#dde1e8);font-size:12px}
.dsk .src{font-size:10px;padding:0 5px;border-radius:7px;border:1px solid var(--line,#242830)}
.dsk .src.section{color:#bfe0ff;border-color:#2c5a8a}.dsk .src.song{color:var(--accent,#ffb23d);border-color:#6a4d1a}
.dsk .how{font-size:10px;line-height:1.15;padding:2px 3px;width:100%;white-space:normal;word-break:break-word;min-height:26px}
.dsk .rst{font-size:10px;padding:0 6px;color:var(--mute,#8c95a3);background:none;border:none;min-height:16px}
.dsk .sepv{width:1px;background:var(--line,#242830);margin:0 4px;flex:0 0 1px}
.dsk .dhist{border-top:1px solid var(--line,#242830);padding:4px 12px;font-size:12px;max-height:30px;overflow:hidden}
.dsk .dhist.open{max-height:170px;overflow:auto}
.dsk .dhist .hd{cursor:pointer;color:var(--mute,#8c95a3)}
.dsk .hi{display:flex;gap:8px;padding:3px 0;border-bottom:1px solid #1c2029}.dsk .hi .w{color:#596176;min-width:44px}.dsk .hi .x{flex:1}.dsk .hi.undone .x{text-decoration:line-through;color:#596176}
.dsk .badge{display:inline-block;font-size:10px;padding:0 6px;border-radius:8px;border:1px solid var(--line,#242830);color:var(--mute,#8c95a3)}
.dsk .badge.you{color:var(--accent,#ffb23d);border-color:#6a4d1a}.dsk .badge.claude{color:#c9a7ff;border-color:#4b3d6e}
.dsk .dim{opacity:.55}
.dskpop{position:fixed;z-index:60;width:300px;background:#1c2029;border:1px solid var(--mute,#8c95a3);border-radius:10px;padding:12px;box-shadow:0 10px 40px #000a;display:none;color:var(--fg,#dde1e8);font:13px/1.4 var(--ui,system-ui,sans-serif)}
.dskpop.on{display:block}.dskpop h4{margin:0 0 6px;font-size:14px}.dskpop .opt{display:block;margin:5px 0;cursor:pointer}
.dskpop .row{display:flex;gap:8px;align-items:center;margin:8px 0;flex-wrap:wrap}.dskpop .note{color:var(--mute,#8c95a3);font-size:12px}
.dskpop button,.dskpop select{font:inherit;color:inherit;background:#232a3a;border:1px solid var(--line,#242830);border-radius:6px;padding:3px 10px}
.dskpop button.pri{background:var(--accent,#ffb23d);color:var(--accent-ink,#1c1200);border-color:var(--accent,#ffb23d);font-weight:600}
.dskpop button.ghost{background:none}
.dskpop .chip{display:inline-block;font-size:12px;padding:2px 9px;border-radius:12px;border:1px solid var(--line,#242830);background:#161920;cursor:pointer;user-select:none;margin:2px}
.dskpop .chip.on{border-color:var(--accent,#ffb23d);color:var(--accent,#ffb23d)}.dskpop .chip.off{color:#596176;text-decoration:line-through}
.dskpop.wide{width:420px;max-height:70vh;overflow:auto}
.dsktoast{position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);background:#232a3a;border:1px solid var(--mute,#8c95a3);padding:6px 12px;border-radius:8px;display:none;gap:10px;align-items:center;z-index:50;font-size:12px;max-width:90vw}
.dsktoast.on{display:flex}
`;

function mount(host) {
  if (!D || !host || mount.done || typeof document === 'undefined') return null;
  mount.done = true;
  const U = { open: false, h: 0, popT: 0, liveSrc: null, tipBox: null, loop: null, hist: false, tab: null, taps: [], token: 0, key: null, fam: {}, tips: {}, tipEls: [], scn: {}, scnV: 0, noteSig: '', dirOn: null, drag: false,
    stat: '', stem: '', dragSel: null, famEnv: null, stripEls: [], tlDirty: true, last: 0, tick: 0, openF: {} };
  try { const j = JSON.parse(localStorage.getItem(UIKEY) || 'null'); if (j) { U.open = !!j.open; U.h = Math.max(160, +j.h || 0); U.openF = j.openF || {}; } } catch (e) { /* no storage: fine */ }
  const save = () => { try { localStorage.setItem(UIKEY, JSON.stringify({ open: U.open, h: U.h, openF: U.openF })); } catch (e) { /* fine */ } };
  const defH = () => Math.max(160, Math.min(H0, Math.round((root.innerHeight || 800) * .42)));
  if (!U.h) U.h = defH();
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const dir = () => { try { return host.dir && host.dir(); } catch (e) { return null; } };
  const ENG = () => { const d = dir(); return d && d.ENG; };
  const live = () => D.mode === 'live';
  const player = () => host.player && host.player();
  const T = () => { const p = player(); return !live() && p && isFinite(p.currentTime) ? p.currentTime : 0; };
  const dirOn = () => { try { return host.pat() === DIRECTOR && !!ENG(); } catch (e) { return false; } };
  const sceneId = () => { const E = ENG(); return E && E.sc ? E.sc.def.id : null; };
  const curSi = () => (live() ? D.phase : D.sel != null ? D.sel : D.sectionAt(T()));

  /* ---------- the DOM: tab bar, body, pop-up, set drawer ---------- */
  const style = el('style'); style.textContent = CSS; document.head.appendChild(style);
  const R = el('div', 'dsk shut'); R.id = 'dDesk'; R.setAttribute('aria-label', 'Desk');
  const grip = el('div', 'dgrip'); grip.title = 'Drag to resize, double-click for the normal height';
  const bar = el('div', 'dbar');
  const tab = el('button', 'dtab'); tab.type = 'button'; tab.title = 'Desk ( K )';
  const modeB = el('span', 'dmode prep', 'PREP'), stat = el('span', 'dstat');
  const sp = el('span', 'sp'), presetSel = el('select'), infoB = el('button', 'ghost', 'ⓘ'), undoB = el('button', null, '↶'), setB = el('button', null, '⚙ Set'), savedE = el('span', 'dsaved', '✓ saved');
  presetSel.title = 'Style'; infoB.title = 'About this style'; undoB.title = 'Undo (Ctrl+Z)'; setB.title = 'Scenes and house rules';
  for (const p of D.PRESETS) { const o = el('option'); o.value = p.id; o.textContent = p.name; presetSel.appendChild(o); }
  const ctrl = [presetSel, infoB, undoB, setB, savedE];
  bar.append(tab, modeB, stat, sp, ...ctrl);
  const body = el('div', 'dbody');
  const steer = el('div', 'dsteer', 'The desk steers the Director: switch to it. ');
  const steerB = el('button', 'pri', 'Switch to the Director'); steer.appendChild(steerB);
  const tlw = el('div', 'dtlw'), tl = el('canvas', 'dtl'), tlHelp = el('div', 'dhelp', '<span>Click a section = fader moves apply only there · click ◆ = drop · click a scene = why · drag = loop · D = drop here · Esc = whole song</span><span></span>');
  tlw.append(tl, tlHelp);
  const mid = el('div', 'dmid'), left = el('div', 'dleft'), darea = el('div', 'darea');
  const nowE = el('div', 'dnow'), perf = el('div', 'dperf'), notes = el('div'), ctx = el('div', 'dctx'), strips = el('div', 'dstrips'), hist = el('div', 'dhist');
  perf.innerHTML = '<button data-perf="next" title="N">Next scene<kbd>N</kbd></button><button data-perf="hold" title="H">Hold scene<kbd>H</kbd></button><button data-perf="drop" class="dropb" title="Enter">Drop!<kbd>&#9166;</kbd></button>' +
    '<button data-perf="calm" title="C">Calm down<kbd>C</kbd></button><button data-perf="black" class="blk" title="hold B">Black (hold)<kbd>B</kbd></button><button data-perf="tap" title="T">Tap <span data-bpm></span><kbd>T</kbd></button>';
  left.append(el('h4', null, 'Perform (not saved)'), nowE, perf, notes);
  darea.append(ctx, strips, hist); mid.append(left, darea); body.append(steer, tlw, mid);
  const pop = el('div', 'dskpop'), toastE = el('div', 'dsktoast');
  R.append(grip, bar, body, toastE);
  const bpmE = perf.querySelector ? perf.querySelector('[data-bpm]') : null;

  const toast = (msg, actions) => { toastE.innerHTML = ''; const s = el('span'); s.textContent = msg; toastE.appendChild(s);
    for (const [l, f] of actions || []) { const b = el('button', null, l); b.onclick = () => { f(); toastE.classList.remove('on'); }; toastE.appendChild(b); }
    toastE.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => toastE.classList.remove('on'), actions ? 7000 : 3500); };
  const closePop = () => { pop.classList.remove('on'); pop.classList.remove('wide'); };
  const popAt = (x, y, html, wide) => { U.popSet = false; U.popT = (root.performance || Date).now(); pop.innerHTML = html; pop.classList.toggle('wide', !!wide); const w = wide ? 420 : 300;
    pop.style.left = Math.max(8, Math.min((root.innerWidth || 1200) - w - 10, x)) + 'px'; pop.style.top = Math.max(8, Math.min((root.innerHeight || 800) - 340, y)) + 'px'; pop.classList.add('on'); };
  const status = (s, stem) => { if (s != null) U.stat = s; if (stem != null) U.stem = stem; stat.textContent = (U.stat + (U.stem ? (U.stat ? ' · ' : '') + U.stem : '')); stat.title = stat.textContent; };

  /* ---------- open / close / resize ---------- */
  const layout = () => {
    R.classList.toggle('shut', !U.open);
    const ih = root.innerHeight || 800, mbE = document.getElementById('mbar'), mbH = mbE && mbE.getBoundingClientRect ? mbE.getBoundingClientRect().height : 0,
      mx = Math.max(160, Math.min(Math.round(ih * .45), ih - 400, ih - (mbH || 100) - 48 - 352)), hh = Math.max(160, Math.min(mx, U.h || defH())), cmp = ih < 800;
    U.cur = hh; body.style.height = hh + 'px'; if (R.classList.contains('cmp') !== cmp) { R.classList.toggle('cmp', cmp); U.tlDirty = true; }
    tab.textContent = (U.open ? '▾ ' : '▴ ') + 'Desk';
    for (const c of ctrl) c.style.display = U.open ? '' : 'none';
    U.inLay = true; try { root.dispatchEvent(new root.Event('resize')); } catch (e) { /* the view refits */ } U.inLay = false;
  };
  root.addEventListener('resize', () => { if (!U.inLay && U.open) layout(); });
  const setOpen = v => { U.open = v === undefined ? !U.open : !!v; layout(); save(); if (U.open) { render(); U.tlDirty = true; startFrames(); } };
  tab.onclick = () => setOpen();
  { let st = null;
    grip.addEventListener('pointerdown', e => { e.preventDefault(); st = { y: e.clientY, h: U.cur || U.h }; try { grip.setPointerCapture(e.pointerId); } catch (_) { /* fine */ } grip.classList.add('on'); });
    grip.addEventListener('pointermove', e => { if (!st) return; U.h = Math.round(st.h + (st.y - e.clientY)); layout(); U.tlDirty = true; });
    const end = () => { if (!st) return; st = null; grip.classList.remove('on'); save(); };
    grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
    grip.addEventListener('dblclick', () => { U.h = defH(); layout(); save(); U.tlDirty = true; }); }
  steerB.onclick = () => { try { host.setPat(DIRECTOR); } catch (e) { /* fine */ } };

  /* ---------- the song: prep (file) or live ---------- */
  const helperHint = 'helper not running — start: node desk-helper.js';
  async function loadSong(url, name, token) {
    const live_ = () => token === U.token;
    try {
      status('reading the song…', '');
      const bytes = await (await fetch(url)).arrayBuffer(); if (!live_()) return;
      const AC = root.AudioContext || root.webkitAudioContext, ctx = (() => { try { return new AC({ sampleRate: 44100 }); } catch (e) { return new AC(); } })(); let buf;   /* 44.1 kHz: what the analysis was tuned on */
      try { buf = await ctx.decodeAudioData(bytes.slice(0)); } finally { try { ctx.close(); } catch (e) { /* fine */ } }
      if (!live_()) return;
      const id = await SONG.sha1(bytes), opts = { name, bytes, id };
      let map = await SONG.get(id);
      if (!live_()) return;
      if (!map) { map = await SONG.build(buf, opts, p => { if (live_()) status('analysing the song… ' + Math.round(p * 100) + '%'); }); if (!live_()) return; SONG.put(map); }
      D.setSong(map); status('', map.stems ? 'stems ✓' : '');
      if (!map.stems) await stems(buf, bytes, opts, name, token);
    } catch (e) { if (live_()) { status('the song could not be read (' + (e && e.message || e) + ')', ''); console.warn('desk: song failed', e); } }
  }
  async function stems(buf, bytes, opts, name, token) {
    const live_ = () => token === U.token;
    if (!(await SONG.helperUp())) { if (live_()) status('', 'stems: ' + helperHint); U.stemRetry = () => stems(buf, bytes, opts, name, token); return; }
    U.stemRetry = null; status('', 'stems: making… 0%');
    const st = await SONG.fetchStems(bytes, name, p => { if (live_()) status('', 'stems: making… ' + Math.round(p * 100) + '%'); });
    if (!live_()) return;
    if (!st) { status('', 'stems: failed (the map stays without them)'); return; }
    status('', 'stems: building the map…');
    const map = await SONG.build(buf, Object.assign({}, opts, { stems: st }), null); if (!live_()) return;
    SONG.put(map); D.setSong(map); status('', 'stems ✓'); toast('Stems are in: the map is better now.');
  }
  /* what the music bar plays decides the mode: a song file = prep, everything else = live */
  function checkSource() {
    let src = null, p = null; try { src = host.src(); p = player(); } catch (e) { return; }
    const song = src === 'file' && p && p.src;
    if (song) {
      if (U.key !== p.src) { U.key = p.src; U.token++; U.stemRetry = null; if (D.mode !== 'prep') D.setMode('prep'); D.setSong(null); U.famEnv = null; U.scn = {}; U.scnV++;
        let nm = ''; try { nm = host.title(); } catch (e) { /* fine */ } loadSong(p.src, nm || 'song', U.token); }
      else if (D.mode !== 'prep') D.setMode('prep');
    } else {
      if (U.key !== 'live' || U.liveSrc !== src) { U.key = 'live'; U.liveSrc = src; U.token++; U.stemRetry = null; status(({ system: 'computer sound', mic: 'microphone', demo: 'demo beat', video: 'video sound' })[src] || 'live sound', ''); }
      if (D.mode !== 'live') D.setMode('live');
    }
  }
  const buildFam = () => {
    const m = D.map; U.famEnv = null; if (!m || !m.env) return;
    const n = Math.max(1, Math.ceil(m.dur * 3)), rate = m.rate || 20, o = {};
    for (const f of D.FAMS) { const a = new Float32Array(n), ids = D.STRIPS.filter(s => s.fam === f.id && m.env[s.id]).map(s => m.env[s.id]);
      for (let j = 0; j < n; j++) { let v = 0; const i0 = Math.floor(j / 3 * rate), i1 = Math.max(i0 + 1, Math.floor((j + 1) / 3 * rate)); for (const e of ids) for (let i = i0; i < i1 && i < e.length; i++) if (e[i] > v) v = e[i]; a[j] = v; }
      o[f.id] = a; }
    U.famEnv = o;
  };

  /* ---------- render: everything that is not per-frame ---------- */
  function renderCtx() {
    let h;
    if (live()) h = `<span class="dwhere">Live: fader moves are saved to <b>this set</b> (${esc(D.preset().name)})</span><span class="note">Prep-only strips are greyed out. <b style="color:var(--accent,#ffb23d)">~</b> = estimated live.</span>`;
    else if (D.sel != null && D.map) { const s = D.map.sections[D.sel]; h = `<span class="dwhere sec">Fader moves apply to: <b>${D.KNAME[s.k]} ${fmt(s.a)}–${fmt(s.b)}</b> (this song)</span><button class="ghost" data-act="all">✕ whole song</button><button data-act="promote">Use for every ${D.KNAME[s.k].toLowerCase()} (set)</button>`; }
    else h = `<span class="dwhere">Fader moves apply to: <b>${D.map ? 'the whole song' : 'the set (no song map yet)'}</b></span>${D.map ? '<span class="note">Click a section on the timeline to change only that part.</span>' : ''}${Object.keys(D.state.song).length ? '<button data-act="promote">Use for every song (set)</button>' : ''}`;
    ctx.innerHTML = h + '<span class="leg" title="The small light under each fader, measured while the music plays">● responds · !! plays, no response · – muted · · silent</span>';
  }
  function stripHTML(id, cls) {
    const s = D.STRIPS.find(x => x.id === id), si = curSi(), [v, src] = D.eff(id, si), dis = live() && s.live === 'no';
    const rst = (src === 'section' && D.sel != null) || (src === 'song' && D.sel == null && !live()) || (src === 'set' && live() && D.state.set[id] != null);
    const col = D.FAMS.find(f => f.id === s.fam).colour;
    return `<div class="strip ${cls}" data-s="${id}" style="${dis ? 'opacity:.35' : ''}"><div class="nm">${esc(s.name)}${live() && s.live === 'est' ? '<span class="est" title="Estimated live: no stems">~</span>' : ''}</div>
     <div class="bar"><div class="meter"><i style="background:${col}"></i></div><input class="v" type="range" min="0" max="100" value="${v}" ${dis ? 'disabled' : ''} data-fader="${id}"></div>
     <div class="light q">·</div><div class="val"><b>${v}</b> <span class="src ${src}">${src}</span></div>
     <button class="how" data-how="${id}" title="How the picture shows it: ${esc(D.how(id))}">${esc(D.how(id))} ▾</button>${rst ? `<button class="rst" data-rst="${id}">↺ reset</button>` : ''}${dis ? '<div class="note" style="font-size:10px">prep only</div>' : ''}</div>`;
  }
  function renderStrips() {
    let h = ''; const si = curSi();
    for (const f of D.FAMS) {
      const ids = D.STRIPS.filter(s => s.fam === f.id).map(s => s.id), avg = Math.round(ids.reduce((a, id) => a + D.eff(id, si)[0], 0) / ids.length), op = U.openF[f.id];
      h += `<div class="strip fam" data-fam="${f.id}"><span class="open" data-open="${f.id}">${op ? '◂' : '▸'} ${ids.length}</span><div class="nm" style="color:${f.colour}">${f.name}</div>
        <div class="bar"><div class="meter"><i style="background:${f.colour}"></i></div><input class="v" type="range" min="0" max="100" value="${avg}" data-famf="${f.id}"></div>
        <div class="light q">·</div><div class="val"><b>${avg}</b></div><button class="how" data-open="${f.id}">${op ? 'close' : 'open'}</button></div>`;
      if (op) for (const id of ids) h += stripHTML(id, 'sub');
    }
    h += '<div class="sepv"></div>';
    for (const [k, n] of [['energy', 'Energy'], ['brightness', 'Bright'], ['flashes', 'Flashes']]) { const v = D.master(k);
      h += `<div class="strip master"><div class="nm">${n}</div><div class="bar"><input class="v" type="range" min="0" max="100" value="${v}" data-master="${k}"></div><div class="light"></div><div class="val"><b>${v}</b></div>${k === 'flashes' ? '<div class="note" style="font-size:10px;text-align:center">max 3 / s always</div>' : ''}</div>`; }
    strips.innerHTML = h;
    U.stripEls = [...strips.querySelectorAll('.strip[data-s],.strip[data-fam]')].map(e => ({ e, id: e.dataset.s, fam: e.dataset.fam, m: e.querySelector('.meter i'), l: e.querySelector('.light') }));
  }
  function renderNotes() {
    if (live()) { if (!U.tipBox) U.tipBox = el('div'); notes.innerHTML = '<h4>Live tips</h4><div class="note">While it plays, a strip that shows <span class="light gap">!!</span> for a few seconds appears here with a quick fix.</div>'; notes.appendChild(U.tipBox); return; }
    const n = D.notices(); U.notes = n; U.noteSig = n.map(x => x.key).join();
    let h = `<h4>Things I noticed <span class="note">(${n.length})</span></h4>`;
    if (!n.length) h += `<div class="note">${D.map ? 'Nothing missing yet: play the song through, and I list a part that stands out but gets no response.' : 'Load a song to see what the picture follows.'}</div>`;
    for (const x of n.slice(0, 8)) h += `<div class="notice"><div>${esc(x.text)}</div><div class="row"><button data-hear="${esc(x.key)}">▶ hear</button><button class="pri" data-fix="${esc(x.key)}">${x.fix === 'drop' ? 'change picture' : 'follow it here'}</button></div></div>`;
    if (n.length > 8) h += `<div class="note">and ${n.length - 8} more…</div>`;
    h += '<div class="note" style="margin-top:8px">Measured while the song plays: does the picture change when this part plays?</div>';
    notes.innerHTML = h;
  }
  function renderHist() {
    const n = D.history.filter(x => !x.undone).length;
    hist.innerHTML = `<div class="hd" data-act="hist">${U.hist ? '▾' : '▸'} History (${n}) <span class="note">· undo with ↶ or Ctrl+Z</span></div>` +
      (U.hist ? [...D.history].reverse().slice(0, 60).map(x => `<div class="hi ${x.undone ? 'undone' : ''}"><span class="w">${esc(x.when)}</span><span class="x"><span class="badge ${x.by}">${x.by === 'you' ? 'you' : 'Claude'}</span> ${esc(x.text)} <span class="badge">${esc(x.where)}</span></span></div>`).join('') : '');
    hist.classList.toggle('open', U.hist);
  }
  function renderBar() {
    modeB.className = 'dmode ' + (live() ? 'live' : 'prep'); modeB.textContent = live() ? 'LIVE' : 'PREP';
    presetSel.value = D.state.preset; tlw.style.display = live() || !D.map ? 'none' : ''; undoB.disabled = !D.history.some(x => !x.undone);
    status();
  }
  function render() {
    if (!U.open) return;
    renderBar(); renderCtx(); renderStrips(); renderNotes(); renderHist(); U.tlDirty = true;
    if (setOpenFlag) renderSet();
  }
  const markSaved = () => { savedE.textContent = 'saving…'; savedE.style.color = 'var(--accent,#ffb23d)'; clearTimeout(markSaved.t); markSaved.t = setTimeout(() => { savedE.textContent = '✓ saved'; savedE.style.color = 'var(--ok,#5fd6a0)'; }, 450); };

  /* ---------- desk interaction ---------- */
  const setLabel = (inp, v) => { const b = inp.parentNode && inp.parentNode.parentNode && inp.parentNode.parentNode.querySelector('.val b'); if (b) b.textContent = v; };
  strips.addEventListener('input', e => {
    const t = e.target, d = t.dataset || {}; U.drag = true;
    if (d.fader) D.setValue(d.fader, +t.value);
    else if (d.famf) D.setFamily(d.famf, +t.value);
    else if (d.master) D.setMaster(d.master, +t.value);
    else return;
    setLabel(t, t.value);
  });
  strips.addEventListener('change', () => { U.drag = false; render(); });
  /* double-click a fader = back to the value below it: removes the override at the current scope */
  const dropOv = id => { const S = D.state; if (live()) delete S.set[id]; else if (D.sel != null && S.sec[D.sel]) { delete S.sec[D.sel][id]; if (!Object.keys(S.sec[D.sel]).length) delete S.sec[D.sel]; } else delete S.song[id]; };
  strips.addEventListener('dblclick', e => {
    const d = (e.target && e.target.dataset) || {}; U.drag = false;
    if (d.fader) D.resetValue(d.fader);
    else if (d.famf) { const ids = D.STRIPS.filter(s => s.fam === d.famf).map(s => s.id); D.change(D.FAMS.find(f => f.id === d.famf).name + ' family back to the ' + (D.sel != null ? 'song' : 'set') + ' value', 'you', 'reset', () => ids.forEach(dropOv), 'rstfam' + d.famf); }
    else if (d.master) D.change(d.master + ' back to normal', 'you', 'this set', () => { delete D.state.master[d.master]; });
  });
  strips.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('[data-open],[data-how],[data-rst]'); if (!t) return;
    const d = t.dataset;
    if (d.open) { U.openF[d.open] = !U.openF[d.open]; save(); renderStrips(); return; }
    if (d.rst) { D.resetValue(d.rst); return; }
    if (d.how) { const id = d.how, r = t.getBoundingClientRect(), pst = (D.preset().strips && D.preset().strips[id] && D.preset().strips[id].how) || [];
      popAt(r.left, r.top - 240, `<h4>How the picture shows ${esc(SN[id].toLowerCase())}</h4>${D.HOWS[id].map(o => `<label class="opt"><input type="radio" name="hw" value="${esc(o)}" ${o === D.how(id) ? 'checked' : ''}> ${esc(o)}${pst.includes(o) ? ' <span class="badge">' + esc(D.preset().name) + '</span>' : ''}</label>`).join('')}<div class="note">When a scene already reacts to ${esc(SN[id].toLowerCase())} itself, the fader makes that stronger or weaker. Above 55 the desk adds this as an extra layer if the scene doesn't.</div><div class="row"><button class="ghost" data-x>close</button></div>`);
      pop.querySelectorAll('[name=hw]').forEach(r2 => { r2.onchange = () => { D.setHow(id, r2.value); closePop(); }; }); } });
  ctx.addEventListener('click', e => { const a = e.target.dataset && e.target.dataset.act; if (a === 'all') D.select(null); else if (a === 'promote') { if (D.sel != null) D.promoteKind(); else D.promoteSet(); toast('Saved to the set: every song with this set starts like this.'); } });
  hist.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-act=hist]')) { U.hist = !U.hist; renderHist(); } });
  presetSel.onchange = () => { D.applyPreset(presetSel.value); presetInfo(); };
  infoB.onclick = presetInfo;
  function presetInfo() { const P = D.preset(), r = infoB.getBoundingClientRect();
    popAt(r.right - 320, r.top - 330, `<h4>${esc(P.name)}</h4>${P.refs && P.refs.length ? `<div class="note">${esc(P.refs.join(' · '))}</div>` : ''}<p style="margin:8px 0">${esc(P.why || '')}</p>${(P.dos || []).length ? '<div class="note"><b>Rules a VJ of this style gives:</b></div><ul style="margin:4px 0 0 16px;padding:0;font-size:12px">' + P.dos.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : ''}<div class="row"><button class="ghost" data-x>close</button></div>`); }
  undoB.onclick = doUndo;
  function doUndo() { const h = D.undo(); if (h) toast('Undone: ' + h.text); }
  pop.addEventListener('click', e => { if (e.target.dataset && e.target.dataset.x !== undefined) closePop(); });

  /* the SET level (every song) = DESK.promoteSet; 'Use for every <kind>' = DESK.promoteKind */
  const promoteSet = id => { if (D.promoteSet({ ids: [id] }) === false) return toast('Nothing to move: it is already the set value.'); toast('Saved to the set: every song starts like this.'); };
  /* notices: ▶ hear, fix */
  const hear = (t, si) => { const p = player(), m = D.map; if (!p || !m) return; const t0 = Math.max(0, t - 1.5), b = Math.min(si != null && m.sections[si] ? m.sections[si].b : m.dur, t + 8);
    U.loop = { a: t0, b }; try { p.currentTime = t0; p.play().catch(() => { }); } catch (e) { /* fine */ } U.tlDirty = true; };
  notes.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-hear],[data-fix]'); if (!b) return;
    const x = (U.notes || []).find(n => n.key === (b.dataset.hear || b.dataset.fix)); if (!x) return;
    if (b.dataset.hear) { hear(x.t, x.si); return; }
    D.applyFix(x.key);  if (x.id) U.openF[D.STRIPS.find(s => s.id === x.id).fam] = true;
    if (x.fix === 'drop') toast('The drop now changes the picture. Playing it so you can see.', [['Undo', doUndo]]);
    else toast(`${SN[x.id]} is now followed here (this song). The section is selected, so the fader works only there.`, [['Use in every song', () => promoteSet(x.id)], ['Undo', doUndo]]);
    hear(x.t, x.si);
  });

  /* perform buttons (only while the Director plays) */
  const act = {
    next() { const E = ENG(); if (E) E.skip = true; },
    hold() { const E = ENG(); if (E) E.hold = !E.hold; },
    drop() { const E = ENG(); if (E && E.forceDrop) E.forceDrop(); },
    calm() { const E = ENG(); if (E && E.forceCalm) { E.forceCalm(8); toast('Calm for 8 bars.'); } },
    tap() { const n = (root.performance || Date).now(); U.taps = U.taps.filter(x => n - x < 3000).concat(n);
      if (U.taps.length > 2) { const b = Math.round(60000 / ((U.taps[U.taps.length - 1] - U.taps[0]) / (U.taps.length - 1))); if (b >= 40 && b <= 240) { if (host.setBpm) host.setBpm(b); if (bpmE) bpmE.textContent = b; } } }
  };
  perf.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-perf]'); if (b && act[b.dataset.perf] && dirOn()) act[b.dataset.perf](); });
  perf.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('[data-perf=black]'); if (b && dirOn()) ENG().black = true; });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) perf.addEventListener(ev, () => { const E = ENG(); if (E && !U.keyB) E.black = false; });

  /* ---------- timeline ---------- */
  const LBL = 62, LANES = [['sec', 20], ...D.FAMS.map(f => [f.id, 9]), ['shows', 24]];
  const laneY = n => { let y = 14; for (const [k, h] of LANES) { if (k === n) return [y, h]; y += h + (k === 'sec' ? 6 : 3); } return [0, 0]; };
  const dur = () => (D.map && D.map.dur) || 1;
  const tx = t => LBL + (t / dur()) * (tl.clientWidth - LBL - 6), txi = x => (x - LBL) / (tl.clientWidth - LBL - 6) * dur();
  const tlc = document.createElement('canvas'), tcg = tlc.getContext ? tlc.getContext('2d') : null, tg = tl.getContext ? tl.getContext('2d') : null;
  const blocks = () => { const o = [], ks = Object.keys(U.scn).map(Number).sort((a, b) => a - b);
    for (const s of ks) { const v = U.scn[s], l = o[o.length - 1]; if (l && l.id === v.id && l.b === s) l.b = s + 1; else o.push({ id: v.id, a: s, b: s + 1, why: v.why }); } return o; };
  function drawStatic(g, W, H, d) {
    const m = D.map; g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, W, H); g.font = '11px system-ui';
    g.fillStyle = '#8f8f8f'; for (let t = 0; t <= m.dur; t += 30) { g.fillRect(tx(t), 0, 1, 6); g.fillText(fmt(t), tx(t) + 3, 9); }
    const [y, h] = laneY('sec'), nts = D.notices();
    m.sections.forEach((s, i) => { g.fillStyle = KCOL[s.k] || '#30353a'; g.fillRect(tx(s.a), y, tx(s.b) - tx(s.a) - 1, h);
      if (D.sel === i) { g.strokeStyle = '#55b08c'; g.lineWidth = 2; g.strokeRect(tx(s.a) + 1, y + 1, tx(s.b) - tx(s.a) - 3, h - 2); }
      g.fillStyle = '#e7eaf1'; if (tx(s.b) - tx(s.a) > 38) g.fillText(D.KNAME[s.k] || s.k, tx(s.a) + 4, y + 14);
      if (D.state.sec[i] && Object.keys(D.state.sec[i]).length) { g.fillStyle = '#55b08c'; g.beginPath(); g.arc(tx(s.b) - 7, y + 5, 3, 0, 7); g.fill(); } });
    for (const dd of D.state.drops) { const x = tx(dd.t); g.fillStyle = dd.notDrop ? '#8f8f8f' : '#d9ad5e'; g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x + 6, y + h / 2); g.lineTo(x, y + h + 3); g.lineTo(x - 6, y + h / 2); g.fill(); }
    g.fillStyle = '#9a9a9a'; g.fillText('SECTIONS', 4, y + 14);
    for (const f of D.FAMS) { const [fy, fh] = laneY(f.id); g.fillStyle = '#9a9a9a'; g.font = '9px system-ui'; g.fillText(f.name.toUpperCase(), 4, fy + 8); g.font = '11px system-ui';
      for (const n of nts) { if (n.id == null || n.si == null || !m.sections[n.si]) continue; const s = D.STRIPS.find(z => z.id === n.id); if (s && s.fam === f.id) { g.fillStyle = 'rgba(255,90,74,.22)'; g.fillRect(tx(m.sections[n.si].a), fy - 1, tx(m.sections[n.si].b) - tx(m.sections[n.si].a), fh + 2); } }
      const a = U.famEnv && U.famEnv[f.id]; g.fillStyle = f.colour; g.beginPath(); g.moveTo(tx(0), fy + fh);
      if (a) for (let j = 0; j < a.length; j++) g.lineTo(tx(j / 3), fy + fh - Math.min(1, a[j]) * fh);
      g.lineTo(tx(m.dur), fy + fh); g.fill(); }
    const [wy, wh] = laneY('shows'); g.fillStyle = '#9a9a9a'; g.fillText('SHOWS', 4, wy + 16);
    for (const b of blocks()) { g.fillStyle = '#303132'; g.fillRect(tx(b.a) + 1, wy, tx(b.b) - tx(b.a) - 2, wh); g.strokeStyle = '#4c4d4f'; g.lineWidth = 1; g.strokeRect(tx(b.a) + 1.5, wy + .5, tx(b.b) - tx(b.a) - 3, wh - 1);
      g.save(); g.beginPath(); g.rect(tx(b.a) + 1, wy, tx(b.b) - tx(b.a) - 4, wh); g.clip(); g.fillStyle = '#e7eaf1'; g.fillText((D.state.love[b.id] ? '♥ ' : '') + D.sceneName(b.id), tx(b.a) + 5, wy + 16); g.restore(); }
  }
  function drawTL(t) {
    if (!D.map || live() || !tg || tl.clientWidth <= 0) return;
    const W = tl.clientWidth, H = tl.clientHeight, d = root.devicePixelRatio || 1;
    if (tl.width !== Math.round(W * d)) { tl.width = Math.round(W * d); tl.height = Math.round(H * d); U.tlDirty = true; }
    if (U.tlDirty) { U.tlDirty = false; tlc.width = tl.width; tlc.height = tl.height; drawStatic(tcg, W, H, d); }
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, tl.width, tl.height); tg.drawImage(tlc, 0, 0); tg.setTransform(d, 0, 0, d, 0, 0);
    if (U.loop) { tg.fillStyle = 'rgba(85,176,140,.14)'; tg.fillRect(tx(U.loop.a), 0, tx(U.loop.b) - tx(U.loop.a), H); tg.fillStyle = '#55b08c'; tg.fillRect(tx(U.loop.a), 0, 1, H); tg.fillRect(tx(U.loop.b), 0, 1, H); }
    tg.fillStyle = '#fff'; tg.fillRect(tx(t), 0, 2, H);
  }
  const seek = t => { const p = player(); if (p && isFinite(p.duration || 1)) try { p.currentTime = Math.max(0, Math.min(dur(), t)); } catch (e) { /* fine */ } };
  let drag = null;
  tl.addEventListener('mousedown', e => {
    if (!D.map) return; const r = tl.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, t = Math.max(0, Math.min(dur(), txi(x))), [sy, sh] = laneY('sec');
    if (y >= sy - 3 && y <= sy + sh + 3) { for (const d of D.state.drops) if (Math.abs(tx(d.t) - x) < 8) { openDrop(d, e.clientX, e.clientY); return; }
      const si = D.sectionAt(t); D.select(D.sel === si ? null : si); seek(D.map.sections[si].a); U.loop = null; return; }
    const [wy, wh] = laneY('shows'); if (y >= wy && y <= wy + wh) { const b = blocks().find(z => t >= z.a && t < z.b); if (b) showWhy(b, e.clientX, e.clientY); return; }
    drag = { x0: x, t0: t }; });
  root.addEventListener('mousemove', e => { if (!drag) return; const x = e.clientX - tl.getBoundingClientRect().left; if (Math.abs(x - drag.x0) > 5) { const t = Math.max(0, Math.min(dur(), txi(x))); U.loop = { a: Math.min(drag.t0, t), b: Math.max(drag.t0, t) }; } });
  root.addEventListener('mouseup', e => { if (!drag) return; const x = e.clientX - tl.getBoundingClientRect().left; seek(Math.abs(x - drag.x0) <= 5 ? drag.t0 : U.loop.a); drag = null; });
  tl.addEventListener('dblclick', () => { U.loop = null; });
  function showWhy(b, cx, cy) {
    const lis = (D.listens[b.id] || []).map(i => SN[i].toLowerCase()).join(', ');
    popAt(cx - 20, cy - 200, `<h4>${esc(D.sceneName(b.id))} · ${fmt(b.a)}</h4><div>Why: ${esc(b.why || 'the Director chose it')}.</div><div class="note" style="margin-top:6px">This scene follows by itself: ${esc(lis || 'nothing in particular')}.</div><div class="row"><button data-w="love">${D.state.love[b.id] ? '♥ loved' : '♥ more of this'}</button><button data-w="never">never this scene</button><button class="ghost" data-x>close</button></div>`);
    const q = s => pop.querySelector(s); const lb = q('[data-w=love]'), nb = q('[data-w=never]');
    if (lb) lb.onclick = () => { D.setLove(b.id, !D.state.love[b.id]); closePop(); };
    if (nb) nb.onclick = () => { D.setSceneOn(b.id, false); closePop(); toast(D.sceneName(b.id) + ' is off for this set. Turn it back on under ⚙ Set.'); };
  }
  /* edits of one drop merge into one history entry; ticking never plays the song (only ▶ watch does) */
  function dropSet(d, fields) { D.setDrop(d.id, fields); }   /* core merges the history per drop */
  function openDrop(d, cx, cy) {
    const P = D.preset(), pd = P.drop || {}, must = d.must != null ? d.must : !!pd.mustChange, hit = d.hit || pd.hit || 'white flash', hits = HITS.slice(); if (!hits.includes(hit)) hits.push(hit);
    popAt(cx - 20, cy + 12, `<h4>◆ Drop ${fmt(d.t)}${d.user ? ' <span class="badge you">added by you</span>' : ''}</h4>
     <label class="opt"><input type="checkbox" data-d="must" ${must ? 'checked' : ''}> <b>Change the picture</b> on this drop</label>
     <div class="row"><span class="note">Hit</span><select data-d="hit">${hits.map(o => `<option ${o === hit ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>
     <details><summary class="note" style="cursor:pointer">more: pick the scene</summary><div class="row"><select data-d="sc"><option value="">set decides</option>${D.SCENES.filter(s => s.roles.includes('drop')).map(s => `<option value="${s.id}" ${s.id === d.scene ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div></details>
     <div class="row"><button class="pri" data-d="watch">▶ watch</button><button class="ghost" data-d="not">${d.notDrop ? 'it is a drop' : '✕ not a drop'}</button><button class="ghost" data-x>close</button></div>
     <div class="note">Saved for this drop in this song. The style's drop rule (${esc(P.name)}): ${pd.mustChange ? 'always change' : 'set decides'}, ${esc(pd.hit || 'white flash')}.</div>`);
    const q = s => pop.querySelector(s), mu = q('[data-d=must]'), hi = q('[data-d=hit]'), sc = q('[data-d=sc]'), wa = q('[data-d=watch]'), no = q('[data-d=not]');
    if (mu) mu.onchange = () => dropSet(d, { must: mu.checked });
    if (hi) hi.onchange = () => dropSet(d, { hit: hi.value });
    if (sc) sc.onchange = () => dropSet(d, { scene: sc.value || null });
    if (wa) wa.onclick = () => { closePop(); hear(d.t - 2.5, D.sectionAt(d.t)); };
    if (no) no.onclick = () => { dropSet(d, { notDrop: !d.notDrop }); closePop(); };
  }

  /* ---------- ⚙ Set: scenes, house rules, a file with all settings ---------- */
  let setOpenFlag = false;
  function renderSet() {
    const r = D.state.rules, rr = infoB.getBoundingClientRect(), dv = dir(), pinned = dv && dv.picked ? dv.picked() : dv && dv.pinned && dv.pinned() ? [dv.pinned()] : [];
    const html = `<div class="row" style="justify-content:space-between"><b>The set: ${esc(D.preset().name)}</b><button class="ghost" data-x>✕</button></div>
     <h4>Scenes</h4><div class="note">Click to switch off for this set. ♥ = more often. <button class="ghost" data-allon>All on</button></div>${D.scenesLeft() ? '' : '<div class="note" style="color:var(--accent,#ffb23d)">Every scene is off, so the Director uses all of them. Switch on the ones you want.</div>'}${pinned.length ? `<div class="note" style="color:var(--accent,#ffb23d)">The Director tab has ${pinned.length === 1 ? 'one scene' : pinned.length + ' scenes'} picked: <b>${pinned.map(id => esc((D.SCENES.find(s => s.id === id) || { name: id }).name)).join(', ')}</b>. It plays only ${pinned.length === 1 ? 'that one' : 'those'} and these switches do nothing. <button data-unpin>Back to Auto</button></div>` : ''}<div>${D.SCENES.map(s => `<span class="chip ${D.state.sceneOn[s.id] === false ? 'off' : ''}" data-son="${s.id}">${esc(s.name)}</span><span class="chip ${D.state.love[s.id] ? 'on' : ''}" data-love="${s.id}">♥</span>`).join(' ')}</div>
     <h4 style="margin-top:10px">House rules</h4><div style="line-height:2">${RULES.map(([k, n]) => `<span class="chip ${r[k] ? 'on' : ''}" data-rule="${k}">${r[k] ? 'on' : 'off'}</span> ${esc(n)}<br>`).join('')}</div>
     <h4 style="margin-top:10px">Settings file</h4><div class="row"><button data-set="export">Export</button><label class="note">Import <input type="file" accept=".json,application/json" data-set="import"></label></div>`;
    if (!pop.classList.contains('on') || U.popSet) { popAt(Math.max(8, rr.left - 300), 60, html, true); U.popSet = true; }
    const imp = pop.querySelector('[data-set=import]'), exp = pop.querySelector('[data-set=export]');
    if (exp) exp.onclick = () => { try { const u = URL.createObjectURL(new Blob([D.exportJSON()], { type: 'application/json' })), a = el('a'); a.href = u; a.download = 'desk-settings.json'; a.click(); } catch (e) { toast('Export did not work here.'); } };
    if (imp) imp.onchange = () => { const f = imp.files && imp.files[0]; if (f) f.text().then(tx_ => toast(D.importJSON(tx_) ? 'Settings imported.' : 'That file is not a desk settings file.')); };
  }
  setB.onclick = () => { setOpenFlag = !setOpenFlag; if (setOpenFlag) { U.popSet = true; renderSet(); } else { U.popSet = false; closePop(); } };
  pop.addEventListener('click', e => {
    const t = e.target, d = t.dataset || {}; if (!U.popSet) return;
    if (d.x !== undefined) { setOpenFlag = false; U.popSet = false; return; }
    if (d.unpin !== undefined) { const dv = dir(); if (dv && dv.unpin) dv.unpin(); renderSet(); }
    else if (d.allon !== undefined) D.allScenesOn();
    else if (d.son) D.setSceneOn(d.son, D.state.sceneOn[d.son] === false);
    else if (d.love) D.setLove(d.love, !D.state.love[d.love]);
    else if (d.rule) D.setRule(d.rule, !D.state.rules[d.rule]);
  });

  /* ---------- keys: K opens the desk; with the Director playing and the desk open: H hold, C calm, T tap, Enter drop, D drop here, Ctrl+Z undo ---------- */
  root.addEventListener('keydown', e => {
    if (e.metaKey || e.altKey) return;
    const t = e.target; if (t && t.closest && t.closest('textarea,select,[contenteditable],input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=button]):not([type=file])')) return;
    const k = String(e.key || '').toLowerCase();
    if (e.ctrlKey) { if (k === 'z' && U.open) { e.preventDefault(); doUndo(); } return; }
    if (k === 'k' && !e.repeat) { e.preventDefault(); e.stopPropagation(); setOpen(); return; }
    if (!U.open) return;
    if (k === 'escape') { e.stopPropagation();   /* the page's own Esc would also hide the music bar */
      if (pop.classList.contains('on') || setOpenFlag) { closePop(); setOpenFlag = false; U.popSet = false; return; }
      if (D.sel != null) { D.select(null); return; }
      if (toastE.classList.contains('on')) toastE.classList.remove('on');
      setOpen(false); return; }
    if (k === 'd' && !live() && D.map && !e.repeat) { const p = player(), t0 = p ? p.currentTime : 0, g = D.map.grid || {}, bar = g.bpm ? 240 / g.bpm : 0,
        s = bar ? Math.round((t0 - (g.t0 || 0)) / bar) * bar + (g.t0 || 0) : t0, at = Math.max(0, +s.toFixed(2)); D.addDrop(at); toast('Drop added at ' + fmt(at) + (bar ? ' (snapped to the bar)' : '') + '. Click its ◆ to change it.'); e.preventDefault(); return; }
    if (!dirOn() || e.repeat) return;
    const a = k === 'h' ? 'hold' : k === 'c' ? 'calm' : k === 't' ? 'tap' : k === 'enter' ? 'drop' : null;
    if (a) { e.preventDefault(); e.stopPropagation(); act[a](); }
    if (k === 'b') U.keyB = true;
  }, true);
  root.addEventListener('keyup', e => { if (String(e.key).toLowerCase() === 'b') U.keyB = false; });
  root.addEventListener('mousedown', e => { if (e.target === tl || (root.performance || Date).now() - U.popT < 150) return;
    if (pop.classList.contains('on') && !pop.contains(e.target) && !(e.target.closest && e.target.closest('[data-how],button'))) { closePop(); if (U.popSet) { U.popSet = false; setOpenFlag = false; } } });

  /* ---------- the frame loop: meters, lights, playhead, scene record, live tips ---------- */
  function lightOf(lvl, id, scene, si) {
    if (lvl < 0.3) return 'q';
    if (D.eff(id, si)[0] / 50 <= 0.3) return 'mute';
    return D.answered(id, scene, si) ? 'ok' : 'gap';
  }
  const setLight = (l, st) => { if (l._st !== st) { l._st = st; l.className = 'light ' + st; l.textContent = st === 'q' ? '·' : st === 'mute' ? '–' : st === 'ok' ? '●' : '!!'; l.title = ({ q: 'silent right now', mute: 'muted: the fader is low', ok: 'plays and the picture responds', gap: 'plays but the picture does not respond' })[st]; } };
  function frame(now) {
    if (!U.open) { U.raf = 0; return; }
    U.raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, ((now || 0) - U.last) / 1000 || 0); U.last = now || 0; U.tick += dt;
    const E = ENG(), p = player(), on = dirOn(), t = T(), sc = sceneId();
    if (on !== U.dirOn) { U.dirOn = on; steer.style.display = on ? 'none' : 'flex'; perf.style.opacity = on ? '' : '.4'; strips.style.opacity = on ? '' : '.75'; }
    if (!live()) D.t = t;
    if (!live() && U.loop && p && !p.paused && t > U.loop.b) { try { p.currentTime = U.loop.a; } catch (e) { /* fine */ } }
    /* which scene plays where, with the Director's reason */
    if (!live() && D.map && p && !p.paused && sc) { const s = Math.floor(t), cur = U.scn[s];
      if (!cur || cur.id !== sc) { const w = E.why && E.why[E.why.length - 1]; U.scn[s] = { id: sc, why: w && w.scene === sc ? w.why : null }; if (!cur) U.scnV++; U.tlDirty = true; } }
    if (E) { const h = perf.querySelector('[data-perf=hold]'); if (h) h.classList.toggle('on', !!E.hold); }
    nowE.textContent = (sc ? D.sceneName(sc) + (E && E.hold ? ' (held)' : '') : 'no scene yet') + ' · ' + (live() ? 'live' : D.map ? (D.map.sections[D.sectionAt(t)] ? (D.KNAME[D.map.sections[D.sectionAt(t)].k] || '') + ' ' + fmt(t) : fmt(t)) : fmt(t));
    /* meters + lights */
    const ear = (dir() || {}).EAR, si = curSi();
    for (const s of U.stripEls) {
      const ids = s.id ? [s.id] : D.STRIPS.filter(z => z.fam === s.fam).map(z => z.id);
      let top = 0, st = 'q';
      for (const id of ids) {
        const v = live() ? D.earLevel(id, ear) : (D.sig(id, t) || 0);
        if (v > top) top = v;
        const l = lightOf(v, id, sc, si);
        if (s.id) st = l; else if (l === 'gap') st = 'gap'; else if (l === 'ok' && st !== 'gap') st = 'ok'; else if (l === 'mute' && st === 'q') st = 'mute';
      }
      if (s.m) s.m.style.height = Math.round(Math.min(1, top) * 100) + '%';
      if (s.l) setLight(s.l, st);
    }
    if (live()) for (const z of D.STRIPS) { if (z.live === 'no') continue; const l = lightOf(D.earLevel(z.id, ear), z.id, sc, si);   /* gap time builds up, decays when answered; silence is neutral */
      if (l === 'gap') liveTip(z.id, dt); else if (l !== 'q') U.tips[z.id] = Math.max(0, (U.tips[z.id] || 0) - dt / 2); }
    drawTL(t);
    if (U.tick > 1) { U.tick = 0; markSavedIfDirty(); if (!live() && !U.drag && D.notices().map(x => x.key).join() !== U.noteSig) renderNotes(); if (U.scnV !== U.scnSeen) { U.scnSeen = U.scnV; U.tlDirty = true; } }
  }
  const markSavedIfDirty = () => { /* the desk saves on every change; nothing to do */ };
  function liveTip(id, dt) {
    U.tips[id] = (U.tips[id] || 0) + dt; if (U.tips[id] < 3 || U.tips['_' + id]) return; U.tips['_' + id] = 1; if (!U.tipBox) U.tipBox = el('div');
    const d = el('div', 'notice', `<div>${esc(SN[id])} plays, but the picture doesn't respond.</div><div class="row"><button class="pri">+20 ${esc(SN[id].toLowerCase())}</button></div>`);
    const b = d.querySelector('button'); if (b) b.onclick = () => { D.setValue(id, Math.min(100, Math.max(60, D.eff(id, D.phase)[0] + 20))); d.style.display = 'none'; U.tips['_' + id] = 0; U.tips[id] = 0; };
    U.tipBox.insertBefore(d, U.tipBox.firstChild); if (root.setTimeout) root.setTimeout(() => { d.style.display = 'none'; U.tips['_' + id] = 0; U.tips[id] = 0; }, 30000);
  }
  function startFrames() { if (!U.raf && U.open) U.raf = requestAnimationFrame(frame); }

  /* ---------- wiring ---------- */
  D.on('change', () => { markSaved(); if (U.drag) { U.tlDirty = true; return; } render(); });
  D.on('song', () => { U.scn = {}; buildFam(); U.tlDirty = true; render(); });
  D.on('mode', () => { U.loop = null; U.scn = {}; U.tips = {}; if (U.tipBox) U.tipBox.innerHTML = ''; render(); });
  D.on('select', () => { U.tlDirty = true; });
  const parent = host.parent || (document.getElementById('mbar') && document.getElementById('mbar').parentNode);
  const before = document.getElementById('mbar');
  if (parent) { if (parent.style) parent.style.gridTemplateRows = 'minmax(0,1fr) auto auto'; parent.insertBefore(R, before || null); }   /* the desk is a row between the view and the music bar */
  document.body.appendChild(pop);
  layout(); status(); if (U.open) { render(); startFrames(); }
  const ptr = root.setInterval ? root.setInterval(checkSource, 500) : 0; checkSource();
  const api = { R, U, render, frame, checkSource, loadSong, act, openDrop, showWhy, setOpen, toast, renderSet, stop: () => { if (ptr) root.clearInterval(ptr); } };
  root.DESK_UI.inst = api; return api;
}

const API = { mount };
root.DESK_UI = API;
if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
