import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut,
  Menu, X, Bell, ChevronRight, BarChart3, Tag, Shield,
  Megaphone, Watch, Search, Sparkles, Bookmark, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VexLogoInline } from '../../components/Logo';

const adminNavItems = [
  { to: '/admin',              label: 'Dashboard',     Icon: LayoutDashboard, end: true },
  { to: '/admin/products',     label: 'Products',      Icon: Package         },
  { to: '/admin/orders',       label: 'Orders',        Icon: ShoppingBag     },
  { to: '/admin/users',        label: 'Users',         Icon: Users           },
  { to: '/admin/analytics',    label: 'Analytics',     Icon: BarChart3       },
  { to: '/admin/categories',   label: 'Categories',    Icon: Tag             },
  { to: '/admin/brands',       label: 'Brands',        Icon: Bookmark        },
  { to: '/admin/testimonials', label: 'Testimonials',  Icon: MessageSquare   },
  { to: '/admin/sub-admins',   label: 'Sub-Admins',    Icon: Shield          },
  { to: '/admin/marketing',    label: 'Marketing',     Icon: Megaphone       },
];
const productNavItems = [
  { to: '/admin',          label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products',  Icon: Package         },
];
const marketingNavItems = [
  { to: '/admin',           label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/marketing', label: 'Marketing', Icon: Megaphone       },
];

export default function AdminLayout() {
  const { user, logout, isAdmin, isSubAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center gap-4 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-500/15 rounded-full blur-3xl animate-blob" />
        <div className="relative glass-card rounded-3xl p-10 text-center max-w-md w-full shadow-2xl">
          <div className="text-6xl mb-3">🔒</div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 mt-2">You need admin or staff privileges to access this panel.</p>
          <Link
            to="/admin-login"
            className="btn-shine inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-primary-700 to-primary-500 text-white px-6 py-3 rounded-2xl font-bold shadow-glow-blue hover:scale-105 transition-transform"
          >
            Admin Login →
          </Link>
        </div>
      </div>
    );
  }

  let navItems = adminNavItems;
  if (isSubAdmin) {
    navItems = user?.department === 'marketing' ? marketingNavItems : productNavItems;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel = isAdmin ? 'Main Admin' : user?.department === 'marketing' ? 'Marketing Staff' : 'Products Staff';
  const roleBadge = isAdmin ? 'text-accent-300' : 'text-emerald-300';

  return (
    <div className="flex h-screen bg-mesh-light overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Decorative glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-20 w-72 h-72 bg-accent-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-grid-dark opacity-30" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Link to="/">
            <VexLogoInline size="sm" variant="dark" />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User card */}
        <div className="relative mx-4 mt-4">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-400/40 via-primary-500/30 to-accent-400/40 rounded-2xl blur opacity-50" />
          <div className="relative bg-white/5 border border-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3">
            <span className="relative">
              <span className="absolute inset-0 rounded-full bg-accent-500/40 blur-md" />
              <img src={user?.avatar} alt={user?.name} className="relative w-10 h-10 rounded-full object-cover ring-2 ring-accent-400/60" />
            </span>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate">{user?.name}</p>
              <p className={`text-[11px] font-bold ${roleBadge} flex items-center gap-1`}>
                <Sparkles size={10} /> {roleLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.25em] px-3 mb-3">Menu</p>
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-500 to-amber-400 text-navy-950 shadow-glow-gold'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {!isActive && (
                    <span className="absolute inset-0 bg-gradient-to-r from-primary-600/0 via-primary-600/0 to-primary-600/0 group-hover:from-primary-600/15 group-hover:to-accent-500/10 transition-all" />
                  )}
                  <Icon size={18} className="relative" />
                  <span className="relative">{label}</span>
                  <ChevronRight size={14} className={`relative ml-auto transition-transform ${isActive ? '' : 'opacity-40 group-hover:translate-x-1'}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="relative px-3 pb-5 space-y-1.5 border-t border-white/10 pt-3">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Watch size={18} /> View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search…"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
          <div className="flex-1 md:hidden">
            <h1 className="text-base font-display font-bold text-gray-900">VexDeals Admin</h1>
          </div>
          <button className="relative p-2.5 hover:bg-gray-100 rounded-xl">
            <Bell size={19} className="text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <img src={user?.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-accent-200" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
              <p className={`text-[11px] font-bold ${isAdmin ? 'text-accent-600' : 'text-emerald-600'}`}>{roleLabel}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
