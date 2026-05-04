import { Link } from 'react-router-dom';
import {
  TrendingUp, Package, ShoppingBag, Users, ArrowUpRight, ArrowRight,
  IndianRupee, Clock, Sparkles,
} from 'lucide-react';
import { orders } from '../../data/orders';
import { users } from '../../data/users';
import { useProducts } from '../../context/ProductContext';
import BrandLogo from '../../components/BrandLogo';

const statusStyles = {
  Delivered:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Shipped:    'bg-blue-50 text-blue-700 ring-blue-200',
  Processing: 'bg-amber-50 text-amber-700 ring-amber-200',
  Pending:    'bg-gray-50 text-gray-700 ring-gray-200',
  Cancelled:  'bg-red-50 text-red-700 ring-red-200',
};

export default function Dashboard() {
  const { products } = useProducts();
  const totalRevenue   = orders.filter(o => o.status === 'Delivered').reduce((a, o) => a + o.total, 0);
  const pendingOrders  = orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const lowStock       = products.filter(p => p.stock < 20).length;

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const topProducts  = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5);

  const stats = [
    {
      label: 'Total Revenue', value: formatPrice(totalRevenue), sub: '+12% from last month',
      Icon: IndianRupee, gradient: 'from-emerald-500 to-teal-400', glow: 'shadow-[0_10px_40px_-10px_rgba(16,185,129,.55)]',
    },
    {
      label: 'Total Orders', value: orders.length, sub: `${pendingOrders} pending`,
      Icon: ShoppingBag, gradient: 'from-blue-500 to-indigo-500', glow: 'shadow-glow-blue',
    },
    {
      label: 'Total Products', value: products.length, sub: `${lowStock} low stock`,
      Icon: Package, gradient: 'from-amber-500 to-orange-500', glow: 'shadow-glow-gold',
    },
    {
      label: 'Total Customers', value: totalCustomers, sub: '+3 this week',
      Icon: Users, gradient: 'from-fuchsia-500 to-pink-500', glow: 'shadow-glow-pink',
    },
  ];

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
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-6 sm:p-8 border border-white/10">
        <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent-500/20 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary-500/20 blur-3xl animate-blob-slow pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-3">
              <Sparkles size={11} className="text-accent-300" /> Overview
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Welcome back, <span className="text-shimmer">Admin</span>
            </h2>
            <p className="text-white/70 text-sm mt-1">Here's what's happening at VexDeals today.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2">
            <Clock size={14} />
            <span>Updated now</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, Icon, gradient, glow }, i) => (
          <div
            key={label}
            className="group relative bg-white rounded-3xl p-5 border border-gray-100 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all overflow-hidden"
          >
            {/* glow on hover */}
            <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-15 blur-2xl transition-all duration-500`} />

            <div className="relative flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center ${glow}`}>
                <Icon size={20} className="text-white" />
              </div>
              <ArrowUpRight size={16} className="text-emerald-500" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-gray-900 text-lg">Weekly Revenue</h3>
              <p className="text-xs text-gray-500 mt-0.5">Performance over the last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full ring-1 ring-emerald-200">
              <TrendingUp size={14} /> +18% this week
            </div>
          </div>
          <div className="flex items-end gap-3 h-44">
            {chartData.map(({ day, revenue }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5 group">
                <p className="text-[11px] text-gray-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatPrice(revenue).replace('₹', '').replace(',000', 'k').slice(0, 4)}
                </p>
                <div className="relative w-full bg-gray-100 rounded-2xl overflow-hidden" style={{ height: '120px' }}>
                  <div
                    className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary-700 via-primary-500 to-primary-400 rounded-2xl transition-all duration-700 group-hover:from-accent-600 group-hover:to-accent-300"
                    style={{ height: `${(revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 font-semibold">{day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order status */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-6">
          <h3 className="font-display font-bold text-gray-900 text-lg mb-5">Order Status</h3>
          <div className="space-y-3.5">
            {['Delivered', 'Shipped', 'Processing', 'Pending'].map(status => {
              const count = orders.filter(o => o.status === status).length;
              const pct = Math.round((count / orders.length) * 100);
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ring-1 ${statusStyles[status]}`}>
                      {status}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        status === 'Delivered' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                        status === 'Shipped'   ? 'bg-gradient-to-r from-blue-500 to-indigo-400' :
                        status === 'Processing'? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                                                 'bg-gradient-to-r from-gray-400 to-gray-300'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 pt-5 border-t border-gray-100">
            <h4 className="font-bold text-gray-800 text-sm mb-3">Sales by Category</h4>
            {['Electronics', 'Fashion', 'Home & Living', 'Sports'].map(cat => {
              const catProducts = products.filter(p => p.category === cat);
              const pct = Math.round((catProducts.length / products.length) * 100);
              return (
                <div key={cat} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-600 w-24 shrink-0 font-medium">{cat}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-400" style={{ width: `${pct * 2}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right font-bold">{catProducts.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-gray-900 text-lg">Recent Orders</h3>
            <Link to="/admin/orders" className="text-primary-600 text-xs font-bold hover:underline flex items-center gap-1 group">
              View All <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingBag size={15} className="text-primary-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500 truncate">{order.userName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-gray-900 text-lg">Top Products</h3>
            <Link to="/admin/products" className="text-primary-600 text-xs font-bold hover:underline flex items-center gap-1 group">
              View All <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-1">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400 to-amber-500 text-white text-xs font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="relative shrink-0">
                  <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-11 h-11 rounded-xl object-cover bg-gray-50 ring-1 ring-gray-100" />
                  {product.brand && (
                    <div className="absolute -bottom-1 -right-1">
                      <BrandLogo brand={product.brand} size="xs" variant="logo" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    {product.brand && <BrandLogo brand={product.brand} size="xs" variant="inline" />}
                    {product.brand && <span className="text-gray-300">·</span>}
                    <span>{product.reviews.toLocaleString()} reviews</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                  <p className={`text-[11px] font-bold ${product.stock < 20 ? 'text-red-500' : 'text-emerald-600'}`}>
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
