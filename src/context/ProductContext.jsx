import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { products as seedProducts } from '../data/products';
import { db } from '../config/firebase';

const ProductContext = createContext();
const STORAGE_KEY = 'vexdeals_products';
const CLOUD_COLLECTION = 'products';

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeShippingCharge = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(500, Math.max(0, Math.round(parsed)));
};

const buildImageSeed = (value) =>
  encodeURIComponent(String(value || 'vexdeals-product').trim().toLowerCase().replace(/\s+/g, '-'));

const buildSyncState = (overrides = {}) => ({
  mode: db ? 'connecting' : 'local',
  message: db
    ? 'Connecting shared product sync...'
    : 'Cloud product sync is off. Products save only on this device.',
  errorCode: '',
  ...overrides,
});

const mapCloudError = (error) => {
  switch (error?.code) {
    case 'failed-precondition':
      return 'Enable Cloud Firestore in Firebase Console so products sync to every device.';
    case 'permission-denied':
      return 'Firestore rules are blocking product sync. Products are saving only on this device.';
    case 'unavailable':
      return 'Cloud product sync is temporarily unavailable. Products are saving only on this device.';
    default:
      return 'Cloud product sync is not available right now. Products are saving only on this device.';
  }
};

const normalizeProduct = (rawProduct, fallbackId, fallbackSortOrder) => {
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
  const sortOrder = Math.max(1, Math.floor(toNumber(rawProduct.sortOrder, fallbackSortOrder ?? id)));
  const shippingCharge = normalizeShippingCharge(rawProduct.shippingCharge);

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
    sortOrder,
    shippingCharge,
    image,
    images: images.length ? images : [image],
    video: typeof rawProduct.video === 'string' ? rawProduct.video.trim() : '',
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

const normalizeProductList = (list) => {
  const safeList = Array.isArray(list) ? list : seedProducts;
  const total = safeList.length;

  return safeList
    .map((product, index) => normalizeProduct(product, index + 1, total - index))
    .filter(Boolean)
    .sort((a, b) => b.sortOrder - a.sortOrder || b.id - a.id);
};

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

const serializeProduct = (product) => ({
  ...product,
  updatedAt: new Date().toISOString(),
});

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => readStoredProducts());
  const [syncState, setSyncState] = useState(() => buildSyncState());
  const channelRef = useRef(null);
  const lastSnapshotRef = useRef(JSON.stringify(products));
  const productsRef = useRef(products);
  const cloudHasDataRef = useRef(false);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const snapshot = JSON.stringify(products);
    if (snapshot === lastSnapshotRef.current) return;

    lastSnapshotRef.current = snapshot;
    // localStorage has a ~5MB quota. Old products stored base64 images that can
    // blow past it → setItem throws QuotaExceededError → app crash. Persist
    // safely, and on overflow fall back to a "light" cache without base64 blobs
    // (Firestore remains the source of truth and refills them on load).
    try {
      localStorage.setItem(STORAGE_KEY, snapshot);
    } catch {
      try {
        const isData = (s) => typeof s === 'string' && s.startsWith('data:');
        const light = products.map((p) => ({
          ...p,
          image: isData(p.image) ? '' : p.image,
          images: Array.isArray(p.images) ? p.images.filter((i) => !isData(i)) : [],
          video: isData(p.video) ? '' : p.video,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(light));
      } catch {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      }
    }
    channelRef.current?.postMessage(snapshot);
  }, [products]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    channelRef.current = 'BroadcastChannel' in window ? new BroadcastChannel(STORAGE_KEY) : null;

    const syncProducts = (nextProducts) => {
      const snapshot = JSON.stringify(nextProducts);
      if (snapshot === lastSnapshotRef.current) return;
      lastSnapshotRef.current = snapshot;
      setProducts(nextProducts);
    };

    const handleStorage = (event) => {
      if (event.key && event.key !== STORAGE_KEY) return;
      syncProducts(readStoredProducts());
    };

    const handleFocus = () => {
      syncProducts(readStoredProducts());
    };

    const handleMessage = (event) => {
      try {
        syncProducts(normalizeProductList(JSON.parse(event.data)));
      } catch {
        syncProducts(readStoredProducts());
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    channelRef.current?.addEventListener('message', handleMessage);
    const pollId = window.setInterval(handleFocus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      window.clearInterval(pollId);
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!db) return undefined;

    const productsQuery = query(collection(db, CLOUD_COLLECTION), orderBy('sortOrder', 'desc'));

    return onSnapshot(
      productsQuery,
      (snapshot) => {
        if (snapshot.empty) {
          cloudHasDataRef.current = false;
          setSyncState(buildSyncState({
            mode: 'cloud-empty',
            message: 'Shared product sync is ready. Add a product once to publish the catalog to every device.',
          }));
          return;
        }

        const nextProducts = normalizeProductList(
          snapshot.docs.map((docSnapshot) => ({
            ...docSnapshot.data(),
            id: docSnapshot.data().id ?? docSnapshot.id,
          }))
        );

        cloudHasDataRef.current = nextProducts.length > 0;
        setProducts(nextProducts);
        setSyncState(buildSyncState({
          mode: 'cloud',
          message: 'Products are syncing live across devices.',
        }));
      },
      (error) => {
        cloudHasDataRef.current = false;
        setSyncState(buildSyncState({
          mode: 'local-error',
          message: mapCloudError(error),
          errorCode: error?.code || '',
        }));
      }
    );
  }, []);

  const ensureCloudSeeded = async (baselineProducts) => {
    if (!db || cloudHasDataRef.current) return;

    const normalizedBaseline = normalizeProductList(baselineProducts);
    if (!normalizedBaseline.length) return;

    await Promise.all(
      normalizedBaseline.map((product) =>
        setDoc(doc(db, CLOUD_COLLECTION, String(product.id)), serializeProduct(product))
      )
    );

    cloudHasDataRef.current = true;
  };

  const writeCloudProduct = async (product) => {
    if (!db) return;

    await setDoc(doc(db, CLOUD_COLLECTION, String(product.id)), serializeProduct(product));
    setSyncState(buildSyncState({
      mode: 'cloud',
      message: 'Products are syncing live across devices.',
    }));
  };

  const handleCloudFailure = (error) => {
    setSyncState(buildSyncState({
      mode: 'local-error',
      message: mapCloudError(error),
      errorCode: error?.code || '',
    }));
  };

  const addProduct = async (draftProduct) => {
    const baselineProducts = productsRef.current;
    const nextId = baselineProducts.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1;
    const nextSortOrder = baselineProducts.reduce((maxSortOrder, product) => Math.max(maxSortOrder, product.sortOrder || 0), 0) + 1;
    // Admin-set priority (higher = shows first) overrides the auto order.
    const priority = Number(draftProduct.sortOrder);
    const sortOrder = Number.isFinite(priority) && priority > 0 ? priority : nextSortOrder;
    const normalized = normalizeProduct({ ...draftProduct, id: nextId, sortOrder }, nextId, sortOrder);

    if (!normalized) return null;

    setProducts((currentProducts) => [normalized, ...currentProducts]);

    if (!db) return normalized;

    try {
      if (!cloudHasDataRef.current) {
        await ensureCloudSeeded(baselineProducts);
      }
      await writeCloudProduct(normalized);
    } catch (error) {
      handleCloudFailure(error);
    }

    return normalized;
  };

  const updateProduct = async (productId, updates) => {
    const baselineProducts = productsRef.current;
    let nextProduct = null;

    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        if (product.id !== productId) return product;

        const priority = Number(updates.sortOrder);
        const sortOrder = Number.isFinite(priority) && priority > 0 ? priority : product.sortOrder;
        nextProduct = normalizeProduct(
          { ...product, ...updates, id: product.id, sortOrder },
          product.id,
          sortOrder
        ) || product;

        return nextProduct;
      })
    );

    if (!db || !nextProduct) return nextProduct;

    try {
      if (!cloudHasDataRef.current) {
        await ensureCloudSeeded(baselineProducts);
      }
      await writeCloudProduct(nextProduct);
    } catch (error) {
      handleCloudFailure(error);
    }

    return nextProduct;
  };

  const deleteProduct = async (productId) => {
    const baselineProducts = productsRef.current;

    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));

    if (!db) return;

    try {
      if (!cloudHasDataRef.current) {
        await ensureCloudSeeded(baselineProducts);
      }
      await deleteDoc(doc(db, CLOUD_COLLECTION, String(productId)));
      setSyncState(buildSyncState({
        mode: 'cloud',
        message: 'Products are syncing live across devices.',
      }));
    } catch (error) {
      handleCloudFailure(error);
    }
  };

  const value = useMemo(() => ({
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    syncState,
  }), [products, syncState]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
