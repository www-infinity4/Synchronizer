(function () {
  'use strict';

  const HOLD_DELAY_MS = 1200;
  const YT_ORIGIN_RE = /(^|\.)youtube(?:-nocookie)?\.com$/i;
  const records = new Map();
  const timers = new Map();
  const heldByGuard = new Set();
  let armed = false;
  let manualPauseUntil = 0;

  function youtubeFrames() {
    return Array.from(document.querySelectorAll('iframe')).filter(function (frame) {
      return /youtube(?:-nocookie)?\.com\/embed/i.test(frame.src || '');
    });
  }

  function albumFrame() {
    const selectors = [
      '.album-player iframe', '.music-player iframe', '.music iframe',
      '.sound-content iframe', '[class*="album"] iframe', '[class*="music"] iframe'
    ];
    for (const selector of selectors) {
      const frame = document.querySelector(selector);
      if (frame && /youtube(?:-nocookie)?\.com\/embed/i.test(frame.src || '')) return frame;
    }
    const frames = youtubeFrames();
    return frames.length ? frames[frames.length - 1] : null;
  }

  function post(frame, func, args) {
    if (!frame || !frame.contentWindow) return;
    try {
      frame.contentWindow.postMessage(JSON.stringify({event:'command',func:func,args:args || []}), '*');
    } catch (_) {}
  }

  function announce(text) {
    document.dispatchEvent(new CustomEvent('infinity:sync-status', {detail:{text:text}}));
    const node = document.querySelector('[data-sync-guard-status], .sync-guard-status');
    if (node) node.textContent = text;
  }

  function classify(frame) {
    return frame === albumFrame() ? 'album' : 'picture';
  }

  function recordForFrame(frame) {
    if (!frame || !frame.contentWindow) return null;
    let record = records.get(frame.contentWindow);
    if (!record) {
      record = {frame:frame,role:classify(frame),state:-1,videoId:'',playlistIndex:null,contentVideoId:'',ad:false};
      records.set(frame.contentWindow, record);
    } else {
      record.frame = frame;
      record.role = classify(frame);
    }
    return record;
  }

  function peers(record) {
    return Array.from(records.values()).filter(function (other) {
      return other !== record && other.frame && document.documentElement.contains(other.frame);
    });
  }

  function pausePeer(peer) {
    if (peer.state !== 1) return;
    post(peer.frame, 'pauseVideo', []);
    heldByGuard.add(peer);
  }

  function holdOthers(record, reason) {
    if (!armed || Date.now() < manualPauseUntil) return;
    peers(record).forEach(pausePeer);
    document.querySelectorAll('video').forEach(function (video) {
      if (!video.paused && !video.ended) {
        try { video.pause(); video.dataset.infinitySyncHeld = '1'; } catch (_) {}
      }
    });
    if (heldByGuard.size || document.querySelector('video[data-infinity-sync-held="1"]')) {
      announce('Sync protected during ' + reason + '. Playback will continue together.');
    }
  }

  function resumeHeld() {
    if (!armed || Date.now() < manualPauseUntil) return;
    heldByGuard.forEach(function (peer) { post(peer.frame, 'playVideo', []); });
    heldByGuard.clear();
    document.querySelectorAll('video[data-infinity-sync-held="1"]').forEach(function (video) {
      delete video.dataset.infinitySyncHeld;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') promise.catch(function () {});
    });
    announce('Playback resumed together.');
  }

  function cancelHold(record) {
    const timer = timers.get(record);
    if (timer) window.clearTimeout(timer);
    timers.delete(record);
  }

  function scheduleHold(record, reason) {
    if (!armed || timers.has(record)) return;
    const timer = window.setTimeout(function () {
      timers.delete(record);
      if (record.ad || record.state === 2 || record.state === 3 || record.state === -1) holdOthers(record, reason);
    }, HOLD_DELAY_MS);
    timers.set(record, timer);
  }

  function stateChanged(record, state) {
    record.state = state;
    if (!armed) return;
    if (state === 2 || state === 3 || state === -1) {
      scheduleHold(record, state === 3 ? 'buffering' : 'an interruption');
      return;
    }
    cancelHold(record);
    if (state === 1 && !record.ad && heldByGuard.size) resumeHeld();
  }

  function inspectInfo(record, info) {
    if (!info || typeof info !== 'object') return;
    if (typeof info.playerState === 'number') stateChanged(record, Number(info.playerState));
    const data = info.videoData || {};
    const videoId = data.video_id || data.videoId || '';
    if (!videoId) return;
    const playlistIndex = Number.isInteger(info.playlistIndex) ? info.playlistIndex : null;
    if (!record.contentVideoId || (playlistIndex !== null && record.playlistIndex !== null && playlistIndex !== record.playlistIndex)) {
      record.videoId = videoId;
      record.contentVideoId = videoId;
      record.playlistIndex = playlistIndex;
      record.ad = false;
      return;
    }
    record.videoId = videoId;
    if (videoId !== record.contentVideoId) {
      record.ad = true;
      scheduleHold(record, 'a commercial break');
      return;
    }
    if (record.ad) {
      record.ad = false;
      cancelHold(record);
      if (record.state === 1) resumeHeld();
    }
  }

  function listen(frame) {
    const record = recordForFrame(frame);
    if (!record) return;
    if (!frame.id) frame.id = 'infinity-sync-' + Math.random().toString(36).slice(2);
    try {
      frame.contentWindow.postMessage(JSON.stringify({event:'listening',id:frame.id}), '*');
      post(frame, 'addEventListener', ['onStateChange']);
      post(frame, 'addEventListener', ['onError']);
    } catch (_) {}
  }

  function bindVideos() {
    document.querySelectorAll('video').forEach(function (video) {
      if (video.dataset.infinitySyncBound === '1') return;
      video.dataset.infinitySyncBound = '1';
      const hold = function () { if (!video.paused) scheduleNativeHold(video); };
      video.addEventListener('waiting', hold);
      video.addEventListener('stalled', hold);
      video.addEventListener('playing', function () { if (heldByGuard.size) resumeHeld(); });
    });
  }

  function scheduleNativeHold(video) {
    window.setTimeout(function () {
      if (armed && (video.readyState < 3 || video.paused)) {
        Array.from(records.values()).forEach(pausePeer);
        if (heldByGuard.size) announce('Sync protected while the picture reconnects.');
      }
    }, HOLD_DELAY_MS);
  }

  function scan() {
    youtubeFrames().forEach(listen);
    bindVideos();
  }

  window.addEventListener('message', function (event) {
    try {
      const host = new URL(event.origin).hostname;
      if (!YT_ORIGIN_RE.test(host)) return;
      const record = records.get(event.source);
      if (!record) return;
      const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (!payload || typeof payload !== 'object') return;
      if (payload.event === 'onStateChange') stateChanged(record, Number(payload.info));
      if (payload.event === 'infoDelivery') inspectInfo(record, payload.info);
    } catch (_) {}
  });

  document.addEventListener('click', function (event) {
    const target = event.target && event.target.closest ? event.target.closest('button, a') : null;
    if (!target) return;
    const label = (target.textContent || target.getAttribute('aria-label') || '').trim().toLowerCase();
    if (/pause|stop/.test(label)) {
      manualPauseUntil = Date.now() + 3000;
      heldByGuard.clear();
      return;
    }
    if (/start|resume|restart|pair|play/.test(label)) {
      armed = true;
      manualPauseUntil = 0;
      window.setTimeout(scan, 100);
    }
  }, true);

  const observer = new MutationObserver(function (changes) {
    if (changes.some(function (change) { return change.addedNodes && change.addedNodes.length; })) window.requestAnimationFrame(scan);
  });
  observer.observe(document.documentElement, {childList:true,subtree:true});
  window.setInterval(scan, 3000);
  window.setTimeout(scan, 400);
  window.InfinitySyncGuard = {scan:scan,arm:function(){armed=true;scan();},version:'20260913-hold1'};
})();
