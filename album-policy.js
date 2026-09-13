(function () {
  'use strict';

  const BLOCKED = /next\s+(song|track)|skip\s+(song|track)|opening[-\s]track\s+only|first\s+song\s+only/i;

  function normalize() {
    document.querySelectorAll('button, a').forEach(function (node) {
      const label = (node.textContent || '').trim();
      if (!BLOCKED.test(label)) return;
      node.setAttribute('hidden', '');
      node.setAttribute('aria-hidden', 'true');
      node.setAttribute('tabindex', '-1');
    });

    document.querySelectorAll('[role="status"], [role="alert"], .status, .message, .notice, .error').forEach(function (node) {
      if (!node.textContent) return;
      node.textContent = node.textContent
        .replace(/try next song/ig, 'reload the full album')
        .replace(/opening[-\s]track fallback/ig, 'full-album reload')
        .replace(/only the opening song repeats[^.]*\.?/ig, 'Full-album mode only.');
    });
  }

  document.addEventListener('click', function (event) {
    const target = event.target && event.target.closest ? event.target.closest('button, a') : null;
    if (!target || !BLOCKED.test((target.textContent || '').trim())) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  const observer = new MutationObserver(normalize);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', normalize, { once: true });
  window.setTimeout(normalize, 500);
  window.setInterval(normalize, 2500);
})();
