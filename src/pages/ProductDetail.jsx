import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Star, Check, Minus, Plus, ArrowLeft, Truck, RotateCcw, Shield, Zap, ChevronLeft, ChevronRight, ZoomIn, X, ExternalLink } from 'lucide-react';
import { affiliateStore } from '../lib/affiliate';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import { VexLogoMark } from '../components/Logo';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';
import { trackViewContent, trackAddToCart } from '../utils/pixel';
import { trackProductView, trackAddToCartHit } from '../utils/analytics';
import { addRecent } from '../lib/recentlyViewed';
import RecentlyViewed from '../components/RecentlyViewed';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, visibleProducts } = useProducts();
  const product = products.find(p => p.id === Number(id));
  const { dispatch, items } = useCart();
  const { has, toggle } = useWishlist();
  const wished = product ? has(product.id) : false;

  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const images = product?.images || [];
  const totalImgs = images.length;

  const prevImg = () => setSelectedImg(i => Math.max(0, i - 1));
  const nextImg = () => setSelectedImg(i => Math.min(totalImgs - 1, i + 1));

  const openLightbox = () => { setLightboxOpen(true); setZoomLevel(1); };
  const closeLightbox = () => { setLightboxOpen(false); setZoomLevel(1); };
  const cycleZoom = () => setZoomLevel(z => z >= 3 ? 1 : z + 1);

  // Touch swipe → next / prev image
  const touchX = useRef(null);
  const touchY = useRef(null);
  const swipedRef = useRef(false);
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
    swipedRef.current = false;
  };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      swipedRef.current = true;
      if (dx < 0) nextImg(); else prevImg();
    }
    touchX.current = null;
  };
  const handleMainClick = () => {
    if (swipedRef.current) { swipedRef.current = false; return; } // ignore tap after swipe
    openLightbox();
  };

  useEffect(() => {
    if (!product) return;
    trackViewContent({ id: product.id, name: product.name, value: product.price, currency: 'INR' });
    trackProductView(product.id, product.name);
    addRecent(product.id);
  }, [product?.id]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImg();
      if (e.key === 'ArrowRight') nextImg();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, totalImgs]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">😕</div>
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <Link to="/products" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700">
          Back to Products
        </Link>
      </div>
    );
  }

  const related = visibleProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const inCart = items.find(i => i.id === product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch({ type: 'ADD_ITEM', payload: product });
    }
    trackAddToCart({ id: product.id, name: product.name, value: product.price * qty, currency: 'INR', quantity: qty });
    trackAddToCartHit(product.id, product.name);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cream-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary-600">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image gallery */}
            <div className="space-y-3">
              {/* Main image */}
              <div className="relative group aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 cursor-zoom-in select-none touch-pan-y"
                onClick={handleMainClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <img
                  src={images[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
                {/* Zoom hint */}
                <div className="absolute top-3 right-3 bg-black/40 text-white rounded-xl px-2 py-1 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <ZoomIn size={12} /> Tap to zoom
                </div>
                {/* Brand watermark */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-white/75 backdrop-blur-sm rounded-full pl-1.5 pr-3 py-1 shadow-sm pointer-events-none">
                  <VexLogoMark size={18} />
                  <span className="text-[11px] font-bold text-gray-900 tracking-tight">VexDeals</span>
                </div>
                {/* Prev / Next on hover */}
                {totalImgs > 1 && selectedImg > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImg(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                {totalImgs > 1 && selectedImg < totalImgs - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImg(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
                {/* Dot indicators */}
                {totalImgs > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                    {images.map((_, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${selectedImg === i ? 'bg-primary-600' : 'bg-white/60'}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {totalImgs > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                        selectedImg === i ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Product video */}
              {product.video && (() => {
                const v = product.video.trim();
                const isYouTube = /(youtube\.com|youtu\.be)/.test(v);
                const driveMatch = v.match(/drive\.google\.com\/file\/d\/([^/]+)/);
                let embedSrc = null;
                if (isYouTube) {
                  embedSrc = v.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
                } else if (driveMatch) {
                  embedSrc = `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
                }
                return (
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                      <Zap size={15} className="text-primary-600" /> Product Video
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-black">
                      {embedSrc ? (
                        <iframe
                          className="w-full aspect-video"
                          src={embedSrc}
                          title="Product video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video src={v} controls playsInline preload="metadata" className="w-full max-h-[420px] object-contain bg-black" />
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Product info in next sibling — lightbox is rendered outside the grid */}
            {lightboxOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/95 flex flex-col"
                onClick={closeLightbox}
              >
                {/* Top bar */}
                <div
                  className="flex items-center justify-between px-4 py-3 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-white/60 text-sm">{selectedImg + 1} / {totalImgs}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={cycleZoom}
                      className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <ZoomIn size={14} /> {zoomLevel}×
                    </button>
                    <button onClick={closeLightbox} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Zoomed image area */}
                <div
                  className={`flex-1 ${zoomLevel > 1 ? 'overflow-auto' : 'overflow-hidden flex items-center justify-center'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={zoomLevel > 1 ? 'flex items-center justify-center p-4' : 'w-full h-full flex items-center justify-center p-4'}>
                    <img
                      src={images[selectedImg]}
                      alt={product.name}
                      onDoubleClick={cycleZoom}
                      style={{
                        maxWidth: zoomLevel === 1 ? '100%' : 'none',
                        maxHeight: zoomLevel === 1 ? '100%' : 'none',
                        width: zoomLevel > 1 ? `${zoomLevel * 80}vw` : undefined,
                        cursor: zoomLevel > 1 ? 'move' : 'zoom-in',
                      }}
                      className="object-contain rounded-lg select-none"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Prev / Next arrows */}
                {totalImgs > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImg(); setZoomLevel(1); }}
                      disabled={selectedImg === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-20"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImg(); setZoomLevel(1); }}
                      disabled={selectedImg === totalImgs - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-20"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Bottom thumbnail strip */}
                {totalImgs > 1 && (
                  <div
                    className="flex gap-2 justify-center px-4 py-3 overflow-x-auto shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedImg(i); setZoomLevel(1); }}
                        className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${selectedImg === i ? 'border-white' : 'border-white/30 hover:border-white/60'}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product info */}
            <div className="flex flex-col gap-4">
              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                <span className="bg-primary-50 text-primary-600 text-xs font-semibold px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.isNew && <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">NEW ARRIVAL</span>}
                {product.isBestseller && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap size={11} /> BESTSELLER
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-800">{product.rating}</span>
                <span className="text-sm text-gray-500">({product.reviews.toLocaleString()} reviews)</span>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-gray-900">{formatPrice(product.price)}</span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                      <span className="bg-red-500 text-white text-sm font-bold px-3 py-0.5 rounded-full">-{product.discount}% OFF</span>
                    </>
                  )}
                </div>
                {product.originalPrice > product.price && (
                  <p className="text-sm text-emerald-600 font-medium mt-1">
                    You save {formatPrice(product.originalPrice - product.price)}!
                  </p>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                  {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-semibold text-gray-800 border-x border-gray-200 min-w-[40px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {product.affiliateUrl ? (
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-ink-900 text-white hover:bg-primary-600 active:scale-95 transition-all"
                  >
                    Buy on {affiliateStore(product.affiliateUrl)} <ExternalLink size={17} />
                  </a>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : product.stock === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
                    }`}
                  >
                    {added ? <><Check size={18} /> Added to Cart!</> : <><ShoppingCart size={18} /> Add to Cart</>}
                  </button>
                )}
                <button
                  onClick={() => toggle(product.id)}
                  aria-label="Add to wishlist"
                  className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-colors ${
                    wished ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                  }`}
                >
                  <Heart size={18} className={wished ? 'fill-red-500' : ''} />
                </button>
                <button
                  onClick={() => { if (navigator.share) navigator.share({ title: product.name, url: window.location.href }).catch(() => {}); else { navigator.clipboard?.writeText(window.location.href); } }}
                  className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Buy now (hidden for affiliate products) */}
              {!product.affiliateUrl && product.stock > 0 && (
                <Link
                  to="/checkout"
                  onClick={handleAddToCart}
                  className="text-center py-3.5 rounded-xl font-semibold text-sm border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Buy Now
                </Link>
              )}

              {/* Delivery info */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: Truck, text: 'Free Delivery', sub: 'Above ₹1000' },
                  { Icon: RotateCcw, text: '7 Day Return', sub: 'Easy returns' },
                  { Icon: Shield, text: 'Warranty', sub: 'Brand warranty' },
                ].map(({ Icon, text, sub }) => (
                  <div key={text} className="bg-gray-50 rounded-xl p-3 text-center">
                    <Icon size={18} className="text-primary-600 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-gray-800">{text}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-10">
            <div className="flex border-b border-gray-200 gap-6">
              {['description', 'specs', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                    activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'reviews' ? 'Reviews' : tab}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {activeTab === 'description' && (
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              )}
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.specs.map(spec => (
                    <div key={spec} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <Check size={16} className="text-primary-600 shrink-0" />
                      <span className="text-sm text-gray-700">{spec}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'reviews' && (
                <ProductReviews productId={product.id} baseRating={product.rating} />
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}

        <RecentlyViewed excludeId={product.id} />
      </div>
    </div>
  );
}
