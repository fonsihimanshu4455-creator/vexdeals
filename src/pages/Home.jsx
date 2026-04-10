import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, Shield, Headphones, ChevronLeft, ChevronRight, Zap, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const slides = [
  {
    id: 1,
    title: 'Best Deals on Electronics',
    subtitle: 'Up to 40% OFF on top brands',
    bg: 'from-primary-700 to-primary-500',
    cta: 'Shop Electronics',
    link: '/products?category=Electronics',
    img: 'https://picsum.photos/seed/heroelectronics/700/500',
  },
  {
    id: 2,
    title: 'Fashion Sale is Live!',
    subtitle: 'Trending styles at unbeatable prices',
    bg: 'from-pink-700 to-rose-500',
    cta: 'Explore Fashion',
    link: '/products?category=Fashion',
    img: 'https://picsum.photos/seed/herofashion/700/500',
  },
  {
    id: 3,
    title: 'Home & Living Essentials',
    subtitle: 'Make your home smarter & cozier',
    bg: 'from-emerald-700 to-teal-500',
    cta: 'Shop Now',
    link: '/products?category=Home+%26+Living',
    img: 'https://picsum.photos/seed/herohome/700/500',
  },
];

const categoryCards = [
  { name: 'Electronics', icon: '💻', color: 'bg-blue-50 hover:bg-blue-100', link: '/products?category=Electronics', count: 5 },
  { name: 'Fashion', icon: '👗', color: 'bg-pink-50 hover:bg-pink-100', link: '/products?category=Fashion', count: 3 },
  { name: 'Home & Living', icon: '🏠', color: 'bg-emerald-50 hover:bg-emerald-100', link: '/products?category=Home+%26+Living', count: 2 },
  { name: 'Sports', icon: '🏋️', color: 'bg-orange-50 hover:bg-orange-100', link: '/products?category=Sports', count: 2 },
  { name: 'Beauty', icon: '✨', color: 'bg-purple-50 hover:bg-purple-100', link: '/products?category=Beauty', count: 1 },
  { name: 'All Deals', icon: '⚡', color: 'bg-primary-50 hover:bg-primary-100', link: '/products', count: 12 },
];

const trustBadges = [
  { Icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹500' },
  { Icon: RotateCcw, title: 'Easy Returns', desc: '7-day hassle-free returns' },
  { Icon: Shield, title: '100% Secure', desc: 'Safe & encrypted payments' },
  { Icon: Headphones, title: '24/7 Support', desc: 'Round the clock assistance' },
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
          <span className="bg-white text-gray-900 font-bold text-lg sm:text-2xl px-3 py-1 rounded-lg min-w-[48px] text-center shadow">
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

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const featuredProducts = products.filter(p => p.featured);
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <section className="relative overflow-hidden">
        <div
          className={`bg-gradient-to-r ${slides[slide].bg} transition-all duration-700`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-white space-y-4">
                <p className="text-sm font-semibold uppercase tracking-widest opacity-80">VexDeals Special</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                  {slides[slide].title}
                </h1>
                <p className="text-lg sm:text-xl opacity-90">{slides[slide].subtitle}</p>
                <Link
                  to={slides[slide].link}
                  className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
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

        {/* Slider controls */}
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

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-white w-6' : 'bg-white/50'}`}
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

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categoryCards.map(cat => (
            <Link
              key={cat.name}
              to={cat.link}
              className={`${cat.color} rounded-2xl p-4 text-center transition-all hover:scale-105 hover:shadow-md`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="text-xs sm:text-sm font-semibold text-gray-800">{cat.name}</p>
              <p className="text-xs text-gray-500">{cat.count} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2">
                <Zap size={24} className="text-white" fill="white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">Flash Sale</h2>
                <p className="text-white/80 text-sm">Deals end soon!</p>
              </div>
            </div>
            <div className="text-white">
              <p className="text-xs uppercase tracking-widest mb-2 opacity-75">Ends in</p>
              <CountdownTimer />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
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
            <Star size={22} className="text-amber-400 fill-amber-400" />
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
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Get 10% Off Your First Order!</h2>
          <p className="text-white/80 mb-6 text-sm sm:text-base">
            Sign up and use code <span className="bg-white text-primary-600 font-bold px-2 py-0.5 rounded">VEXFIRST</span> at checkout
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Create Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
