import { useState } from 'react';
import { Search, Eye, X, ShoppingBag } from 'lucide-react';
import { orders as initialOrders } from '../../data/orders';

const statusColors = {
  Delivered: 'bg-emerald-100 text-emerald-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Processing: 'bg-amber-100 text-amber-700',
  Pending: 'bg-gray-100 text-gray-700',
  Cancelled: 'bg-red-100 text-red-600',
};

const allStatuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewOrder, setViewOrder] = useState(null);

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = (orderId, newStatus) => {
    setOrders(list => list.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (viewOrder?.id === orderId) setViewOrder(prev => ({ ...prev, status: newStatus }));
  };

  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((a, o) => a + o.total, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-500 text-sm">{orders.length} total orders</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-emerald-600 font-semibold">Revenue: {formatPrice(totalRevenue)}</span>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => {
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

      {/* Orders table */}
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
                  <td className="px-4 py-3 font-bold text-primary-600">{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{order.userName}</p>
                    <p className="text-xs text-gray-400">{order.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{order.date}</td>
                  <td className="px-4 py-3 text-gray-600">{order.products.reduce((a, p) => a + p.qty, 0)} items</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{order.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[order.status]}`}
                    >
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
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
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[viewOrder.status]}`}>
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
                <p className="text-gray-500">{viewOrder.address}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-3">Ordered Items</p>
                <div className="space-y-3">
                  {viewOrder.products.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(viewOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span><span>{viewOrder.shipping === 0 ? 'FREE' : formatPrice(viewOrder.shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                  <span>Total</span><span>{formatPrice(viewOrder.total)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <p className="text-sm text-gray-500">Payment:</p>
                <p className="text-sm font-medium text-gray-800">{viewOrder.paymentMethod}</p>
              </div>

              {/* Update status */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(viewOrder.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        viewOrder.status === s ? statusColors[s] + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
