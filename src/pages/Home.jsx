import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';

const MARQUEE = ['Authenticated, always', 'Free shipping over ₹1000', '7-day easy returns', 'Secure payments', 'Hand-picked edits'];

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
    <div className="flex items-center gap-2 font-display">
      {[['Hrs', t.h], ['Min', t.m], ['Sec', t.s]].map(([lbl, v], i) => (
        <span key={lbl} className="flex items-end gap-2">
          <span className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-semibold text-cream-50 tabular-nums">{pad(v)}</span>
            <span className="text-[9px] uppercase tracking-widest2 text-cream-100/50 mt-0.5">{lbl}</span>
          </span>
          {i < 2 && <span className="text-2xl text-accent-400 pb-4">:</span>}
        </span>
      ))}
    </div>
  );
}

// Section heading
function Heading({ eyebrow, title, to, linkLabel = 'View all' }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-7">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2 className="font-display text-3xl sm:text-4xl text-ink-900">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="link-underline text-sm font-medium text-ink-800 hover:text-accent-600 flex items-center gap-1.5 shrink-0">
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
  const secondaryProduct = featuredProducts[1] || bestsellers[1] || products[1];

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const countForCat = (name) => products.filter(p => p.category === name).length;

  // Scroll reveal
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

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-cream-100 bg-paper-grain border-b border-ink-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2">
          {/* Copy */}
          <div className="py-14 lg:py-24 lg:pr-12 flex flex-col justify-center animate-fade-up">
            <p className="eyebrow mb-5">VexDeals — Est. 2026</p>
            <h1 className="font-display text-[2.7rem] xs:text-5xl lg:text-7xl leading-[1.02] text-ink-900">
              Time, refined.<br />
              Vision, <span className="italic text-accent-600">elevated.</span>
            </h1>
            <p className="mt-6 text-ink-700/80 text-base sm:text-lg max-w-md leading-relaxed">
              A considered edit of authentic watches &amp; eyewear — chosen for craft,
              priced with honesty. No noise. Just pieces worth keeping.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/products" className="btn-ink text-xs uppercase tracking-widest2">
                Shop the Edit <ArrowRight size={15} />
              </Link>
              <Link to="/about" className="btn-outline text-xs uppercase tracking-widest2">Our Story</Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            {heroProduct && (
              <Link to={`/products/${heroProduct.id}`} className="group block h-full">
                <div className="relative h-full min-h-[520px] overflow-hidden">
                  <img src={heroProduct.image} alt={heroProduct.name}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-transparent" />
                  <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between text-cream-50">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest2 text-cream-100/70">Featured</p>
                      <p className="font-display text-2xl mt-1 max-w-xs leading-tight">{heroProduct.name}</p>
                      <p className="mt-1 text-sm text-cream-100/90">{formatPrice(heroProduct.price)}</p>
                    </div>
                    <span className="w-12 h-12 rounded-full border border-cream-50/40 flex items-center justify-center group-hover:bg-cream-50 group-hover:text-ink-900 transition-colors">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-ink-900 py-3.5">
        <div className="flex w-max animate-marquee">
          {[0, 1].map(copy => (
            <div key={copy} className="flex items-center shrink-0">
              {MARQUEE.map((m, i) => (
                <span key={i} className="flex items-center text-cream-100/80 text-[11px] uppercase tracking-widest2 whitespace-nowrap">
                  <span className="px-7">{m}</span>
                  <span className="text-accent-500">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      {activeCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 reveal">
          <Heading eyebrow="Browse" title="The Departments" to="/products" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-l border-t border-ink-900/10">
            {activeCategories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative border-r border-b border-ink-900/10 p-6 sm:p-7 hover:bg-ink-900 transition-colors duration-300"
              >
                <span className="text-[11px] text-ink-700/40 group-hover:text-cream-100/40 tabular-nums">0{i + 1}</span>
                <div className="text-3xl mt-3 transition-transform duration-300 group-hover:scale-110">{cat.icon}</div>
                <h3 className="font-display text-xl mt-2 text-ink-900 group-hover:text-cream-50 transition-colors">{cat.name}</h3>
                <p className="text-xs text-ink-700/50 group-hover:text-cream-100/50 mt-1 transition-colors">
                  {countForCat(cat.name) || 0} pieces
                </p>
                <ArrowUpRight size={16} className="absolute top-6 right-6 text-ink-900/0 group-hover:text-accent-400 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Edit ────────────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 reveal">
          <Heading eyebrow="Curated" title="The Edit" to="/products" linkLabel="Shop all" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {featuredProducts.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Last Call (sale) ─────────────────────────────────────────────── */}
      {saleProducts.length > 0 && (
        <section className="bg-ink-900 bg-paper-grain reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-9">
              <div>
                <p className="eyebrow mb-2 text-accent-400">Limited time</p>
                <h2 className="font-display text-3xl sm:text-4xl text-cream-50">Last Call</h2>
                <p className="text-cream-100/60 text-sm mt-2">Final pieces at their best prices.</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest2 text-cream-100/50">Ends in</span>
                <Countdown />
              </div>
            </div>
            <div className="flex gap-5 overflow-x-auto scrollbar-none -mx-4 px-4 pb-2 snap-x">
              {saleProducts.map(p => (
                <Link key={p.id} to={`/products/${p.id}`} className="group shrink-0 w-44 sm:w-56 snap-start">
                  <div className="relative overflow-hidden bg-navy-800 aspect-[4/5]">
                    <img src={p.image} alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute top-3 left-3 bg-accent-500 text-cream-50 text-[10px] font-semibold uppercase tracking-widest2 px-2.5 py-1">
                      −{p.discount}%
                    </span>
                  </div>
                  <h3 className="font-display text-base text-cream-50 mt-3 line-clamp-1">{p.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-semibold text-cream-50">{formatPrice(p.price)}</span>
                    <span className="text-xs text-cream-100/40 line-through">{formatPrice(p.originalPrice)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Editorial statement ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center reveal">
        <p className="eyebrow mb-5">Why VexDeals</p>
        <p className="font-display text-2xl sm:text-4xl lg:text-[2.8rem] leading-[1.25] text-ink-900">
          “Every piece is <span className="italic text-accent-600">authenticated</span>.
          Every price is <span className="italic text-accent-600">honest</span>.
          We&apos;d rather curate ten things worth owning than list a thousand that aren&apos;t.”
        </p>
        <Link to="/about" className="btn-outline mt-9 text-xs uppercase tracking-widest2">
          Read our story <ArrowRight size={15} />
        </Link>
      </section>

      {/* ── Bestsellers ──────────────────────────────────────────────────── */}
      {bestsellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 reveal">
          <Heading eyebrow="Loved most" title="Bestsellers" to="/products" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {bestsellers.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── New Arrivals ─────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 reveal">
          <Heading eyebrow="Just in" title="New Arrivals" to="/products" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

    </div>
  );
}
