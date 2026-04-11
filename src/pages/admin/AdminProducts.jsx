import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Star, Package, X, Check } from 'lucide-react';
import { products as initialProducts } from '../../data/products';

const BLANK = {
  name: '', category: 'Electronics', price: '', originalPrice: '',
  discount: 0, stock: '', image: '', description: '',
};

export default function AdminProducts() {
  const [productList, setProductList] = useState(initialProducts);
  const [search, setSearch]           = useState('');
  const [filterCat, setFilterCat]     = useState('All');
  const [editId, setEditId]           = useState(null);
  const [editData, setEditData]       = useState({});
  const [deleteId, setDeleteId]       = useState(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [addForm, setAddForm]         = useState(BLANK);
  const [addError, setAddError]       = useState('');

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

  const categories = ['All', ...new Set(initialProducts.map(p => p.category))];
  const allCats    = [...new Set(initialProducts.map(p => p.category))];

  const filtered = productList.filter(p => {
    const matchCat    = filterCat === 'All' || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const startEdit = (product) => {
    setEditId(product.id);
    setEditData({ name: product.name, price: product.price, stock: product.stock, category: product.category });
  };

  const saveEdit = () => {
    setProductList(list =>
      list.map(p => p.id === editId ? { ...p, ...editData, price: Number(editData.price), stock: Number(editData.stock) } : p)
    );
    setEditId(null);
  };

  const confirmDelete = () => {
    setProductList(list => list.filter(p => p.id !== deleteId));
    setDeleteId(null);
  };

  const handleAddProduct = () => {
    setAddError('');
    if (!addForm.name.trim())  return setAddError('Product name is required');
    if (!addForm.price || isNaN(Number(addForm.price)) || Number(addForm.price) <= 0)
      return setAddError('Enter a valid price');
    if (!addForm.stock || isNaN(Number(addForm.stock)) || Number(addForm.stock) < 0)
      return setAddError('Enter a valid stock quantity');

    const price    = Number(addForm.price);
    const origPrice = addForm.originalPrice ? Number(addForm.originalPrice) : price;
    const discount = addForm.discount ? Number(addForm.discount) : Math.round(((origPrice - price) / origPrice) * 100);

    const newProduct = {
      id:            Date.now(),
      name:          addForm.name.trim(),
      category:      addForm.category,
      price,
      originalPrice: origPrice,
      discount:      Math.max(0, discount),
      stock:         Number(addForm.stock),
      image:         addForm.image.trim() || `https://picsum.photos/seed/${Date.now()}/500/500`,
      images:        [addForm.image.trim() || `https://picsum.photos/seed/${Date.now()}/500/500`],
      description:   addForm.description.trim() || `${addForm.name.trim()} — available exclusively on VexDeals.`,
      rating:        4.0,
      reviews:       0,
      specs:         [],
      tags:          [],
      featured:      false,
      isNew:         true,
      isBestseller:  false,
    };

    setProductList(list => [newProduct, ...list]);
    setAddForm(BLANK);
    setAddError('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm">{productList.length} total products</p>
        </div>
        <button
          onClick={() => { setAddForm(BLANK); setAddError(''); setShowAdd(true); }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                filterCat === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Products',  value: productList.length,                         color: 'text-primary-600' },
          { label: 'In Stock',        value: productList.filter(p => p.stock > 0).length, color: 'text-emerald-600' },
          { label: 'Low Stock (<20)', value: productList.filter(p => p.stock < 20).length, color: 'text-amber-600' },
          { label: 'Out of Stock',    value: productList.filter(p => p.stock === 0).length, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Discount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0" />
                      <div className="min-w-0">
                        {editId === product.id ? (
                          <input
                            value={editData.name}
                            onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                            className="border border-primary-400 rounded-lg px-2 py-1 text-xs w-full outline-none"
                          />
                        ) : (
                          <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                        )}
                        <p className="text-xs text-gray-400">{product.reviews.toLocaleString()} reviews</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-primary-50 text-primary-700 font-medium px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {editId === product.id ? (
                      <input type="number" value={editData.price} onChange={e => setEditData(d => ({ ...d, price: e.target.value }))}
                        className="border border-primary-400 rounded-lg px-2 py-1 text-xs w-24 outline-none" />
                    ) : formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    {editId === product.id ? (
                      <input type="number" value={editData.stock} onChange={e => setEditData(d => ({ ...d, stock: e.target.value }))}
                        className="border border-primary-400 rounded-lg px-2 py-1 text-xs w-16 outline-none" />
                    ) : (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        product.stock === 0 ? 'bg-red-100 text-red-600' :
                        product.stock < 20 ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} units`}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {product.discount > 0 ? (
                      <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full">-{product.discount}%</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {editId === product.id ? (
                        <>
                          <button onClick={saveEdit} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"><Check size={14} /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(product)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteId(product.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Package size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── ADD PRODUCT MODAL ────────────────────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Add New Product</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {addError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{addError}</div>}

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Titan Analog Watch"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select
                  value={addForm.category}
                  onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 bg-white"
                >
                  {allCats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Price + Original Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="1999"
                    min="1"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">MRP / Original (₹)</label>
                  <input
                    type="number"
                    value={addForm.originalPrice}
                    onChange={e => setAddForm(f => ({ ...f, originalPrice: e.target.value }))}
                    placeholder="2499"
                    min="1"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity *</label>
                <input
                  type="number"
                  value={addForm.stock}
                  onChange={e => setAddForm(f => ({ ...f, stock: e.target.value }))}
                  placeholder="50"
                  min="0"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image URL</label>
                <input
                  type="url"
                  value={addForm.image}
                  onChange={e => setAddForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://example.com/product.jpg"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600"
                />
                {addForm.image && (
                  <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={addForm.image} alt="" className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Leave blank to use a placeholder image</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={addForm.description}
                  onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief product description shown on product page…"
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddProduct} className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700">Add Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete "{productList.find(p => p.id === deleteId)?.name}"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
