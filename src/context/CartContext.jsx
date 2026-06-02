import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useProducts } from './ProductContext';

const CartContext = createContext();
const CART_STORE_KEY = 'vexdeals_cart';
const CART_PROMO_KEY = 'vexdeals_cart_promo';
const PROMO_STORE_KEY = 'vexdeals_promos';

const DEFAULT_PROMOS = [
  {
    id: 'builtin-vexfirst',
    code: 'VEXFIRST',
    type: 'percent',
    value: 10,
    minOrder: 0,
    maxUses: null,
    usedCount: 0,
    expiry: null,
    active: true,
    description: '10% off welcome offer',
  },
];

const normalizeShippingCharge = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(500, Math.max(0, Math.round(parsed)));
};

const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const id = Number(item.id);
      const price = Number(item.price);
      const stock = Number(item.stock);
      const qty = Number(item.qty);
      const shippingCharge = normalizeShippingCharge(item.shippingCharge);

      if (!Number.isFinite(id) || !Number.isFinite(price)) {
        return null;
      }

      return {
        ...item,
        id,
        price,
        stock: Number.isFinite(stock) ? stock : 0,
        qty: Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1,
        shippingCharge,
      };
    })
    .filter(Boolean);
};

const normalizePromo = (promo) => {
  if (!promo || typeof promo !== 'object') return null;

  const code = String(promo.code || '').trim().toUpperCase();
  const type = promo.type === 'flat' ? 'flat' : 'percent';
  const value = Number(promo.value || 0);
  const minOrder = Number(promo.minOrder || 0);
  const maxUses = promo.maxUses === null || promo.maxUses === undefined || promo.maxUses === ''
    ? null
    : Number(promo.maxUses);
  const usedCount = Number(promo.usedCount || 0);

  if (!code || !Number.isFinite(value) || value <= 0) return null;

  return {
    ...promo,
    code,
    type,
    value,
    minOrder: Number.isFinite(minOrder) ? minOrder : 0,
    maxUses: Number.isFinite(maxUses) && maxUses > 0 ? maxUses : null,
    usedCount: Number.isFinite(usedCount) && usedCount > 0 ? usedCount : 0,
    active: promo.active !== false,
    expiry: promo.expiry || null,
  };
};

const isPromoExpired = (expiry) => {
  if (!expiry) return false;
  const endOfDay = new Date(`${expiry}T23:59:59`);
  return Number.isFinite(endOfDay.getTime()) ? endOfDay.getTime() < Date.now() : false;
};

const readLocalPromoCatalog = () => {
  if (typeof window === 'undefined') return DEFAULT_PROMOS;

  let storedPromos = [];
  try {
    storedPromos = JSON.parse(localStorage.getItem(PROMO_STORE_KEY) || '[]');
  } catch {
    storedPromos = [];
  }

  const normalizedStored = Array.isArray(storedPromos)
    ? storedPromos.map(normalizePromo).filter(Boolean)
    : [];

  const knownCodes = new Set(normalizedStored.map((promo) => promo.code));
  return [
    ...normalizedStored,
    ...DEFAULT_PROMOS.filter((promo) => !knownCodes.has(promo.code)),
  ];
};

const getPromoValidation = (code, subtotal, catalog) => {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false, message: 'Enter a promo code first.' };
  }

  const promo = catalog.find((entry) => entry.code === normalizedCode);
  if (!promo) {
    return { valid: false, message: 'Promo code not found.' };
  }

  if (!promo.active) {
    return { valid: false, message: 'This promo code is disabled.' };
  }

  if (isPromoExpired(promo.expiry)) {
    return { valid: false, message: 'This promo code has expired.' };
  }

  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return { valid: false, message: 'This promo code has reached its usage limit.' };
  }

  if (subtotal <= 0) {
    return { valid: false, message: 'Add items to cart before applying a promo code.' };
  }

  if (subtotal < promo.minOrder) {
    return {
      valid: false,
      message: `Minimum order value for this code is Rs ${promo.minOrder.toLocaleString('en-IN')}.`,
    };
  }

  return { valid: true, promo };
};

const getPromoDiscount = (promo, cartTotal) => {
  if (!promo || cartTotal <= 0) return 0;

  const rawDiscount = promo.type === 'flat'
    ? promo.value
    : cartTotal * (promo.value / 100);

  return Math.min(cartTotal, Math.max(0, Math.round(rawDiscount)));
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? {
                ...i,
                ...action.payload,
                qty: Math.min(i.qty + 1, action.payload.stock),
                shippingCharge: normalizeShippingCharge(action.payload.shippingCharge),
              }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            qty: 1,
            shippingCharge: normalizeShippingCharge(action.payload.shippingCharge),
          },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'UPDATE_QTY':
      if (action.payload.qty <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [], promoCode: '' };
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    case 'LOAD_PROMO':
      return { ...state, promoCode: action.payload };
    case 'APPLY_PROMO':
      return { ...state, promoCode: action.payload };
    case 'CLEAR_PROMO':
      return { ...state, promoCode: '' };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const { products } = useProducts();
  const [state, dispatch] = useReducer(cartReducer, { items: [], promoCode: '' });
  const [promoCatalog, setPromoCatalog] = useState(() => readLocalPromoCatalog());

  // Live promo catalog from Firestore — updates as admin creates/disables codes.
  // No orderBy: that would silently drop promos missing a `createdAt` field.
  useEffect(() => {
    if (!db) return;

    return onSnapshot(collection(db, 'promos'), (snap) => {
      if (snap.empty) return; // keep local catalog if Firestore empty

      const fsPromos = snap.docs
        .map(d => normalizePromo({ ...d.data(), id: d.id }))
        .filter(Boolean);

      // Always include DEFAULT_PROMOS that are not in Firestore
      const fsCodes = new Set(fsPromos.map(p => p.code));
      const merged = [
        ...fsPromos,
        ...DEFAULT_PROMOS.filter(p => !fsCodes.has(p.code)),
      ];

      // Persist to localStorage so offline / fallback still works
      localStorage.setItem(PROMO_STORE_KEY, JSON.stringify(fsPromos));
      setPromoCatalog(merged);
    }, () => {/* silent fail — keep local catalog */});
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORE_KEY);
      if (!saved) return;

      const normalizedItems = normalizeCartItems(JSON.parse(saved));
      dispatch({ type: 'LOAD_CART', payload: normalizedItems });
      localStorage.setItem(CART_STORE_KEY, JSON.stringify(normalizedItems));
    } catch {
      localStorage.removeItem(CART_STORE_KEY);
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  }, []);

  useEffect(() => {
    try {
      const savedPromoCode = localStorage.getItem(CART_PROMO_KEY) || '';
      dispatch({ type: 'LOAD_PROMO', payload: String(savedPromoCode).trim().toUpperCase() });
    } catch {
      localStorage.removeItem(CART_PROMO_KEY);
      dispatch({ type: 'LOAD_PROMO', payload: '' });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  useEffect(() => {
    if (!products.length || !state.items.length) return;

    const productMap = new Map(products.map((product) => [product.id, product]));
    const syncedItems = normalizeCartItems(
      state.items.map((item) => {
        const latestProduct = productMap.get(item.id);
        if (!latestProduct) return item;

        return {
          ...item,
          name: latestProduct.name,
          category: latestProduct.category,
          image: latestProduct.image,
          price: latestProduct.price,
          stock: latestProduct.stock,
          shippingCharge: latestProduct.shippingCharge,
        };
      })
    );

    if (JSON.stringify(syncedItems) !== JSON.stringify(normalizeCartItems(state.items))) {
      dispatch({ type: 'LOAD_CART', payload: syncedItems });
    }
  }, [products, state.items]);

  useEffect(() => {
    if (state.promoCode) {
      localStorage.setItem(CART_PROMO_KEY, state.promoCode);
      return;
    }

    localStorage.removeItem(CART_PROMO_KEY);
  }, [state.promoCode]);

  const totalItems = state.items.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = state.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const rawShipping = state.items.reduce(
    (acc, item) => acc + normalizeShippingCharge(item.shippingCharge) * item.qty,
    0
  );
  // Free delivery when subtotal ≥ ₹1000; otherwise per-product charges apply
  const shipping = subtotal >= 1000 ? 0 : rawShipping;
  const promoValidation = getPromoValidation(state.promoCode, subtotal, promoCatalog);
  const appliedPromo = promoValidation.valid ? promoValidation.promo : null;
  const discount = appliedPromo ? getPromoDiscount(appliedPromo, subtotal + shipping) : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const applyPromoCode = (rawCode) => {
    const code = String(rawCode || '').trim().toUpperCase();
    const validation = getPromoValidation(code, subtotal, promoCatalog);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    dispatch({ type: 'APPLY_PROMO', payload: code });

    const promo = validation.promo;
    const discountValue = getPromoDiscount(promo, subtotal + shipping);
    const savingsLabel = promo.type === 'percent'
      ? `${promo.value}%`
      : `Rs ${promo.value.toLocaleString('en-IN')}`;

    return {
      success: true,
      message: `${code} applied. You saved ₹${discountValue.toLocaleString('en-IN')} (${savingsLabel} on total).`,
    };
  };

  const removePromoCode = () => dispatch({ type: 'CLEAR_PROMO' });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        subtotal,
        shipping,
        discount,
        total,
        promoCode: state.promoCode,
        appliedPromo,
        dispatch,
        clearCart,
        applyPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
