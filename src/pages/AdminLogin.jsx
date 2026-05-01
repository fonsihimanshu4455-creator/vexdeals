import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VexLogoFull } from '../components/Logo';

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
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background visuals */}
      <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-32 w-[34rem] h-[34rem] bg-primary-600/30 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute -bottom-40 -right-32 w-[34rem] h-[34rem] bg-accent-500/25 rounded-full blur-3xl animate-blob-slow pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <Link to="/" className="inline-block mb-4">
            <VexLogoFull />
          </Link>

          <div className="inline-flex items-center gap-2 bg-accent-500/15 backdrop-blur-md border border-accent-400/40 text-accent-300 rounded-full px-4 py-1.5 text-xs font-bold mb-3 uppercase tracking-[0.2em]">
            <Shield size={13} /> Admin & Staff Portal
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Staff Sign In</h1>
          <p className="text-primary-200/80 text-sm mt-1">Access your department panel</p>
        </div>

        {/* Glow card */}
        <div className="relative animate-fade-up delay-200">
          <div className="absolute -inset-1 bg-gradient-to-br from-accent-400/30 via-primary-500/30 to-fuchsia-500/20 rounded-[2rem] blur-2xl opacity-80" />

          <div className="relative glass-card rounded-[2rem] shadow-2xl p-7 sm:p-9">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-5 animate-fade-up">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@vexdeals.com"
                    className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-200/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-10 pr-12 py-3.5 text-sm outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-200/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-shine w-full bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 hover:from-primary-600 hover:to-primary-400 text-white py-4 rounded-2xl font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-70 shadow-glow-blue transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><LogIn size={18} /> Sign In to Panel</>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-6">
              Customer?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:underline">Customer login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
