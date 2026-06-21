import { useEffect, useMemo, useState } from 'react';
import { Eye, MousePointerClick, ShoppingCart, CreditCard, BadgeCheck, TrendingUp, RefreshCw, MessageCircle, Download, Trash2, Search } from 'lucide-react';
import { doc, onSnapshot, collection, query, orderBy, limit, getDocs, writeBatch, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useProducts } from '../../context/ProductContext';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const pct = (a, b) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—');
const dayStr = (d) => d.toISOString().slice(0, 10);

const ACTION = {
  visit: 'Visited site',
  view: 'Viewed product',
  cart: 'Added to cart',
  checkout: 'Started checkout',
  purchase: 'Purchased',
};

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7days', label: 'Last 7 days' },
  { key: '30days', label: 'Last 30 days' },
  { key: 'all', label: 'All time' },
];

export default function AdminTracking() {
  const { products } = useProducts();
  const [events, setEvents] = useState([]);
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7days');
  const [userQuery, setUserQuery] = useState('');
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!db) { setLoading(false); return undefined; }
    const q = query(collection(db, 'events'), orderBy('ts', 'desc'), limit(5000));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(collection(db, 'carts'), (snap) => {
      const cutoff = Date.now() - 30 * 60 * 1000;
      const list = snap.docs
        .map(d => ({ key: d.id, ...d.data() }))
        .filter(c => Array.isArray(c.items) && c.items.length > 0 && new Date(c.updatedAt || 0).getTime() < cutoff)
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      setCarts(list);
    }, () => {});
  }, []);

  const cutoff = useMemo(() => {
    if (range === 'all') return '0000-00-00';
    const d = new Date();
    if (range === '7days') d.setDate(d.getDate() - 6);
    else if (range === '30days') d.setDate(d.getDate() - 29);
    return dayStr(d);
  }, [range]);

  const inRange = useMemo(() => events.filter((e) => (e.date || '') >= cutoff), [events, cutoff]);

  // Activity rows (with optional user search)
  const activity = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    return inRange.filter((e) => {
      if (!q) return true;
      return (e.userName || '').toLowerCase().includes(q) || (e.userPhone || '').includes(q) || (e.userEmail || '').toLowerCase().includes(q);
    });
  }, [inRange, userQuery]);

  // Metrics from filtered events
  const m = useMemo(() => {
    const c = { visit: 0, view: 0, cart: 0, checkout: 0, purchase: 0, revenue: 0 };
    inRange.forEach((e) => { if (c[e.type] != null) c[e.type] += 1; if (e.type === 'purchase') c.revenue += Number(e.value) || 0; });
    return c;
  }, [inRange]);

  const topProducts = useMemo(() => {
    const by = {};
    inRange.filter((e) => e.type === 'view' && e.productId).forEach((e) => { by[e.productId] = (by[e.productId] || 0) + 1; });
    return Object.entries(by)
      .map(([id, count]) => ({ id, count, name: products.find(p => String(p.id) === String(id))?.name || `Product #${id}` }))
      .sort((a, b) => b.count - a.count).slice(0, 10);
  }, [inRange, products]);
  const maxCount = topProducts[0]?.count || 1;

  const cards = [
    { label: 'Site Visits', value: fmt(m.visit), Icon: Eye, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Product Views', value: fmt(m.view), Icon: MousePointerClick, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Add to Cart', value: fmt(m.cart), Icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Checkouts', value: fmt(m.checkout), Icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Purchases', value: fmt(m.purchase), Icon: BadgeCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Revenue', value: `₹${fmt(m.revenue)}`, Icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  const fmtTime = (iso) => { try { return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return iso; } };
  const timeAgo = (iso) => {
    const mins = Math.round((Date.now() - new Date(iso || 0).getTime()) / 60000);
    if (mins < 60) return `${mins} min ago`;
    if (mins < 1440) return `${Math.round(mins / 60)} hr ago`;
    return `${Math.round(mins / 1440)} day(s) ago`;
  };

  const exportCSV = () => {
    const rows = [['Date', 'Time', 'User', 'Phone', 'Email', 'Action', 'Product', 'Value']];
    activity.forEach((e) => {
      rows.push([
        e.date || '', new Date(e.ts).toLocaleTimeString('en-IN'),
        e.userName || '', e.userPhone || '', e.userEmail || '',
        ACTION[e.type] || e.type, e.label || e.path || '', e.value || '',
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `vexdeals-tracking-${range}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Saari purani tracking delete kar dein? Ye wapas nahi aayegi.')) return;
    setClearing(true);
    try {
      // delete all event docs in batches of 500
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const snap = await getDocs(query(collection(db, 'events'), limit(500)));
        if (snap.empty) break;
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        if (snap.size < 500) break;
      }
      await setDoc(doc(db, 'site', 'analytics'), { visits: 0, productViews: 0, addToCart: 0, checkouts: 0, purchases: 0, revenue: 0, byProduct: {} });
    } catch { /* ignore */ }
    setClearing(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 gap-2 text-gray-400"><RefreshCw size={20} className="animate-spin" /> Loading tracking…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tracking</h2>
          <p className="text-gray-500 text-sm mt-0.5">Kis user ne kya click kiya — date-wise, exportable.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50"><Download size={15} /> Export CSV</button>
          <button onClick={clearAll} disabled={clearing} className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 disabled:opacity-60">
            {clearing ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />} Clear all
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button key={r.key} onClick={() => setRange(r.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${range === r.key ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon size={20} className={color} /></div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Conversion funnel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4">Conversion funnel</h3>
        <div className="space-y-3">
          {[
            { label: 'Visits → Product view', value: pct(m.view, m.visit) },
            { label: 'Product view → Add to cart', value: pct(m.cart, m.view) },
            { label: 'Add to cart → Checkout', value: pct(m.checkout, m.cart) },
            { label: 'Checkout → Purchase', value: pct(m.purchase, m.checkout) },
            { label: 'Overall (Visit → Purchase)', value: pct(m.purchase, m.visit) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
              <span className="text-gray-600">{label}</span><span className="font-bold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User activity — who clicked what */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-bold text-gray-900">User activity <span className="text-gray-400 font-normal text-sm">({activity.length})</span></h3>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Search user / phone"
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500 w-56" />
          </div>
        </div>
        {activity.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Is range me koi activity nahi.</p>
        ) : (
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="py-2 pr-3">Time</th><th className="py-2 pr-3">User</th><th className="py-2 pr-3">Action</th><th className="py-2">Product</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activity.slice(0, 500).map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="py-2 pr-3 text-gray-500 whitespace-nowrap">{fmtTime(e.ts)}</td>
                    <td className="py-2 pr-3">
                      <div className="font-medium text-gray-800">{e.userName || 'Guest'}</div>
                      {e.userPhone && <div className="text-xs text-gray-400">+91 {e.userPhone}</div>}
                    </td>
                    <td className="py-2 pr-3"><span className="text-xs font-semibold text-gray-600">{ACTION[e.type] || e.type}</span></td>
                    <td className="py-2 text-gray-700 truncate max-w-[200px]">{e.label || e.path || '—'}{e.value ? ` · ₹${fmt(e.value)}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4">Most clicked products</h3>
        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No product clicks in this range.</p>
        ) : (
          <div className="space-y-2.5">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800 truncate">{p.name}</span>
                    <span className="text-sm font-bold text-gray-900 ml-2 shrink-0">{fmt(p.count)} clicks</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${(p.count / maxCount) * 100}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Abandoned carts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-1">Abandoned carts</h3>
        <p className="text-xs text-gray-400 mb-4">Logged-in customers jinhone cart bhara par order nahi kiya (30+ min).</p>
        {carts.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No abandoned carts right now. 🎉</p>
        ) : (
          <div className="space-y-3">
            {carts.map(c => (
              <div key={c.key} className="flex items-start gap-3 border border-gray-100 rounded-2xl p-3.5">
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0"><ShoppingCart size={16} className="text-amber-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.userName || c.userEmail || 'Customer'}</p>
                    <span className="text-xs text-gray-400 shrink-0">{timeAgo(c.updatedAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{c.items.map(i => `${i.name} x${i.qty}`).join(', ')}</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">₹{fmt(c.total)} ka cart</p>
                </div>
                {c.phone && (
                  <a href={`https://wa.me/91${String(c.phone).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hi ${c.userName || ''}! Aapke VexDeals cart me items wait kar rahe hain 🛒 Abhi order complete karo: https://www.vexdeals.com/cart`)}`}
                    target="_blank" rel="noreferrer"
                    className="shrink-0 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-emerald-600"><MessageCircle size={13} /> Remind</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
