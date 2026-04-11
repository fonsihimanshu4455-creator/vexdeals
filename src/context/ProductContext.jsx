import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { products as seedProducts } from '../data/products';

const ProductContext = createContext();
const STORAGE_KEY = 'vexdeals_products';

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildImageSeed = (value) =>
  encodeURIComponent(String(value || 'vexdeals-product').trim().toLowerCase().replace(/\s+/g, '-'));

const normalizeProduct = (rawProduct, fallbackId) => {
  if (!rawProduct || typeof rawProduct !== 'object') return null;

  const id = Math.max(1, Math.floor(toNumber(rawProduct.id, fallbackId ?? Date.now())));
  const name = String(rawProduct.name || '').trim();
  if (!name) return null;

  const category = String(rawProduct.category || 'Electronics').trim() || 'Electronics';
  const price = Math.max(0, toNumber(rawProduct.price, 0));
  const originalPrice = Math.max(price, toNumber(rawProduct.originalPrice, price));
  const discount = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const rating = Math.min(5, Math.max(0, toNumber(rawProduct.rating, 4.5)));
  const reviews = Math.max(0, Math.floor(toNumber(rawProduct.reviews, 0)));
  const stock = Math.max(0, Math.floor(toNumber(rawProduct.stock, 0)));

  const defaultImage = `https://picsum.photos/seed/${buildImageSeed(name || id)}/500/500`;
  const image = String(rawProduct.image || defaultImage).trim() || defaultImage;
  const images = Array.isArray(rawProduct.images)
    ? rawProduct.images.filter((item) => typeof item === 'string' && item.trim().length > 0)
    : [];

  return {
    ...rawProduct,
    id,
    name,
    category,
    price,
    originalPrice,
    discount,
    rating,
    reviews,
    stock,
    image,
    images: images.length ? images : [image],
    description: String(rawProduct.description || `${name} is now available on VexDeals.`).trim(),
    specs: Array.isArray(rawProduct.specs)
      ? rawProduct.specs.map((item) => String(item).trim()).filter(Boolean)
      : [],
    tags: Array.isArray(rawProduct.tags)
      ? rawProduct.tags.map((item) => String(item).trim()).filter(Boolean)
      : [],
    featured: Boolean(rawProduct.featured),
    isNew: Boolean(rawProduct.isNew),
    isBestseller: Boolean(rawProduct.isBestseller),
  };
};

const normalizeProductList = (list) =>
  (Array.isArray(list) ? list : seedProducts)
    .map((product, index) => normalizeProduct(product, index + 1))
    .filter(Boolean);

const readStoredProducts = () => {
  if (typeof window === 'undefined') {
    return normalizeProductList(seedProducts);
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeProductList(JSON.parse(saved)) : normalizeProductList(seedProducts);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return normalizeProductList(seedProducts);
  }
};

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => readStoredProducts());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (draftProduct) => {
    setProducts((currentProducts) => {
      const nextId = currentProducts.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1;
      const normalized = normalizeProduct({ ...draftProduct, id: nextId }, nextId);
      return normalized ? [normalized, ...currentProducts] : currentProducts;
    });
  };

  const updateProduct = (productId, updates) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? normalizeProduct({ ...product, ...updates, id: product.id }, product.id) || product
          : product
      )
    );
  };

  const deleteProduct = (productId) => {
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
  };

  const value = useMemo(() => ({
    products,
    addProduct,
    updateProduct,
    deleteProduct,
  }), [products]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
