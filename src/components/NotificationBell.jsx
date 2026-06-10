import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ShoppingBag, AlertTriangle } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useProducts } from '../context/ProductContext';

const SEEN_KEY = 'vexdeals_admin_last_seen_order';

// Short "ding" via Web Audio (no audio file needed)
const playDing = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start(); o.stop(ctx.currentTime + 0.5);
  } catch { /* audio blocked — ignore */ }
};

const orderTime = (o) => new Date(o.createdAt || o.date || 0).getTime();

export default function NotificationBell() {
  const { products } = useProducts();
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(() => Number(localStorage.getItem(SEEN_KEY) || 0));
  const knownIdsRef = useRef(null);

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(collection(db, 'orders'), (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      // Ding only for orders that appear AFTER the first load
      if (knownIdsRef.current) {
        const fresh = list.filter(o => !knownIdsRef.current.has(o.id));
        if (fresh.length > 0) playDing();
      }
      knownIdsRef.current = new Set(list.map(o => o.id));
      setOrders(list);
    }, () => {});
  }, []);

  const newOrders = orders
    .filter(o => orderTime(o) > lastSeen)
    .sort((a, b) => orderTime(b) - orderTime(a));
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 5);
  const outOfStock = products.filter(p => p.stock <= 0);
  const count = newOrders.length + (lowStock.length + outOfStock.length > 0 ? 1 : 0);

  const markSeen = () => {
    const now = Date.now();
    setLastSeen(now);
    try { localStorage.setItem(SEEN_KEY, String(now)); } catch { /* ignore */ }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 hover:bg-gray-100 rounded-lg"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-600" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bump">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl border border-gray-100 shadow-card z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-sm">Notifications</p>
              {newOrders.length > 0 && (
                <button onClick={markSeen} className="text-xs font-semibold text-primary-600 hover:underline">Mark all read</button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {newOrders.length === 0 && lowStock.length === 0 && outOfStock.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No new notifications</p>
              )}

              {newOrders.slice(0, 8).map(o => (
                <Link key={o.id} to="/admin/orders" onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                  <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <ShoppingBag size={14} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">New order {o.id}</p>
                    <p className="text-xs text-gray-500 truncate">{o.userName || 'Customer'} · ₹{Number(o.total || 0).toLocaleString('en-IN')}</p>
                  </div>
                </Link>
              ))}

              {(lowStock.length > 0 || outOfStock.length > 0) && (
                <Link to="/admin/products" onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
                  <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={14} className="text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Stock alert</p>
                    <p className="text-xs text-gray-500 truncate">
                      {[...outOfStock, ...lowStock].slice(0, 3).map(p => p.name).join(', ')}
                      {outOfStock.length + lowStock.length > 3 ? '…' : ''}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
