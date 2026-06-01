import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, LogOut, LayoutDashboard, CreditCard, MapPin, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../context/CategoryContext';
import { VexLogoInline } from './Logo';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout, isStaff, isCustomer } = useAuth();
  const { activeCategories } = useCategories();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const displayName = user?.name || user?.fullName || 'Account';
  const firstName = displayName.split(' ')[0];
  const avatar = user?.avatar || 'https://picsum.photos/seed/vexdeals-user/100/100';

  return (
    <header className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur border-b border-ink-900/10">
      {/* Top announcement — ink band */}
      <div className="bg-ink-900 text-cream-100 text-center py-2 text-[10px] sm:text-[11px] font-medium tracking-widest2 uppercase px-3">
        Free shipping over ₹1000 &nbsp;·&nbsp; Code{' '}
        <span className="text-accent-400 font-semibold">VEXFIRST</span> — 10% off
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <VexLogoInline size="lg" />
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="flex w-full items-center border-b border-ink-900/25 focus-within:border-accent-500 transition-colors">
              <Search size={16} className="text-ink-700/60" />
              <input
                type="text"
                placeholder="Search watches, eyewear…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent placeholder:text-ink-700/40"
              />
              <button type="submit" className="text-[11px] uppercase tracking-widest2 font-semibold text-ink-900 hover:text-accent-600 transition-colors">
                Go
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/cart" className="relative p-2.5 hover:text-accent-600 transition-colors group">
              <ShoppingBag size={21} className="text-ink-800 group-hover:text-accent-600 transition-colors" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-accent-500 text-cream-50 text-[10px] w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-semibold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 hover:text-accent-600 transition-colors"
                >
                  <img src={avatar} alt={displayName} className="w-7 h-7 rounded-full object-cover ring-1 ring-ink-900/15" />
                  <span className="hidden sm:block text-sm font-medium text-ink-800 max-w-24 truncate">{firstName}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-cream-50 border border-ink-900/10 shadow-card py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-ink-900/10">
                      <p className="text-xs font-semibold text-ink-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-ink-700/50 truncate">{user.email}</p>
                    </div>
                    {isStaff && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-800 hover:bg-cream-200 hover:text-accent-700">
                        <LayoutDashboard size={16} strokeWidth={1.5} /> Admin Panel
                      </Link>
                    )}
                    {isCustomer && (
                      <>
                        <Link to="/account/orders" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-800 hover:bg-cream-200 hover:text-accent-700">
                          <Package size={16} strokeWidth={1.5} /> My Orders
                        </Link>
                        <Link to="/account/transactions" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-800 hover:bg-cream-200 hover:text-accent-700">
                          <CreditCard size={16} strokeWidth={1.5} /> Transactions
                        </Link>
                        <Link to="/account/addresses" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-800 hover:bg-cream-200 hover:text-accent-700">
                          <MapPin size={16} strokeWidth={1.5} /> Saved Addresses
                        </Link>
                      </>
                    )}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-accent-700 hover:bg-cream-200">
                      <LogOut size={16} strokeWidth={1.5} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="flex items-center gap-2 bg-ink-900 hover:bg-accent-600 text-cream-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest2 transition-colors">
                <User size={14} strokeWidth={1.5} />
                <span className="hidden sm:block">Sign In</span>
              </Link>
            )}

            <button className="md:hidden p-2 text-ink-800" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Category nav — desktop */}
        <nav className="hidden md:flex items-center gap-7 pb-3 pt-0.5">
          {activeCategories.map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="link-underline text-[12px] font-medium uppercase tracking-widest2 text-ink-700 hover:text-ink-900 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/products"
            className="ml-auto text-[12px] font-semibold uppercase tracking-widest2 text-accent-600 hover:text-accent-700 link-underline"
          >
            All Deals →
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-cream-50 border-t border-ink-900/10 px-4 py-5 space-y-5">
          <form onSubmit={handleSearch} className="flex items-center border-b border-ink-900/25">
            <Search size={16} className="text-ink-700/60" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
            />
            <button type="submit" className="text-[11px] uppercase tracking-widest2 font-semibold">Go</button>
          </form>

          <div>
            <p className="eyebrow mb-3">Shop by Category</p>
            <div className="grid grid-cols-2 gap-x-4">
              {activeCategories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2.5 text-sm text-ink-800 font-medium border-b border-ink-900/5"
                >
                  <span className="text-base">{cat.icon}</span> {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/products" onClick={() => setMenuOpen(false)} className="btn-ink w-full text-sm uppercase tracking-widest2">
            View All Deals
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="btn-outline w-full text-sm uppercase tracking-widest2">
            About Us
          </Link>

          <div className="border-t border-ink-900/10 pt-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <img src={avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover ring-1 ring-ink-900/15 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{displayName}</p>
                    <p className="text-[11px] text-ink-700/50 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {isStaff && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-cream-200 text-ink-900 text-sm font-medium">
                      <LayoutDashboard size={15} strokeWidth={1.5} /> Admin
                    </Link>
                  )}
                  {isCustomer && (
                    <>
                      <Link to="/account/orders" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-cream-200 text-ink-800 text-sm font-medium">
                        <Package size={15} strokeWidth={1.5} /> Orders
                      </Link>
                      <Link to="/account/transactions" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-cream-200 text-ink-800 text-sm font-medium">
                        <CreditCard size={15} strokeWidth={1.5} /> Payments
                      </Link>
                      <Link to="/account/addresses" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-cream-200 text-ink-800 text-sm font-medium">
                        <MapPin size={15} strokeWidth={1.5} /> Address
                      </Link>
                    </>
                  )}
                </div>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-accent-600 text-accent-700 text-sm font-medium">
                  <LogOut size={15} strokeWidth={1.5} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-cognac w-full text-sm uppercase tracking-widest2">
                <User size={15} strokeWidth={1.5} /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
