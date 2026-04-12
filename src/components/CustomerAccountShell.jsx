import { Link, Navigate, useLocation } from 'react-router-dom';
import { CreditCard, MapPin, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/account/orders', label: 'My Orders', Icon: Package },
  { to: '/account/transactions', label: 'Transaction History', Icon: CreditCard },
  { to: '/account/addresses', label: 'Saved Addresses', Icon: MapPin },
];

export default function CustomerAccountShell({ title, description, children }) {
  const { isCustomer, loading } = useAuth();
  const location = useLocation();

  if (!loading && !isCustomer) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-3 shadow-sm">
            <nav className="space-y-2">
              {navItems.map(({ to, label, Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary-700'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </div>
  );
}
