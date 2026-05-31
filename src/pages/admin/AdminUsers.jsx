import { useState } from 'react';
import { Search, Eye, X, Users, Shield, User, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAdminUsers, getOrderStats } from '../../hooks/useAdminData';

const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

export default function AdminUsers() {
  const { users: allUsers, loading, liveSync } = useAdminUsers();
  const [search, setSearch]         = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [viewUser, setViewUser]     = useState(null);

  const filtered = allUsers.filter(u => {
    const matchRole = filterRole === 'All' || u.role === filterRole;
    const q = search.toLowerCase();
    const matchSearch =
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q);
    return matchRole && matchSearch;
  });

  const customers   = allUsers.filter(u => u.role === 'customer');
  const totalRevenue = customers.reduce((a, u) => a + (u.totalSpent || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-gray-500 text-sm">{allUsers.length} registered users</p>
            {liveSync ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <Wifi size={12} /> Live
              </span>
            ) : !loading && (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                <WifiOff size={12} /> Local cache
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users',   value: allUsers.length,    color: 'text-primary-600', Icon: Users  },
          { label: 'Customers',     value: customers.length,   color: 'text-blue-600',    Icon: User   },
          { label: 'Admins',        value: allUsers.filter(u => u.role === 'admin' || u.role === 'subadmin').length, color: 'text-violet-600', Icon: Shield },
          { label: 'Total Spent',   value: formatPrice(totalRevenue), color: 'text-emerald-600', Icon: Users },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <Icon size={18} className={color} />
              <div>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'admin', 'customer'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                filterRole === role ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-sm">Loading users…</span>
        </div>
      )}

      {/* Users table */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['User', 'Email', 'Phone', 'Role', 'Joined', 'Orders', 'Total Spent', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => {
                  const stats = u.role === 'customer' ? getOrderStats(u.id, u.email) : null;
                  const orders = stats?.totalOrders ?? u.totalOrders ?? 0;
                  const spent  = stats?.totalSpent  ?? u.totalSpent  ?? 0;
                  return (
                    <tr key={u.id || u.email} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=1e3a8a&color=fff`}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover bg-gray-100"
                          />
                          <div>
                            <p className="font-medium text-gray-800 whitespace-nowrap">{u.name}</p>
                            {u.provider === 'google' && (
                              <span className="text-xs text-blue-500 font-medium">Google</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{u.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                        {u.phone ? (
                          <a href={`tel:${u.phone}`} className="hover:text-primary-600">{u.phone}</a>
                        ) : (
                          <span className="text-gray-400 text-xs">Not provided</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${
                          u.role === 'admin' || u.role === 'subadmin'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{u.joinDate || '—'}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-800">{orders}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{formatPrice(spent)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          (u.status || 'Active') === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewUser({ ...u, totalOrders: orders, totalSpent: spent })}
                          className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Users size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User detail modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">User Details</h3>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={viewUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewUser.name || 'U')}&background=1e3a8a&color=fff`}
                  alt={viewUser.name}
                  className="w-16 h-16 rounded-2xl object-cover bg-gray-100"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{viewUser.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                      viewUser.role === 'admin' || viewUser.role === 'subadmin'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {viewUser.role}
                    </span>
                    {viewUser.provider === 'google' && (
                      <span className="text-xs text-blue-500 font-medium">Google</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { label: 'Email',  value: viewUser.email  || '—' },
                  { label: 'Phone',  value: viewUser.phone  || 'Not provided' },
                  { label: 'Joined', value: viewUser.joinDate || '—' },
                  { label: 'Status', value: viewUser.status  || 'Active' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>

              {viewUser.role === 'customer' && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-blue-50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{viewUser.totalOrders}</p>
                    <p className="text-xs text-blue-500 mt-0.5">Total Orders</p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                    <p className="text-lg font-bold text-emerald-700">{formatPrice(viewUser.totalSpent)}</p>
                    <p className="text-xs text-emerald-500 mt-0.5">Total Spent</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setViewUser(null)}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
