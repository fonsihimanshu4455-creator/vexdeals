import { Link } from 'react-router-dom';
import { TrendingUp, Package, ShoppingBag, Users, ArrowUpRight, ArrowRight, IndianRupee, Clock, AlertTriangle, CalendarDays } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAdminOrders, useAdminUsers } from '../../hooks/useAdminData';

const statusColors = {
  Delivered: 'bg-emerald-100 text-emerald-700',
  Confirmed: 'bg-teal-100 text-teal-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Processing: 'bg-amber-100 text-amber-700',
  Pending: 'bg-gray-100 text-gray-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const orderDate = (o) => new Date(o.createdAt || o.date || 0);
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function Dashboard() {
  const { products } = useProducts();
  const { orders } = useAdminOrders();
  const { users } = useAdminUsers();

  const totalRevenue = orders
    .filter(o => ['Delivered', 'Confirmed'].includes(o.status))
    .reduce((a, o) => a + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 5);
  const outOfStock = products.filter(p => p.stock <= 0);

  const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

  // ── Today vs yesterday ─────────────────────────────────────────────────────
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const todayOrders = orders.filter(o => sameDay(orderDate(o), now));
  const yesterdayOrders = orders.filter(o => sameDay(orderDate(o), yesterday));
  const todayRevenue = todayOrders.reduce((a, o) => a + (o.status === 'Cancelled' ? 0 : (o.total || 0)), 0);
  const yesterdayRevenue = yesterdayOrders.reduce((a, o) => a + (o.status === 'Cancelled' ? 0 : (o.total || 0)), 0);

  const recentOrders = [...orders]
    .sort((a, b) => orderDate(b) - orderDate(a))
    .slice(0, 5);
  const topProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5);

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      sub: 'Delivered + confirmed orders',
      Icon: IndianRupee,
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      sub: `${pendingOrders} need action`,
      Icon: ShoppingBag,
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Products',
      value: products.length,
      sub: `${lowStock.length + outOfStock.length} low / out of stock`,
      Icon: Package,
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: 'Total Customers',
      value: totalCustomers,
      sub: 'Registered on site',
      Icon: Users,
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
  ];

  // ── Real weekly revenue from orders (last 7 days) ─────────────────────────
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - (6 - i));
    const dayOrders = orders.filter(o => sameDay(orderDate(o), d) && o.status !== 'Cancelled');
    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      revenue: dayOrders.reduce((a, o) => a + (o.total || 0), 0),
    };
  });
  const maxRevenue = Math.max(1, ...chartData.map(d => d.revenue));
  const shortAmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);

  // ── Real category split ────────────────────────────────────────────────────
  const categoryNames = [...new Set(products.map(p => p.category))].slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Clock size={14} />
          <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Action alerts */}
      {(pendingOrders > 0 || lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {pendingOrders > 0 && (
            <Link to="/admin/orders" className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100 transition-colors">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-800">{pendingOrders} order{pendingOrders > 1 ? 's' : ''} waiting</p>
                <p className="text-xs text-amber-600">Pending / processing — tap to manage</p>
              </div>
              <ArrowRight size={16} className="text-amber-600" />
            </Link>
          )}
          {(lowStock.length > 0 || outOfStock.length > 0) && (
            <Link to="/admin/products" className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 hover:bg-red-100 transition-colors">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-red-800">
                  {outOfStock.length > 0 && `${outOfStock.length} out of stock`}
                  {outOfStock.length > 0 && lowStock.length > 0 && ' · '}
                  {lowStock.length > 0 && `${lowStock.length} low stock`}
                </p>
                <p className="text-xs text-red-600 truncate">
                  {[...outOfStock, ...lowStock].slice(0, 3).map(p => p.name).join(', ')}
                </p>
              </div>
              <ArrowRight size={16} className="text-red-600" />
            </Link>
          )}
        </div>
      )}

      {/* Today vs yesterday */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={16} className="text-primary-600" />
          <h3 className="font-bold text-gray-900">Today</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Today's Orders", value: todayOrders.length, prev: `${yesterdayOrders.length} yesterday` },
            { label: "Today's Revenue", value: formatPrice(todayRevenue), prev: `${formatPrice(yesterdayRevenue)} yesterday` },
            { label: 'Items Sold Today', value: todayOrders.reduce((a, o) => a + (o.products || o.items || []).reduce((s, p) => s + (p.qty || 1), 0), 0), prev: '' },
            { label: 'Avg Order Today', value: todayOrders.length ? formatPrice(Math.round(todayRevenue / todayOrders.length)) : '—', prev: '' },
          ].map(({ label, value, prev }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
              {prev && <p className="text-xs text-gray-400 mt-0.5">{prev}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, Icon, bgLight, textColor }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`${bgLight} rounded-xl p-2.5`}>
                <Icon size={20} className={textColor} />
              </div>
              <ArrowUpRight size={16} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart — real last-7-days data */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Last 7 Days Revenue</h3>
            <div className="flex items-center gap-1.5 text-primary-600 text-xs font-semibold">
              <TrendingUp size={14} /> live from orders
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {chartData.map(({ day, revenue }, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-xs text-gray-500 font-medium">{revenue ? `₹${shortAmt(revenue)}` : '—'}</p>
                <div className="w-full bg-gray-100 rounded-lg overflow-hidden flex items-end" style={{ height: '96px' }}>
                  <div
                    className="w-full bg-primary-600 rounded-lg transition-all hover:bg-primary-700"
                    style={{ height: `${Math.max(revenue ? 6 : 0, (revenue / maxRevenue) * 96)}px` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-5">Order Status</h3>
          <div className="space-y-3">
            {['Delivered', 'Confirmed', 'Shipped', 'Processing', 'Pending'].map(status => {
              const count = orders.filter(o => o.status === status).length;
              const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                      {status}
                    </span>
                    <span className="text-sm font-bold text-gray-800">{count} orders</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        status === 'Delivered' ? 'bg-emerald-500' :
                        status === 'Shipped' ? 'bg-blue-500' :
                        status === 'Processing' ? 'bg-amber-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category split — real categories */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Products by Category</h4>
            {categoryNames.map(cat => {
              const count = products.filter(p => p.category === cat).length;
              const pct = products.length ? Math.round((count / products.length) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-600 w-24 shrink-0 truncate">{cat}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-primary-600 text-xs font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
            )}
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center shrink-0">
                  <ShoppingBag size={14} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{order.id}</p>
                  <p className="text-xs text-gray-500 truncate">{order.userName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Top Products</h3>
            <Link to="/admin/products" className="text-primary-600 text-xs font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover bg-gray-50" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                  <p className={`text-xs font-medium ${product.stock < 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {product.stock <= 0 ? 'Out of stock' : product.stock < 5 ? `${product.stock} left` : 'In stock'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
