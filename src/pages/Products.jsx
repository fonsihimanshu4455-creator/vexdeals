import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import BrandLogo from '../components/BrandLogo';
import { useCategories } from '../context/CategoryContext';
import { useProducts } from '../context/ProductContext';
import { useBrands } from '../context/BrandContext';

const sortOptions = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price-low',  label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Best Rating' },
  { value: 'discount',   label: 'Best Discount' },
  { value: 'newest',     label: 'New Arrivals' },
];

export default function Products() {
  const { activeCategories } = useCategories();
  const { products } = useProducts();
  const { activeBrands, brandsForCategory } = useBrands();
  const categories = ['All', ...activeCategories.map(c => c.name)];

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch   = searchParams.get('search')   || '';
  const initialBrand    = searchParams.get('brand')    || 'All';

  const [search, setSearch]       = useState(initialSearch);
  const [category, setCategory]   = useState(initialCategory);
  const [brand, setBrand]         = useState(initialBrand);
  const [sort, setSort]           = useState('featured');
  const [maxPrice, setMaxPrice]   = useState(200000);
  const [viewMode, setViewMode]   = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);

  const visibleBrands = useMemo(() => {
    if (category === 'All') return activeBrands;
    return brandsForCategory(category);
  }, [activeBrands, category, brandsForCategory]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (brand !== 'All')    result = result.filter(p => (p.brand || '').toLowerCase() === brand.toLowerCase());
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    result = result.filter(p => p.price <= maxPrice);

    switch (sort) {
      case 'price-low':  result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
      case 'discount':   result.sort((a, b) => b.discount - a.discount); break;
      case 'newest':     result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default:           result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return result;
  }, [products, category, brand, search, sort, maxPrice]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setBrand('All');
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') params.delete('category');
    else params.set('category', cat);
    params.delete('brand');
    setSearchParams(params);
  };

  const handleBrandChange = (slug) => {
    setBrand(slug);
    const params = new URLSearchParams(searchParams);
    if (slug === 'All') params.delete('brand');
    else params.set('brand', slug);
    setSearchParams(params);
  };

  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-mesh-light">
      {/* ── Hero header ── */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-grid-dark opacity-50 pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-30%] left-[-10%] w-96 h-96 bg-primary-500/25 rounded-full blur-3xl animate-blob-slow" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 animate-fade-up">
            <Sparkles size={12} className="text-accent-300" /> Catalogue
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white animate-fade-up delay-100">
            {category === 'All' ? 'All Products' : category}
            <span className="text-shimmer">.</span>
          </h1>
          <p className="text-primary-100/70 mt-3 text-sm sm:text-base animate-fade-up delay-200">
            {filtered.length} hand-picked items · Authentic brands · Free shipping over ₹1000
          </p>
        </div>

        <svg className="absolute bottom-0 left-0 w-full h-10 fill-[#f6f7fb]" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0 30 C 240 60 480 0 720 20 C 960 40 1200 0 1440 30 L 1440 60 L 0 60 Z" />
        </svg>
      </section>

      {/* Sticky filter toolbar */}
      <div className="sticky top-[105px] sm:top-[112px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-48 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="appearance-none pl-3 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-primary-500 cursor-pointer font-medium"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-primary-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-primary-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>

            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50 lg:hidden font-medium"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>

            <p className="text-sm text-gray-500 ml-auto hidden sm:block">
              <span className="font-bold text-gray-900">{filtered.length}</span> products
            </p>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  category === cat
                    ? 'bg-gradient-to-r from-primary-700 to-primary-500 text-white shadow-glow-blue'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-60 shrink-0 space-y-5">
          <div className="bg-white rounded-3xl p-5 shadow-soft border border-gray-100">
            <h3 className="font-display font-bold text-gray-900 mb-3">Price Range</h3>
            <input
              type="range"
              min={0}
              max={200000}
              step={1000}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>₹0</span>
              <span className="font-bold text-primary-700">{formatPrice(maxPrice)}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-soft border border-gray-100">
            <h3 className="font-display font-bold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                    category === cat
                      ? 'bg-primary-50 text-primary-700 font-bold ring-1 ring-primary-100'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {visibleBrands.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-soft border border-gray-100">
              <h3 className="font-display font-bold text-gray-900 mb-3">Brands</h3>
              <div className="space-y-1 max-h-80 overflow-y-auto pr-1 -mr-1 scrollbar-none">
                <button
                  onClick={() => handleBrandChange('All')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                    brand === 'All'
                      ? 'bg-primary-50 text-primary-700 font-bold ring-1 ring-primary-100'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All brands
                </button>
                {visibleBrands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleBrandChange(b.slug)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      brand === b.slug
                        ? 'bg-primary-50 text-primary-700 font-bold ring-1 ring-primary-100'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <BrandLogo brandObj={b} size="xs" variant="logo" />
                    <span className="truncate">{b.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-5 shadow-soft border border-gray-100">
            <h3 className="font-display font-bold text-gray-900 mb-3">Quick Filter</h3>
            <div className="space-y-1">
              {[
                { label: 'New Arrivals',     action: () => setSort('newest')   },
                { label: 'Best Rated',       action: () => setSort('rating')   },
                { label: 'Biggest Discount', action: () => setSort('discount') },
              ].map(f => (
                <button
                  key={f.label}
                  onClick={f.action}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-700 transition-colors"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {filterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-gray-900 text-lg">Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Max Price</h4>
                  <input
                    type="range"
                    min={0}
                    max={200000}
                    step={1000}
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                  <p className="text-sm text-primary-700 font-bold mt-1">Up to {formatPrice(maxPrice)}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Categories</h4>
                  <div className="space-y-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { handleCategoryChange(cat); setFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm ${category === cat ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600'}`}
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
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearch(''); setCategory('All'); setMaxPrice(200000); }}
                className="btn-shine bg-gradient-to-r from-primary-700 to-primary-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-glow-blue hover:scale-105 transition-transform"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(product => (
                <div key={product.id} className="group bg-white rounded-3xl border border-gray-100 shadow-soft p-4 flex gap-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                  <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-2xl shrink-0 bg-gray-50 group-hover:scale-[1.02] transition-transform" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-primary-700 font-bold bg-primary-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{product.category}</span>
                    <h3 className="font-bold text-gray-900 mt-1.5 line-clamp-2 group-hover:text-primary-700 transition-colors">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="text-xl font-display font-bold text-gray-900">{formatPrice(product.price)}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                      {product.discount > 0 && (
                        <span className="text-xs bg-gradient-to-r from-red-500 to-rose-500 text-white font-black px-2 py-0.5 rounded-full">−{product.discount}%</span>
                      )}
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
