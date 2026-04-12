import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';

function CountdownTimer() {
  const [time, setTime] = useState({ h: 5, m: 42, s: 30 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 5; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-2">
      {[time.h, time.m, time.s].map((val, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="bg-white text-primary-800 font-black text-lg sm:text-2xl px-3 py-1 rounded-lg min-w-[48px] text-center shadow">
            {pad(val)}
          </span>
          {i < 2 && <span className="text-white font-bold text-xl">:</span>}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const { activeCategories } = useCategories();
  const { products } = useProducts();

  const featuredProducts = products.filter(p => p.featured);
  const bestsellers      = products.filter(p => p.isBestseller).slice(0, 4);
  const newArrivals      = products.filter(p => p.isNew).slice(0, 4);

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  // Map category name → product count from data
  const countForCat = (name) => products.filter(p => p.category === name).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dynamic Categories — from admin */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {activeCategories.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No categories available</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {activeCategories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`${cat.color} rounded-2xl p-4 text-center transition-all hover:scale-105 hover:shadow-md`}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="text-xs sm:text-sm font-semibold text-gray-800">{cat.name}</p>
                <p className="text-xs text-gray-500">{countForCat(cat.name) || '—'} items</p>
              </Link>
            ))}
            <Link
              to="/products"
              className="bg-primary-50 hover:bg-primary-100 rounded-2xl p-4 text-center transition-all hover:scale-105 hover:shadow-md border-2 border-dashed border-primary-200"
            >
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-xs sm:text-sm font-semibold text-primary-700">All Deals</p>
              <p className="text-xs text-primary-500">{products.length} items</p>
            </Link>
          </div>
        )}
      </section>

      {/* Flash Sale */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 to-accent-400" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent-500/20 rounded-xl p-2">
                <Zap size={24} className="text-accent-400" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">Flash Sale</h2>
                <p className="text-white/70 text-sm">Exclusive deals — limited stock!</p>
              </div>
            </div>
            <div className="text-white">
              <p className="text-xs uppercase tracking-widest mb-2 text-accent-400 font-semibold">Ends in</p>
              <CountdownTimer />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.filter(p => p.discount >= 20).slice(0, 4).map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-primary-800">{formatPrice(product.price)}</span>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">-{product.discount}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
            See All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star size={22} className="text-accent-500 fill-accent-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Bestsellers</h2>
          </div>
          <Link to="/products" className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {bestsellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">New Arrivals</h2>
          </div>
          <Link to="/products" className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-primary-800 to-primary-900 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-500/10 to-transparent pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 relative">
            Get 10% Off Your First Order!
          </h2>
          <p className="text-white/70 mb-6 text-sm sm:text-base relative">
            Use code{' '}
            <span className="bg-accent-500 text-primary-900 font-bold px-2 py-0.5 rounded">VEXFIRST</span>{' '}
            at checkout
          </p>
          <Link
            to="/login"
            className="relative inline-flex items-center gap-2 bg-accent-500 text-primary-900 font-bold px-8 py-3 rounded-xl hover:bg-accent-400 transition-colors shadow-lg"
          >
            Sign Up Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
