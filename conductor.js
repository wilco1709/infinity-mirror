/* conductor.js: window.CONDUCTOR, the ONE decider of WHEN / WHAT / HOW to change, for every set (STRUCTURE PLAN.md, step 4).
   Lifted out of the Director's Auto (show-director.js, AUTO PLAN.md) with the same numbers and the same seeded behaviour, made generic: it works on a POOL of
   candidates the player hands over (Director scenes, Text show scenes, a library set's entries, a VJ clip's section scenes).

   A candidate:  { key, name, energy 0..1, role 'build drop flow calm' (string or list), bars (number | list), w (weight, 1), wx (extra multiplier, 1),
                   cover:['bass','mids','highs'], sparse:[x if the music is sparse, y if not], quiet:bool, entry/exit (hosts keep their own state graph) }

   What lives here (nothing else decides):
     level      C.frame(dts, inp) -> C.lvl (0..1 how much the music has going on: the song map's level, else loudness + build, rising over lvAtk s, falling over lvRel s,
                a drop puts it high at once), C.tgtS (the older target energy, smoothed). Calm <-> Busy shifts it (cbLevel).
     choice     C.choose(pool, ctx): energy fit (Gaussian, sigma lvSig), recent / role / novelty / part-cover factors, only the scenes within lvTop of the best stay in the draw
     style      C.style(ctx): the transition of a normal change (cut / black / flicker / strobe, softer crossfade when Calm)
     phrases    C.endSnap: a scene ends on a phrase line (phraseBars, at least phraseMin, a plan section ends it), C.planTick / C.planKind / C.planEnd: the song map's planned changes
     look       C.levelMods: soft / middle / full by the level -> layers, colour, white;  C.palIx
     seed       C.songSeed(id, dur) + C.rng(seed): the same song gives the same show; C.newSeed() = another take
     runner     C.runner(host, opts): the whole loop for a player that has no state graph of its own (Text show, library sets, VJ clips): picks, holds, changes on phrase
                lines and drops, calls host.play(key, {type, bars, why}).
   Calm <-> Busy (S.calmBusy, 0..1, .5 = exactly today): C.calmBusy. Calm: holds x up to 2 (phrase 16), min hold 8, softer transitions (crossfades instead of cuts), level target lower
   (fewer layers, less white), drops change late. Busy: holds x .5 (phrase 4), more cuts, level target higher, drops change at once.
   Tunables = C.params (the General drawer's Timing section): get / set / def / reset / bind / dump / load / on, like house-style.js. */
(function (root) {
'use strict';
const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
const P = (id, label, def, min, max, step, unit, tip) => ({ id, group: 'Timing', label, def, min, max, step, unit, tip });

const PARAMS = [
  P('calmBusy', 'Calm ↔ Busy', .5, 0, 1, .01, '', 'How much and how often things change. Calm: long scenes (phrases of 16), soft cross-fades, a lower level so fewer layers and less white. Busy: short scenes (down to 4 bars), more cuts, a higher level. The middle is the tuned Director. The Pad has this same slider.'),
  P('variety', 'Variety', 0, 0, 1, .01, '', 'How much the changes vary. 0: exactly the tuned conductor, scenes of the same length and always the best fit for the music. Higher: scene lengths vary (a short one, then a long one) and the pick is wider, so scenes that fit the music less closely also get a turn. The Pad has this same slider.'),
  P('phraseBars', 'Change on phrase', 8, 4, 16, 4, 'bars', 'Scenes change on a phrase line: every 4, 8 or 16 bars of the music. 8 is the usual phrase. Calm ↔ Busy stretches or shortens it.'),
  P('phraseMin', 'Shortest scene', 4, 2, 16, 1, 'bars', 'A scene stays at least this many bars before the next change, even if the music asks for one sooner.'),
  P('maxBars', 'Longest scene', 32, 8, 64, 4, 'bars', 'A scene never stays longer than this many bars (stories and scenes that hold on purpose excepted).'),
  P('swCool', 'Rest after a change', 8, 2, 16, 1, 'bars', 'After a change the conductor waits this many bars before it takes another from the live music (a new section, an instrument in or out). High: calmer, less switching.'),
  P('lvAtk', 'Level rises over', 2, .5, 8, .5, 's', 'How fast the level follows the music upwards when there is no song map. Low: it jumps up with the music. High: a slow build.'),
  P('lvRel', 'Level falls over', 4, .5, 12, .5, 's', 'How fast the level follows the music downwards. High: the picture stays full for a while after the music thins out.'),
  P('lvBuild', 'Build counts in the level', .3, 0, 1, .05, '', 'How much a build (rising tension) lifts the level. 0: only loudness counts. 1: a build counts as full volume.'),
  P('cbLevel', 'Calm ↔ Busy level shift', .15, 0, .3, .01, '', 'How far the Calm ↔ Busy slider moves the level: Busy adds this much, Calm takes it away. 0 = the slider only changes how long scenes stay.')
];

/* the numbers without a slider (the Director's tuned values) */
const FIXED = {
  beatsPerBar: 4, planAhead: 1.5, lvDrop: .9, lvSig: .14, lvTop: .85, lvLow: .35, lvHigh: .65,
  roleOff: .06, recentLast: .12, recentIn: .4, novelBoost: 2, partYes: 1.3, partNo: .7, fitFloor: .02,
  dropMin: 4,            /* a drop changes the scene only if it ran at least this many bars (x the hold factor) */
  ixSpan: .4,            /* Epic's light / motion / darkness / detail follow Calm-Busy by up to this much (the old Intensity slider was +-.5)  */
  holdSpan: 1,           /* the hold factor is 2^(-span x (calmBusy - .5) x 2) */
  styleSoft: .8, styleHard: .6   /* how far Calm takes cuts away / Busy adds them */
};

function create() {
  const C = { params: PARAMS, fixed: FIXED, byId: {}, val: {}, cfg: {}, lvl: null, tgtS: null, take: 0, rev: 0 };
  const store = {}, bound = {}, subs = [], evs = {};
  const clampTo = (p, v) => { v = +v; if (!isFinite(v)) return p.def; return v < p.min ? p.min : v > p.max ? p.max : v; };
  for (const p of PARAMS) {
    C.byId[p.id] = p; store[p.id] = p.def;
    Object.defineProperty(C.val, p.id, { enumerable: true, get: () => bound[p.id] ? bound[p.id].get() : store[p.id], set: v => C.set(p.id, v) });
    Object.defineProperty(C.cfg, p.id, { enumerable: true, get: () => C.val[p.id], set: v => C.set(p.id, v) });
  }
  for (const k in FIXED) Object.defineProperty(C.cfg, k, { enumerable: true, get: () => FIXED[k], set: v => { FIXED[k] = v; } });
  C.get = id => { const p = C.byId[id]; if (!p) return undefined; return bound[id] ? bound[id].get() : store[id]; };
  C.def = id => C.byId[id].def;
  C.set = (id, v) => { const p = C.byId[id]; if (!p) return; v = clampTo(p, v); if (bound[id]) bound[id].set(v); else store[id] = v; C.rev++; for (const f of subs.slice()) { try { f(id); } catch (e) { console.error(e); } } };
  C.reset = id => C.set(id, C.byId[id].def);
  C.bind = (id, b) => { if (C.byId[id]) bound[id] = b; };
  C.on = f => { subs.push(f); return () => { const i = subs.indexOf(f); if (i >= 0) subs.splice(i, 1); }; };
  C.dump = () => { const o = {}; for (const p of PARAMS) if (!bound[p.id] && store[p.id] !== p.def) o[p.id] = store[p.id]; return o; };
  C.load = o => { if (!o || typeof o !== 'object') return; for (const p of PARAMS) if (!bound[p.id] && p.id in o) store[p.id] = clampTo(p, o[p.id]); C.rev++; };
  C.resetAll = () => { for (const p of PARAMS) if (!bound[p.id]) store[p.id] = p.def; C.rev++; for (const f of subs.slice()) { try { f(null); } catch (e) { console.error(e); } } };
  /* events: 'seed' (New seed pressed), 'change' (a runner changed) */
  C.listen = (t, f) => { (evs[t] || (evs[t] = [])).push(f); };
  C.emit = (t, a) => { for (const f of (evs[t] || []).slice()) { try { f(a); } catch (e) { console.error(e); } } };

  /* ---------------- Calm <-> Busy ---------------- */
  C.kb = () => { const v = +C.val.calmBusy; return isFinite(v) ? (v - .5) * 2 : 0; };      /* -1 calm .. +1 busy, 0 = the tuned middle */
  C.holdMul = () => { const k = C.kb(); return k === 0 ? 1 : Math.pow(2, -k * FIXED.holdSpan); };   /* calm 2, middle 1, busy .5 */
  C.phraseBarsNow = () => { const b = +C.cfg.phraseBars, m = C.holdMul(); return m === 1 ? b : Math.max(4, Math.round(b * m / 2) * 2); };
  C.minBarsNow = () => { const b = +C.cfg.phraseMin, m = C.holdMul(); return m <= 1 ? b : Math.max(2, Math.round(b * m)); };
  C.dropMinBars = () => { const m = C.holdMul(); return m === 1 ? FIXED.dropMin : Math.max(1, Math.round(FIXED.dropMin * m)); };
  /* after a change the conductor rests swCool bars (x the hold factor) before it takes a change from the live music */
  C.cooling = (beat, lastSw) => beat - (lastSw == null ? -1e9 : lastSw) < C.cfg.swCool * C.holdMul() * FIXED.beatsPerBar;
  /* what Epic's own light / motion / darkness / detail paths take from Calm-Busy: -ixSpan (calm) .. +ixSpan (busy), exactly 0 in the middle (this is what the Entropy + Intensity sliders were) */
  C.ix = () => { const k = C.kb(); return k === 0 ? 0 : FIXED.ixSpan * k; };
  C.lvShift = () => { const k = C.kb(); return k === 0 ? 0 : C.cfg.cbLevel * k; };
  C.newSeed = () => { C.take = (C.take | 0) + 1; C.emit('seed', C.take); return C.take; };

  /* ---------------- the music's state in words (the Director's engPhase / engSparse / engParts) ---------------- */
  /* where the music is: build (the drop watch armed, or a build), calm (a breakdown, a rest, or soft), else flow */
  C.phase = (A, arc, rest) => { const W = A.dw || {}; if (A.gen) return arc < .25 ? 'calm' : 'flow';
    if (W.st === 'breakdown' && W.armed || A.build > .4) return 'build'; if (W.st === 'breakdown' || A.brk || rest > 0 || A.I < .25) return 'calm'; return 'flow'; };
  C.sparse = (A, phase, arSparse) => { const W = A.dw || {}; return !A.gen && (W.st === 'intro' || W.st === 'breakdown' || phase === 'calm' || A.I < arSparse); };
  C.parts = A => { const o = []; if (A.gen) return o; if (A.kdens > .35 || A.env[0] > .55) o.push('bass'); if (A.env[2] > .45 && A.flat < .35) o.push('mids'); if (A.env[4] > .45 || A.dens > 1) o.push('highs'); return o; };

  /* ---------------- level ---------------- */
  /* the intensity the music has: the older target (a rest or a break stays quiet) */
  C.target = inp => {
    if (inp.rest > 0 || inp.brk) return clamp(.05);
    return clamp((inp.gen ? inp.arc : .7 * inp.I + .3 * inp.energy) + .25 * inp.build); };
  C.adj = v => { const s = C.lvShift(); return s ? clamp(v + s) : v; };
  /* once per frame. inp = { planLevel (the song map's level now, or null), gen, arc, I, energy, build, drop, dropReq, brk, rest }. */
  C.frame = (dts, inp) => { const cfg = C.cfg; let v = null;
    if (inp.planLevel != null && isFinite(inp.planLevel)) v = clamp(inp.planLevel);
    if (v != null) C.lvlS = v;
    else { const raw = inp.gen ? inp.arc : clamp(inp.I + cfg.lvBuild * inp.build), cur = C.lvlS == null ? raw : C.lvlS;
      C.lvlS = cur + (raw - cur) * (1 - Math.exp(-dts / (raw > cur ? cfg.lvAtk : cfg.lvRel))); if (inp.drop || inp.dropReq) C.lvlS = Math.max(C.lvlS, FIXED.lvDrop); }
    C.lvl = C.lvShift() ? clamp(C.lvlS + C.lvShift()) : C.lvlS;
    const tg = C.target(inp); C.tgtS = C.tgtS == null || inp.drop ? tg : C.tgtS + (tg - C.tgtS) * (1 - Math.exp(-dts / cfg.lvAtk)); return C.lvl; };
  C.lvlS = null;
  C.resetLevel = () => { C.lvl = null; C.lvlS = null; C.tgtS = null; };
  /* the energy a scene should have now: with a plan the level, live the target smoothed; a rest or a break stays quiet */
  C.want = inp => { if (C.lvl == null) return C.adj(C.target(inp)); if (inp.rest > 0 || inp.brk) return C.adj(C.target(inp));
    return inp.plan && C.lvl != null ? clamp(C.lvl) : C.tgtS == null ? C.adj(C.target(inp)) : C.adj(C.tgtS); };

  /* ---------------- the dice ---------------- */
  /* seeded random numbers (mulberry32): a seed and the decision log replay a show exactly */
  C.rng = seed => { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  /* the song's hash (its map id, else its length) mixed with the take (New seed counts it up) */
  C.songSeed = (id, dur) => { id = String(id || ''); if (!id) id = 'len' + Math.round(dur || 0); let h = 2166136261; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h ^ Math.imul((C.take | 0) + 1, 0x9E3779B1)) >>> 0; };

  /* ---------------- the choice ---------------- */
  /* pool: [candidate]. ctx = { target, recent:[keys, last 3], phase, parts, sparse, novel, rng, filter(c), bridge(c, rng) -> {via, mul} | null (skip) | undefined (no bridge) }
     -> { key, w, via, c } or null. The dice only break near-ties: the best energy fit wins. */
  C.choose = (pool, ctx) => { const cfg = C.cfg, R = ctx.rng, out = [], recent = ctx.recent || [], parts = ctx.parts || [], vy = +cfg.variety || 0;
    for (const c of pool) { if (ctx.filter && !ctx.filter(c)) continue; let via = null, w = (c.w == null ? 1 : c.w) * (c.wx == null ? 1 : c.wx);
      if (ctx.bridge) { const b = ctx.bridge(c, R); if (b === null) continue; if (b) { via = b.via || null; w *= b.mul == null ? 1 : b.mul; } }
      const d = (c.energy == null ? .5 : c.energy) - ctx.target, sg = cfg.lvSig * (1 + 2 * vy); w *= Math.exp(-d * d / (2 * sg * sg)) + cfg.fitFloor;   /* Variety widens the energy fit */
      if (recent[recent.length - 1] === c.key) w *= cfg.recentLast; else if (recent.includes(c.key)) w *= cfg.recentIn;
      if (ctx.novel && (c.w == null ? 1 : c.w) < .95) w *= cfg.novelBoost;
      if (c.role && ctx.phase && !c.role.includes(ctx.phase)) w *= cfg.roleOff;
      if (c.sparse) w *= ctx.sparse ? c.sparse[0] : c.sparse[1];
      for (const k of parts) w *= (c.cover || []).includes(k) ? cfg.partYes : cfg.partNo;
      out.push({ key: c.key, w, via, c }); }
    if (!out.length) return null; let mx = 0; out.forEach(o => { if (o.w > mx) mx = o.w; }); const lt = cfg.lvTop * (1 - .6 * vy), top = out.filter(o => o.w >= lt * mx);   /* Variety lets more scenes stay in the draw */
    let s = 0; top.forEach(o => s += o.w); let r = R() * s; for (const o of top) { r -= o.w; if (r <= 0) return o; } return top[top.length - 1]; };

  /* how to cut between two scenes that fit: hard on kicks and drops, softer when it is calm. ctx = { phase, e (energy 0..1), rng, morph (the two shapes can flow) }.
     Each band is [type, share]; Calm takes the share of the cuts away (they become cross-fades), Busy adds to it. One draw, always. */
  C.style = ctx => { const R = ctx.rng, e = ctx.e, ph = ctx.phase, r = R(), kb = C.kb();
    if (ctx.morph) return 'morph';
    if (ph === 'calm') return 'strip';   /* calm music strips down to a dot or to black first (the host's bridge) */
    const bands = ph === 'build' ? [['flicker', .5], ['cut', .3], ['black', .2]] : e > .65 ? [['cut', .5], ['black', .3], ['strobe', .2]] : [['cut', .6], ['black', .4]];
    if (kb === 0) { let a = 0; for (let i = 0; i < bands.length - 1; i++) { a += bands[i][1]; if (r < a) return bands[i][0]; } return bands[bands.length - 1][0]; }   /* the middle: the old thresholds exactly */
    const cut = bands.find(b => b[0] === 'cut'), old = cut[1]; let nb;
    if (kb < 0) { const nu = old * (1 + kb * FIXED.styleSoft); nb = bands.map(b => b === cut ? ['cut', nu] : b.slice()); nb.push(['xfade', old - nu]); }   /* Calm: the cuts' share becomes a soft cross-fade */
    else { const nu = Math.min(.95, old * (1 + kb * FIXED.styleHard)), k2 = (1 - nu) / (1 - old); nb = bands.map(b => b === cut ? ['cut', nu] : [b[0], b[1] * k2]); }   /* Busy: more cuts, the others share what is left */
    let a = 0; for (const b of nb) { a += b[1]; if (r < a) return b[0]; } return nb[nb.length - 1][0]; };
  /* ---------------- phrases and the song map's planned changes ---------------- */
  C.songT = () => { try { if (typeof audioSrc !== 'undefined' && audioSrc === 'file' && typeof playerEl !== 'undefined' && !playerEl.paused && isFinite(playerEl.currentTime)) return playerEl.currentTime; } catch (e) { } return null; };
  C.plan = (songT) => { try { const D = root.DESK; const st = songT === undefined ? C.songT() : songT; return D && D.plan && st != null ? D.plan() || null : null; } catch (e) { return null; } };
  C.planLevel = (songT) => { let v = null; try { const D = root.DESK; v = D && D.level ? D.level(songT === undefined ? C.songT() : songT) : null; } catch (e) { v = null; } return typeof v === 'number' && isFinite(v) ? v : null; };
  /* song time -> beat, on the nearest bar line */
  C.planBeat = (t, st, beat, bpm, bpb) => Math.round((beat + (t - st) * bpm / 60) / bpb) * bpb;
  /* the phrase line nearest to a drawn end, at least minB: from the plan's lines (bounds), else from the live grid phr0 + n x per */
  C.snapPhrase = (drawn, minB, bounds, phr0, per) => {
    if (bounds) { let best = null; for (const b of bounds) if (b >= minB - 1e-6 && (best == null || Math.abs(b - drawn) < Math.abs(best - drawn))) best = b; return best != null && Math.abs(best - drawn) <= per / 2 ? best : Math.max(drawn, minB); }
    let b = phr0 + Math.round((drawn - phr0) / per) * per; while (b < minB - 1e-6) b += per; return b; };
  /* a scene's end snaps to a phrase (at least the shortest hold); a section of the plan inside or just behind its span ends it.
     o = { b0, b1 (drawn end, beat), beat, bpm, bpb, phr0, plan, st (song time), endB (fixed end), noSnap } -> { b1, bars } */
  C.endSnap = o => { const bpb = o.bpb || FIXED.beatsPerBar, mul = C.holdMul();
    if (o.endB != null) return { b1: o.endB, bars: Math.max(1, Math.round((o.endB - o.b0) / bpb)) };
    if (o.noSnap) return { b1: o.b1, bars: Math.max(1, Math.round((o.b1 - o.b0) / bpb)) };
    const Pn = o.plan, st = o.st, minB = o.b0 + C.minBarsNow() * bpb - (mul < 1 ? .5 * bpb : 0), per = C.phraseBarsNow() * bpb; let bounds = null, stop = null;
    if (Pn && st != null) { const bb = Pn.entries.map(e => ({ e, b: C.planBeat(e.t, st, o.beat, o.bpm, bpb) })).filter(x => x.b > o.b0 + .5 * bpb); bounds = bb.map(x => x.b); const s = bb.find(x => x.e.kind === 'section'); stop = s ? s.b : null; }
    const vy = +C.cfg.variety || 0, vj = vy > 0 && o.rng ? Math.pow(2, (o.rng() * 2 - 1) * vy * 1.5) : 1;   /* Variety: the drawn length varies up to x2.8 shorter or longer, then snaps to a phrase line (no dice drawn at 0) */
    const drawn = mul === 1 && vj === 1 ? o.b1 : o.b0 + (o.b1 - o.b0) * mul * vj;
    let b1 = C.snapPhrase(drawn, minB, bounds, o.phr0, per); if (stop != null && stop <= b1 + C.cfg.phraseMin * bpb) b1 = stop;
    const cap = o.b0 + C.cfg.maxBars * bpb; if (b1 > cap && stop == null) b1 = Math.max(minB, Math.round(cap / bpb) * bpb);
    return { b1, bars: Math.max(1, Math.round((b1 - o.b0) / bpb)) }; };
  /* once per bar: the next planned change about planAhead bars ahead. o = { e (DESK.nextChange(st, planAhead x bar)), planKey, beat, bpm, bpb, st, scene: { loop, hold, story, b1 } }
     -> null (nothing yet) | { key, log, change: false } (a drop / build: nothing to do, remember the key) | { key, log, change: true, eb, e, keepLoop } */
  C.planTick = o => { const e = o.e; if (!e || o.planKey === e.t) return null; const tr = e.trans, eb = C.planBeat(e.t, o.st, o.beat, o.bpm, o.bpb); if (eb <= o.beat + .5) return null;
    const log = 'plan: ' + (e.prevK || 'start') + ' → ' + e.k + ' (' + tr + ')', sc = o.scene || {};
    if (tr === 'drop' || tr === 'build') return { key: e.t, log, change: false };
    if (tr === 'vary' && (sc.loop || sc.hold || sc.story || sc.b1 <= eb + .5)) return { key: e.t, log, change: false };
    return { key: e.t, log, change: true, eb, e, keepLoop: tr === 'vary' }; };
  /* the kind of choice a planned transition asks for, and the filter that picks its scene */
  C.planKind = tr => ({ swell: { tag: 'swell', filter: c => (c.role || '').includes('build') }, soft: { tag: 'soft', filter: c => c.energy <= .3, fallback: c => !!c.quiet },
    outro: { tag: 'outro', filter: c => c.energy <= .3 }, anchor: { tag: 'anchor' }, vary: { tag: 'vary' } })[tr] || null;
  /* the last bar of a planned scene: swell = the next drop (else the next section) + 1 bar; outro = the song's end + 4 bars */
  C.planEnd = (tr, o) => { const bpb = o.bpb, Pn = o.plan, stT = o.st;
    if (tr === 'swell') { const dt = o.nextDropT, se = Pn.entries.find(x => x.kind === 'section' && x.t > stT + Pn.bar), end = dt != null ? dt : se ? se.t : null; return end != null ? C.planBeat(end, stT, o.beat, o.bpm, bpb) + bpb : null; }
    if (tr === 'outro') return C.planBeat(Pn.dur, stT, o.beat, o.bpm, bpb) + 4 * bpb; return null; };
  /* the transition of a planned moment as a runner draws it */
  C.planTransition = tr => ({ swell: 'xfade', soft: 'xfade', anchor: 'cut', outro: 'xfade', vary: 'xfade', cut: null, drop: 'cut' })[tr];

  /* a library set (rules: barsMin, barsMax, order, noRepeat): how many bars the next entry stays (the old 4-bar steps, scaled by Calm-Busy), and which entry comes next */
  C.holdFor = (rules, rng) => { const bMin = Number(rules.barsMin) || 8, bMax = Number(rules.barsMax) || 16, minMult = Math.round(Math.min(bMin, bMax) / 4), maxMult = Math.round(Math.max(bMin, bMax) / 4);
    const mult = minMult + Math.floor(rng() * (maxMult - minMult + 1)); let bars = Math.max(4, mult * 4); const m = C.holdMul(); if (m !== 1) bars = Math.max(C.minBarsNow(), Math.round(bars * m / 4) * 4); return bars; };
  C.pickEntry = (entries, curIx, rules, rng, recent) => { if (entries.length === 1) return 0; if (rules.order === 'in order') return (curIx + 1) % entries.length;
    let pool = entries.map((e, i) => ({ key: String(i), energy: e.energy == null ? .5 : e.energy, role: e.role, w: e.w })); if (rules.noRepeat && curIx >= 0) pool = pool.filter(c => +c.key !== curIx);
    const o = C.choose(pool, { target: C.lvl == null ? .5 : C.lvl, recent: (recent || []).map(String), phase: null, parts: [], rng }); return o ? +o.key : 0; };

  /* ---------------- look by level (the Director's engLevelMods / engPalIx) ---------------- */
  /* soft (below lvLow, or restrained / a rest): the cold tint, no other layer. Middle: the style's colours, at most one extra layer from .45 up. Full (above lvHigh): white dominant,
     two extra layers, three from .85. Calm <-> Busy moves lvl, so Calm gives fewer layers and less white. */
  C.look = (lv, restrained) => { const cfg = C.cfg, soft = lv < cfg.lvLow || !!restrained, full = lv >= cfg.lvHigh, n = soft ? 0 : full ? (lv >= .85 ? 3 : 2) : lv >= .45 ? 1 : 0;
    return { soft, full, layers: n, tint: soft ? 'cold' : full ? 'white' : 'palette', white: soft ? 0 : full ? (lv >= .85 ? 1 : .8) : lv >= .45 ? .3 : .15 }; };
  /* m = the mods being filled; o = { lv, restrained, coldOver, layers:[{k, base}] (ranked by base; base x dice jitter), rng, value(k, rng) }. Returns m. */
  C.levelMods = (m, o) => { const L = C.look(o.lv, o.restrained), R = o.rng;
    if (L.soft) { m.cold = 1; return m; }
    if (!L.full) { if (o.coldOver) m.cold = 1; else m.palette = 1; }
    if (!L.layers) return m;
    const sc = []; for (const l of o.layers) sc.push([l.k, l.base * (.9 + .2 * R())]); sc.sort((x, y) => y[1] - x[1]);
    for (const [k] of sc.slice(0, L.layers)) m[k] = o.value ? o.value(k, R) : 1; return m; };
  /* the palette index by level (calm colours first, hot ones last); the dice only move it a place */
  C.palIx = (n, order, lv, rng) => { if (!n) return 0; if (lv == null || n !== order.length) return Math.floor(rng() * n);
    const u = clamp((lv - C.cfg.lvLow) / (C.cfg.lvHigh - C.cfg.lvLow)); return order[Math.max(0, Math.min(n - 1, Math.floor(u * n - .01 + (rng() - .5))))]; };

  /* ================= the runner: the whole loop for a player without a state graph of its own =================
     host = { pool() -> [candidate], play(key, tr), rng?, onPlan? }.  opts = { music, order:'auto'|'in order', bars:[list], changeOnDrop, noRepeat, pins: () => [keys] | null, section: () => {scenes, freedom, enter, enterBars, seed} }
     tr = { type: 'cut'|'black'|'flicker'|'strobe'|'xfade'|'morph'|'strip', bars, why, vary?, shock? }. A pinned list (freedom under .34 in a clip) plays its scenes in order and never rolls. */
  C.runner = (host, opts) => { const o = Object.assign({ order: 'auto', changeOnDrop: true, noRepeat: true }, opts || {}), RN = { cur: null, b0: 0, b1: 0, last: null, hist: [], n: 0, plan: null, planKey: null, planNext: null, planB: 0, pinIx: -1, lastDropT: undefined, lastSecT: undefined, dropReq: false, secReq: null, phr0: 0, log: [] };
    const M = () => o.music || root.MUSIC;
    const log = s => { RN.log.push(s); if (RN.log.length > 60) RN.log.shift(); };
    const rng = () => (RN.R || host.rng || Math.random)();
    const pool = () => { let l = host.pool() || []; const pins = o.pins && o.pins(); if (pins && pins.length) { const f = l.filter(c => pins.includes(c.key)); if (f.length) l = f; } return l; };
    const inp = (m, planLevel) => { const A = m.ear || {}; return { planLevel, gen: !!A.gen, arc: m.arc == null ? .2 : m.arc, I: A.I || 0, energy: A.energy || 0, build: A.build || 0, drop: !!A.drop, brk: !!A.brk, rest: 0 }; };
    RN.level = () => C.lvl; RN.stop = () => { RN.cur = null; RN.plan = null; };
    RN.restart = () => { RN.cur = null; };
    function holdBars(c) { let l = Array.isArray(o.bars) && o.bars.length ? o.bars : Array.isArray(c.bars) ? c.bars : c.bars ? [c.bars] : [8, 16]; return l[Math.floor(rng() * l.length)]; }
    function trBars(type) { try { const T = root.LOOK && root.LOOK.tr; if (T && T.pickBars) return T.pickBars(type, rng); } catch (e) { } return type === 'cut' || type === 'black' || type === 'strobe' ? 0 : 1; }
    function pick(why, filterOvr) { const m = M(), A = m.ear || {}, l = pool(); if (!l.length) return null; const cur = RN.cur;
      if (o.order === 'in order') { const ix = cur ? l.findIndex(c => c.key === cur.key) : -1, c = l[(ix + 1) % l.length]; return { c, key: c.key }; }
      const ph = C.phase(A, m.arc, 0), pl = RN.plan; let cands = l; if (o.noRepeat && cur && l.length > 1) cands = l.filter(c => c.key !== cur.key);
      const ctx = { target: C.want({ plan: !!pl, rest: 0, brk: !!A.brk, gen: !!A.gen, arc: m.arc, I: A.I || 0, energy: A.energy || 0, build: A.build || 0 }), recent: RN.hist.slice(-3), phase: ph, parts: A.env ? C.parts(A) : [], sparse: C.sparse(A, ph, .12), novel: false, rng, filter: filterOvr };
      return C.choose(cands, ctx) || (filterOvr && C.choose(cands, Object.assign({}, ctx, { filter: null }))) || null; }
    function enter(sel, tr, kind, endB, silent) { const m = M(), bpb = FIXED.beatsPerBar, beat = m.beat, c = sel.c || sel, pl = RN.plan;
      const b0 = Math.round(beat / bpb) * bpb, drawn = b0 + holdBars(c) * bpb, st = pl ? C.songT() : null;
      const e = C.endSnap({ b0, b1: drawn, beat, bpm: m.bpm || 120, bpb, phr0: m.phrase0 || 0, plan: pl, st, endB, noSnap: kind === 'drop', rng });
      RN.cur = c; RN.b0 = b0; RN.b1 = e.b1; RN.last = beat; RN.n++; RN.hist.push(c.key); if (RN.hist.length > 50) RN.hist.shift(); RN.planNext = null;
      log((kind || 'change') + ': ' + (c.name || c.key) + ' (' + tr.type + ', ' + e.bars + ' bars)');
      if (silent) return;
      try { host.play(c.key, Object.assign({ bars: tr.bars == null ? trBars(tr.type) : tr.bars, why: kind || 'end', n: RN.n }, tr), c); } catch (x) { console.error(x); } C.emit('change', { key: c.key, why: kind, tr }); }
    /* the player is already showing this key (a page opened on it): the conductor takes it as the running scene without playing it again */
    RN.adopt = key => { const c = pool().find(x => x.key === key); if (c) enter({ c }, { type: 'cut' }, 'adopt', null, true); return !!c; };
    function change(kind) { const m = M(), A = m.ear || {}, pl = RN.plan, bpb = FIXED.beatsPerBar; let tr = { type: 'cut' }, sel, endB = null, why = kind;
      const pn = RN.planNext && pl && Math.abs(m.beat - RN.planB) <= bpb * 1.01 ? RN.planNext : null; RN.planNext = null;
      if (kind === 'drop') { const hot = pool().filter(c => (c.role || '').includes('drop')); sel = C.choose(hot.length ? hot : pool(), { target: Math.max(.8, C.want({ plan: !!pl, rest: 0, brk: false, I: A.I || 0, energy: A.energy || 0, build: 0, arc: m.arc })), recent: RN.hist.slice(-3), phase: 'flow', parts: [], rng });
        if (sel && RN.cur && sel.key === RN.cur.key && pool().length > 1) sel = pick('drop', c => c.key !== RN.cur.key); tr = { type: 'cut', drop: true }; }
      else if (pn && C.planKind(pn.trans)) { const K = C.planKind(pn.trans), tn = pn.trans;
        if (tn === 'vary') { sel = { c: RN.cur }; tr = { type: 'xfade', vary: true }; }
        else if (tn === 'anchor') { sel = pick('anchor'); tr = { type: 'cut', shock: true }; }
        else { sel = pick(tn, K.filter) || (K.fallback && pick(tn, K.fallback)) || pick(tn); tr = { type: C.planTransition(tn) || 'xfade' };
          endB = C.planEnd(tn, { plan: pl, st: C.songT(), beat: m.beat, bpm: m.bpm || 120, bpb, nextDropT: root.DESK && DESK.nextDropT ? DESK.nextDropT(C.songT()) : null }); } why = 'plan ' + tn; }
      else { sel = pick(kind); if (sel) { const ph = C.phase(A, m.arc, 0), st = C.style({ phase: ph, e: A.gen ? m.arc : A.energy || 0, rng });
          tr = { type: st === 'strip' ? 'black' : st }; } }
      if (!sel) return; enter(sel, tr, why, endB); }
    /* once per frame */
    RN.step = dt => { const m = M(); if (!m) return; const st = C.songT(), pl = C.plan(st), bpb = FIXED.beatsPerBar;
      if (pl !== RN.plan) { RN.plan = pl; RN.planKey = null; RN.planNext = null; if (pl) { RN.R = C.rng(C.songSeed((root.DESK && DESK.map || {}).id, pl.dur)); log('seed: this song, take ' + (C.take | 0)); } else RN.R = null; }
      if (RN.stamp !== m.t) { RN.stamp = m.t; C.frame(dt, inp(m, pl ? C.planLevel(st) : null)); }
      const dT = ((m.last || {}).drop || {}).t, sT = ((m.last || {}).section || {}).t;
      if (!RN.seen) { RN.seen = true; RN.lastDropT = dT; RN.lastSecT = sT; } else { if (dT !== RN.lastDropT) { RN.lastDropT = dT; RN.dropReq = true; } if (sT !== RN.lastSecT) { RN.lastSecT = sT; RN.secReq = true; } }
      if (!RN.cur) { const sel = pick('start'); if (sel) enter(sel, { type: 'cut' }, 'start'); return; }
      const bar = m.barTick;
      if (bar && pl && st != null && root.DESK && DESK.nextChange) { const r = C.planTick({ e: DESK.nextChange(st, FIXED.planAhead * pl.bar), planKey: RN.planKey, beat: m.beat, bpm: m.bpm || 120, bpb, st, scene: { b1: RN.b1, hold: false } });
        if (r) { RN.planKey = r.key; log(r.log); if (r.change) { RN.planNext = r.e; RN.planB = r.eb; RN.b1 = r.eb; } } }
      if (RN.dropReq) { RN.dropReq = false; if (o.changeOnDrop && (m.beat - RN.b0) / bpb >= C.dropMinBars()) { change('drop'); return; } }   /* a DROP changes on its own frame (the cut), never waits for the bar */
      if (RN.secReq && bar) { RN.secReq = false; if (!pl && m.beat - (RN.last == null ? -1e9 : RN.last) >= C.cfg.swCool * bpb && (m.beat - RN.b0) / bpb >= C.minBarsNow()) { RN.phr0 = m.beat; change('section'); return; } }
      if (bar && m.beat >= RN.b1 - 1e-6) change(RN.planNext ? 'plan' : 'end'); };
    return RN; };

  return C;
}

const C = create(); C.create = create;
if (typeof window !== 'undefined') window.CONDUCTOR = C;
if (typeof module !== 'undefined' && module.exports) module.exports = C;
})(typeof window !== 'undefined' ? window : globalThis);
