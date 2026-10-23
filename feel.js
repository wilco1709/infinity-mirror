/* feel.js: the "Colour fields" recipe as ONE shared layer (STRUCTURE PLAN step 2).
   window.FEEL (browser) / module.exports (node tests). Pure maths + a little state, no DOM, no WebGL needed.

   WHAT IT DOES (defaults = exactly the Text show's Colour fields scene):
     kick flash   full-frame wash on a kick above the threshold, tau .045 s, rate-limited (max 3/s, .15 s apart; reuses
                  window.INF_FLASH.gate when it exists). A kick that may not flash cuts to cyan (CYA .85, tau .09 s).
     hit contrast base = 1 - .5*contrast, gain = base + (1-base)*kickPulse  (dim between hits, pop to full on the hit)
     kick zoom    whole frame zoomed by 1 + zoom*kickPulse (about the centre)
     glitch       row tear (rows of 3 LEDs shifted sideways) driven by the grit band
     lull dim     col *= 1 - lull*.95 (Music's lull value: in .5 s / out .08 s, smoothed by Music, not here)
     scan band    tempo-clock light band (off by default)
   Every effect is scaled by the per-visual Amount (0 = identity, 1 = full).

   INTERFACE
     const out = FEEL.step(dt, input)         call once per frame (dt seconds). input = {
         kick:{on,str,pulse}, snare:{...}, hat:{...}, mel:{...},   on = a hit happened THIS frame, str 0-1,
                                                                   pulse 0-1 optional (if absent FEEL latches its own:
                                                                   pulse = max(pulse, .4+.6*str), decays tau .16/.12/.06/.1 s)
         lull 0-1, grit 0-1 (already thresholded band, e.g. clamp((N5-.55)*2.5)*min(1,eS/eL)),
         beatPhase 0-1 (tempo clock, for the scan band), now (seconds, monotonic) }
       returns out = {strobe, cut, gain, zoom, jit, lull, scan, scanPos, tf, wash:[r,g,b], kick,snare,hat,mel, spring}
       Raw (unscaled) values. Scale for one visual with FEEL.scaled(out, amount) (this is what applyCPU/uniforms do).
     FEEL.applyCPU(rgb, w, h, out, amount, opt)  CPU frame (float 0..1, or opt.max=255 for bytes), y=0 is the TOP row.
                                                 Returns a new array (or opt.dst). Same maths as FEEL.GLSL.
     FEEL.GLSL, FEEL.uniforms(gl, prog, out, amount)   see HOW TO WIRE.
     FEEL.cfg / FEEL.set(name,v) / FEEL.reset(name) / FEEL.defaults / FEEL.onChange(cb)   General values (persisted)
     FEEL.setVisual(key); FEEL.enabledFor(key); FEEL.amountFor(key); FEEL.setFor(key,{on,amount}); FEEL.amountNow()
     Scene hooks (read after step): FEEL.kick .snare .hat .mel (pulses 0-1), FEEL.str (last kick strength),
                                    FEEL.spring (3.5 Hz, zeta .4 follow-through of the kick pulse, can overshoot above 1
                                    and dip below 0).
     FEEL.create()  a fresh independent instance (tests).

   HOW TO WIRE (for the integrator; nothing here is wired yet)
   1. HTML P1 fragment shader (procedural: colours are computed from the pixel coordinate, no texture to sample):
        a. Paste FEEL.GLSL (build it into the source string: `...${FEEL.GLSL}...` before main()).
        b. ZOOM + TEAR need the coordinate BEFORE the pattern is evaluated. Right where main() turns gl_FragCoord into the
           LED coordinate / uv, do:   uv = feelWarp(uv);      (uv = gl_FragCoord.xy/uN, y UP, 0..1). Derive c, p, x from the
           warped uv so every pattern, PUDE and the overlay move together.
        c. COLOUR ops go at the tail, after `col=clamp(col,0.,1.)` (~2659) and BEFORE uPrev/uDecay/uSoft:
               col = feelColour(col, uv);       (uv = the UNwarped screen uv, only used for the scan band)
        d. Per frame: FEEL.uniforms(gl, prog, FEEL.step(dt,input), FEEL.amountNow()); with uN set by the same call
           (`uFeel0.w` = LED rows, pass opts.n if the grid is not square: FEEL.uniforms(gl,prog,out,amount,n)).
   2. Director (real LEDs, CPU frames): in engPost next to engMotion, before gamma/power limit:
               frame = FEEL.applyCPU(frame, w, h, out, amount, {max:255});
        The Director's own bump zoom (C.bump) and its own flash/strobe should then be removed (one layer, not two).
        Both paths read the same `out`, so the screen and the LEDs show the same thing. step() must run ONCE per frame:
        call it in the host and share `out` between the shader and engPost.
   3. Scenes that want the deeper version read FEEL.kick/.snare/.hat/.mel/.spring/.str and set their own size/physics.
      They may set a per-visual Feel tick off (enabledFor(key) false) to avoid double effects.
*/
(function (root) {
  'use strict';
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  const CYA = [0, .82, 1];
  const TAU = { kick: .16, snare: .12, hat: .06, mel: .1 };   /* hit-latched pulse decay */
  const SPR_W = 2 * Math.PI * 3.5, SPR_Z = .4;
  const STROBE_TAU = .045, CUT_TAU = .09, CUT_AMT = .85, LULL_STRENGTH = .95;
  const GATE_MAX = 3, GATE_GAP = .15;
  const KEY = 'infFeel.v1';
  const DEFAULTS = Object.freeze({
    flash: .8, flashThr: .3, flashColour: 'white', contrast: .25, zoom: .04,
    glitch: 1, lullDim: 1, scan: 0, amount: 1
  });
  const RANGE = { flash: [0, 1], flashThr: [0, 1], contrast: [0, 1], zoom: [0, .15], glitch: [0, 1], lullDim: [0, 1], scan: [0, 1], amount: [0, 1] };
  const PALETTE_WASH = [1, .45, .85];   /* flashColour 'palette' until the Colour layer supplies input.paletteCol */

  /* integer hash shared with the GLSL (exact on both sides: uint32 maths) */
  function hash(a, b) {
    let x = (Math.imul(a >>> 0, 747796405) + Math.imul(b >>> 0, 2891336453) + 1) >>> 0;
    x = (x ^ (x >>> 16)) >>> 0; x = Math.imul(x, 2246822519) >>> 0;
    x = (x ^ (x >>> 13)) >>> 0; x = Math.imul(x, 3266489917) >>> 0;
    x = (x ^ (x >>> 16)) >>> 0;
    return (x >>> 8) / 16777216;
  }

  /* scale raw per-frame values by a visual's Amount: amount 0 is the identity */
  function scaled(out, amount) {
    const A = clamp(amount == null ? 1 : amount, 0, 1);
    return {
      gain: 1 + (out.gain - 1) * A, zoom: 1 + (out.zoom - 1) * A, jit: out.jit * A, lull: out.lull * A,
      cut: out.cut * A, strobe: out.strobe * A, scan: out.scan * A, scanPos: out.scanPos, tf: out.tf,
      wash: out.wash
    };
  }

  /* the whole per-pixel recipe, scalar form: also the reference the CPU path and the tests use.
     u,v = output pixel centre, 0..1, v UP. Returns {su,sv} = where to read the source from (after zoom + tear). */
  function warp(P, u, v, n) {
    const z = P.zoom;
    let su = .5 + (u - .5) / z, sv = .5 + (v - .5) / z, off = 0;
    if (P.jit > 0) {
      const r = Math.floor(v * n / 3);
      const h1 = hash(r, P.tf), h2 = hash(r + 977, P.tf);
      if (h1 >= 1 - P.jit * .7) off = (h2 - .5) * P.jit * .25;
    }
    return { su: su + off, sv: sv };
  }
  function colour(P, c, v, n) {
    const col = [c[0] * P.gain, c[1] * P.gain, c[2] * P.gain];
    const dark = 1 - P.lull;
    for (let k = 0; k < 3; k++) col[k] *= dark;
    for (let k = 0; k < 3; k++) col[k] += (CYA[k] - col[k]) * CUT_AMT * P.cut;
    if (P.scan > 0) {
      const band = Math.exp(-Math.abs(v - (1 - P.scanPos)) * 7) * ((Math.floor(v * n) % 3) < 1 ? 1 : .2) * .35;
      const b = band * P.scan;
      col[0] += (CYA[0] + (1 - CYA[0]) * .4) * b; col[1] += (CYA[1] + (1 - CYA[1]) * .4) * b; col[2] += (CYA[2] + (1 - CYA[2]) * .4) * b;
    }
    for (let k = 0; k < 3; k++) { col[k] = clamp(col[k], 0, 1); col[k] += (P.wash[k] - col[k]) * P.strobe; }
    return col;
  }

  const GLSL = `
/* ---- feel.js: FEEL.GLSL (see HOW TO WIRE in feel.js) ---- */
uniform vec4 uFeel0;   /* zoom, jit, tf (row-tear time step), n (LED rows) */
uniform vec4 uFeel1;   /* gain, lull, cut, strobe */
uniform vec4 uFeel2;   /* wash rgb, scan strength */
uniform vec4 uFeel3;   /* scanPos, 0, 0, 0 */
uint feelH(uint a,uint b){uint x=a*747796405u+b*2891336453u+1u;x^=x>>16;x*=2246822519u;x^=x>>13;x*=3266489917u;x^=x>>16;return x;}
float feelR(uint a,uint b){return float(feelH(a,b)>>8)*(1./16777216.);}
/* uv: 0..1, y UP. Returns the uv the pattern must be drawn at (kick zoom + row tear). Call at the TOP of main(). */
vec2 feelWarp(vec2 uv){
  vec2 w=vec2(.5)+(uv-.5)/uFeel0.x;
  if(uFeel0.y>0.){
    uint r=uint(floor(uv.y*uFeel0.w/3.)),tf=uint(uFeel0.z);
    if(feelR(r,tf)>=1.-uFeel0.y*.7)w.x+=(feelR(r+977u,tf)-.5)*uFeel0.y*.25;
  }
  return w;
}
/* col: the pattern colour; uv: the UNWARPED screen uv. Call at the tail, after clamp, before uPrev/uDecay/uSoft. */
vec3 feelColour(vec3 col,vec2 uv){
  vec3 CY=vec3(0.,.82,1.);
  col*=uFeel1.x;
  col*=1.-uFeel1.y;
  col=mix(col,CY,.85*uFeel1.z);
  if(uFeel2.w>0.){
    float band=exp(-abs(uv.y-(1.-uFeel3.x))*7.)*(mod(floor(uv.y*uFeel0.w),3.)<1.?1.:.2)*.35;
    col+=mix(CY,vec3(1.),.4)*band*uFeel2.w;
  }
  col=clamp(col,0.,1.);
  return mix(col,uFeel2.xyz,uFeel1.w);
}
`;

  function makeFeel() {
    const F = {};
    let cfg = Object.assign({}, DEFAULTS);
    let perVisual = {};
    let visual = null;
    const listeners = [];
    let st = { strobe: 0, cut: 0, p: { kick: 0, snare: 0, hat: 0, mel: 0 }, sp: 0, sv: 0, str: 0, flashes: [], out: null };
    F.defaults = DEFAULTS; F.range = RANGE; F.CYA = CYA; F.GLSL = GLSL; F.hash = hash; F.scaled = scaled;
    F.warp = warp; F.colour = colour;
    F.cfg = cfg;
    F.storage = (function () { try { return root.localStorage || null; } catch (e) { return null; } })();

    function load() {
      try {
        const s = F.storage && F.storage.getItem(KEY); if (!s) return;
        const j = JSON.parse(s);
        if (j.general) for (const k in DEFAULTS) if (k in j.general) cfg[k] = j.general[k];
        if (j.visuals && typeof j.visuals === 'object') perVisual = j.visuals;
      } catch (e) { }
    }
    function save() {
      try { F.storage && F.storage.setItem(KEY, JSON.stringify({ general: cfg, visuals: perVisual })); } catch (e) { }
    }
    function emit(what) { for (const f of listeners.slice()) try { f(what); } catch (e) { } }
    F.load = load;
    F.onChange = cb => { listeners.push(cb); return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); }; };

    F.set = function (name, v) {
      if (!(name in DEFAULTS)) return;
      if (name === 'flashColour') { if (v !== 'white' && v !== 'cyan' && v !== 'palette') return; }
      else if (name === 'lullDim') v = v === true ? 1 : v === false ? 0 : clamp(+v, 0, 1);
      else { const r = RANGE[name]; v = clamp(+v, r[0], r[1]); if (v !== v) return; }
      cfg[name] = v; save(); emit(name);
    };
    F.get = name => cfg[name];
    F.reset = function (name) { F.set(name, DEFAULTS[name]); };
    F.resetAll = function () { for (const k in DEFAULTS) cfg[k] = DEFAULTS[k]; save(); emit('*'); };

    F.setVisual = function (key) { visual = key; emit('visual'); };
    F.visual = () => visual;
    F.enabledFor = function (key) { const v = perVisual[key == null ? visual : key]; return v && 'on' in v ? !!v.on : true; };
    F.amountFor = function (key) { const v = perVisual[key == null ? visual : key]; return v && 'amount' in v ? clamp(+v.amount, 0, 1) : 1; };
    F.setFor = function (key, p) {
      key = key == null ? visual : key; if (key == null) return;
      const v = perVisual[key] || (perVisual[key] = {});
      if (p && 'on' in p) v.on = !!p.on;
      if (p && 'amount' in p) v.amount = clamp(+p.amount, 0, 1);
      if (v.on !== false && (v.amount === undefined || v.amount === 1)) { if (v.on === undefined || v.on === true) delete perVisual[key]; }
      save(); emit('visual');
    };
    /* what to hand to uniforms()/applyCPU(): 0 when the visual's Feel tick is off. General amount multiplies. */
    F.amountNow = function (key) { return F.enabledFor(key) ? F.amountFor(key) * cfg.amount : 0; };

    function gate(now) {
      const G = root.INF_FLASH;
      if (G && typeof G.gate === 'function') return !!G.gate(now);
      const f = st.flashes;
      while (f.length && now - f[0] >= 1) f.shift();
      if (f.length >= GATE_MAX || (f.length && now - f[f.length - 1] < GATE_GAP)) return false;
      f.push(now); return true;
    }

    F.step = function (dt, input) {
      input = input || {};
      dt = clamp(+dt || 0, 0, .25);
      const now = input.now != null ? input.now : 0;
      st.strobe *= Math.exp(-dt / STROBE_TAU); st.cut *= Math.exp(-dt / CUT_TAU);
      if (st.strobe < 1e-4) st.strobe = 0; if (st.cut < 1e-4) st.cut = 0;
      /* hit-latched pulses */
      for (const k of ['kick', 'snare', 'hat', 'mel']) {
        const h = input[k] || {};
        let p = st.p[k] * Math.exp(-dt / TAU[k]);
        if (h.on) p = Math.max(p, .4 + .6 * clamp(h.str == null ? 1 : h.str, 0, 1));
        st.p[k] = p < 1e-4 ? 0 : p;
      }
      const kin = input.kick || {};
      const kp = typeof kin.pulse === 'number' ? clamp(kin.pulse, 0, 1) : st.p.kick;
      const sp = {
        snare: typeof (input.snare || {}).pulse === 'number' ? input.snare.pulse : st.p.snare,
        hat: typeof (input.hat || {}).pulse === 'number' ? input.hat.pulse : st.p.hat,
        mel: typeof (input.mel || {}).pulse === 'number' ? input.mel.pulse : st.p.mel
      };
      /* kick flash / cyan cut */
      let wash = CYA.slice(0);
      if (kin.on) {
        const str = clamp(kin.str == null ? 1 : kin.str, 0, 1); st.str = str;
        if (cfg.flash > 0 || cfg.flashColour === 'cyan') {
          if (cfg.flashColour === 'cyan') { if (str > cfg.flashThr) st.cut = 1; }
          else if (str > cfg.flashThr && cfg.flash > 0 && gate(now)) {
            st.strobe = Math.max(st.strobe, Math.min(1, .5 + .5 * str) * cfg.flash);
            st.washCol = cfg.flashColour === 'palette' ? (input.paletteCol || PALETTE_WASH) : [1, 1, 1];
          } else st.cut = 1;   /* a kick that may not flash white cuts to cyan */
        }
      }
      /* 3.5 Hz spring following the kick pulse (semi-implicit Euler, small substeps) */
      let left = dt;
      while (left > 0) {
        const h = Math.min(left, .004); left -= h;
        st.sv += (SPR_W * SPR_W * (kp - st.sp) - 2 * SPR_Z * SPR_W * st.sv) * h; st.sp += st.sv * h;
      }
      const base = 1 - .5 * cfg.contrast;
      const lull = cfg.lullDim ? clamp(input.lull || 0, 0, 1) * LULL_STRENGTH * cfg.lullDim : 0;
      const out = {
        strobe: st.strobe, cut: st.cut,
        gain: base + (1 - base) * kp,
        zoom: 1 + cfg.zoom * kp,
        jit: clamp(input.grit || 0, 0, 1) * cfg.glitch,
        lull,
        scan: cfg.scan, scanPos: ((input.beatPhase || 0) % 1 + 1) % 1,
        tf: Math.floor(now * 18),
        wash: st.strobe > 0 ? (st.washCol || [1, 1, 1]) : [1, 1, 1],
        kick: kp, snare: sp.snare, hat: sp.hat, mel: sp.mel, spring: st.sp
      };
      st.out = out;
      return out;
    };
    /* scene hooks (latest frame) */
    Object.defineProperties(F, {
      kick: { get: () => st.out ? st.out.kick : 0 }, snare: { get: () => st.out ? st.out.snare : 0 },
      hat: { get: () => st.out ? st.out.hat : 0 }, mel: { get: () => st.out ? st.out.mel : 0 },
      str: { get: () => st.str }, spring: { get: () => st.sp }
    });
    F.last = () => st.out;
    F.resetState = function () { st = { strobe: 0, cut: 0, p: { kick: 0, snare: 0, hat: 0, mel: 0 }, sp: 0, sv: 0, str: 0, flashes: [], out: null }; };

    F.applyCPU = function (rgb, w, h, out, amount, opt) {
      opt = opt || {};
      const M = opt.max || 1, P = scaled(out, amount);
      const dst = opt.dst || new (rgb.constructor === Array ? Array : Float32Array)(rgb.length);
      const idle = P.gain === 1 && P.zoom === 1 && P.jit === 0 && P.lull === 0 && P.cut === 0 && P.strobe === 0 && P.scan === 0;
      if (idle) { for (let i = 0; i < rgb.length; i++) dst[i] = rgb[i]; return dst; }
      for (let y = 0; y < h; y++) {
        const v = 1 - (y + .5) / h;
        for (let x = 0; x < w; x++) {
          const u = (x + .5) / w;
          const s = warp(P, u, v, h);
          const sx = clamp(Math.floor(s.su * w), 0, w - 1), sy = clamp(Math.floor((1 - s.sv) * h), 0, h - 1);
          const si = (sy * w + sx) * 3, di = (y * w + x) * 3;
          const c = colour(P, [rgb[si] / M, rgb[si + 1] / M, rgb[si + 2] / M], v, h);
          dst[di] = c[0] * M; dst[di + 1] = c[1] * M; dst[di + 2] = c[2] * M;
        }
      }
      return dst;
    };

    const locs = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
    F.uniforms = function (gl, prog, out, amount, n) {
      let L = locs && locs.get(prog);
      if (!L) { L = ['uFeel0', 'uFeel1', 'uFeel2', 'uFeel3'].map(nm => gl.getUniformLocation(prog, nm)); locs && locs.set(prog, L); }
      const P = scaled(out, amount);
      n = n || F.n || 64;
      gl.uniform4f(L[0], P.zoom, P.jit, P.tf, n);
      gl.uniform4f(L[1], P.gain, P.lull, P.cut, P.strobe);
      gl.uniform4f(L[2], P.wash[0], P.wash[1], P.wash[2], P.scan);
      gl.uniform4f(L[3], P.scanPos, 0, 0, 0);
    };

    load();
    return F;
  }

  const FEEL = makeFeel();
  FEEL.create = makeFeel; FEEL.KEY = KEY;
  if (typeof module !== 'undefined' && module.exports) module.exports = FEEL;
  if (root) root.FEEL = FEEL;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
