import { BarChart3, ShoppingBag, Users, Package, TrendingUp, IndianRupee } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

// Read live orders from localStorage (placed via checkout)
const getLiveOrders = () => {
  try { return JSON.parse(localStorage.getItem('vexdeals_orders') || '[]'); }
  catch { return []; }
};

// Read live customers (OTP-logged-in users stored in localStorage history)
const getLiveCustomers = () => {
  try { return JSON.parse(localStorage.getItem('vexdeals_customers') || '[]'); }
  catch { return []; }
};

export default function AdminAnalytics() {
  const { products } = useProducts();
  const liveOrders   = getLiveOrders();
  const customers    = getLiveCustomers();

  // ── KPI calculations ──────────────────────────────────────────────────────
  const deliveredOrders  = liveOrders.filter(o => o.status === 'Delivered');
  const totalRevenue     = deliveredOrders.reduce((a, o) => a + (o.total || 0), 0);
  const pendingOrders    = liveOrders.filter(o => o.status === 'Pending').length;
  const avgOrder         = liveOrders.length ? Math.round(liveOrders.reduce((a, o) => a + (o.total || 0), 0) / liveOrders.length) : 0;
  const lowStockCount    = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount  = products.filter(p => p.stock === 0).length;

  // ── Order status breakdown ────────────────────────────────────────────────
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const statusColors = {
    Pending:    'bg-gray-400',
    Processing: 'bg-amber-500',
    Shipped:    'bg-blue-500',
    Delivered:  'bg-emerald-500',
  };
  const maxStatusCount = Math.max(...statuses.map(s => liveOrders.filter(o => o.status === s).length), 1);

  // ── Category breakdown ────────────────────────────────────────────────────
  const catMap = {};
  products.forEach(p => {
    catMap[p.category] = (catMap[p.category] || 0) + 1;
  });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const maxCatCount = Math.max(...catEntries.map(([, c]) => c), 1);

  // ── Recent orders ─────────────────────────────────────────────────────────
  const recentOrders = [...liveOrders].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5);

  const isEmpty = liveOrders.length === 0 && products.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500 text-sm mt-0.5">Live store performance — updates as orders come in</p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',    value: formatPrice(totalRevenue),    Icon: IndianRupee,  color: 'text-primary-600',  bg: 'bg-primary-50'  },
          { label: 'Total Orders',     value: liveOrders.length,            Icon: ShoppingBag,  color: 'text-blue-600',     bg: 'bg-blue-50'     },
          { label: 'Avg Order Value',  value: formatPrice(avgOrder),        Icon: TrendingUp,   color: 'text-emerald-600',  bg: 'bg-emerald-50'  },
          { label: 'Total Customers',  value: customers.length,             Icon: Users,        color: 'text-purple-600',   bg: 'bg-purple-50'   },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {isEmpty ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <BarChart3 size={36} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">No data yet</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Analytics will appear here once you add products and customers start placing orders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Order Status ────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary-600" /> Order Status
            </h3>
            {liveOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {statuses.map(status => {
                  const count = liveOrders.filter(o => o.status === status).length;
                  const pct   = Math.round((count / liveOrders.length) * 100);
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${statusColors[status]} shrink-0`} />
                      <span className="text-sm text-gray-600 w-24 shrink-0">{status}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${statusColors[status]}`}
                          style={{ width: `${(count / maxStatusCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-800 w-20 text-right">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Products by Category ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Package size={18} className="text-primary-600" /> Products by Category
            </h3>
            {catEntries.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No products added yet</p>
            ) : (
              <div className="space-y-4">
                {catEntries.map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{cat}</span>
                      <span className="text-sm font-bold text-gray-900">{count} products</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
                        style={{ width: `${(count / maxCatCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Inventory Alerts ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Package size={18} className="text-amber-500" /> Inventory Alerts
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-amber-50 rounded-2xl p-4">
                <p className="text-3xl font-bold text-amber-600">{lowStockCount}</p>
                <p className="text-xs text-amber-700 mt-1 font-medium">Low Stock (&lt;10 units)</p>
              </div>
              <div className="text-center bg-red-50 rounded-2xl p-4">
                <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
                <p className="text-xs text-red-700 mt-1 font-medium">Out of Stock</p>
              </div>
              <div className="text-center bg-emerald-50 rounded-2xl p-4">
                <p className="text-3xl font-bold text-emerald-600">{products.filter(p => p.stock >= 10).length}</p>
                <p className="text-xs text-emerald-700 mt-1 font-medium">Healthy Stock</p>
              </div>
              <div className="text-center bg-primary-50 rounded-2xl p-4">
                <p className="text-3xl font-bold text-primary-600">{products.length}</p>
                <p className="text-xs text-primary-700 mt-1 font-medium">Total Products</p>
              </div>
            </div>
          </div>

          {/* ── Recent Orders ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary-600" /> Recent Orders
            </h3>
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{order.id}</p>
                      <p className="text-xs text-gray-400">{order.userName || 'Customer'} · {order.date || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered'  ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'Shipped'    ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Pending orders alert */}
      {pendingOrders > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <ShoppingBag size={20} className="text-amber-600 shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            {pendingOrders} order{pendingOrders > 1 ? 's' : ''} pending — check Orders page to process them
          </p>
        </div>
      )}
    </div>
  );
}
