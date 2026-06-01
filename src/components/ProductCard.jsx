import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Zap, BadgeCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { dispatch } = useCart();

  const addToCart = (e) => {
    e.preventDefault();
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const savings = product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-soft hover:border-accent-200 hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          style={{ '--tw-scale-x': 'var(--scale, 1)', '--tw-scale-y': 'var(--scale, 1)' }}
          loading="lazy"
        />

        {/* Badge stack — top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-red-500/30">
              -{product.discount}%
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm shadow-amber-500/30">
              <Zap size={9} fill="white" /> TOP PICK
            </span>
          )}
          {product.isNew && (
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-emerald-500/20">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist — top right, subtle until hover */}
        <button
          onClick={e => e.preventDefault()}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-white hover:scale-110 transition-all duration-200"
        >
          <Heart size={14} />
        </button>

        {/* Slide-up Add to Cart */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={addToCart}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingCart size={15} /> Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col gap-1.5 flex-1">
        {/* Category pill */}
        <span className="text-[10px] sm:text-xs text-primary-600 font-semibold bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full w-fit">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>

        {/* Price row */}
        <div className="mt-auto pt-1 flex items-baseline gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-black text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Savings pill */}
        {savings > 0 && (
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <BadgeCheck size={12} className="shrink-0" /> Save {formatPrice(savings)}
          </p>
        )}

        {/* Low stock */}
        {product.stock > 0 && product.stock < 10 && (
          <p className="text-[11px] text-red-500 font-semibold">Only {product.stock} left!</p>
        )}
      </div>
    </Link>
  );
}
