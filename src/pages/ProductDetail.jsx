import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Star, Check, Minus, Plus, ArrowLeft, Truck, RotateCcw, Shield, Zap } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const { dispatch, items } = useCart();

  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [added, setAdded] = useState(false);

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

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;
  const inCart = items.find(i => i.id === product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch({ type: 'ADD_ITEM', payload: product });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const reviews = [
    { user: 'Rahul S.', rating: 5, comment: 'Absolutely amazing product! Exceeded all expectations. Highly recommended.', date: '2 days ago' },
    { user: 'Priya P.', rating: 4, comment: 'Great product for the price. Build quality is excellent.', date: '5 days ago' },
    { user: 'Amit K.', rating: 5, comment: 'Fast delivery and the product is exactly as described. Love it!', date: '1 week ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
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
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
                <img
                  src={product.images[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                        selectedImg === i ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                <button className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors">
                  <Heart size={18} />
                </button>
                <button className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>

              {/* Buy now */}
              {product.stock > 0 && (
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
                  { Icon: Truck, text: 'Free Delivery', sub: 'Above ₹500' },
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
                  {tab === 'reviews' ? `Reviews (${product.reviews.toLocaleString()})` : tab}
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
                <div className="space-y-4">
                  {reviews.map((review, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">{review.user}</span>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={13} className={j < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
