import { Link, Navigate, useLocation } from 'react-router-dom';
import { CreditCard, MapPin, Package, UserCircle, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/account/profile',      label: 'My Profile',         Icon: UserCircle  },
  { to: '/account/orders',       label: 'My Orders',          Icon: Package     },
  { to: '/account/transactions', label: 'Transaction History',Icon: CreditCard  },
  { to: '/account/addresses',    label: 'Saved Addresses',    Icon: MapPin      },
];

export default function CustomerAccountShell({ title, description, children }) {
  const { isCustomer, loading, user, logout } = useAuth();
  const location = useLocation();

  if (!loading && !isCustomer) {
    return <Navigate to="/login" replace />;
  }

  const avatar = user?.avatar;
  const displayName = user?.name || user?.fullName || 'Account';

  return (
    <div className="min-h-screen bg-mesh-light">
      {/* hero header */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-primary-500/25 rounded-full blur-3xl animate-blob-slow" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-3">
            <Sparkles size={11} className="text-accent-300" /> My Account
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-primary-100/80 max-w-2xl">{description}</p>
        </div>

        <svg className="absolute bottom-0 left-0 w-full h-8 sm:h-10 fill-[#f6f7fb]" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0 30 C 240 60 480 0 720 30 C 960 60 1200 0 1440 30 L 1440 60 L 0 60 Z" />
        </svg>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-4 pb-12">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-3 lg:sticky lg:top-28 self-start">
            {/* user card */}
            {user && (
              <div className="relative rounded-3xl bg-white border border-gray-100 shadow-soft p-4 overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-primary-200/40 to-accent-200/40 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <span className="relative">
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-400 to-primary-500 blur-md opacity-50" />
                    <img src={avatar} alt={displayName} className="relative w-12 h-12 rounded-full object-cover ring-2 ring-white shadow" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* nav */}
            <nav className="rounded-3xl border border-gray-100 bg-white p-2 shadow-soft space-y-1">
              {navItems.map(({ to, label, Icon }) => {
                const active =
                  location.pathname === to ||
                  (to === '/account/profile' && location.pathname === '/account');
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-primary-700 to-primary-500 text-white shadow-glow-blue'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary-700'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={18} /> Logout
              </button>
            </nav>
          </aside>

          <section className="min-w-0 animate-fade-up">{children}</section>
        </div>
      </div>
    </div>
  );
}
