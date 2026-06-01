import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { dispatch } = useCart();

  const addToCart = (e) => {
    e.preventDefault();
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  return (
    <Link to={`/products/${product.id}`} className="group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-cream-200 aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          loading="lazy"
        />

        {/* Corner tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <span className="bg-ink-900 text-cream-50 text-[10px] font-semibold tracking-widest2 uppercase px-2.5 py-1">
              −{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-accent-500 text-cream-50 text-[10px] font-semibold tracking-widest2 uppercase px-2.5 py-1">
              New
            </span>
          )}
          {product.isBestseller && !product.isNew && (
            <span className="bg-cream-50 text-ink-900 text-[10px] font-semibold tracking-widest2 uppercase px-2.5 py-1">
              Top Pick
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => e.preventDefault()}
          className="absolute top-3 right-3 w-9 h-9 bg-cream-50/90 backdrop-blur-sm flex items-center justify-center text-ink-700 opacity-0 group-hover:opacity-100 hover:text-accent-600 transition-all duration-300"
        >
          <Heart size={15} strokeWidth={1.5} />
        </button>

        {/* Add to cart bar */}
        <button
          onClick={addToCart}
          className="absolute bottom-0 left-0 right-0 bg-ink-900 text-cream-50 py-3 text-[11px] font-semibold uppercase tracking-widest2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hover:bg-accent-600"
        >
          Add to Cart
        </button>
      </div>

      {/* Info */}
      <div className="pt-3.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-widest2 text-ink-700/50">{product.category}</span>
          <div className="flex items-center gap-1 text-ink-700/60">
            <Star size={11} className="fill-accent-500 text-accent-500" />
            <span className="text-[11px]">{Number(product.rating).toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-display text-[15px] leading-snug text-ink-900 line-clamp-2 group-hover:text-accent-700 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-[15px] font-semibold text-ink-900">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-ink-700/40 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {product.stock > 0 && product.stock < 10 && (
          <p className="text-[11px] text-accent-600">Only {product.stock} left</p>
        )}
      </div>
    </Link>
  );
}
