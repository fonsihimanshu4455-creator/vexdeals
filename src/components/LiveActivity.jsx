import { useEffect, useState } from 'react';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

const FEED = [
  { name: 'Rahul S.',  city: 'Mumbai',     item: 'a Premium Watch',          mins: 2 },
  { name: 'Priya P.',  city: 'Delhi',      item: 'Aviator Sunglasses',       mins: 4 },
  { name: 'Amit K.',   city: 'Bangalore',  item: 'Designer Eyeglasses',      mins: 7 },
  { name: 'Sneha M.',  city: 'Hyderabad',  item: 'a Chronograph Watch',      mins: 9 },
  { name: 'Karan T.',  city: 'Pune',       item: 'Polarized Sunglasses',     mins: 12 },
  { name: 'Aisha R.',  city: 'Chennai',    item: 'a Smartwatch',             mins: 15 },
];

export default function LiveActivity() {
  const [idx, setIdx]       = useState(0);
  const [visible, setVis]   = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (closed) return;
    let stopped = false;
    const start = setTimeout(() => setVis(true), 4000);

    const cycle = setInterval(() => {
      if (stopped) return;
      setVis(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % FEED.length);
        setVis(true);
      }, 600);
    }, 9000);

    return () => { stopped = true; clearTimeout(start); clearInterval(cycle); };
  }, [closed]);

  if (closed) return null;

  const e = FEED[idx];

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-[280px] sm:max-w-xs transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-card-hover p-3 pr-4 flex items-center gap-3 ring-1 ring-black/5 overflow-hidden">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary-500/20 via-accent-400/20 to-fuchsia-500/20 blur opacity-60 -z-10" />
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-soft">
          <ShoppingBag size={17} className="text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full">
            <CheckCircle2 size={14} className="text-emerald-500" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-gray-900 leading-tight">
            <span className="font-bold">{e.name}</span> from {e.city}
          </p>
          <p className="text-[11px] text-gray-600 leading-tight mt-0.5 truncate">
            just bought {e.item} ·{' '}
            <span className="text-gray-400">{e.mins}m ago</span>
          </p>
        </div>
        <button
          onClick={() => setClosed(true)}
          aria-label="Dismiss"
          className="text-gray-300 hover:text-gray-700 text-xs leading-none p-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
