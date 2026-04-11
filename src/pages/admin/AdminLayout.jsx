import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut,
  Menu, X, Bell, ChevronRight, BarChart3, Tag, Shield,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VexLogoInline } from '../../components/Logo';

// Full nav for main admin
const adminNavItems = [
  { to: '/admin',              label: 'Dashboard',   Icon: LayoutDashboard, end: true },
  { to: '/admin/products',     label: 'Products',    Icon: Package          },
  { to: '/admin/orders',       label: 'Orders',      Icon: ShoppingBag      },
  { to: '/admin/users',        label: 'Users',       Icon: Users            },
  { to: '/admin/analytics',    label: 'Analytics',   Icon: BarChart3        },
  { to: '/admin/categories',   label: 'Categories',  Icon: Tag              },
  { to: '/admin/sub-admins',   label: 'Sub-Admins',  Icon: Shield           },
  { to: '/admin/marketing',    label: 'Marketing',   Icon: Megaphone        },
];

// Sub-admin nav (filtered by department)
const productNavItems = [
  { to: '/admin',          label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products',  Icon: Package          },
];
const marketingNavItems = [
  { to: '/admin',           label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/marketing', label: 'Marketing', Icon: Megaphone        },
];

// VexDeals admin logo

export default function AdminLayout() {
  const { user, logout, isAdmin, isSubAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-gray-500">You need admin or staff privileges to access this panel.</p>
        <Link to="/admin-login" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700">
          Login as Admin →
        </Link>
      </div>
    );
  }

  // Pick nav items based on role
  let navItems = adminNavItems;
  if (isSubAdmin) {
    navItems = user?.department === 'marketing' ? marketingNavItems : productNavItems;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel = isAdmin ? 'Main Admin' : user?.department === 'marketing' ? 'Marketing Staff' : 'Products Staff';
  const roleBadgeColor = isAdmin ? 'text-accent-400' : 'text-emerald-400';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-primary-800">
          <Link to="/">
            <VexLogoInline size="sm" />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="mx-4 mt-4 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-accent-500/40" />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className={`text-xs font-semibold ${roleBadgeColor}`}>{roleLabel}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-500 text-primary-900 font-bold'
                    : 'text-primary-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
              <ChevronRight size={14} className="ml-auto opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 space-y-2 border-t border-primary-800 pt-3">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Watch size={18} /> View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-primary-800">VexDeals Admin</h1>
          </div>
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2">
            <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-accent-200" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
              <p className={`text-xs font-medium ${isAdmin ? 'text-accent-600' : 'text-primary-500'}`}>{roleLabel}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
