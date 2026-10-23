/* house-style.js: window.HOUSE, the ONE table of the shared "secret sauce" numbers (STRUCTURE PLAN.md, step 3).
   Every number the finishing chain (look.js), the transitions, the flash gate and the springs share lives here, once, with its label, range, default and tip.
   The defaults are the Director's tuned values, so the Director looks the same as before.
   The General drawer's Light / Colour / Motion / Transitions sections are built from HOUSE.params; nothing else is drawn from this file.

   HOUSE.val.<id>      the live value (read it every frame; it is a plain getter)
   HOUSE.get/set/def/reset(id)   set clamps to min..max and tells the listeners
   HOUSE.bind(id,{get,set})      the page points a few ids at state it already had (Brightness = S.bright, Trails = S.trail ...): one state, two doors
   HOUSE.dump() / load(o)        only the values that differ from the default; the page keeps them in S.house
   HOUSE.on(fn)                  listeners (called with the id)
   HOUSE.fixed                   numbers that are shared too but have no slider (transition bar lists, echo floor ...)
   HOUSE.palettes                the seven palettes (4 colours each, 0..1 RGB), the single list the page and the shows use */
(function (root) {
'use strict';
const P = (id, group, label, def, min, max, step, unit, tip) => ({ id, group, label, def, min, max, step, unit, tip });

const PARAMS = [
  /* ---------- Light ---------- */
  P('brightness', 'Light', 'Brightness', .8, .02, 1, .01, '', 'How bright the whole picture goes out, on the screen and to the real LEDs. The Pad and the master strip have this same slider.'),
  P('gamma', 'Light', 'LED gamma', 2.4, 1.8, 3, .05, '', 'The curve between a picture value and the LED duty. Higher keeps the dark end darker and the middle quieter.'),
  P('whiteCap', 'Light', 'White cap', .4, .2, .6, .01, '', 'The white part of any LED (what red, green and blue share) is held at this share of full duty, so white never runs the LEDs hot.'),
  P('whiteFrac', 'Light', 'White screen: share of LEDs', .92, .6, 1, .01, '', 'A picture counts as a white screen when this share of the LEDs is nearly white. White screens only stay in a build or after a drop; anywhere else they are dimmed.'),
  P('whiteDuty', 'Light', 'White strobe: on-time', .3, .1, .6, .01, '', 'When a white screen strobes, it stays lit for at most this share of a beat. Less is gentler.'),
  P('darkness', 'Light', 'Darkness outside a climax', .65, .3, .9, .01, '', 'At least this share of the LEDs stays black outside a build or a drop (negative space). The dimmest light is gated away until that holds.'),
  P('darknessClimax', 'Light', 'Darkness in a climax', .3, 0, .9, .01, '', 'The same, during a build, after a drop and in the cycle. Low lets the panel fill up.'),
  P('supplyA', 'Light', 'Power supply', 40, 5, 150, 1, 'A', 'What your power supply can give at 5 V. The chain scales the whole frame down when it would draw more than the supply times the limit.'),
  P('powerLimit', 'Light', 'Power limit', .85, .5, 1, .01, '', 'The share of the supply the picture may use. 85 % keeps 15 % in reserve.'),
  P('mA', 'Light', 'Current per colour', 20, 10, 30, 1, 'mA', 'What one colour of one LED draws at full. 20 mA is the datasheet value; the power meter and the limit are worked out from it.'),
  P('flashMax', 'Light', 'Max white flashes per second', 3, 1, 6, 1, '/ s', 'The most white flashes allowed in any second, for every visual and every flash. 3 is the photosensitive-epilepsy limit (WCAG 2.3.1, Ofcom); above it is your risk.'),
  P('flashGap', 'Light', 'Shortest gap between flashes', .15, .05, .5, .01, 's', 'Two white flashes are never closer together than this.'),

  /* ---------- Colour ---------- */
  P('whiteWarmth', 'Colour', 'White warmth', 1, 0, 1, .05, '', 'How warm the Director\'s white is. 0 is pure white, 1 is the slightly warm white it was tuned with.'),
  P('coldTint', 'Colour', 'Cold tint', 1, 0, 1, .05, '', 'How blue the Director\'s cold scenes are. 0 turns the tint to white, 1 is the pale blue and violet it was tuned with.'),

  /* ---------- Motion ---------- */
  P('breathing', 'Motion', 'Breathing', .03, 0, .08, .005, '', 'Every LED swells and fades by this much, each at its own slow pace, so a still picture is never dead.'),
  P('anticipation', 'Motion', 'Pull-in before a change', .08, 0, .2, .01, '', 'In the last beat before a change the picture pulls in by this much. 0 turns the pull-in off.'),
  P('antDim', 'Motion', 'Dim before a change', .65, 0, 1, .05, '', 'In the last beat before a change the picture dims by this much. 0 = no dimming, 1 = black.'),
  P('echoFade', 'Motion', 'Echo fade per beat', .1, 0, .3, .01, '', 'The Director\'s feedback tunnel: how much of an echo is left after a beat. Low echoes die quickly, except in a climax.'),
  P('duckTo', 'Motion', 'Echo duck on the kick', .65, .2, 1, .05, '', 'On every kick the echoes duck to this level and come back (sidechain pumping). 1 = no ducking.'),
  P('duckS', 'Motion', 'Echo duck recovery', .12, .03, .4, .01, 's', 'How fast the ducked echoes come back.'),
  P('trails', 'Motion', 'Trails', 0, 0, 1, .01, '', 'How long a picture lingers behind itself. The master strip has this same slider.'),
  P('softness', 'Motion', 'Softness', 0, 0, 1, .01, '', 'How slowly a change is blended in. The master strip has this same slider.'),
  P('springHz', 'Motion', 'Spring speed', 3.5, 1, 8, .1, 'Hz', 'How fast the follow-through springs swing (the kick\'s bounce, the hits on the envelopes). Higher is snappier.'),
  P('springZeta', 'Motion', 'Spring damping', .4, .1, 1, .05, '', 'How quickly a spring settles. 0.4 overshoots once and rests; 1 does not overshoot at all.'),

  /* ---------- Transitions ---------- */
  P('trLen', 'Transitions', 'Transition length', 1, .5, 2, .25, '×', 'Scales how long the iris, dissolve, cross-fade, flicker and morph run. 1 is the tuned length (one or two bars).'),
  P('flickSafe', 'Transitions', 'Flicker safety', .1, 0, .3, .01, '', 'A flicker transition alternates whole frames. If the two pictures differ more than this in brightness they would strobe, so they blend LED by LED instead.'),
  P('flickCurve', 'Transitions', 'Flicker ramp', 1.6, 1, 3, .1, '', 'How the new picture takes over in a flicker: higher keeps the old one longer, then switches fast.')
];

/* numbers that are shared but have no slider */
const FIXED = {
  breathHz: [.06, .22],                  /* each LED breathes at a pace in this range */
  fbFloor: .6 / 255, fbRef: 60,          /* echo floor and the frame rate the floor is counted at */
  void: { lit: .04 },                    /* an LED above this counts as lit for the darkness floor */
  voidRise: .35, voidFall: .08,          /* how fast the darkness gate follows */
  trBars: { iris: [1, 2], dissolve: [1, 2], blackout: [0], xfade: [1], flicker: [1], morph: [1, 1, 2] },   /* bars; one is picked */
  blackBeats: .5, flipBeats: .5,         /* a cut through black / an inverted half beat */
  morphK: 420,                           /* points a morph keeps */
  light: .7                              /* the level a "full" scene sits at (flicker safety is measured against it) */
};

/* the seven palettes (4 colours each) */
const PALETTES = [
  { n: 'Rainbow', c: [[1, .1, .2], [1, .8, 0], [0, .9, .5], [.2, .3, 1]] },
  { n: 'Sunset', c: [[1, .25, .1], [1, .62, .15], [.9, .15, .45], [.32, .1, .58]] },
  { n: 'Ocean', c: [[0, .25, .65], [0, .68, .88], [.1, .92, .78], [.05, .2, .55]] },
  { n: 'Ember', c: [[.9, .08, 0], [1, .45, 0], [1, .78, .2], [.45, .03, .02]] },
  { n: 'Aurora', c: [[.1, .9, .45], [.1, .72, .92], [.52, .2, .92], [.05, .5, .35]] },
  { n: 'Candy', c: [[1, .3, .6], [1, .85, .3], [.3, .9, .9], [.7, .4, 1]] },
  { n: 'Green', c: [[0, .42, .08], [.15, .95, .2], [.72, 1, .15], [0, .72, .5]] }
];

const HOUSE = { params: PARAMS, groups: ['Light', 'Colour', 'Motion', 'Transitions'], fixed: FIXED, palettes: PALETTES, rev: 0, byId: {}, val: {} };
const store = {}, bound = {}, subs = [];
const clampTo = (p, v) => { v = +v; if (!isFinite(v)) return p.def; return v < p.min ? p.min : v > p.max ? p.max : v; };
for (const p of PARAMS) {
  HOUSE.byId[p.id] = p; store[p.id] = p.def;
  Object.defineProperty(HOUSE.val, p.id, { enumerable: true, get: () => bound[p.id] ? bound[p.id].get() : store[p.id], set: v => HOUSE.set(p.id, v) });
}
HOUSE.get = id => { const p = HOUSE.byId[id]; if (!p) return undefined; return bound[id] ? bound[id].get() : store[id]; };
HOUSE.def = id => HOUSE.byId[id].def;
HOUSE.set = (id, v) => {
  const p = HOUSE.byId[id]; if (!p) return;
  v = clampTo(p, v);
  if (bound[id]) bound[id].set(v); else store[id] = v;
  HOUSE.rev++; for (const f of subs.slice()) { try { f(id); } catch (e) { console.error(e); } }
};
HOUSE.reset = id => HOUSE.set(id, HOUSE.byId[id].def);
HOUSE.bind = (id, b) => { if (HOUSE.byId[id]) bound[id] = b; };
HOUSE.isBound = id => !!bound[id];
HOUSE.on = f => { subs.push(f); return () => { const i = subs.indexOf(f); if (i >= 0) subs.splice(i, 1); }; };
/* only the values the person changed, and only the ones HOUSE keeps itself (bound ones live in the page's own state) */
HOUSE.dump = () => { const o = {}; for (const p of PARAMS) if (!bound[p.id] && store[p.id] !== p.def) o[p.id] = store[p.id]; return o; };
HOUSE.load = o => { if (!o || typeof o !== 'object') return; for (const p of PARAMS) if (!bound[p.id] && p.id in o) store[p.id] = clampTo(p, o[p.id]); HOUSE.rev++; };
HOUSE.resetAll = () => { for (const p of PARAMS) if (!bound[p.id]) store[p.id] = p.def; HOUSE.rev++; for (const f of subs.slice()) { try { f(null); } catch (e) { console.error(e); } } };

if (typeof module !== 'undefined' && module.exports) module.exports = HOUSE;
root.HOUSE = HOUSE;
})(typeof window !== 'undefined' ? window : globalThis);
