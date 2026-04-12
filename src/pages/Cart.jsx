import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const {
    items,
    subtotal,
    shipping,
    discount,
    total,
    dispatch,
    promoCode,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState(promoCode);
  const [promoMessage, setPromoMessage] = useState({ type: '', text: '' });

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  useEffect(() => {
    setCouponInput(promoCode);
  }, [promoCode]);

  const handleApplyCoupon = () => {
    const result = applyPromoCode(couponInput);
    setPromoMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
  };

  const handleRemoveCoupon = () => {
    removePromoCode();
    setCouponInput('');
    setPromoMessage({ type: 'success', text: 'Promo code removed.' });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <ShoppingBag size={80} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4">
                <Link to={`/products/${item.id}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl bg-gray-50"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-primary-600 font-medium">{item.category}</p>
                      <Link to={`/products/${item.id}`}>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    {/* Qty */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, qty: item.qty - 1 } })}
                        className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold border-x border-gray-200 min-w-[36px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, qty: item.qty + 1 } })}
                        className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(item.price * item.qty)}</p>
                      {item.qty > 1 && (
                        <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
                      )}
                      <p className={`text-xs ${Number(item.shippingCharge) > 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {Number(item.shippingCharge) > 0
                          ? `Shipping ${formatPrice(Number(item.shippingCharge))} each`
                          : 'Free shipping'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-primary-600 text-sm font-medium hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Tag size={16} className="text-primary-600" /> Apply Promo / Reward Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      <span className="font-bold">{appliedPromo.code}</span> applied successfully.
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="font-semibold text-emerald-800 hover:text-emerald-900"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              {promoMessage.text && (
                <p className={`mt-2 text-xs ${promoMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {promoMessage.text}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">Try: VEXFIRST for 10% off</p>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-28">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((a, i) => a + i.qty, 0)} items)</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Truck size={14} /> Shipping
                  </span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-medium' : 'font-medium text-gray-900'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                    Shipping total updates instantly from each product's admin shipping setting.
                  </p>
                )}
                {shipping === 0 && subtotal > 0 && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2">
                    All products in your cart currently have free delivery.
                  </p>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>
                      Discount {promoCode ? `(${promoCode})` : ''}
                    </span>
                    <span className="font-medium">- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Including all taxes</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 bg-primary-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              {/* Payment icons */}
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                {['UPI', 'Visa', 'Mastercard', 'Paytm', 'COD'].map(p => (
                  <span key={p} className="text-xs border border-gray-200 rounded px-2 py-0.5 text-gray-500">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
