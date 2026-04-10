import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { products } from '../../data/products';
import { orders } from '../../data/orders';
import { users } from '../../data/users';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const monthlyData = [
  { month: 'Jan', revenue: 280000, orders: 18 },
  { month: 'Feb', revenue: 310000, orders: 22 },
  { month: 'Mar', revenue: 420000, orders: 31 },
  { month: 'Apr', revenue: 546856, orders: 8 },
];

export default function AdminAnalytics() {
  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((a, o) => a + o.total, 0);
  const avgOrderValue = totalRevenue / orders.filter(o => o.status === 'Delivered').length || 0;

  const categoryRevenue = ['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty'].map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    const revenue = catProducts.reduce((a, p) => a + p.price, 0);
    return { cat, revenue, count: catProducts.length };
  });
  const maxCatRevenue = Math.max(...categoryRevenue.map(c => c.revenue));

  const maxMonthly = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500 text-sm mt-0.5">Sales performance and insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Delivered Revenue', value: formatPrice(totalRevenue), trend: '+12%', up: true },
          { label: 'Total Orders', value: orders.length, trend: '+8%', up: true },
          { label: 'Avg Order Value', value: formatPrice(Math.round(avgOrderValue)), trend: '+5%', up: true },
          { label: 'Total Customers', value: users.filter(u => u.role === 'customer').length, trend: '+3 new', up: true },
        ].map(({ label, value, trend, up }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
              {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trend}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly revenue chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-primary-600" />
          <h3 className="font-bold text-gray-900">Monthly Revenue (2026)</h3>
        </div>
        <div className="flex items-end gap-4 h-48">
          {monthlyData.map(({ month, revenue, orders: orderCount }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-center">
                <p className="text-xs font-bold text-gray-700">{formatPrice(revenue)}</p>
                <p className="text-xs text-gray-400">{orderCount} orders</p>
              </div>
              <div className="w-full bg-gray-100 rounded-xl overflow-hidden" style={{ height: '140px' }}>
                <div
                  className="w-full bg-gradient-to-t from-primary-700 to-primary-400 rounded-xl"
                  style={{ height: `${(revenue / maxMonthly) * 140}px`, marginTop: `${140 - (revenue / maxMonthly) * 140}px` }}
                />
              </div>
              <p className="text-sm font-semibold text-gray-600">{month}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-5">Revenue by Category</h3>
          <div className="space-y-4">
            {categoryRevenue.sort((a, b) => b.revenue - a.revenue).map(({ cat, revenue, count }) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(revenue)}</span>
                    <span className="text-xs text-gray-400 ml-2">({count} products)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
                    style={{ width: `${(revenue / maxCatRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order status pie equivalent */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-5">Order Distribution</h3>
          <div className="space-y-3">
            {['Delivered', 'Shipped', 'Processing', 'Pending'].map(status => {
              const count = orders.filter(o => o.status === status).length;
              const pct = Math.round((count / orders.length) * 100);
              const colors = {
                Delivered: 'bg-emerald-500',
                Shipped: 'bg-blue-500',
                Processing: 'bg-amber-500',
                Pending: 'bg-gray-400',
              };
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${colors[status]} shrink-0`} />
                  <span className="text-sm text-gray-600 flex-1">{status}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${colors[status]}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-16 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>

          {/* Top customers */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Top Customers</h4>
            {users.filter(u => u.role === 'customer').sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3).map((user, i) => (
              <div key={user.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.totalOrders} orders</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatPrice(user.totalSpent)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
