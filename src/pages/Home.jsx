import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import MarketingPosters from '../components/MarketingPosters';
import InstagramReels from '../components/InstagramReels';
import { VexLogoMark } from '../components/Logo';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';

const MARQUEE = ['100% Authentic', 'Free Shipping ₹1000+', '7-Day Returns', 'Secure Payments', 'Hand-picked Edits'];

function Countdown() {
  const [t, setT] = useState({ h: 8, m: 24, s: 12 });
  useEffect(() => {
    const id = setInterval(() => {
      setT(p => {
        let { h, m, s } = p; s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 8; m = 24; s = 12; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-1.5">
      {[t.h, t.m, t.s].map((v, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="bg-white/15 backdrop-blur text-white font-bold text-lg sm:text-xl px-2.5 py-1.5 rounded-xl min-w-[44px] text-center tabular-nums">{pad(v)}</span>
          {i < 2 && <span className="text-white/60 font-bold">:</span>}
        </span>
      ))}
    </div>
  );
}

function Heading({ eyebrow, title, to, linkLabel = 'View all' }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-7">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-full transition-colors">
          {linkLabel} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { activeCategories } = useCategories();
  const { products } = useProducts();
  const containerRef = useRef(null);

  const featuredProducts = products.filter(p => p.featured);
  const bestsellers      = products.filter(p => p.isBestseller).slice(0, 8);
  const newArrivals      = products.filter(p => p.isNew).slice(0, 4);
  const saleProducts     = products.filter(p => p.discount >= 20).slice(0, 6);
  const heroProduct      = featuredProducts[0] || bestsellers[0] || products[0];

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const countForCat = (name) => products.filter(p => p.category === name).length;

  useEffect(() => {
    const els = containerRef.current?.querySelectorAll('.reveal') || [];
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [products.length, activeCategories.length]);

  return (
    <div ref={containerRef} className="bg-cream-100">

      {/* ── Instagram reels (top of page) ────────────────────────────────── */}
      <InstagramReels />

      {/* ── Marquee ──────────────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-ink-900 py-3.5">
        <div className="flex w-max animate-marquee">
          {[0, 1].map(copy => (
            <div key={copy} className="flex items-center shrink-0">
              {MARQUEE.map((m, i) => (
                <span key={i} className="flex items-center text-white/80 text-sm font-medium whitespace-nowrap">
                  <span className="px-6">{m}</span>
                  <Sparkles size={12} className="text-accent-400" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Marketing posters ────────────────────────────────────────────── */}
      <MarketingPosters />

      {/* ── Categories ───────────────────────────────────────────────────── */}
      {activeCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 reveal">
          <Heading eyebrow="Browse" title="Shop by Category" to="/products" />
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-5">
            {activeCategories.map(cat => (
              <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-2 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-brand-soft ring-1 ring-ink-900/5 flex items-center justify-center text-2xl sm:text-3xl group-hover:ring-2 group-hover:ring-primary-500 group-hover:-translate-y-1 transition-all duration-300">
                  {cat.image
                    ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    : cat.icon}
                </div>
                <p className="text-xs sm:text-sm font-medium text-ink-800 line-clamp-1 group-hover:text-primary-600 transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured ─────────────────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 reveal">
          <Heading eyebrow="Trending now" title="Featured Products" to="/products" linkLabel="Shop all" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Sale ─────────────────────────────────────────────────────────── */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 reveal">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink-900 bg-ink-mesh p-7 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
              <div>
                <span className="inline-flex items-center gap-2 glass-dark text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Sparkles size={13} /> Limited time
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3">Flash Sale</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest2 text-white/70">Ends in</span>
                <Countdown />
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1 snap-x">
              {saleProducts.map(p => (
                <Link key={p.id} to={`/products/${p.id}`} className="group shrink-0 w-40 sm:w-52 snap-start bg-white rounded-2xl overflow-hidden shadow-card">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute top-2.5 left-2.5 bg-ink-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">−{p.discount}%</span>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/75 backdrop-blur-sm rounded-full pl-1 pr-2 py-0.5 shadow-sm pointer-events-none">
                      <VexLogoMark size={13} />
                      <span className="text-[8px] font-bold text-ink-900 tracking-tight">VexDeals</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm text-ink-900 line-clamp-1">{p.name}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-ink-900">{formatPrice(p.price)}</span>
                      <span className="text-xs text-ink-700/40 line-through">{formatPrice(p.originalPrice)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trust strip ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 reveal">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { Icon: ShieldCheck, t: '100% Authentic', s: 'Verified genuine brands' },
            { Icon: Truck,       t: 'Fast Shipping',  s: 'Free over ₹1000' },
            { Icon: RefreshCw,   t: '7-Day Returns',  s: 'Easy & hassle-free' },
          ].map(({ Icon, t, s }) => (
            <div key={t} className="flex items-center gap-4 bg-white rounded-2xl border border-ink-900/5 shadow-soft p-5">
              <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
                <Icon size={22} className="text-primary-600" />
              </div>
              <div>
                <p className="font-display font-semibold text-ink-900">{t}</p>
                <p className="text-sm text-ink-700/50">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bestsellers ──────────────────────────────────────────────────── */}
      {bestsellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 reveal">
          <Heading eyebrow="Loved most" title="Bestsellers" to="/products" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestsellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── New Arrivals ─────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 reveal">
          <Heading eyebrow="Just dropped" title="New Arrivals" to="/products" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

    </div>
  );
}
