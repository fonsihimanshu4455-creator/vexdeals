import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Zap, Star, ShieldCheck, Headphones, Sparkles,
  Truck, BadgeCheck, Watch, Glasses,
} from 'lucide-react';
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
    <div className="flex items-center gap-1">
      {[
        { val: time.h, label: 'HRS' },
        { val: time.m, label: 'MIN' },
        { val: time.s, label: 'SEC' },
      ].map(({ val, label }, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="relative flex flex-col items-center">
            <span className="bg-white/10 backdrop-blur-md text-white font-black text-lg sm:text-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl min-w-[44px] sm:min-w-[58px] text-center border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,.15)]">
              {pad(val)}
            </span>
            <span className="text-[8px] tracking-[0.2em] text-white/50 font-bold mt-0.5">{label}</span>
          </span>
          {i < 2 && <span className="text-accent-400 font-bold text-xl mb-3.5 animate-pulse">:</span>}
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

  // Stats: derived from product data
  const totalProducts = products.length;
  const avgRating     = products.length
    ? (products.reduce((a, p) => a + p.rating, 0) / products.length).toFixed(1)
    : '4.8';

  return (
    <div className="min-h-screen bg-mesh-light relative">
      {/* ── Hero — full bleed, mesh gradient, animated blobs ── */}
      <section className="relative overflow-hidden bg-hero-gradient">
        {/* Soft grid */}
        <div className="absolute inset-0 bg-grid-dark opacity-50 pointer-events-none" />

        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[36rem] h-[36rem] bg-accent-500/25 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[34rem] h-[34rem] bg-primary-500/30 rounded-full blur-3xl animate-blob-slow" />
          <div className="absolute top-[30%] left-[40%] w-72 h-72 bg-fuchsia-500/15 rounded-full blur-3xl animate-blob" />
        </div>

        {/* Floating sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/60 animate-float"
              style={{
                top: `${(i * 13 + 8) % 92}%`,
                left: `${(i * 21 + 12) % 95}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${5 + (i % 4)}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-[0.18em] animate-fade-up">
                <span className="relative flex items-center justify-center w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-accent-400 animate-ping" />
                  <span className="relative w-2 h-2 rounded-full bg-accent-400" />
                </span>
                <Sparkles size={12} className="text-accent-300" />
                Premium · Hand-picked Deals
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6 animate-fade-up delay-100">
                Style that <br />
                <span className="text-shimmer glow-text-gold">commands</span> <br />
                attention.
              </h1>

              <p className="text-primary-100/80 text-base sm:text-lg mb-8 max-w-lg leading-relaxed animate-fade-up delay-200">
                Premium watches & eyewear, hand-picked at unbeatable prices.
                Authentic brands. Lightning-fast delivery. Zero compromises.
              </p>

              <div className="flex flex-wrap gap-3 animate-fade-up delay-300">
                <Link
                  to="/products"
                  className="btn-shine group inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 via-amber-400 to-accent-500 hover:to-accent-400 text-navy-900 font-extrabold px-7 py-3.5 rounded-2xl text-sm sm:text-base transition-all hover:scale-[1.04] shadow-glow-gold animate-gradient"
                >
                  Shop All Deals <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/products?category=Watches"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl text-sm sm:text-base transition-all"
                >
                  <Watch size={16} /> Browse Watches
                </Link>
              </div>

              {/* Stat strip */}
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md animate-fade-up delay-500">
                {[
                  { num: `${totalProducts}+`, label: 'Premium Pieces' },
                  { num: `${avgRating}★`,     label: 'Avg. Rating'    },
                  { num: '24/7',              label: 'Support'        },
                ].map(s => (
                  <div key={s.label} className="text-white">
                    <div className="text-2xl sm:text-3xl font-display font-bold text-shimmer">{s.num}</div>
                    <div className="text-[11px] uppercase tracking-widest text-white/50 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual — floating product montage */}
            <div className="hidden lg:block relative h-[460px]">
              {/* Big glowing ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[420px] h-[420px] rounded-full border border-white/10 animate-spin-slow" />
                <div className="absolute w-[340px] h-[340px] rounded-full border border-accent-400/20" />
                <div className="absolute w-[260px] h-[260px] rounded-full bg-gradient-to-br from-accent-500/20 to-primary-500/10 blur-2xl" />
              </div>

              {/* Image cards */}
              {products.slice(0, 4).map((p, i) => {
                const positions = [
                  { top: '6%',  left: '20%', rotate: '-6deg', delay: 0   },
                  { top: '12%', right: '8%', rotate: '5deg',  delay: 0.4 },
                  { bottom: '10%', left: '6%',  rotate: '8deg',  delay: 0.8 },
                  { bottom: '4%',  right: '18%', rotate: '-4deg', delay: 1.2 },
                ];
                const pos = positions[i];
                return (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    style={{ ...pos, transform: `rotate(${pos.rotate})`, animationDelay: `${pos.delay}s` }}
                    className="absolute w-44 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-2xl hover:scale-110 transition-transform animate-float"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[11px] font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                    <p className="text-sm font-black text-primary-700">{formatPrice(p.price)}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg className="absolute bottom-0 left-0 w-full h-12 sm:h-16 fill-[#f6f7fb]" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0 40 C 240 80 480 0 720 30 C 960 60 1200 10 1440 40 L 1440 80 L 0 80 Z" />
        </svg>
      </section>

      {/* ── Brand ticker ── */}
      <section className="bg-white border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { Icon: ShieldCheck, title: '100% Authentic', sub: 'Genuine brands only', color: 'from-emerald-500 to-teal-500' },
              { Icon: Truck,       title: 'Free Shipping',  sub: 'On orders ₹1000+',    color: 'from-blue-500 to-indigo-500' },
              { Icon: BadgeCheck,  title: 'Easy Returns',   sub: '7-day no questions',  color: 'from-amber-500 to-orange-500' },
              { Icon: Headphones,  title: '24/7 Support',   sub: 'Always here for you', color: 'from-pink-500 to-fuchsia-500' },
            ].map(({ Icon, title, sub, color }) => (
              <div key={title} className="flex items-center gap-3 group cursor-default">
                <div className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-600 mb-2">Curated · Categories</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">Shop by category</h2>
          </div>
          <Link to="/products" className="hidden sm:flex text-primary-600 text-sm font-semibold hover:text-primary-700 items-center gap-1 group">
            View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {activeCategories.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No categories available</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {activeCategories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative rounded-3xl overflow-hidden p-5 sm:p-6 bg-white border border-gray-100 shadow-soft hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-500 ease-out-soft"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-accent-400/0 group-hover:from-primary-500/10 group-hover:to-accent-400/15 transition-all duration-500" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-tr from-primary-200/0 to-accent-200/0 group-hover:from-primary-200/40 group-hover:to-accent-200/40 blur-2xl transition-all duration-500" />

                <div className="relative flex flex-col items-start gap-3">
                  <div className="text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{cat.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{cat.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{countForCat(cat.name) || 0} items</p>
                  </div>
                  <ArrowRight size={14} className="absolute top-0 right-0 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
            <Link
              to="/products"
              className="group relative col-span-2 sm:col-span-1 rounded-3xl overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 hover:-translate-y-1.5 transition-all duration-500 shadow-glow-blue"
            >
              <div className="absolute inset-0 bg-grid-dark opacity-30 pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent-400/30 blur-2xl group-hover:bg-accent-400/50 transition-colors" />
              <div className="relative flex flex-col items-start gap-3 text-white">
                <Sparkles size={28} className="text-accent-300" />
                <div>
                  <p className="text-sm font-extrabold leading-tight">All Deals</p>
                  <p className="text-xs text-primary-100/80 mt-0.5">{products.length} items</p>
                </div>
                <ArrowRight size={14} className="absolute top-0 right-0 text-accent-300 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        )}
      </section>

      {/* ── Flash Sale ── */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="relative bg-gradient-to-br from-navy-950 via-primary-900 to-navy-900 rounded-4xl p-6 sm:p-10 overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
            <div className="absolute -right-32 -top-32 w-[28rem] h-[28rem] bg-accent-500/20 rounded-full blur-3xl animate-blob pointer-events-none" />
            <div className="absolute -left-32 -bottom-32 w-[28rem] h-[28rem] bg-fuchsia-500/15 rounded-full blur-3xl animate-blob-slow pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400 to-transparent" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-7">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent-500/40 blur-xl rounded-2xl" />
                  <div className="relative bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl p-3 shadow-glow-gold">
                    <Zap size={22} className="text-white" fill="white" />
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Flash Sale</h2>
                  <p className="text-white/60 text-xs sm:text-sm mt-0.5">Limited stock · Hurry before it's gone</p>
                </div>
              </div>
              <div className="flex items-end flex-col gap-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent-300 font-bold">Ends in</p>
                <CountdownTimer />
              </div>
            </div>

            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {saleProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group relative bg-white/95 backdrop-blur rounded-2xl overflow-hidden hover:shadow-glow-gold hover:-translate-y-1.5 transition-all duration-500"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50 relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-lg">
                      −{product.discount}%
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

      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-600 mb-2">Editor's Picks</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">Featured products</h2>
            </div>
            <Link to="/products" className="hidden sm:flex text-primary-600 text-sm font-semibold hover:text-primary-700 items-center gap-1 group">
              See All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Bestsellers ── */}
      {bestsellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600 mb-2 flex items-center gap-1.5">
                <Star size={12} className="fill-amber-500 text-amber-500" /> Customer Favourites
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">Bestsellers</h2>
            </div>
            <Link to="/products" className="hidden sm:flex text-primary-600 text-sm font-semibold hover:text-primary-700 items-center gap-1 group">
              View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {bestsellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 mb-2">Just Landed</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">New arrivals</h2>
            </div>
            <Link to="/products" className="hidden sm:flex text-primary-600 text-sm font-semibold hover:text-primary-700 items-center gap-1 group">
              View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Newsletter / CTA banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-700 via-primary-800 to-navy-900 px-6 sm:px-12 py-12 sm:py-16 text-center border border-white/10">
          <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-accent-500/20 blur-3xl animate-blob pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-fuchsia-500/15 blur-3xl animate-blob-slow pointer-events-none" />
          <div className="relative max-w-2xl mx-auto">
            <Glasses className="mx-auto text-accent-300 mb-4 animate-float" size={36} />
            <h3 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              Get <span className="text-shimmer">10% off</span> your first order
            </h3>
            <p className="text-primary-100/80 text-sm sm:text-base mb-6">
              Join the VexDeals club for exclusive drops, early access, and members-only pricing.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 placeholder:text-white/40 text-white px-5 py-3.5 rounded-2xl text-sm outline-none focus:border-accent-400 focus:bg-white/15 transition"
              />
              <button
                type="submit"
                className="btn-shine bg-gradient-to-r from-accent-500 to-amber-400 text-navy-900 font-extrabold px-6 py-3.5 rounded-2xl text-sm shadow-glow-gold hover:scale-[1.03] transition-transform"
              >
                Join the club
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
