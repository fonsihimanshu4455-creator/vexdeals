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
    <>
    <header className="sticky top-0 z-50 glass border-b border-ink-900/5">
      {/* Announcement */}
      <div className="bg-brand-gradient text-white text-center py-2 text-[11px] sm:text-xs font-medium px-3">
        ✦ Free shipping over ₹1000 · Use code{' '}
        <span className="font-bold">VEXFIRST</span> for 10% off
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="shrink-0">
            <VexLogoInline size="lg" />
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="flex w-full items-center bg-cream-100 rounded-full border border-transparent focus-within:border-primary-300 focus-within:bg-white transition-colors px-4">
              <Search size={17} className="text-ink-700/50" />
              <input
                type="text"
                placeholder="Search watches, eyewear…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent placeholder:text-ink-700/40"
              />
              <button type="submit" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">Go</button>
            </div>
          </form>

          {/* Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-cream-100 transition-colors group">
              <ShoppingBag size={21} className="text-ink-800 group-hover:text-primary-600 transition-colors" />
              {totalItems > 0 && (
                <span key={totalItems} className="animate-bump absolute top-0.5 right-0.5 bg-brand-gradient text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-cream-100 transition-colors">
                  <img src={avatar} alt={displayName} className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-200" />
                  <span className="hidden sm:block text-sm font-medium text-ink-800 max-w-24 truncate">{firstName}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-ink-900/5 shadow-card py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-ink-900/5">
                      <p className="text-xs font-semibold text-ink-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-ink-700/50 truncate">{user.email}</p>
                    </div>
                    {isStaff && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-800 hover:bg-cream-100 hover:text-primary-700">
                        <LayoutDashboard size={16} /> Admin Panel
                      </Link>
                    )}
                    {isCustomer && (
                      <>
                        <Link to="/account/profile" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-800 hover:bg-cream-100 hover:text-primary-700">
                          <User size={16} /> Personal Info
                        </Link>
                        <Link to="/account/orders" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-800 hover:bg-cream-100 hover:text-primary-700">
                          <Package size={16} /> My Orders
                        </Link>
                        <Link to="/account/transactions" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-800 hover:bg-cream-100 hover:text-primary-700">
                          <CreditCard size={16} /> Transactions
                        </Link>
                        <Link to="/account/addresses" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-800 hover:bg-cream-100 hover:text-primary-700">
                          <MapPin size={16} /> Saved Addresses
                        </Link>
                      </>
                    )}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-accent-600 hover:bg-cream-100">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-brand-gradient text-white px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold shadow-glow hover:-translate-y-0.5 transition-all">
                <User size={15} />
                <span className="hidden sm:block">Sign In</span>
              </Link>
            )}

            <button className="md:hidden p-2 text-ink-800" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

      </div>
      </header>

      {/* Mobile menu — full screen */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-white flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-ink-900/10 shrink-0">
            <Link to="/" onClick={() => setMenuOpen(false)}><VexLogoInline size="md" /></Link>
            <button onClick={() => setMenuOpen(false)} className="p-2 -mr-2 text-ink-800" aria-label="Close menu"><X size={26} /></button>
          </div>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          <form onSubmit={handleSearch} className="flex items-center bg-cream-100 rounded-full px-4">
            <Search size={16} className="text-ink-700/50" />
            <input type="text" placeholder="Search products…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" />
            <button type="submit" className="text-primary-600 font-semibold text-sm">Go</button>
          </form>

          <div>
            <p className="eyebrow mb-3">Shop by Category</p>
            <div className="grid grid-cols-2 gap-2">
              {activeCategories.map(cat => (
                <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2.5 px-3 rounded-xl bg-cream-100 text-sm text-ink-800 font-medium">
                  <span className="text-base">{cat.icon}</span> {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/products" onClick={() => setMenuOpen(false)} className="btn-grad w-full text-sm">View All Deals</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="btn-outline w-full text-sm">About Us</Link>

          <div className="border-t border-ink-900/5 pt-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <img src={avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-200 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{displayName}</p>
                    <p className="text-[11px] text-ink-700/50 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {isStaff && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium">
                      <LayoutDashboard size={15} /> Admin
                    </Link>
                  )}
                  {isCustomer && (
                    <>
                      <Link to="/account/profile" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-cream-100 text-ink-800 text-sm font-medium">
                        <User size={15} /> Profile
                      </Link>
                      <Link to="/account/orders" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-cream-100 text-ink-800 text-sm font-medium">
                        <Package size={15} /> Orders
                      </Link>
                      <Link to="/account/transactions" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-cream-100 text-ink-800 text-sm font-medium">
                        <CreditCard size={15} /> Payments
                      </Link>
                      <Link to="/account/addresses" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-cream-100 text-ink-800 text-sm font-medium">
                        <MapPin size={15} /> Address
                      </Link>
                    </>
                  )}
                </div>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-accent-50 text-accent-700 text-sm font-medium">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-grad w-full text-sm">
                <User size={15} /> Sign In
              </Link>
            )}
          </div>
          </div>
        </div>
      )}
    </>
  );
}
