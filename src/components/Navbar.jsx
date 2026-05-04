import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, User, UserCircle, Menu, X, LogOut, LayoutDashboard,
  CreditCard, MapPin, Package, Sparkles, ChevronDown, ArrowRight,
  Command,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';
import Marquee from './Marquee';
import { VexLogoInline } from './Logo';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout, isStaff, isCustomer } = useAuth();
  const { activeCategories } = useCategories();
  const { products } = useProducts();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [megaOpen, setMegaOpen]         = useState(null);
  const [scrolled, setScrolled]         = useState(false);
  const closeTimer = useRef();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cmd/Ctrl + K opens search overlay
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(s => !s);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const enterMega = (id) => {
    clearTimeout(closeTimer.current);
    setMegaOpen(id);
  };
  const leaveMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(null), 140);
  };

  const displayName = user?.name || user?.fullName || 'Account';
  const firstName   = displayName.split(' ')[0];
  const avatar      = user?.avatar || 'https://picsum.photos/seed/vexdeals-user/100/100';

  // Quick search suggestions
  const querySuggest = searchQuery.trim().toLowerCase();
  const suggestions  = querySuggest
    ? products
        .filter(p =>
          p.name.toLowerCase().includes(querySuggest) ||
          p.category.toLowerCase().includes(querySuggest)
        )
        .slice(0, 6)
    : products.slice(0, 6);

  return (
    <header className="sticky top-0 z-50">
      {/* ── Marquee announcement strip ── */}
      <div className="relative bg-gradient-to-r from-navy-950 via-primary-900 to-navy-950 text-white overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid-dark opacity-30 pointer-events-none" />
        <Marquee className="py-2 text-[11px] sm:text-xs font-medium tracking-wide">
          {[
            'FREE SHIPPING ON ORDERS ₹1000+',
            'USE CODE  · VEXFIRST · FOR 10% OFF',
            'AUTHENTIC BRANDS · GUARANTEED',
            '7-DAY EASY RETURNS',
            '24/7 CUSTOMER SUPPORT',
            'NEW DROPS EVERY WEEK',
          ].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-white/80">
              <Sparkles size={12} className="text-accent-400" />
              <span className="uppercase tracking-[0.18em]">{t}</span>
              <span className="w-1 h-1 rounded-full bg-accent-400/70" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── Main bar ── */}
      <div
        className={`relative transition-colors duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-[0_4px_20px_-8px_rgba(15,23,42,.15)] border-b border-gray-100'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] gap-4">
            {/* Logo */}
            <Link to="/" className="shrink-0 group">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-accent-400/30 via-primary-500/20 to-accent-400/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <VexLogoInline size="lg" />
                </div>
              </div>
            </Link>

            {/* Search trigger — desktop */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex flex-1 max-w-xl items-center gap-3 bg-white/70 hover:bg-white border border-gray-200 hover:border-primary-300 rounded-2xl px-4 py-2.5 text-sm text-gray-500 transition-all"
            >
              <Search size={15} className="text-gray-400" />
              <span className="flex-1 text-left">Search watches, eyewear, brands…</span>
              <span className="hidden lg:flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                <Command size={10} /> K
              </span>
            </button>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl text-gray-700 hover:text-primary-700 hover:bg-primary-50 transition-all group"
                aria-label="Cart"
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
                            <Link to="/admin" onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                              <LayoutDashboard size={15} className="text-primary-500" /> Admin Panel
                            </Link>
                          )}
                          {isCustomer && (
                            <>
                              <Link to="/account/profile" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                <UserCircle size={15} className="text-primary-500" /> My Profile
                              </Link>
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
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
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

          {/* ── Mega-menu category nav ── */}
          <nav className="hidden md:flex items-center gap-1 pb-2 border-t border-gray-100/80 pt-1.5 relative">
            {activeCategories.map(cat => {
              const catProducts = products.filter(p => p.category === cat.name).slice(0, 4);
              const isOpen = megaOpen === cat.id;
              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => enterMega(cat.id)}
                  onMouseLeave={leaveMega}
                  className="relative"
                >
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className={`relative text-xs font-bold px-3 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isOpen ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    {cat.name}
                    <ChevronDown size={11} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-500 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
                  </Link>

                  {isOpen && catProducts.length > 0 && (
                    <div
                      className="absolute left-0 top-full pt-3 w-[34rem] z-40 animate-fade-up"
                      onMouseEnter={() => enterMega(cat.id)}
                      onMouseLeave={leaveMega}
                    >
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-br from-primary-500/20 via-accent-400/15 to-fuchsia-500/15 rounded-3xl blur-xl opacity-70" />
                        <div className="relative bg-white border border-gray-100 rounded-3xl shadow-2xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-600">Featured</p>
                              <h4 className="font-display text-lg font-bold text-gray-900">{cat.name}</h4>
                            </div>
                            <Link
                              to={`/products?category=${encodeURIComponent(cat.name)}`}
                              className="text-xs font-bold text-primary-700 flex items-center gap-1 group"
                            >
                              Shop all
                              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                          <div className="grid grid-cols-4 gap-3">
                            {catProducts.map(p => (
                              <Link
                                key={p.id}
                                to={`/products/${p.id}`}
                                onClick={() => setMegaOpen(null)}
                                className="group block"
                              >
                                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden ring-1 ring-gray-100 group-hover:ring-primary-300 transition-all">
                                  <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <p className="mt-2 text-[11px] font-semibold text-gray-700 line-clamp-1 group-hover:text-primary-700 transition-colors">{p.name}</p>
                                <p className="text-[11px] font-bold text-gray-900">₹{p.price.toLocaleString('en-IN')}</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <Link
              to="/products"
              className="ml-auto btn-shine relative flex items-center gap-1.5 bg-gradient-to-r from-accent-500 to-amber-400 text-navy-900 px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all shadow-glow-gold hover:scale-[1.03]"
            >
              <Sparkles size={12} /> All Deals
            </Link>
          </nav>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-4 space-y-4 animate-fade-up shadow-2xl">
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

          <Link
            to="/products"
            onClick={() => setMenuOpen(false)}
            className="btn-shine flex items-center justify-center gap-2 w-full bg-gradient-to-r from-accent-500 via-amber-400 to-accent-500 text-navy-900 font-extrabold py-3 rounded-2xl text-sm shadow-glow-gold animate-gradient"
          >
            <Sparkles size={16} /> View All Deals
          </Link>

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
                      <Link to="/account/profile" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium">
                        <UserCircle size={15} /> Profile
                      </Link>
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
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="btn-shine flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-700 to-primary-500 text-white font-bold py-3 rounded-2xl text-sm shadow-glow-blue">
                <User size={15} /> Sign In to Your Account
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Command-K search overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-navy-950/70 backdrop-blur-md animate-fade-in flex items-start justify-center pt-20 sm:pt-32 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl animate-fade-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-accent-400/40 via-primary-500/30 to-fuchsia-500/30 rounded-3xl blur-2xl opacity-70" />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5">
                <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <Search size={20} className="text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search watches, eyewear, brands…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-base bg-transparent placeholder:text-gray-400"
                  />
                  <span className="hidden sm:flex text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">ESC</span>
                </form>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {querySuggest ? 'Results' : 'Trending now'}
                  </p>
                  {suggestions.length === 0 ? (
                    <p className="px-3 py-6 text-sm text-center text-gray-400">No matches. Try another keyword.</p>
                  ) : (
                    suggestions.map(p => (
                      <Link
                        key={p.id}
                        to={`/products/${p.id}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-12 h-12 rounded-xl object-cover bg-gray-50 ring-1 ring-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary-700 transition-colors">{p.name}</p>
                          <p className="text-[11px] text-gray-500">{p.category}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 shrink-0">₹{p.price.toLocaleString('en-IN')}</p>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between text-[11px] text-gray-400 bg-gray-50">
                  <span>Tip: press <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 font-bold text-gray-700">Enter</kbd> to view all results</span>
                  <span className="hidden sm:flex items-center gap-1"><Command size={10} /> + K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
