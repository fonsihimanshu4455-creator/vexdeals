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
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top announcement banner */}
      <div className="bg-primary-800 text-white text-center py-1.5 text-xs font-medium">
        Free shipping on orders above ₹500 &nbsp;|&nbsp; Use code{' '}
        <span className="font-bold text-accent-400">VEXFIRST</span> for 10% off
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <VexLogoInline size="md" />
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full border-2 border-primary-600 rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search watches, eyewear & more…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 text-sm outline-none"
              />
              <button type="submit" className="bg-primary-600 px-4 text-white hover:bg-primary-700 transition-colors">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingCart size={22} className="text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
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
                className="flex items-center gap-1.5 bg-primary-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
              >
                <User size={16} />
                <span className="hidden sm:block">Login</span>
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
        <nav className="hidden md:flex items-center gap-6 pb-3 text-sm font-medium text-gray-600 border-t border-gray-100 pt-2">
          {activeCategories.map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="hover:text-primary-700 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <span>{cat.icon}</span> {cat.name}
            </Link>
          ))}
          <Link to="/products" className="ml-auto text-accent-500 hover:text-accent-600 font-bold">
            All Deals →
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex border-2 border-primary-600 rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="bg-primary-600 px-4 text-white">
              <Search size={16} />
            </button>
          </form>
          <div className="grid grid-cols-2 gap-2">
            {activeCategories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-gray-600 hover:text-primary-700 py-1 font-medium flex items-center gap-1"
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
