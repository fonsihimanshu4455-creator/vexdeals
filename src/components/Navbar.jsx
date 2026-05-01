import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, User, Menu, X, LogOut, LayoutDashboard,
  CreditCard, MapPin, Package, Sparkles, ChevronDown,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../context/CategoryContext';
import { VexLogoInline } from './Logo';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout, isStaff, isCustomer } = useAuth();
  const { activeCategories } = useCategories();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]         = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
  const firstName   = displayName.split(' ')[0];
  const avatar      = user?.avatar || 'https://picsum.photos/seed/vexdeals-user/100/100';

  return (
    <header className="sticky top-0 z-50">
      {/* ── Announcement ticker ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-950 via-primary-900 to-navy-950 text-white">
        <div className="absolute inset-0 opacity-30 bg-grid-dark pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 py-1.5 text-center text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles size={11} className="text-accent-400 animate-pulse" />
          <span className="hidden sm:inline">Free shipping over ₹1000 · </span>
          <span className="sm:hidden">Free ship ₹1000+ ·</span>
          <span>Use</span>
          <span className="font-bold text-accent-300 bg-accent-400/15 px-2 py-0.5 rounded-md ring-1 ring-accent-400/30">VEXFIRST</span>
          <span>for 10% off</span>
        </div>
      </div>

      {/* ── Main bar ── */}
      <div
        className={`relative transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_30px_-12px_rgba(15,23,42,.18)] border-b border-white/40'
            : 'bg-white/95 backdrop-blur-md border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="shrink-0 group">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-accent-400/30 via-primary-500/20 to-accent-400/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <VexLogoInline size="lg" />
                </div>
              </div>
            </Link>

            {/* Search bar — desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="group flex w-full bg-white/70 border border-gray-200 hover:border-primary-400 focus-within:border-primary-600 rounded-2xl overflow-hidden transition-all focus-within:shadow-[0_0_0_4px_rgba(37,99,235,.12)]">
                <Search size={16} className="ml-4 self-center text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search watches, eyewear & more…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="btn-shine bg-gradient-to-r from-primary-700 to-primary-500 px-5 text-white text-sm font-semibold transition-all hover:from-primary-600 hover:to-primary-400"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl text-gray-600 hover:text-primary-700 hover:bg-primary-50 transition-all group"
              >
                <ShoppingCart size={21} className="group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <>
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-accent-400 to-accent-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent-500/40 animate-ping" />
                  </>
                )}
              </Link>

              {/* User */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-2xl hover:bg-gray-100 transition-all group"
                  >
                    <span className="relative">
                      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-400 to-primary-500 opacity-0 group-hover:opacity-70 blur-md transition-opacity" />
                      <img
                        src={avatar}
                        alt={displayName}
                        className="relative w-8 h-8 rounded-full object-cover ring-2 ring-white shadow"
                      />
                    </span>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-24 truncate">{firstName}</span>
                    <ChevronDown size={14} className={`hidden sm:block text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1 z-50 animate-scale-in origin-top-right overflow-hidden">
                        <div className="px-4 py-3 bg-gradient-to-br from-primary-50 to-accent-50 border-b border-gray-100">
                          <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          {isStaff && (
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                            >
                              <LayoutDashboard size={15} className="text-primary-500" /> Admin Panel
                            </Link>
                          )}
                          {isCustomer && (
                            <>
                              <Link to="/account/orders" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                <Package size={15} className="text-primary-500" /> My Orders
                              </Link>
                              <Link to="/account/transactions" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                <CreditCard size={15} className="text-primary-500" /> Transactions
                              </Link>
                              <Link to="/account/addresses" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                <MapPin size={15} className="text-primary-500" /> Saved Addresses
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={15} /> Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-shine relative flex items-center gap-1.5 bg-gradient-to-r from-primary-700 to-primary-500 hover:from-primary-600 hover:to-primary-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-glow-blue"
                >
                  <User size={15} />
                  <span className="hidden sm:block">Sign In</span>
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Category nav — desktop */}
          <nav className="hidden md:flex items-center gap-1 pb-2 border-t border-gray-100/80 pt-1.5">
            {activeCategories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="text-xs font-semibold text-gray-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5"
              >
                <span className="text-base">{cat.icon}</span> {cat.name}
              </Link>
            ))}
            <Link
              to="/products"
              className="ml-auto btn-shine relative flex items-center gap-1 bg-gradient-to-r from-accent-500 to-amber-400 text-navy-900 px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all shadow-glow-gold hover:scale-[1.03]"
            >
              <Sparkles size={12} /> All Deals
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-4 space-y-4 animate-fade-up shadow-2xl">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex border-2 border-primary-200 focus-within:border-primary-600 rounded-2xl overflow-hidden transition-colors">
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 text-sm outline-none bg-transparent"
            />
            <button type="submit" className="btn-shine bg-gradient-to-r from-primary-700 to-primary-500 px-5 text-white">
              <Search size={16} />
            </button>
          </form>

          {/* Category links */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Shop by Category</p>
            <div className="grid grid-cols-2 gap-2">
              {activeCategories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 font-medium bg-gray-50 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all"
                >
                  <span className="text-base">{cat.icon}</span> {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* All Deals CTA */}
          <Link
            to="/products"
            onClick={() => setMenuOpen(false)}
            className="btn-shine flex items-center justify-center gap-2 w-full bg-gradient-to-r from-accent-500 via-amber-400 to-accent-500 text-navy-900 font-extrabold py-3 rounded-2xl text-sm shadow-glow-gold animate-gradient"
          >
            <Sparkles size={16} /> View All Deals
          </Link>

          {/* Account section */}
          <div className="border-t border-gray-100 pt-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-1 mb-3">
                  <img src={avatar} alt={displayName} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-200 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{displayName}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {isStaff && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold">
                      <LayoutDashboard size={15} /> Admin
                    </Link>
                  )}
                  {isCustomer && (
                    <>
                      <Link to="/account/orders" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium">
                        <Package size={15} /> Orders
                      </Link>
                      <Link to="/account/transactions" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium">
                        <CreditCard size={15} /> History
                      </Link>
                      <Link to="/account/addresses" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium">
                        <MapPin size={15} /> Address
                      </Link>
                    </>
                  )}
                </div>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold"
                >
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-shine flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-700 to-primary-500 text-white font-bold py-3 rounded-2xl text-sm shadow-glow-blue"
              >
                <User size={15} /> Sign In to Your Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
