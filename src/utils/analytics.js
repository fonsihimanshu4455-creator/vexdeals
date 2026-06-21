/**
 * On-site analytics. Keeps fast cumulative counters in site/analytics AND logs
 * a per-event document in the `events` collection (with the logged-in user,
 * product and date) so the admin can see WHO clicked WHAT and WHEN, filter by
 * date, and export.
 */
import { doc, setDoc, increment, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const bump = (data) => {
  if (!db) return;
  setDoc(doc(db, 'site', 'analytics'), data, { merge: true }).catch(() => {});
};

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('vexdeals_user') || 'null'); } catch { return null; }
};

function logEvent(type, details = {}) {
  if (!db) return;
  const u = getUser();
  const now = new Date();
  addDoc(collection(db, 'events'), {
    type,
    userId: u?.id || 'guest',
    userName: u?.name || (u ? 'Customer' : 'Guest'),
    userPhone: u?.phone || '',
    userEmail: u?.email || '',
    productId: details.productId != null ? String(details.productId) : '',
    label: details.label || '',
    path: details.path || '',
    value: Number(details.value) || 0,
    date: now.toISOString().slice(0, 10),  // YYYY-MM-DD
    ts: now.toISOString(),
  }).catch(() => {});
}

export function trackVisit() {
  try {
    if (sessionStorage.getItem('vex_visited')) return; // one visit per browser session
    sessionStorage.setItem('vex_visited', '1');
  } catch { /* ignore */ }
  bump({ visits: increment(1) });
  logEvent('visit', { path: typeof location !== 'undefined' ? location.pathname : '' });
}

export function trackProductView(productId, label = '') {
  bump({ productViews: increment(1), byProduct: { [String(productId)]: increment(1) } });
  logEvent('view', { productId, label });
}

export function trackAddToCartHit(productId = '', label = '') {
  bump({ addToCart: increment(1) });
  logEvent('cart', { productId, label });
}

export function trackCheckoutHit() {
  bump({ checkouts: increment(1) });
  logEvent('checkout', {});
}

export function trackPurchaseHit(value = 0) {
  bump({ purchases: increment(1), revenue: increment(Number(value) || 0) });
  logEvent('purchase', { value });
}
