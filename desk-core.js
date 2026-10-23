/* desk-core.js: the desk's brain. No DOM. window.DESK in the browser, module.exports in node.
   State (levels per set / per song), eff/gain/sig, scene listens, measured notices,
   Director config, drop rule, history with undo, save/load, export/import.
   Contract: DESK PLAN.md, "DESK (desk-core.js)". Scene names are the Director's scene ids. */
(function (root) {
'use strict';

const KEY = 'infinity-desk-v1';
const MERGE_MS = 2500;   // fast changes with the same key merge into one history entry
const GAP_MIN = 1.5;     // seconds a standing-out part must play without response before it is noticed
const PLAY_MIN = 0.3;    // signal level that counts as "plays"
const HIST_MAX = 300;

const PRESETS = root.DESK_PRESETS || (typeof require === 'function' ? require('./desk-presets.js') : []);
const clone = o => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
const fmt = t => { t = Math.max(0, t || 0); return Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0'); };

/* ---------- strips, families, hows ---------- */
const FAMS = [['drums', 'Drums', '#ffb23d'], ['bass', 'Bass', '#ff7a59'], ['voice', 'Voice', '#e58cff'], ['melody', 'Melody', '#7fd6ff'], ['harmony', 'Harmony', '#5fd3b8'], ['tension', 'Tension', '#ffe066']]
  .map(([id, name, colour]) => ({ id, name, colour }));
const STRIPS = [['kick', 'Kick', 'drums', 'ok'], ['snare', 'Snare / clap', 'drums', 'ok'], ['hats', 'Hats', 'drums', 'ok'], ['crash', 'Crash', 'drums', 'est'],
  ['sub', 'Sub', 'bass', 'ok'], ['bassline', 'Bassline', 'bass', 'est'], ['leadvox', 'Lead vocal', 'voice', 'est'], ['backing', 'Backing', 'voice', 'no'],
  ['lead', 'Lead line', 'melody', 'est'], ['chords', 'Chords / pads', 'harmony', 'ok'], ['risers', 'Risers', 'tension', 'est'], ['downlifters', 'Down-lifters', 'tension', 'est']]
  .map(([id, name, fam, live]) => ({ id, name, fam, live }));
const SN = Object.fromEntries(STRIPS.map(s => [s.id, s.name]));
const HOWS = {
  kick: ['size pulse', 'spring bounce', 'ring outward', 'zoom punch', 'light hit'], snare: ['change direction', 'turn step', 'light hit', 'shape change', 'glitch tear'],
  hats: ['sparks', 'shimmer', 'speed up', 'turning squares', 'gated strobe'], crash: ['shockwave', 'new shape', 'colour jump', 'white hit'],
  sub: ['size swell', 'thickness', 'brightness floor', 'camera pressure'], bassline: ['stepping movement', 'position shift with notes', 'shape morph', 'thick waves'],
  leadvox: ['big figure', 'face', 'glow', 'figure drawing', 'height by pitch'], backing: ['echoes/ghosts', 'repeats', 'halo'],
  lead: ['jumping dot (pitch = height)', 'line drawing', 'figure turns', 'branches light up'], chords: ['colour by chord', 'major warm / minor cool', 'slow breathing', 'background fill'],
  risers: ['zoom in', 'speed up', 'light rising', 'blur/glitch rising', 'accumulate'], downlifters: ['fall back', 'fade', 'slow down', 'scatter']
};
const KNAME = { intro: 'Intro', groove: 'Groove', breakdown: 'Breakdown', build: 'Build', drop: 'Drop', outro: 'Outro' };
const GLOBAL = ['kick', 'sub'];                       // the Director's own kick bump + feedback always answer these
const STANDOUT = ['leadvox', 'backing', 'risers'];    // always noticed; 'lead' only in intro/breakdown
const LEAD_KINDS = ['intro', 'breakdown'];

/* ---------- the Director's scenes (ids from show-director.js ENG_SCENE) ---------- */
const SCENES = [
  ['void', 'Void', ['calm']], ['portal', 'Portal', ['build', 'flow']], ['inversion', 'Inversion', ['drop']], ['accumulation', 'Accumulation', ['build']],
  ['puncture', 'Puncture', ['drop', 'build']], ['perimeter', 'Perimeter', ['calm']], ['tracer', 'Tracer', ['flow', 'build']], ['rings', 'Tunnel rings', ['flow', 'drop']],
  ['ripple', 'Ripple', ['flow']], ['rain', 'Rain', ['flow', 'build']], ['scanner', 'Scanner', ['build', 'flow']], ['shatter', 'Shatter', ['flow', 'build']],
  ['heartbeat', 'Heartbeat', ['calm', 'build']], ['static', 'Static', ['build']], ['corridor', 'Corridor', ['flow']], ['figures', 'Figures', ['calm', 'flow']],
  ['dynamo', 'Dynamo', ['build', 'drop']], ['core', 'Core', ['flow', 'drop']], ['arrivals', 'Arrivals', ['calm', 'build']], ['merger', 'Merger', ['calm', 'build']],
  ['blackhole', 'Black hole', ['calm', 'flow']], ['supernova', 'Supernova', ['build', 'drop']], ['sundive', 'Sun dive', ['build', 'flow']], ['celdeling', 'Celdeling', ['flow', 'build']],
  ['toonmerger', 'Comic merger', ['build', 'drop']], ['morphology', 'Morphology', ['calm', 'flow']]
].map(([id, name, roles]) => ({ id, name, roles }));
const SCENE_IDS = SCENES.map(s => s.id);
const sceneName = id => { const s = SCENES.find(x => x.id === id); return s ? s.name : String(id); };

/* what each scene follows by itself. Checked against the scene code in show-director.js (2026-10-23): a strip is listed when the scene reads its ear
   (kick = low onsets, snare = mid+presence onsets, hats = high onsets and the highs, sub = sub band / envelope / spring, bassline = the low band 90-200 Hz,
   lead = melody onsets and the mids, leadvox = the voice ear (Arrivals only), chords = harmony (chroma), risers = A.build). Intensity (A.I) is global, not a strip. */
const LISTENS = {
  void: ['hats', 'kick', 'snare', 'lead'], portal: ['snare', 'hats', 'lead'], inversion: ['snare', 'hats'], accumulation: ['hats'], puncture: ['kick', 'snare', 'lead'],
  perimeter: ['hats', 'sub'], tracer: ['kick', 'sub'], rings: ['kick', 'sub', 'lead'], ripple: ['kick', 'sub', 'lead'], rain: ['hats'], scanner: ['kick', 'hats', 'sub'],
  static: ['snare', 'kick', 'hats', 'sub'], corridor: ['kick', 'snare', 'hats'], shatter: ['kick', 'sub'], heartbeat: ['kick', 'sub', 'lead'], core: ['kick', 'sub', 'lead'],
  dynamo: ['kick', 'snare', 'hats', 'sub', 'lead'], figures: ['lead', 'chords'], arrivals: ['lead', 'leadvox', 'hats', 'sub', 'bassline'],
  merger: ['kick', 'snare', 'hats', 'sub', 'lead', 'risers'], blackhole: ['kick', 'snare', 'hats', 'sub', 'bassline', 'lead', 'risers'],
  supernova: ['kick', 'snare', 'sub', 'bassline', 'lead'], sundive: ['kick', 'snare', 'hats', 'sub', 'bassline', 'lead'],
  celdeling: ['kick', 'snare', 'hats', 'sub', 'lead'], toonmerger: ['kick', 'snare', 'sub', 'lead'], morphology: ['kick', 'snare', 'hats', 'sub', 'lead', 'chords']
};

/* ---------- state ---------- */
const SET_KEYS = ['preset', 'set', 'setKind', 'how', 'sceneOn', 'love', 'rules', 'master'];
const SONG_KEYS = ['song', 'sec', 'drops'];
const freshSet = () => ({ preset: 'director', set: {}, setKind: {}, how: {}, sceneOn: {}, love: {},
  rules: { bars: true, preBlack: true, white: true, loops: true, mono: true, ant: true }, master: {} });
const freshSong = () => ({ song: {}, sec: {}, drops: [] });
const pick = (o, keys) => Object.fromEntries(keys.map(k => [k, clone(o[k])]));

const DESK = {
  STRIPS, FAMS, HOWS, KNAME, SCENES, SCENE_IDS, GLOBAL, PRESETS, sceneName, fmt,
  listens: clone(LISTENS),
  mode: 'prep',
  phase: null,          // live: the Director's current phase (kind) so section-kind settings can apply
  sel: null,            // selected section index (prep): fader moves apply only there
  setId: 'director',
  map: null,            // the loaded song map
  state: Object.assign(freshSet(), freshSong()),
  history: [],
  storage: undefined,   // undefined = use localStorage when there is one; null = none; or an object with getItem/setItem
  t: 0
};
let songId = null, nextDropId = 1;
let store = { sets: {}, songs: {} };
let gaps = {}, dropObs = {}, rec = { t: null };
const listeners = { change: [], song: [], mode: [], select: [] };
DESK._now = () => Date.now();

const st = DESK.state;
const preset = () => PRESETS.find(p => p.id === st.preset) || PRESETS[0] || { id: 'director', name: 'Director default', strips: {} };
DESK.preset = preset;

/* ---------- events ---------- */
DESK.on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); return () => { listeners[ev] = listeners[ev].filter(f => f !== fn); }; };
DESK.emit = (ev, arg) => { for (const f of (listeners[ev] || []).slice()) { try { f(arg); } catch (e) { if (typeof console !== 'undefined') console.error(e); } } };

/* ---------- sections, levels ---------- */
const sections = () => (DESK.map && DESK.map.sections) || [];
DESK.sectionAt = (t, full) => {
  if (full) return DESK.sectionInfo(t);
  const s = sections(); if (!s.length) return null;
  for (let i = 0; i < s.length; i++) if (t < s[i].b) return i;
  return s.length - 1;
};

/* ---------- the plan: bars, planned changes, the energy curve (AUTO PLAN.md, contract A). Null without a map or in live mode ---------- */
let planC = null;                                    // { map, plan, secs, lvl, rate } cached per map; dropped on setSong / reset
const LVL_W = { kick: .22, sub: .14, bassline: .1, snare: .1, hats: .1, chords: .1, lead: .12, leadvox: .12 };
const LVL_PRIOR = { intro: .3, groove: .6, build: .5, drop: .95, breakdown: .3, outro: .5 };
const planOn = () => !!DESK.map && DESK.mode !== 'live';
const mkPlan = () => {
  const m = DESK.map, ss = (m.sections || []).filter(s => s && isFinite(s.a) && isFinite(s.b) && s.b > s.a);
  const g = m.grid, okGrid = !!g && g.bpm > 0, bar = okGrid ? 240 / g.bpm : 2, t0 = okGrid ? (g.t0 || 0) : 0;
  const dur = m.dur || (ss.length ? ss[ss.length - 1].b : 0);
  const snap = t => (okGrid ? t0 + Math.round((t - t0) / bar) * bar : t);   // section starts land on a bar line
  const secs = ss.map((s, i) => ({ k: s.k, a: i === 0 ? s.a : snap(s.a), b: 0, i }));
  for (let i = 0; i < secs.length; i++) secs[i].b = i + 1 < secs.length ? Math.max(secs[i + 1].a, secs[i].a) : Math.max(ss[i].b, secs[i].a);
  const entries = [], eps = 1e-6;
  secs.forEach((s, i) => {
    const prevK = i ? secs[i - 1].k : null;
    if (i && s.a > secs[i - 1].a + eps) {
      const trans = s.k === 'drop' ? 'drop' : s.k === 'build' ? 'swell' : s.k === 'breakdown' || s.k === 'intro' ? 'soft'
        : s.k === 'groove' && (prevK === 'breakdown' || prevK === 'build') ? 'anchor' : s.k === 'outro' ? 'outro' : 'cut';
      entries.push({ t: s.a, kind: 'section', k: s.k, prevK, trans, si: i });
    }
    if ((s.b - s.a) / bar + eps >= 12) for (let t = s.a + 8 * bar; t <= s.b - 4 * bar + eps; t += 8 * bar)
      entries.push({ t, kind: 'phrase', k: s.k, prevK, trans: s.k === 'build' ? 'build' : 'vary', si: i });
  });
  entries.sort((x, y) => x.t - y.t);
  return { plan: { dur, bar, t0, entries }, secs };
};
const mkLevel = (secs, dur) => {
  const m = DESK.map, rate = m.rate || 20, n = Math.ceil(dur * rate);
  if (!(n > 0)) return null;
  const strips = Object.keys(LVL_W).filter(id => m.env && m.env[id] && m.env[id].length > 0);
  const raw = new Float32Array(n);
  if (strips.length) {
    let ws = 0; for (const id of strips) ws += LVL_W[id];
    for (let i = 0; i < n; i++) { let v = 0; for (const id of strips) { const a = m.env[id]; if (i < a.length) v += LVL_W[id] * a[i]; } raw[i] = v / ws; }
    const so = Array.from(raw).sort((x, y) => x - y), p95 = so[Math.min(n - 1, Math.floor(.95 * (n - 1)))] || so[n - 1];
    if (p95 > 1e-6) for (let i = 0; i < n; i++) raw[i] = Math.min(1, raw[i] / p95);
  }
  const pre = new Float32Array(n + 1);               // prefix sums for the ~2 s centred smoothing
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + raw[i];
  const hw = Math.round(rate), lvl = new Float32Array(n);
  for (let i = 0; i < n; i++) { const lo = Math.max(0, i - hw), hi = Math.min(n, i + hw + 1); lvl[i] = (pre[hi] - pre[lo]) / (hi - lo); }
  const bar = DESK.plan().bar, sm = Float64Array.from(lvl);
  for (const s of secs) {
    const i0 = Math.max(0, Math.round(s.a * rate)), i1 = Math.min(n, Math.round(s.b * rate));
    if (i1 <= i0) continue;
    if (!strips.length) for (let i = i0; i < i1; i++) sm[i] = lvl[i] = LVL_PRIOR[s.k] != null ? LVL_PRIOR[s.k] : .5;   // no music data: the section priors only
    const L0 = lvl[i0];
    for (let i = i0; i < i1; i++) {
      const pos = (i - i0) / Math.max(1, i1 - i0 - 1), t = i / rate;
      let v = lvl[i];
      if (s.k === 'build') v = Math.max(v, L0 + (Math.max(.85, L0) - L0) * Math.min(1, pos / .95));
      else if (s.k === 'drop') { if (t - s.a < 8 * bar) v = Math.max(v, .9); }
      else if (s.k === 'breakdown') v = Math.min(v, .35);
      else if (s.k === 'intro') v = Math.min(v, .45);
      else if (s.k === 'outro') v *= 1 - Math.min(1, Math.max(0, (t - s.a) / Math.max(1e-6, dur - 1 / rate - s.a)));
      sm[i] = Math.min(1, Math.max(0, v));
    }
  }
  return sm;
};
const planGet = () => {
  if (!planOn()) return null;
  if (!planC || planC.map !== DESK.map) {
    planC = { map: DESK.map, lvl: null, rate: DESK.map.rate || 20 };
    const p = mkPlan(); planC.plan = p.plan; planC.secs = p.secs;
    planC.lvl = mkLevel(p.secs, p.plan.dur);
  }
  return planC;
};
DESK.plan = () => { const c = planGet(); return c ? c.plan : null; };
DESK.nextChange = (t, horizon) => { const c = planGet(); if (!c) return null; return c.plan.entries.find(e => e.t > t && e.t <= t + (horizon || 0)) || null; };
/* the section at t as an object. (DESK.sectionAt(t) itself stays the section INDEX for the UI; sectionAt(t, true) = this) */
DESK.sectionInfo = t => {
  const c = planGet(); if (!c || !c.secs.length) return null;
  const S = c.secs; let i = S.length - 1; for (let j = 0; j < S.length; j++) if (t < S[j].b) { i = j; break; }
  const s = S[i];
  return { k: s.k, a: s.a, b: s.b, i, pos: Math.min(1, Math.max(0, (t - s.a) / (s.b - s.a || 1))) };
};
DESK.level = t => {
  const c = planGet(); if (!c || !c.lvl) return null;
  return c.lvl[Math.min(c.lvl.length - 1, Math.max(0, Math.round(t * c.rate)))];
};
DESK.nextDropT = t => {
  if (!planOn()) return null;
  let best = null; for (const d of st.drops) if (!d.notDrop && d.t > t && (best == null || d.t < best)) best = d.t;
  return best;
};
const kindOf = si => (typeof si === 'string' ? si : (typeof si === 'number' && sections()[si] ? sections()[si].k : null));

/* precedence: section (this song) > whole song > set per section kind > set > style > 50. Live: set > style only
   (set per section kind too when a kind is given, from the Director's phase). */
DESK.eff = (id, si) => {
  const k = DESK.mode === 'live' && typeof si !== 'string' ? null : kindOf(si);   // live: a section kind only when given by name (Director phase)
  if (DESK.mode !== 'live') {
    if (typeof si === 'number' && st.sec[si] && st.sec[si][id] != null) return [st.sec[si][id], 'section'];
    if (st.song[id] != null) return [st.song[id], 'song'];
  }
  if (k && st.setKind[k] && st.setKind[k][id] != null) return [st.setKind[k][id], 'set'];
  if (st.set[id] != null) return [st.set[id], 'set'];
  const p = preset().strips && preset().strips[id];
  return [p ? p.fader : 50, 'style'];
};
DESK.gain = (id, t) => DESK.eff(id, DESK.mode === 'live' ? DESK.phase : DESK.sectionAt(t))[0] / 50;
DESK.sig = (id, t) => {
  if (DESK.mode === 'live' || !DESK.map || !DESK.map.env || !DESK.map.env[id]) return null;
  const a = DESK.map.env[id], i = Math.floor(t * (DESK.map.rate || 20));
  return i < 0 || i >= a.length ? 0 : a[i];
};
DESK.how = id => st.how[id] || (preset().strips && preset().strips[id] && preset().strips[id].how[0]) || HOWS[id][0];
DESK.master = k => (st.master[k] != null ? st.master[k] : (preset().master && preset().master[k] != null ? preset().master[k] : 50));
DESK.answered = (id, sceneId, si) => {
  const v = DESK.eff(id, si)[0];
  return v / 50 > 0.3 && ((DESK.listens[sceneId] || []).includes(id) || GLOBAL.includes(id) || v > 55);
};

/* ---------- measuring: record() + notices() ---------- */
DESK.resetMeasure = () => { gaps = {}; dropObs = {}; rec = { t: null }; };
const mustOf = d => (d.must != null ? d.must : !!(preset().drop && preset().drop.mustChange));
DESK.record = (t, sceneId, dt) => {
  if (!DESK.map || DESK.mode === 'live' || sceneId == null) return;
  if (dt == null) dt = (rec.t != null && t > rec.t && t - rec.t < 0.5) ? t - rec.t : 0;
  rec.t = t; DESK.t = t;
  const si = DESK.sectionAt(t);
  if (si != null && dt > 0) {
    const kind = kindOf(si);
    for (const id of STANDOUT.concat(['lead'])) {
      if (id === 'lead' && !LEAD_KINDS.includes(kind)) continue;
      const s = DESK.sig(id, t);
      if (s == null || s <= PLAY_MIN) continue;
      const g = gaps[si + ':' + id] || (gaps[si + ':' + id] = { si, id, first: t, scenes: {} });
      g.scenes[sceneId] = (g.scenes[sceneId] || 0) + dt;
    }
  }
  for (const d of st.drops) {            // the scene just before and just after each drop
    if (d.notDrop) continue;
    if (t >= d.t - 3 && t < d.t) dropObs[d.id] = { before: sceneId, after: null, must: false };
    else if (t >= d.t + 1 && t < d.t + 5) {
      const o = dropObs[d.id];
      if (o && o.before != null && o.after == null) { o.after = sceneId; o.must = mustOf(d); }
    }
  }
};
DESK.notices = () => {
  const out = [];
  for (const g of Object.values(gaps)) {
    const v = DESK.eff(g.id, g.si)[0];
    if (v / 50 <= 0.3) continue;                         // muted on purpose
    let bad = null;
    for (const [sc, sec] of Object.entries(g.scenes)) if (sec >= GAP_MIN && !DESK.answered(g.id, sc, g.si) && (!bad || sec > bad[1])) bad = [sc, sec];
    if (!bad) continue;
    const kind = KNAME[kindOf(g.si)] || 'song';
    out.push({ key: g.si + ':' + g.id, t: g.first, si: g.si, id: g.id, scene: bad[0],
      text: `${SN[g.id]} ${g.id === 'risers' ? 'play' : 'plays'} in the ${kind.toLowerCase()} (${fmt(g.first)}), but the picture doesn't respond.`, fix: 'follow' });
  }
  for (const d of st.drops) {
    const o = dropObs[d.id];
    if (d.notDrop || !o || o.before == null || o.after == null || o.before !== o.after) continue;
    if (mustOf(d) && !o.must) continue;                  // fixed since it was measured
    if (d.scene && d.scene !== o.before) continue;
    out.push({ key: 'd' + d.id, t: d.t, si: DESK.sectionAt(d.t), id: null, drop: d.id, scene: o.before,
      text: `The drop at ${fmt(d.t)} doesn't change the picture (${sceneName(o.before)} keeps running).`, fix: 'drop' });
  }
  return out.sort((a, b) => a.t - b.t);
};

/* ---------- history ---------- */
const snap = () => ({ songId, data: Object.assign(pick(st, SET_KEYS), pick(st, SONG_KEYS)) });
DESK.change = (label, by, where, fn, key) => {
  const before = snap();
  if (fn) fn();
  const last = DESK.history[DESK.history.length - 1], now = DESK._now();
  if (key && last && last.key === key && !last.undone && last.songId === songId && now - last.at < MERGE_MS) { last.text = label; last.where = where; last.at = now; }
  else {
    DESK.history.push({ id: now + '-' + DESK.history.length, text: label, by: by === 'claude' ? 'claude' : 'you', where, key: key || null, at: now,
      when: DESK.mode === 'live' ? 'live' : fmt(DESK.t), songId, before: before.data, undone: false });
    if (DESK.history.length > HIST_MAX) DESK.history.splice(0, DESK.history.length - HIST_MAX);
  }
  DESK.save();
  DESK.emit('change', { label, by, where });
};
DESK.undo = () => {
  const h = [...DESK.history].reverse().find(x => !x.undone);
  if (!h) return null;
  for (const k of SET_KEYS) st[k] = clone(h.before[k]);
  if (h.songId === songId) for (const k of SONG_KEYS) st[k] = clone(h.before[k]);
  h.undone = true;
  DESK.save();
  DESK.emit('change', { undo: h });
  return h;
};

/* ---------- editing helpers (all go through change) ---------- */
const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
const secLabel = si => { const s = sections()[si]; return s ? `${KNAME[s.k] || s.k} ${fmt(s.a)}` : 'section ' + si; };
const scopeWhere = () => DESK.mode === 'live' ? 'this set' : DESK.sel != null ? secLabel(DESK.sel) + ' (this song)' : 'whole song';
const put = (id, v) => {
  if (DESK.mode === 'live') st.set[id] = v;
  else if (DESK.sel != null) (st.sec[DESK.sel] = st.sec[DESK.sel] || {})[id] = v;
  else st.song[id] = v;
};
DESK.select = si => { DESK.sel = si == null || DESK.mode === 'live' ? null : si; DESK.emit('select', DESK.sel); DESK.emit('change', { select: true }); };
const curSi = () => (DESK.mode === 'live' ? DESK.phase : DESK.sel != null ? DESK.sel : DESK.sectionAt(DESK.t));
DESK.setValue = (id, v, o) => {
  o = o || {}; v = clamp(v);
  DESK.change(`${SN[id]} → ${v}`, o.by, scopeWhere(), () => put(id, v), o.key || ('f' + id + DESK.sel + DESK.mode));
};
DESK.setFamily = (fam, v, o) => {
  o = o || {};
  const ids = STRIPS.filter(s => s.fam === fam).map(s => s.id), si = curSi();
  void si; v = clamp(v);                                // every member gets exactly the family value (no offsets, no drift)
  DESK.change(`${FAMS.find(f => f.id === fam).name} family → ${v}`, o.by, scopeWhere(), () => ids.forEach(id => put(id, v)), o.key || ('fam' + fam + DESK.sel + DESK.mode));
};
DESK.resetValue = (id, o) => {
  DESK.change(`${SN[id]} back to the ${DESK.sel != null ? 'song' : 'set'} value`, (o || {}).by, 'reset', () => {
    if (DESK.mode === 'live') delete st.set[id];
    else if (DESK.sel != null && st.sec[DESK.sel]) { delete st.sec[DESK.sel][id]; if (!Object.keys(st.sec[DESK.sel]).length) delete st.sec[DESK.sel]; }
    else delete st.song[id];
  });
};
DESK.setHow = (id, opt, o) => DESK.change(`${SN[id]} shown as: ${opt}`, (o || {}).by, DESK.mode === 'live' ? 'this set' : 'this song', () => { st.how[id] = opt; });
DESK.setMaster = (k, v, o) => { v = clamp(v); DESK.change(`${k} → ${v}`, (o || {}).by, 'this set', () => { st.master[k] = v; }, (o || {}).key || 'm' + k); };
DESK.setSceneOn = (sc, on, o) => DESK.change(`scene ${sceneName(sc)} ${on ? 'on' : 'off'}`, (o || {}).by, 'set', () => { st.sceneOn[sc] = !!on; });
DESK.allScenesOn = o => DESK.change('all scenes on', (o || {}).by, 'set', () => { st.sceneOn = {}; });
DESK.scenesLeft = () => SCENE_IDS.filter(id => DESK.sceneWeight(id) > 0).length;   // 0 = every scene off: the Director then uses all of them
DESK.setLove = (sc, on, o) => DESK.change(`${on ? '♥' : 'no ♥'} ${sceneName(sc)}`, (o || {}).by, 'set', () => { st.love[sc] = !!on; });
DESK.setRule = (k, on, o) => DESK.change(`rule ${k} ${on ? 'on' : 'off'}`, (o || {}).by, 'set', () => { st.rules[k] = !!on; });
DESK.applyPreset = (id, o) => {
  const p = PRESETS.find(x => x.id === id); if (!p) return false;
  DESK.change('style → ' + p.name, (o || {}).by, 'this set', () => { st.preset = id; });
  return true;
};
DESK.addDrop = (t, o) => {
  o = o || {}; let d;
  DESK.change('added a drop at ' + fmt(t), o.by, 'this song', () => { d = { id: nextDropId++, t, hit: null, must: true, scene: null, notDrop: false, user: true }; st.drops.push(d); st.drops.sort((a, b) => a.t - b.t); });
  return d;
};
DESK.setDrop = (dropId, fields, o) => {
  const d = st.drops.find(x => x.id === dropId); if (!d) return false;
  const bits = Object.keys(fields).map(k => k === 'must' ? (fields.must ? 'change the picture' : 'keep the picture') : k === 'notDrop' ? (fields.notDrop ? 'is not a drop' : 'is a drop again') : `${k} = ${fields[k] == null ? 'set decides' : fields[k]}`);
  DESK.change(`drop ${fmt(d.t)}: ${bits.join(', ')}`, (o || {}).by, 'this drop', () => Object.assign(d, fields), (o || {}).key || ('drop:' + d.id));
  return true;
};
/* Promote names (UI: "Use in every song" = DESK.promoteSet; "every <kind> section" = DESK.promoteKind):
   promoteSet(o)  moves the selected section's values (or, with no section selected, the whole-song values) to the SET level = every song.
                  o.ids = only those strips. Overrides that would hide it (this song, the section kind) are removed for those strips.
   promoteKind(o) moves the selected section's values to the set level for every section of its kind (needs a selected section).
   promote(o)     old behaviour: section -> promoteKind, whole song -> set. Use promoteSet / promoteKind in new code. */
DESK.promoteSet = o => {
  o = o || {}; const si = DESK.sel, src = si != null ? (st.sec[si] || {}) : st.song;
  const ids = (o.ids || Object.keys(src)).filter(id => src[id] != null);
  if (!ids.length) return false;
  DESK.change(si != null ? 'made the section settings the default for every song' : 'made the song settings the default for every song', o.by, 'set', () => {
    for (const id of ids) {
      st.set[id] = src[id]; delete src[id];
      delete st.song[id];
      for (const k of Object.keys(st.setKind)) if (st.setKind[k]) { delete st.setKind[k][id]; if (!Object.keys(st.setKind[k]).length) delete st.setKind[k]; }
    }
    if (si != null && st.sec[si] && !Object.keys(st.sec[si]).length) delete st.sec[si];
  });
  return true;
};
DESK.promoteKind = o => {
  const si = DESK.sel; if (si == null) return false;
  const k = kindOf(si), by = (o || {}).by;
  DESK.change(`made the ${(KNAME[k] || k).toLowerCase()} settings the set default`, by, 'set', () => {
    st.setKind[k] = Object.assign(st.setKind[k] || {}, st.sec[si] || {}); delete st.sec[si];
  });
  return true;
};
DESK.promote = o => {
  const by = (o || {}).by;
  if (DESK.sel != null) {
    const si = DESK.sel, k = kindOf(si);
    DESK.change(`made the ${(KNAME[k] || k).toLowerCase()} settings the set default`, by, 'set', () => {
      st.setKind[k] = Object.assign(st.setKind[k] || {}, st.sec[si] || {}); delete st.sec[si];
    });
  } else {
    DESK.change('made the song settings the set default', by, 'set', () => { Object.assign(st.set, st.song); st.song = {}; });
  }
};
/* the fix buttons of a notice */
DESK.applyFix = (key, o) => {
  const n = DESK.notices().find(x => x.key === key); if (!n) return false;
  o = o || {};
  if (n.fix === 'drop') {
    const d = st.drops.find(x => x.id === n.drop), was = mustOf(d);
    const alt = (DESK.directorConfig().drop.scenes || []).find(s => s !== n.scene)
      || (SCENES.find(s => s.roles.includes('drop') && s.id !== n.scene && DESK.sceneWeight(s.id) > 0) || {}).id;   // Director default has no drop scenes: any drop-role scene
    DESK.setDrop(d.id, was && alt ? { must: true, scene: alt } : { must: true }, o);
  } else {
    DESK.sel = n.si;                                   // like the mockup: the section gets selected, the change applies only there
    DESK.setValue(n.id, Math.max(70, DESK.eff(n.id, n.si)[0]), o);
  }
  return true;
};

/* ---------- Director config ---------- */
DESK.sceneWeight = id => {
  const p = preset(), sc = p.scenes || {};
  if (st.sceneOn[id] === false || (sc.avoid || []).includes(id)) return 0;
  let w = 1;
  if ((sc.favour || []).includes(id)) w *= 2.5;
  if (st.love[id]) w *= 2;
  return w;
};
DESK.directorConfig = () => {
  const p = preset(), weights = {}, avoid = [];
  for (const id of SCENE_IDS) { weights[id] = DESK.sceneWeight(id); if (!weights[id]) avoid.push(id); }
  const d = p.drop || {};
  return {
    weights, avoid,
    darkness: Object.assign({ normal: 65, climax: 30 }, p.darkness),
    paceBars: (p.pace && p.pace.bars) || 8,
    drop: { hit: d.hit || 'white flash', mustChange: !!d.mustChange, scenes: (d.scenes || []).filter(s => weights[s] > 0) },
    palette: Object.assign({ colours: ['#fff0dc'], rule: 'monochrome white' }, p.palette),
    energy: DESK.master('energy'), flashes: DESK.master('flashes'), brightness: DESK.master('brightness'),
    rules: clone(st.rules)
  };
};
/* the drop whose time lies in (prevT, t] (not marked notDrop), else null. Prep + song only; null for a seek (backwards, or more than 1 s forward) */
DESK.dropDue = (prevT, t) => {
  if (DESK.mode === 'live' || !DESK.map || prevT == null || t == null || t < prevT || t - prevT > 1) return null;
  return st.drops.find(d => !d.notDrop && d.t > prevT && d.t <= t) || null;
};
DESK.dropRule = t => {
  const p = preset().drop || {}, base = { hit: p.hit || 'white flash', mustChange: !!p.mustChange, scene: null };
  let best = null;
  for (const d of st.drops) { const x = Math.abs(d.t - t); if (x <= 4 && (!best || x < best.x)) best = { d, x }; }
  if (!best) return base;
  const d = best.d;
  if (d.notDrop) return { hit: 'none', mustChange: false, scene: null, notDrop: true };
  const r = { hit: d.hit || base.hit, mustChange: d.must != null ? !!d.must : base.mustChange, scene: d.scene || null };
  if (d.must === false) r.keep = true;               // Wilco explicitly chose "keep the picture" (not just the style's default)
  return r;
};

/* ---------- song / mode ---------- */
const syncStore = () => {
  store.sets[DESK.setId] = pick(st, SET_KEYS);
  if (songId != null) store.songs[songId] = pick(st, SONG_KEYS);
};
const loadSongData = () => {
  const saved = songId != null && store.songs[songId];
  const d = saved ? clone(saved) : freshSong();
  if (!saved && DESK.map) d.drops = (DESK.map.drops || []).map(t => ({ id: 0, t, hit: null, must: null, scene: null, notDrop: false, user: false }));
  let mx = 0; for (const x of d.drops) if (x.id > mx) mx = x.id;
  for (const x of d.drops) if (!x.id) x.id = ++mx;
  nextDropId = mx + 1;
  for (const k of SONG_KEYS) st[k] = d[k] || freshSong()[k];
};
DESK.setSong = map => {
  if (songId != null) store.songs[songId] = pick(st, SONG_KEYS);
  DESK.map = map || null; songId = map ? map.id : null; planC = null;
  loadSongData();
  DESK.sel = null; DESK.resetMeasure();
  DESK.emit('song', DESK.map); DESK.emit('change', { song: true });
};
DESK.songId = () => songId;
DESK.setMode = m => {
  if (m !== 'prep' && m !== 'live') return;
  DESK.mode = m; DESK.sel = null; DESK.resetMeasure();
  DESK.emit('mode', m); DESK.emit('change', { mode: m });
};
DESK.setPhase = k => { DESK.phase = k; };

/* ---------- Director hooks: the ears tap (strip gains, song-map signals) and the "how" overlay ---------- */
const c01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const tp = [];                                   // [obj, key, raw, scaled, ...] what the last tap changed
const tap = { ear: null, songT: null, prev: {}, edge: {}, cr: [0, 0, 0, 0, 0, 0], lastBuild: null };
const setv = (o, k, v) => { const raw = o[k]; if (v === raw) return; o[k] = v; tp.push(o, k, raw, o[k]); };
/* the Director's own state (envelopes, springs, build) is recursive, so the tap must not stay in it: undo it before the next ears update.
   A value the Director rewrote since the tap (new bar's build, ...) is left alone */
DESK.untapEars = () => {
  for (let i = tp.length - 4; i >= 0; i -= 4) { const o = tp[i], k = tp[i + 1]; if (o[k] === tp[i + 3]) o[k] = tp[i + 2]; }
  tp.length = 0;
};
/* ear = the Director's EAR (A is the same object, accepted for the contract's signature); songT = seconds into the song or null (live);
   t = the Director's clock. Reads: band/env/spr 0 sub, 1 low, 2 mid, 3 presence, 4 high; on 0 kick, 1 snare, 2 hat; pe = melody / voice / part ears */
DESK.tapEars = (ear, A, songT, t) => {
  ear = ear || A; if (!ear || !ear.env) return;
  DESK.untapEars();
  const T = songT == null ? 0 : songT, now = t == null ? T : t, prep = songT != null && DESK.mode !== 'live' && !!DESK.map;
  const rawBuild = ear.build || 0;
  const g = {}; for (const s of STRIPS) g[s.id] = DESK.gain(s.id, T);
  const sg = id => (prep ? DESK.sig(id, T) : null);
  const Q = ear.pe && ear.pe.pv ? ear.pe : null;
  tap.ear = ear; tap.songT = songT;
  const edge = (id, thr) => {                     // a song-map signal rising through thr = an onset
    const s = sg(id); if (s == null) return false;
    const was = tap.prev[id] || 0; tap.prev[id] = s;
    if (s >= thr && was < thr && now - (tap.edge[id] || -9) > 0.08) { tap.edge[id] = now; return true; }
    return false;
  };
  const fire = i => { if (!ear.on[i]) { setv(ear.on, i, true); setv(ear.onT, i, now); } };
  const lift = (arr, i, v) => { if (v > arr[i]) setv(arr, i, v); };
  /* 1. the song map's part signals (stems) join what the ears hear */
  if (prep) {
    let s;
    if (edge('kick', 0.5)) fire(0);
    if ((s = sg('kick')) != null) lift(ear.env, 1, s);
    if ((s = sg('sub')) != null) { lift(ear.band, 0, s); lift(ear.env, 0, s); }
    if ((s = sg('bassline')) != null) { lift(ear.band, 1, s); lift(ear.env, 1, s); }
    if (edge('snare', 0.5)) fire(1);
    if (edge('hats', 0.5)) fire(2);
    if ((s = sg('hats')) != null) lift(ear.env, 4, s * 0.8);
    if (edge('crash', 0.6) && g.crash > 0.3) { fire(2); lift(ear.env, 4, 1); lift(ear.band, 4, 1); }
    if ((s = sg('chords')) != null) lift(ear.env, 2, s * 0.5);
    if ((s = sg('lead')) != null) {
      lift(ear.env, 2, s * 0.8);
      if (Q && edge('lead', 0.4)) { setv(Q, 'on', true); setv(Q, 'str', Math.max(0.5, s)); }
    }
    if (Q && (s = sg('leadvox')) != null) { if (s * 9 > Q.voice) setv(Q, 'voice', s * 9); if (s > 0.3 && !Q.vOn) setv(Q, 'vOn', true); }
    if ((s = sg('risers')) != null && s > (ear.build || 0)) setv(ear, 'build', c01(s));
    if ((s = sg('downlifters')) != null && s * Math.min(1, g.downlifters) > (ear.build || 0)) setv(ear, 'build', c01(s * Math.min(1, g.downlifters)));
  }
  /* 2. the strip faders: gain 0..2 on what each strip's ear feeds (onsets thin out by gain, levels scale) */
  const pass = (i, gn) => { if (gn >= 1) return true; if (gn <= 0.001) return false; tap.cr[i] += gn; if (tap.cr[i] >= 1) { tap.cr[i] -= 1; return true; } return false; };
  const scale = (arr, i, gn, cap) => { if (gn !== 1) setv(arr, i, Math.min(cap, arr[i] * gn)); };
  const gm = Math.max(g.leadvox, g.lead, g.chords), gp = Math.max(g.snare, g.leadvox);
  const gs = [g.sub, g.bassline, gm, gp, g.hats];
  for (let b = 0; b < 5; b++) { scale(ear.band, b, gs[b], 1); scale(ear.env, b, gs[b], 1.6); scale(ear.spr, b, gs[b], 1.8); }
  scale(ear.env, 1, g.kick, 1.6); scale(ear.spr, 1, g.kick, 1.8);          // kick: the low level too, not only the onsets
  if (ear.on[2] && g.crash !== 1) {                                         // crash: a high-band spike on a hat onset, scaled by its gain (0 = none, 2 = double)
    const m = 1 + (g.crash - 1) * 0.6;
    setv(ear.env, 4, Math.min(1.6, Math.max(ear.env[4], 0.5) * m)); setv(ear.band, 4, Math.min(1, Math.max(ear.band[4], 0.5) * m));
    if (g.crash <= 0.001 && ear.env[4] > 0.8) setv(ear.on, 2, false);
  }
  [g.kick, g.snare, g.hats].forEach((gn, i) => { if (ear.on[i] && !pass(i, gn)) setv(ear.on, i, false); });
  if (Q) {
    if (Q.on && !pass(3, g.lead)) setv(Q, 'on', false); else scale(Q, 'str', g.lead, 1.5);
    if (Q.lon && !pass(4, g.kick)) setv(Q, 'lon', false);
    if (Q.aon && !pass(5, g.hats)) setv(Q, 'aon', false);
    scale(Q, 'voice', g.leadvox, 18);
    if (Q.vOn && g.leadvox <= 0.3) setv(Q, 'vOn', false);
    if (Q.rise) { scale(Q.rise, 0, g.hats, 20); scale(Q.rise, 1, g.sub, 20); }
  }
  /* down-lifters: a falling build falls by gain x its fall (0 = held, 2 = twice as fast) */
  const bNow = rawBuild, bPrev = tap.lastBuild;
  tap.lastBuild = bNow;
  if (bPrev != null && ear.build < bPrev - 0.002 && bNow < bPrev - 0.002 && g.downlifters !== 1) setv(ear, 'build', c01(bPrev - (bPrev - bNow) * g.downlifters));
  if (g.risers !== 1) setv(ear, 'build', c01((ear.build || 0) * g.risers));
};

/* the "how" layer: for a strip with a value over 55 whose sound the scene does not follow by itself, draw its chosen how on top of the picture.
   api = {N, put(x, y, v), get(x, y), flash?(t)}; v 0..1. Flashes (a whole-panel hit) stay under 3 a second and respect the flashes master. */
const HOW_PRIM = {
  'size pulse': 'ring', 'spring bounce': 'ring', 'ring outward': 'burst', 'zoom punch': 'frame', 'light hit': 'flash',
  'change direction': 'spin', 'turn step': 'spin', 'shape change': 'shape', 'glitch tear': 'tear',
  sparks: 'sparks', shimmer: 'twinkle', 'speed up': 'sweep', 'turning squares': 'spin', 'gated strobe': 'flash',
  shockwave: 'burst', 'new shape': 'shape', 'colour jump': 'frame', 'white hit': 'flash',
  'size swell': 'ring', thickness: 'frame', 'brightness floor': 'glow', 'camera pressure': 'frame',
  'stepping movement': 'dot', 'position shift with notes': 'dot', 'shape morph': 'shape', 'thick waves': 'burst',
  'big figure': 'figure', face: 'figure', glow: 'glow', 'figure drawing': 'line', 'height by pitch': 'dot',
  'echoes/ghosts': 'echo', repeats: 'echo', halo: 'frame',
  'jumping dot (pitch = height)': 'dot', 'line drawing': 'line', 'figure turns': 'spin', 'branches light up': 'twinkle',
  'colour by chord': 'glow', 'major warm / minor cool': 'glow', 'slow breathing': 'ring', 'background fill': 'glow',
  'zoom in': 'zoomin', 'light rising': 'rise', 'blur/glitch rising': 'tear', accumulate: 'twinkle',
  'fall back': 'fall', fade: 'glow', 'slow down': 'sweep', scatter: 'sparks'
};
const ov = { rings: [], pulse: {}, flashes: [], last: null, shape: 0, row: 0, heard: {}, cur: null };
const OV_NONE = ['merger', 'blackhole', 'supernova', 'sundive', 'celdeling', 'toonmerger', 'morphology', 'arrivals'];   // the Director's stories (ENG_STORIES)
const flashOk = (api, now) => {
  if (DESK.master('flashes') <= 0) return false;
  while (ov.flashes.length && now - ov.flashes[0] > 1) ov.flashes.shift();
  if (ov.flashes.length >= 3 || (api.flash && !api.flash(now))) return false;
  ov.flashes.push(now); return true;
};
/* what a strip does now: lvl 0..1, hit = an onset this frame, from the (tapped) ears and the song map */
const stripSig = (id, e, T) => {
  const Q = e.pe && e.pe.pv ? e.pe : {};
  let lvl = 0, hit = false;
  switch (id) {
    case 'kick': lvl = e.env[1]; hit = !!e.on[0]; break;
    case 'sub': lvl = e.env[0]; break;
    case 'snare': lvl = e.env[3]; hit = !!e.on[1]; break;
    case 'hats': lvl = e.env[4]; hit = !!e.on[2]; break;
    case 'crash': lvl = e.env[4]; hit = !!e.on[2] && e.env[4] > 0.8; break;
    case 'bassline': lvl = e.env[1]; hit = !!Q.lon; break;
    case 'leadvox': lvl = c01((Q.voice || 0) / 9); hit = !!Q.vOn; break;
    case 'lead': lvl = e.env[2]; hit = !!Q.on; break;
    case 'chords': lvl = e.env[2] * 0.7; break;
    case 'risers': lvl = e.build || 0; break;
  }
  const s = DESK.sig(id, T); if (s != null && s > lvl) lvl = s;
  return { lvl: c01(lvl), hit };
};
/* what a strip hears right now, 0..1, from the Director's ears (live meters; the desk's own drawer reads this). downlifters and backing have no ear */
DESK.earLevel = (id, ear) => {
  ear = ear || tap.ear;
  if (!ear || !ear.env || id === 'downlifters' || id === 'backing') return 0;
  return stripSig(id, ear, tap.songT == null ? 0 : tap.songT).lvl;
};
DESK.overlay = (api, t, sceneId) => {
  const ear = tap.ear; if (!api || !ear || !api.N) return;
  const T = tap.songT == null ? 0 : tap.songT, N = api.N, dt = ov.last == null || t < ov.last ? 0.016 : Math.min(0.1, t - ov.last);
  ov.last = t;
  if (OV_NONE.includes(sceneId)) { ov.rings.length = 0; ov.cur = null; return; }   // a story is a whole picture of its own: nothing drawn on top
  const L = DESK.listens[sceneId] || [], put = (x, y, v) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < N && y < N && v > 0.01) api.put(x, y, Math.min(1, v)); };
  const h = (N - 1) / 2, sqr = (cx, cy, r, v) => { r = Math.round(r); if (r < 1) { put(cx, cy, v); return; } for (let i = -r; i <= r; i++) { put(cx + i, cy - r, v); put(cx + i, cy + r, v); put(cx - r, cy + i, v); put(cx + r, cy + i, v); } };
  const dia = (cx, cy, r, v) => { r = Math.round(r); for (let i = 0; i <= r; i++) { put(cx + i, cy - r + i, v); put(cx - i, cy - r + i, v); put(cx + i, cy + r - i, v); put(cx - i, cy + r - i, v); } };
  /* one how at a time, so it never piles up: the highest fader among the strips the scene does not follow that plays now;
     it stays chosen while its sound played in the last 2 s */
  const cand = [];
  for (const s of STRIPS) {
    const id = s.id, v = DESK.gain(id, T) * 50;
    if (v <= 55 || L.includes(id)) continue;
    const sig = stripSig(id, ear, T);
    if (sig.hit || sig.lvl > 0.08) ov.heard[id] = t;
    cand.push({ id, v, sig });
  }
  const live = cand.filter(c => ov.heard[c.id] != null && t - ov.heard[c.id] < 2 && t >= ov.heard[c.id]);
  if (!live.some(c => c.id === ov.cur)) ov.cur = live.length ? live.reduce((a, b) => b.v > a.v ? b : a).id : null;
  for (const { id, v, sig } of cand) {
    if (id !== ov.cur) continue;
    const k = c01(0.2 + (v - 55) / 110), prim = HOW_PRIM[DESK.how(id)] || 'glow';
    const pu = ov.pulse[id] = sig.hit ? 1 : (ov.pulse[id] || 0) * Math.exp(-dt / 0.18), lv = Math.max(sig.lvl, pu);
    switch (prim) {
      case 'ring': sqr(h, h, h * (0.15 + 0.7 * lv), k * 0.8); break;
      case 'burst': if (sig.hit) ov.rings.push({ t0: t, k }); break;
      case 'frame': sqr(h, h, h, k * (0.15 + 0.85 * lv)); break;
      case 'glow': { const r = Math.round(h * 0.45); for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) put(h + x, h + y, k * 0.3 * lv); break; }
      case 'flash': if (sig.hit && flashOk(api, t)) ov.rings.push({ t0: t, k, flash: true }); break;
      case 'spin': if (sig.hit) ov.shape = (ov.shape + 1) % 4; if (lv > 0.05) { const r = 2 + h * 0.4 * lv; ov.shape % 2 ? dia(h, h, r, k) : sqr(h, h, r, k); } break;
      case 'shape': if (sig.hit) ov.shape = (ov.shape + 1) % 3; if (lv > 0.05) { const r = h * (0.2 + 0.5 * lv); ov.shape === 0 ? sqr(h, h, r, k) : ov.shape === 1 ? dia(h, h, r, k) : (sqr(h, h, r, k * 0.6), dia(h, h, r, k * 0.6)); } break;
      case 'tear': if (sig.hit || lv > 0.6) { const n = 1 + Math.floor(lv * 3); for (let j = 0; j < n; j++) { const y = Math.floor(Math.random() * N), x0 = Math.floor(Math.random() * N), w = 2 + Math.floor(Math.random() * N / 2); for (let x = x0; x < x0 + w; x++) put(x, y, k); } } break;
      case 'sparks': if (sig.hit) { const n = 2 + Math.round(4 * k); for (let j = 0; j < n; j++) put(Math.random() * N, Math.random() * N, k); } break;
      case 'twinkle': { let n = lv * 3 * k * dt * 60; while (n > 0) { if (Math.random() < Math.min(1, n)) put(Math.random() * N, Math.random() * N, k * 0.7); n -= 1; } break; }
      case 'sweep': { const x = ((t * (0.5 + 2 * lv)) % 1) * N; for (let y = 0; y < N; y++) put(x, y, k * lv); break; }
      case 'dot': { const m = DESK.map && DESK.map.pitch && DESK.map.pitch[id === 'bassline' ? 'bass' : 'lead']; let p = lv; if (m && tap.songT != null) { const i = Math.floor(tap.songT * (DESK.map.rate || 20)); if (i >= 0 && i < m.length) p = m[i]; }
        if (sig.hit || ov.row === 0) ov.row = N - 1 - Math.round(c01(p) * (N - 1)); if (lv > 0.05) { put(h, ov.row, k); put(h + 1, ov.row, k); } break; }
      case 'line': { const x1 = ((t * 0.5) % 1) * N; for (let x = 0; x <= x1; x++) put(x, h + Math.sin(x * 0.5) * 2 * lv, k * lv); break; }
      case 'figure': if (lv > 0.05) { dia(h, h, h * (0.3 + 0.6 * lv), k); put(h - 2, h - 1, k); put(h + 2, h - 1, k); } break;
      case 'echo': if (lv > 0.05) { sqr(h - 1, h - 1, h * 0.5 * lv + 1, k * 0.35); sqr(h + 1, h + 1, h * 0.7 * lv + 1, k * 0.2); } break;
      case 'rise': { const top = N - Math.round(lv * N); for (let y = N - 1; y >= top; y--) for (let x = 0; x < N; x += 2) put(x + (y % 2), y, k * 0.5); break; }
      case 'fall': { const bot = Math.round(lv * N); for (let y = 0; y < bot; y++) for (let x = 0; x < N; x += 2) put(x + (y % 2), y, k * 0.5); break; }
      case 'zoomin': if (lv > 0.05) sqr(h, h, h * (1 - lv * 0.9), k * 0.8); break;
    }
  }
  /* rings (bursts, shockwaves) and flashes fade by age */
  ov.rings = ov.rings.filter(r => {
    const age = t - r.t0;
    if (r.flash) { if (age > 0.12) return false; const a = r.k * 0.6 * (1 - age / 0.12), c = Math.round(h * 0.7); for (let y = -c; y <= c; y++) for (let x = -c; x <= c; x++) put(h + x, h + y, a); return true; }
    if (age > 0.8) return false;
    sqr(h, h, age * N * 1.2, r.k * (1 - age / 0.8)); return true;
  });
};

/* ---------- save / load / export / import ---------- */
const getStorage = () => { if (DESK.storage !== undefined) return DESK.storage; try { return root.localStorage || null; } catch (e) { return null; } };
DESK.save = () => {
  syncStore();
  try { const s = getStorage(); if (s) { s.setItem(KEY, JSON.stringify(store)); return true; } } catch (e) { /* no storage: fine */ }
  return false;
};
const applyStore = obj => {
  if (!obj || typeof obj !== 'object' || (!obj.sets && !obj.songs)) return false;
  store = { sets: clone(obj.sets) || {}, songs: clone(obj.songs) || {} };
  const s = store.sets[DESK.setId];
  if (s) { const f = freshSet(); for (const k of SET_KEYS) st[k] = s[k] != null ? s[k] : f[k]; st.rules = Object.assign(f.rules, st.rules); }
  loadSongData();
  return true;
};
DESK.load = () => {
  try { const s = getStorage(); const raw = s && s.getItem(KEY); if (!raw) return false; const ok = applyStore(JSON.parse(raw)); if (ok) DESK.emit('change', { load: true }); return ok; }
  catch (e) { return false; }
};
DESK.exportJSON = () => { syncStore(); return JSON.stringify({ version: 1, sets: store.sets, songs: store.songs }, null, 1); };
DESK.importJSON = text => {
  try { const ok = applyStore(typeof text === 'string' ? JSON.parse(text) : text); if (ok) { DESK.save(); DESK.emit('change', { import: true }); } return ok; }
  catch (e) { return false; }
};
/* back to factory state (tests, "reset all") */
DESK.reset = () => {
  Object.assign(st, freshSet(), freshSong());
  DESK.history.length = 0; DESK.map = null; planC = null; songId = null; nextDropId = 1; store = { sets: {}, songs: {} };
  DESK.mode = 'prep'; DESK.sel = null; DESK.phase = null; DESK.t = 0; DESK.resetMeasure();
  tp.length = 0; tap.ear = null; tap.songT = null; tap.prev = {}; tap.edge = {}; tap.cr.fill(0); tap.lastBuild = null;
  ov.rings = []; ov.flashes = []; ov.pulse = {}; ov.last = null; ov.row = 0;
};

DESK.load();
root.DESK = DESK;
if (typeof module !== 'undefined' && module.exports) module.exports = DESK;
})(typeof window !== 'undefined' ? window : globalThis);
