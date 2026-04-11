import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, Shield, Headphones, ChevronLeft, ChevronRight, Zap, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { useCategories } from '../context/CategoryContext';

const slides = [
  {
    id: 1,
    title: 'Premium Watches Collection',
    subtitle: 'Up to 40% OFF on luxury timepieces',
    bg: 'from-primary-900 to-primary-700',
    cta: 'Shop Watches',
    link: '/products?category=Watches',
    img: 'https://picsum.photos/seed/watchcollection/700/500',
    badge: 'New Season',
  },
  {
    id: 2,
    title: 'Designer Eyewear Sale',
    subtitle: 'Sunglasses & Frames starting ₹999',
    bg: 'from-navy-900 to-primary-800',
    cta: 'Explore Eyewear',
    link: '/products?category=Eyewear',
    img: 'https://picsum.photos/seed/eyewearsale/700/500',
    badge: 'Up to 50% Off',
  },
  {
    id: 3,
    title: 'VexDeals Flash Sale',
    subtitle: 'Exclusive deals on top brands',
    bg: 'from-primary-800 to-primary-600',
    cta: 'See All Deals',
    link: '/products',
    img: 'https://picsum.photos/seed/flashsale/700/500',
    badge: 'Limited Time',
  },
];

const trustBadges = [
  { Icon: Truck,       title: 'Free Delivery',  desc: 'On orders above ₹500'         },
  { Icon: RotateCcw,   title: 'Easy Returns',   desc: '7-day hassle-free returns'     },
  { Icon: Shield,      title: '100% Authentic', desc: 'Genuine premium products'      },
  { Icon: Headphones,  title: '24/7 Support',   desc: 'Round the clock assistance'    },
];

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
  const [slide, setSlide] = useState(0);
  const { activeCategories } = useCategories();

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const featuredProducts = products.filter(p => p.featured);
  const bestsellers      = products.filter(p => p.isBestseller).slice(0, 4);
  const newArrivals      = products.filter(p => p.isNew).slice(0, 4);

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  // Map category name → product count from data
  const countForCat = (name) => products.filter(p => p.category === name).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <section className="relative overflow-hidden">
        <div className={`bg-gradient-to-r ${slides[slide].bg} transition-all duration-700`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-white space-y-4">
                <span className="inline-block bg-accent-500 text-primary-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {slides[slide].badge}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                  {slides[slide].title}
                </h1>
                <p className="text-lg sm:text-xl text-white/85">{slides[slide].subtitle}</p>
                <Link
                  to={slides[slide].link}
                  className="inline-flex items-center gap-2 bg-accent-500 text-primary-900 font-bold px-6 py-3 rounded-xl hover:bg-accent-400 transition-colors shadow-lg"
                >
                  {slides[slide].cta} <ArrowRight size={18} />
                </Link>
              </div>
              <div className="flex-1 max-w-sm md:max-w-md">
                <img
                  src={slides[slide].img}
                  alt={slides[slide].title}
                  className="w-full rounded-2xl shadow-2xl object-cover aspect-video"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSlide(s => (s - 1 + slides.length) % slides.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setSlide(s => (s + 1) % slides.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors"
        >
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all ${i === slide ? 'bg-accent-400 w-6' : 'bg-white/50 w-2'}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadges.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
