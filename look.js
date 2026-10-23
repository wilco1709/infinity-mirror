/* look.js: window.LOOK, the ONE finishing chain and the shared look tools (STRUCTURE PLAN.md, step 3).
   Every number comes from house-style.js (window.HOUSE). Pure parts (no DOM, no GL) run in node: tests/look.test.js, tests/look-equivalence.js.

   LOOK.post(frame, w, h, ctx)   the one CPU chain, in this order:
        breathing -> motion / anticipation (pull in + dim) -> Feel (FEEL.applyCPU) -> ctx.scene(W) (the show's own picture mods)
        -> ctx.rules(W) (the show's white-screen rule) -> darkness floor -> level x brightness -> trails -> gamma -> white cap -> power limit
        -> (optional) the texture the page shows, with the page's own gamma undone, rows flipped.
      frame: Float32Array w*h*3, row 0 at the top, 0..1 picture values. It is the working buffer: it ends as the picture after the rules and
      the darkness floor (and, with ctx.writeBack, as the final code values). ctx (all optional unless marked):
        duty    Float32Array w*h*3  (required) LED duty out, 0..1 (what the real LEDs get)
        up      Float32Array w*h*4  the texture for the page's sim (code = duty^(1/cgam), row 0 at the bottom)   cgam: the page's LED gamma
        t, hz, ph, breath        breathing: per-LED pace and phase arrays, amplitude (default HOUSE breathing)
        ant                      0..1 anticipation (the beat before a change)
        feel                     true: run FEEL.applyCPU   st: a persistent object for the buffers (pass the same one every frame)
        scene, rules             hooks fn(frame)
        voidTarget, voidSkip     share of LEDs that must stay dark (null = no floor), skip the gate this frame (numbers or functions, read after the hooks)
        level                    number or array of multipliers on top of HOUSE brightness (applied one after the other)
        bri                      replaces HOUSE brightness (a clip's own number goes through level instead)
        trails                   0..1 per-frame keep factor of the previous (brightened) frame, 0 = off
        ampLimit                 amps the frame may draw (default HOUSE supplyA x powerLimit)
        writeBack                put the final code values back into frame
      returns {duty, amps, lim, lit, sum}
   LOOK.hwPack / hwSend          the frame to the real LEDs (WebSocket to lt-ddp-bridge.js), with temporal dithering
   LOOK.flashGate(t)             the ONE white-flash gate (HOUSE flashMax per second, flashGap apart). window.INF_FLASH points to it
   LOOK.tr.*                     iris, dissolve, blackout, xfade, flicker (one safety check), cut, morph, enter(kind), pickBars(type,R)
   LOOK.ease.* / LOOK.spring()   easing curves and the one spring step
   LOOK.palettes / LOOK.palette(i) / LOOK.customPalette(hexList) / LOOK.palSample(pal, u)   */
(function (root) {
'use strict';
const HOUSE = root.HOUSE || (typeof require === 'function' ? require('./house-style.js') : null);
const H = HOUSE.val, F = HOUSE.fixed;
const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
const LOOK = { version: 1 };

/* ---------- easing and springs ---------- */
LOOK.ease = {
  out: x => 1 - Math.pow(1 - clamp(x), 3),                                   /* cubic out: fast start, soft landing */
  in: x => { x = clamp(x); return x * x * x; },
  inOut: x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(2 - 2 * x, 3) / 2; },   /* the iris and the morph */
  smooth: x => { x = clamp(x); return x * x * (3 - 2 * x); }
};
/* one semi-implicit Euler step of a spring following `target`, in sub-steps of at most .004 s. s = {y, v}; hz / zeta default to HOUSE. Returns y. */
LOOK.spring = (s, target, dt, hz, zeta) => {
  const w = 2 * Math.PI * (hz == null ? H.springHz : hz), z = zeta == null ? H.springZeta : zeta;
  const n = Math.max(1, Math.ceil(dt / .004)), h = dt / n;
  for (let j = 0; j < n; j++) { s.v += (w * w * (target - s.y) - 2 * z * w * s.v) * h; s.y += s.v * h; }
  return s.y;
};

/* ---------- the master trail and softness laws (the shader's previous-frame blend) ---------- */
LOOK.trailDecay = (dts, trail) => trail < .01 ? 0 : Math.exp(-dts / (.06 * Math.pow(70, trail)));
LOOK.softBlend = (dts, soft) => soft < .01 ? 1 : 1 - Math.exp(-dts / (.04 * Math.pow(100, soft)));

/* ---------- the flash gate ---------- */
const flashes = [];
LOOK.flashGate = t => {
  while (flashes.length && t - flashes[0] >= 1) flashes.shift();
  if (flashes.length >= H.flashMax || (flashes.length && t - flashes[flashes.length - 1] < H.flashGap)) return false;
  flashes.push(t); return true;
};
LOOK.flashes = flashes;
LOOK.flash = { gate: LOOK.flashGate, get max() { return H.flashMax; }, get gap() { return H.flashGap; } };   /* window.INF_FLASH */

/* ---------- palettes ---------- */
LOOK.palettes = HOUSE.palettes;
LOOK.palette = i => {
  if (i && typeof i === 'object') return i;
  const n = LOOK.palettes.length; i = Math.max(0, Math.min(n - 1, Math.round(+i || 0)));
  return LOOK.palettes[i];
};
const hexRgb = h => { const v = parseInt(String(h).replace('#', ''), 16) || 0; return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; };
/* a clip's own hex list as a palette */
LOOK.customPalette = (list, name) => ({ n: name || 'Custom', c: (list && list.length ? list : ['#ffffff']).map(hexRgb), custom: true });
/* cyclic linear blend along a palette: u in 0..1 wraps; writes into out[3] */
LOOK.palSample = (pal, u, out) => {
  const c = (pal.c || pal), n = c.length, x = (((u % 1) + 1) % 1) * n, i0 = Math.floor(x) % n, i1 = (i0 + 1) % n, f = x - Math.floor(x);
  out = out || [0, 0, 0]; for (let h = 0; h < 3; h++) out[h] = c[i0][h] * (1 - f) + c[i1][h] * f; return out;
};
/* the Director's two tints and its white, from HOUSE (cached until HOUSE changes) */
let colRev = -1, colWhite = [1, .94, .86], colCold = [[.78, .92, 1], [.9, .86, 1]];
const COLD0 = [[.78, .92, 1], [.9, .86, 1]];
LOOK.white = () => { LOOK.colours(); return colWhite; };
LOOK.cold = () => { LOOK.colours(); return colCold; };
LOOK.colours = () => {
  if (colRev === HOUSE.rev) return; colRev = HOUSE.rev;
  const w = H.whiteWarmth, s = H.coldTint;
  colWhite = [1, 1 - .06 * w, 1 - .14 * w];
  colCold = COLD0.map(c => c.map(v => v * s + (1 - s)));
};

/* ---------- the chain ---------- */
const stOf = (ctx, n) => {
  const s = ctx.st || (ctx.st = {});
  if (!s.n || s.n !== n) { s.n = n; s.tmp = new Float32Array(n * 3); s.fx = new Float32Array(n * 3); s.vh = new Uint32Array(64); s.voidG = 0; s.prev = new Float32Array(n * 3); }
  return s;
};

/* breathing: every LED swells and fades at its own pace */
LOOK.breathe = (W, n, t, hz, ph, amp) => {
  if (!hz) return;
  for (let i = 0; i < n; i++) { const j = i * 3, m = 1 + amp * Math.sin(t * hz[i] + ph[i]); W[j] = W[j] * m; W[j + 1] = W[j + 1] * m; W[j + 2] = W[j + 2] * m; }
};

/* the beat before a change pulls the picture in and dims it (bilinear zoom about the centre); the kick's own punch is Feel's */
LOOK.motion = (W, N, q, tmp) => {
  const z = 1 - H.anticipation * q, dim = 1 - H.antDim * q;
  if (Math.abs(z - 1) < .002 && dim > .999) return;
  const T = tmp, c = (N - 1) / 2; T.set(W);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const sx = c + (x - c) / z, sy = c + (y - c) / z, x0 = Math.floor(sx), y0 = Math.floor(sy), fx = sx - x0, fy = sy - y0, j = (y * N + x) * 3;
    let r = 0, g = 0, b = 0;
    for (let k = 0; k < 4; k++) {
      const xx = x0 + (k & 1), yy = y0 + (k >> 1); if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue;
      const w = (k & 1 ? fx : 1 - fx) * (k >> 1 ? fy : 1 - fy), a = (yy * N + xx) * 3; r += T[a] * w; g += T[a + 1] * w; b += T[a + 2] * w;
    }
    W[j] = r * dim; W[j + 1] = g * dim; W[j + 2] = b * dim;
  }
};

/* Feel (feel.js: kick zoom, kick flash, hit contrast, glitch, lull dim) on the picture that goes out. Marks FEEL.cpuDone so the page's shader does not do it again */
LOOK.feel = (W, N, st) => {
  try {
    const FL = root.FEEL, o = FL && FL.last && FL.last(); if (!o) return;
    FL.cpuDone = true; const a = FL.amountNow(); if (a <= 0) return;
    const T = st.fx.length === W.length ? st.fx : (st.fx = new Float32Array(W.length));
    FL.applyCPU(W, N, N, o, a, { dst: T }); W.set(T);
  } catch (e) { /* the chain goes on without it */ }
};

/* the darkness floor (negative space): at least `target` of the LEDs stay dark. The dimmest light is gated away until that holds, softly and smoothed over time; the brightest stays */
LOOK.darkness = (W, n, target, skip, st) => {
  const H64 = st.vh; H64.fill(0); let lit = 0; const litV = F.void.lit;
  for (let j = 0; j < W.length; j += 3) { const v = Math.max(W[j], W[j + 1], W[j + 2]); if (v > litV) { lit++; H64[Math.min(63, Math.floor(v * 64))]++; } }
  const allow = Math.floor(n * (1 - target)); let g = 0;
  if (lit > allow && !skip) { let cnt = 0, b = 63; for (; b > 0; b--) { cnt += H64[b]; if (cnt >= allow) break; } g = b / 64; }
  const gs = st.voidG || 0; st.voidG = gs + (g - gs) * (g > gs ? F.voidRise : F.voidFall);
  const G = st.voidG, G0 = G * .6; if (G < .01) return lit / n;
  for (let j = 0; j < W.length; j += 3) {
    const v = Math.max(W[j], W[j + 1], W[j + 2]); if (v >= G) continue;
    const k = v <= G0 ? 0 : (v - G0) / (G - G0); W[j] *= k; W[j + 1] *= k; W[j + 2] *= k;
  }
  return lit / n;
};

const RES = { duty: null, amps: 0, lim: 1, lit: 0, sum: 0 };
LOOK.post = (W, w, h, ctx) => {
  const N = w, n = w * h, st = stOf(ctx, n), D = ctx.duty;
  LOOK.breathe(W, n, ctx.t || 0, ctx.hz, ctx.ph, ctx.breath == null ? H.breathing : ctx.breath);
  LOOK.motion(W, N, ctx.ant || 0, st.tmp);
  if (ctx.feel) LOOK.feel(W, N, st);
  if (ctx.scene) ctx.scene(W);
  if (ctx.rules) ctx.rules(W);
  let lit = 0;
  { const vt = typeof ctx.voidTarget === 'function' ? ctx.voidTarget() : ctx.voidTarget;   /* the show may answer late (its hooks above can change its mind) */
    if (vt != null) lit = LOOK.darkness(W, n, vt, !!(typeof ctx.voidSkip === 'function' ? ctx.voidSkip() : ctx.voidSkip), st); }
  let bri = ctx.bri == null ? H.brightness : ctx.bri; const lv = ctx.level;
  if (Array.isArray(lv)) for (const m of lv) bri *= m; else if (lv != null) bri *= lv;
  const G = H.gamma, cap = H.whiteCap, tr = ctx.trails || 0, pv = st.prev; let sum = 0;
  for (let j = 0; j < W.length; j += 3) {
    let a = clamp(W[j] * bri), b = clamp(W[j + 1] * bri), c = clamp(W[j + 2] * bri);
    if (tr) { const k = tr; if (pv[j] * k > a) a = pv[j] * k; if (pv[j + 1] * k > b) b = pv[j + 1] * k; if (pv[j + 2] * k > c) c = pv[j + 2] * k; pv[j] = a; pv[j + 1] = b; pv[j + 2] = c; }
    let r = Math.pow(a, G), g = Math.pow(b, G), bl = Math.pow(c, G);
    const wh = Math.min(r, g, bl); if (wh > cap) { r -= wh - cap; g -= wh - cap; bl -= wh - cap; }
    D[j] = r; D[j + 1] = g; D[j + 2] = bl; sum += r + g + bl;
  }
  const amps = sum * H.mA / 1000, lim = ctx.ampLimit == null ? H.supplyA * H.powerLimit : ctx.ampLimit, sc = amps > lim ? lim / amps : 1;
  const U = ctx.up, gs = 1 / (ctx.cgam || 2.2);
  for (let y = 0; y < h; y++) {
    const r0 = (h - 1 - y) * w;
    for (let x = 0; x < w; x++) {
      const j = (y * w + x) * 3, u = (r0 + x) * 4;
      for (let c = 0; c < 3; c++) { D[j + c] *= sc; if (U) U[u + c] = Math.pow(D[j + c], gs); if (ctx.writeBack) W[j + c] = Math.pow(D[j + c], gs); }
      if (U) U[u + 3] = 1;
    }
  }
  RES.duty = D; RES.amps = amps * sc; RES.lim = sc; RES.lit = lit; RES.sum = sum; return RES;
};

/* ---------- the real LEDs ---------- */
/* the frame as bytes in the strip's order, with temporal dithering: every LED keeps its rounding error for the next frame, so slow fades at the dark end do not step.
   o: {wire (0 serpentine), origin (0 top-left, 1 flip x, 2 flip y, 3 both)}. Er is the error buffer (same size as D). */
LOOK.hwPack = (D, Er, N, o, B) => {
  B = B || new Uint8Array(N * N * 3);
  const ser = o.wire === 0, org = o.origin, fx = org === 1 || org === 3, fy = org === 2 || org === 3;
  for (let r = 0; r < N; r++) {
    const y = fy ? N - 1 - r : r;
    for (let k = 0; k < N; k++) {
      let x = ser && r % 2 ? N - 1 - k : k; if (fx) x = N - 1 - x;
      const e = (y * N + x) * 3, d = (r * N + k) * 3;
      for (let c = 0; c < 3; c++) { const v = D[e + c] * 255 + Er[e + c], q = Math.max(0, Math.min(255, Math.round(v))); Er[e + c] = v - q; B[d + c] = q; }
    }
  }
  return B;
};
/* over a WebSocket to lt-ddp-bridge.js (next to this file; a browser cannot send UDP), which sends DDP to WLED. hw: {ws, ok, err, retry, sent}; o: {ip, port (bridge), wire, origin} */
LOOK.hwSend = (hw, D, Er, N, o) => {
  if (!hw.ws || hw.ws.readyState > 1) {
    if (hw.retry && performance.now() < hw.retry) return; hw.retry = performance.now() + 3000;
    try {
      hw.ws = new WebSocket('ws://127.0.0.1:' + o.port); hw.ws.binaryType = 'arraybuffer'; hw.ok = false;
      hw.ws.onopen = () => { hw.ok = true; hw.err = ''; hw.ws.send(JSON.stringify({ host: o.ip, port: 4048 })); };
      hw.ws.onerror = () => { hw.err = 'bridge not running: node lt-ddp-bridge.js'; hw.ok = false; };
      hw.ws.onclose = () => { hw.ok = false; };
    } catch (e) { hw.err = String(e); }
    return;
  }
  if (!hw.ok || hw.ws.bufferedAmount > 4 * N * N * 3) return;
  hw.ws.send(LOOK.hwPack(D, Er, N, o)); hw.sent++;
};

/* ---------- transitions ---------- */
const tr = LOOK.tr = {};
/* how many bars a transition of this type runs: one of the listed lengths (one R() call), scaled by HOUSE trLen; 0 stays 0 (a cut on the bar) */
tr.pickBars = (type, R) => { const bl = F.trBars[type], b = bl[Math.floor(R() * bl.length)]; return b ? Math.max(.25, b * H.trLen) : 0; };
/* the iris shrinks what is drawn into one LED about (ox,oy) (pushed forward, so thin lines survive and pile up into the dot) */
tr.iris = (L, N, p, ox, oy, T) => {
  p = clamp(p); const s = 1 - LOOK.ease.inOut(p); T.fill(0);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const j = (y * N + x) * 3; if (L[j] + L[j + 1] + L[j + 2] < .004) continue;
    const sx = ox + (x - ox) * s, sy = oy + (y - oy) * s, x0 = Math.floor(sx), y0 = Math.floor(sy), fx = sx - x0, fy = sy - y0;
    for (let q = 0; q < 4; q++) {
      const xx = x0 + (q & 1), yy = y0 + (q >> 1); if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue;
      const wt = (q & 1 ? fx : 1 - fx) * (q >> 1 ? fy : 1 - fy), k = (yy * N + xx) * 3; T[k] += L[j] * wt; T[k + 1] += L[j + 1] * wt; T[k + 2] += L[j + 2] * wt;
    }
  }
  for (let j = 0; j < T.length; j++) L[j] = Math.min(1, T[j]);
};
/* the dissolve takes LEDs away in the order of `rank` (random 0..1 per LED) */
tr.dissolve = (L, n, p, rank) => { for (let i = 0; i < n; i++) if (rank[i] < p) L[3 * i] = L[3 * i + 1] = L[3 * i + 2] = 0; };
tr.blackout = L => { L.fill(0); };
tr.cut = (L1, L2) => { L1.set(L2); };
/* the new picture takes over LED by LED in the order of `rank` */
tr.xfade = (L1, L2, n, p, rank) => { for (let i = 0; i < n; i++) if (rank[i] < p) { L1[3 * i] = L2[3 * i]; L1[3 * i + 1] = L2[3 * i + 1]; L1[3 * i + 2] = L2[3 * i + 2]; } };
/* flicker is only safe when the two pictures are about as bright: whole frames alternating between them would strobe otherwise. The ONE check, for every show */
tr.flickerSafe = (L1, L2, light) => {
  let m1 = 0, m2 = 0; for (let j = 0; j < L1.length; j++) { m1 += L1[j]; m2 += L2[j]; }
  return Math.abs(m1 - m2) / L1.length / (light || F.light) <= H.flickSafe;
};
/* flicker: whole frames alternate between the old and the new, the new ever more often (share = p^flickCurve). Unsafe pair: a LED-by-LED blend. Returns 'flicker' or 'xfade' (what ran) */
tr.flicker = (L1, L2, n, p, R, rank, light) => {
  if (tr.flickerSafe(L1, L2, light)) { if (R() < Math.pow(clamp(p), H.flickCurve)) L1.set(L2); return 'flicker'; }
  tr.xfade(L1, L2, n, p, rank); return 'xfade';
};
/* the start of a section/scene by name: what the show should do at once. Returns a plain description (the show owns its events):
     {flash}  one white frame (only if the gate lets it)   {screen:'black', until}  black for a moment   {invert, until}  inverted for half a beat   {xfade:'xfade'|'flicker', bars}   {} a plain cut */
tr.enter = (kind, beat, o) => {
  o = o || {};
  if (kind === 'flash' || kind === 'strobe') return { flash: true };
  if (kind === 'black') return { screen: 'black', until: beat + F.blackBeats };
  if (kind === 'flip') return { invert: true, until: beat + F.flipBeats };
  if (kind === 'xfade' || kind === 'flicker') return { xfade: kind, bars: o.bars == null ? (o.R ? tr.pickBars(kind, o.R) : F.trBars[kind][0] * H.trLen) : o.bars };
  return {};
};
/* morph: the old shape's brightest points (sorted round the middle) flow into the new shape's. pts() takes them from a frame, draw() puts the flowing dots into L (brighter wins) */
tr.morphPts = (L, N, K) => {
  const h = (N - 1) / 2, P = [];
  for (let i = 0; i < N * N; i++) { const j = i * 3, v = Math.max(L[j], L[j + 1], L[j + 2]); if (v > .08) { const x = i % N, y = (i - x) / N; P.push([Math.atan2(y - h, x - h), x, y, v]); } }
  P.sort((a, b) => a[0] - b[0]); if (P.length <= K) return P;
  const o = []; for (let k = 0; k < K; k++) o.push(P[Math.floor(k * P.length / K)]); return o;
};
tr.morph = (L, B, p, A, N, white) => {
  const h = (N - 1) / 2; p = clamp(p);
  const T = tr.morphPts(B, N, Math.max(1, A.length)), n = A.length, fin = clamp((p - .75) / .25), ez = LOOK.ease.inOut;
  const put = (x, y, v, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= N || y >= N) return; const j = (y * N + x) * 3; let q = v * c[0]; if (q > L[j]) L[j] = q; q = v * c[1]; if (q > L[j + 1]) L[j + 1] = q; q = v * c[2]; if (q > L[j + 2]) L[j + 2] = q; };
  for (let i = 0; i < n; i++) {
    const a = A[i], b = T.length ? T[Math.floor(i * T.length / n)] : [0, h, h, 0], q = ez(clamp((p - .3 * i / n) / .7)), x = a[1] + (b[1] - a[1]) * q, y = a[2] + (b[2] - a[2]) * q;
    put(x, y, Math.max(.6, a[3] + (b[3] - a[3]) * q) * (1 - fin), white);
  }
  if (fin > 0) for (let j = 0; j < L.length; j++) L[j] = Math.max(L[j], B[j] * fin);   /* the real new scene takes over */
};

if (typeof module !== 'undefined' && module.exports) module.exports = LOOK;
root.LOOK = LOOK;
if (!root.INF_FLASH || root.INF_FLASH.gate !== LOOK.flashGate) root.INF_FLASH = LOOK.flash;
})(typeof window !== 'undefined' ? window : globalThis);
