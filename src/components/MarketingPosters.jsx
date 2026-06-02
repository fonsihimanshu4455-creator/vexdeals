import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

// Show only posters that are active and within their start/end date window.
const isLive = (p) => {
  if (p.active === false) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (p.startDate) {
    const s = new Date(p.startDate);
    if (!Number.isNaN(s.getTime()) && today < s) return false;
  }
  if (p.endDate) {
    const e = new Date(p.endDate);
    e.setHours(23, 59, 59, 999);
    if (!Number.isNaN(e.getTime()) && today > e) return false;
  }
  return Boolean(p.imageUrl);
};

export default function MarketingPosters() {
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(
      collection(db, 'posters'),
      (snap) => setPosters(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
      () => {}
    );
  }, []);

  const live = posters.filter(isLive);
  if (live.length === 0) return null;

  const single = live.length === 1;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 reveal">
      <p className="eyebrow mb-4">✦ Latest Offers</p>
      <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x pb-2">
        {live.map((p) => (
          <div
            key={p.id}
            className={`relative shrink-0 snap-start rounded-3xl overflow-hidden shadow-card bg-cream-200 ${
              single ? 'w-full' : 'w-[88%] sm:w-[58%] lg:w-[42%]'
            }`}
          >
            <img
              src={p.imageUrl}
              alt={p.title || 'Offer'}
              className="w-full h-auto max-h-[440px] object-cover"
              loading="lazy"
            />
            {(p.title || p.caption) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-5">
                {p.title && <p className="font-display font-bold text-white text-lg sm:text-2xl leading-tight">{p.title}</p>}
                {p.caption && <p className="text-white/85 text-xs sm:text-sm mt-1 line-clamp-1">{p.caption}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
