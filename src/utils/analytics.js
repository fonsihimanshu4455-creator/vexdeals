/**
 * Lightweight on-site analytics — counts visits, product views, add-to-carts,
 * checkouts and purchases into a single Firestore doc (site/analytics) using
 * atomic increments. Read by the admin Tracking page.
 */
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

const bump = (data) => {
  if (!db) return;
  setDoc(doc(db, 'site', 'analytics'), data, { merge: true }).catch(() => {});
};

export function trackVisit() {
  try {
    if (sessionStorage.getItem('vex_visited')) return; // one visit per browser session
    sessionStorage.setItem('vex_visited', '1');
  } catch { /* ignore */ }
  bump({ visits: increment(1) });
}

export function trackProductView(productId) {
  bump({
    productViews: increment(1),
    byProduct: { [String(productId)]: increment(1) },
  });
}

export function trackAddToCartHit() {
  bump({ addToCart: increment(1) });
}

export function trackCheckoutHit() {
  bump({ checkouts: increment(1) });
}

export function trackPurchaseHit(value = 0) {
  bump({ purchases: increment(1), revenue: increment(Number(value) || 0) });
}
