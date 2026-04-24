import { useEffect, useState } from 'react';
import { Search, Eye, X, ShoppingBag, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const statusColors = {
  Delivered:  'bg-emerald-100 text-emerald-700',
  Confirmed:  'bg-teal-100 text-teal-700',
  Shipped:    'bg-blue-100 text-blue-700',
  Processing: 'bg-amber-100 text-amber-700',
  Pending:    'bg-gray-100 text-gray-700',
  Cancelled:  'bg-red-100 text-red-600',
};

const allStatuses = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

// Read fallback orders from localStorage (vexdeals_customer_orders)
const getLocalOrders = () => {
  try {
    const store = JSON.parse(localStorage.getItem('vexdeals_customer_orders') || '{}');
    return Object.values(store).flat().filter(Boolean);
  } catch { return []; }
};

export default function AdminOrders() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [liveSync, setLiveSync]       = useState(false);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewOrder, setViewOrder]     = useState(null);

  // ── Real-time Firestore subscription ───────────────────────────────────────
  useEffect(() => {
    if (!db) {
      // Firestore not available — fall back to localStorage
      setOrders(getLocalOrders());
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const firestoreOrders = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      // Merge with any localStorage orders not yet in Firestore
      const localOrders = getLocalOrders();
      const fsIds = new Set(firestoreOrders.map(o => o.id));
      const localOnly = localOrders.filter(o => !fsIds.has(o.id));
      setOrders([...firestoreOrders, ...localOnly]
        .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)));
      setLiveSync(true);
      setLoading(false);
    }, () => {
      // On error, fall back to localStorage
      setOrders(getLocalOrders());
      setLiveSync(false);
      setLoading(false);
    });

    return unsub;
  }, []);

  // ── Update order status ────────────────────────────────────────────────────
  const updateStatus = async (orderId, newStatus) => {
    const fullOrder = orders.find(o => o.id === orderId);
    setOrders(list => list.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (viewOrder?.id === orderId) setViewOrder(prev => ({ ...prev, status: newStatus }));

    if (db) {
      if (fullOrder) {
        // Write full order so userId field is always present — customers'
        // real-time query filters by userId and won't see the update without it.
        await setDoc(doc(db, 'orders', orderId), { ...fullOrder, status: newStatus }).catch(() => {});
      } else {
        await setDoc(doc(db, 'orders', orderId), { status: newStatus }, { merge: true }).catch(() => {});
      }
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      (o.id || '').toLowerCase().includes(q) ||
      (o.userName || '').toLowerCase().includes(q) ||
      (o.userEmail || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalRevenue = orders
    .filter(o => ['Delivered', 'Confirmed'].includes(o.status))
    .reduce((a, o) => a + (o.total || 0), 0);

  // Normalise products/items field (CustomerDataContext uses `products`, old code used `products`)
  const getItems = (order) => order.products || order.items || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-gray-500 text-sm">{orders.length} total orders</p>
            {liveSync ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <Wifi size={12} /> Live
              </span>
            ) : !loading && (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                <WifiOff size={12} /> Offline cache
              </span>
            )}
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-emerald-600 font-semibold">Revenue: {formatPrice(totalRevenue)}</span>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'All' : status)}
              className={`rounded-2xl p-3 text-center transition-all border ${
                filterStatus === status ? 'border-primary-300 bg-primary-50' : 'bg-white border-gray-100 hover:border-gray-200'
              } shadow-sm`}
            >
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                {status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {allStatuses.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                filterStatus === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-sm">Loading orders…</span>
        </div>
      )}

      {/* Orders table */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-primary-600 whitespace-nowrap">{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{order.userName || '—'}</p>
                      <p className="text-xs text-gray-400">{order.userEmail || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{order.date || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{getItems(order).reduce((a, p) => a + (p.qty || 1), 0)} items</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                        {order.paymentMethod || order.payment?.method || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status || 'Pending'}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[order.status] || statusColors.Pending}`}
                      >
                        {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewOrder(order)}
                        className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{viewOrder.id}</h3>
                <p className="text-xs text-gray-500">{viewOrder.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[viewOrder.status] || statusColors.Pending}`}>
                  {viewOrder.status}
                </span>
                <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 text-sm">
                <p className="font-semibold text-gray-800 mb-1">Customer Details</p>
                <p className="text-gray-600">{viewOrder.userName}</p>
                <p className="text-gray-500">{viewOrder.userEmail}</p>
                <p className="text-gray-500 mt-1">
                  {viewOrder.address || (viewOrder.address?.line
                    ? `${viewOrder.address.line}, ${viewOrder.address.city}, ${viewOrder.address.state} — ${viewOrder.address.pincode}`
                    : '—')}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-3">Ordered Items</p>
                <div className="space-y-3">
                  {getItems(viewOrder).map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty || 1}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatPrice((item.price || 0) * (item.qty || 1))}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(viewOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{viewOrder.shipping === 0 ? 'FREE' : formatPrice(viewOrder.shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                  <span>Total</span><span>{formatPrice(viewOrder.total)}</span>
                </div>
              </div>

              <div className="flex gap-2 text-sm">
                <span className="text-gray-500">Payment:</span>
                <span className="font-medium text-gray-800">
                  {viewOrder.paymentMethod || viewOrder.payment?.method || '—'}
                </span>
                {(viewOrder.paymentId || viewOrder.payment?.paymentId) && (
                  <span className="text-xs text-gray-400 font-mono ml-1">
                    {viewOrder.paymentId || viewOrder.payment?.paymentId}
                  </span>
                )}
              </div>

              {/* Update status */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(viewOrder.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        viewOrder.status === s
                          ? (statusColors[s] || '') + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
