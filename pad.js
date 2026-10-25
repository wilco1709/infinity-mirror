/* pad.js: THE PAD (STRUCTURE PLAN): a very clear, minimal sliders panel to work the visuals.
   window.INF_PAD.mount(container, host) -> {refresh(), destroy()}

   HOST CONTRACT (everything optional except openGeneral is recommended):
     host.get(key) / host.set(key, v)   key in 'sensitivity' | 'brightness' | 'calmBusy' | 'variety'; v is always 0..1 (the host maps it to
                                        its real range; these three live elsewhere: Listen, Light, Conductor).
                                        If get() returns undefined/null the slider is shown disabled ("not connected yet").
     host.defaultOf(key)                optional 0..1 default for double-click; fallback sensitivity .5, brightness 1, calmBusy .5
     host.currentVisual()               -> {key, name}  the visual / set / scene the pad is working on
     host.onVisualChange(cb)            cb({key,name}) whenever it changes (returns an unsubscribe fn, optional)
     host.onChange(cb)                  optional: call cb() when host values changed elsewhere, the pad re-reads them
     host.openGeneral()                 "More..." button
   The five Feel sliders write straight into window.FEEL (General values, persisted by feel.js). The Feel tick and Amount are
   per visual (FEEL.setFor(key, ...)). Needs feel.js loaded first. Look: the studio-theme.css variables (with fallbacks).
   Double-click a slider (or press Delete / Backspace on it) = back to default. Hover or focus = tip text in the footer line
   and as native title. Works from ~220 px width. */
(function (root) {
  'use strict';
  const CSS = `
.ipad{--pb:var(--panel,#252526);--pl:var(--line,#3c3c3c);--pf:var(--fg,#ccc);--ph:var(--fg-hi,#e8e8e8);--pm:var(--mute,#9a9a9a);--pa:var(--accent,#55b08c);
  font:13px var(--ui,'Segoe UI',system-ui,sans-serif);color:var(--pf);background:var(--pb);padding:10px 12px 8px;box-sizing:border-box;width:100%;max-width:460px;min-width:200px}
.ipad *{box-sizing:border-box}
.ipad .ph{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-bottom:9px;border-bottom:1px solid var(--pl);margin-bottom:6px}
.ipad .ph label.tick{display:flex;align-items:center;gap:7px;color:var(--ph);font-weight:600;cursor:pointer;min-height:28px}
.ipad .ph input[type=checkbox]{width:17px;height:17px;accent-color:var(--pa);margin:0;cursor:pointer}
.ipad .vis{color:var(--pm);font-size:12px;flex:1 1 90px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ipad .amt{display:flex;align-items:center;gap:8px;flex:1 1 150px;min-width:0}
.ipad .amt span.l{color:var(--pm);font-size:12px}
.ipad .row{display:grid;grid-template-columns:minmax(80px,38%) 1fr 42px;align-items:center;gap:8px;min-height:34px}
.ipad .row .nm{color:var(--ph);font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:default}
.ipad .row output{color:var(--pa);text-align:right;font:12px var(--mono,Consolas,monospace);font-variant-numeric:tabular-nums}
.ipad input[type=range]{width:100%;min-width:0;height:26px;margin:0;accent-color:var(--pa);cursor:pointer;background:transparent}
.ipad input[type=range]:focus-visible,.ipad input[type=checkbox]:focus-visible,.ipad button:focus-visible{outline:1px solid var(--pa);outline-offset:2px}
.ipad input[type=range]:disabled{opacity:.4;cursor:not-allowed}
.ipad .row.off{opacity:.5}
.ipad .sep{height:1px;background:var(--pl);margin:5px 0;opacity:.6}
.ipad .tip{min-height:34px;margin-top:6px;color:var(--pm);font-size:12px;line-height:1.35}
.ipad .ft{display:flex;justify-content:flex-end;padding-top:4px}
.ipad button.more{background:var(--btn,#333436);border:1px solid #454545;border-radius:3px;color:var(--pf);padding:6px 14px;font:inherit;cursor:pointer}
.ipad button.more:hover{background:var(--btn-hover,#3e4042);border-color:#5a5a5a}
@media (max-width:300px){.ipad .row{grid-template-columns:1fr 40px}.ipad .row .nm{grid-column:1/3}.ipad .row input{grid-column:1}}
`;
  const ROWS = [
    { id: 'sensitivity', name: 'Sensitivity', host: 'sensitivity', def: .5, tip: 'How easily a hit counts. Low: only strong kicks, snares and hats move the picture. High: even soft hits do.' },
    { id: 'flash', name: 'Flash', feel: 'flash', tip: 'White wash over the whole picture on a kick. 0 is off. It is rate limited to 3 per second, so it stays safe.' },
    { id: 'contrast', name: 'Contrast', feel: 'contrast', tip: 'Dim between the hits, then pop to full on the hit. Higher: darker between hits, bigger pop.' },
    { id: 'zoom', name: 'Zoom', feel: 'zoom', max: .15, tip: 'The whole picture punches in on every kick and settles back. 0 is off.' },
    { id: 'glitch', name: 'Glitch', feel: 'glitch', tip: 'Rows of the picture tear sideways on hats and gritty highs. 0 is off.' },
    { id: 'dark', name: 'Dark when quiet', feel: 'lullDim', tip: 'In quiet passages the picture goes dark and comes back with the music. 0 leaves it on.' },
    { id: 'sep' },
    { id: 'brightness', name: 'Brightness', host: 'brightness', def: 1, tip: 'Master brightness of every LED. Lower is easier on the eyes and on the power supply.' },
    { id: 'calmBusy', name: 'Calm ↔ Busy', host: 'calmBusy', def: .5, tip: 'How much and how often things change. Calm: long scenes, few moves. Busy: quick changes, lots of motion.' },
    { id: 'variety', name: 'Variety', host: 'variety', def: 0, tip: 'How much the changes vary. 0: even scenes, always the best fit for the music. Higher: short and long scenes mixed, and scenes that fit the music less closely also get a turn.' }
  ];
  const AMOUNT_TIP = 'How much of the Feel effects this visual gets. 0 is the plain picture, 100 % the full effect.';
  const TICK_TIP = 'Feel on or off for this visual only. Off: this visual is left exactly as it draws itself.';

  function injectCss() {
    if (document.getElementById('ipad-css')) return;
    const s = document.createElement('style'); s.id = 'ipad-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  function mount(container, host) {
    host = host || {};
    const FEEL = root.FEEL;
    if (!FEEL) throw new Error('INF_PAD needs feel.js (window.FEEL) loaded first');
    injectCss();
    const pad = el('div', 'ipad'); pad.setAttribute('role', 'group'); pad.setAttribute('aria-label', 'Sliders pad');
    const head = el('div', 'ph');
    const tickL = el('label', 'tick'); tickL.title = TICK_TIP;
    const tick = el('input'); tick.type = 'checkbox'; tick.setAttribute('aria-label', 'Feel on for this visual');
    tickL.append(tick, el('span', null, 'Feel'));
    const vis = el('span', 'vis');
    const amtW = el('div', 'amt'); amtW.title = AMOUNT_TIP;
    const amtL = el('span', 'l', 'Amount');
    const amt = el('input'); amt.type = 'range'; amt.min = 0; amt.max = 1000; amt.step = 5; amt.setAttribute('aria-label', 'Feel amount for this visual');
    const amtO = el('output', null, ''); amtO.style.cssText = 'color:var(--pa);font:12px var(--mono,Consolas,monospace);min-width:36px;text-align:right';
    amtW.append(amtL, amt, amtO);
    head.append(tickL, vis, amtW);
    pad.append(head);
    const tip = el('div', 'tip', ''); tip.setAttribute('aria-live', 'polite');
    const idleTip = 'Hover a slider for what it does. Double-click = back to default.';
    const showTip = t => { tip.textContent = t || idleTip; };
    showTip();

    const rows = [];
    function addRange(input, rowEl, tipText) {
      const on = () => showTip(tipText), off = () => showTip();
      for (const e of [rowEl, input]) { e.addEventListener('mouseenter', on); e.addEventListener('mouseleave', off); }
      input.addEventListener('focus', on); input.addEventListener('blur', off);
      rowEl.title = tipText;
    }
    for (const r of ROWS) {
      if (r.id === 'sep') { pad.append(el('div', 'sep')); continue; }
      const row = el('div', 'row'); row.dataset.id = r.id;
      const id = 'ipad-' + r.id + '-' + Math.random().toString(36).slice(2, 6);
      const nm = el('label', 'nm', r.name); nm.htmlFor = id;
      const inp = el('input'); inp.type = 'range'; inp.id = id; inp.min = 0; inp.max = 1000; inp.step = 1;
      const out = el('output', null, ''); out.htmlFor = id;
      row.append(nm, inp, out); pad.append(row);
      addRange(inp, row, r.tip);
      const R = { r, row, inp, out };
      rows.push(R);
      const max = r.max || 1;
      const read = () => r.feel ? FEEL.get(r.feel) / max : host.get ? host.get(r.host) : null;
      R.read = read;
      R.show = () => {
        const v = read();
        if (v == null || typeof v !== 'number') { inp.disabled = true; inp.value = 0; out.textContent = '–'; return; }
        inp.disabled = false; inp.value = Math.round(v * 1000); out.textContent = Math.round(v * max * 100) + '%';
      };
      const defOf = () => r.feel ? FEEL.defaults[r.feel] / max : (host.defaultOf && host.defaultOf(r.host) != null ? host.defaultOf(r.host) : r.def);
      const write = v => {
        if (r.feel) FEEL.set(r.feel, v * max); else if (host.set) host.set(r.host, v);
        R.show();
      };
      inp.addEventListener('input', () => write(inp.value / 1000));
      inp.addEventListener('dblclick', () => write(+defOf()));
      inp.addEventListener('keydown', e => { if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); write(+defOf()); } });
    }
    pad.append(tip);
    const ft = el('div', 'ft'); const more = el('button', 'more', 'More…'); more.type = 'button';
    more.title = 'General settings: Listen, Feel, Timing, Light, Colour, Motion, Transitions';
    more.addEventListener('click', () => host.openGeneral && host.openGeneral());
    more.addEventListener('mouseenter', () => showTip(more.title)); more.addEventListener('mouseleave', () => showTip());
    ft.append(more); pad.append(ft);

    let cur = (host.currentVisual && host.currentVisual()) || { key: null, name: '' };
    function showFeel() {
      FEEL.setVisual(cur.key);
      const on = FEEL.enabledFor(cur.key);
      tick.checked = on; vis.textContent = cur.name ? 'this visual: ' + cur.name : 'this visual';
      amt.value = Math.round(FEEL.amountFor(cur.key) * 1000); amtO.textContent = Math.round(FEEL.amountFor(cur.key) * 100) + '%';
      amt.disabled = !on;
      for (const R of rows) if (R.r.feel) R.row.classList.toggle('off', !on);
    }
    function refresh() { cur = (host.currentVisual && host.currentVisual()) || cur; showFeel(); rows.forEach(R => R.show()); }
    tick.addEventListener('change', () => { FEEL.setFor(cur.key, { on: tick.checked }); showFeel(); });
    amt.addEventListener('input', () => { FEEL.setFor(cur.key, { amount: amt.value / 1000 }); showFeel(); });
    amt.addEventListener('dblclick', () => { FEEL.setFor(cur.key, { amount: 1 }); showFeel(); });
    for (const [e, t] of [[tickL, TICK_TIP], [amtW, AMOUNT_TIP]]) { e.addEventListener('mouseenter', () => showTip(t)); e.addEventListener('mouseleave', () => showTip()); }

    const unsub = [];
    if (host.onVisualChange) { const u = host.onVisualChange(v => { if (v) cur = v; showFeel(); }); if (typeof u === 'function') unsub.push(u); }
    if (host.onChange) { const u = host.onChange(refresh); if (typeof u === 'function') unsub.push(u); }
    unsub.push(FEEL.onChange(() => { rows.forEach(R => R.show()); }));
    container.appendChild(pad);
    refresh();
    return { el: pad, refresh, destroy() { unsub.forEach(f => f()); pad.remove(); } };
  }
  root.INF_PAD = { mount, ROWS };
})(typeof window !== 'undefined' ? window : globalThis);
