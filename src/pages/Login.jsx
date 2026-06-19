import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { VexLogoFull } from '../components/Logo';
import EmailOtpAuth from '../components/EmailOtpAuth';
import { buildOtpCustomer } from '../lib/customers';

const googleProvider = new GoogleAuthProvider();

const saveCustomer = (user) => {
  try {
    const customers = JSON.parse(localStorage.getItem('vexdeals_customers') || '[]');
    const idx = customers.findIndex(c => c.id === user.id);
    if (idx === -1) customers.push({ ...user, firstLogin: new Date().toISOString() });
    else customers[idx] = { ...customers[idx], ...user };
    localStorage.setItem('vexdeals_customers', JSON.stringify(customers));
    if (db) {
      setDoc(doc(db, 'users', String(user.id)), {
        ...user, updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    }
  } catch { /* ignore */ }
};

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.role === 'customer') navigate('/');
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result   = await signInWithPopup(auth, googleProvider);
      const gUser    = result.user;

      const customer = {
        id:          gUser.uid,
        name:        gUser.displayName || 'Customer',
        email:       gUser.email || '',
        phone:       gUser.phoneNumber || '',
        role:        'customer',
        avatar:      gUser.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(gUser.displayName || 'User')}&background=1e3a8a&color=fff`,
        joinDate:    new Date().toISOString().split('T')[0],
        totalOrders: 0,
        totalSpent:  0,
        status:      'Active',
        provider:    'google',
      };

      saveCustomer(customer);
      login(customer.email, null, customer);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user')
        setError('Sign-in cancelled. Please try again.');
      else if (err.code === 'auth/popup-blocked')
        setError('Popup blocked. Please allow popups for this site.');
      else
        setError('Sign-in failed. Please try again.');
    }
    setLoading(false);
  };

  // Email/Mobile-OTP signup/signin — code verified, create/log in the customer.
  const handleOtpVerified = ({ email, phone, name }) => {
    const customer = buildOtpCustomer({ email, phone, name });
    saveCustomer(customer);
    login(customer.email || customer.phone, null, customer);
    setSuccess(true);
    setTimeout(() => navigate('/'), 1000);
  };

  if (success) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 flex flex-col">
      <div className="text-center pt-14 pb-8 px-4">
        <Link to="/" className="inline-block mb-4"><VexLogoFull /></Link>
        <h1 className="text-2xl font-bold text-white mt-2">Welcome to VexDeals</h1>
        <p className="text-primary-300 text-sm mt-1">Sign in to shop exclusive deals</p>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-10 pb-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Email OTP signup / signin */}
        <EmailOtpAuth onVerified={handleOtpVerified} askName cta="Send OTP" />

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-2xl py-4 px-5 hover:border-primary-400 hover:bg-primary-50 transition-all font-semibold text-gray-700 text-base disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mb-6"
        >
          {loading ? (
            <RefreshCw size={22} className="animate-spin text-primary-600" />
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="space-y-3 mb-8">
          {[
            { icon: '🔒', text: 'Secure Google login — no password needed' },
            { icon: '📦', text: 'Track all your orders in one place' },
            { icon: '🎁', text: 'Get exclusive deals and promo codes' },
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
      </div>
    </div>
  );
}
