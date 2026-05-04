import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

/**
 * TestimonialContext — manages homepage testimonials / customer reviews.
 * Persists to localStorage with cross-tab sync (BroadcastChannel + storage).
 */

const TestimonialContext = createContext();
const STORAGE_KEY = 'vexdeals_testimonials';
const CHANNEL_KEY = 'vexdeals_testimonials_channel';

const DEFAULT_TESTIMONIALS = [
  {
    name:   'Rahul Sharma',
    role:   'Verified buyer · Mumbai',
    avatar: 'https://i.pravatar.cc/120?img=12',
    quote:  "The watch I ordered exceeded every expectation. Build quality is insane for the price — feels like a brand twice the cost.",
    rating: 5,
    active: true,
  },
  {
    name:   'Priya Patel',
    role:   'Verified buyer · Delhi',
    avatar: 'https://i.pravatar.cc/120?img=32',
    quote:  "Got my aviators in 2 days. Polarized lenses are stunning and the packaging felt seriously premium. Now my daily pair.",
    rating: 5,
    active: true,
  },
  {
    name:   'Karan Mehta',
    role:   'Verified buyer · Bangalore',
    avatar: 'https://i.pravatar.cc/120?img=47',
    quote:  "Their support team is gold. Had a sizing issue and they replaced same-day. This is how every store should run.",
    rating: 5,
    active: true,
  },
];

const normalize = (raw, idx = 0) => {
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.name || '').trim();
  const quote = String(raw.quote || '').trim();
  if (!name || !quote) return null;
  return {
    id:        Number(raw.id) || idx + 1,
    name,
    role:      String(raw.role || 'Verified buyer').trim(),
    avatar:    String(raw.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a8a&color=fff`).trim(),
    quote,
    rating:    Math.min(5, Math.max(1, Number(raw.rating) || 5)),
    active:    raw.active !== false,
    sortOrder: Number(raw.sortOrder) || idx + 1,
  };
};

const normalizeList = (list) => {
  const safe = Array.isArray(list) ? list : DEFAULT_TESTIMONIALS;
  return safe
    .map((t, i) => normalize(t, i))
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

const readStored = () => {
  if (typeof window === 'undefined') return normalizeList(DEFAULT_TESTIMONIALS);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeList(JSON.parse(saved)) : normalizeList(DEFAULT_TESTIMONIALS);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return normalizeList(DEFAULT_TESTIMONIALS);
  }
};

export function TestimonialProvider({ children }) {
  const [items, setItems] = useState(() => readStored());
  const channelRef = useRef(null);
  const lastSnap   = useRef(JSON.stringify(items));

  useEffect(() => {
    const snap = JSON.stringify(items);
    if (snap === lastSnap.current) return;
    lastSnap.current = snap;
    try { localStorage.setItem(STORAGE_KEY, snap); } catch { /* */ }
    channelRef.current?.postMessage(snap);
  }, [items]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    channelRef.current = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_KEY) : null;

    const apply = (next) => {
      const snap = JSON.stringify(next);
      if (snap === lastSnap.current) return;
      lastSnap.current = snap;
      setItems(next);
    };
    const onStorage = (e) => { if (!e.key || e.key === STORAGE_KEY) apply(readStored()); };
    const onMessage = (e) => { try { apply(normalizeList(JSON.parse(e.data))); } catch { /* */ } };

    window.addEventListener('storage', onStorage);
    channelRef.current?.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('storage', onStorage);
      channelRef.current?.removeEventListener('message', onMessage);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  const activeTestimonials = useMemo(() => items.filter((t) => t.active), [items]);

  const add = (data) => {
    const id = items.reduce((m, t) => Math.max(m, t.id), 0) + 1;
    const sortOrder = items.reduce((m, t) => Math.max(m, t.sortOrder), 0) + 1;
    const n = normalize({ id, sortOrder, active: true, ...data }, items.length);
    if (!n) return null;
    setItems((cur) => normalizeList([...cur, n]));
    return n;
  };
  const update = (id, patch) =>
    setItems((cur) => normalizeList(cur.map((t) => (t.id === id ? { ...t, ...patch } : t))));
  const remove = (id) => setItems((cur) => cur.filter((t) => t.id !== id));
  const toggle = (id) => setItems((cur) => cur.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));

  const value = useMemo(() => ({
    testimonials: items,
    activeTestimonials,
    addTestimonial:    add,
    updateTestimonial: update,
    removeTestimonial: remove,
    toggleTestimonial: toggle,
  }), [items, activeTestimonials]);

  return <TestimonialContext.Provider value={value}>{children}</TestimonialContext.Provider>;
}

export const useTestimonials = () => useContext(TestimonialContext);
