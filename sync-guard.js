(function () {
  'use strict';

  const DRIFT_GRACE_MS = 2800;
  const RESYNC_COOLDOWN_MS = 8000;
  const YT_ORIGIN_RE = /(^|\.)youtube(?:-nocookie)?\.com$/i;
  let lastResyncAt = 0;
  let interruptionSince = 0;
  let lastState = null;
  let contentVideoId = '';
  let contentPlaylistIndex = null;
  let suspectedAd = false;
  let armed = false;

  function youtubeFrames() {
    return Array.from(document.querySelectorAll('iframe')).filter((frame) => /youtube(?:-nocookie)?\.com\/embed/i.test(frame.src || ''));
  }

  function albumFrame() {
    const preferred = [
      '.album-player iframe', '.music iframe', '.sound-content iframe',
      '[class*="album"] iframe', '[class*="music"] iframe', 'aside iframe'
    ];
    for (const selector of preferred) {
      const frame = document.querySelector(selector);
      if (frame && /youtube(?:-nocookie)?\.com\/embed/i.test(frame.src || '')) return frame;
    }
    const frames = youtubeFrames();
    return frames.length ? frames[frames.length - 1] : null;
  }

  function post(frame, func, args) {
    if (!frame || !frame.contentWindow) return;
    try {
      frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
    } catch (_) {}
  }

  function listen(frame) {
    if (!frame || !frame.contentWindow) return;
    try {
      if (!frame.id) frame.id = 'infinity-sync-album-' + Math.random().toString(36).slice(2);
      frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: frame.id }), '*');
      post(frame, 'addEventListener', ['onStateChange']);
      post(frame, 'addEventListener', ['onError']);
    } catch (_) {}
  }

  function playingPrimary() {
    const videos = Array.from(document.querySelectorAll('video'));
    if (videos.some((v) => !v.paused && !v.ended)) return true;
    return false;
  }

  function announce(text) {
    const nodes = Array.from(document.querySelectorAll('[role="status"], .status, .message, .sync-status'));
    const node = nodes.find((el) => el && el.textContent != null);
    if (node) node.textContent = text;
    document.dispatchEvent(new CustomEvent('infinity:sync-status', { detail: { text: text } }));
  }

  function resetPrimaryPlayers(album) {
    document.querySelectorAll('video').forEach((video) => {
      try {
        video.currentTime = 0;
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (_) {}
    });

    youtubeFrames().forEach((frame) => {
      if (frame === album) return;
      post(frame, 'seekTo', [0, true]);
      post(frame, 'playVideo', []);
    });
  }

  function resetAlbum(album) {
    if (!album) return;
    post(album, 'playVideoAt', [0]);
    window.setTimeout(function () {
      post(album, 'seekTo', [0, true]);
      post(album, 'playVideo', []);
    }, 180);
  }

  function resync(reason) {
    const now = Date.now();
    if (now - lastResyncAt < RESYNC_COOLDOWN_MS) return;
    const album = albumFrame();
    if (!album) return;
    lastResyncAt = now;
    interruptionSince = 0;
    suspectedAd = false;
    contentVideoId = '';
    contentPlaylistIndex = null;
    resetPrimaryPlayers(album);
    resetAlbum(album);
    announce('Re-synced automatically: picture 00:00 · album 00:00' + (reason ? ' — ' + reason : ''));
  }

  function stateChanged(state) {
    lastState = state;
    if (!armed) return;
    if (!playingPrimary()) return;

    if (state === 2 || state === 3 || state === -1) {
      if (!interruptionSince) interruptionSince = Date.now();
      return;
    }

    if (state === 1 && interruptionSince) {
      const delayed = Date.now() - interruptionSince;
      interruptionSince = 0;
      if (delayed >= DRIFT_GRACE_MS) resync('music returned after an interruption');
    }
  }

  function inspectInfo(info) {
    if (!info || typeof info !== 'object') return;
    if (typeof info.playerState === 'number') stateChanged(info.playerState);

    const data = info.videoData || {};
    const videoId = data.video_id || data.videoId || '';
    const playlistIndex = Number.isInteger(info.playlistIndex) ? info.playlistIndex : null;
    if (!videoId) return;

    if (!contentVideoId) {
      contentVideoId = videoId;
      contentPlaylistIndex = playlistIndex;
      return;
    }

    if (playlistIndex !== null && contentPlaylistIndex !== null && playlistIndex !== contentPlaylistIndex) {
      contentVideoId = videoId;
      contentPlaylistIndex = playlistIndex;
      suspectedAd = false;
      return;
    }

    if (videoId !== contentVideoId) {
      suspectedAd = true;
      return;
    }

    if (suspectedAd && videoId === contentVideoId && lastState === 1) {
      resync('album returned from a commercial');
    }
  }

  window.addEventListener('message', function (event) {
    try {
      const host = new URL(event.origin).hostname;
      if (!YT_ORIGIN_RE.test(host)) return;
      const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (!payload || typeof payload !== 'object') return;
      if (payload.event === 'onStateChange') stateChanged(Number(payload.info));
      if (payload.event === 'infoDelivery') inspectInfo(payload.info);
    } catch (_) {}
  });

  document.addEventListener('click', function (event) {
    const target = event.target && event.target.closest ? event.target.closest('button, a') : null;
    if (!target) return;
    const label = (target.textContent || '').trim().toLowerCase();
    if (/next\s+(song|track)|skip\s+(song|track)/.test(label)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      announce('Full-album mode is on. The album continues in order without manual song changes.');
    }
  }, true);

  function armCurrentAlbum() {
    const frame = albumFrame();
    if (!frame) return;
    listen(frame);
    if (!armed) {
      armed = true;
      announce('Full-album sync guard ready. Commercials remain in YouTube; playback will re-sync to 00:00 after a disruptive break.');
    }
  }

  const observer = new MutationObserver(function () { armCurrentAlbum(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setInterval(armCurrentAlbum, 2000);
  window.setTimeout(armCurrentAlbum, 500);
})();
