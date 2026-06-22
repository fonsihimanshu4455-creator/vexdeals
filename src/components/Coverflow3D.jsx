import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Culture-Circle style 3D product coverflow — cards float on a perspective grid,
// center card faces front, neighbours rotate away. Auto-rotates; arrows + swipe.
export default function Coverflow3D({ products = [], title = 'The Drops', subtitle }) {
  const items = products.slice(0, 10);
  const n = items.length;
  const [active, setActive] = useState(0);
  const timer = useRef(null);
  const touch = useRef(null);
  const swiped = useRef(false);
  const navigate = useNavigate();

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

  // Swipe (horizontal changes card; vertical lets the page scroll normally)
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
    swiped.current = false;
  };
  const onTouchMove = (e) => {
    if (!touch.current) return;
    const t = e.touches[0];
    if (Math.abs(t.clientX - touch.current.x) > 10 || Math.abs(t.clientY - touch.current.y) > 10) swiped.current = true;
  };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  const onCardClick = (i, id) => {
    if (swiped.current) return;             // was a swipe, not a tap
    if (i === active) navigate(`/products/${id}`);
    else { clearInterval(timer.current); setActive(i); }
  };

  const styleFor = (i) => {
    let off = i - active;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    const abs = Math.abs(off);
    if (abs > 2) return { opacity: 0, pointerEvents: 'none', transform: 'translateX(0) scale(.5)' };
    return {
      transform: `translateX(${off * 58}%) translateZ(${-abs * 160}px) rotateY(${off * -32}deg) scale(${1 - abs * 0.13})`,
      opacity: abs === 2 ? 0.45 : 1,
      zIndex: 20 - abs,
      filter: abs ? 'brightness(.82)' : 'none',
    };
  };

  const current = items[active];
  const fmt = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

  return (
    <section className="coverflow-grid relative overflow-hidden py-12 sm:py-14 reveal">
      <div className="text-center mb-7 px-4">
        <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-ink-900">{title}</h2>
        {subtitle && <p className="text-ink-700/60 mt-2 text-sm sm:text-base">{subtitle}</p>}
      </div>

      <div
        className="coverflow-stage relative mx-auto select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {items.map((p, i) => (
          <div
            key={p.id}
            className="coverflow-card cursor-pointer"
            style={styleFor(i)}
            onClick={() => onCardClick(i, p.id)}
            role="button"
            aria-label={p.name}
          >
            <div className="w-full h-full rounded-3xl overflow-hidden bg-cream-100 shadow-2xl border border-ink-900/5">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" draggable="false" />
            </div>
          </div>
        ))}

        <button onClick={() => go(-1)} className="coverflow-arrow left-1 sm:left-4" aria-label="Previous"><ChevronLeft size={22} /></button>
        <button onClick={() => go(1)} className="coverflow-arrow right-1 sm:right-4" aria-label="Next"><ChevronRight size={22} /></button>
      </div>

      {/* Active product info */}
      <div className="max-w-md mx-auto mt-7 px-4">
        <div className="bg-white rounded-2xl shadow-card border border-ink-900/5 p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {current.dropsText && <p className="text-[11px] font-bold uppercase tracking-wide text-primary-600 mb-0.5">{current.dropsText}</p>}
            <p className="font-semibold text-ink-900 truncate">{current.name}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-ink-900">{fmt(current.price)}</p>
              {current.originalPrice > current.price && <span className="text-xs text-ink-700/40 line-through">{fmt(current.originalPrice)}</span>}
            </div>
          </div>
          <button onClick={() => navigate(`/products/${current.id}`)} className="btn-grad text-sm shrink-0">Explore</button>
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
