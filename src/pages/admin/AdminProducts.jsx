import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Star, Package, X, Check } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

const EMPTY_FORM = {
  name: '',
  category: 'Electronics',
  price: '',
  originalPrice: '',
  stock: '',
  image: '',
  description: '',
  featured: true,
  isNew: false,
  isBestseller: false,
};

export default function AdminProducts() {
  const { products: productList, addProduct, updateProduct, deleteProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;
  const categories = ['All', ...new Set(productList.map((product) => product.category))];

  const filtered = productList.filter((product) => {
    const matchCat = filterCat === 'All' || product.category === filterCat;
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const startEdit = (product) => {
    setEditId(product.id);
    setEditData({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      category: product.category,
    });
  };

  const saveEdit = () => {
    updateProduct(editId, {
      ...editData,
      price: Number(editData.price),
      originalPrice: Number(editData.originalPrice || editData.price),
      stock: Number(editData.stock),
    });
    setEditId(null);
    setEditData({});
  };

  const confirmDelete = () => {
    deleteProduct(deleteId);
    setDeleteId(null);
  };

  const openAddModal = () => {
    setAddOpen(true);
    setAddForm(EMPTY_FORM);
    setFormError('');
  };

  const closeAddModal = () => {
    setAddOpen(false);
    setAddForm(EMPTY_FORM);
    setFormError('');
  };

  const handleAddProduct = () => {
    const name = addForm.name.trim();
    const category = addForm.category.trim();
    const price = Number(addForm.price);
    const originalPrice = Number(addForm.originalPrice || addForm.price);
    const stock = Number(addForm.stock);

    if (!name) {
      setFormError('Product name is required.');
      return;
    }
    if (!category) {
      setFormError('Category is required.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Enter a valid selling price.');
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setFormError('Enter a valid stock quantity.');
      return;
    }

    addProduct({
      ...addForm,
      name,
      category,
      price,
      originalPrice: Number.isFinite(originalPrice) && originalPrice > 0 ? originalPrice : price,
      stock,
      rating: 4.5,
      reviews: 0,
      specs: [],
      tags: category ? [category.toLowerCase()] : [],
    });

    closeAddModal();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm">{productList.length} total products</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: productList.length, color: 'text-primary-600' },
          { label: 'In Stock', value: productList.filter((product) => product.stock > 0).length, color: 'text-emerald-600' },
          { label: 'Low Stock (<20)', value: productList.filter((product) => product.stock < 20).length, color: 'text-amber-600' },
          { label: 'Out of Stock', value: productList.filter((product) => product.stock === 0).length, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

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
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0" />
                      <div className="min-w-0">
                        {editId === product.id ? (
                          <input
                            value={editData.name}
                            onChange={(e) => setEditData((current) => ({ ...current, name: e.target.value }))}
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
                    {editId === product.id ? (
                      <input
                        value={editData.category}
                        onChange={(e) => setEditData((current) => ({ ...current, category: e.target.value }))}
                        className="border border-primary-400 rounded-lg px-2 py-1 text-xs w-28 outline-none"
                      />
                    ) : (
                      <span className="text-xs bg-primary-50 text-primary-700 font-medium px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {editId === product.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          type="number"
                          value={editData.price}
                          onChange={(e) => setEditData((current) => ({ ...current, price: e.target.value }))}
                          className="border border-primary-400 rounded-lg px-2 py-1 text-xs w-24 outline-none"
                        />
                        <input
                          type="number"
                          value={editData.originalPrice}
                          onChange={(e) => setEditData((current) => ({ ...current, originalPrice: e.target.value }))}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs w-24 outline-none"
                          placeholder="MRP"
                        />
                      </div>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === product.id ? (
                      <input
                        type="number"
                        value={editData.stock}
                        onChange={(e) => setEditData((current) => ({ ...current, stock: e.target.value }))}
                        className="border border-primary-400 rounded-lg px-2 py-1 text-xs w-16 outline-none"
                      />
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
                          <button onClick={saveEdit} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(product)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteId(product.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                            <Trash2 size={14} />
                          </button>
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

      {addOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Product</h3>
                <p className="text-sm text-gray-500">Create a new product for the storefront and admin dashboard.</p>
              </div>
              <button onClick={closeAddModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Product Name</span>
                <input
                  value={addForm.name}
                  onChange={(e) => setAddForm((current) => ({ ...current, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500"
                  placeholder="Premium Chronograph Watch"
                />
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Category</span>
                <input
                  value={addForm.category}
                  onChange={(e) => setAddForm((current) => ({ ...current, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500"
                  placeholder="Electronics"
                />
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Selling Price</span>
                <input
                  type="number"
                  value={addForm.price}
                  onChange={(e) => setAddForm((current) => ({ ...current, price: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500"
                  placeholder="4999"
                />
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Original Price</span>
                <input
                  type="number"
                  value={addForm.originalPrice}
                  onChange={(e) => setAddForm((current) => ({ ...current, originalPrice: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500"
                  placeholder="5999"
                />
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Stock</span>
                <input
                  type="number"
                  value={addForm.stock}
                  onChange={(e) => setAddForm((current) => ({ ...current, stock: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500"
                  placeholder="25"
                />
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Image URL</span>
                <input
                  value={addForm.image}
                  onChange={(e) => setAddForm((current) => ({ ...current, image: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500"
                  placeholder="https://..."
                />
              </label>

              <label className="sm:col-span-2 text-sm text-gray-700">
                <span className="block mb-1 font-medium">Description</span>
                <textarea
                  rows={4}
                  value={addForm.description}
                  onChange={(e) => setAddForm((current) => ({ ...current, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500 resize-none"
                  placeholder="Short product description..."
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {[
                ['featured', 'Featured'],
                ['isNew', 'New Arrival'],
                ['isBestseller', 'Bestseller'],
              ].map(([key, label]) => (
                <label key={key} className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(addForm[key])}
                    onChange={(e) => setAddForm((current) => ({ ...current, [key]: e.target.checked }))}
                    className="accent-primary-600"
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeAddModal}
                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 text-sm"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete "{productList.find((product) => product.id === deleteId)?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
