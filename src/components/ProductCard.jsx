import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Plus, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { VexLogoMark } from './Logo';
import { trackAddToCart } from '../utils/pixel';
import { trackAddToCartHit } from '../utils/analytics';
import { affiliateStore } from '../lib/affiliate';

export default function ProductCard({ product, index = 0 }) {
  const { dispatch } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);

  const isAffiliate = Boolean(product.affiliateUrl);

  const addToCart = (e) => {
    e.preventDefault();
    if (isAffiliate) { window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer'); return; }
    dispatch({ type: 'ADD_ITEM', payload: product });
    trackAddToCart({ id: product.id, name: product.name, value: product.price, currency: 'INR', quantity: 1 });
    trackAddToCartHit(product.id, product.name);
  };

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const altImage = (product.images || []).find((src) => src && src !== product.image);
  // The second photo is only fetched after the first hover, so grids stay light.
  const [wantAlt, setWantAlt] = useState(false);
  const [altReady, setAltReady] = useState(false);

  // Gentle 3D tilt that follows the mouse (desktop pointers only).
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    if (altImage && !wantAlt) setWantAlt(true);
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div className="card-enter h-full card-3d-wrap" style={{ animationDelay: `${Math.min(index, 11) * 70}ms` }}>
    <Link
      to={`/products/${product.id}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="card-3d group relative h-full bg-white rounded-3xl border border-ink-900/5 shadow-soft hover:shadow-card-hover flex flex-col overflow-hidden"
    >
      <span aria-hidden className="card-glare" />
      {/* Image */}
      <div className="relative overflow-hidden rounded-3xl m-2 bg-white aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className={`img-fade w-full h-full object-contain p-2 transition-[transform,opacity] duration-700 ease-out group-hover:scale-105 ${altReady ? 'group-hover:!opacity-0' : ''}`}
          loading="lazy"
          decoding="async"
          onLoad={(e) => e.currentTarget.classList.add('loaded')}
          onError={(e) => e.currentTarget.classList.add('loaded')}
        />
        {wantAlt && (
          <img
            src={altImage}
            alt=""
            aria-hidden
            decoding="async"
            onLoad={() => setAltReady(true)}
            className={`absolute inset-0 w-full h-full object-contain p-2 opacity-0 scale-110 transition-[transform,opacity] duration-700 ease-out ${altReady ? 'group-hover:opacity-100 group-hover:scale-100' : ''}`}
          />
        )}
        <span aria-hidden className="card-shine" />

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <span className="bg-accent-500 text-ink-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {product.discount}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="bg-primary-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">New</span>
          )}
          {product.isBestseller && !product.isNew && (
            <span className="bg-ink-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">★ Top</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product.id); }}
          aria-label="Add to wishlist"
          className={`absolute top-3 right-3 w-9 h-9 glass rounded-full flex items-center justify-center transition-all duration-300 ${
            wished ? 'opacity-100 text-red-500' : 'text-ink-700 opacity-0 group-hover:opacity-100 hover:text-red-500'
          }`}
        >
          <Heart size={15} className={wished ? 'fill-red-500' : ''} />
        </button>

        {/* Brand watermark */}
        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 bg-white/75 backdrop-blur-sm rounded-full pl-1 pr-2 py-0.5 shadow-sm pointer-events-none">
          <VexLogoMark size={14} />
          <span className="text-[9px] font-bold text-ink-900 tracking-tight">VexDeals</span>
        </div>

        {/* Quick add */}
        <button
          onClick={addToCart}
          className="absolute bottom-3 right-3 w-11 h-11 bg-ink-900 text-white rounded-full flex items-center justify-center shadow-lg translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-primary-600 transition-all duration-300"
          aria-label={isAffiliate ? `Buy on ${affiliateStore(product.affiliateUrl)}` : 'Add to cart'}
        >
          {isAffiliate ? <ExternalLink size={18} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 pt-1 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-primary-600">{product.category}</span>
          <div className="flex items-center gap-1 text-ink-700/60">
            <Star size={12} className="fill-accent-500 text-accent-500" />
            <span className="text-[11px]">{Number(product.rating).toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-display font-medium text-[15px] leading-snug text-ink-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-ink-900">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-ink-700/40 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {isAffiliate ? (
          <p className="text-[11px] font-bold text-primary-600 flex items-center gap-1">Buy on {affiliateStore(product.affiliateUrl)} <ExternalLink size={11} /></p>
        ) : product.stock > 0 && product.stock < 10 && (
          <p className="text-[11px] font-medium text-accent-600">Only {product.stock} left</p>
        )}
      </div>
    </Link>
    </div>
  );
}
