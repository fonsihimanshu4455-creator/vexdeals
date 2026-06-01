import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, LogOut, LayoutDashboard, CreditCard, MapPin, Package } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      {/* Top announcement banner */}
      <div className="bg-gradient-to-r from-navy-900 via-primary-900 to-navy-900 text-white text-center py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium tracking-wide px-3">
        <span className="hidden sm:inline">🎁 Free shipping on orders above ₹1000 &nbsp;·&nbsp; </span>
        <span className="sm:hidden">🎁 Free shipping ₹1000+ &nbsp;·&nbsp; </span>
        Use code{' '}
        <span className="font-bold text-accent-400 bg-accent-400/10 px-1.5 py-0.5 rounded">VEXFIRST</span>
        {' '}for 10% off
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <VexLogoInline size="lg" />
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full bg-gray-50 border-2 border-gray-200 hover:border-primary-400 focus-within:border-primary-600 rounded-xl overflow-hidden transition-colors">
              <input
                type="text"
                placeholder="Search watches, eyewear & more…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent"
              />
              <button type="submit" className="bg-primary-600 px-5 text-white hover:bg-primary-700 transition-colors">
                <Search size={17} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-primary-50 rounded-xl transition-colors group">
              <ShoppingCart size={22} className="text-gray-600 group-hover:text-primary-600 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <img src={avatar} alt={displayName} className="w-7 h-7 rounded-full object-cover border-2 border-primary-200" />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">{firstName}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-800 truncate">{displayName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                      >
                        <LayoutDashboard size={16} /> Admin Panel
                      </Link>
                    )}
                    {isCustomer && (
                      <>
                        <Link
                          to="/account/orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                        >
                          <Package size={16} /> My Orders
                        </Link>
                        <Link
                          to="/account/transactions"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                        >
                          <CreditCard size={16} /> Transaction History
                        </Link>
                        <Link
                          to="/account/addresses"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                        >
                          <MapPin size={16} /> Saved Addresses
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary-600/30"
              >
                <User size={15} />
                <span className="hidden sm:block">Sign In</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Category nav — desktop */}
        <nav className="hidden md:flex items-center gap-1 pb-2 border-t border-gray-50 pt-1.5">
          {activeCategories.map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="text-xs font-semibold text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5"
            >
              <span>{cat.icon}</span> {cat.name}
            </Link>
          ))}
          <Link
            to="/about"
            className="text-xs font-semibold text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
          >
            About Us
          </Link>
          <Link
            to="/products"
            className="ml-auto text-xs font-bold text-white bg-accent-500 hover:bg-accent-600 px-4 py-1.5 rounded-lg transition-all flex items-center gap-1"
          >
            ⚡ All Deals
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex border-2 border-primary-600 rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="bg-primary-600 px-4 text-white">
              <Search size={16} />
            </button>
          </form>

          {/* Category links */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Shop by Category</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {activeCategories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm text-gray-600 hover:text-primary-700 font-medium border-b border-gray-50"
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
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-accent-500 to-accent-400 text-gray-900 font-bold py-3 rounded-xl text-sm"
          >
            ⚡ View All Deals
          </Link>

          {/* About Us */}
          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50"
          >
            About Us
          </Link>

          {/* Account section */}
          <div className="border-t border-gray-100 pt-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-1 mb-3">
                  <img src={avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover border-2 border-primary-200 shrink-0" />
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
                        <Package size={15} /> My Orders
                      </Link>
                      <Link to="/account/transactions" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium">
                        <CreditCard size={15} /> Transactions
                      </Link>
                      <Link to="/account/addresses" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium">
                        <MapPin size={15} /> Addresses
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
                className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white font-bold py-3 rounded-xl text-sm"
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
