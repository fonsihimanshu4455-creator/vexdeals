import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const { visibleProducts: products } = useProducts();
  const { ids } = useWishlist();
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Heart size={22} className="text-accent-500 fill-accent-500" />
          <h1 className="font-display text-3xl font-bold text-ink-900">My Wishlist</h1>
          <span className="text-ink-700/50 text-sm">({items.length})</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-display text-2xl text-ink-900 mb-2">Your wishlist is empty</h3>
            <p className="text-ink-700/60 mb-7">Tap the ♡ on any product to save it here.</p>
            <Link to="/products" className="btn-grad text-sm">Browse products <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
