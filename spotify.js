/* spotify.js - standalone Spotify module (Authorization Code + PKCE, no client secret).
   Load with <script src="spotify.js"></script>. Exposes window.SPOTIFY.
   Only login, now playing and transport control. The audio itself is NOT available to
   web pages; the visuals hear it through the page's "Computer sound" capture.
   Page must be served from http://127.0.0.1:PORT/ (see serve-sim.ps1). */
(function () {
  'use strict';
  var SCOPES = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
  var AUTH_URL = 'https://accounts.spotify.com/authorize';
  var TOKEN_URL = 'https://accounts.spotify.com/api/token';
  var API = 'https://api.spotify.com/v1';
  var K = { id: 'spotify.clientId', tok: 'spotify.tokens', ver: 'spotify.verifier', st: 'spotify.state', ret: 'spotify.returnTo' };

  function sget(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function sdel(k) { try { window.localStorage.removeItem(k); } catch (e) {} }

  function SpotifyError(code, message, extra) {
    var e = new Error(message);
    e.name = 'SpotifyError';
    e.code = code; // not_connected | no_client_id | file_protocol | bad_origin | no_device | premium_required | rate_limited | auth | network | api
    if (extra) for (var k in extra) e[k] = extra[k];
    return e;
  }

  // ---- PKCE helpers ----
  function b64url(buf) {
    var bytes = new Uint8Array(buf), s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function randomString(len) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    var arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    var s = '';
    for (var i = 0; i < len; i++) s += chars[arr[i] % chars.length];
    return s;
  }
  function challengeFor(verifier) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)).then(b64url);
  }

  // ---- environment ----
  function originProblem() {
    if (location.protocol === 'file:')
      return 'This page was opened from a file. Spotify login only works through the local server: ' +
        'double-click "Open simulator (local server).cmd" (it opens http://127.0.0.1:8793/).';
    if (location.hostname !== '127.0.0.1' && location.hostname !== '[::1]')
      return 'Spotify only accepts http://127.0.0.1:PORT (not "' + location.hostname + '"). Open this page as ' +
        'http://127.0.0.1:' + (location.port || '8793') + '/ instead.';
    return null;
  }
  // Always the root of the local server: one fixed URI to register. After login we send the browser back to the page we came from.
  function computeRedirectUri() { return location.origin + '/'; }

  // ---- tokens ----
  function loadTok() { try { return JSON.parse(sget(K.tok) || 'null'); } catch (e) { return null; } }
  function saveTok(t) { sset(K.tok, JSON.stringify(t)); }

  function tokenRequest(params) {
    var body = new URLSearchParams(params).toString();
    return fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) throw SpotifyError('auth', 'Spotify login failed: ' + (j.error_description || j.error || r.status), { status: r.status, body: j });
          return j;
        });
      }, function () { throw SpotifyError('network', 'Cannot reach Spotify (network error).'); });
  }
  function storeTokenResponse(j, oldRefresh) {
    saveTok({
      access: j.access_token,
      refresh: j.refresh_token || oldRefresh, // refresh token may not rotate
      expires: Date.now() + (j.expires_in || 3600) * 1000
    });
  }

  var refreshing = null;
  function refresh() {
    if (refreshing) return refreshing;
    var t = loadTok(), id = S.clientId;
    if (!t || !t.refresh || !id) return Promise.reject(SpotifyError('not_connected', 'Not connected to Spotify.'));
    refreshing = tokenRequest({ grant_type: 'refresh_token', refresh_token: t.refresh, client_id: id })
      .then(function (j) { storeTokenResponse(j, t.refresh); refreshing = null; return loadTok().access; },
        function (e) {
          refreshing = null;
          if (e.code === 'auth' && e.body && e.body.error === 'invalid_grant') { sdel(K.tok); e = SpotifyError('not_connected', 'Spotify session expired. Connect again.'); }
          throw e;
        });
    return refreshing;
  }
  function getAccess() {
    var t = loadTok();
    if (!t) return Promise.reject(SpotifyError('not_connected', 'Not connected to Spotify.'));
    if (Date.now() > t.expires - 60000) return refresh(); // refresh a minute early
    return Promise.resolve(t.access);
  }

  // ---- API call with error mapping ----
  function api(method, path, body, retried) {
    return getAccess().then(function (tok) {
      var opt = { method: method, headers: { Authorization: 'Bearer ' + tok } };
      if (body) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
      return fetch(API + path, opt).then(function (r) {
        if (r.status === 204 || r.status === 202) return null;
        if (r.status === 401 && !retried) return refresh().then(function () { return api(method, path, body, true); });
        if (r.status === 401) { sdel(K.tok); throw SpotifyError('not_connected', 'Spotify session expired. Connect again.'); }
        if (r.status === 429) {
          var ra = parseInt(r.headers.get('Retry-After') || '1', 10) || 1;
          throw SpotifyError('rate_limited', 'Spotify says slow down; retry in ' + ra + ' s.', { retryAfter: ra });
        }
        return r.text().then(function (txt) {
          var j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
          if (r.ok) return j;
          var msg = j && j.error && j.error.message || ('HTTP ' + r.status);
          var reason = j && j.error && j.error.reason;
          if (r.status === 404 || reason === 'NO_ACTIVE_DEVICE')
            throw SpotifyError('no_device', 'No active Spotify device. Start playing something in the Spotify app, then try again.', { status: r.status });
          if (r.status === 403 && (reason === 'PREMIUM_REQUIRED' || /premium/i.test(msg)))
            throw SpotifyError('premium_required', 'Spotify Premium is required to control playback.', { status: r.status });
          if (r.status === 403) throw SpotifyError('api', 'Spotify refused: ' + msg + ' (the app owner needs Premium, and your account must be added as a user in Development Mode).', { status: r.status });
          throw SpotifyError('api', 'Spotify error: ' + msg, { status: r.status });
        });
      }, function () { throw SpotifyError('network', 'Cannot reach Spotify (network error).'); });
    });
  }

  // ---- public object ----
  var S = {
    SCOPES: SCOPES,
    _b64url: b64url, _challengeFor: challengeFor, _originProblem: originProblem,

    get clientId() { return sget(K.id) || ''; },
    set clientId(v) { v = String(v || '').trim(); if (v) sset(K.id, v); else sdel(K.id); },

    get redirectUri() { return computeRedirectUri(); },

    buildAuthUrl: function (clientId, redirectUri, state, challenge) {
      var p = new URLSearchParams({
        response_type: 'code', client_id: clientId, scope: SCOPES,
        redirect_uri: redirectUri, state: state,
        code_challenge_method: 'S256', code_challenge: challenge
      });
      return AUTH_URL + '?' + p.toString();
    },

    // Resolves when the redirect starts (page navigates away). Rejects with a readable SpotifyError.
    connect: function () {
      var prob = originProblem();
      if (prob) return Promise.reject(SpotifyError(location.protocol === 'file:' ? 'file_protocol' : 'bad_origin', prob));
      var id = S.clientId;
      if (!id) return Promise.reject(SpotifyError('no_client_id', 'Enter your Spotify Client ID first.'));
      var verifier = randomString(96), state = randomString(24);
      return challengeFor(verifier).then(function (ch) {
        sset(K.ver, verifier); sset(K.st, state);
        sset(K.ret, location.pathname + location.search);
        location.href = S.buildAuthUrl(id, computeRedirectUri(), state, ch);
      });
    },

    // Call on page load (also runs automatically once). Returns a promise: 'connected' | 'denied' | null (nothing to do).
    handleRedirect: function () {
      if (S._redirectPromise) return S._redirectPromise;
      var q = new URLSearchParams(location.search);
      var code = q.get('code'), err = q.get('error'), state = q.get('state');
      if (!code && !err) return Promise.resolve(null);
      var savedState = sget(K.st), verifier = sget(K.ver), ret = sget(K.ret);
      history.replaceState(null, '', location.pathname);
      sdel(K.st); sdel(K.ver); sdel(K.ret);
      if (!state || state !== savedState) { S._redirectPromise = Promise.resolve(null); return S._redirectPromise; } // not ours / CSRF: ignore
      if (err) { S._redirectPromise = Promise.reject(SpotifyError('auth', 'Spotify login was cancelled or denied (' + err + ').')); return S._redirectPromise; }
      S._redirectPromise = tokenRequest({
        grant_type: 'authorization_code', code: code, redirect_uri: computeRedirectUri(),
        client_id: S.clientId, code_verifier: verifier || ''
      }).then(function (j) {
        storeTokenResponse(j);
        if (ret && ret !== location.pathname + location.search && ret.charAt(0) === '/') location.replace(ret); // back to the page we came from
        return 'connected';
      });
      return S._redirectPromise;
    },

    disconnect: function () { S.stopPolling(); sdel(K.tok); },
    isConnected: function () { var t = loadTok(); return !!(t && t.refresh); },

    nowPlaying: function () {
      return api('GET', '/me/player?additional_types=track,episode').then(function (j) {
        if (!j || !j.item) return null;
        var it = j.item, imgs = (it.album && it.album.images) || (it.images) || (it.show && it.show.images) || [];
        var img = imgs.length ? (imgs.length > 1 ? imgs[1] : imgs[0]) : null;
        return {
          title: it.name || '',
          artist: it.artists ? it.artists.map(function (a) { return a.name; }).join(', ') : (it.show ? it.show.publisher : ''),
          album: it.album ? it.album.name : (it.show ? it.show.name : ''),
          coverUrl: img ? img.url : '',
          progressMs: j.progress_ms || 0,
          durationMs: it.duration_ms || 0,
          isPlaying: !!j.is_playing,
          deviceName: j.device ? j.device.name : ''
        };
      });
    },

    play: function () { return api('PUT', '/me/player/play'); },
    pause: function () { return api('PUT', '/me/player/pause'); },
    toggle: function () {
      return api('GET', '/me/player').then(function (j) { return (j && j.is_playing) ? S.pause() : S.play(); });
    },
    next: function () { return api('POST', '/me/player/next'); },
    previous: function () { return api('POST', '/me/player/previous'); },
    seek: function (ms) { return api('PUT', '/me/player/seek?position_ms=' + Math.max(0, Math.round(ms))); },

    // Polling: cb(nowPlayingOrNull, errorOrNull). Respects Retry-After; stops itself when disconnected.
    _timer: null,
    startPolling: function (cb, ms) {
      S.stopPolling();
      ms = ms || 3000;
      var running = true;
      S._timer = { stop: function () { running = false; } };
      var handle = S._timer;
      (function tick() {
        if (!running || S._timer !== handle) return;
        var delay = ms;
        S.nowPlaying().then(function (np) { try { cb(np, null); } catch (e) {} },
          function (e) {
            if (e.code === 'rate_limited') delay = Math.max(ms, e.retryAfter * 1000);
            if (e.code === 'not_connected') running = false;
            try { cb(null, e); } catch (x) {}
          }).then(function () { if (running && S._timer === handle) setTimeout(tick, delay); });
      })();
    },
    stopPolling: function () { if (S._timer) { S._timer.stop(); S._timer = null; } }
  };

  window.SPOTIFY = S;
  // Auto-handle a login redirect; page code may also call handleRedirect() (same promise).
  if (/[?&](code|error)=/.test(location.search)) S.handleRedirect().catch(function () {});
})();
