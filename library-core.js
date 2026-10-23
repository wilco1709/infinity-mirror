/**
 * library-core.js
 * Core data model, sequencer, and storage for Stories and Sets.
 * Works both as browser script (window.INF_LIB_CORE) and CommonJS module.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.INF_LIB_CORE = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const STORAGE_KEY = 'infLibrary.v1';

  function randomId(prefix) {
    return (prefix ? prefix + '_' : '') + Math.random().toString(36).slice(2, 9);
  }

  function deepClone(obj) {
    return obj === undefined ? undefined : JSON.parse(JSON.stringify(obj));
  }

  function createCore(options) {
    const opts = options || {};
    const rng = typeof opts.rng === 'function' ? opts.rng : Math.random;

    let state = {
      v: 1,
      favourites: [],
      variants: [],
      stories: [],
      sets: [],
      hidden: [] // keys of built-in visuals/stories/sets the user deleted from the lists (they live in code, so they are only hidden)
    };

    function load() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.v === 1) {
              state = {
                v: 1,
                favourites: Array.isArray(parsed.favourites) ? parsed.favourites : [],
                variants: Array.isArray(parsed.variants) ? parsed.variants : [],
                stories: Array.isArray(parsed.stories) ? parsed.stories : [],
                sets: Array.isArray(parsed.sets) ? parsed.sets : [],
                hidden: Array.isArray(parsed.hidden) ? parsed.hidden : []
              };
            }
          }
        }
      } catch (e) {
        // storage blocked or malformed
      }
    }

    function save() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
      } catch (e) {
        // storage blocked or quota exceeded
      }
    }

    // Initial load
    load();

    // --- Favourites ---
    function getFavourites() {
      return state.favourites.slice();
    }

    function isFavourite(keyOrId) {
      return state.favourites.indexOf(keyOrId) !== -1;
    }

    function toggleFavourite(keyOrId) {
      const idx = state.favourites.indexOf(keyOrId);
      if (idx === -1) {
        state.favourites.push(keyOrId);
      } else {
        state.favourites.splice(idx, 1);
      }
      save();
      return isFavourite(keyOrId);
    }

    // --- Variants ---
    function getVariants() {
      return deepClone(state.variants);
    }

    function getVariant(id) {
      const v = state.variants.find(item => item.id === id);
      return v ? deepClone(v) : null;
    }

    function addVariant(item) {
      // item: { name, key, ref, settings }
      const newVar = {
        id: randomId('var'),
        name: item.name || 'Untitled variant',
        key: item.key,
        ref: item.ref,
        settings: deepClone(item.settings) || null,
        created: Date.now()
      };
      state.variants.push(newVar);
      save();
      return deepClone(newVar);
    }

    function removeVariant(id) {
      const idx = state.variants.findIndex(v => v.id === id);
      if (idx !== -1) {
        state.variants.splice(idx, 1);
        // remove from favourites if starred
        const fIdx = state.favourites.indexOf(id);
        if (fIdx !== -1) state.favourites.splice(fIdx, 1);
        save();
        return true;
      }
      return false;
    }

    // --- Stories ---
    function getStories() {
      return deepClone(state.stories);
    }

    function getStory(id) {
      const s = state.stories.find(item => item.id === id);
      return s ? deepClone(s) : null;
    }

    function addStory(name, steps, loop) {
      const story = {
        id: randomId('story'),
        name: name || 'New Story',
        steps: Array.isArray(steps) ? deepClone(steps) : [],
        loop: typeof loop === 'boolean' ? loop : true
      };
      state.stories.push(story);
      save();
      return deepClone(story);
    }

    function updateStory(id, updates) {
      const story = state.stories.find(s => s.id === id);
      if (!story) return null;
      if (typeof updates.name === 'string') story.name = updates.name;
      if (typeof updates.loop === 'boolean') story.loop = updates.loop;
      if (Array.isArray(updates.steps)) story.steps = deepClone(updates.steps);
      save();
      return deepClone(story);
    }

    function removeStory(id) {
      const idx = state.stories.findIndex(s => s.id === id);
      if (idx !== -1) {
        state.stories.splice(idx, 1);
        save();
        if (activeSeq && activeSeq.type === 'story' && activeSeq.id === id) {
          stopSequencer();
        }
        return true;
      }
      return false;
    }

    // --- Sets ---
    function getSets() {
      return deepClone(state.sets);
    }

    function getSet(id) {
      const s = state.sets.find(item => item.id === id);
      return s ? deepClone(s) : null;
    }

    function addSet(name, pool, rules) {
      const newSet = {
        id: randomId('set'),
        name: name || 'New Set',
        pool: Array.isArray(pool) ? deepClone(pool) : [],
        rules: Object.assign({
          barsMin: 8,
          barsMax: 16,
          order: 'random',
          noRepeat: true,
          changeOnDrop: true
        }, rules || {})
      };
      state.sets.push(newSet);
      save();
      return deepClone(newSet);
    }

    function updateSet(id, updates) {
      const s = state.sets.find(item => item.id === id);
      if (!s) return null;
      if (typeof updates.name === 'string') s.name = updates.name;
      if (Array.isArray(updates.pool)) s.pool = deepClone(updates.pool);
      if (updates.rules) {
        s.rules = Object.assign(s.rules, updates.rules);
      }
      save();
      return deepClone(s);
    }

    function removeSet(id) {
      const idx = state.sets.findIndex(s => s.id === id);
      if (idx !== -1) {
        state.sets.splice(idx, 1);
        save();
        if (activeSeq && activeSeq.type === 'set' && activeSeq.id === id) {
          stopSequencer();
        }
        return true;
      }
      return false;
    }

    // --- Hidden built-ins ---
    function getHidden() {
      return state.hidden.slice();
    }

    function isHidden(key) {
      return state.hidden.indexOf(key) !== -1;
    }

    function hide(key) {
      if (!key || isHidden(key)) return false;
      state.hidden.push(key);
      const fIdx = state.favourites.indexOf(key);
      if (fIdx !== -1) state.favourites.splice(fIdx, 1);
      save();
      return true;
    }

    function unhide(key) {
      const idx = state.hidden.indexOf(key);
      if (idx === -1) return false;
      state.hidden.splice(idx, 1);
      save();
      return true;
    }

    // --- Import / Export ---
    function exportJSON() {
      return JSON.stringify(state, null, 2);
    }

    function importJSON(str) {
      let data;
      try {
        data = typeof str === 'string' ? JSON.parse(str) : str;
      } catch (e) {
        throw new Error('Invalid JSON format');
      }

      if (!data || typeof data !== 'object' || data.v !== 1) {
        throw new Error('Unsupported or missing library data format (v:1 expected)');
      }

      let added = 0;
      let skipped = 0;

      // Favourites
      if (Array.isArray(data.favourites)) {
        data.favourites.forEach(k => {
          if (state.favourites.indexOf(k) === -1) {
            state.favourites.push(k);
            added++;
          } else {
            skipped++;
          }
        });
      }

      // Variants
      if (Array.isArray(data.variants)) {
        data.variants.forEach(v => {
          if (!v || !v.id) return;
          if (state.variants.some(x => x.id === v.id)) {
            skipped++;
          } else {
            state.variants.push(deepClone(v));
            added++;
          }
        });
      }

      // Stories
      if (Array.isArray(data.stories)) {
        data.stories.forEach(s => {
          if (!s || !s.id) return;
          if (state.stories.some(x => x.id === s.id)) {
            skipped++;
          } else {
            state.stories.push(deepClone(s));
            added++;
          }
        });
      }

      // Sets
      if (Array.isArray(data.sets)) {
        data.sets.forEach(s => {
          if (!s || !s.id) return;
          if (state.sets.some(x => x.id === s.id)) {
            skipped++;
          } else {
            state.sets.push(deepClone(s));
            added++;
          }
        });
      }

      // Hidden built-ins
      if (Array.isArray(data.hidden)) {
        data.hidden.forEach(k => {
          if (typeof k !== 'string') return;
          if (state.hidden.indexOf(k) === -1) {
            state.hidden.push(k);
            added++;
          } else {
            skipped++;
          }
        });
      }

      save();
      return { added, skipped };
    }

    // --- Sequencer ---
    let activeSeq = null; // { type, id, name, ... }
    let hostRef = null;

    function isItemAvailable(entry) {
      if (!entry) return false;
      // Variants carry their own valid ref
      if (typeof entry.key === 'string' && entry.key.startsWith('var_')) return true;
      if (!hostRef || typeof hostRef.items !== 'function') return true;
      const currentItems = hostRef.items();
      return currentItems.some(item => item.key === entry.key);
    }

    function resolveEntry(entry) {
      if (!entry) return null;
      // If host items have changed, we can try to resolve ref
      if (hostRef && typeof hostRef.items === 'function') {
        const found = hostRef.items().find(i => i.key === entry.key);
        if (found) {
          return {
            ref: found.ref,
            settings: entry.settings !== undefined ? entry.settings : null,
            name: entry.name || found.name
          };
        }
      }
      return {
        ref: entry.ref,
        settings: entry.settings !== undefined ? entry.settings : null,
        name: entry.name
      };
    }

    function stopSequencer() {
      activeSeq = null;
    }

    function running() {
      if (!activeSeq) return null;
      return {
        type: activeSeq.type,
        id: activeSeq.id,
        name: activeSeq.name,
        step: activeSeq.stepIndex !== undefined ? activeSeq.stepIndex + 1 : activeSeq.playCount,
        barInStep: activeSeq.barInStep,
        barsInStep: activeSeq.barsInStep
      };
    }

    function playStory(storyId, host) {
      if (host) hostRef = host;
      const story = state.stories.find(s => s.id === storyId);
      if (!story || !story.steps || story.steps.length === 0) {
        stopSequencer();
        return false;
      }

      // Filter available steps
      const availableIndices = [];
      story.steps.forEach((st, idx) => {
        if (isItemAvailable(st.entry)) availableIndices.push(idx);
      });

      if (availableIndices.length === 0) {
        stopSequencer();
        return false;
      }

      activeSeq = {
        type: 'story',
        id: storyId,
        name: story.name,
        story: deepClone(story),
        stepIndex: 0,
        barInStep: 1,
        barsInStep: 1
      };

      return advanceStoryStep(0);
    }

    function advanceStoryStep(targetIndex) {
      if (!activeSeq || activeSeq.type !== 'story') return false;
      const steps = activeSeq.story.steps;

      let idx = targetIndex;
      // Skip missing items
      while (idx < steps.length && !isItemAvailable(steps[idx].entry)) {
        idx++;
      }

      if (idx >= steps.length) {
        if (activeSeq.story.loop) {
          return advanceStoryStep(0);
        } else {
          stopSequencer();
          return false;
        }
      }

      activeSeq.stepIndex = idx;
      activeSeq.barInStep = 1;
      activeSeq.barsInStep = Math.max(1, steps[idx].bars || 4);

      const resolved = resolveEntry(steps[idx].entry);
      if (hostRef && typeof hostRef.play === 'function' && resolved) {
        hostRef.play(resolved.ref, resolved.settings);
      }
      return true;
    }

    function playSet(setId, host) {
      if (host) hostRef = host;
      const s = state.sets.find(item => item.id === setId);
      if (!s || !s.pool || s.pool.length === 0) {
        stopSequencer();
        return false;
      }

      const availablePool = s.pool.filter(e => isItemAvailable(e));
      if (availablePool.length === 0) {
        stopSequencer();
        return false;
      }

      activeSeq = {
        type: 'set',
        id: setId,
        name: s.name,
        set: deepClone(s),
        pool: availablePool,
        currentIndex: -1,
        playCount: 0,
        barInStep: 1,
        barsInStep: 8,
        pendingDropSwitch: false
      };

      return advanceSetEntry();
    }

    /* when / what to change is the conductor's (conductor.js): the next entry by the level, a hold in phrase steps scaled by Calm-Busy; 'in order' stays a fixed order */
    let nodeCond = null;
    function cond() {
      if (opts.conductor) return opts.conductor;
      if (typeof window !== 'undefined' && window.CONDUCTOR) return window.CONDUCTOR;
      if (!nodeCond && typeof require === 'function') nodeCond = require('./conductor.js');
      return nodeCond;
    }

    function pickNextSetIndex() {
      const pool = activeSeq.pool;
      const rules = activeSeq.set.rules;
      activeSeq.recent = (activeSeq.recent || []).slice(-2);
      const ix = cond().pickEntry(pool, activeSeq.currentIndex, rules, rng, activeSeq.recent);
      activeSeq.recent.push(ix);
      return ix;
    }

    function calculateSetDuration() {
      return cond().holdFor(activeSeq.set.rules, rng);
    }

    function advanceSetEntry() {
      if (!activeSeq || activeSeq.type !== 'set') return false;
      // Re-filter pool in case items changed
      const pool = activeSeq.set.pool.filter(e => isItemAvailable(e));
      if (pool.length === 0) {
        stopSequencer();
        return false;
      }
      activeSeq.pool = pool;

      const nextIdx = pickNextSetIndex();
      activeSeq.currentIndex = nextIdx;
      activeSeq.playCount++;
      activeSeq.barInStep = 1;
      activeSeq.barsInStep = calculateSetDuration();
      activeSeq.pendingDropSwitch = false;

      const entry = pool[nextIdx];
      const resolved = resolveEntry(entry);
      if (hostRef && typeof hostRef.play === 'function' && resolved) {
        hostRef.play(resolved.ref, resolved.settings);
      }
      return true;
    }

    // Host event handlers
    function handleBar(ev) {
      if (!activeSeq) return;

      if (activeSeq.type === 'story') {
        if (activeSeq.barInStep >= activeSeq.barsInStep) {
          advanceStoryStep(activeSeq.stepIndex + 1);
        } else {
          activeSeq.barInStep++;
        }
      } else if (activeSeq.type === 'set') {
        const rules = activeSeq.set.rules;
        if (activeSeq.pendingDropSwitch && rules.changeOnDrop) {
          advanceSetEntry();
        } else if (activeSeq.barInStep >= activeSeq.barsInStep) {
          advanceSetEntry();
        } else {
          activeSeq.barInStep++;
        }
      }
    }

    function handleDrop() {
      if (!activeSeq || activeSeq.type !== 'set') return;
      if (activeSeq.set.rules.changeOnDrop) {
        // "switch at the next bar, but only if current entry has run at least 4 bars" (Calm-Busy scales the 4)
        if (activeSeq.barInStep >= cond().dropMinBars()) {
          activeSeq.pendingDropSwitch = true;
        }
      }
    }

    function handleUserPick(key) {
      // User manual pick stops sequencer
      stopSequencer();
    }

    function bindHost(host) {
      hostRef = host;
      if (!host) return;
      if (typeof host.on === 'function') {
        host.on('bar', handleBar);
        host.on('drop', handleDrop);
        host.on('userpick', handleUserPick);
      }
    }

    return {
      // Data queries & mutations
      getFavourites,
      isFavourite,
      toggleFavourite,
      getVariants,
      getVariant,
      addVariant,
      removeVariant,
      getStories,
      getStory,
      addStory,
      updateStory,
      removeStory,
      getSets,
      getSet,
      addSet,
      updateSet,
      removeSet,
      getHidden,
      isHidden,
      hide,
      unhide,
      exportJSON,
      importJSON,
      // Sequencer
      bindHost,
      playStory,
      playSet,
      stop: stopSequencer,
      running,
      // Internal handlers (useful for testing)
      _handleBar: handleBar,
      _handleDrop: handleDrop,
      _handleUserPick: handleUserPick,
      _getState: () => deepClone(state),
      _setState: (newState) => { state = deepClone(newState); save(); }
    };
  }

  return {
    createCore
  };
});
