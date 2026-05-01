import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Zap, BadgeCheck, ArrowUpRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const cardRef  = useRef(null);
  const rafRef   = useRef(0);
  const [tilt, setTilt] = useState(false);

  // Only enable expensive 3D tilt on devices with a fine pointer (mouse).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)');
    setTilt(mq.matches);
    const onChange = (e) => setTilt(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const addToCart = (e) => {
    e.preventDefault();
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  // rAF-batched pointer handler: keeps it to one DOM write per frame.
  const onMouseMove = (e) => {
    if (!tilt) return;
    const el = cardRef.current;
    if (!el) return;
    const cx = e.clientX;
    const cy = e.clientY;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const r  = el.getBoundingClientRect();
      const px = (cx - r.left) / r.width;
      const py = (cy - r.top)  / r.height;
      el.style.setProperty('--rx', `${(py - 0.5) * -6}deg`);
      el.style.setProperty('--ry', `${(px - 0.5) *  8}deg`);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
  };
  const onMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const savings = product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0;

  return (
    <Link
      ref={cardRef}
      to={`/products/${product.id}`}
      onMouseMove={tilt ? onMouseMove : undefined}
      onMouseLeave={tilt ? onMouseLeave : undefined}
      style={tilt ? { transform: 'perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))' } : undefined}
      className="group relative flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden transition-[transform,box-shadow] duration-300 ease-out-soft hover:shadow-card-hover"
    >
      {/* Soft gradient halo on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-primary-500/0 via-accent-400/0 to-fuchsia-500/0 group-hover:from-primary-500/30 group-hover:via-accent-400/20 group-hover:to-fuchsia-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      {/* Image container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />

        {/* Inner spotlight overlay (uses --mx/--my from parent) */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
          style={{
            background: 'radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.45), transparent 60%)',
          }}
        />

        {/* Bottom darkening gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-glow-pink">
              −{product.discount}%
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-300 text-navy-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-glow-gold">
              <Zap size={9} fill="currentColor" /> TOP
            </span>
          )}
          {product.isNew && (
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-glow-emerald">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist + quick view (top right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={e => e.preventDefault()}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-soft flex items-center justify-center text-gray-400 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 hover:text-red-500 hover:bg-white hover:scale-110 transition-all duration-300"
            aria-label="Wishlist"
          >
            <Heart size={15} />
          </button>
          <span className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-soft flex items-center justify-center text-gray-500 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
            <ArrowUpRight size={15} />
          </span>
        </div>

        {/* Slide-up Add to Cart */}
        <div className="absolute inset-x-3 bottom-3 translate-y-[150%] group-hover:translate-y-0 transition-transform duration-500 ease-out-soft">
          <button
            onClick={addToCart}
            className="btn-shine w-full bg-gradient-to-r from-primary-700 to-primary-500 hover:from-primary-600 hover:to-primary-400 text-white py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-glow-blue"
          >
            <ShoppingCart size={15} /> Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="relative p-3.5 sm:p-4 flex flex-col gap-1.5 flex-1">
        <span className="text-[10px] sm:text-[11px] text-primary-700 font-bold bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full w-fit uppercase tracking-wider">
          {product.category}
        </span>

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="mt-auto pt-1 flex items-baseline gap-2 flex-wrap">
          <span className="text-lg sm:text-xl font-display font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {savings > 0 && (
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <BadgeCheck size={12} className="shrink-0" /> Save {formatPrice(savings)}
          </p>
        )}

        {product.stock > 0 && product.stock < 10 && (
          <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Only {product.stock} left!
          </p>
        )}
      </div>
    </Link>
  );
}
