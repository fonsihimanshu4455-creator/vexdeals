// Google Analytics (GA4) helpers. The base gtag snippet lives in index.html.
const GA_ID = 'G-ZFDBWRZ18X';

const gtag = (...args) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag(...args);
};

// SPA page view — called on every route change (page_view is disabled in config).
export function gaPageView(path) {
  gtag('event', 'page_view', {
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    page_title: typeof document !== 'undefined' ? document.title : '',
    send_to: GA_ID,
  });
}

export function gaEvent(name, params = {}) {
  gtag('event', name, { ...params, send_to: GA_ID });
}

export function gaPurchase({ value = 0, transactionId = '', items = [] }) {
  gtag('event', 'purchase', {
    transaction_id: String(transactionId || Date.now()),
    value: Number(value) || 0,
    currency: 'INR',
    items: items.map((i) => ({ item_id: String(i.id), quantity: i.quantity || 1 })),
    send_to: GA_ID,
  });
}
