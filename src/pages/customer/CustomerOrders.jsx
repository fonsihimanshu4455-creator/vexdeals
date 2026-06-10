import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import CustomerAccountShell from '../../components/CustomerAccountShell';
import { useCustomerData } from '../../context/CustomerDataContext';

const statusColors = {
  Pending: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-violet-100 text-violet-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
};

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function CustomerOrders() {
  const { orders } = useCustomerData();

  return (
    <CustomerAccountShell
      title="My Orders"
      description="Track your recent purchases, payment method, and delivery details."
    >
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <ShoppingBag size={40} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900">No orders yet</h2>
          <p className="mt-2 text-sm text-gray-500">Once you place an order, it will show up here instantly.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-gray-900">{order.id}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.date} · {order.paymentMethod}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">{order.address}</p>
                  {order.trackingId && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
                      📦 {order.courierName || 'Courier'} · Tracking: {order.trackingId}
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Order total</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(order.total)}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {order.products.map((product) => (
                  <div key={`${order.id}-${product.productId}-${product.name}`} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                    <img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover bg-white" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {product.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatPrice(product.price * product.qty)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                <div className="rounded-2xl bg-gray-50 px-4 py-2">
                  Subtotal: <span className="font-semibold text-gray-900">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-2">
                  Shipping: <span className="font-semibold text-gray-900">{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
                </div>
                {order.paymentId && (
                  <div className="rounded-2xl bg-gray-50 px-4 py-2">
                    Payment ID: <span className="font-mono text-xs text-gray-900">{order.paymentId}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomerAccountShell>
  );
}
