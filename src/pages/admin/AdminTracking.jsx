import { useEffect, useState } from 'react';
import { Eye, MousePointerClick, ShoppingCart, CreditCard, BadgeCheck, TrendingUp, RefreshCw } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useProducts } from '../../context/ProductContext';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const pct = (a, b) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—');

export default function AdminTracking() {
  const { products } = useProducts();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) { setLoading(false); return undefined; }
    return onSnapshot(doc(db, 'site', 'analytics'), (snap) => {
      setData(snap.exists() ? snap.data() : {});
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  const a = data || {};
  const visits = a.visits || 0;
  const views = a.productViews || 0;
  const addToCart = a.addToCart || 0;
  const checkouts = a.checkouts || 0;
  const purchases = a.purchases || 0;
  const revenue = a.revenue || 0;

  const byProduct = a.byProduct || {};
  const topProducts = Object.entries(byProduct)
    .map(([id, count]) => ({ id, count: Number(count) || 0, name: products.find(p => String(p.id) === String(id))?.name || `Product #${id}` }))
    .sort((x, y) => y.count - x.count)
    .slice(0, 10);
  const maxCount = topProducts[0]?.count || 1;

  const cards = [
    { label: 'Site Visits', value: fmt(visits), Icon: Eye, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Product Views (clicks)', value: fmt(views), Icon: MousePointerClick, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Add to Cart', value: fmt(addToCart), Icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Checkouts Started', value: fmt(checkouts), Icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Purchases', value: fmt(purchases), Icon: BadgeCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tracked Revenue', value: `₹${fmt(revenue)}`, Icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20 gap-2 text-gray-400"><RefreshCw size={20} className="animate-spin" /> Loading tracking…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tracking</h2>
        <p className="text-gray-500 text-sm mt-0.5">Live website activity — visits, clicks & conversions.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
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
            { label: 'Visits → Product view', value: pct(views, visits) },
            { label: 'Product view → Add to cart', value: pct(addToCart, views) },
            { label: 'Add to cart → Checkout', value: pct(checkouts, addToCart) },
            { label: 'Checkout → Purchase', value: pct(purchases, checkouts) },
            { label: 'Overall (Visit → Purchase)', value: pct(purchases, visits) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
              <span className="text-gray-600">{label}</span>
              <span className="font-bold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top products by clicks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4">Most clicked products</h3>
        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No product clicks tracked yet.</p>
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
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(p.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">Tracking started when this feature went live. Visits are counted once per browser session.</p>
    </div>
  );
}
