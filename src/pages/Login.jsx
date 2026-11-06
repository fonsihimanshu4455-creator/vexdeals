import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { VexLogoFull } from '../components/Logo';
const EmailOtpAuth = lazy(() => import('../components/EmailOtpAuth'));
import { buildOtpCustomer } from '../lib/customers';


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

  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.role === 'customer') navigate('/');
  }, [user, navigate]);

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

        {/* Mobile OTP signup / signin */}
        <Suspense fallback={<div className="skeleton h-28" />}><EmailOtpAuth onVerified={handleOtpVerified} askName={false} cta="Send OTP" defaultChannel="phone" lockChannel /></Suspense>

        <div className="mb-8" />

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
