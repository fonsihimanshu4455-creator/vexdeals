// ── Meta (Facebook) Pixel ───────────────────────────────────────────────────
// Set your Pixel ID below (or via VITE_META_PIXEL_ID env var). Until an ID is
// provided, every helper is a safe no-op so the site works unchanged.

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || ''; // ← apna Meta Pixel ID yahan daalo

let initialised = false;

export function initPixel() {
  if (initialised || !PIXEL_ID || typeof window === 'undefined') return;

  /* Standard Meta Pixel base code */
  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
  initialised = true;
}

export function trackPageView() {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', 'PageView');
}

export function trackEvent(event, params = {}) {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', event, params);
}

export const pixelEnabled = Boolean(PIXEL_ID);
