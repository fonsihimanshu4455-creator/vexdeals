import { createContext, useContext, useReducer, useEffect } from 'react';

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

const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const id = Number(item.id);
      const price = Number(item.price);
      const stock = Number(item.stock);
      const qty = Number(item.qty);

      if (!Number.isFinite(id) || !Number.isFinite(price)) {
        return null;
      }

      return {
        ...item,
        id,
        price,
        stock: Number.isFinite(stock) ? stock : 0,
        qty: Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1,
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

const readPromoCatalog = () => {
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

const getPromoValidation = (code, subtotal) => {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false, message: 'Enter a promo code first.' };
  }

  const promo = readPromoCatalog().find((entry) => entry.code === normalizedCode);
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

const getPromoDiscount = (promo, subtotal) => {
  if (!promo || subtotal <= 0) return 0;

  const rawDiscount = promo.type === 'flat'
    ? promo.value
    : subtotal * (promo.value / 100);

  return Math.min(subtotal, Math.max(0, Math.round(rawDiscount)));
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
              ? { ...i, qty: Math.min(i.qty + 1, action.payload.stock) }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, qty: 1 }] };
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
  const [state, dispatch] = useReducer(cartReducer, { items: [], promoCode: '' });

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
    if (state.promoCode) {
      localStorage.setItem(CART_PROMO_KEY, state.promoCode);
      return;
    }

    localStorage.removeItem(CART_PROMO_KEY);
  }, [state.promoCode]);

  const totalItems = state.items.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = state.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const shipping = subtotal > 0 && subtotal < 500 ? 99 : 0;
  const promoValidation = getPromoValidation(state.promoCode, subtotal);
  const appliedPromo = promoValidation.valid ? promoValidation.promo : null;
  const discount = appliedPromo ? getPromoDiscount(appliedPromo, subtotal) : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const applyPromoCode = (rawCode) => {
    const code = String(rawCode || '').trim().toUpperCase();
    const validation = getPromoValidation(code, subtotal);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    dispatch({ type: 'APPLY_PROMO', payload: code });

    const promo = validation.promo;
    const discountValue = getPromoDiscount(promo, subtotal);
    const savingsLabel = promo.type === 'percent'
      ? `${promo.value}%`
      : `Rs ${promo.value.toLocaleString('en-IN')}`;

    return {
      success: true,
      message: `${code} applied. You saved ${discountValue.toLocaleString('en-IN')} (${savingsLabel}).`,
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
