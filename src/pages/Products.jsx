import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rating' },
  { value: 'discount', label: 'Best Discount' },
  { value: 'newest', label: 'New Arrivals' },
];

export default function Products() {
  const { activeCategories } = useCategories();
  const { products } = useProducts();
  const categories = ['All', ...activeCategories.map(c => c.name)];

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState('All');
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [filterOpen, setFilterOpen] = useState(false);

  // Brands available within the chosen category
  const availableBrands = useMemo(() => {
    const inCat = category === 'All' ? products : products.filter(p => p.category === category);
    return ['All', ...new Set(inCat.map(p => p.brand).filter(Boolean))];
  }, [products, category]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (brand !== 'All') result = result.filter(p => p.brand === brand);
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    result = result.filter(p => p.price <= maxPrice);

    switch (sort) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'discount': result.sort((a, b) => b.discount - a.discount); break;
      case 'newest': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return result;
  }, [products, category, brand, search, sort, maxPrice]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setBrand('All'); // brands differ per category
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') params.delete('category');
    else params.set('category', cat);
    setSearchParams(params);
  };

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  const inputCls = 'w-full pl-9 pr-4 py-2.5 text-sm border border-ink-900/15 rounded-xl bg-cream-50 outline-none focus:border-accent-500 transition-colors';

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Page title */}
      <div className="bg-cream-100 bg-mesh border-b border-ink-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="eyebrow mb-2">{category === 'All' ? 'The Collection' : category}</p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink-900">
            {category === 'All' ? 'Shop All' : category}
          </h1>
          <p className="text-ink-700/60 text-sm mt-3">{filtered.length} pieces</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-cream-50 border-b border-ink-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-48 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/50" />
              <input type="text" placeholder="Search products…" value={search}
                onChange={e => setSearch(e.target.value)} className={inputCls} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/50 hover:text-ink-900">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 text-sm border border-ink-900/15 rounded-xl bg-cream-50 outline-none focus:border-accent-500 cursor-pointer">
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/50 pointer-events-none" />
            </div>

            <button onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm border border-ink-900/15 bg-cream-50 hover:bg-cream-200 lg:hidden">
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 px-4 py-1.5 text-[13px] font-medium rounded-full transition-colors ${
                  category === cat ? 'bg-brand-gradient text-white shadow-glow' : 'bg-cream-100 text-ink-700 hover:bg-primary-50 hover:text-primary-600'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Brand filter — appears once brands exist in the chosen category */}
          {availableBrands.length > 1 && (
            <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="shrink-0 text-[11px] font-bold uppercase tracking-widest2 text-ink-700/50 mr-1">Brand</span>
              {availableBrands.map(b => (
                <button key={b} onClick={() => setBrand(b)}
                  className={`shrink-0 px-3.5 py-1 text-[12px] font-medium rounded-full border transition-colors ${
                    brand === b ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-700 border-ink-900/15 hover:border-primary-500 hover:text-primary-600'
                  }`}>
                  {b === 'All' ? 'All Brands' : b}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 space-y-8">
          <div>
            <h3 className="font-display text-lg text-ink-900 mb-4">Price</h3>
            <input type="range" min={0} max={200000} step={1000} value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-accent-500" />
            <div className="flex justify-between text-xs text-ink-700/60 mt-2">
              <span>₹0</span>
              <span className="font-semibold text-ink-900">{formatPrice(maxPrice)}</span>
            </div>
          </div>

          <div className="border-t border-ink-900/10 pt-6">
            <h3 className="font-display text-lg text-ink-900 mb-4">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button key={cat} onClick={() => handleCategoryChange(cat)}
                  className={`block w-full text-left py-1.5 text-sm transition-colors ${
                    category === cat ? 'text-accent-600 font-semibold' : 'text-ink-700 hover:text-ink-900'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile filter panel */}
        {filterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-ink-900/50">
            <div className="absolute right-0 top-0 h-full w-72 bg-cream-50 shadow-premium p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl text-ink-900">Filters</h3>
                <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-ink-900 mb-3">Max Price</h4>
                  <input type="range" min={0} max={200000} step={1000} value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-accent-500" />
                  <p className="text-sm text-ink-900 font-semibold mt-1">Up to {formatPrice(maxPrice)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-ink-900 mb-3">Categories</h4>
                  <div className="space-y-1">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => { handleCategoryChange(cat); setFilterOpen(false); }}
                        className={`block w-full text-left py-1.5 text-sm ${category === cat ? 'text-accent-600 font-semibold' : 'text-ink-700'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <h3 className="font-display text-2xl text-ink-900 mb-2">Nothing here yet</h3>
              <p className="text-ink-700/60 mb-7">Try adjusting your search or filters.</p>
              <button onClick={() => { setSearch(''); setBrand('All'); setMaxPrice(200000); setSort('featured'); handleCategoryChange('All'); }}
                className="btn-ink text-xs uppercase tracking-widest2">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
              {filtered.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
