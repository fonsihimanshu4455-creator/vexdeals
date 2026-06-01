import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Star, ShieldCheck, RotateCcw, Lock, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { VexLogoMark } from '../components/Logo';
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
    <div className="flex items-center gap-1">
      {[time.h, time.m, time.s].map((val, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-white/15 backdrop-blur text-white font-black text-base sm:text-2xl px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl min-w-[38px] sm:min-w-[52px] text-center border border-white/20">
            {pad(val)}
          </span>
          {i < 2 && <span className="text-white/70 font-bold text-sm sm:text-lg">:</span>}
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
  const saleProducts     = products.filter(p => p.discount >= 20).slice(0, 4);

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const countForCat = (name) => products.filter(p => p.category === name).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Premium Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink-900 bg-ink-radial">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-navy-800 to-primary-900 opacity-95" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Copy */}
            <div className="max-w-xl animate-fade-up">
              <span className="inline-flex items-center gap-2 glass border border-white/15 text-accent-300 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.18em]">
                <Sparkles size={13} /> Premium Watches &amp; Eyewear
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05]">
                Timeless Style,{' '}
                <span className="text-transparent bg-clip-text bg-gold-sheen">Smartly Priced</span>
              </h1>
              <p className="mt-4 text-primary-200/90 text-sm sm:text-lg leading-relaxed max-w-lg">
                Hand-picked, 100% authentic watches &amp; eyewear from brands you love —
                at deals you won't find anywhere else.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/products" className="btn-gold text-sm sm:text-base">
                  Explore Collection <ArrowRight size={17} />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 glass border border-white/20 text-white font-semibold rounded-2xl px-6 py-3 text-sm sm:text-base hover:bg-white/15 transition-colors"
                >
                  About Us
                </Link>
              </div>
              {/* Trust chips */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { Icon: ShieldCheck, label: '100% Authentic' },
                  { Icon: RotateCcw,   label: '7-Day Returns' },
                  { Icon: Lock,        label: 'Secure Payments' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-primary-100/80 text-xs sm:text-sm font-medium">
                    <Icon size={16} className="text-accent-400" /> {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Brand visual */}
            <div className="hidden lg:flex justify-center animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-accent-500/20 blur-3xl rounded-full scale-110" />
                <div className="relative w-72 h-72 rounded-full glass border border-white/15 flex items-center justify-center shadow-premium animate-float">
                  <VexLogoMark size={150} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Wave bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-50" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
      </section>

      {/* ── Shop by Category ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="section-eyebrow">Browse</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shop by Category</h2>
            <div className="accent-bar" />
          </div>
          <Link to="/products" className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1 transition-colors">
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
                className={`${cat.color} group rounded-2xl p-4 text-center border border-black/5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover active:scale-95`}
              >
                <div className="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110">{cat.icon}</div>
                <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">{cat.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{countForCat(cat.name) || '—'}</p>
              </Link>
            ))}
            <Link
              to="/products"
              className="group bg-gradient-to-br from-primary-700 to-navy-800 rounded-2xl p-4 text-center border border-white/10 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover active:scale-95"
            >
              <div className="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110">⚡</div>
              <p className="text-xs sm:text-sm font-bold text-white">All Deals</p>
              <p className="text-xs text-primary-200 mt-0.5">{products.length} items</p>
            </Link>
          </div>
        )}
      </section>

      {/* ── Flash Sale ──────────────────────────────────────────────────── */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-navy-800 rounded-3xl p-6 sm:p-8 overflow-hidden">
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400" />
            {/* Glow */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-accent-500/20 border border-accent-500/30 rounded-xl sm:rounded-2xl p-2">
                  <Zap size={20} className="text-accent-400" fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-white">Flash Sale</h2>
                  <p className="text-white/60 text-xs sm:text-sm">Limited stock — grab it fast!</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                <p className="text-[10px] uppercase tracking-widest text-accent-400 font-bold sm:mb-1">Ends in</p>
                <CountdownTimer />
              </div>
            </div>

            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {saleProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50 relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow">
                      -{product.discount}%
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1 mb-1">{product.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-gray-900">{formatPrice(product.price)}</span>
                      <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ────────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="section-eyebrow">Curated</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Products</h2>
              <div className="accent-bar" />
            </div>
            <Link to="/products" className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1">
              See All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Bestsellers ─────────────────────────────────────────────────── */}
      {bestsellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1">
                <Star size={15} className="text-amber-500 fill-amber-500" />
                <h2 className="text-base sm:text-xl font-bold text-gray-900">Bestsellers</h2>
              </div>
            </div>
            <Link to="/products" className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {bestsellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── New Arrivals ─────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1">
                <span className="text-emerald-600 font-black text-xs">NEW</span>
                <h2 className="text-base sm:text-xl font-bold text-gray-900">New Arrivals</h2>
              </div>
            </div>
            <Link to="/products" className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
