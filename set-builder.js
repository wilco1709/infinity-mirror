/* set-builder.js: window.INF_SETBUILDER, the "New set" builder of the Sets drawer (STRUCTURE PLAN.md, step 6).
   A set = scenes + a style preset. Pick scenes as chips from the scene registry (scenes.js: search box, grouped by kind, a small bar for the energy),
   optionally mark one Intro and some Drop scenes, choose "play in order", and a style preset: Calm <-> Busy, Feel amount, palette (LOOK.palettes).
   It saves a normal library set (library-core.js addSet): the conductor decides when and what; nothing else is asked.
     INF_SETBUILDER.open({ core, host, onSaved })      core = the library core, host = the library host (toast)
     INF_SETBUILDER.entryFor(card) -> library pool entry { key, ref, name, energy, role }
     INF_SETBUILDER.build(state) -> { name, pool, rules, style }   (state = what the dialog holds; used by tests) */
(function (root) {
'use strict';
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC[c]);
const KIND_TITLE = { visual: 'Visuals', scene: 'Scenes', show: 'Shows' };

const entryFor = card => ({ key: card.key, ref: JSON.parse(JSON.stringify(card.ref)), name: card.name, energy: card.energy, role: card.role.slice() });

/* the dialog's state -> what core.addSet takes */
function build(st) {
  const pool = st.picked.map(p => { const e = entryFor(p.card); if (p.mark) e.mark = p.mark; return e; });
  const style = {}; let any = false;
  if (st.useCB) { style.calmBusy = +st.calmBusy; any = true; }
  if (st.useFeel) { style.feel = +st.feel; any = true; }
  if (st.palette != null && st.palette >= 0) { style.palette = +st.palette; any = true; }
  return { name: (st.name || '').trim() || 'New set', pool, rules: { order: st.inOrder ? 'in order' : 'random' }, style: any ? style : null };
}

function injectStyles() {
  if (document.getElementById('sb-style')) return;
  const s = document.createElement('style'); s.id = 'sb-style';
  s.textContent = `
  .sb-back{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1100;display:flex;align-items:center;justify-content:center;padding:12px}
  .sb{background:var(--panel-2,#161920);color:var(--fg,#dde1e8);border:1px solid var(--line,#242830);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.6);width:min(720px,100%);max-height:min(88vh,860px);display:flex;flex-direction:column;font:500 13px var(--ui,system-ui,sans-serif)}
  .sb-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line,#242830)}
  .sb-head h3{margin:0;font-size:15px;flex:1}
  .sb-body{overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:14px}
  .sb-foot{display:flex;gap:8px;justify-content:flex-end;align-items:center;padding:10px 14px;border-top:1px solid var(--line,#242830)}
  .sb-foot .sb-hint{flex:1;color:var(--mute,#8c95a3);font-size:12px}
  .sb label.sb-l{display:block;font-size:11.5px;color:var(--mute,#8c95a3);margin-bottom:4px;text-transform:none}
  .sb input[type=text],.sb input[type=search]{width:100%;box-sizing:border-box;background:var(--bg,#0a0b0d);border:1px solid var(--line,#242830);border-radius:6px;color:inherit;padding:7px 9px;font:inherit;outline:none}
  .sb input[type=text]:focus,.sb input[type=search]:focus{border-color:var(--accent,#ffb23d)}
  .sb-chips{max-height:min(34vh,300px);overflow:auto;border:1px solid var(--line,#242830);border-radius:8px;padding:8px;background:var(--bg,#0a0b0d);display:flex;flex-direction:column;gap:8px}
  .sb-gh{font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--mute,#8c95a3);margin-bottom:4px}
  .sb-gl{display:flex;flex-wrap:wrap;gap:6px}
  .sb-chip{display:flex;flex-direction:column;gap:3px;min-width:104px;max-width:170px;padding:6px 9px 7px;border:1px solid var(--line,#242830);border-radius:8px;background:var(--panel,#101216);color:inherit;cursor:pointer;text-align:left;font:inherit}
  .sb-chip:hover{border-color:var(--mute,#8c95a3)}
  .sb-chip[aria-pressed=true]{border-color:var(--accent,#ffb23d);background:rgba(255,178,61,.12)}
  .sb-chip .sb-n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sb-en{height:4px;border-radius:2px;background:var(--line,#242830);overflow:hidden}
  .sb-en i{display:block;height:100%;background:var(--accent,#ffb23d)}
  .sb-pick{display:flex;flex-direction:column;gap:4px}
  .sb-prow{display:flex;align-items:center;gap:8px;padding:5px 8px;border:1px solid var(--line,#242830);border-radius:6px;background:var(--panel,#101216)}
  .sb-prow .sb-n{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sb-prow .sb-en{width:46px;flex:none}
  .sb-prow button{padding:2px 8px;min-height:26px;font-size:12px}
  .sb-prow button[aria-pressed=true]{background:var(--accent,#ffb23d);color:var(--accent-ink,#111);border-color:var(--accent,#ffb23d)}
  .sb-empty{color:var(--mute,#8c95a3);font-style:italic;padding:4px 0}
  .sb-style{display:grid;grid-template-columns:auto 1fr auto;gap:8px 10px;align-items:center}
  .sb-style .sb-lab{display:flex;align-items:center;gap:6px}
  .sb-style input[type=range]{width:100%}
  .sb-style output{min-width:84px;text-align:right;font-variant-numeric:tabular-nums;color:var(--mute,#8c95a3)}
  .sb-pal{display:flex;gap:6px;flex-wrap:wrap;grid-column:2/4}
  .sb-sw{height:26px;min-width:52px;border-radius:6px;border:2px solid var(--line,#242830);cursor:pointer;padding:0;color:inherit;font:inherit;font-size:11px}
  .sb-sw[aria-pressed=true]{border-color:var(--accent,#ffb23d)}
  .sb-sw.sb-gen{background:var(--panel,#101216);padding:0 8px}
  .sb h4{margin:0 0 6px;font-size:12px;color:var(--fg,#dde1e8)}
  .sb .sb-note{font-weight:400;color:var(--mute,#8c95a3);font-size:11.5px}
  `;
  document.head.appendChild(s);
}

function open(o) {
  o = o || {}; injectStyles();
  const R = root.INF_SCENES, core = o.core, host = o.host || {};
  if (!R || !core) { if (host.toast) host.toast('The set builder needs the scene registry'); return null; }
  if (root.document.getElementById('sbBack')) root.document.getElementById('sbBack').remove();
  const st = { name: '', picked: [], inOrder: false, useCB: false, calmBusy: .5, useFeel: false, feel: 1, palette: null, q: '' };
  const hidden = key => { try { return core.isHidden && core.isHidden(key); } catch (e) { return false; } };
  const back = document.createElement('div'); back.className = 'sb-back'; back.id = 'sbBack';
  back.innerHTML = `<div class="sb" role="dialog" aria-modal="true" aria-labelledby="sbTitle">
    <div class="sb-head"><h3 id="sbTitle">New set</h3><button type="button" class="sb-x" aria-label="Close">✕</button></div>
    <div class="sb-body">
      <div><label class="sb-l" for="sbName">Name</label><input type="text" id="sbName" maxlength="60" placeholder="My set" autocomplete="off"></div>
      <div><h4>1 · Pick scenes <span class="sb-note">click to add, click again to take out. The bar is how much happens in it.</span></h4>
        <input type="search" id="sbSearch" placeholder="Search: name, calm, build, drop, text, epic ..." autocomplete="off" style="margin-bottom:8px">
        <div class="sb-chips" id="sbChips"></div></div>
      <div><h4>2 · Your set <span class="sb-note" id="sbCount"></span></h4><div class="sb-pick" id="sbPick"></div>
        <label style="display:flex;gap:6px;align-items:center;margin-top:8px"><input type="checkbox" id="sbOrder"> Play in order <span class="sb-note">(otherwise the conductor picks by the music)</span></label></div>
      <div><h4>3 · Style <span class="sb-note">applied while the set plays; your General values come back when it stops. Leave a box unticked to keep General.</span></h4>
        <div class="sb-style" id="sbStyle"></div></div>
    </div>
    <div class="sb-foot"><span class="sb-hint" id="sbHint">Pick at least one scene.</span><button type="button" class="sb-cancel">Cancel</button><button type="button" class="sb-save" disabled style="background:var(--accent,#ffb23d);color:var(--accent-ink,#111)">Save set</button></div></div>`;
  document.body.appendChild(back);
  const $ = s => back.querySelector(s);
  const close = () => { back.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  document.addEventListener('keydown', onKey, true);
  $('.sb-x').onclick = close; $('.sb-cancel').onclick = close;
  back.addEventListener('mousedown', e => { if (e.target === back) close(); });
  const bar = c => `<span class="sb-en" title="energy ${Math.round(c.energy * 100)} %"><i style="width:${Math.round(c.energy * 100)}%"></i></span>`;
  const has = c => st.picked.some(p => p.card.key === c.key);

  function drawChips() {
    const box = $('#sbChips'), list = R.search(st.q).filter(c => !hidden(c.key)), by = {};
    box.innerHTML = '';
    for (const c of list) { const g = c.kind + '|' + (c.group || ''); (by[g] = by[g] || { kind: c.kind, group: c.group || '', cards: [] }).cards.push(c); }
    const groups = Object.values(by).sort((a, b) => R.KINDS.indexOf(a.kind) - R.KINDS.indexOf(b.kind));
    if (!groups.length) { box.innerHTML = '<div class="sb-empty">Nothing matches.</div>'; return; }
    for (const g of groups) {
      const d = document.createElement('div'); d.innerHTML = `<div class="sb-gh">${esc(KIND_TITLE[g.kind])}${g.group && g.group !== KIND_TITLE[g.kind] ? ' · ' + esc(g.group) : ''}</div><div class="sb-gl"></div>`;
      const gl = d.querySelector('.sb-gl');
      for (const c of g.cards) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'sb-chip'; b.dataset.key = c.key; b.setAttribute('aria-pressed', String(has(c)));
        b.title = (c.desc ? c.desc + ' · ' : '') + c.role.join(', ') + (c.estimated ? ' (estimated)' : '');
        b.innerHTML = `<span class="sb-n">${has(c) ? '✓ ' : ''}${esc(c.name)}</span>${bar(c)}`;
        b.onclick = () => { if (has(c)) st.picked = st.picked.filter(p => p.card.key !== c.key); else st.picked.push({ card: c, mark: null }); drawChips(); drawPick(); };
        gl.appendChild(b);
      }
      box.appendChild(d);
    }
  }
  function drawPick() {
    const box = $('#sbPick'); box.innerHTML = '';
    if (!st.picked.length) box.innerHTML = '<div class="sb-empty">Nothing yet. Click scenes above.</div>';
    st.picked.forEach((p, i) => {
      const r = document.createElement('div'); r.className = 'sb-prow'; r.dataset.key = p.card.key;
      r.innerHTML = `<span class="sb-n">${esc(p.card.name)}</span>${bar(p.card)}<button type="button" class="sb-intro" aria-pressed="${p.mark === 'intro'}" title="Plays first, when the set starts">Intro</button><button type="button" class="sb-drop" aria-pressed="${p.mark === 'drop'}" title="Plays on the drops (marked scenes wait for their moment)">Drop</button><button type="button" class="sb-rm" aria-label="Take out" title="Take out">✕</button>`;
      r.querySelector('.sb-intro').onclick = () => { const on = p.mark !== 'intro'; st.picked.forEach(q => { if (q.mark === 'intro') q.mark = null; }); p.mark = on ? 'intro' : null; drawPick(); };
      r.querySelector('.sb-drop').onclick = () => { p.mark = p.mark === 'drop' ? null : 'drop'; drawPick(); };
      r.querySelector('.sb-rm').onclick = () => { st.picked.splice(i, 1); drawChips(); drawPick(); };
      box.appendChild(r);
    });
    const n = st.picked.length; $('#sbCount').textContent = n ? '(' + n + ' scene' + (n > 1 ? 's' : '') + ')' : '';
    $('.sb-save').disabled = !n; $('#sbHint').textContent = n ? 'Saved sets appear under My sets and play through the conductor.' : 'Pick at least one scene.';
  }
  function drawStyle() {
    const box = $('#sbStyle'), pals = (root.LOOK && root.LOOK.palettes) || [];
    const cb = v => (v < .35 ? 'Calm' : v > .65 ? 'Busy' : 'Middle') + ' · ' + Math.round(v * 100) + ' %';
    box.innerHTML = `
      <label class="sb-lab"><input type="checkbox" id="sbUseCB"> Calm ↔ Busy</label><input type="range" id="sbCB" min="0" max="1" step="0.01"><output id="sbCBo"></output>
      <label class="sb-lab"><input type="checkbox" id="sbUseFeel"> Feel amount</label><input type="range" id="sbFeel" min="0" max="1" step="0.05"><output id="sbFeelo"></output>
      <span class="sb-lab">Palette</span><div class="sb-pal" id="sbPal"></div>`;
    const sync = () => { $('#sbUseCB').checked = st.useCB; $('#sbCB').value = st.calmBusy; $('#sbCB').disabled = !st.useCB; $('#sbCBo').textContent = st.useCB ? cb(st.calmBusy) : 'as General';
      $('#sbUseFeel').checked = st.useFeel; $('#sbFeel').value = st.feel; $('#sbFeel').disabled = !st.useFeel; $('#sbFeelo').textContent = st.useFeel ? Math.round(st.feel * 100) + ' %' : 'as General'; };
    $('#sbUseCB').onchange = e => { st.useCB = e.target.checked; sync(); };
    $('#sbCB').oninput = e => { st.calmBusy = +e.target.value; sync(); };
    $('#sbUseFeel').onchange = e => { st.useFeel = e.target.checked; sync(); };
    $('#sbFeel').oninput = e => { st.feel = +e.target.value; sync(); };
    const pb = $('#sbPal'), mk = (label, ix, css) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sb-sw' + (ix == null ? ' sb-gen' : ''); b.dataset.pal = ix == null ? '' : ix; b.title = label; if (css) b.style.background = css; else b.textContent = 'General';
      b.onclick = () => { st.palette = ix; [...pb.children].forEach(x => x.setAttribute('aria-pressed', String(x === b))); }; b.setAttribute('aria-pressed', String(st.palette === ix)); pb.appendChild(b); };
    mk('Keep the General palette', null, null);
    pals.forEach((p, i) => { const cs = (p.c || []).map(c => 'rgb(' + c.map(v => Math.round(Math.max(0, Math.min(1, v)) * 255)).join(',') + ')'); mk(p.n || 'Palette ' + (i + 1), i, 'linear-gradient(90deg,' + (cs.length ? cs.join(',') : '#888,#ccc') + ')'); });
    sync();
  }
  $('#sbName').addEventListener('input', e => { st.name = e.target.value; });
  $('#sbSearch').addEventListener('input', e => { st.q = e.target.value; drawChips(); });
  $('#sbOrder').addEventListener('change', e => { st.inOrder = e.target.checked; });
  $('.sb-save').onclick = () => {
    if (!st.picked.length) return;
    const b = build(st), s = core.addSet(b.name, b.pool, b.rules, b.style);
    if (host.toast) host.toast('Saved “' + s.name + '” under My sets');
    close(); if (o.onSaved) o.onSaved(s);
  };
  drawChips(); drawPick(); drawStyle();
  setTimeout(() => { const n = $('#sbName'); if (n) n.focus(); }, 0);
  return { close, state: st, el: back };
}

const API = { open, build, entryFor };
root.INF_SETBUILDER = API;
if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
