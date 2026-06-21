import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Culture-Circle style 3D product coverflow — cards float on a perspective grid,
// center card faces front, neighbours rotate away. Auto-rotates; arrows to nudge.
export default function Coverflow3D({ products = [], title = 'The Drops', subtitle }) {
  const items = products.slice(0, 10);
  const n = items.length;
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (n < 2) return undefined;
    timer.current = setInterval(() => setActive((a) => (a + 1) % n), 3500);
    return () => clearInterval(timer.current);
  }, [n]);

  if (n === 0) return null;

  const go = (dir) => {
    clearInterval(timer.current);
    setActive((a) => (a + dir + n) % n);
  };

  const styleFor = (i) => {
    let off = i - active;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    const abs = Math.abs(off);
    if (abs > 2) return { opacity: 0, pointerEvents: 'none', transform: 'translateX(0) scale(.5)' };
    return {
      transform: `translateX(${off * 62}%) translateZ(${-abs * 150}px) rotateY(${off * -34}deg) scale(${1 - abs * 0.14})`,
      opacity: abs === 2 ? 0.45 : 1,
      zIndex: 20 - abs,
      filter: abs ? 'brightness(.82)' : 'none',
    };
  };

  const current = items[active];
  const fmt = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

  return (
    <section className="coverflow-grid relative overflow-hidden py-14 reveal">
      <div className="text-center mb-8 px-4">
        <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-ink-900">{title}</h2>
        {subtitle && <p className="text-ink-700/60 mt-2 text-sm sm:text-base">{subtitle}</p>}
      </div>

      <div className="coverflow-stage relative mx-auto">
        {items.map((p, i) => (
          <Link key={p.id} to={`/products/${p.id}`} className="coverflow-card" style={styleFor(i)} aria-label={p.name}>
            <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-2xl border border-ink-900/5">
              <img src={p.image} alt={p.name} className="w-full h-full object-contain p-4" loading="lazy" />
            </div>
          </Link>
        ))}

        <button onClick={() => go(-1)} className="coverflow-arrow left-1 sm:left-6" aria-label="Previous"><ChevronLeft size={22} /></button>
        <button onClick={() => go(1)} className="coverflow-arrow right-1 sm:right-6" aria-label="Next"><ChevronRight size={22} /></button>
      </div>

      {/* Active product info */}
      <div className="max-w-md mx-auto mt-7 px-4">
        <div className="bg-white rounded-2xl shadow-card border border-ink-900/5 p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-ink-900 truncate">{current.name}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-ink-900">{fmt(current.price)}</p>
              {current.originalPrice > current.price && <span className="text-xs text-ink-700/40 line-through">{fmt(current.originalPrice)}</span>}
            </div>
          </div>
          <Link to={`/products/${current.id}`} className="btn-grad text-sm shrink-0">Explore</Link>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-5">
        {items.map((p, i) => (
          <button key={p.id} onClick={() => { clearInterval(timer.current); setActive(i); }}
            className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-primary-600' : 'w-1.5 bg-ink-900/20'}`} aria-label={`Go to ${i + 1}`} />
        ))}
      </div>
    </section>
  );
}
