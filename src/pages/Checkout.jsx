import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Smartphone, Banknote, Package, QrCode, Copy, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';

const UPI_ID = 'vexdeals@upi';
const UPI_NAME = 'VexDeals Premium';

// Simple SVG QR mock (represents a QR code visually)
function QRCodeSVG({ value, size = 160 }) {
  // Generate a deterministic grid pattern from value string
  const cells = 21;
  const bits = Array.from({ length: cells * cells }, (_, i) => {
    const c = value.charCodeAt(i % value.length);
    return ((c * (i + 7) * 31) % 17 < 9) ? 1 : 0;
  });
  // Force corners (finder patterns)
  [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,0],[1,6],[2,0],[2,2],[2,3],[2,4],[2,6],
   [3,0],[3,2],[3,3],[3,4],[3,6],[4,0],[4,2],[4,3],[4,4],[4,6],[5,0],[5,6],[6,0],[6,1],
   [6,2],[6,3],[6,4],[6,5],[6,6]].forEach(([r,c]) => { bits[r*cells+c] = 1; });
  [[0,14],[0,15],[0,16],[0,17],[0,18],[0,19],[0,20],[1,14],[1,20],[2,14],[2,16],[2,17],
   [2,18],[2,20],[3,14],[3,16],[3,17],[3,18],[3,20],[4,14],[4,16],[4,17],[4,18],[4,20],
   [5,14],[5,20],[6,14],[6,15],[6,16],[6,17],[6,18],[6,19],[6,20]].forEach(([r,c]) => { bits[r*cells+c] = 1; });
  [[14,0],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0],[14,1],[20,1],[14,2],[16,2],[17,2],
   [18,2],[20,2],[14,3],[16,3],[17,3],[18,3],[20,3],[14,4],[16,4],[17,4],[18,4],[20,4],
   [15,5],[20,5],[14,6],[15,6],[16,6],[17,6],[18,6],[19,6],[20,6]].forEach(([r,c]) => { bits[r*cells+c] = 1; });
  const cellSize = size / cells;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white"/>
      {bits.map((bit, i) => bit ? (
        <rect
          key={i}
          x={(i % cells) * cellSize}
          y={Math.floor(i / cells) * cellSize}
          width={cellSize}
          height={cellSize}
          fill="#1e3a8a"
        />
      ) : null)}
    </svg>
  );
}

const UPI_APPS = [
  { name: 'GPay',    color: 'bg-blue-50 border-blue-200  text-blue-700',   emoji: '🟢' },
  { name: 'PhonePe', color: 'bg-purple-50 border-purple-200 text-purple-700', emoji: '💜' },
  { name: 'Paytm',   color: 'bg-sky-50 border-sky-200 text-sky-700',       emoji: '🔵' },
  { name: 'BHIM',    color: 'bg-orange-50 border-orange-200 text-orange-700', emoji: '🟠' },
];

const paymentMethods = [
  { id: 'upi',        label: 'UPI Payment',         Icon: Smartphone, desc: 'GPay, PhonePe, Paytm, BHIM' },
  { id: 'card',       label: 'Credit / Debit Card', Icon: CreditCard, desc: 'Visa, Mastercard, RuPay'    },
  { id: 'cod',        label: 'Cash on Delivery',    Icon: Banknote,   desc: 'Pay when delivered'         },
  { id: 'netbanking', label: 'Net Banking',         Icon: Package,    desc: 'All major banks'            },
];

export default function Checkout() {
  const { items, subtotal, shipping, total, dispatch } = useCart();
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [payment, setPayment]   = useState('upi');
  const [ordered, setOrdered]   = useState(false);
  const [upiInput, setUpiInput] = useState('');
  const [upiError, setUpiError] = useState('');
  const [paying, setPaying]     = useState(false);
  const [copied, setCopied]     = useState(false);
  const [form, setForm]         = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
  });
  const [errors, setErrors] = useState({});

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.email.includes('@')) errs.email = 'Invalid email';
    if (form.phone.length < 10) errs.phone = 'Invalid phone';
    if (!form.address.trim()) errs.address = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.state.trim()) errs.state = 'Required';
    if (form.pincode.length !== 6) errs.pincode = '6 digits required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(2); };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOrder = async () => {
    if (payment === 'upi') {
      if (!upiInput.trim()) {
        setUpiError('Enter your UPI ID or scan the QR code first');
        return;
      }
      if (!upiInput.includes('@')) {
        setUpiError('Enter a valid UPI ID (e.g. name@upi)');
        return;
      }
      setUpiError('');
      setPaying(true);
      await new Promise(r => setTimeout(r, 2200)); // simulate processing
      setPaying(false);
    }
    setOrdered(true);
    dispatch({ type: 'CLEAR_CART' });
    setTimeout(() => navigate('/'), 4000);
  };

  if (items.length === 0 && !ordered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link to="/products" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700">Shop Now</Link>
        </div>
      </div>
    );
  }

  if (ordered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-1">Thank you for shopping with VexDeals!</p>
          <p className="text-gray-500 text-sm mb-6">
            Confirmation sent to <span className="font-medium text-gray-800">{form.email}</span>
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-500">Order Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(total)}</p>
            <p className="text-xs text-gray-400 mt-1">Payment: {paymentMethods.find(p => p.id === payment)?.label}</p>
          </div>
          <p className="text-xs text-gray-400 mb-4">Redirecting to home shortly…</p>
          <Link to="/" className="block w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = (field) =>
    `w-full border ${errors[field] ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-200`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[{ n: 1, label: 'Shipping' }, { n: 2, label: 'Payment' }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > n ? <Check size={16} /> : n}
              </div>
              <span className={`text-sm font-medium ${step >= n ? 'text-primary-600' : 'text-gray-400'}`}>{label}</span>
              {n < 2 && <div className={`w-16 h-0.5 ${step > n ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input className={inputClass('name')} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Rahul Sharma" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                    <input className={inputClass('email')} value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="rahul@example.com" type="email" />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                    <input className={inputClass('phone')} value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+91 98765 43210" type="tel" />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Address *</label>
                    <textarea className={`${inputClass('address')} resize-none`} value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="House/Flat No., Street, Area" rows={2} />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                    <input className={inputClass('city')} value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Bangalore" />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                    <input className={inputClass('state')} value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))} placeholder="Karnataka" />
                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN Code *</label>
                    <input className={inputClass('pincode')} value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value.replace(/\D/, '')}))} placeholder="560001" maxLength={6} />
                    {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="mt-6 w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors"
                >
                  Continue to Payment →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 font-bold">← Back</button>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>

                {/* Shipping summary */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800 mb-1">Delivering to:</p>
                  <p>{form.name} · {form.phone}</p>
                  <p>{form.address}, {form.city}, {form.state} — {form.pincode}</p>
                </div>

                {/* Payment method selector */}
                <div className="space-y-3 mb-6">
                  {paymentMethods.map(({ id, label, Icon, desc }) => (
                    <label
                      key={id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
                        payment === id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} className="hidden" />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment === id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      {payment === id && <Check size={18} className="text-primary-600 ml-auto shrink-0" />}
                    </label>
                  ))}
                </div>

                {/* UPI details panel */}
                {payment === 'upi' && (
                  <div className="border-2 border-primary-200 bg-primary-50 rounded-2xl p-5 mb-6 space-y-5">
                    <p className="text-sm font-bold text-primary-800 flex items-center gap-2">
                      <QrCode size={16} /> UPI Payment Gateway
                    </p>

                    {/* QR + UPI ID row */}
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="shrink-0">
                        <div className="border-4 border-primary-600 rounded-xl p-1 bg-white shadow-md">
                          <QRCodeSVG value={`upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${total}&cu=INR`} size={140} />
                        </div>
                        <p className="text-[10px] text-center text-primary-600 font-medium mt-1">Scan to Pay</p>
                      </div>

                      <div className="flex-1 w-full space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium">Pay to UPI ID</p>
                          <div className="flex items-center gap-2 bg-white border border-primary-300 rounded-xl px-3 py-2.5">
                            <span className="flex-1 font-mono text-sm font-bold text-primary-800">{UPI_ID}</span>
                            <button
                              onClick={handleCopyUPI}
                              className="text-primary-600 hover:text-primary-800 shrink-0"
                              title="Copy UPI ID"
                            >
                              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium">Amount to Pay</p>
                          <div className="bg-white border border-primary-300 rounded-xl px-3 py-2.5">
                            <span className="font-bold text-lg text-primary-800">{formatPrice(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* UPI app buttons */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2 font-medium">Open UPI app</p>
                      <div className="grid grid-cols-4 gap-2">
                        {UPI_APPS.map(app => (
                          <button
                            key={app.name}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-semibold transition-colors hover:opacity-80 ${app.color}`}
                          >
                            <span className="text-xl">{app.emoji}</span>
                            <span>{app.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* UPI ID confirmation input */}
                    <div>
                      <label className="block text-xs font-semibold text-primary-800 mb-1.5">
                        Confirm your UPI ID (after payment) *
                      </label>
                      <input
                        type="text"
                        value={upiInput}
                        onChange={e => { setUpiInput(e.target.value); setUpiError(''); }}
                        placeholder="yourname@upi or 9876543210@paytm"
                        className={`w-full border-2 ${upiError ? 'border-red-400' : 'border-primary-300'} bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600 transition-colors`}
                      />
                      {upiError && <p className="text-xs text-red-500 mt-1">{upiError}</p>}
                      <p className="text-[11px] text-gray-400 mt-1">Enter the UPI ID you used to pay. We'll verify and confirm your order.</p>
                    </div>
                  </div>
                )}

                {/* Card note */}
                {payment === 'card' && (
                  <div className="border border-gray-200 rounded-2xl p-4 mb-6 text-sm text-gray-500 bg-gray-50">
                    <p className="font-semibold text-gray-700 mb-1">Card payment coming soon</p>
                    <p className="text-xs">Our secure card gateway is under integration. Please use UPI or COD for now.</p>
                  </div>
                )}

                <button
                  onClick={handleOrder}
                  disabled={paying}
                  className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {paying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying UPI Payment…
                    </>
                  ) : (
                    <><Check size={20} /> Place Order · {formatPrice(total)}</>
                  )}
                </button>
                <p className="text-xs text-center text-gray-400 mt-3">
                  By placing order you agree to our Terms & Privacy Policy
                </p>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 h-fit sticky top-28">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    <p className="text-xs font-bold text-gray-900">{formatPrice(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 text-base">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
