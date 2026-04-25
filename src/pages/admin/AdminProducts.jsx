import { useMemo, useRef, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Star, Package, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';

const createEmptyForm = (defaultCategory = 'Electronics') => ({
  name: '',
  category: defaultCategory,
  price: '',
  originalPrice: '',
  stock: '',
  shippingCharge: 0,
  images: [],
  description: '',
  featured: true,
  isNew: false,
  isBestseller: false,
});

const MAX_IMAGES = 6;

const MAX_IMAGE_SIZE_BYTES = 500 * 1024;
const RECOMMENDED_IMAGE_SIZE = '1000 x 1000 px';
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const normalizeShippingCharge = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(500, Math.max(0, Math.round(parsed)));
};

const formatFileSize = (sizeInBytes) => {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) return '0 KB';
  if (sizeInBytes >= 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.readAsDataURL(file);
  });

const getImageDimensions = (src) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve({ width: image.width, height: image.height });
    image.onerror = () => reject(new Error('Unable to read image dimensions.'));
    image.src = src;
  });

export default function AdminProducts() {
  const { products: productList, addProduct, updateProduct, deleteProduct, syncState: productSyncState } = useProducts();
  const { categories: adminCategories } = useCategories();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editOpen, setEditOpen] = useState(false);
  const [editUrlInput, setEditUrlInput] = useState('');
  const [editError, setEditError] = useState('');
  const editFileInputRef = useRef(null);
  const [deleteId, setDeleteId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;
  const categoryChoices = useMemo(() => {
    const map = new Map();
    adminCategories.forEach((category) => {
      const name = String(category?.name || '').trim();
      if (name && !map.has(name)) {
        map.set(name, { name, active: Boolean(category.active) });
      }
    });
    return [...map.values()];
  }, [adminCategories]);
  const defaultCategory = categoryChoices.find((category) => category.active)?.name || categoryChoices[0]?.name || 'Electronics';
  const [addForm, setAddForm] = useState(() => createEmptyForm(defaultCategory));
  const categories = ['All', ...new Set(productList.map((product) => product.category))];
  const editableCategoryNames = useMemo(() => {
    const productCategories = productList.map((product) => String(product.category || '').trim()).filter(Boolean);
    return [...new Set([...categoryChoices.map((category) => category.name), ...productCategories])];
  }, [categoryChoices, productList]);

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
      shippingCharge: product.shippingCharge ?? 0,
      description: product.description || '',
      featured: product.featured ?? false,
      isNew: product.isNew ?? false,
      isBestseller: product.isBestseller ?? false,
      images: product.images?.length ? product.images : (product.image ? [product.image] : []),
    });
    setEditOpen(true);
    setEditError('');
    setEditUrlInput('');
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditId(null);
    setEditData({});
    setEditError('');
    setEditUrlInput('');
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const addEditImageFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if ((editData.images || []).length >= MAX_IMAGES) { setEditError(`Maximum ${MAX_IMAGES} images allowed.`); event.target.value = ''; return; }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) { setEditError('Please upload a JPG, PNG, or WEBP image.'); event.target.value = ''; return; }
    if (file.size > MAX_IMAGE_SIZE_BYTES) { setEditError(`Image too large. Max ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.`); event.target.value = ''; return; }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditData(c => ({ ...c, images: [...(c.images || []), dataUrl] }));
      setEditError('');
    } catch (err) { setEditError(err.message || 'Could not read image.'); }
    event.target.value = '';
  };

  const addEditImageUrl = () => {
    const url = editUrlInput.trim();
    if (!url) return;
    if ((editData.images || []).length >= MAX_IMAGES) { setEditError(`Maximum ${MAX_IMAGES} images allowed.`); return; }
    setEditData(c => ({ ...c, images: [...(c.images || []), url] }));
    setEditUrlInput('');
    setEditError('');
  };

  const removeEditImage = (idx) => setEditData(c => ({ ...c, images: (c.images || []).filter((_, i) => i !== idx) }));

  const moveEditImage = (from, to) => {
    setEditData(c => {
      const imgs = [...(c.images || [])];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...c, images: imgs };
    });
  };

  const saveEdit = () => {
    const name = String(editData.name || '').trim();
    if (!name) { setEditError('Product name is required.'); return; }
    const price = Number(editData.price);
    if (!Number.isFinite(price) || price <= 0) { setEditError('Enter a valid selling price.'); return; }
    const shippingCharge = normalizeShippingCharge(editData.shippingCharge);
    updateProduct(editId, {
      ...editData,
      name,
      price,
      originalPrice: Number(editData.originalPrice || editData.price) || price,
      stock: Number(editData.stock) || 0,
      shippingCharge,
      image: (editData.images || [])[0] || '',
      images: editData.images || [],
    });
    closeEditModal();
  };

  const confirmDelete = () => {
    deleteProduct(deleteId);
    setDeleteId(null);
  };

  const openAddModal = () => {
    setAddOpen(true);
    setAddForm(createEmptyForm(defaultCategory));
    setFormError('');
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeAddModal = () => {
    setAddOpen(false);
    setAddForm(createEmptyForm(defaultCategory));
    setFormError('');
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addImageFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (addForm.images.length >= MAX_IMAGES) {
      setFormError(`Maximum ${MAX_IMAGES} images allowed.`);
      event.target.value = '';
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setFormError('Please upload a JPG, PNG, or WEBP image.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFormError(`Image too large. Keep each image under ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.`);
      event.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAddForm((current) => ({ ...current, images: [...current.images, dataUrl] }));
      setFormError('');
    } catch (error) {
      setFormError(error.message || 'Could not read the selected image.');
    }
    event.target.value = '';
  };

  const addImageUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (addForm.images.length >= MAX_IMAGES) {
      setFormError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    setAddForm((current) => ({ ...current, images: [...current.images, url] }));
    setUrlInput('');
    setFormError('');
  };

  const removeImage = (idx) => {
    setAddForm((current) => ({ ...current, images: current.images.filter((_, i) => i !== idx) }));
  };

  const moveImage = (from, to) => {
    setAddForm((current) => {
      const imgs = [...current.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...current, images: imgs };
    });
  };

  const handleAddProduct = () => {
    const name = addForm.name.trim();
    const category = addForm.category.trim();
    const price = Number(addForm.price);
    const originalPrice = Number(addForm.originalPrice || addForm.price);
    const stock = Number(addForm.stock);
    const shippingCharge = normalizeShippingCharge(addForm.shippingCharge);

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
    if (!Number.isFinite(Number(addForm.shippingCharge)) || shippingCharge < 0 || shippingCharge > 500) {
      setFormError('Shipping charge must be between 0 and 500.');
      return;
    }

    addProduct({
      ...addForm,
      name,
      category,
      price,
      originalPrice: Number.isFinite(originalPrice) && originalPrice > 0 ? originalPrice : price,
      stock,
      shippingCharge,
      image: addForm.images[0] || '',
      images: addForm.images,
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

      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          productSyncState.mode === 'cloud'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : productSyncState.mode === 'cloud-empty'
              ? 'border-primary-200 bg-primary-50 text-primary-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}
      >
        <p className="font-semibold">
          {productSyncState.mode === 'cloud' ? 'Realtime product sync is live' : 'Realtime product sync needs attention'}
        </p>
        <p className="mt-1">{productSyncState.message}</p>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shipping</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sections</th>
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
                        <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
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
                    <div className="text-sm">{formatPrice(product.price)}</div>
                    {product.originalPrice > product.price && (
                      <div className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      Number(product.shippingCharge) > 0 ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {Number(product.shippingCharge) > 0 ? formatPrice(product.shippingCharge) : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      product.stock === 0 ? 'bg-red-100 text-red-600' :
                      product.stock < 20 ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} units`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {product.featured && <span className="text-[10px] bg-primary-100 text-primary-700 font-bold px-1.5 py-0.5 rounded w-fit">Featured</span>}
                      {product.isBestseller && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded w-fit">Bestseller</span>}
                      {product.isNew && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded w-fit">New</span>}
                      {product.discount > 0 && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded w-fit">-{product.discount}%</span>}
                      {!product.featured && !product.isBestseller && !product.isNew && <span className="text-xs text-gray-400">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(product)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Edit product">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteId(product.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Delete product">
                        <Trash2 size={14} />
                      </button>
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
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm((current) => ({ ...current, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500 bg-white"
                >
                  {categoryChoices.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}{category.active ? '' : ' (Hidden on site)'}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-gray-500">
                  Existing admin categories only. Manage them from Admin Categories.
                </span>
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
                <span className="block mb-1 font-medium">Shipping Charge</span>
                <div className="rounded-xl border border-gray-200 px-3 py-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={normalizeShippingCharge(addForm.shippingCharge)}
                      onChange={(e) => setAddForm((current) => ({ ...current, shippingCharge: e.target.value }))}
                      className="flex-1 accent-primary-600"
                    />
                    <div className="flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-700">
                      <span>₹</span>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={addForm.shippingCharge}
                        onChange={(e) => setAddForm((current) => ({ ...current, shippingCharge: e.target.value }))}
                        className="w-16 bg-transparent outline-none"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Set per-product shipping from 0 to 500. Use 0 for free delivery.
                  </p>
                </div>
              </label>

              {/* ── Multi-image upload ───────────────────────────────────── */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Product Images
                    <span className="text-gray-400 font-normal ml-1">(max {MAX_IMAGES} · first = primary)</span>
                  </p>
                  <span className="text-xs text-gray-400">{addForm.images.length}/{MAX_IMAGES}</span>
                </div>

                {/* Uploaded image thumbnails */}
                {addForm.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {addForm.images.map((img, idx) => (
                      <div key={idx} className="relative group w-20 h-20">
                        <div className={`w-full h-full rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-primary-500' : 'border-gray-200'}`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* Position badge */}
                        <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow ${idx === 0 ? 'bg-primary-600 text-white' : 'bg-gray-500 text-white'}`}>
                          {idx + 1}
                        </span>

                        {/* Remove */}
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>

                        {/* Reorder arrows */}
                        <div className="absolute bottom-0.5 left-0 right-0 flex justify-between px-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button
                              onClick={() => moveImage(idx, idx - 1)}
                              className="w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded flex items-center justify-center"
                            >
                              <ChevronLeft size={12} />
                            </button>
                          )}
                          {idx < addForm.images.length - 1 && (
                            <button
                              onClick={() => moveImage(idx, idx + 1)}
                              className="w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded flex items-center justify-center ml-auto"
                            >
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add image controls */}
                {addForm.images.length < MAX_IMAGES && (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 space-y-3">
                    {/* URL input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addImageUrl()}
                        placeholder="Paste image URL and press Add…"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 bg-white"
                      />
                      <button
                        onClick={addImageUrl}
                        disabled={!urlInput.trim()}
                        className="px-3 py-2 bg-primary-50 text-primary-700 text-sm font-semibold rounded-xl border border-primary-200 hover:bg-primary-100 disabled:opacity-40"
                      >
                        Add URL
                      </button>
                    </div>

                    {/* File upload */}
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2 text-primary-600 shadow-sm shrink-0">
                        <Upload size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">Upload from device</p>
                        <p className="text-xs text-gray-500">JPG / PNG / WEBP · max 500 KB per image</p>
                      </div>
                      <label className="shrink-0 cursor-pointer bg-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary-700">
                        Choose File
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={addImageFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

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

      {/* ── Edit Product Modal ─────────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
                <p className="text-sm text-gray-500">Update details, sections & images.</p>
              </div>
              <button onClick={closeEditModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>

            {editError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{editError}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Product Name</span>
                <input value={editData.name || ''} onChange={e => setEditData(c => ({ ...c, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500" />
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Category</span>
                <select value={editData.category || ''} onChange={e => setEditData(c => ({ ...c, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500 bg-white">
                  {editableCategoryNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Selling Price (₹)</span>
                <input type="number" value={editData.price || ''} onChange={e => setEditData(c => ({ ...c, price: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500" />
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Original / MRP (₹)</span>
                <input type="number" value={editData.originalPrice || ''} onChange={e => setEditData(c => ({ ...c, originalPrice: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500" />
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Stock</span>
                <input type="number" value={editData.stock ?? ''} onChange={e => setEditData(c => ({ ...c, stock: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500" />
              </label>

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Shipping Charge (₹)</span>
                <div className="rounded-xl border border-gray-200 px-3 py-3">
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="500" step="10"
                      value={normalizeShippingCharge(editData.shippingCharge)}
                      onChange={e => setEditData(c => ({ ...c, shippingCharge: e.target.value }))}
                      className="flex-1 accent-primary-600" />
                    <div className="flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-700">
                      <span>₹</span>
                      <input type="number" min="0" max="500" value={editData.shippingCharge ?? 0}
                        onChange={e => setEditData(c => ({ ...c, shippingCharge: e.target.value }))}
                        className="w-14 bg-transparent outline-none" />
                    </div>
                  </div>
                </div>
              </label>

              {/* ── Section visibility ───────────────────────────────────── */}
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-3">Show on Homepage Sections</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'featured',     label: 'Featured Products', desc: 'Featured section on home' },
                    { key: 'isNew',        label: 'New Arrivals',       desc: 'New Arrivals section'    },
                    { key: 'isBestseller', label: 'Bestsellers',        desc: 'Bestsellers section'     },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      editData[key] ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}>
                      <input type="checkbox" checked={Boolean(editData[key])}
                        onChange={e => setEditData(c => ({ ...c, [key]: e.target.checked }))}
                        className="accent-primary-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">{label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Flash Sale section shows automatically when discount ≥ 20% (set via Original Price vs Selling Price).
                </p>
              </div>

              {/* ── Images ──────────────────────────────────────────────── */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Images <span className="text-gray-400 font-normal">(max {MAX_IMAGES} · first = primary)</span>
                  </p>
                  <span className="text-xs text-gray-400">{(editData.images || []).length}/{MAX_IMAGES}</span>
                </div>

                {(editData.images || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(editData.images || []).map((img, idx) => (
                      <div key={idx} className="relative group w-20 h-20">
                        <div className={`w-full h-full rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-primary-500' : 'border-gray-200'}`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow ${idx === 0 ? 'bg-primary-600 text-white' : 'bg-gray-500 text-white'}`}>
                          {idx + 1}
                        </span>
                        <button onClick={() => removeEditImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                        <div className="absolute bottom-0.5 left-0 right-0 flex justify-between px-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button onClick={() => moveEditImage(idx, idx - 1)}
                              className="w-5 h-5 bg-black/60 text-white rounded flex items-center justify-center">
                              <ChevronLeft size={12} />
                            </button>
                          )}
                          {idx < (editData.images || []).length - 1 && (
                            <button onClick={() => moveEditImage(idx, idx + 1)}
                              className="w-5 h-5 bg-black/60 text-white rounded flex items-center justify-center ml-auto">
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(editData.images || []).length < MAX_IMAGES && (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 space-y-3">
                    <div className="flex gap-2">
                      <input type="text" value={editUrlInput} onChange={e => setEditUrlInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addEditImageUrl()}
                        placeholder="Paste image URL and press Add…"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 bg-white" />
                      <button onClick={addEditImageUrl} disabled={!editUrlInput.trim()}
                        className="px-3 py-2 bg-primary-50 text-primary-700 text-sm font-semibold rounded-xl border border-primary-200 hover:bg-primary-100 disabled:opacity-40">
                        Add URL
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2 text-primary-600 shadow-sm shrink-0"><Upload size={16} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">Upload from device</p>
                        <p className="text-xs text-gray-500">JPG / PNG / WEBP · max 500 KB</p>
                      </div>
                      <label className="shrink-0 cursor-pointer bg-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary-700">
                        Choose File
                        <input ref={editFileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                          onChange={addEditImageFile} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <label className="sm:col-span-2 text-sm text-gray-700">
                <span className="block mb-1 font-medium">Description</span>
                <textarea rows={3} value={editData.description || ''} onChange={e => setEditData(c => ({ ...c, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500 resize-none"
                  placeholder="Short product description..." />
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeEditModal}
                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={saveEdit}
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 text-sm">
                Save Changes
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
