/**
 * Meta (Facebook) Pixel event helpers.
 * The base pixel + init + initial PageView live in index.html.
 * Every helper guards `window.fbq` so the app never crashes if the pixel
 * script is blocked (ad blockers) or not yet loaded.
 */

const fbq = (...args) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
};

export function trackPageView() {
  fbq('track', 'PageView');
}

export function trackViewContent({ id, name, value, currency = 'INR' }) {
  fbq('track', 'ViewContent', {
    content_ids: [id],
    content_name: name,
    content_type: 'product',
    value: Number(value) || 0,
    currency,
  });
}

export function trackAddToCart({ id, name, value, currency = 'INR', quantity = 1 }) {
  fbq('track', 'AddToCart', {
    content_ids: [id],
    content_name: name,
    content_type: 'product',
    value: Number(value) || 0,
    currency,
    contents: [{ id, quantity: Number(quantity) || 1 }],
  });
}

export function trackInitiateCheckout({ value, currency = 'INR', num_items }) {
  fbq('track', 'InitiateCheckout', {
    value: Number(value) || 0,
    currency,
    num_items: Number(num_items) || 0,
  });
}

export function trackPurchase({ value, currency = 'INR', order_id, contents }) {
  fbq('track', 'Purchase', {
    value: Number(value) || 0,
    currency,
    order_id,
    content_type: 'product',
    contents: Array.isArray(contents) ? contents : [],
  });
}
