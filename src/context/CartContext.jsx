import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

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
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vexdeals_cart');
      if (!saved) return;

      const normalizedItems = normalizeCartItems(JSON.parse(saved));
      dispatch({ type: 'LOAD_CART', payload: normalizedItems });
      localStorage.setItem('vexdeals_cart', JSON.stringify(normalizedItems));
    } catch {
      localStorage.removeItem('vexdeals_cart');
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vexdeals_cart', JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = state.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const shipping = subtotal > 0 && subtotal < 500 ? 99 : 0;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider value={{ items: state.items, totalItems, subtotal, shipping, total, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
