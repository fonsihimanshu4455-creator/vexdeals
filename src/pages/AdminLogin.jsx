import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield, Watch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  if (user?.role === 'admin' || user?.role === 'subadmin') {
    navigate('/admin');
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
      if (result.user.role === 'customer') {
        setError('This portal is for admin and staff only. Customers please use the main site login.');
        return;
      }
      navigate('/admin');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-1 mb-5">
            <div className="flex items-center gap-2">
              <Watch size={32} className="text-accent-400" />
            </div>
            <div className="leading-none">
              <span className="text-4xl font-black text-white tracking-tight">VEX</span>
              <span className="block text-2xl font-black text-accent-500 tracking-widest -mt-1">DEALS</span>
            </div>
            <span className="text-[10px] text-primary-300 tracking-[0.3em] uppercase mt-1">Premium Watches & Eyewear</span>
          </Link>

          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-500/40 text-accent-400 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <Shield size={14} /> Admin & Staff Portal
          </div>
          <h1 className="text-2xl font-bold text-white">Staff Sign In</h1>
          <p className="text-primary-300 text-sm mt-1">Access your department panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
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
                placeholder="admin@vexdeals.com"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-800 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn size={18} /> Sign In to Panel</>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-3 text-xs text-gray-400">Demo Accounts</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <button
                onClick={() => { setEmail('admin@vexdeals.com'); setPassword('admin123'); }}
                className="text-sm bg-primary-50 text-primary-700 border border-primary-200 rounded-xl px-4 py-3 hover:bg-primary-100 transition-colors font-medium text-left"
              >
                <span className="font-bold">Main Admin</span>
                <span className="text-primary-500 font-normal text-xs block">admin@vexdeals.com · admin123 · Full Access</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Customer?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Login on your mobile →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
