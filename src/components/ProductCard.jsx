import { Link } from 'react-router-dom';
import { Star, Heart, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { VexLogoMark } from './Logo';
import { trackAddToCart } from '../utils/pixel';
import { trackAddToCartHit } from '../utils/analytics';

export default function ProductCard({ product, index = 0 }) {
  const { dispatch } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);

  const addToCart = (e) => {
    e.preventDefault();
    dispatch({ type: 'ADD_ITEM', payload: product });
    trackAddToCart({ id: product.id, name: product.name, value: product.price, currency: 'INR', quantity: 1 });
    trackAddToCartHit();
  };

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  return (
    <div className="card-enter h-full" style={{ animationDelay: `${Math.min(index, 11) * 60}ms` }}>
    <Link
      to={`/products/${product.id}`}
      className="group h-full bg-white rounded-3xl border border-ink-900/5 shadow-soft hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-3xl m-2 bg-white aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="img-fade w-full h-full object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onLoad={(e) => e.currentTarget.classList.add('loaded')}
          onError={(e) => e.currentTarget.classList.add('loaded')}
        />

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
          aria-label="Add to cart"
        >
          <Plus size={20} />
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

        {product.stock > 0 && product.stock < 10 && (
          <p className="text-[11px] font-medium text-accent-600">Only {product.stock} left</p>
        )}
      </div>
    </Link>
    </div>
  );
}
