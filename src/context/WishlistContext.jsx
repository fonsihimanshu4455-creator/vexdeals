import { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext();
const KEY = 'vexdeals_wishlist';

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* quota */ }
  }, [ids]);

  const toggle = (id) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  const has = (id) => ids.includes(id);

  return (
    <WishlistContext.Provider value={{ ids, count: ids.length, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext) || { ids: [], count: 0, toggle: () => {}, has: () => false };
