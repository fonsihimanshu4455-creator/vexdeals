import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Zap, Star, ShieldCheck, Headphones, Sparkles,
  Truck, BadgeCheck, Watch, Glasses, Quote, ChevronRight, PlayCircle,
  Award, ThumbsUp, Heart,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Marquee from '../components/Marquee';
import CountUp from '../components/CountUp';
import BrandLogo from '../components/BrandLogo';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';
import { useBrands } from '../context/BrandContext';
import { useTestimonials } from '../context/TestimonialContext';

/* ───── Countdown for Flash Sale ───── */
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
    <div className="flex items-center gap-1.5">
      {[
        { val: time.h, label: 'HRS' },
        { val: time.m, label: 'MIN' },
        { val: time.s, label: 'SEC' },
      ].map(({ val, label }, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="relative flex flex-col items-center">
            <span className="bg-white/10 backdrop-blur-md text-white font-display font-bold text-xl sm:text-3xl px-3 sm:px-4 py-2 rounded-2xl min-w-[52px] sm:min-w-[68px] text-center border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,.15)]">
              {pad(val)}
            </span>
            <span className="text-[8px] tracking-[0.25em] text-white/60 font-bold mt-1">{label}</span>
          </span>
          {i < 2 && <span className="text-accent-300 font-bold text-2xl mb-3.5 animate-pulse">:</span>}
        </span>
      ))}
    </div>
  );
}

/* ───── Hero pointer-tracking spotlight ─ rAF-batched, fine-pointer only ───── */
function useMouseSpotlight() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine) and (hover: hover)').matches) return;
    const el = document.getElementById('hero-spotlight');
    if (!el) return;
    let raf = 0, lastX = 0, lastY = 0;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const x = ((lastX - r.left) / r.width)  * 100;
      const y = ((lastY - r.top)  / r.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    };
    const onMove = (e) => {
      lastX = e.clientX; lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      el.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

export default function Home() {
  const { activeCategories } = useCategories();
  const { products } = useProducts();
  const { activeBrands } = useBrands();
  const { activeTestimonials } = useTestimonials();
  useMouseSpotlight();

  const featuredProducts = products.filter(p => p.featured);
  const bestsellers      = products.filter(p => p.isBestseller).slice(0, 4);
  const newArrivals      = products.filter(p => p.isNew).slice(0, 4);
  const saleProducts     = products.filter(p => p.discount >= 20).slice(0, 4);

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const countForCat = (name) => products.filter(p => p.category === name).length;

  const totalProducts = products.length;
  const avgRating     = products.length
    ? (products.reduce((a, p) => a + p.rating, 0) / products.length).toFixed(1)
    : 4.8;

  // Hero featured product (rotates every 3.5s)
  const heroPicks = (products.filter(p => p.featured).length ? products.filter(p => p.featured) : products).slice(0, 4);
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (heroPicks.length < 2) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroPicks.length), 4200);
    return () => clearInterval(t);
  }, [heroPicks.length]);
  const heroPick = heroPicks[heroIdx] || heroPicks[0];

  // Bento layout — pick 6 products (2 large, 4 small)
  const bentoPicks = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-mesh-light">

      {/* ════════════════════════════════════════════════
          HERO — editorial, watermark, spotlight, rotating product
         ════════════════════════════════════════════════ */}
      <section
        id="hero-spotlight"
        className="spotlight relative overflow-hidden bg-hero-gradient"
      >
        <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />

        {/* animated blobs (reduced count, GPU-friendly) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[-5%] w-[36rem] h-[36rem] bg-accent-500/25 rounded-full blur-3xl animate-blob will-change-transform" />
          <div className="absolute bottom-[-20%] left-[-15%] w-[36rem] h-[36rem] bg-primary-500/30 rounded-full blur-3xl animate-blob-slow will-change-transform" />
        </div>

        {/* big watermark text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="watermark text-[28vw] sm:text-[22vw] lg:text-[18rem] leading-none">VEX</span>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left content (8 cols) */}
            <div className="lg:col-span-7 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-[0.2em] animate-fade-up">
                <span className="relative flex items-center justify-center w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                  <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                </span>
                <span>New Drops · Live now</span>
              </div>

              <h1 className="font-display text-[clamp(2.6rem,7vw,5.6rem)] font-bold text-white leading-[0.95] tracking-tight mt-5 mb-5 animate-fade-up delay-100">
                Style that <br />
                <span className="text-shimmer glow-text-gold">commands</span> <br />
                <span className="relative inline-block">
                  attention.
                  <svg className="absolute -bottom-3 left-0 w-full h-3 text-accent-400" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M2 8 Q 100 2 198 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="text-primary-100/80 text-base sm:text-lg mb-8 max-w-lg leading-relaxed animate-fade-up delay-200">
                Premium watches & eyewear, hand-picked at unbeatable prices. Authentic brands.
                Lightning-fast delivery. <span className="text-white">Zero compromises.</span>
              </p>

              <div className="flex flex-wrap gap-3 animate-fade-up delay-300">
                <Link
                  to="/products"
                  className="btn-shine group inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 via-amber-400 to-accent-500 hover:to-accent-400 text-navy-950 font-extrabold px-7 py-4 rounded-2xl text-sm sm:text-base transition-all hover:scale-[1.04] shadow-glow-gold animate-gradient"
                >
                  Shop the collection
                  <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <Link
                  to="/products?category=Watches"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold px-6 py-4 rounded-2xl text-sm sm:text-base transition-all"
                >
                  <PlayCircle size={16} className="text-accent-300" /> Watch the story
                </Link>
              </div>

              {/* Trust avatar row */}
              <div className="mt-10 flex items-center gap-4 animate-fade-up delay-500">
                <div className="flex -space-x-3">
                  {[
                    'https://i.pravatar.cc/64?img=12',
                    'https://i.pravatar.cc/64?img=32',
                    'https://i.pravatar.cc/64?img=47',
                    'https://i.pravatar.cc/64?img=23',
                  ].map((src, i) => (
                    <img key={i} src={src} alt="" loading="lazy" decoding="async" className="w-9 h-9 rounded-full ring-2 ring-navy-900 object-cover" />
                  ))}
                  <span className="w-9 h-9 rounded-full ring-2 ring-navy-900 bg-gradient-to-br from-accent-400 to-accent-600 text-navy-900 text-[10px] font-extrabold flex items-center justify-center">
                    +5K
                  </span>
                </div>
                <div className="text-white">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-accent-400 text-accent-400" />
                    ))}
                    <span className="text-sm font-bold ml-1">{avgRating}</span>
                  </div>
                  <p className="text-xs text-white/60">trusted by 5,000+ customers</p>
                </div>
              </div>
            </div>

            {/* Right rotating product card */}
            <div className="hidden lg:block lg:col-span-5 relative h-[460px]">
              {/* concentric rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[420px] h-[420px] rounded-full border border-white/10 animate-spin-slow" />
                <div className="absolute w-[330px] h-[330px] rounded-full border border-accent-400/20" />
                <div className="absolute w-[240px] h-[240px] rounded-full bg-gradient-to-br from-accent-500/25 to-primary-500/15 blur-2xl" />
                {/* orbit dot */}
                <span className="absolute w-3 h-3 rounded-full bg-accent-400 shadow-glow-gold animate-orbit" />
              </div>

              {/* main rotating product card */}
              {heroPick && (
                <Link
                  to={`/products/${heroPick.id}`}
                  key={heroPick.id}
                  className="group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 animate-scale-in"
                >
                  <div className="relative bg-white rounded-3xl p-4 shadow-2xl ring-1 ring-white/40 hover:scale-105 transition-transform duration-500">
                    <div className="absolute -inset-1 bg-gradient-to-br from-accent-400/40 via-primary-500/30 to-fuchsia-500/30 rounded-3xl blur-xl opacity-70 -z-10" />
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                      <img src={heroPick.image} alt={heroPick.name} loading="eager" fetchpriority="high" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {heroPick.brand && (
                        <div className="absolute bottom-2 left-2">
                          <BrandLogo brand={heroPick.brand} size="sm" variant="chip" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600">{heroPick.category}</p>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{heroPick.name}</p>
                      </div>
                      <p className="font-display text-lg font-bold text-gray-900 shrink-0">{formatPrice(heroPick.price)}</p>
                    </div>
                  </div>
                </Link>
              )}

              {/* corner cards */}
              {products.slice(1, 3).map((p, i) => {
                const pos = i === 0
                  ? { top: '4%',    left: '0%' }
                  : { bottom: '4%', right: '0%' };
                return (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    style={pos}
                    className="absolute w-32 bg-white rounded-2xl p-2 shadow-xl hover:scale-110 transition-transform animate-float"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
                      <img src={p.image} alt={p.name} loading="eager" decoding="async" className="w-full h-full object-cover" />
                      {p.brand && (
                        <div className="absolute top-1 left-1">
                          <BrandLogo brand={p.brand} size="xs" variant="logo" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-primary-700 mt-1.5">{formatPrice(p.price)}</p>
                  </Link>
                );
              })}

              {/* floating stat badges */}
              <div className="absolute top-4 right-2 bg-white/95 backdrop-blur rounded-2xl px-3 py-2 shadow-xl ring-1 ring-black/5 flex items-center gap-2 animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <ThumbsUp size={13} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Reviews</p>
                  <p className="text-sm font-bold text-gray-900 leading-none">5,200+</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* wave divider */}
        <svg className="absolute bottom-0 left-0 w-full h-12 sm:h-16 fill-[#f6f7fb]" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0 40 C 240 80 480 0 720 30 C 960 60 1200 10 1440 40 L 1440 80 L 0 80 Z" />
        </svg>
      </section>

      {/* ════════════════════════════════════════════════
          BRAND/VALUE MARQUEE  —  bold ticker
         ════════════════════════════════════════════════ */}
      <section className="relative bg-navy-950 border-y border-white/5 overflow-hidden">
        <Marquee className="py-5">
          {[
            'AUTHENTIC',
            'PREMIUM',
            'CRAFTED',
            'TIMELESS',
            'BOLD',
            'ICONIC',
            'CURATED',
            'EXCLUSIVE',
          ].map((word, i) => (
            <span key={i} className="flex items-center gap-12 shrink-0">
              <span className="font-display text-3xl sm:text-5xl font-bold text-white/90 tracking-tight">{word}</span>
              <Sparkles size={20} className="text-accent-400" />
            </span>
          ))}
        </Marquee>
        <Marquee className="py-3 border-t border-white/5" direction="right" speed="slow">
          {['WATCHES', 'SUNGLASSES', 'EYEGLASSES', 'CHRONOGRAPH', 'AVIATOR', 'POLARIZED', 'TITANIUM', 'CLASSIC'].map((word, i) => (
            <span key={i} className="flex items-center gap-8 shrink-0 text-white/40">
              <span className="font-display text-base sm:text-lg font-medium tracking-[0.4em]">{word}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500/70" />
            </span>
          ))}
        </Marquee>
      </section>

      {/* ════════════════════════════════════════════════
          BRAND STRIP — official logos of brands we carry
         ════════════════════════════════════════════════ */}
      {activeBrands.length > 0 && (
        <section className="cv-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-2">Trusted brands</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              The names you <span className="text-gradient-blue">trust</span>.
            </h2>
          </div>
          <Marquee className="py-2 mask-fade-x">
            {activeBrands.map((b) => (
              <Link
                key={b.id}
                to={`/products?brand=${encodeURIComponent(b.slug)}`}
                className="group inline-flex items-center gap-3 shrink-0 bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
              >
                <BrandLogo brandObj={b} size="md" variant="logo" />
                <span className="font-display text-base font-bold text-gray-700 group-hover:text-primary-700 transition-colors whitespace-nowrap">
                  {b.name}
                </span>
              </Link>
            ))}
          </Marquee>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          BENTO GRID  —  signature category showcase
         ════════════════════════════════════════════════ */}
      {bentoPicks.length >= 6 && (
        <section className="cv-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-2">Signature Picks</p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05] tracking-tight">
                Crafted to <span className="text-gradient-blue">stand out</span>.
              </h2>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1 text-primary-700 font-bold text-sm group">
              Explore all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-12 gap-4 sm:gap-5 auto-rows-[140px] sm:auto-rows-[180px]">
            {/* big tile (col 1-7, row 1-2) */}
            <Link
              to={`/products/${bentoPicks[0].id}`}
              className="col-span-12 lg:col-span-7 row-span-2 group relative rounded-4xl overflow-hidden bg-navy-950 hover-lift"
            >
              <img src={bentoPicks[0].image} alt={bentoPicks[0].name} loading="lazy" decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-tr from-navy-950/85 via-navy-950/40 to-transparent" />
              <div className="absolute inset-0 bg-grid-dark opacity-30 mix-blend-overlay" />
              {bentoPicks[0].brand && (
                <div className="absolute top-4 right-4 z-[1]">
                  <BrandLogo brand={bentoPicks[0].brand} size="md" variant="chip" />
                </div>
              )}
              <div className="relative h-full flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="inline-flex w-fit items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.3em] bg-white/10 backdrop-blur border border-white/20 rounded-full px-3 py-1 mb-3">
                  <Award size={11} className="text-accent-300" /> Hero piece
                </span>
                <h3 className="font-display text-3xl sm:text-5xl font-bold leading-[1.05] mb-2">{bentoPicks[0].name}</h3>
                <p className="text-white/70 max-w-md text-sm sm:text-base mb-4 line-clamp-2">{bentoPicks[0].description}</p>
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl sm:text-3xl font-bold">{formatPrice(bentoPicks[0].price)}</span>
                  {bentoPicks[0].discount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full">−{bentoPicks[0].discount}%</span>
                  )}
                  <ArrowUpRight size={22} className="ml-auto group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* tile 2 (col 8-12, row 1) */}
            <Link
              to={`/products/${bentoPicks[1].id}`}
              className="col-span-7 lg:col-span-5 row-span-1 group relative rounded-4xl overflow-hidden bg-gradient-to-br from-accent-500 to-amber-400 hover-lift"
            >
              <img src={bentoPicks[1].image} alt={bentoPicks[1].name} loading="lazy" decoding="async"
                className="absolute right-0 inset-y-0 h-full w-3/5 object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-500/70 to-transparent" />
              {bentoPicks[1].brand && (
                <div className="absolute top-3 right-3 z-[1]">
                  <BrandLogo brand={bentoPicks[1].brand} size="sm" variant="chip" />
                </div>
              )}
              <div className="relative h-full flex flex-col justify-center p-5 sm:p-6 text-navy-950 max-w-[55%]">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] mb-1">Top pick</p>
                <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight line-clamp-2">{bentoPicks[1].name}</h3>
                <p className="font-display text-xl font-bold mt-2">{formatPrice(bentoPicks[1].price)}</p>
                <ArrowRight size={18} className="mt-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* tile 3 (col 8-9, row 1) */}
            <Link
              to={`/products/${bentoPicks[2].id}`}
              className="col-span-5 lg:col-span-2 row-span-1 group relative rounded-4xl overflow-hidden bg-white border border-gray-100 hover-lift"
            >
              <img src={bentoPicks[2].image} alt={bentoPicks[2].name} loading="lazy" decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
              {bentoPicks[2].brand && (
                <div className="absolute top-2 left-2 z-[1]">
                  <BrandLogo brand={bentoPicks[2].brand} size="xs" variant="logo" />
                </div>
              )}
              <div className="relative h-full flex flex-col justify-end p-3">
                <p className="text-[10px] font-bold text-primary-700 uppercase tracking-widest">{bentoPicks[2].category}</p>
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{bentoPicks[2].name}</p>
              </div>
            </Link>

            {/* tile 4 + 5 + 6 — bottom right row */}
            {bentoPicks.slice(3, 6).map(p => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="col-span-4 lg:col-span-2 row-span-1 group relative rounded-3xl overflow-hidden bg-white ring-1 ring-gray-100 hover-lift"
              >
                <img src={p.image} alt={p.name} loading="lazy" decoding="async"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {p.brand && (
                  <div className="absolute top-2 left-2 z-[1]">
                    <BrandLogo brand={p.brand} size="xs" variant="logo" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-xs font-bold text-white line-clamp-1">{p.name}</p>
                  <p className="text-xs font-extrabold text-accent-300">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          STAT COUNTERS  —  big animated numbers
         ════════════════════════════════════════════════ */}
      <section className="cv-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="relative bg-white rounded-4xl border border-gray-100 shadow-card overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-100 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent-100 rounded-full blur-3xl" />
          </div>

          <div className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {[
              { num: totalProducts,   suffix: '+',  label: 'Premium pieces',   Icon: Award      },
              { num: 5000,            suffix: '+',  label: 'Happy customers',  Icon: ThumbsUp   },
              { num: Number(avgRating), suffix: '/5', label: 'Average rating',   Icon: Star, decimals: 1 },
              { num: 24,              suffix: '/7', label: 'Customer support', Icon: Headphones },
            ].map(({ num, suffix, label, Icon, decimals }) => (
              <div key={label} className="p-6 sm:p-8 text-center">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-500 text-white mb-3 shadow-glow-blue">
                  <Icon size={18} />
                </div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-none tracking-tight">
                  <CountUp to={num} suffix={suffix} decimals={decimals || 0} />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mt-3">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SHOP BY CATEGORY  —  bold pill cards
         ════════════════════════════════════════════════ */}
      {activeCategories.length > 0 && (
        <section className="cv-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-2">Curated · Categories</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">Shop by category</h2>
            </div>
            <Link to="/products" className="hidden sm:flex text-primary-700 text-sm font-bold hover:text-primary-800 items-center gap-1 group">
              View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {activeCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative rounded-3xl overflow-hidden p-5 sm:p-6 bg-white border border-gray-100 shadow-soft hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-500 ease-out-soft"
              >
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
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent-400/30 blur-2xl group-hover:bg-accent-400/60 transition-colors" />
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
        </section>
      )}

      {/* ════════════════════════════════════════════════
          FLASH SALE
         ════════════════════════════════════════════════ */}
      {saleProducts.length > 0 && (
        <section className="cv-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="relative bg-gradient-to-br from-navy-950 via-primary-900 to-navy-900 rounded-4xl p-6 sm:p-10 overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
            <div className="absolute -right-32 -top-32 w-[28rem] h-[28rem] bg-accent-500/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute -left-32 -bottom-32 w-[28rem] h-[28rem] bg-fuchsia-500/15 rounded-full blur-3xl animate-blob-slow" />
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
                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">Flash Sale</h2>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">Limited stock · Hurry before it's gone</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
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
                    <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-lg">
                      −{product.discount}%
                    </span>
                    {product.brand && (
                      <div className="absolute bottom-2 left-2">
                        <BrandLogo brand={product.brand} size="xs" variant="chip" />
                      </div>
                    )}
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

      {/* ════════════════════════════════════════════════
          FEATURED  —  carousel grid
         ════════════════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="cv-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-2">Editor's picks</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">Featured products</h2>
            </div>
            <Link to="/products" className="hidden sm:flex text-primary-700 text-sm font-bold items-center gap-1 group">
              See all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          TESTIMONIALS
         ════════════════════════════════════════════════ */}
      <section className="cv-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-2">Loved by thousands</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Real <span className="text-gradient-gold">stories</span>, real style.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {activeTestimonials.length === 0 && (
            <p className="md:col-span-3 text-center text-gray-400 text-sm">No testimonials yet.</p>
          )}
          {activeTestimonials.slice(0, 6).map((t, i) => (
            <div
              key={t.id}
              className="group relative bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-soft hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary-500/0 via-accent-400/0 to-fuchsia-500/0 group-hover:from-primary-500/10 group-hover:via-accent-400/10 group-hover:to-fuchsia-500/10 blur-xl transition-all" />
              <div className="relative">
                <Quote size={28} className="text-accent-400 mb-3" />
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, k) => (
                    <Star key={k} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <img src={t.avatar} alt={t.name} loading="lazy" decoding="async" className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-100" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                      <BadgeCheck size={11} className="text-emerald-500" /> {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          NEW ARRIVALS + BESTSELLERS  —  side-by-side
         ════════════════════════════════════════════════ */}
      {(newArrivals.length > 0 || bestsellers.length > 0) && (
        <section className="cv-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {bestsellers.length > 0 && (
              <div className="xl:col-span-12">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 mb-2 flex items-center gap-1.5">
                      <Star size={12} className="fill-amber-500 text-amber-500" /> Customer Favourites
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">Bestsellers</h2>
                  </div>
                  <Link to="/products" className="text-primary-700 text-sm font-bold flex items-center gap-1 group">
                    View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {bestsellers.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
              </div>
            )}

            {newArrivals.length > 0 && (
              <div className="xl:col-span-12 mt-6">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600 mb-2">Just landed</p>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">New arrivals</h2>
                  </div>
                  <Link to="/products" className="text-primary-700 text-sm font-bold flex items-center gap-1 group">
                    View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {newArrivals.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          MEGA CTA  —  newsletter
         ════════════════════════════════════════════════ */}
      <section className="cv-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-primary-700 via-primary-800 to-navy-950 px-6 sm:px-12 py-14 sm:py-20 border border-white/10">
          <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-accent-500/25 blur-3xl animate-blob" />
          <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-fuchsia-500/15 blur-3xl animate-blob-slow" />

          {/* watermark */}
          <span className="watermark absolute inset-x-0 bottom-0 text-center text-[24vw] sm:text-[16rem] leading-none pointer-events-none select-none">
            JOIN
          </span>

          <div className="relative max-w-2xl mx-auto text-center">
            <Heart className="mx-auto text-accent-300 mb-4 animate-float" size={36} />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-300 mb-3">VexDeals Club</p>
            <h3 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.05] mb-4">
              Get <span className="text-shimmer">10% off</span> <br className="sm:hidden" />
              your first order.
            </h3>
            <p className="text-primary-100/80 text-sm sm:text-base mb-8">
              Members get exclusive drops, early access, and pricing the public never sees.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 placeholder:text-white/40 text-white px-5 py-4 rounded-2xl text-sm outline-none focus:border-accent-400 focus:bg-white/15 transition"
              />
              <button
                type="submit"
                className="btn-shine bg-gradient-to-r from-accent-500 to-amber-400 text-navy-950 font-extrabold px-7 py-4 rounded-2xl text-sm shadow-glow-gold hover:scale-[1.03] transition-transform"
              >
                Join the club
              </button>
            </form>
            <p className="text-[10px] text-white/40 mt-4 uppercase tracking-widest">
              No spam · Unsubscribe anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
