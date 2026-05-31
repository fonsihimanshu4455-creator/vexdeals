import { Link } from 'react-router-dom';
import { TrendingUp, Package, ShoppingBag, Users, ArrowUpRight, ArrowRight, IndianRupee, Clock } from 'lucide-react';
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

export default function Dashboard() {
  const { products } = useProducts();
  const { orders } = useAdminOrders();
  const { users } = useAdminUsers();

  const totalRevenue = orders
    .filter(o => ['Delivered', 'Confirmed'].includes(o.status))
    .reduce((a, o) => a + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const lowStockProducts = products.filter(p => p.stock < 20).length;

  const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
    .slice(0, 5);
  const topProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5);

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      sub: '+12% from last month',
      Icon: IndianRupee,
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      sub: `${pendingOrders} pending`,
      Icon: ShoppingBag,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Products',
      value: products.length,
      sub: `${lowStockProducts} low stock`,
      Icon: Package,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: 'Total Customers',
      value: totalCustomers,
      sub: '+3 this week',
      Icon: Users,
      color: 'bg-violet-500',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
  ];

  // Simple bar chart data
  const chartData = [
    { day: 'Mon', revenue: 45000 },
    { day: 'Tue', revenue: 72000 },
    { day: 'Wed', revenue: 38000 },
    { day: 'Thu', revenue: 95000 },
    { day: 'Fri', revenue: 120000 },
    { day: 'Sat', revenue: 160000 },
    { day: 'Sun', revenue: 134900 },
  ];
  const maxRevenue = Math.max(...chartData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Clock size={14} />
          <span>Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, Icon, color, bgLight, textColor }) => (
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
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Weekly Revenue</h3>
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
              <TrendingUp size={14} /> +18% this week
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {chartData.map(({ day, revenue }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-xs text-gray-500 font-medium">
                  {formatPrice(revenue).replace('₹', '').replace(',000', 'k').slice(0, 4)}
                </p>
                <div className="w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '96px' }}>
                  <div
                    className="w-full bg-primary-600 rounded-lg transition-all hover:bg-primary-700"
                    style={{ height: `${(revenue / maxRevenue) * 96}px`, marginTop: `${96 - (revenue / maxRevenue) * 96}px` }}
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

          {/* Category sales */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Sales by Category</h4>
            {['Electronics', 'Fashion', 'Home & Living', 'Sports'].map(cat => {
              const catProducts = products.filter(p => p.category === cat);
              const pct = Math.round((catProducts.length / products.length) * 100);
              return (
                <div key={cat} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-600 w-24 shrink-0">{cat}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${pct * 2}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{catProducts.length}</span>
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
                  <p className="text-xs text-gray-500">{product.reviews.toLocaleString()} reviews</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                  <p className={`text-xs font-medium ${product.stock < 20 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {product.stock < 20 ? `${product.stock} left` : 'In stock'}
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
