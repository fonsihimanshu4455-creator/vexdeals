import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle, MessageCircle, ArrowLeft, Shield } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { VexLogoFull } from '../components/Logo';

// Persist customer to localStorage + Firestore
const saveCustomer = (user) => {
  try {
    const customers = JSON.parse(localStorage.getItem('vexdeals_customers') || '[]');
    const idx = customers.findIndex(c => c.id === user.id);
    if (idx === -1) customers.push({ ...user, firstLogin: new Date().toISOString() });
    else customers[idx] = { ...customers[idx], ...user };
    localStorage.setItem('vexdeals_customers', JSON.stringify(customers));

    if (db) {
      setDoc(doc(db, 'users', String(user.id)), {
        ...user,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    }
  } catch { /* ignore */ }
};

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // steps: 'phone' | 'otp' | 'success'
  const [step, setStep]         = useState('phone');
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [timer, setTimer]       = useState(0);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (user) navigate(user.role === 'customer' ? '/' : '/admin');
  }, [user, navigate]);

  // Resend countdown
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/send-whatsapp-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to send OTP. Please try again.');
        setLoading(false);
        return;
      }

      setOtpToken(data.token);
      setOtp('');
      setTimer(30);
      setStep('otp');
    } catch {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.replace(/\D/g, '').length !== 6) {
      setError('Enter the 6-digit OTP sent to your WhatsApp.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/verify-whatsapp-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: phone.replace(/\D/g, ''), otp, token: otpToken }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid OTP. Please try again.');
        setLoading(false);
        return;
      }

      // OTP verified — build customer record
      const cleaned  = phone.replace(/\D/g, '');
      const existing = JSON.parse(localStorage.getItem('vexdeals_customers') || '[]')
        .find(c => c.id === `phone_${cleaned}`);

      const customer = {
        id:          `phone_${cleaned}`,
        name:        existing?.name || `Customer ${cleaned.slice(-4)}`,
        email:       existing?.email || '',
        phone:       `+91${cleaned}`,
        role:        'customer',
        avatar:      existing?.avatar ||
          `https://ui-avatars.com/api/?name=${cleaned.slice(-4)}&background=1e3a8a&color=fff`,
        joinDate:    existing?.joinDate || new Date().toISOString().split('T')[0],
        totalOrders: existing?.totalOrders || 0,
        totalSpent:  existing?.totalSpent  || 0,
        status:      'Active',
        provider:    'whatsapp',
      };

      saveCustomer(customer);
      login(customer.email || customer.phone, null, customer);
      setStep('success');
      setTimeout(() => navigate('/'), 1200);
    } catch {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 flex items-center justify-center">
        <div className="text-center px-8">
          <CheckCircle size={64} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Logged In!</h2>
          <p className="text-primary-300 text-sm">Taking you to the store…</p>
        </div>
      </div>
    );
  }

  // ── OTP entry ─────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 flex flex-col">
        <div className="text-center pt-12 pb-6 px-4">
          <Link to="/" className="inline-block mb-2"><VexLogoFull /></Link>
        </div>
        <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10">
          <button
            onClick={() => { setStep('phone'); setError(''); }}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm mb-6"
          >
            <ArrowLeft size={16} /> Change number
          </button>

          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
            <Shield size={28} className="text-green-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Enter OTP</h2>
          <p className="text-sm text-gray-500 mb-1">
            Sent to <span className="font-semibold text-gray-800">+91 {phone}</span> on WhatsApp
          </p>
          <p className="text-xs text-green-600 mb-6">Check your WhatsApp messages</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <input
            type="tel"
            inputMode="numeric"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
            placeholder="• • • • • •"
            className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-5 py-4 text-3xl font-bold tracking-[0.5em] text-center outline-none transition-colors mb-5"
            autoFocus
          />

          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mb-4"
          >
            {loading
              ? <><RefreshCw size={20} className="animate-spin" /> Verifying…</>
              : <><Shield size={20} /> Verify & Login</>}
          </button>

          {timer > 0 ? (
            <p className="text-center text-sm text-gray-400">
              Resend in <span className="font-semibold text-gray-700">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full text-green-600 font-semibold text-sm py-2 hover:text-green-700 disabled:opacity-50"
            >
              Resend OTP on WhatsApp
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Phone entry (default) ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 flex flex-col">
      <div className="text-center pt-14 pb-8 px-4">
        <Link to="/" className="inline-block mb-4"><VexLogoFull /></Link>
        <h1 className="text-2xl font-bold text-white mt-2">Welcome to VexDeals</h1>
        <p className="text-primary-300 text-sm mt-1">Sign in to shop exclusive deals</p>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-10 pb-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-5 mx-auto">
          <MessageCircle size={28} className="text-green-600" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Login with WhatsApp</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your mobile number — we'll send an OTP on WhatsApp
        </p>

        <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-green-500 transition-colors mb-5">
          <div className="flex items-center gap-1 px-3 bg-gray-50 border-r border-gray-200 shrink-0">
            <span className="text-base">🇮🇳</span>
            <span className="text-sm font-semibold text-gray-600">+91</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
            placeholder="9876543210"
            className="flex-1 px-4 py-3.5 text-xl font-semibold outline-none tracking-widest bg-white"
            autoFocus
          />
        </div>

        <button
          onClick={handleSendOtp}
          disabled={loading || phone.replace(/\D/g, '').length !== 10}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-base mb-6 shadow-sm"
        >
          {loading
            ? <><RefreshCw size={20} className="animate-spin" /> Sending…</>
            : <><MessageCircle size={20} /> Send OTP on WhatsApp</>}
        </button>

        <div className="space-y-3 mb-8">
          {[
            { icon: '📦', text: 'Track all your orders in one place' },
            { icon: '🎁', text: 'Get exclusive deals and promo codes' },
            { icon: '🔒', text: 'Safe & secure — no password needed' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-xl">{icon}</span>
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 leading-relaxed">
          By continuing you agree to VexDeals{' '}
          <a href="#" className="text-primary-600 underline">Terms</a>{' '}
          &amp;{' '}
          <a href="#" className="text-primary-600 underline">Privacy Policy</a>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          Staff?{' '}
          <Link to="/admin-login" className="text-primary-600 font-semibold underline">Admin Portal →</Link>
        </p>
      </div>
    </div>
  );
}
