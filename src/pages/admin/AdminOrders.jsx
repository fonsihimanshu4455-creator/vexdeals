import { useState } from 'react';
import { Search, Eye, X, ShoppingBag, RefreshCw, Wifi, WifiOff, Trash2, AlertTriangle, Truck, Printer, Download, MessageCircle, Save } from 'lucide-react';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAdminOrders } from '../../hooks/useAdminData';
import { useAuth } from '../../context/AuthContext';

const ORDER_STORE_KEY = 'vexdeals_customer_orders';
const TRANSACTION_STORE_KEY = 'vexdeals_customer_transactions';

const statusColors = {
  Delivered:  'bg-emerald-100 text-emerald-700',
  Confirmed:  'bg-teal-100 text-teal-700',
  Shipped:    'bg-blue-100 text-blue-700',
  Processing: 'bg-amber-100 text-amber-700',
  Pending:    'bg-gray-100 text-gray-700',
  Cancelled:  'bg-red-100 text-red-600',
};

const allStatuses = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const dateRanges = ['All time', 'Today', 'This week', 'This month'];

const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;
const orderDate = (o) => new Date(o.createdAt || o.date || 0);

const inDateRange = (o, range) => {
  if (range === 'All time') return true;
  const d = orderDate(o);
  const now = new Date();
  if (range === 'Today') {
    return d.toDateString() === now.toDateString();
  }
  if (range === 'This week') {
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  }
  if (range === 'This month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  return true;
};

// Open a print-ready invoice in a new window (user prints / saves as PDF)
const printInvoice = (order) => {
  const items = order.products || order.items || [];
  const addr = typeof order.address === 'string' ? order.address : '';
  const rows = items.map((it, i) => `
    <tr>
      <td>${i + 1}</td><td>${it.name || ''}</td><td>${it.qty || 1}</td>
      <td>₹${Number(it.price || 0).toLocaleString('en-IN')}</td>
      <td>₹${Number((it.price || 0) * (it.qty || 1)).toLocaleString('en-IN')}</td>
    </tr>`).join('');
  const html = `<!doctype html><html><head><title>Invoice ${order.id}</title><style>
    body{font-family:Arial,sans-serif;color:#111;margin:32px}
    h1{font-size:20px;margin:0}.muted{color:#666;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{border:1px solid #ddd;padding:8px;font-size:13px;text-align:left}
    th{background:#f5f6f8}.tot{text-align:right;margin-top:12px;font-size:14px}
    .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0b2340;padding-bottom:12px}
  </style></head><body>
    <div class="head">
      <div><h1>VexDeals</h1><div class="muted">Premium Watches & Eyewear<br/>officialvexdeals@gmail.com</div></div>
      <div style="text-align:right"><b>TAX INVOICE</b><div class="muted">Order: ${order.id}<br/>Date: ${order.date || new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}</div></div>
    </div>
    <p><b>Bill to:</b> ${order.userName || ''}<br/>
    ${order.userEmail || ''}${order.phone ? ' · ' + order.phone : ''}<br/>${addr}</p>
    <table><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr>${rows}</table>
    <div class="tot">
      Subtotal: ₹${Number(order.subtotal || 0).toLocaleString('en-IN')}<br/>
      Shipping: ${order.shipping === 0 ? 'FREE' : '₹' + Number(order.shipping || 0).toLocaleString('en-IN')}<br/>
      <b>Total: ₹${Number(order.total || 0).toLocaleString('en-IN')}</b><br/>
      <span class="muted">Payment: ${order.paymentMethod || order.payment?.method || '—'}</span>
    </div>
    <p class="muted" style="margin-top:32px">Thank you for shopping with VexDeals!</p>
    <script>window.print()</script>
  </body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
};

// Download orders as CSV (opens in Excel)
const exportOrdersCSV = (orders) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Items', 'Subtotal', 'Shipping', 'Total', 'Payment', 'Status', 'Tracking'];
  const lines = orders.map(o => [
    o.id, o.date || '', o.userName || '', o.userEmail || '', o.phone || '',
    (o.products || o.items || []).map(i => `${i.name} x${i.qty || 1}`).join('; '),
    o.subtotal || 0, o.shipping || 0, o.total || 0,
    o.paymentMethod || o.payment?.method || '', o.status || '', o.trackingId || '',
  ].map(esc).join(','));
  const blob = new Blob(['﻿' + [header.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `vexdeals-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
};

export default function AdminOrders() {
  const { orders, setOrders, loading, liveSync } = useAdminOrders();
  const { isAdmin } = useAuth();
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewOrder, setViewOrder]     = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing]       = useState(false);
  const [shipping, setShipping]       = useState(false);
  const [shipMsg, setShipMsg]         = useState(null);
  const [dateFilter, setDateFilter]   = useState('All time');
  const [trackForm, setTrackForm]     = useState({ courier: '', trackingId: '' });
  const [savingTrack, setSavingTrack] = useState(false);

  // ── Save courier tracking on the order (customer sees it on My Orders) ────
  const saveTracking = async (order) => {
    setSavingTrack(true);
    const updated = { ...order, courierName: trackForm.courier.trim(), trackingId: trackForm.trackingId.trim(), status: order.status === 'Pending' || order.status === 'Confirmed' ? 'Shipped' : order.status };
    setOrders(list => list.map(o => o.id === order.id ? updated : o));
    setViewOrder(updated);
    if (db) await setDoc(doc(db, 'orders', order.id), updated).catch(() => {});
    setSavingTrack(false);
  };

  // ── Send order to Shiprocket ────────────────────────────────────────────────
  const sendToShiprocket = async (order) => {
    setShipping(true);
    setShipMsg(null);
    try {
      const res = await fetch('/api/shiprocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      const data = await res.json();
      if (data.ok) {
        setShipMsg({ type: 'success', text: `Sent to Shiprocket — Order #${data.orderId}, Shipment #${data.shipmentId}` });
        const updated = { ...order, shiprocketOrderId: data.orderId, shiprocketShipmentId: data.shipmentId, status: 'Processing' };
        setOrders(list => list.map(o => o.id === order.id ? updated : o));
        setViewOrder(prev => prev?.id === order.id ? updated : prev);
        if (db) setDoc(doc(db, 'orders', order.id), updated).catch(() => {});
      } else {
        setShipMsg({ type: 'error', text: data.error || 'Failed to send to Shiprocket.' });
      }
    } catch {
      setShipMsg({ type: 'error', text: 'Network error contacting Shiprocket.' });
    } finally {
      setShipping(false);
    }
  };


  // ── Clear ALL sales (orders + transactions) — main admin only ───────────────
  const clearAllSales = async () => {
    setClearing(true);
    try {
      if (db) {
        const snap = await getDocs(collection(db, 'orders'));
        await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'orders', d.id)).catch(() => {})));
      }
    } catch {
      // ignore — still clear local cache below
    }
    try {
      localStorage.removeItem(ORDER_STORE_KEY);
      localStorage.removeItem(TRANSACTION_STORE_KEY);
    } catch { /* ignore */ }
    setOrders([]);
    setClearing(false);
    setConfirmClear(false);
  };

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
    return matchStatus && matchSearch && inDateRange(o, dateFilter);
  });

  const totalRevenue = orders
    .filter(o => ['Delivered', 'Confirmed'].includes(o.status))
    .reduce((a, o) => a + (o.total || 0), 0);

  // Normalise products/items field (CustomerDataContext uses `products`, old code used `products`)
  const getItems = (order) => order.products || order.items || [];

  return (
    <div className="space-y-5">
      {/* Clear-all confirmation */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Clear all sales?</h3>
            <p className="text-sm text-gray-500 mt-2">
              This permanently deletes <strong>all {orders.length} orders</strong> and transaction
              history for every customer. Revenue & analytics will reset to zero. This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmClear(false)}
                disabled={clearing}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={clearAllSales}
                disabled={clearing}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {clearing ? <><RefreshCw size={15} className="animate-spin" /> Clearing…</> : <><Trash2 size={15} /> Yes, clear all</>}
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-sm">
            <span className="text-emerald-600 font-semibold">Revenue: {formatPrice(totalRevenue)}</span>
          </div>
          <button
            onClick={() => exportOrdersCSV(filtered)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 py-2 text-sm font-semibold"
            title="Download as Excel/CSV"
          >
            <Download size={15} /> Export
          </button>
          {isAdmin && orders.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            >
              <Trash2 size={15} /> Clear all sales
            </button>
          )}
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
          <span className="w-px bg-gray-200 mx-1 hidden sm:block" />
          {dateRanges.map(r => (
            <button
              key={r}
              onClick={() => setDateFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                dateFilter === r ? 'bg-ink-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r}
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
                        onClick={() => { setViewOrder(order); setTrackForm({ courier: order.courierName || '', trackingId: order.trackingId || '' }); }}
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

              {/* Quick actions: invoice + WhatsApp */}
              <div className="flex gap-2">
                <button
                  onClick={() => printInvoice(viewOrder)}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  <Printer size={15} /> Invoice / Bill
                </button>
                {viewOrder.phone && (
                  <a
                    href={`https://wa.me/91${String(viewOrder.phone).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hi ${viewOrder.userName || ''}! Aapka VexDeals order ${viewOrder.id} confirm ho gaya hai. Total: ₹${Number(viewOrder.total || 0).toLocaleString('en-IN')}. Dhanyavaad! 🛍️`)}`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-600"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                )}
              </div>

              {/* Courier tracking */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Courier Tracking <span className="text-gray-400 font-normal">(customer ko dikhega)</span></p>
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Courier (e.g. Delhivery)"
                    value={trackForm.courier}
                    onChange={e => setTrackForm(f => ({ ...f, courier: e.target.value }))}
                    className="w-36 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500"
                  />
                  <input
                    type="text" placeholder="Tracking number"
                    value={trackForm.trackingId}
                    onChange={e => setTrackForm(f => ({ ...f, trackingId: e.target.value }))}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={() => saveTracking(viewOrder)}
                    disabled={savingTrack}
                    className="px-4 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {savingTrack ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  </button>
                </div>
                {viewOrder.trackingId && (
                  <p className="text-xs text-emerald-600 font-medium mt-1.5">✓ {viewOrder.courierName || 'Courier'} · {viewOrder.trackingId}</p>
                )}
              </div>

              {/* Shiprocket */}
              <div className="border-t border-gray-100 pt-4">
                {viewOrder.shiprocketShipmentId ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                    <Truck size={16} /> Sent to Shiprocket · Shipment #{viewOrder.shiprocketShipmentId}
                  </div>
                ) : (
                  <button
                    onClick={() => sendToShiprocket(viewOrder)}
                    disabled={shipping}
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors"
                  >
                    {shipping ? <><RefreshCw size={16} className="animate-spin" /> Sending…</> : <><Truck size={16} /> Send to Shiprocket</>}
                  </button>
                )}
                {shipMsg && (
                  <p className={`mt-2 text-xs ${shipMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>{shipMsg.text}</p>
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
