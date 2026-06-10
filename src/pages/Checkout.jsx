import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Smartphone, RefreshCw, AlertTriangle, MapPin, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCustomerData } from '../context/CustomerDataContext';
import { trackInitiateCheckout, trackPurchase } from '../utils/pixel';
import { trackCheckoutHit, trackPurchaseHit } from '../utils/analytics';

// ── Load Razorpay script dynamically ────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const FALLBACK_RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

const paymentMethods = [
  { id: 'razorpay', label: 'Pay Online', Icon: Smartphone, desc: 'UPI · Card · Net Banking · Wallets' },
];

export default function Checkout() {
  const {
    items,
    subtotal,
    shipping,
    discount,
    total,
    promoCode,
    appliedPromo,
    dispatch,
    clearCart,
    applyPromoCode,
    removePromoCode,
  } = useCart();
  const { user, isCustomer } = useAuth();
  const { defaultAddress, placeCustomerOrder } = useCustomerData();
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [payment, setPayment] = useState('razorpay');
  const [ordered, setOrdered] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [completedCheckout, setCompletedCheckout] = useState(null);
  const [payInfo, setPayInfo] = useState(null);  // { method, paymentId }
  const [paying, setPaying]   = useState(false);
  const [payError, setPayError] = useState('');
  const [hasAppliedDefaultAddress, setHasAppliedDefaultAddress] = useState(false);
  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoFeedback, setPromoFeedback] = useState({ type: '', message: '' });
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    phone: user?.phone || '', address: '', city: '', state: '', pincode: '',
  });
  const [errors, setErrors] = useState({});

  const fmt = (p) => `₹${p.toLocaleString('en-IN')}`;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: '/checkout' } });
    }
  }, [user, navigate]);

  useEffect(() => {
    setPromoInput(promoCode);
  }, [promoCode]);

  useEffect(() => {
    if (items.length === 0) return;
    trackInitiateCheckout({
      value: total,
      currency: 'INR',
      num_items: items.reduce((n, i) => n + (i.qty || 1), 0),
    });
    trackCheckoutHit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySavedAddress = (address) => {
    if (!address) return;

    setForm((current) => ({
      ...current,
      name: address.fullName || current.name,
      email: address.email || current.email,
      phone: address.phone || current.phone,
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
    }));
    setErrors({});
    setPayError('');
  };

  useEffect(() => {
    if (!defaultAddress || hasAppliedDefaultAddress) return;

    const hasManualShippingInput = [form.address, form.city, form.state, form.pincode].some((value) =>
      String(value || '').trim()
    );

    if (hasManualShippingInput) {
      setHasAppliedDefaultAddress(true);
      return;
    }

    applySavedAddress(defaultAddress);
    setHasAppliedDefaultAddress(true);
  }, [defaultAddress, hasAppliedDefaultAddress, form.address, form.city, form.state, form.pincode]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name    = 'Required';
    if (!form.email.includes('@'))   e.email   = 'Invalid email';
    if (form.phone.replace(/\D/g,'').length < 10) e.phone = 'Invalid phone';
    if (!form.address.trim())        e.address = 'Required';
    if (!form.city.trim())           e.city    = 'Required';
    if (!form.state.trim())          e.state   = 'Required';
    if (form.pincode.length !== 6)   e.pincode = '6 digits required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = (method, paymentId = null) => {
    const savedOrder = isCustomer
      ? placeCustomerOrder({
          cartItems: items,
          subtotal,
          shipping,
          total,
          shippingAddress: {
            fullName: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          paymentMethod: method,
          paymentId,
        })
      : null;

    setPlacedOrder(savedOrder);
    setCompletedCheckout({ subtotal, shipping, total });
    setPayInfo({ method, paymentId, promoCode, discount });
    // Fires only here — placeOrder is reached solely after a verified Razorpay payment.
    trackPurchase({
      value: total,
      currency: 'INR',
      order_id: savedOrder?.id || paymentId,
      contents: items.map((i) => ({ id: i.id, quantity: i.qty || 1 })),
    });
    trackPurchaseHit(total);
    setOrdered(true);
    clearCart();
    setTimeout(() => navigate(savedOrder ? '/account/orders' : '/'), 4000);
  };

  const handleApplyPromo = () => {
    const result = applyPromoCode(promoInput);
    setPromoFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoInput('');
    setPromoFeedback({ type: 'success', message: 'Promo code removed.' });
  };

  // ── Razorpay online payment ──────────────────────────────────────────────
  const handleRazorpay = async () => {
    setPayError('');
    setPaying(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      setPayError('Could not load payment gateway. Check your internet connection.');
      setPaying(false);
      return;
    }

    try {
      // 1️⃣ Create order on server
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, receipt: `vex_${Date.now()}` }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Order creation failed');
      }

      const razorpayKey = String(orderData.keyId || FALLBACK_RAZORPAY_KEY || '').trim();
      if (!razorpayKey) {
        throw new Error('Payment gateway key is not configured. Add matching Razorpay keys in Vercel project settings.');
      }

      // 2️⃣ Open Razorpay checkout
      const options = {
        key:         razorpayKey,
        amount:      orderData.amount,
        currency:    orderData.currency || 'INR',
        name:        'VexDeals',
        description: 'Premium Watches & Eyewear',
        image:       '/favicon.ico',
        order_id:    orderData.orderId,
        prefill: {
          name:    form.name,
          email:   form.email,
          contact: form.phone,
        },
        notes: {
          address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
        },
        theme: { color: '#1e3a8a' },

        // 3️⃣ On success — verify on server
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              placeOrder('Online (Razorpay)', response.razorpay_payment_id);
            } else {
              setPayError('Payment verification failed. Contact support.');
            }
          } catch {
            setPayError('Verification error. Please contact support.');
          }
          setPaying(false);
        },

        modal: {
          ondismiss: () => { setPaying(false); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        const description = resp?.error?.description || 'Payment could not be completed.';
        if (description.toLowerCase().includes('authentication failed')) {
          setPayError('Razorpay authentication failed. Make sure Vercel has the correct matching RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET values.');
        } else {
          setPayError(`Payment failed: ${description}`);
        }
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setPayError(err.message || 'Payment failed. Please try again.');
      setPaying(false);
    }
  };

  const handlePay = () => {
    handleRazorpay();
  };

  // ── Empty cart ──────────────────────────────────────────────────────────
  if (items.length === 0 && !ordered) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link to="/products" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700">Shop Now</Link>
        </div>
      </div>
    );
  }

  // ── Order success screen ─────────────────────────────────────────────────
  if (ordered) {
    const successTotal = placedOrder?.total ?? completedCheckout?.total ?? total;

    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-4">Thank you for shopping with VexDeals!</p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-1">
            {placedOrder?.id && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID</span>
                <span className="font-semibold text-gray-900">{placedOrder.id}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order Total</span>
              <span className="font-bold text-gray-900">{fmt(successTotal)}</span>
            </div>
            {payInfo?.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-semibold text-emerald-600">
                  - {fmt(payInfo.discount)} {payInfo.promoCode ? `(${payInfo.promoCode})` : ''}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment</span>
              <span className="font-medium text-gray-700">{payInfo?.method}</span>
            </div>
            {payInfo?.paymentId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment ID</span>
                <span className="font-mono text-xs text-gray-600">{payInfo.paymentId}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {placedOrder ? 'Redirecting to My Orders shortly…' : 'Redirecting home shortly…'}
          </p>
          <div className="space-y-3">
            {placedOrder && (
              <>
                <Link to="/account/orders" className="block w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700">
                  View My Orders
                </Link>
                <Link to="/account/transactions" className="block w-full rounded-xl border border-primary-200 py-3 font-semibold text-primary-700 hover:bg-primary-50">
                  View Transaction History
                </Link>
              </>
            )}
            <Link to="/" className="block w-full rounded-xl border border-gray-200 py-3 font-medium text-gray-700 hover:bg-gray-50">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = (field) =>
    `w-full border-2 ${errors[field] ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 transition-colors`;

  return (
    <div className="min-h-screen bg-cream-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[{ n: 1, label: 'Shipping' }, { n: 2, label: 'Payment' }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > n ? <Check size={16} /> : n}
              </div>
              <span className={`text-sm font-medium ${step >= n ? 'text-primary-600' : 'text-gray-400'}`}>{label}</span>
              {n < 2 && <div className={`w-16 h-0.5 ${step > n ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">

            {/* STEP 1 — Shipping */}
            {step === 1 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Details</h2>

                <div className="mb-6 rounded-2xl border border-primary-100 bg-primary-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-white p-2 text-primary-700 shadow-sm">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary-900">
                          {defaultAddress ? 'Use your saved delivery address' : 'Save an address for faster checkout'}
                        </p>
                        <p className="mt-1 text-xs text-primary-700">
                          {defaultAddress
                            ? `${defaultAddress.fullName}, ${defaultAddress.address}, ${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.pincode}`
                            : 'Add address details once, then edit them anytime from your account.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {defaultAddress && (
                        <button
                          type="button"
                          onClick={() => applySavedAddress(defaultAddress)}
                          className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                        >
                          Use Saved Address
                        </button>
                      )}
                      <Link
                        to="/account/addresses"
                        className="rounded-xl border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
                      >
                        {defaultAddress ? 'Edit Saved Addresses' : 'Add Address Details'}
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name',    label: 'Full Name',       ph: 'Rahul Sharma',     type: 'text'  },
                    { key: 'email',   label: 'Email',           ph: 'rahul@email.com',  type: 'email' },
                    { key: 'phone',   label: 'Phone',           ph: '+91 98765 43210',  type: 'tel'   },
                  ].map(({ key, label, ph, type }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} *</label>
                      <input className={inputClass(key)} type={type} value={form[key]}
                        onChange={e => setForm(f => ({...f, [key]: e.target.value}))} placeholder={ph} />
                      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
                    <textarea className={`${inputClass('address')} resize-none`} rows={2}
                      value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}
                      placeholder="House/Flat, Street, Area" />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                  {[
                    { key: 'city',    label: 'City',     ph: 'Bangalore' },
                    { key: 'state',   label: 'State',    ph: 'Karnataka' },
                    { key: 'pincode', label: 'PIN Code', ph: '560001' },
                  ].map(({ key, label, ph }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} *</label>
                      <input className={inputClass(key)} value={form[key]}
                        onChange={e => setForm(f => ({...f, [key]: key === 'pincode' ? e.target.value.replace(/\D/,'').slice(0,6) : e.target.value}))}
                        placeholder={ph} maxLength={key === 'pincode' ? 6 : undefined} />
                      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                    </div>
                  ))}
                </div>
                <button onClick={() => { if (validate()) setStep(2); }}
                  className="mt-6 w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* STEP 2 — Payment */}
            {step === 2 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">←</button>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>

                {/* Delivery summary */}
                <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6 text-sm text-gray-600">
                  <p className="font-semibold text-primary-800 mb-1">Delivering to:</p>
                  <p>{form.name} · {form.phone}</p>
                  <p>{form.address}, {form.city}, {form.state} — {form.pincode}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {defaultAddress && (
                      <button
                        type="button"
                        onClick={() => applySavedAddress(defaultAddress)}
                        className="rounded-xl border border-primary-200 bg-white px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                      >
                        Use Default Address
                      </button>
                    )}
                    <Link
                      to="/account/addresses"
                      className="rounded-xl border border-primary-200 bg-white px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                    >
                      {defaultAddress ? 'Edit Saved Addresses' : 'Add Address Details'}
                    </Link>
                  </div>
                </div>

                {/* Payment method cards */}
                <div className="space-y-3 mb-6">
                  {paymentMethods.map(({ id, label, Icon, desc }) => (
                    <label key={id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
                      payment === id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} className="hidden" />
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${payment === id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      {payment === id && <Check size={18} className="text-primary-600 shrink-0" />}
                    </label>
                  ))}
                </div>

                {/* Razorpay info box */}
                {payment === 'razorpay' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 text-sm">
                    <p className="font-semibold text-blue-800 mb-1">Razorpay Secure Checkout</p>
                    <p className="text-blue-600 text-xs">You'll be redirected to Razorpay's secure gateway to pay via UPI, card, net banking or wallet. 100% safe & encrypted.</p>
                  </div>
                )}

                {payError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{payError}</p>
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-base"
                >
                  {paying ? (
                    <><RefreshCw size={20} className="animate-spin" /> Processing…</>
                  ) : (
                    <><Check size={20} /> Pay · {fmt(total)}</>
                  )}
                </button>
                <p className="text-xs text-center text-gray-400 mt-3">
                  By placing order you agree to our Terms & Privacy Policy
                </p>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 h-fit sticky top-28">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    <p className={`text-[11px] ${Number(item.shippingCharge) > 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {Number(item.shippingCharge) > 0
                        ? `Shipping ${fmt(Number(item.shippingCharge) * item.qty)}`
                        : 'Free shipping'}
                    </p>
                    <p className="text-xs font-bold text-gray-900">{fmt(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Tag size={16} className="text-primary-600" /> Promo / Reward Code
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
                <button
                  onClick={handleApplyPromo}
                  className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  <span><span className="font-bold">{appliedPromo.code}</span> applied.</span>
                  <button onClick={handleRemovePromo} className="font-semibold text-emerald-800 hover:text-emerald-900">
                    Remove
                  </button>
                </div>
              )}
              {promoFeedback.message && (
                <p className={`mt-2 text-xs ${promoFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {promoFeedback.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">Try: VEXFIRST for 10% off</p>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount {promoCode ? `(${promoCode})` : ''}</span>
                  <span className="font-medium">- {fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 text-base">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
