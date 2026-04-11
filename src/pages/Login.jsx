import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Smartphone, Watch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Detect mobile device by user-agent OR narrow viewport
const detectMobile = () => {
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isNarrow = window.innerWidth < 768;
  return isMobileUA || isNarrow;
};

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(detectMobile());
    const onResize = () => setIsMobile(detectMobile());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (user) {
    navigate(user.role === 'customer' ? '/' : '/admin');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.user.role !== 'customer') {
        setError('Admin/staff login is available at the Admin Portal only.');
        return;
      }
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  // ── Desktop block screen ────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-accent-500/40">
            <Smartphone size={40} className="text-accent-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Mobile Only</h2>
          <p className="text-primary-200 text-sm leading-relaxed mb-6">
            Customer login is available exclusively on mobile devices.<br />
            Please open this page on your smartphone to sign in.
          </p>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-left space-y-2 mb-8">
            <p className="text-accent-400 text-xs font-semibold uppercase tracking-widest">Why mobile only?</p>
            <p className="text-white/70 text-xs">We keep your shopping experience secure and optimised for mobile. Scan QR or type URL on your phone.</p>
          </div>
          <Link
            to="/"
            className="block w-full bg-accent-500 text-primary-900 py-3 rounded-xl font-bold hover:bg-accent-400 transition-colors"
          >
            Back to Home
          </Link>
          <p className="text-primary-400 text-xs mt-4">
            Are you staff?{' '}
            <Link to="/admin-login" className="text-accent-400 underline font-medium">Admin Portal →</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Mobile login form ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-6 px-4">
        <Link to="/" className="inline-flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Watch size={28} className="text-accent-400" />
          </div>
          <div className="leading-none">
            <span className="text-3xl font-black text-white tracking-tight">VEX</span>
            <span className="block text-xl font-black text-accent-500 tracking-widest -mt-1">DEALS</span>
          </div>
          <span className="text-[10px] text-primary-300 tracking-[0.3em] uppercase">Premium Watches & Eyewear</span>
        </Link>
        <h1 className="text-xl font-bold text-white mt-4">Welcome Back</h1>
        <p className="text-primary-300 text-sm mt-1">Sign in to your account</p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-primary-800 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-semibold text-primary-800">Password</label>
              <a href="#" className="text-xs text-accent-600 hover:underline font-medium">Forgot?</a>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-primary-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>

        {/* Demo customer */}
        <div className="mt-6">
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-xs text-gray-400">Try Demo</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>
          <button
            onClick={() => { setEmail('rahul@example.com'); setPassword('rahul123'); }}
            className="mt-4 w-full text-sm bg-primary-50 text-primary-700 border border-primary-200 rounded-xl px-4 py-3 hover:bg-primary-100 transition-colors font-medium text-left"
          >
            <span className="font-bold block">Customer Demo Account</span>
            <span className="text-primary-500 font-normal text-xs">rahul@example.com · rahul123</span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <a href="#" className="text-primary-600 font-bold hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
