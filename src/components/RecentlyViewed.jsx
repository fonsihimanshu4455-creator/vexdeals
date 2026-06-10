import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductContext';
import { getRecent } from '../lib/recentlyViewed';

export default function RecentlyViewed({ excludeId, limit = 4, title = 'Recently Viewed' }) {
  const { products } = useProducts();
  const ids = getRecent().filter((id) => id !== excludeId);
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-6">{title}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
