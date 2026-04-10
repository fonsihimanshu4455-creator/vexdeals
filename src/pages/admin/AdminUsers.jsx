import { useState } from 'react';
import { Search, Eye, X, Users, Shield, User } from 'lucide-react';
import { users } from '../../data/users';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [viewUser, setViewUser] = useState(null);

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  const filtered = users.filter(u => {
    const matchRole = filterRole === 'All' || u.role === filterRole;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const totalRevenue = users.filter(u => u.role === 'customer').reduce((a, u) => a + u.totalSpent, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-500 text-sm">{users.length} registered users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length, color: 'text-primary-600', Icon: Users },
          { label: 'Customers', value: users.filter(u => u.role === 'customer').length, color: 'text-blue-600', Icon: User },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-violet-600', Icon: Shield },
          { label: 'Total Spent', value: formatPrice(totalRevenue), color: 'text-emerald-600', Icon: Users },
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
            placeholder="Search users by name or email..."
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

      {/* Users table */}
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
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover bg-gray-100" />
                      <p className="font-medium text-gray-800 whitespace-nowrap">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${
                      user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.joinDate}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">{user.totalOrders}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{formatPrice(user.totalSpent)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewUser(user)}
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
              <Users size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>

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
              {/* Avatar & name */}
              <div className="flex items-center gap-4">
                <img src={viewUser.avatar} alt={viewUser.name} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{viewUser.name}</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                    viewUser.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {viewUser.role}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Email', value: viewUser.email },
                  { label: 'Phone', value: viewUser.phone },
                  { label: 'Joined', value: viewUser.joinDate },
                  { label: 'Status', value: viewUser.status },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
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
