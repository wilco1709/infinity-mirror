/* DESK_SONG: builds the desk's song map (see DESK PLAN.md, "Song map") from a song's AudioBuffer, and from its Demucs stems when the
   helper (desk-helper.js, 127.0.0.1:8794) has them. Grid, sections, drops, chords come from VJ.analyse on the full mix (vj-runtime.js);
   the per-sound strips come from the stems (or, without stems, from the full mix, with lower confidence).
   Works in the browser (window.DESK_SONG) and in node (module.exports) : the core works on plain channel arrays {L,R,sr}.
     DESK_SONG.build(audioBuffer, {name, bytes, id?, stems?:{drums,bass,vocals,other: AudioBuffer}}, progress) -> Promise<map>
     DESK_SONG.fetchStems(fileBytes, name, progress) -> Promise<{drums,bass,vocals,other}|null>   (null = helper not running / failed)
     DESK_SONG.get(id) / put(map)   IndexedDB cache (falls back to nothing when IndexedDB is unavailable)
     DESK_SONG.load(audioBuffer, opts, progress) -> cached map if one is as good as what we could build now, else build + cache */
(function (root) {
  'use strict';
  const RATE = 20, FFTN = 4096, HOP = 1024, VERSION = 3, HELPER = 'http://127.0.0.1:8794';
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const tick = () => new Promise(r => setTimeout(r, 0));

  function makeFFT(n) {
    const lv = Math.log2(n), rev = new Uint32Array(n), co = new Float64Array(n / 2), si = new Float64Array(n / 2);
    for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < lv; b++) r |= ((i >> b) & 1) << (lv - 1 - b); rev[i] = r; }
    for (let i = 0; i < n / 2; i++) { co[i] = Math.cos(2 * Math.PI * i / n); si[i] = -Math.sin(2 * Math.PI * i / n); }
    return (re, im) => {
      for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
      for (let size = 2; size <= n; size <<= 1) { const h = size >> 1, st = n / size; for (let i = 0; i < n; i += size) for (let j = 0, k = 0; j < h; j++, k += st) {
        const a = i + j, b = a + h, tr = re[b] * co[k] - im[b] * si[k], ti = re[b] * si[k] + im[b] * co[k]; re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; } }
    };
  }
  const FFT = makeFFT(FFTN), WIN = new Float64Array(FFTN);
  for (let i = 0; i < FFTN; i++) WIN[i] = .5 - .5 * Math.cos(2 * Math.PI * i / (FFTN - 1));

  function pct(arr, q, stride = 1) { const v = []; for (let i = 0; i < arr.length; i += stride) v.push(arr[i]); v.sort((a, b) => a - b); return v.length ? v[Math.min(v.length - 1, Math.floor(q * v.length))] : 0; }

  /* ---------- one spectral pass over a stereo source: band levels (dB) for mid, side level of the voice band, flatness, centroid, pitch lines ---------- */
  async function spec(ch, prog) {
    const L = ch.L, R = ch.R || ch.L, sr = ch.sr, len = L.length, F = Math.max(8, Math.floor(len / HOP)), hz = sr / FFTN, fps = sr / HOP;
    const bin = (f) => Math.max(1, Math.min(FFTN / 2 - 1, Math.round(f / hz)));
    const B = [[20, 90], [90, 300], [300, 2500], [2500, 6000], [6000, 20000]].map(([a, b]) => [bin(a), bin(b)]);
    const FM = [bin(1500), bin(3400)], V = [bin(200), bin(5000)], FL = [bin(6000), bin(16000)], M1 = [bin(150), bin(1500)], BP = [bin(30), bin(300)];
    const S = { F, fps, sr, dur: len / sr, b: [0, 1, 2, 3, 4].map(() => new Float32Array(F)), bv: new Float32Array(F), sv: new Float32Array(F), flat: new Float32Array(F),
      cent: new Float32Array(F), fm: new Float32Array(F), mel: new Float32Array(F), melC: new Float32Array(F), bp: new Float32Array(F), bpC: new Float32Array(F) };
    const re = new Float64Array(FFTN), im = new Float64Array(FFTN), Pm = new Float64Array(FFTN / 2), Ps = new Float64Array(FFTN / 2), nrm = Math.pow(4 / FFTN, 2);
    const db = x => 10 * Math.log10(x * nrm + 1e-12);
    const peak = (a, b, minHz) => { let bk = a, bp = 0, sum = 0; for (let k = a; k <= b; k++) { sum += Pm[k]; if (Pm[k] > bp) { bp = Pm[k]; bk = k; } }
      const p = Pm[bk - 1] || 0, q = Pm[bk + 1] || 0, d = p - 2 * bp + q, sh = d !== 0 ? clamp(.5 * (p - q) / d, -.5, .5) : 0; return [69 + 12 * Math.log2(Math.max(minHz, (bk + sh) * hz) / 440), sum > 0 ? bp / sum : 0]; };
    for (let i = 0; i < F; i++) {
      const st = i * HOP - FFTN / 2 + HOP / 2;
      for (let k = 0; k < FFTN; k++) { const p = st + k; if (p < 0 || p >= len) { re[k] = 0; im[k] = 0; } else { const l = L[p], r = R[p]; re[k] = (l + r) * .5 * WIN[k]; im[k] = (l - r) * .5 * WIN[k]; } }
      FFT(re, im);
      for (let k = 1; k < FFTN / 2; k++) {   /* mid and side from one complex FFT of (mid + i side) */
        const zr = re[k], zi = im[k], wr = re[FFTN - k], wi = im[FFTN - k];
        const mr = (zr + wr) / 2, mi = (zi - wi) / 2, sr_ = (zi + wi) / 2, si_ = -(zr - wr) / 2;
        Pm[k] = mr * mr + mi * mi; Ps[k] = sr_ * sr_ + si_ * si_;
      }
      for (let g = 0; g < 5; g++) { let s = 0; for (let k = B[g][0]; k <= B[g][1]; k++) s += Pm[k]; S.b[g][i] = db(s); }
      { let s = 0, t = 0; for (let k = V[0]; k <= V[1]; k++) { s += Pm[k]; t += Ps[k]; } S.bv[i] = db(s); S.sv[i] = db(t); }
      { let s = 0; for (let k = FM[0]; k <= FM[1]; k++) s += Pm[k]; S.fm[i] = db(s); }
      { let lg = 0, ar = 0; const m = FL[1] - FL[0] + 1; for (let k = FL[0]; k <= FL[1]; k++) { lg += Math.log(Pm[k] + 1e-14); ar += Pm[k]; } S.flat[i] = clamp(Math.exp(lg / m) / (ar / m + 1e-14)); }
      { let cs = 0, cw = 0; for (let k = 1; k < FFTN / 2; k++) { cs += Pm[k] * k; cw += Pm[k]; } S.cent[i] = clamp(Math.log2(Math.max(40, cs / (cw + 1e-14) * hz) / 40) / Math.log2(500)); }
      { const m = peak(M1[0], M1[1], 20); S.mel[i] = m[0]; S.melC[i] = m[1]; }
      { const m = peak(BP[0], BP[1], 20); S.bp[i] = m[0]; S.bpC[i] = m[1]; }
      if (i % 300 === 0) { if (prog) prog(i / F); await tick(); }
    }
    return S;
  }

  /* ---------- helpers on the spectral arrays ---------- */
  /* a dB track into 0..1: its loudest 2 % = 1, 30 dB below = 0 */
  function lvlN(x, span = 30) { const p = pct(x, .98, 3), o = new Float32Array(x.length); for (let i = 0; i < x.length; i++) o[i] = clamp((x[i] - (p - span)) / span); return o; }
  function rise(x) { const o = new Float32Array(x.length); for (let i = 3; i < x.length; i++) o[i] = Math.max(0, x[i] - Math.min(x[i - 1], x[i - 2], x[i - 3])); return o; }
  /* hits by peak-picking a flux with an adaptive threshold (as the Director's ears do), each hit then fading with tau seconds */
  function hits(flux, fps, { min = 5, gap = .08, K = 2.5, tau = .15, scale = 18 }) {
    const F = flux.length, W = Math.round(.75 * fps), cs = new Float64Array(F + 1), cd = new Float64Array(F + 1), o = new Float32Array(F);
    for (let i = 0; i < F; i++) cs[i + 1] = cs[i] + flux[i];
    for (let i = 0; i < F; i++) { const a = Math.max(0, i - W), b = Math.min(F, i + W + 1), m = (cs[b] - cs[a]) / (b - a); cd[i + 1] = cd[i] + Math.abs(flux[i] - m); }
    let last = -1e9; const imp = new Float32Array(F);
    for (let i = 3; i < F - 3; i++) { const v = flux[i]; if (v < min) continue; let mx = true; for (let k = -2; k <= 2; k++) if (flux[i + k] > v) { mx = false; break; } if (!mx) continue;
      const a = Math.max(0, i - W), b = Math.min(F, i + W + 1), m = (cs[b] - cs[a]) / (b - a), dv = (cd[b] - cd[a]) / (b - a);
      if (v < m + K * dv) continue; if ((i - last) / fps < gap) continue; imp[i] = Math.min(1, v / scale); last = i; }
    const dec = Math.exp(-1 / (fps * tau)); let e = 0; for (let i = 0; i < F; i++) { e = Math.max(imp[i], e * dec); o[i] = e; }
    return o;
  }
  function gated(flux, lev, below) { const p = pct(lev, .98, 3), o = new Float32Array(flux.length); for (let i = 0; i < flux.length; i++) o[i] = lev[i] > p - below ? flux[i] : 0; return o; }
  function smooth(x, fps, tauUp, tauDown) { const o = new Float32Array(x.length), au = 1 - Math.exp(-1 / (fps * tauUp)), ad = 1 - Math.exp(-1 / (fps * tauDown)); let v = 0;
    for (let i = 0; i < x.length; i++) { v += (x[i] - v) * (x[i] > v ? au : ad); o[i] = v; } return o; }
  function minFilter(x, w) { const o = new Float32Array(x.length); for (let i = 0; i < x.length; i++) { let m = 1; for (let k = Math.max(0, i - w); k <= i; k++) if (x[k] < m) m = x[k]; o[i] = m; } return o; }
  /* fine frames (fps) to the map's RATE with max over each output frame */
  function down(x, fps, n) { const o = new Float32Array(n); for (let j = 0; j < n; j++) { const a = Math.min(x.length - 1, Math.floor(j / RATE * fps)), b = Math.min(x.length - 1, Math.max(a, Math.floor((j + 1) / RATE * fps - 1e-9))); let m = 0; for (let i = a; i <= b; i++) if (x[i] > m) m = x[i]; o[j] = m; } return o; }
  function pitchTrack(mid, conf, fps, n, thr) {   /* midi + confidence at the fine rate -> 0..1 within the 5..95 % range of confident notes, held through gaps */
    const v = []; for (let i = 0; i < mid.length; i++) if (conf[i] > thr) v.push(mid[i]); v.sort((a, b) => a - b);
    let lo = v.length ? v[Math.floor(v.length * .05)] : 48, hi = v.length ? v[Math.floor(v.length * .95)] : 84; if (hi - lo < 12) hi = lo + 12;
    const o = new Float32Array(n); let held = .5;
    for (let j = 0; j < n; j++) { const i = Math.min(mid.length - 1, Math.round((j + .5) / RATE * fps)); if (conf[i] > thr) held = clamp((mid[i] - lo) / (hi - lo)); o[j] = held; }
    return o;
  }
  function movavg(x, w) { const o = new Float32Array(x.length); let s = 0; for (let i = 0; i < x.length; i++) { s += x[i]; if (i >= w) s -= x[i - w]; o[i] = s / Math.min(i + 1, w); } return o; }
  function mul(a, b) { const o = new Float32Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] * b[i]; return o; }
  function map1(a, f) { const o = new Float32Array(a.length); for (let i = 0; i < a.length; i++) o[i] = f(a[i], i); return o; }

  /* risers / downlifters as RAMP EVENTS on the smoothed high-band level (3..16 kHz, hats' hits filtered out by a running minimum):
     a riser is a steady climb over 1.5..8 bars that peaks at a boundary (section start, drop, big step; up to 1.3 bars after the peak) or is so large (2.5x the song's own threshold) that it needs none;
     a downlifter is the mirror, starting at a boundary. Thresholds come from this song's own range of that level. Strength rises along the ramp. */
  function ramps(So, bpm, bounds, free) {
    const fps = So.fps, F = So.F, bar = 240 / bpm * fps, beat = bar / 4, up = new Float32Array(F), dn = new Float32Array(F);
    const h = new Float32Array(F); for (let i = 0; i < F; i++) h[i] = (So.b[3][i] + So.b[4][i]) / 2;
    const w = Math.max(1, Math.round(.25 * bar)), m = new Float32Array(F);
    for (let i = 0; i < F; i++) { let mn = 1e9; for (let k = Math.max(0, i - w); k <= i; k++) if (h[k] < mn) mn = h[k]; m[i] = mn; }
    const a = 1 - Math.exp(-1 / (.2 * bar)); let v = m[0]; const s = new Float32Array(F); for (let i = 0; i < F; i++) { v += (m[i] - v) * a; s[i] = v; }
    const range = Math.max(6, pct(s, .95) - pct(s, .1)), thr = Math.max(4, .3 * range), bf = bounds.map(t => t * fps);
    const near = (i, lo, hi) => bf.some(b => b - i >= lo * bar && b - i <= hi * bar);
    const steady = (i0, i1, sg) => { let p = 0, c = 0; const st = beat * 2; for (let k = i0 + st; k <= i1; k += st) { c++; if (sg * (s[Math.round(k)] - s[Math.round(k - st)]) > 0) p++; } return c ? p / c : 0; };
    const r = Math.round(bar), maxBack = Math.round(8 * bar);
    for (const sg of [1, -1]) for (let i = r; i < F - 1; i++) {
      let ok = true; for (let k = Math.max(0, i - r); k <= Math.min(F - 1, i + r); k++) if (sg * s[k] > sg * s[i]) { ok = false; break; } if (!ok) continue;
      let st = i; for (let k = Math.max(0, i - maxBack); k <= i; k++) if (sg * s[k] < sg * s[st] - 1e-9) st = k;
      const rise = sg * (s[i] - s[st]), dur = (i - st) / bar; if (dur < 1.5 || rise < thr || st < 1.5 * bar || steady(st, i, sg) < .5) continue;   /* st: a fade-in from the song's start is no riser */
      const atB = sg > 0 ? near(i, -.5, 1.3) : near(st, -1.3, .5);
      if (!atB && !(free && rise >= 2.5 * thr && dur >= 3)) continue;
      const str = clamp(.45 + .55 * rise / (2.5 * thr)) * (atB ? 1 : .7), arr = sg > 0 ? up : dn;
      for (let k = st; k <= Math.min(F - 1, i + Math.round(.3 * bar)); k++) { const p = clamp((k - st) / (i - st)); arr[k] = Math.max(arr[k], str * (.25 + .75 * p * p)); }
    }
    return { up, dn };
  }
  /* ---------- the strips from one set of sources ---------- */
  const CONF_STEMS = { kick: .9, snare: .8, hats: .8, crash: .6, sub: .9, bassline: .8, leadvox: .85, backing: .7, lead: .65, chords: .7, risers: .6, downlifters: .5 };
  const CONF_MIX = { kick: .7, snare: .55, hats: .6, crash: .4, sub: .6, bassline: .45, leadvox: .25, backing: .2, lead: .4, chords: .45, risers: .45, downlifters: .4 };

  function strips(Sd, Sb, Sv, So, stems, grid, n, bounds) {
    const env = {}, pitch = {};
    /* drums */
    { const lev0 = Sd.b[0], r0 = rise(lev0), r2 = rise(Sd.b[2]), r3 = rise(Sd.b[3]), r4 = rise(Sd.b[4]), fps = Sd.fps;
      const kf = gated(r0, lev0, 18);
      env.kick = down(hits(kf, fps, { min: 6, gap: .15, tau: .16 }), fps, n);
      const sf = new Float32Array(Sd.F); for (let i = 0; i < Sd.F; i++) { const s = Math.min(r2[i], r3[i]); sf[i] = Sd.flat[i] > .12 && s > r0[i] * .8 ? s : 0; }
      env.snare = down(hits(gated(sf, Sd.b[3], 22), fps, { min: 5, gap: .1, tau: .14 }), fps, n);
      const hf = map1(r4, (v, i) => Math.max(0, v - .5 * r2[i]));
      env.hats = down(hits(gated(hf, Sd.b[4], 22), fps, { min: 5, gap: .05, tau: .07 }), fps, n);
      env.crash = down(hits(gated(r4, Sd.b[4], 16), fps, { min: 9, gap: .5, K: 3, tau: 1.0 }), fps, n); }
    /* bass */
    { const fps = Sb.fps; env.sub = down(smooth(lvlN(Sb.b[0], 24), fps, .03, .1), fps, n);
      const lb = lvlN(Sb.b[1], 24); env.bassline = down(smooth(stems ? lb : mul(lb, map1(lvlN(Sb.b[0], 24), v => 1 - .4 * v)), fps, .03, .1), fps, n);
      pitch.bass = pitchTrack(Sb.bp, Sb.bpC, fps, n, .25); }
    /* voice */
    { const fps = Sv.fps, lv = lvlN(Sv.bv, 28);
      if (stems) {
        env.leadvox = down(smooth(lv, fps, .05, .25), fps, n);
        const share = map1(Sv.bv, (m, i) => 1 / (1 + Math.pow(10, (m - Sv.sv[i]) / 10))), sv = lvlN(Sv.sv, 28);
        env.backing = down(smooth(mul(sv, map1(share, s => clamp((s - .08) / .25))), fps, .05, .3), fps, n);
      } else {   /* estimate from the full mix. A single-song test (stems as truth) showed pitch continuity and centring do NOT separate the voice from the synths, but three song-relative cues do,
                    each z-scored over the song and smoothed over 0.5 s: formant band (1.5-3.4 kHz) strong against 300-2500 Hz (presence), a bright centroid, and a wide image (side level vs mid). Modest precision, so conf stays low. */
        const w = Math.max(1, Math.round(.5 * fps)), z = x => { let m = 0, s = 0; for (let i = 0; i < x.length; i++) m += x[i]; m /= x.length || 1; for (let i = 0; i < x.length; i++) s += (x[i] - m) * (x[i] - m); s = Math.sqrt(s / (x.length || 1)) + 1e-9; return map1(x, v => (v - m) / s); };
        const zl = z(movavg(map1(Sv.fm, (v, i) => v - Sv.b[2][i]), w)), zc = z(movavg(Sv.cent, w)), zw = z(movavg(map1(Sv.sv, (v, i) => v - Sv.bv[i]), w));
        const gate = map1(zl, (v, i) => clamp(.2 + .2 * (v + zc[i] + zw[i])));
        env.leadvox = down(movavg(mul(movavg(lv, w), gate), 3), fps, n);
        const share = map1(Sv.bv, (m, i) => 1 / (1 + Math.pow(10, (m - Sv.sv[i]) / 10)));
        env.backing = down(smooth(mul(lvlN(Sv.sv, 28), map1(share, s => clamp((s - .2) / .3))), fps, .05, .3), fps, n); } }
    /* other: lead, chords, risers */
    { const fps = So.fps, lv = lvlN(So.bv, 28), pitched = map1(So.melC, c => clamp((c - .15) / .3));
      env.lead = down(smooth(mul(lv, pitched), fps, .04, .2), fps, n);
      pitch.lead = pitchTrack(So.mel, So.melC, fps, n, .2);
      const sus = minFilter(lvlN(So.b[2], 28), Math.round(.4 * fps)); env.chords = down(smooth(sus, fps, .2, .4), fps, n);
      const rd = ramps(So, grid.bpm, bounds || [], stems);
      env.risers = down(smooth(rd.up, fps, .08, .25), fps, n);
      env.downlifters = down(smooth(rd.dn, fps, .08, .25), fps, n); }    for (const k of Object.keys(env)) { const e = env[k]; for (let i = 0; i < e.length; i++) e[i] = clamp(e[i]); }
    return { env, pitch };
  }

  /* ---------- the whole map from plain channels ---------- */
  function fakeBuf(ch) { const c = [ch.L, ch.R || ch.L]; return { sampleRate: ch.sr, numberOfChannels: c.length, length: ch.L.length, duration: ch.L.length / ch.sr, getChannelData: i => c[Math.min(i, c.length - 1)] }; }
  function getVJ() { if (root.VJ) return root.VJ; if (typeof require === 'function') { if (typeof globalThis.window === 'undefined') globalThis.window = globalThis; require('./vj-runtime.js'); return globalThis.VJ; } throw new Error('vj-runtime.js not loaded'); }

  async function buildFromChannels(mix, stemCh, opts, progress) {
    const prog = typeof progress === 'function' ? progress : () => { };
    opts = opts || {}; const VJ = getVJ(), hasStems = !!(stemCh && stemCh.drums && stemCh.bass && stemCh.vocals && stemCh.other);
    const pre = opts._pre;   /* test hook: precomputed {A, S} */
    const A = pre ? pre.A : await VJ.analyse(fakeBuf(mix), p => prog(p * .45));
    const dur = A.dur, n = Math.floor(dur * RATE), barS = 4 * 60 / A.grid.bpm, t0 = A.grid.t0;
    const sources = hasStems ? [['drums', stemCh.drums], ['bass', stemCh.bass], ['vocals', stemCh.vocals], ['other', stemCh.other]] : [['mix', mix]];
    const S = {}; let si = 0;
    if (pre) for (const [nm] of sources) S[nm] = pre.S[nm];
    else for (const [nm, ch] of sources) { const b = .45 + .5 * si / sources.length; S[nm] = await spec(ch, p => prog(b + .5 / sources.length * p)); si++; }
    let stepT = [];
    /* sections in seconds, covering the whole song */
    const sections = A.sections.map(s => ({ k: s.label, a: clamp(t0 + s.start * barS, 0, dur), b: clamp(t0 + s.end * barS, 0, dur) })).filter(s => s.b > s.a);
    if (sections.length) { sections[0].a = 0; sections[sections.length - 1].b = dur; for (let i = 1; i < sections.length; i++) sections[i].a = sections[i - 1].b; }
    let drops = A.moments.filter(m => m.type === 'drop').map(m => Math.round((t0 + m.bar * barS) * 100) / 100).filter(t => t >= 0 && t < dur);
    /* VJ's sections cut on 4-bar lines; a drop is the bar where sub + loudness + highs step up for the next 4 bars, found to the bar */
    {
      const bars = A.bars, e = bars.map(x => x.sub + .5 * x.rms + .5 * x.high), sb = bars.map(x => x.sub);
      const step = (x, k) => { if (k < 4 || k + 4 > x.length) return [0, 0]; let a = 0, b = 0; for (let q = 1; q <= 4; q++) { a += x[k - q]; b += x[k + q - 1]; } return [(b - a) / 4, a / 4]; };
      const diff = e.map((_, k) => step(e, k)[0]);
      const found = [];
      /* thresholds relative to this song's own dynamics (10..90 % range of the bar energy and of the sub) */
      const rng = x => { const s = Array.from(x).sort((a, b) => a - b); if (!s.length) return 0; return s[Math.min(s.length - 1, Math.floor(.9 * s.length))] - s[Math.floor(.1 * s.length)]; };
      const dMin = Math.max(.1, .28 * rng(e)), dSub = Math.max(.04, .22 * rng(sb));
      /* big step in energy, with the low end coming in, from a clearly quieter stretch (pre <= 65 % of post) */
      const cand = [];
      for (let k = 4; k < e.length - 3; k++) { const d = diff[k], pre = step(e, k)[1]; if (d < dMin || step(sb, k)[0] < dSub || pre > .65 * (pre + d)) continue; let mx = true; for (let q = -4; q <= 4; q++) if (diff[k + q] > d) { mx = false; break; } if (mx) cand.push({ k, pre, t: Math.round((t0 + bars[k].b * barS) * 100) / 100 }); }
      /* a second step 16 bars or less after a drop, out of a stretch already much louder than what came before that drop, is the same drop growing: no new drop */
      let prev = null; stepT = cand.map(c => c.t);
      for (const c of cand) { if (prev && c.k - prev.k <= 16 && c.pre > 1.5 * prev.pre) continue; found.push(c.t); prev = c; }
      const merged = found.slice();
      for (const t of drops) if (!found.some(f => Math.abs(f - t) < 8) && !cand.some(c => Math.abs(c.t - t) < 8)) merged.push(t);
      drops = merged.filter(t => t >= 0 && t < dur).sort((a, b) => a - b);
      for (const t of found) {   /* make the sections agree: a drop section starts here */
        const i = sections.findIndex(s => t >= s.a - 1e-6 && t < s.b - 1e-6); if (i < 0) continue; const s = sections[i];
        if (Math.abs(s.a - t) < 6 * barS) { if (i > 0) sections[i - 1].b = t; s.a = t; s.k = 'drop'; if (s.b <= s.a) sections.splice(i, 1); }
        else if (s.b - t > 2 * barS) { sections.splice(i + 1, 0, { k: 'drop', a: t, b: s.b }); s.b = t; }
      }
    }
    const bounds = sections.map(s => s.a).concat(drops, stepT);   /* where a riser may end / a downlifter may start */
    const st = hasStems ? strips(S.drums, S.bass, S.vocals, S.other, true, A.grid, n, bounds) : strips(S.mix, S.mix, S.mix, S.mix, false, A.grid, n, bounds);
    /* chord per frame: root*2+minor from the mix's per-beat chords */
    const chord = new Int16Array(n).fill(-1), per = 60 / A.grid.bpm, C = A.chords;
    for (let j = 0; j < n; j++) { const b = Math.floor((j / RATE - t0) / per) - C.k0; if (b >= 0 && b < C.root.length && C.root[b] >= 0) chord[j] = C.root[b] * 2 + C.minor[b]; }
    const conf = Object.assign({}, hasStems ? CONF_STEMS : CONF_MIX);
    prog(1);
    return { v: VERSION, id: opts.id || null, name: opts.name || '', dur, rate: RATE, grid: { bpm: A.grid.bpm, t0: A.grid.t0 }, sections, drops, env: st.env, pitch: st.pitch, chord,
      key: A.key, stems: hasStems, conf };
  }
  /* the analysis was tuned on 44.1 kHz: a browser decodes at its own rate (often 48 kHz) and the grid/drops then came out different, so resample first */
  const rs44 = (a, sr) => { if (!a || Math.abs(sr - 44100) < 1) return a; const r = sr / 44100, n = Math.floor((a.length - 1) / r), o = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i * r, j = Math.floor(x), f = x - j; o[i] = a[j] * (1 - f) + a[j + 1] * f; } return o; };
  const chOf = b => { const sr = b.sampleRate; return { L: rs44(b.getChannelData(0), sr), R: b.numberOfChannels > 1 ? rs44(b.getChannelData(1), sr) : null, sr: Math.abs(sr - 44100) < 1 ? sr : 44100 }; };

  async function sha1(bytes) {
    const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes.buffer || bytes, bytes.byteOffset || 0, bytes.byteLength);
    if (root.crypto && root.crypto.subtle) { const d = await root.crypto.subtle.digest('SHA-1', u); return Array.from(new Uint8Array(d), x => x.toString(16).padStart(2, '0')).join(''); }
    return require('crypto').createHash('sha1').update(u).digest('hex');
  }

  async function build(audioBuffer, opts, progress) {
    opts = opts || {}; const o = Object.assign({}, opts);
    if (!o.id && o.bytes) o.id = await sha1(o.bytes);
    let stemCh = null;
    if (o.stems && o.stems.drums && o.stems.bass && o.stems.vocals && o.stems.other) stemCh = { drums: chOf(o.stems.drums), bass: chOf(o.stems.bass), vocals: chOf(o.stems.vocals), other: chOf(o.stems.other) };
    return buildFromChannels(chOf(audioBuffer), stemCh, o, progress);
  }

  /* ---------- the helper ---------- */
  async function helperUp() { try { const r = await fetch(HELPER + '/health', { cache: 'no-store' }); return r.ok; } catch (e) { return false; } }
  async function fetchStems(fileBytes, name, progress) {
    const prog = typeof progress === 'function' ? progress : () => { };
    try {
      if (!(await helperUp())) return null;
      let r = await (await fetch(HELPER + '/stems', { method: 'POST', headers: { 'X-Name': encodeURIComponent(name || 'song.mp3') }, body: fileBytes })).json();
      while (!r.ready) {
        if (r.status === 'error' || r.status === 'unknown' || r.error) return null;
        prog(r.progress || 0); await new Promise(res => setTimeout(res, 1500));
        r = await (await fetch(HELPER + '/stems/' + r.id)).json();
      }
      const AC = root.AudioContext || root.webkitAudioContext, ctx = (() => { try { return new AC({ sampleRate: 44100 }); } catch (e) { return new AC(); } })(), out = {};
      for (const k of ['drums', 'bass', 'vocals', 'other']) { const buf = await (await fetch(r.stems[k])).arrayBuffer(); out[k] = await ctx.decodeAudioData(buf); }
      try { ctx.close(); } catch (e) { /* ignore */ }
      prog(1); return out;
    } catch (e) { return null; }
  }

  /* ---------- IndexedDB cache by id ---------- */
  let dbp = null;
  function db() { if (!dbp) dbp = new Promise((res, rej) => { try { const q = root.indexedDB.open('desk-songmap', 1); q.onupgradeneeded = () => q.result.createObjectStore('maps'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); } catch (e) { rej(e); } }); return dbp; }
  async function get(id) { try { const d = await db(); return await new Promise(res => { const q = d.transaction('maps').objectStore('maps').get(id); q.onsuccess = () => res(q.result && q.result.v === VERSION ? q.result : null); q.onerror = () => res(null); }); } catch (e) { return null; } }
  async function put(map) { try { if (!map || !map.id) return false; const old = await get(map.id); if (old && old.stems && !map.stems) return false;
      const d = await db(); return await new Promise(res => { const tx = d.transaction('maps', 'readwrite'); tx.objectStore('maps').put(map, map.id); tx.oncomplete = () => res(true); tx.onerror = () => res(false); }); } catch (e) { return false; } }
  async function load(audioBuffer, opts, progress) {
    opts = opts || {}; const id = opts.id || (opts.bytes ? await sha1(opts.bytes) : null), hasStems = !!opts.stems;
    if (id) { const c = await get(id); if (c && (c.stems || !hasStems)) return c; }
    const m = await build(audioBuffer, Object.assign({}, opts, { id }), progress); if (id) put(m); return m;
  }

  const API = { RATE, VERSION, build, buildFromChannels, fetchStems, helperUp, get, put, load, sha1, spec, strips };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.DESK_SONG = API;
})(typeof window !== 'undefined' ? window : globalThis);
