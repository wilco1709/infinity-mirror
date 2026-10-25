/* scenes.js: window.INF_SCENES, the ONE registry of everything that can play (STRUCTURE PLAN.md, step 6).
   Every plain visual, Epic scene, Text show scene, whole show and Hand and Cube scene has the same card here. The conductor's pools, the library's sets and the
   "New set" builder read cards from this registry instead of each building their own list. The drawing code stays where it is; a card only DESCRIBES it.

   THE SCENE CARD
   {
     key       'pat:38' | 'scene:55:void' | 'story:55:merger' | 'scene:49:0' | 'set:55' | 'story:58'     unique, and the library's own key (a set stores it), see "Keys".
     id        the name the player knows it by: the pattern number, an Epic scene id ('void'), a Text show index ('0')            (string or number)
     name      what the person sees on a chip
     kind      'visual'  one plain shader picture (Visuals tab)
               'scene'   one scene of a show (an Epic scene, a Text show scene, a Hand and Cube scene)
               'show'    a whole show or story that directs itself (Text show, Tunnel show, Epic, VJ clips, Mandelbrot dive, Hand and Cube)
     energy    0..1  how much happens in it: .1 sparse and quiet, .5 steady, .9 full tilt. The conductor picks the scene whose energy fits the music's level.
     role      ['calm','flow','build','drop']  where in the music it belongs: calm = breakdowns and soft passages, flow = the music running,
               build = loading towards a drop, drop = the moment a drop hits.  More than one is fine.
     bars      [min, max]  how many bars it likes to stay (the conductor still snaps to phrases and Calm <-> Busy scales it)
     entry, exit   OPTIONAL. The states it starts and ends in (Epic: 'dark', 'dot', 'outline', 'frame', 'light', 'inverted', 'chaos'); a bridge joins two scenes whose states differ.
     hooks     what it REACTS to, so the person (and the builder) can see what a scene listens to. Names are real objects:
               FEEL.kick FEEL.snare FEEL.hat FEEL.mel   the hit-latched pulses 0..1 (feel.js)       FEEL.str  the strength of the last kick
               FEEL.spring  the follow-through spring       MUSIC.bands  bass / mid / high levels     MUSIC.beat  the beat and bar clock
               MUSIC.drop  MUSIC.build  MUSIC.lull          MUSIC.melody  the note the melody is on
     params    its OWN look sliders (size, count, shape): [{k, label, def, min, max, step, unit?}]. A scene whose settings are rolled by a director lists them as {k, rolled:true}.
               Never a General value (brightness, white, flash, speed of change): those are General, one place.
     source    where its code lives, for the next person: 'visual-params.js', 'show-director.js engScene', 'show-one-ring.js' ...
     ref       how to play it: {pat}, {pat, scene}, {pat, story}, {pat, adv}. What library.play() takes.
     -- optional --
     w         weight in a draw (1, rarer scenes less)      cover  ['bass','mids','highs'] the parts of the music it shows      desc   one line      group   the heading it lives under
     estimated true when energy, role or bars were guessed (not taken from the scene itself); estimatedFields says which
   }

   Keys: 'pat:<n>' visuals, 'scene:<pat>:<id>' scenes, 'story:<pat>[:<id>]' stories and Hand and Cube scenes, 'set:<pat>' shows. These are the library's keys (library-ui, sets, favourites),
   so a card can be dropped into a set as it is.

   Using it:
     INF_SCENES.add(card)                      register one (a show file does this for its own scenes: see templates/scene-template.js)
     INF_SCENES.get(key) / .local(pat, id)     one card
     INF_SCENES.list(kind?) / .search(q, kind) arrays of cards
     INF_SCENES.groups(kind?)                  [{kind, group, cards}] for a chooser
     INF_SCENES.cand(card, {local, extra})     the conductor's candidate: {key, name, energy, role, bars, w, cover, card}
     INF_SCENES.pool(filter, {local})          candidates of every card the filter accepts
     INF_SCENES.counts() / .problems()         how many per kind / cards that break the schema (none expected)
   Adapters (build the registry from what the page already has): fromVisualParams, fromEpic, fromShows. */
(function (root) {
'use strict';
const KINDS = ['visual', 'scene', 'show'], ROLES = ['calm', 'flow', 'build', 'drop'];
const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
const HOOK_NAMES = ['FEEL.kick', 'FEEL.snare', 'FEEL.hat', 'FEEL.mel', 'FEEL.str', 'FEEL.spring', 'MUSIC.bands', 'MUSIC.beat', 'MUSIC.drop', 'MUSIC.build', 'MUSIC.lull', 'MUSIC.melody'];

/* What a card has to have. Returns a list of problems (empty = fine). */
function check(c) {
  const p = [];
  if (!c || typeof c !== 'object') return ['not an object'];
  if (typeof c.key !== 'string' || !c.key) p.push('key');
  if (typeof c.name !== 'string' || !c.name) p.push('name');
  if (!KINDS.includes(c.kind)) p.push('kind');
  if (typeof c.energy !== 'number' || !isFinite(c.energy) || c.energy < 0 || c.energy > 1) p.push('energy');
  if (!Array.isArray(c.role) || !c.role.length || c.role.some(r => !ROLES.includes(r))) p.push('role');
  if (!Array.isArray(c.bars) || c.bars.length !== 2 || c.bars.some(b => typeof b !== 'number' || !(b > 0)) || c.bars[0] > c.bars[1]) p.push('bars');
  if (!Array.isArray(c.hooks) || c.hooks.some(h => typeof h !== 'string')) p.push('hooks');
  if (!Array.isArray(c.params)) p.push('params');
  if (typeof c.source !== 'string' || !c.source) p.push('source');
  if (!c.ref || typeof c.ref !== 'object' || c.ref.pat == null) p.push('ref');
  if (c.estimated && !Array.isArray(c.estimatedFields)) p.push('estimatedFields');
  return p;
}

/* fill in what a card leaves out and say what was guessed */
function norm(c) {
  const o = Object.assign({}, c), est = [];
  if (o.id == null) o.id = o.key;
  if (typeof o.energy !== 'number' || !isFinite(o.energy)) { o.energy = .5; est.push('energy'); } else o.energy = clamp(o.energy);
  if (typeof o.role === 'string') o.role = o.role.split(/[\s,]+/).filter(Boolean);
  if (!Array.isArray(o.role) || !o.role.length) { o.role = ['flow']; est.push('role'); }
  if (typeof o.bars === 'number') o.bars = [o.bars, o.bars];
  if (Array.isArray(o.bars) && o.bars.length > 2) o.bars = [Math.min(...o.bars), Math.max(...o.bars)];
  if (!Array.isArray(o.bars) || o.bars.length !== 2) { o.bars = [8, 16]; est.push('bars'); }
  if (!Array.isArray(o.hooks)) o.hooks = [];
  if (!Array.isArray(o.params)) o.params = [];
  if (o.w == null) o.w = 1;
  if (est.length) { o.estimated = true; o.estimatedFields = Array.from(new Set((o.estimatedFields || []).concat(est))); }
  else if (o.estimated && !o.estimatedFields) o.estimatedFields = [];
  if (o.estimated === false) delete o.estimated;
  return o;
}

/* The numbers behind the plain visuals and the shows have never been written down (they are shader code): estimated by ear from what each one does.
   [energy, roles, hooks]. Marked estimated:true on the card; change them here when you know better. */
const EST = {
  1: [.6, 'flow', ['MUSIC.bands']], 2: [.55, 'flow drop', ['MUSIC.bands', 'FEEL.kick']], 3: [.5, 'flow', ['MUSIC.bands']],
  24: [.35, 'calm flow', ['MUSIC.bands']], 25: [.4, 'calm flow', ['MUSIC.bands']], 26: [.4, 'calm flow', ['MUSIC.bands']], 27: [.45, 'flow', ['MUSIC.bands', 'MUSIC.melody']],
  28: [.4, 'calm flow', ['MUSIC.bands']], 29: [.6, 'flow drop', ['MUSIC.bands']],
  37: [.35, 'calm flow', ['MUSIC.beat']], 38: [.6, 'flow drop', ['MUSIC.beat', 'FEEL.kick']], 47: [.55, 'flow', ['MUSIC.beat', 'FEEL.kick']], 39: [.55, 'flow', ['MUSIC.beat', 'FEEL.kick']],
  40: [.7, 'build flow', ['MUSIC.bands', 'MUSIC.build']], 41: [.5, 'flow', ['MUSIC.bands']], 42: [.75, 'build drop', ['MUSIC.melody', 'MUSIC.drop']],
  44: [.4, 'calm flow', ['MUSIC.bands']], 45: [.3, 'calm', ['MUSIC.bands']], 53: [.7, 'flow drop', ['MUSIC.beat', 'MUSIC.drop']], 54: [.6, 'flow build', ['MUSIC.bands', 'MUSIC.melody']],
  /* shows and stories */
  49: [.6, 'flow build drop', ['FEEL.kick', 'MUSIC.beat']], 52: [.6, 'flow build drop', ['MUSIC.bands', 'MUSIC.drop']], 55: [.6, 'calm flow build drop', ['FEEL.kick', 'FEEL.snare', 'FEEL.hat', 'MUSIC.drop']],
  57: [.6, 'calm flow build drop', ['MUSIC.beat', 'MUSIC.drop']], 50: [.5, 'flow build', ['MUSIC.melody']], 51: [.7, 'flow drop', ['MUSIC.beat', 'MUSIC.drop']], 58: [.45, 'calm flow', ['MUSIC.bands', 'MUSIC.melody']]
};
const ROLE_FALLBACK = e => e < .3 ? 'calm' : e < .65 ? 'flow' : 'flow build drop';

function create() {
  const R = { cards: [], byKey: {}, byLocal: {}, dupes: [], KINDS, ROLES, HOOK_NAMES, check, norm };
  const lkey = (pat, id) => pat + ':' + id;
  R.add = card => {
    const c = norm(card), old = R.byKey[c.key];
    if (old) { R.dupes.push(c.key); R.cards[R.cards.indexOf(old)] = c; } else R.cards.push(c);
    R.byKey[c.key] = c; if (c.ref && c.ref.pat != null) R.byLocal[lkey(c.ref.pat, c.id)] = c;
    return c;
  };
  R.addAll = list => list.map(R.add);
  R.clear = source => { const keep = source ? R.cards.filter(c => c.source.split(' ')[0] !== source) : []; R.cards = keep; R.byKey = {}; R.byLocal = {}; for (const c of keep) { R.byKey[c.key] = c; if (c.ref && c.ref.pat != null) R.byLocal[lkey(c.ref.pat, c.id)] = c; } };
  R.get = key => R.byKey[key] || null;
  R.local = (pat, id) => R.byLocal[lkey(pat, id)] || null;
  R.list = kind => kind ? R.cards.filter(c => c.kind === kind) : R.cards.slice();
  R.search = (q, kind) => { const w = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    return R.list(kind).filter(c => { const hay = (c.name + ' ' + (c.group || '') + ' ' + c.role.join(' ') + ' ' + c.kind + ' ' + (c.desc || '')).toLowerCase(); return w.every(x => hay.includes(x)); }); };
  R.groups = kind => { const out = [], ix = {};
    for (const c of R.list(kind)) { const g = c.kind + '|' + (c.group || ''); if (!ix[g]) { ix[g] = { kind: c.kind, group: c.group || '', cards: [] }; out.push(ix[g]); } ix[g].cards.push(c); }
    return out.sort((a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind)); };
  /* the conductor's candidate (conductor.js: { key, name, energy, role, bars, w, cover }). local = the player's own id as the key (Epic's 'void', the Text show's '0') */
  R.cand = (card, o) => { o = o || {}; const c = typeof card === 'string' ? R.byKey[card] : card; if (!c) return null;
    return Object.assign({ key: o.local ? String(c.id) : c.key, name: c.name, energy: c.energy, role: c.role.slice(), bars: c.bars.slice(), w: c.w, cover: (c.cover || []).slice(), card: c }, o.extra || {}); };
  R.pool = (filter, o) => R.cards.filter(c => !filter || filter(c)).map(c => R.cand(c, o));
  R.counts = () => { const o = { total: R.cards.length }; for (const k of KINDS) o[k] = 0; for (const c of R.cards) o[c.kind] = (o[c.kind] || 0) + 1; o.estimated = R.cards.filter(c => c.estimated).length; return o; };
  R.problems = () => { const out = []; for (const c of R.cards) { const p = check(c); if (p.length) out.push({ key: c.key, problems: p }); } for (const k of R.dupes) out.push({ key: k, problems: ['duplicate key'] }); return out; };

  /* ---- adapters ---- */
  /* every plain visual and every whole show of window.VISUAL_PARAMS (visual-params.js). opts.skip = pattern numbers left out (Video needs a file), opts.only = the numbers that can play */
  R.fromVisualParams = (VP, opts) => { opts = opts || {}; const out = [];
    for (const k of Object.keys(VP || {})) { const pat = +k, P = VP[k]; if (!P || (opts.skip || []).includes(pat) || (opts.only && !opts.only.includes(pat))) continue;
      const show = P.kind === 'set' || P.kind === 'story', est = EST[pat] || [.5, null, []], role = est[1] || ROLE_FALLBACK(est[0]);
      const key = (P.kind === 'set' ? 'set:' : P.kind === 'story' ? 'story:' : 'pat:') + pat;
      out.push(R.add({ key, id: pat, name: P.name, kind: show ? 'show' : 'visual', energy: est[0], role: role.split(' '), bars: show ? [16, 32] : [8, 16], hooks: est[2].slice(),
        params: (P.params || []).map(q => ({ k: q.k, label: q.label, def: q.def, min: q.min, max: q.max, step: q.step, unit: q.unit || '' })),
        source: 'visual-params.js', ref: { pat }, desc: P.desc || '', group: show ? 'Shows' : (opts.groupOf && opts.groupOf(pat)) || 'Visuals', estimated: true, estimatedFields: ['energy', 'role', 'bars', 'hooks'] })); }
    return out; };
  /* Epic's scenes (show-director.js engScene: name, energy, role, bars, entry / exit, cover, params, w) and its stories */
  const COVER_HOOK = { bass: 'FEEL.kick', mids: 'FEEL.mel', highs: 'FEEL.hat' };
  R.fromEpic = (SC, opts) => { opts = opts || {}; const pat = opts.pat || 55, stories = opts.stories || [], out = [];
    for (const id of Object.keys(SC || {})) { const d = SC[id], story = stories.includes(id), cover = (d.cover || []).slice();
      const hooks = ['MUSIC.beat'].concat(cover.map(x => COVER_HOOK[x]).filter(Boolean)); if ((d.role || []).includes('drop')) hooks.push('MUSIC.drop');
      out.push(R.add({ key: (story ? 'story:' : 'scene:') + pat + ':' + id, id, name: d.name || id, kind: 'scene', energy: d.energy, role: (d.role || ['flow']).slice(),
        bars: d.bars && d.bars.length ? [Math.min(...d.bars), Math.max(...d.bars)] : undefined, entry: (d.entry || []).slice(), exit: (d.exit || []).slice(),
        hooks, params: Object.keys(d.params || {}).map(k => ({ k, rolled: true })), source: 'show-director.js engScene', ref: story ? { pat, story: id } : { pat, scene: id },
        w: d.w == null ? 1 : d.w, cover, group: opts.group || 'Epic', desc: story ? 'story' : 'scene', estimated: !d.bars || !d.bars.length ? true : undefined, estimatedFields: !d.bars || !d.bars.length ? ['bars'] : undefined })); }
    return out; };
  /* shows in their own files (window.INF_SHOWS): a show that lives under Hand and Cube (home:'hand') is one of its scenes, the others are shows (the page's own shows come from visual-params). card = the show's own `card` if it has one */
  R.fromShows = SH => { const out = [];
    for (const k of Object.keys(SH || {})) { const s = SH[k]; if (!s) continue; const est = EST[s.pat] || [.5, null, []], hand = s.home === 'hand';
      const key = (hand ? 'story:' : 'set:') + s.pat; if (R.byKey[key] && !hand) { Object.assign(R.byKey[key], s.card || {}); continue; }
      const card = s.card || {}, own = card.energy != null && card.role && card.bars;   // a show that says its own energy, role and bars is not estimated
      const c = Object.assign({ key, id: s.pat, name: s.name, kind: hand ? 'scene' : 'show', energy: est[0], role: (est[1] || ROLE_FALLBACK(est[0])).split(' '), bars: hand ? [8, 16] : [16, 32], hooks: est[2].slice(), params: [],
        source: 'show-' + k + '.js', ref: { pat: s.pat }, desc: String(s.note || '').slice(0, 140), group: hand ? 'Hand and Cube' : 'Shows', estimated: true, estimatedFields: ['energy', 'role', 'bars', 'hooks'] }, card);
      if (own) { delete c.estimated; delete c.estimatedFields; }
      out.push(R.add(c)); }
    return out; };
  return R;
}

const R = create(); R.create = create;
if (typeof window !== 'undefined') window.INF_SCENES = R;
if (typeof module !== 'undefined' && module.exports) module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);
