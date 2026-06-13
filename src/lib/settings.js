// Site-wide settings stored in Firestore (site/settings), editable from
// Admin → Settings. Components fall back to these defaults when offline.
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const DEFAULT_SETTINGS = {
  announcement: '✦ Free shipping over ₹1000 · Use code VEXFIRST for 10% off',
  freeShippingMin: 1000,
  whatsappNumber: '919034948078',
  trustBadges: [
    { t: '100% Authentic', s: 'Verified genuine brands' },
    { t: 'Fast Shipping', s: 'Free over ₹1000' },
    { t: '7-Day Returns', s: 'Easy & hassle-free' },
  ],
};

export function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(doc(db, 'site', 'settings'), (snap) => {
      if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
    }, () => {});
  }, []);

  return settings;
}
