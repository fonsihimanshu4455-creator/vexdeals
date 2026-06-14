import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Star, Package, X, Upload, ChevronLeft, ChevronRight, Video, Film, Loader2, Download, Percent, Copy, Eye, EyeOff } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { extractFolderId, extractFileId, driveImageUrl, listFolderImages } from '../../lib/drive';
import ImageCropper from '../../components/ImageCropper';

// Cloudinary (free, no card) — used for product video uploads.
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlgnlc3nm';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'testvex';

// Luxury / popular watch & eyewear brands for the brand autocomplete.
const LUXURY_BRANDS = [
  // Watches
  'Rolex', 'Omega', 'TAG Heuer', 'Cartier', 'Patek Philippe', 'Audemars Piguet',
  'Hublot', 'Breitling', 'IWC Schaffhausen', 'Panerai', 'Jaeger-LeCoultre',
  'Vacheron Constantin', 'Richard Mille', 'Zenith', 'Chopard', 'Bvlgari', 'Montblanc',
  'Rado', 'Longines', 'Tissot', 'Tudor', 'Seiko', 'Citizen', 'Casio', 'G-Shock',
  'Fossil', 'Daniel Wellington', 'Michael Kors', 'Emporio Armani', 'Tommy Hilfiger',
  'Guess', 'Titan', 'Fastrack', 'Timex', 'Garmin', 'Apple', 'Samsung', 'Noise',
  'boAt', 'Fire-Boltt', 'Amazfit',
  // Eyewear & Sunglasses
  'Ray-Ban', 'Oakley', 'Gucci', 'Prada', 'Versace', 'Dior', 'Tom Ford', 'Persol',
  'Carrera', 'Police', 'Vogue Eyewear', 'Maui Jim', 'Burberry', 'Dolce & Gabbana',
  'Armani Exchange', 'Hugo Boss', 'Calvin Klein', 'Lacoste', 'Saint Laurent',
  'Chanel', 'Fendi', 'Givenchy', 'Coach', 'Serengeti', 'Costa Del Mar',
  'Vincent Chase', 'John Jacobs', 'Lenskart Air', 'Idee', 'IDEE',
].sort((a, b) => a.localeCompare(b));

const createEmptyForm = (defaultCategory = 'Electronics') => ({
  name: '',
  brand: '',
  category: defaultCategory,
  price: '',
  originalPrice: '',
  stock: '',
  shippingCharge: 0,
  sortOrder: '',
  images: [],
  video: '',
  description: '',
  featured: true,
  isNew: false,
  isBestseller: false,
  flashSale: false,
  featuredOrder: '',
  newOrder: '',
  flashOrder: '',
});

// Home sections each product can appear in, with an optional order number.
const SECTIONS = [
  { key: 'featured',     label: 'Featured',     orderKey: 'featuredOrder' },
  { key: 'isNew',        label: 'New Arrivals', orderKey: 'newOrder' },
  { key: 'flashSale',    label: 'Flash Sale',   orderKey: 'flashOrder' },
  { key: 'isBestseller', label: 'Bestsellers',  orderKey: null },
];

const MAX_IMAGES = 6;

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const RECOMMENDED_IMAGE_SIZE = '1000 x 1000 px';
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// Upload a product video to Cloudinary (unsigned, with progress) and return
// its secure URL. `onProgress` receives 0–100.
const uploadVideoToStorage = (file, onProgress) =>
  new Promise((resolve, reject) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      reject(new Error('Video upload not configured. Paste a video URL instead.'));
      return;
    }
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText).secure_url); }
        catch { reject(new Error('Upload succeeded but response was invalid.')); }
      } else {
        let msg = `Upload failed (${xhr.status}).`;
        try { msg = JSON.parse(xhr.responseText).error?.message || msg; } catch { /* ignore */ }
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload. Check your connection.'));
    xhr.send(formData);
  });
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

// Inline-editable text — click to edit in place, saves on Enter or blur
// (Esc cancels). Used for product name and brand in the list.
function InlineName({ value, onSave, placeholder = 'Click to edit', className = 'font-medium text-gray-800' }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  useEffect(() => { setText(value); }, [value]);

  const commit = () => {
    setEditing(false);
    const t = text.trim();
    if (t !== value) onSave(t);
    else setText(value);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') { setText(value); setEditing(false); }
        }}
        className={`w-full ${className} border border-primary-300 rounded-lg px-2 py-1 text-sm outline-none focus:border-primary-500`}
      />
    );
  }

  return (
    <p
      className={`${className} line-clamp-1 cursor-text hover:text-primary-600 decoration-dotted hover:underline`}
      title="Click to edit"
      onClick={() => setEditing(true)}
    >
      {value || <span className="text-gray-300 italic font-normal">{placeholder}</span>}
    </p>
  );
}

export default function AdminProducts() {
  const { products: productList, addProduct, updateProduct, deleteProduct, syncState: productSyncState } = useProducts();
  const { categories: adminCategories, addCategory } = useCategories();
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
  const [imgUploading, setImgUploading] = useState(false);
  const [cropper, setCropper] = useState(null); // { url, target: 'add' | 'edit' }
  // Bulk discount
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({ category: 'All', percent: '' });
  const [bulkMsg, setBulkMsg] = useState('');
  const [bulkApplying, setBulkApplying] = useState(false);
  // Bulk import from links
  const [importOpen, setImportOpen] = useState(false);
  const [importForm, setImportForm] = useState({ links: '', namePrefix: 'VexDeals Premium', category: '', price: '999', originalPrice: '1999', delivery: '199' });
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, failed: 0 });
  const [importMsg, setImportMsg] = useState('');

  // ── Bulk import: paste a folder link OR image links → create products ──────
  const doBulkImport = async () => {
    const lines = importForm.links.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) { setImportMsg('Paste a folder link or image links.'); return; }

    const price = Number(importForm.price) || 999;
    const originalPrice = Number(importForm.originalPrice) || price;
    const shippingCharge = Math.min(500, Math.max(0, Number(importForm.delivery) || 0));
    const category = (importForm.category || '').trim() || defaultCategory;
    const prefix = importForm.namePrefix.trim() || 'VexDeals Product';

    setImporting(true);
    setImportMsg('');
    setImportProgress({ done: 0, total: 0, failed: 0 });

    // 1) Expand folder links into individual image URLs
    let imageUrls = [];
    try {
      for (const line of lines) {
        const folderId = extractFolderId(line);
        if (folderId) {
          const files = await listFolderImages(folderId);
          files.forEach(f => imageUrls.push(driveImageUrl(f.id)));
        } else {
          const fileId = extractFileId(line);
          imageUrls.push(fileId ? driveImageUrl(fileId) : line);
        }
      }
    } catch (e) {
      setImporting(false);
      setImportMsg(`Folder padhne me dikkat: ${e.message}. Folder ko "Anyone with link" public karo, aur Drive API enable hona chahiye. Ya files ke individual links daalo.`);
      return;
    }

    if (!imageUrls.length) { setImporting(false); setImportMsg('No images found in that folder/links.'); return; }

    // 2) Create category if new
    const exists = editableCategoryNames.some(c => c.toLowerCase() === category.toLowerCase());
    if (!exists) { try { await addCategory(category, '🛍️'); } catch { /* ignore */ } }

    // 3) Upload each image to Cloudinary + create product
    setImportProgress({ done: 0, total: imageUrls.length, failed: 0 });
    let done = 0, failed = 0;
    const startNum = productList.length + 1;

    for (let i = 0; i < imageUrls.length; i++) {
      let imageUrl = imageUrls[i];
      try {
        imageUrl = await uploadToCloudinary(imageUrls[i], 'image'); // host on Cloudinary (stable + fast)
      } catch {
        imageUrl = imageUrls[i]; // fallback to the raw link
      }
      try {
        await addProduct({
          name: `${prefix} ${String(startNum + i).padStart(2, '0')}`,
          category,
          price,
          originalPrice,
          stock: 50,
          shippingCharge,
          images: [imageUrl],
          image: imageUrl,
          rating: 4.5,
          reviews: 0,
          tags: category ? [category.toLowerCase()] : [],
          featured: false,
          isNew: true,
        });
        done += 1;
      } catch {
        failed += 1;
      }
      setImportProgress({ done, total: imageUrls.length, failed });
    }
    setImporting(false);
    setImportMsg(`✓ ${done} product${done !== 1 ? 's' : ''} added${failed ? ` · ${failed} failed` : ''}.`);
    if (done) setImportForm(f => ({ ...f, links: '' }));
  };

  // ── Bulk tools ─────────────────────────────────────────────────────────────
  const exportProductsCSV = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['ID', 'Name', 'Brand', 'Category', 'Price', 'Original Price', 'Discount %', 'Stock', 'Shipping', 'Priority', 'Featured', 'New', 'Bestseller', 'Flash Sale'];
    const lines = productList.map(p => [
      p.id, p.name, p.brand || '', p.category, p.price, p.originalPrice, p.discount, p.stock,
      p.shippingCharge ?? 0, p.sortOrder ?? '', p.featured ? 'Yes' : '', p.isNew ? 'Yes' : '', p.isBestseller ? 'Yes' : '', p.flashSale ? 'Yes' : '',
    ].map(esc).join(','));
    const blob = new Blob(['﻿' + [header.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vexdeals-products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const duplicateProduct = (product) => {
    const { id: _id, ...rest } = product;
    addProduct({ ...rest, name: `${product.name} (Copy)`, featured: false, isNew: false, isBestseller: false, flashSale: false });
  };

  const applyBulkDiscount = async () => {
    const pct = Number(bulkForm.percent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 90) { setBulkMsg('Enter a discount between 0 and 90%.'); return; }
    const targets = productList.filter(p =>
      (bulkForm.category === 'All' || p.category === bulkForm.category) && Number(p.originalPrice) > 0
    );
    if (!targets.length) { setBulkMsg('No products match this category.'); return; }
    setBulkApplying(true);
    for (const p of targets) {
      const newPrice = Math.max(1, Math.round(p.originalPrice * (1 - pct / 100)));
      // eslint-disable-next-line no-await-in-loop
      await updateProduct(p.id, { price: newPrice });
    }
    setBulkApplying(false);
    setBulkMsg(`✓ ${pct}% discount applied to ${targets.length} product${targets.length > 1 ? 's' : ''}.`);
  };
  // Video state
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [editVideoUploading, setEditVideoUploading] = useState(false);
  const [editVideoProgress, setEditVideoProgress] = useState(0);
  const [editVideoUrlInput, setEditVideoUrlInput] = useState('');

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

  // Brand choices for the inline dropdown — luxury presets + brands already used.
  const brandNames = useMemo(() => {
    const used = productList.map((p) => String(p.brand || '').trim()).filter(Boolean);
    return [...new Set([...LUXURY_BRANDS, ...used])].sort((a, b) => a.localeCompare(b));
  }, [productList]);

  const filtered = productList.filter((product) => {
    const matchCat = filterCat === 'All' || product.category === filterCat;
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const startEdit = (product) => {
    setEditId(product.id);
    setEditData({
      name: product.name,
      brand: product.brand || '',
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      category: product.category,
      shippingCharge: product.shippingCharge ?? 0,
      sortOrder: product.sortOrder ?? '',
      description: product.description || '',
      featured: product.featured ?? false,
      isNew: product.isNew ?? false,
      isBestseller: product.isBestseller ?? false,
      flashSale: product.flashSale ?? false,
      featuredOrder: product.featuredOrder ?? '',
      newOrder: product.newOrder ?? '',
      flashOrder: product.flashOrder ?? '',
      images: product.images?.length ? product.images : (product.image ? [product.image] : []),
      video: product.video || '',
    });
    setEditOpen(true);
    setEditError('');
    setEditUrlInput('');
    setEditVideoUrlInput('');
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditId(null);
    setEditData({});
    setEditError('');
    setEditUrlInput('');
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const addEditImageFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if ((editData.images || []).length >= MAX_IMAGES) { setEditError(`Maximum ${MAX_IMAGES} images allowed.`); return; }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) { setEditError('Please upload a JPG, PNG, or WEBP image.'); return; }
    if (file.size > MAX_IMAGE_SIZE_BYTES) { setEditError(`Image too large. Max ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.`); return; }
    setEditError('');
    setCropper({ url: URL.createObjectURL(file), target: 'edit' });
  };

  const closeCropper = () => {
    setCropper((c) => { if (c?.url) URL.revokeObjectURL(c.url); return null; });
  };

  const handleCropped = async (blob) => {
    const target = cropper?.target;
    try {
      setImgUploading(true);
      const file = new File([blob], `vex-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = await uploadToCloudinary(file, 'image');
      if (target === 'edit') setEditData((c) => ({ ...c, images: [...(c.images || []), url] }));
      else setAddForm((c) => ({ ...c, images: [...c.images, url] }));
    } catch (err) {
      if (target === 'edit') setEditError(err.message || 'Image upload failed.');
      else setFormError(err.message || 'Image upload failed.');
    } finally {
      setImgUploading(false);
      closeCropper();
    }
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

  // ── Video (edit) ─────────────────────────────────────────────────────────
  const addEditVideoFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) { setEditError('Upload an MP4, WEBM or MOV video.'); event.target.value = ''; return; }
    if (file.size > MAX_VIDEO_SIZE_BYTES) { setEditError(`Video too large. Max ${formatFileSize(MAX_VIDEO_SIZE_BYTES)}.`); event.target.value = ''; return; }
    try {
      setEditVideoUploading(true);
      setEditVideoProgress(0);
      const url = await uploadVideoToStorage(file, setEditVideoProgress);
      setEditData(c => ({ ...c, video: url }));
      setEditError('');
    } catch (err) { setEditError(err.message || 'Video upload failed.'); }
    finally { setEditVideoUploading(false); event.target.value = ''; }
  };
  const addEditVideoUrl = () => {
    const url = editVideoUrlInput.trim();
    if (!url) return;
    setEditData(c => ({ ...c, video: url }));
    setEditVideoUrlInput('');
    setEditError('');
  };
  const removeEditVideo = () => setEditData(c => ({ ...c, video: '' }));

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

  const addImageFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (addForm.images.length >= MAX_IMAGES) { setFormError(`Maximum ${MAX_IMAGES} images allowed.`); return; }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) { setFormError('Please upload a JPG, PNG, or WEBP image.'); return; }
    if (file.size > MAX_IMAGE_SIZE_BYTES) { setFormError(`Image too large. Keep each image under ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.`); return; }
    setFormError('');
    setCropper({ url: URL.createObjectURL(file), target: 'add' });
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

  // ── Video (add) ──────────────────────────────────────────────────────────
  const addVideoFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) { setFormError('Upload an MP4, WEBM or MOV video.'); event.target.value = ''; return; }
    if (file.size > MAX_VIDEO_SIZE_BYTES) { setFormError(`Video too large. Max ${formatFileSize(MAX_VIDEO_SIZE_BYTES)}.`); event.target.value = ''; return; }
    try {
      setVideoUploading(true);
      setVideoProgress(0);
      const url = await uploadVideoToStorage(file, setVideoProgress);
      setAddForm((current) => ({ ...current, video: url }));
      setFormError('');
    } catch (error) { setFormError(error.message || 'Video upload failed.'); }
    finally { setVideoUploading(false); event.target.value = ''; }
  };
  const addVideoUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    setAddForm((current) => ({ ...current, video: url }));
    setVideoUrlInput('');
    setFormError('');
  };
  const removeVideo = () => setAddForm((current) => ({ ...current, video: '' }));

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
      {cropper && (
        <ImageCropper
          src={cropper.url}
          uploading={imgUploading}
          onCancel={closeCropper}
          onCropped={handleCropped}
        />
      )}

      {/* Bulk import modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-gray-900">Bulk Import Products</h3>
              <button onClick={() => !importing && setImportOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4"><b>Poore folder ka link</b> paste karo (saari images se products ban jayenge), ya alag-alag image links (ek per line).</p>

            <div className="space-y-4">
              <textarea
                rows={6}
                value={importForm.links}
                onChange={e => setImportForm(f => ({ ...f, links: e.target.value }))}
                placeholder={'https://drive.google.com/drive/folders/FOLDER_ID\n(ya har image ka link, ek per line)'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 font-mono resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name prefix</label>
                  <input value={importForm.namePrefix} onChange={e => setImportForm(f => ({ ...f, namePrefix: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-gray-400 font-normal">(nayi bhi type kar sakte ho)</span></label>
                  <input list="vex-import-cats" value={importForm.category}
                    onChange={e => setImportForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="e.g. Drive Collection"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                  <datalist id="vex-import-cats">
                    {editableCategoryNames.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
                  <input type="number" value={importForm.price} onChange={e => setImportForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Original price (₹) <span className="text-gray-400 font-normal">(cut)</span></label>
                  <input type="number" value={importForm.originalPrice} onChange={e => setImportForm(f => ({ ...f, originalPrice: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery charge (₹)</label>
                  <input type="number" value={importForm.delivery} onChange={e => setImportForm(f => ({ ...f, delivery: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
              </div>

              {importing && (
                <div>
                  <div className="flex items-center justify-between text-sm font-medium text-primary-700 mb-1.5">
                    <span>Importing… {importProgress.done}/{importProgress.total}</span>
                    {importProgress.failed > 0 && <span className="text-red-500">{importProgress.failed} failed</span>}
                  </div>
                  <div className="h-2 w-full bg-primary-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 transition-all" style={{ width: `${importProgress.total ? (importProgress.done / importProgress.total) * 100 : 0}%` }} />
                  </div>
                </div>
              )}
              {importMsg && <p className={`text-sm font-medium ${importMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>{importMsg}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setImportOpen(false)} disabled={importing} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50">Close</button>
              <button onClick={doBulkImport} disabled={importing}
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {importing ? <><Loader2 size={16} className="animate-spin" /> Importing…</> : <><Upload size={16} /> Import all</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk discount modal */}
      {bulkOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Bulk Discount</h3>
              <button onClick={() => setBulkOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select value={bulkForm.category} onChange={e => setBulkForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 bg-white">
                  <option>All</option>
                  {editableCategoryNames.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount % <span className="text-gray-400 font-normal">(off original price)</span></label>
                <input type="number" min="0" max="90" value={bulkForm.percent}
                  onChange={e => setBulkForm(f => ({ ...f, percent: e.target.value }))}
                  placeholder="e.g. 20"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                <p className="text-xs text-gray-400 mt-1">0% = discount hatao (price wapas original).</p>
              </div>
              {bulkMsg && <p className={`text-sm font-medium ${bulkMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>{bulkMsg}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setBulkOpen(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">Close</button>
              <button onClick={applyBulkDiscount} disabled={bulkApplying}
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {bulkApplying ? <><Loader2 size={16} className="animate-spin" /> Applying…</> : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm">{productList.length} total products</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportProductsCSV}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50"
            title="Download as Excel/CSV"
          >
            <Download size={15} /> Export
          </button>
          <button
            onClick={() => { setBulkForm({ category: 'All', percent: '' }); setBulkMsg(''); setBulkOpen(true); }}
            className="flex items-center gap-2 bg-accent-500 text-ink-900 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-400"
          >
            <Percent size={15} /> Bulk Discount
          </button>
          <button
            onClick={() => { setImportMsg(''); setImportProgress({ done: 0, total: 0, failed: 0 }); setImportOpen(true); }}
            className="flex items-center gap-2 bg-ink-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700"
          >
            <Upload size={15} /> Bulk Import
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
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

      {/* Prominent, dedicated Drive folder import button — impossible to miss */}
      <button
        onClick={() => { setImportMsg(''); setImportProgress({ done: 0, total: 0, failed: 0 }); setImportOpen(true); }}
        className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-ink-900 to-primary-700 text-white px-5 py-4 rounded-2xl shadow-sm hover:from-ink-900 hover:to-primary-600 transition-colors"
      >
        <span className="flex items-center gap-3 text-left">
          <span className="bg-white/15 rounded-xl p-2"><Upload size={20} /></span>
          <span>
            <span className="block font-bold text-base">Google Drive Folder se Bulk Import</span>
            <span className="block text-white/80 text-xs">Pura folder link daalo — saari images ek saath products ban jayengi (₹999, delivery ₹199)</span>
          </span>
        </span>
        <span className="bg-accent-500 text-ink-900 font-bold text-sm px-4 py-2 rounded-xl shrink-0">Import</span>
      </button>

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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category / Brand</th>
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
                      <div className="min-w-0 flex-1">
                        <InlineName value={product.name} onSave={(name) => updateProduct(product.id, { name })} />
                        <p className="text-xs text-gray-400">{product.reviews.toLocaleString()} reviews · click name to edit</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {/* Category — change inline from the list (no Edit modal) */}
                    <select
                      value={product.category}
                      onChange={(e) => updateProduct(product.id, { category: e.target.value })}
                      className="text-xs bg-primary-50 text-primary-700 font-medium pl-2 pr-6 py-1 rounded-lg border border-primary-100 outline-none focus:border-primary-400 cursor-pointer max-w-[160px]"
                      title="Change category"
                    >
                      {[...new Set([product.category, ...editableCategoryNames])].filter(Boolean).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {/* Brand — select inline from the list */}
                    <div className="mt-1.5">
                      <select
                        value={product.brand || ''}
                        onChange={(e) => updateProduct(product.id, { brand: e.target.value })}
                        className="text-xs text-gray-600 bg-gray-50 pl-2 pr-6 py-1 rounded-lg border border-gray-200 outline-none focus:border-primary-400 cursor-pointer max-w-[160px]"
                        title="Select brand"
                      >
                        <option value="">— No brand —</option>
                        {[...new Set([product.brand, ...brandNames])].filter(Boolean).map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
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
                    {/* Click any chip to toggle that flag right from the list — no need to open Edit */}
                    <div className="flex flex-wrap gap-1 max-w-[230px]">
                      {[
                        { key: 'isNew', label: 'New Arrival', on: 'bg-emerald-100 text-emerald-700' },
                        { key: 'flashSale', label: 'Flash Sale', on: 'bg-red-100 text-red-600' },
                        { key: 'featured', label: 'Featured', on: 'bg-primary-100 text-primary-700' },
                        { key: 'isBestseller', label: 'Bestseller', on: 'bg-amber-100 text-amber-700' },
                      ].map((t) => (
                        <button
                          key={t.key}
                          onClick={() => updateProduct(product.id, { [t.key]: !product[t.key] })}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${product[t.key] ? `${t.on} border-transparent` : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                          title={`${product[t.key] ? 'Remove' : 'Add'} ${t.label}`}
                        >
                          {t.label}
                        </button>
                      ))}
                      {product.discount > 0 && <span className="text-[10px] bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded">-{product.discount}%</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateProduct(product.id, { hidden: !product.hidden })}
                        className={`p-1.5 rounded-lg transition-colors ${product.hidden ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        title={product.hidden ? 'Hidden from store — click to show' : 'Visible in store — click to hide'}
                      >
                        {product.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => duplicateProduct(product)} className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors" title="Duplicate product">
                        <Copy size={16} />
                      </button>
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
                <span className="block mb-1 font-medium">Brand <span className="text-gray-400 font-normal">(optional)</span></span>
                <input
                  list="vex-brand-list"
                  value={addForm.brand}
                  onChange={(e) => setAddForm((current) => ({ ...current, brand: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500"
                  placeholder="e.g. Ray-Ban, Fastrack"
                />
                <datalist id="vex-brand-list">
                  {[...new Set([...LUXURY_BRANDS, ...productList.map((p) => p.brand).filter(Boolean)])].map((b) => <option key={b} value={b} />)}
                </datalist>
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

              <label className="text-sm text-gray-700">
                <span className="block mb-1 font-medium">Priority <span className="text-gray-400 font-normal">(higher shows first)</span></span>
                <input
                  type="number"
                  min="0"
                  value={addForm.sortOrder}
                  onChange={(e) => setAddForm((current) => ({ ...current, sortOrder: e.target.value }))}
                  placeholder="Auto (leave blank)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">Bड़ा number = Flash Sale / Featured / listings me upar dikhega.</p>
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
                        <p className="text-xs text-gray-500">JPG / PNG / WEBP · max 10 MB per image</p>
                        {imgUploading && <p className="text-xs text-primary-600 font-medium flex items-center gap-1 mt-0.5"><Loader2 size={11} className="animate-spin" /> Uploading…</p>}
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

              {/* ── Product Video (optional) ── */}
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Video size={15} /> Product Video <span className="text-gray-400 font-normal">(optional)</span>
                </p>
                {addForm.video ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <video src={addForm.video} controls className="w-full max-h-56 object-contain bg-black" />
                    <button type="button" onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  videoUploading ? (
                    <div className="border-2 border-dashed border-primary-300 rounded-xl px-4 py-4 bg-primary-50/40">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-2">
                        <Loader2 size={16} className="animate-spin" /> Uploading… {videoProgress}%
                      </div>
                      <div className="h-2 w-full bg-primary-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 transition-all duration-200" style={{ width: `${videoProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-3 py-3 text-sm cursor-pointer hover:border-primary-400">
                      <Film size={16} /> Upload video (MP4/WEBM/MOV · max 100MB)
                      <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={addVideoFile} />
                    </label>
                    <div className="flex gap-2">
                      <input type="text" value={videoUrlInput} onChange={e => setVideoUrlInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addVideoUrl()}
                        placeholder="…or paste video URL"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                      <button type="button" onClick={addVideoUrl} disabled={!videoUrlInput.trim()}
                        className="px-4 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50">Add</button>
                    </div>
                  </div>
                  )
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

            <div className="mt-4 rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Show in sections <span className="text-gray-400 font-normal">(toggle + order number, lower = first)</span></p>
              <div className="space-y-2.5">
                {SECTIONS.map(({ key, label, orderKey }) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 w-40 shrink-0">
                      <input type="checkbox" checked={Boolean(addForm[key])}
                        onChange={(e) => setAddForm((c) => ({ ...c, [key]: e.target.checked }))}
                        className="accent-primary-600 w-4 h-4" />
                      {label}
                    </label>
                    {orderKey && addForm[key] && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">No.</span>
                        <input type="number" min="1" value={addForm[orderKey] ?? ''}
                          onChange={(e) => setAddForm((c) => ({ ...c, [orderKey]: e.target.value }))}
                          placeholder="auto"
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-primary-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
                <span className="block mb-1 font-medium">Brand <span className="text-gray-400 font-normal">(optional)</span></span>
                <input list="vex-brand-list" value={editData.brand || ''} onChange={e => setEditData(c => ({ ...c, brand: e.target.value }))}
                  placeholder="e.g. Ray-Ban, Fastrack"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500" />
                <datalist id="vex-brand-list">
                  {[...new Set([...LUXURY_BRANDS, ...productList.map((p) => p.brand).filter(Boolean)])].map((b) => <option key={b} value={b} />)}
                </datalist>
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
                <span className="block mb-1 font-medium">Priority <span className="text-gray-400 font-normal">(higher first)</span></span>
                <input type="number" min="0" value={editData.sortOrder ?? ''}
                  onChange={e => setEditData(c => ({ ...c, sortOrder: e.target.value }))}
                  placeholder="Auto"
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
                <p className="text-sm font-medium text-gray-700 mb-3">Show on Homepage Sections <span className="text-gray-400 font-normal">(toggle + order, lower number = first)</span></p>
                <div className="space-y-2.5">
                  {SECTIONS.map(({ key, label, orderKey }) => (
                    <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      editData[key] ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                        <input type="checkbox" checked={Boolean(editData[key])}
                          onChange={e => setEditData(c => ({ ...c, [key]: e.target.checked }))}
                          className="accent-primary-600 w-4 h-4 shrink-0" />
                        <span className="text-sm font-semibold text-gray-800">{label}</span>
                      </label>
                      {orderKey && editData[key] && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs text-gray-500">No.</span>
                          <input type="number" min="1" value={editData[orderKey] ?? ''}
                            onChange={e => setEditData(c => ({ ...c, [orderKey]: e.target.value }))}
                            placeholder="auto"
                            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-primary-500 bg-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                        <p className="text-xs text-gray-500">JPG / PNG / WEBP · max 10 MB</p>
                        {imgUploading && <p className="text-xs text-primary-600 font-medium flex items-center gap-1 mt-0.5"><Loader2 size={11} className="animate-spin" /> Uploading…</p>}
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

              {/* ── Product Video (optional) ── */}
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Video size={15} /> Product Video <span className="text-gray-400 font-normal">(optional)</span>
                </p>
                {editData.video ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <video src={editData.video} controls className="w-full max-h-56 object-contain bg-black" />
                    <button type="button" onClick={removeEditVideo}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  editVideoUploading ? (
                    <div className="border-2 border-dashed border-primary-300 rounded-xl px-4 py-4 bg-primary-50/40">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-2">
                        <Loader2 size={16} className="animate-spin" /> Uploading… {editVideoProgress}%
                      </div>
                      <div className="h-2 w-full bg-primary-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 transition-all duration-200" style={{ width: `${editVideoProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-3 py-3 text-sm cursor-pointer hover:border-primary-400">
                      <Film size={16} /> Upload video (MP4/WEBM/MOV · max 100MB)
                      <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={addEditVideoFile} />
                    </label>
                    <div className="flex gap-2">
                      <input type="text" value={editVideoUrlInput} onChange={e => setEditVideoUrlInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addEditVideoUrl()}
                        placeholder="…or paste video URL"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                      <button type="button" onClick={addEditVideoUrl} disabled={!editVideoUrlInput.trim()}
                        className="px-4 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50">Add</button>
                    </div>
                  </div>
                  )
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
