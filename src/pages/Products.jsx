import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from 'lucide-react';
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
  // Build the categories list: ['All', ...active category names]
  const categories = ['All', ...activeCategories.map(c => c.name)];

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];

    if (category !== 'All') result = result.filter(p => p.category === category);
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
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
  }, [products, category, search, sort, maxPrice]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') params.delete('category');
    else params.set('category', cat);
    setSearchParams(params);
  };

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-[89px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-48 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 bg-white cursor-pointer"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* View mode */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 lg:hidden"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>

            <p className="text-sm text-gray-500 ml-auto hidden sm:block">
              <span className="font-semibold text-gray-800">{filtered.length}</span> products found
            </p>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block w-56 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
            <input
              type="range"
              min={0}
              max={200000}
              step={1000}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹0</span>
              <span className="font-semibold text-primary-600">{formatPrice(maxPrice)}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    category === cat ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Filter</h3>
            <div className="space-y-2">
              {[
                { label: 'New Arrivals', action: () => setSort('newest') },
                { label: 'Best Rated', action: () => setSort('rating') },
                { label: 'Biggest Discount', action: () => setSort('discount') },
              ].map(f => (
                <button
                  key={f.label}
                  onClick={f.action}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile filter panel */}
        {filterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
            <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Max Price</h4>
                  <input
                    type="range"
                    min={0}
                    max={200000}
                    step={1000}
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                  <p className="text-sm text-primary-600 font-semibold mt-1">Up to {formatPrice(maxPrice)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { handleCategoryChange(cat); setFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${category === cat ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products grid / list */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearch(''); setCategory('All'); setMaxPrice(200000); }}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filtered.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(product => (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
                  <img src={product.image} alt={product.name} className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-xl shrink-0 bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-primary-600 font-medium">{product.category}</span>
                    <h3 className="font-semibold text-gray-900 mt-0.5 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                        )}
                        {product.discount > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">-{product.discount}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
