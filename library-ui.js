/**
 * library-ui.js
 * User interface for Stories, Sets, Favourites, Variants, and Context Menu.
 * Exposes window.INF_LIBRARY.
 */
(function (root, factory) {
  root.INF_LIBRARY = factory(root.INF_LIB_CORE);
})(typeof window !== 'undefined' ? window : this, function (coreModule) {
  'use strict';

  let core = null;
  let host = null;
  let selectedKeys = new Set();
  let multiSelectBarEl = null;
  let activeMenuEl = null;
  let activePopoverEl = null;
  let opts = {};
  const shut = new Set(); // fold titles the user closed; survives re-render
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  // folds: build one with a persistent open/shut state
  function mkFold(title, count) {
    const f = document.createElement('div');
    f.className = 'fold' + (shut.has(title) ? ' shut' : '');
    f.innerHTML = `<button class="sh" type="button"><span>${esc(title)}</span><span class="cnt">${count}</span></button><div class="fb"></div>`;
    f.querySelector('.sh').onclick = () => {
      f.classList.toggle('shut');
      if (f.classList.contains('shut')) shut.add(title); else shut.delete(title);
    };
    return f;
  }

  function injectStyles() {
    if (document.getElementById('lib-style')) return;
    const style = document.createElement('style');
    style.id = 'lib-style';
    style.textContent = `
      .lib-star {
        position: absolute;
        top: 4px;
        right: 6px;
        color: var(--accent, #ffb23d);
        font-size: 14px;
        pointer-events: none;
        user-select: none;
        line-height: 1;
      }
      .lib-selected {
        outline: 2px solid var(--accent, #ffb23d) !important;
        outline-offset: -2px;
      }
      .lib-multibar {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--panel-2, #161920);
        border: 1px solid var(--line, #242830);
        padding: 8px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        display: flex;
        gap: 12px;
        align-items: center;
        z-index: 1000;
        font: 500 13px var(--ui);
        color: var(--fg, #dde1e8);
      }
      .lib-multibar button {
        padding: 4px 10px;
        font-size: 12px;
        min-height: 28px;
      }
      .lib-menu {
        position: fixed;
        background: var(--panel-2, #161920);
        border: 1px solid var(--line, #242830);
        border-radius: 8px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.6);
        padding: 4px 0;
        min-width: 170px;
        z-index: 1000;
        font: 500 13px var(--ui);
        color: var(--fg, #dde1e8);
      }
      .lib-menu-item {
        padding: 8px 14px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
        position: relative;
      }
      .lib-menu-item:hover, .lib-menu-item.lib-focused {
        background: var(--line, #242830);
        color: #fff;
      }
      .lib-menu-item.lib-disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .lib-submenu {
        position: absolute;
        left: 100%;
        top: 0;
        background: var(--panel-2, #161920);
        border: 1px solid var(--line, #242830);
        border-radius: 8px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.6);
        padding: 4px 0;
        min-width: 150px;
        display: none;
      }
      .lib-menu-item:hover > .lib-submenu {
        display: block;
      }
      .lib-popover {
        position: fixed;
        background: var(--panel-2, #161920);
        border: 1px solid var(--line, #242830);
        border-radius: 8px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.6);
        padding: 12px 14px;
        z-index: 1001;
        display: flex;
        flex-direction: column;
        gap: 10px;
        font: 500 13px var(--ui);
        color: var(--fg, #dde1e8);
        min-width: 240px;
      }
      .lib-popover input[type="text"] {
        background: var(--bg, #0a0b0d);
        border: 1px solid var(--line, #242830);
        border-radius: 4px;
        color: var(--fg, #dde1e8);
        padding: 6px 8px;
        font: inherit;
        outline: none;
      }
      .lib-popover input[type="text"]:focus {
        border-color: var(--accent, #ffb23d);
      }
      .lib-popover-btns {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .lib-popover-btns button {
        min-height: 28px;
        padding: 4px 12px;
      }
      .lib-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        border: 1px solid var(--line, #242830);
        border-radius: 6px;
        background: var(--panel, #101216);
        gap: 8px;
      }
      .lib-row.lib-running {
        border-color: var(--accent, #ffb23d);
        background: rgba(255, 178, 61, 0.08);
      }
      .lib-row-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
      }
      .lib-row-title {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .lib-row-sub {
        font-size: 11.5px;
        color: var(--mute, #8c95a3);
      }
      .lib-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }
      .lib-actions button {
        padding: 4px 8px;
        min-height: 28px;
      }
      .lib-editor {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
        margin-top: 4px;
        border: 1px dashed var(--line, #242830);
        border-radius: 6px;
        background: var(--bg, #0a0b0d);
      }
      .lib-step-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        justify-content: space-between;
      }
      .lib-step-row.lib-step-active {
        color: var(--accent, #ffb23d);
        font-weight: 600;
      }
      .lib-step-row input[type="number"] {
        width: 48px;
        background: var(--panel-2, #161920);
        border: 1px solid var(--line, #242830);
        border-radius: 4px;
        color: var(--fg, #dde1e8);
        padding: 2px 4px;
        font: inherit;
        text-align: center;
      }
      .lib-missing {
        color: var(--warn, #ff7a5c) !important;
        text-decoration: line-through;
        opacity: 0.7;
      }
      .lib-backup { width: 100%; box-sizing: border-box; background: var(--bg, #0a0b0d); color: var(--fg, #dde1e8); border: 1px solid var(--line, #242830); border-radius: 6px; font: 11px var(--mono, monospace); padding: 6px; }
      .lib-menu-item.lib-open > .lib-submenu { display: block; }
      .lib-submenu.lib-flip { left: auto; right: 100%; }
      .lib-row, .lib-row-info { overflow: hidden; }
      .lib-row .lib-btn-del { opacity: 0; color: var(--mute, #8c95a3); }
      .lib-row:hover .lib-btn-del, .lib-row .lib-btn-del:focus-visible { opacity: 1; }
      .lib-row .lib-btn-del:hover { color: #fff; background: var(--warn, #ff7a5c); border-color: var(--warn, #ff7a5c); }
      .lib-hint {
        color: var(--mute, #8c95a3);
        font-size: 12px;
        font-style: italic;
        padding: 6px 0;
      }
    `;
    document.head.appendChild(style);
  }

  function promptName(title, defaultValue, anchorPos, onConfirm) {
    closePopover();
    const pop = document.createElement('div');
    pop.className = 'lib-popover';
    pop.innerHTML = `
      <div style="font-weight:600">${esc(title)}</div>
      <input type="text" value="${esc(defaultValue)}" />
      <div class="lib-popover-btns">
        <button type="button" class="lib-pop-cancel">Cancel</button>
        <button type="button" class="lib-pop-ok" style="background:var(--accent);color:var(--accent-ink)">OK</button>
      </div>
    `;

    const x = Math.min(anchorPos.x, window.innerWidth - 260);
    const y = Math.min(anchorPos.y, window.innerHeight - 120);
    pop.style.left = Math.max(10, x) + 'px';
    pop.style.top = Math.max(10, y) + 'px';

    document.body.appendChild(pop);
    activePopoverEl = pop;

    const input = pop.querySelector('input');
    input.focus();
    input.select();

    function done(val) {
      closePopover();
      if (val && val.trim()) onConfirm(val.trim());
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') done(input.value);
      if (e.key === 'Escape') closePopover();
    });

    pop.querySelector('.lib-pop-ok').addEventListener('click', () => done(input.value));
    pop.querySelector('.lib-pop-cancel').addEventListener('click', () => closePopover());
  }

  function closePopover() {
    if (activePopoverEl) {
      activePopoverEl.remove();
      activePopoverEl = null;
    }
  }

  function closeMenu() {
    if (activeMenuEl) {
      activeMenuEl.remove();
      activeMenuEl = null;
    }
  }

  // "Are you sure?" before anything is deleted; note = one line on what happens
  function confirmDelete(name, note, anchorPos, onYes) {
    closeMenu();
    closePopover();
    const pop = document.createElement('div');
    pop.className = 'lib-popover';
    pop.setAttribute('role', 'alertdialog');
    pop.innerHTML = `
      <div style="font-weight:600">Delete “${esc(name)}”?</div>
      ${note ? `<div class="lib-hint" style="font-style:normal;padding:0;max-width:260px">${esc(note)}</div>` : ''}
      <div class="lib-popover-btns">
        <button type="button" class="lib-pop-cancel">Cancel</button>
        <button type="button" class="lib-pop-ok" style="background:var(--warn);color:#000;border-color:var(--warn)">Yes, delete</button>
      </div>
    `;
    const x = Math.min(anchorPos.x, window.innerWidth - 290);
    const y = Math.min(anchorPos.y, window.innerHeight - 140);
    pop.style.left = Math.max(10, x) + 'px';
    pop.style.top = Math.max(10, y) + 'px';
    document.body.appendChild(pop);
    activePopoverEl = pop;
    const cancel = pop.querySelector('.lib-pop-cancel');
    cancel.focus();
    pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopover(); });
    cancel.addEventListener('click', () => closePopover());
    pop.querySelector('.lib-pop-ok').addEventListener('click', () => { closePopover(); onYes(); });
  }
  const posOf = (el) => { const r = el.getBoundingClientRect(); return { x: r.right - 250, y: r.bottom + 4 }; };

  // --- Multi-select Floating Bar ---
  function updateMultiSelectBar() {
    if (selectedKeys.size === 0) {
      if (multiSelectBarEl) {
        multiSelectBarEl.remove();
        multiSelectBarEl = null;
      }
      return;
    }

    if (!multiSelectBarEl) {
      multiSelectBarEl = document.createElement('div');
      multiSelectBarEl.className = 'lib-multibar';
      document.body.appendChild(multiSelectBarEl);
    }

    multiSelectBarEl.innerHTML = `
      <span>${selectedKeys.size} selected</span>
      <button type="button" class="lib-btn-set">New set from these</button>
      <button type="button" class="lib-btn-story">New story from these</button>
      <button type="button" class="lib-btn-clear">Clear</button>
    `;

    multiSelectBarEl.querySelector('.lib-btn-clear').onclick = () => {
      clearSelection();
    };

    multiSelectBarEl.querySelector('.lib-btn-set').onclick = (e) => {
      const rect = e.target.getBoundingClientRect();
      promptName('New set name', 'My Set', { x: rect.left, y: rect.top - 80 }, (name) => {
        const pool = getEntriesForKeys(Array.from(selectedKeys));
        core.addSet(name, pool);
        clearSelection();
        renderAll();
      });
    };

    multiSelectBarEl.querySelector('.lib-btn-story').onclick = (e) => {
      const rect = e.target.getBoundingClientRect();
      promptName('New story name', 'My Story', { x: rect.left, y: rect.top - 80 }, (name) => {
        const entries = getEntriesForKeys(Array.from(selectedKeys));
        const steps = entries.map(entry => ({ entry, bars: 8 }));
        core.addStory(name, steps, true);
        clearSelection();
        renderAll();
      });
    };
  }

  function clearSelection() {
    selectedKeys.clear();
    document.querySelectorAll('.lib-selected').forEach(el => el.classList.remove('lib-selected'));
    updateMultiSelectBar();
  }

  function getEntriesForKeys(keys) {
    const allItems = host && typeof host.items === 'function' ? host.items() : [];
    const itemMap = new Map();
    allItems.forEach(i => itemMap.set(i.key, i));
    const variants = core.getVariants();
    variants.forEach(v => itemMap.set(v.id, v));

    return keys.map(k => {
      const it = itemMap.get(k);
      return {
        key: k,
        ref: it ? it.ref : null,
        name: it ? it.name : k,
        settings: (it && it.settings) ? it.settings : null
      };
    });
  }

  // arrows move, Right opens a submenu, Left closes it, Enter picks
  function menuKey(e) {
    const menu = activeMenuEl; if (!menu) return;
    const open = menu.querySelector('.lib-menu-item.lib-open');
    const list = open ? Array.from(open.querySelector('.lib-submenu').children) : Array.from(menu.children).filter(c => c.classList.contains('lib-menu-item'));
    const cur = list.findIndex(c => c.classList.contains('lib-focused'));
    const go = (i) => { list.forEach(c => c.classList.remove('lib-focused')); list[(i + list.length) % list.length].classList.add('lib-focused'); };
    const k = e.key;
    if (k === 'ArrowDown') { go(cur + 1); e.preventDefault(); }
    else if (k === 'ArrowUp') { go(cur < 0 ? -1 : cur - 1); e.preventDefault(); }
    else if (k === 'ArrowRight') { const c = list[cur]; if (c && c.querySelector(':scope > .lib-submenu')) { c.classList.add('lib-open'); c.classList.remove('lib-focused'); const sub = c.querySelector('.lib-submenu').children; sub[0].classList.add('lib-focused'); } e.preventDefault(); }
    else if (k === 'ArrowLeft') { if (open) { const sub = open.querySelector('.lib-submenu'); Array.from(sub.children).forEach(c => c.classList.remove('lib-focused')); open.classList.remove('lib-open'); open.classList.add('lib-focused'); } e.preventDefault(); }
    else if (k === 'Enter') { const c = list[cur]; if (c && c.onclick) c.onclick(new MouseEvent('click', { bubbles: false })); else if (c) c.click(); e.preventDefault(); }
  }

  // --- Right-click Menu ---
  function openContextMenu(e, targetCard, key) {
    e.preventDefault();
    closeMenu();

    const allItems = host.items();
    const item = allItems.find(i => i.key === key) || core.getVariant(key);
    const ref = item ? item.ref : null;
    const mkEntry = () => ({ key, ref, name: item ? item.name : key, settings: (item && item.settings) || null });
    const isFav = core.isFavourite(key);
    const stories = core.getStories();
    const sets = core.getSets();

    const menu = document.createElement('div');
    menu.className = 'lib-menu';

    // 1. Star / Unstar
    const starItem = document.createElement('div');
    starItem.className = 'lib-menu-item';
    starItem.textContent = isFav ? '★ Remove favourite' : '★ Favourite';
    starItem.onclick = () => {
      core.toggleFavourite(key);
      refreshBadges();
      closeMenu();
    };
    menu.appendChild(starItem);

    // 2. Save as variant
    const varItem = document.createElement('div');
    varItem.className = 'lib-menu-item';
    varItem.textContent = 'Save as variant…';
    varItem.onclick = () => {
      closeMenu();
      const defName = (item ? item.name : 'Visual') + ' variant';
      promptName('Variant name', defName, { x: e.clientX, y: e.clientY }, (name) => {
        let settings = null;
        if (typeof host.currentSettings === 'function') {
          settings = host.currentSettings(ref);
        }
        core.addVariant({ name, key, ref, settings });
        if (host.toast) host.toast('Variant saved');
        renderAll();
      });
    };
    menu.appendChild(varItem);

    // 3. Add to story
    const toStoryItem = document.createElement('div');
    toStoryItem.className = 'lib-menu-item';
    toStoryItem.innerHTML = `<span>Add to story</span> <span>▸</span>`;
    const storySub = document.createElement('div');
    storySub.className = 'lib-submenu';

    const newStoryOption = document.createElement('div');
    newStoryOption.className = 'lib-menu-item';
    newStoryOption.textContent = 'New story…';
    newStoryOption.onclick = (ev) => {
      ev.stopPropagation();
      closeMenu();
      promptName('New story name', 'My Story', { x: e.clientX, y: e.clientY }, (sName) => {
        const entry = mkEntry();
        core.addStory(sName, [{ entry, bars: 8 }], true);
        renderAll();
      });
    };
    storySub.appendChild(newStoryOption);

    stories.forEach(s => {
      const sOpt = document.createElement('div');
      sOpt.className = 'lib-menu-item';
      sOpt.textContent = s.name;
      sOpt.onclick = (ev) => {
        ev.stopPropagation();
        closeMenu();
        const entry = mkEntry();
        s.steps.push({ entry, bars: 8 });
        core.updateStory(s.id, { steps: s.steps });
        renderAll();
      };
      storySub.appendChild(sOpt);
    });
    toStoryItem.appendChild(storySub);
    menu.appendChild(toStoryItem);

    // 4. Add to set
    const toSetItem = document.createElement('div');
    toSetItem.className = 'lib-menu-item';
    toSetItem.innerHTML = `<span>Add to set</span> <span>▸</span>`;
    const setSub = document.createElement('div');
    setSub.className = 'lib-submenu';

    const newSetOption = document.createElement('div');
    newSetOption.className = 'lib-menu-item';
    newSetOption.textContent = 'New set…';
    newSetOption.onclick = (ev) => {
      ev.stopPropagation();
      closeMenu();
      promptName('New set name', 'My Set', { x: e.clientX, y: e.clientY }, (setName) => {
        const entry = mkEntry();
        core.addSet(setName, [entry]);
        renderAll();
      });
    };
    setSub.appendChild(newSetOption);

    sets.forEach(st => {
      const stOpt = document.createElement('div');
      stOpt.className = 'lib-menu-item';
      stOpt.textContent = st.name;
      stOpt.onclick = (ev) => {
        ev.stopPropagation();
        closeMenu();
        const entry = mkEntry();
        st.pool.push(entry);
        core.updateSet(st.id, { pool: st.pool });
        renderAll();
      };
      setSub.appendChild(stOpt);
    });
    toSetItem.appendChild(setSub);
    menu.appendChild(toSetItem);

    // 5. Open settings
    const settingsItem = document.createElement('div');
    settingsItem.className = 'lib-menu-item';
    settingsItem.textContent = 'Open settings';
    if (typeof host.openSettings === 'function') {
      settingsItem.onclick = () => {
        closeMenu();
        host.openSettings(ref);
      };
    } else {
      settingsItem.classList.add('lib-disabled');
    }
    menu.appendChild(settingsItem);

    // Position menu and ensure it doesn't overflow window
    document.body.appendChild(menu);
    activeMenuEl = menu;

    let posX = e.clientX;
    let posY = e.clientY;
    const menuWidth = 180;
    const menuHeight = menu.offsetHeight || 160;

    if (posX + menuWidth > window.innerWidth) {
      posX = window.innerWidth - menuWidth - 10;
    }
    if (posY + menuHeight > window.innerHeight) {
      posY = window.innerHeight - menuHeight - 10;
    }

    menu.style.left = Math.max(10, posX) + 'px';
    menu.style.top = Math.max(10, posY) + 'px';
    // submenus flip left when the menu sits near the right edge
    if (menu.getBoundingClientRect().right + 170 > window.innerWidth) menu.querySelectorAll('.lib-submenu').forEach(s => s.classList.add('lib-flip'));
    menu.tabIndex = -1;
    menu.focus({ preventScroll: true });
    menu.addEventListener('keydown', menuKey);
  }

  // --- Star Badges ---
  function refreshBadges() {
    const favs = new Set(core.getFavourites());
    document.querySelectorAll('[data-key]').forEach(el => {
      const k = el.getAttribute('data-key');
      const star = el.querySelector('.lib-star');
      if (favs.has(k)) {
        if (!star) {
          const compPos = window.getComputedStyle(el).position;
          if (compPos === 'static') {
            el.style.position = 'relative';
          }
          const s = document.createElement('span');
          s.className = 'lib-star';
          s.textContent = '★';
          el.appendChild(s);
        }
      } else {
        if (star) star.remove();
      }
    });
  }

  // --- Rendering UI Tabs ---
  let openStoryEditorId = null;
  let openSetEditorId = null;

  function renderStoriesTab() {
    if (!host || !host.mountPoints || !host.mountPoints.stories) return;
    const mount = host.mountPoints.stories;
    mount.innerHTML = '';

    const allItems = host.items ? host.items() : [];
    const builtInStories = allItems.filter(i => i.kind === 'story');
    const userStories = core.getStories();
    const runningInfo = core.running();

    // 1. Built-in section
    const foldBuiltIn = mkFold('Built-in stories', builtInStories.length);
    const fbBuiltIn = foldBuiltIn.querySelector('.fb');
    builtInStories.forEach(it => {
      const card = document.createElement('button');
      card.className = 'card';
      card.setAttribute('data-key', it.key);
      card.innerHTML = `<strong>${esc(it.name)}</strong><div class="desc note">${esc(it.desc)}</div>`;
      card.onclick = () => {
        host.play(it.ref, null);
      };
      fbBuiltIn.appendChild(card);
    });
    if (opts.builtIns !== false) mount.appendChild(foldBuiltIn);

    // 2. User Stories section
    const foldUser = mkFold('My stories', userStories.length);
    const fbUser = foldUser.querySelector('.fb');

    if (userStories.length === 0) {
      fbUser.innerHTML = '<div class="lib-hint">Right-click any visual → Add to story</div>';
    } else {
      userStories.forEach(st => {
        const isThisRunning = runningInfo && runningInfo.type === 'story' && runningInfo.id === st.id;
        const totalBars = st.steps.reduce((acc, step) => acc + (Number(step.bars) || 4), 0);

        const row = document.createElement('div');
        row.className = 'lib-row' + (isThisRunning ? ' lib-running' : '');

        let statusText = `${st.steps.length} steps · ${totalBars} bars`;
        if (isThisRunning) {
          statusText = `step ${runningInfo.step}/${st.steps.length} · bar ${runningInfo.barInStep}/${runningInfo.barsInStep}`;
        }

        row.innerHTML = `
          <div class="lib-row-info">
            <div class="lib-row-title">${esc(st.name)}</div>
            <div class="lib-row-sub">${statusText}</div>
          </div>
          <div class="lib-actions">
            <button type="button" class="lib-btn-play">${isThisRunning ? '■' : '▶'}</button>
            <button type="button" class="lib-btn-edit">⋯</button>
            <button type="button" class="lib-btn-del" title="Delete this story">✕</button>
          </div>
        `;

        row.querySelector('.lib-btn-play').onclick = () => {
          if (isThisRunning) {
            core.stop();
          } else {
            core.playStory(st.id, host);
          }
          renderAll();
        };
        row.querySelector('.lib-btn-del').onclick = (e) => {
          confirmDelete(st.name, 'Your story is removed for good (unless it is in a Backup).', posOf(e.currentTarget), () => {
            if (openStoryEditorId === st.id) openStoryEditorId = null;
            core.removeStory(st.id);
            renderAll();
          });
        };

        row.querySelector('.lib-btn-edit').onclick = () => {
          openStoryEditorId = (openStoryEditorId === st.id) ? null : st.id;
          renderStoriesTab();
        };

        fbUser.appendChild(row);

        // Story Inline Editor
        if (openStoryEditorId === st.id) {
          const editor = document.createElement('div');
          editor.className = 'lib-editor';

          // Rename & Loop row
          const topControls = document.createElement('div');
          topControls.style.display = 'flex';
          topControls.style.justifyContent = 'space-between';
          topControls.style.alignItems = 'center';
          topControls.innerHTML = `
            <button type="button" class="lib-edit-rename">Rename</button>
            <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
              <input type="checkbox" class="lib-edit-loop" ${st.loop ? 'checked' : ''} /> Loop
            </label>
          `;
          topControls.querySelector('.lib-edit-rename').onclick = (e) => {
            promptName('Rename Story', st.name, { x: e.clientX, y: e.clientY }, (newName) => {
              core.updateStory(st.id, { name: newName });
              renderAll();
            });
          };
          topControls.querySelector('.lib-edit-loop').onchange = (e) => {
            core.updateStory(st.id, { loop: e.target.checked });
          };
          editor.appendChild(topControls);

          // Steps list
          const stepList = document.createElement('div');
          stepList.style.display = 'flex';
          stepList.style.flexDirection = 'column';
          stepList.style.gap = '4px';

          st.steps.forEach((step, sIdx) => {
            const stepRow = document.createElement('div');
            const isActiveStep = isThisRunning && runningInfo.step === (sIdx + 1);
            stepRow.className = 'lib-step-row' + (isActiveStep ? ' lib-step-active' : '');

            // Missing check
            const isMissing = !allItems.some(i => i.key === step.entry.key) &&
                              !core.getVariants().some(v => v.id === step.entry.key);

            stepRow.innerHTML = `
              <span class="${isMissing ? 'lib-missing' : ''}" style="flex:1; overflow:hidden; text-overflow:ellipsis;">
                ${sIdx + 1}. ${esc(step.entry.name || step.entry.key)} ${isMissing ? '(missing)' : ''}
              </span>
              <span>bars:</span>
              <input type="number" min="1" max="64" value="${step.bars || 4}" />
              <button type="button" class="lib-step-up">↑</button>
              <button type="button" class="lib-step-dn">↓</button>
              <button type="button" class="lib-step-del">✕</button>
            `;

            stepRow.querySelector('input').onchange = (e) => {
              let b = parseInt(e.target.value, 10);
              if (isNaN(b) || b < 1) b = 1;
              if (b > 64) b = 64;
              st.steps[sIdx].bars = b;
              core.updateStory(st.id, { steps: st.steps });
            };

            stepRow.querySelector('.lib-step-up').onclick = () => {
              if (sIdx > 0) {
                const temp = st.steps[sIdx];
                st.steps[sIdx] = st.steps[sIdx - 1];
                st.steps[sIdx - 1] = temp;
                core.updateStory(st.id, { steps: st.steps });
                renderStoriesTab();
              }
            };

            stepRow.querySelector('.lib-step-dn').onclick = () => {
              if (sIdx < st.steps.length - 1) {
                const temp = st.steps[sIdx];
                st.steps[sIdx] = st.steps[sIdx + 1];
                st.steps[sIdx + 1] = temp;
                core.updateStory(st.id, { steps: st.steps });
                renderStoriesTab();
              }
            };

            stepRow.querySelector('.lib-step-del').onclick = () => {
              st.steps.splice(sIdx, 1);
              core.updateStory(st.id, { steps: st.steps });
              renderStoriesTab();
            };

            stepList.appendChild(stepRow);
          });
          editor.appendChild(stepList);

          // Delete Story button with inline confirm
          const deleteRow = document.createElement('div');
          deleteRow.style.marginTop = '6px';
          deleteRow.innerHTML = `
            <button type="button" class="lib-btn-delete" style="color:var(--warn); width:100%;">Delete Story</button>
          `;
          const delBtn = deleteRow.querySelector('.lib-btn-delete');
          let confirmActive = false;
          delBtn.onclick = () => {
            if (!confirmActive) {
              confirmActive = true;
              delBtn.textContent = 'Confirm Delete?';
              setTimeout(() => {
                confirmActive = false;
                delBtn.textContent = 'Delete Story';
              }, 3000);
            } else {
              core.removeStory(st.id);
              openStoryEditorId = null;
              renderAll();
            }
          };
          editor.appendChild(deleteRow);

          fbUser.appendChild(editor);
        }
      });
    }
    mount.appendChild(foldUser);
    renderVariants(mount);
    renderBackup(mount);
  }

  function renderSetsTab() {
    if (!host || !host.mountPoints || !host.mountPoints.sets) return;
    const mount = host.mountPoints.sets;
    mount.innerHTML = '';

    const allItems = host.items ? host.items() : [];
    const builtInSets = allItems.filter(i => i.kind === 'set');
    const userSets = core.getSets();
    const runningInfo = core.running();

    // 1. Built-in Sets section
    const foldBuiltIn = mkFold('Built-in sets', builtInSets.length);
    const fbBuiltIn = foldBuiltIn.querySelector('.fb');
    builtInSets.forEach(it => {
      const card = document.createElement('div');
      card.className = 'lib-row';
      card.setAttribute('data-key', it.key);
      card.innerHTML = `
        <div class="lib-row-info">
          <div class="lib-row-title">${esc(it.name)}</div>
          <div class="lib-row-sub">${esc(it.desc)}</div>
        </div>
        <div class="lib-actions">
          <button type="button" class="lib-btn-play">▶</button>
          <button type="button" class="lib-btn-copy">Copy</button>
        </div>
      `;
      card.querySelector('.lib-btn-play').onclick = () => {
        host.play(it.ref, null);
      };
      card.querySelector('.lib-btn-copy').onclick = (e) => {
        copyBuiltInSet(it.key);
      };
      fbBuiltIn.appendChild(card);
    });
    if (opts.builtIns !== false) mount.appendChild(foldBuiltIn);

    // 2. User Sets section
    const foldUser = mkFold('My sets', userSets.length);
    const fbUser = foldUser.querySelector('.fb');

    if (userSets.length === 0) {
      fbUser.innerHTML = '<div class="lib-hint">Right-click any visual → Add to set, or Ctrl+click several and choose New set from these</div>';
    } else {
      userSets.forEach(st => {
        const isThisRunning = runningInfo && runningInfo.type === 'set' && runningInfo.id === st.id;
        const row = document.createElement('div');
        row.className = 'lib-row' + (isThisRunning ? ' lib-running' : '');

        let statusText = `${st.pool.length} items · ${st.rules.order}`;
        if (isThisRunning) {
          statusText = `playing · bar ${runningInfo.barInStep}/${runningInfo.barsInStep}`;
        }

        row.innerHTML = `
          <div class="lib-row-info">
            <div class="lib-row-title">${esc(st.name)}</div>
            <div class="lib-row-sub">${statusText}</div>
          </div>
          <div class="lib-actions">
            <button type="button" class="lib-btn-play">${isThisRunning ? '■' : '▶'}</button>
            <button type="button" class="lib-btn-edit">⋯</button>
            <button type="button" class="lib-btn-del" title="Delete this set">✕</button>
          </div>
        `;

        row.querySelector('.lib-btn-play').onclick = () => {
          if (isThisRunning) {
            core.stop();
          } else {
            core.playSet(st.id, host);
          }
          renderAll();
        };
        row.querySelector('.lib-btn-del').onclick = (e) => {
          confirmDelete(st.name, 'Your set is removed for good (unless it is in a Backup).', posOf(e.currentTarget), () => {
            if (openSetEditorId === st.id) openSetEditorId = null;
            core.removeSet(st.id);
            renderAll();
          });
        };

        row.querySelector('.lib-btn-edit').onclick = () => {
          openSetEditorId = (openSetEditorId === st.id) ? null : st.id;
          renderSetsTab();
        };

        fbUser.appendChild(row);

        // Set Inline Editor
        if (openSetEditorId === st.id) {
          const editor = document.createElement('div');
          editor.className = 'lib-editor';

          // Pool entries list
          const poolList = document.createElement('div');
          poolList.style.display = 'flex';
          poolList.style.flexDirection = 'column';
          poolList.style.gap = '4px';

          st.pool.forEach((entry, pIdx) => {
            const poolRow = document.createElement('div');
            poolRow.className = 'lib-step-row';
            const isMissing = !allItems.some(i => i.key === entry.key) &&
                              !core.getVariants().some(v => v.id === entry.key);

            poolRow.innerHTML = `
              <span class="${isMissing ? 'lib-missing' : ''}" style="flex:1; overflow:hidden; text-overflow:ellipsis;">
                ${esc(entry.name || entry.key)} ${isMissing ? '(missing)' : ''}
              </span>
              <button type="button" class="lib-pool-del">✕</button>
            `;
            poolRow.querySelector('.lib-pool-del').onclick = () => {
              st.pool.splice(pIdx, 1);
              core.updateSet(st.id, { pool: st.pool });
              renderSetsTab();
            };
            poolList.appendChild(poolRow);
          });
          editor.appendChild(poolList);

          // Rules options: barsMin, barsMax, order, noRepeat, changeOnDrop
          const rulesDiv = document.createElement('div');
          rulesDiv.style.display = 'grid';
          rulesDiv.style.gridTemplateColumns = '1fr 1fr';
          rulesDiv.style.gap = '8px';
          rulesDiv.style.fontSize = '12px';

          rulesDiv.innerHTML = `
            <label>Min bars:
              <select class="lib-sel-min">
                <option value="4" ${st.rules.barsMin == 4 ? 'selected' : ''}>4</option>
                <option value="8" ${st.rules.barsMin == 8 ? 'selected' : ''}>8</option>
                <option value="16" ${st.rules.barsMin == 16 ? 'selected' : ''}>16</option>
                <option value="32" ${st.rules.barsMin == 32 ? 'selected' : ''}>32</option>
              </select>
            </label>
            <label>Max bars:
              <select class="lib-sel-max">
                <option value="4" ${st.rules.barsMax == 4 ? 'selected' : ''}>4</option>
                <option value="8" ${st.rules.barsMax == 8 ? 'selected' : ''}>8</option>
                <option value="16" ${st.rules.barsMax == 16 ? 'selected' : ''}>16</option>
                <option value="32" ${st.rules.barsMax == 32 ? 'selected' : ''}>32</option>
              </select>
            </label>
            <label>Order:
              <select class="lib-sel-order">
                <option value="random" ${st.rules.order === 'random' ? 'selected' : ''}>random</option>
                <option value="in order" ${st.rules.order === 'in order' ? 'selected' : ''}>in order</option>
              </select>
            </label>
            <label style="display:flex; align-items:center; gap:4px; grid-column:span 2;">
              <input type="checkbox" class="lib-chk-norepeat" ${st.rules.noRepeat ? 'checked' : ''} /> No repeat
            </label>
            <label style="display:flex; align-items:center; gap:4px; grid-column:span 2;">
              <input type="checkbox" class="lib-chk-drop" ${st.rules.changeOnDrop ? 'checked' : ''} /> Change on drop
            </label>
          `;

          rulesDiv.querySelector('.lib-sel-min').onchange = (e) => {
            st.rules.barsMin = parseInt(e.target.value, 10);
            core.updateSet(st.id, { rules: st.rules });
          };
          rulesDiv.querySelector('.lib-sel-max').onchange = (e) => {
            st.rules.barsMax = parseInt(e.target.value, 10);
            core.updateSet(st.id, { rules: st.rules });
          };
          rulesDiv.querySelector('.lib-sel-order').onchange = (e) => {
            st.rules.order = e.target.value;
            core.updateSet(st.id, { rules: st.rules });
          };
          rulesDiv.querySelector('.lib-chk-norepeat').onchange = (e) => {
            st.rules.noRepeat = e.target.checked;
            core.updateSet(st.id, { rules: st.rules });
          };
          rulesDiv.querySelector('.lib-chk-drop').onchange = (e) => {
            st.rules.changeOnDrop = e.target.checked;
            core.updateSet(st.id, { rules: st.rules });
          };

          editor.appendChild(rulesDiv);

          // Rename & Delete
          const actionRow = document.createElement('div');
          actionRow.style.display = 'flex';
          actionRow.style.gap = '8px';
          actionRow.style.marginTop = '6px';
          actionRow.innerHTML = `
            <button type="button" class="lib-set-rename" style="flex:1;">Rename</button>
            <button type="button" class="lib-set-del" style="color:var(--warn); flex:1;">Delete</button>
          `;
          actionRow.querySelector('.lib-set-rename').onclick = (e) => {
            promptName('Rename Set', st.name, { x: e.clientX, y: e.clientY }, (newName) => {
              core.updateSet(st.id, { name: newName });
              renderAll();
            });
          };

          const delBtn = actionRow.querySelector('.lib-set-del');
          let confirmActive = false;
          delBtn.onclick = () => {
            if (!confirmActive) {
              confirmActive = true;
              delBtn.textContent = 'Confirm?';
              setTimeout(() => {
                confirmActive = false;
                delBtn.textContent = 'Delete';
              }, 3000);
            } else {
              core.removeSet(st.id);
              openSetEditorId = null;
              renderAll();
            }
          };

          editor.appendChild(actionRow);
          fbUser.appendChild(editor);
        }
      });
    }
    mount.appendChild(foldUser);
  }

  // "Copy as my own set": also public, so the app's own set cards can call it
  function copyBuiltInSet(setKey, name) {
    const it = host.items().find(i => i.key === setKey);
    const poolKeys = (typeof host.builtInPool === 'function') ? host.builtInPool(setKey) : [];
    const s = core.addSet(name || ((it ? it.name : setKey) + ' (copy)'), getEntriesForKeys(poolKeys || []));
    if (host.toast) host.toast('Copied to My sets');
    renderAll();
    return s;
  }

  // my variants: playable rows, right-click works since key = variant id
  function renderVariants(mount) {
    const vs = core.getVariants();
    const fold = mkFold('My variants', vs.length);
    const fb = fold.querySelector('.fb');
    if (!vs.length) fb.innerHTML = '<div class="lib-hint">Right-click any visual → Save as variant</div>';
    vs.forEach(v => {
      const row = document.createElement('div');
      row.className = 'lib-row';
      row.setAttribute('data-key', v.id);
      row.innerHTML = '<div class="lib-row-info"><div class="lib-row-title">' + esc(v.name) + '</div></div><div class="lib-actions"><button type="button" class="lib-btn-play">▶</button><button type="button" class="lib-btn-del" title="Delete">✕</button></div>';
      row.querySelector('.lib-btn-play').onclick = () => { core.stop(); host.play(v.ref, v.settings); renderAll(); };
      row.querySelector('.lib-btn-del').onclick = (e) => {
        confirmDelete(v.name, 'This variant (the visual with your slider values) is removed for good.', posOf(e.currentTarget), () => { core.removeVariant(v.id); renderAll(); });
      };
      fb.appendChild(row);
    });
    mount.appendChild(fold);
  }

  // backup: export / import the whole library as JSON text
  function renderBackup(mount) {
    const fold = mkFold('Backup', '');
    fold.classList.add('shut');
    const fb = fold.querySelector('.fb');
    fb.innerHTML = '<textarea class="lib-backup" rows="5" spellcheck="false" placeholder="Export fills this box. Paste JSON here and press Import."></textarea><div class="lib-actions"><button type="button" class="lib-ex">Export</button><button type="button" class="lib-im">Import</button></div>';
    const ta = fb.querySelector('textarea');
    fb.querySelector('.lib-ex').onclick = () => { ta.value = core.exportJSON(); ta.select(); };
    fb.querySelector('.lib-im').onclick = () => {
      try {
        const r = core.importJSON(ta.value);
        if (host.toast) host.toast('Imported ' + r.added + ', skipped ' + r.skipped);
        renderAll();
      } catch (err) { if (host.toast) host.toast(err.message); else alert(err.message); }
    };
    mount.appendChild(fold);
  }

  // a bar event re-renders for progress; do not wipe an input the user is typing in
  function editingInside() {
    const a = document.activeElement;
    if (!a || !/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)) return false;
    const m = host.mountPoints || {};
    return [m.stories, m.sets].some(x => x && x.contains(a));
  }

  function renderAll() {
    renderStoriesTab();
    renderSetsTab();
    refreshBadges();
  }

  // --- Mounting & Event Wiring ---
  function mount(hostInterface, options) {
    host = hostInterface;
    opts = options || {};
    core = (coreModule && coreModule.createCore) ? coreModule.createCore() : null;
    if (!core) {
      throw new Error('INF_LIB_CORE required before mounting INF_LIBRARY');
    }

    injectStyles();
    core.bindHost(host);

    // Watch for bar updates to refresh progress in running stories/sets
    if (host && typeof host.on === 'function') {
      host.on('bar', () => {
        if (core.running() && !editingInside()) {
          renderAll();
        }
      });
      host.on('userpick', () => {
        renderAll();
      });
    }

    // Capture-phase listener for multi-selection on [data-key]
    window.addEventListener('click', (e) => {
      // Outside clicks close popover and menu
      if (activeMenuEl && !activeMenuEl.contains(e.target)) {
        closeMenu();
      }
      if (activePopoverEl && !activePopoverEl.contains(e.target)) {
        closePopover();
      }

      if (e.ctrlKey || e.shiftKey || e.metaKey) {
        const card = e.target.closest('[data-key]');
        if (card) {
          e.preventDefault();
          e.stopPropagation();
          const key = card.getAttribute('data-key');
          if (selectedKeys.has(key)) {
            selectedKeys.delete(key);
            card.classList.remove('lib-selected');
          } else {
            selectedKeys.add(key);
            card.classList.add('lib-selected');
          }
          updateMultiSelectBar();
        }
      }
    }, true);

    // Global keyboard listener (Escape closes / unselects)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
        closePopover();
        if (selectedKeys.size > 0) {
          clearSelection();
        }
      }
    });

    // Close menu on scroll
    window.addEventListener('scroll', () => {
      closeMenu();
    }, true);

    // Context menu & Touch Long-Press on [data-key]
    const rootEl = document.body;

    rootEl.addEventListener('contextmenu', (e) => {
      const card = e.target.closest('[data-key]');
      if (card) {
        const key = card.getAttribute('data-key');
        openContextMenu(e, card, key);
      }
    });

    // Touch support (500ms long press)
    let touchTimer = null;
    let touchTarget = null;
    let touchPos = { x: 0, y: 0 };

    rootEl.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const card = e.target.closest('[data-key]');
      if (card) {
        touchTarget = card;
        touchPos = { x: t.clientX, y: t.clientY };
        touchTimer = setTimeout(() => {
          if (touchTarget) {
            const key = touchTarget.getAttribute('data-key');
            openContextMenu({
              preventDefault: () => {},
              clientX: touchPos.x,
              clientY: touchPos.y
            }, touchTarget, key);
          }
        }, 500);
      }
    }, { passive: true });

    rootEl.addEventListener('touchmove', () => {
      clearTimeout(touchTimer);
      touchTimer = null;
    }, { passive: true });

    rootEl.addEventListener('touchend', () => {
      clearTimeout(touchTimer);
      touchTimer = null;
    }, { passive: true });

    // MutationObserver on mountPoints.visuals for dynamic card rendering
    if (host.mountPoints && host.mountPoints.visuals) {
      const observer = new MutationObserver(() => {
        refreshBadges();
      });
      observer.observe(host.mountPoints.visuals, { childList: true, subtree: true });
    }

    renderAll();
  }

  return {
    mount,
    running: () => core ? core.running() : null,
    stop: () => core ? core.stop() : undefined,
    favourites: () => core ? core.getFavourites() : [],
    exportJSON: () => core ? core.exportJSON() : '{}',
    importJSON: (str) => core ? core.importJSON(str) : { added: 0, skipped: 0 },
    copyBuiltInSet: (k, n) => core ? copyBuiltInSet(k, n) : null,
    confirmDelete,
    refresh: () => { if (core) renderAll(); },
    get core() { return core; }
  };
});
