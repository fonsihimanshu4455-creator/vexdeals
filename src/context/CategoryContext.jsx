import { createContext, useContext, useState, useEffect, useRef } from 'react';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Watches',      icon: '⌚', color: 'bg-blue-50 hover:bg-blue-100',    active: true  },
  { id: 2, name: 'Eyewear',      icon: '🕶️', color: 'bg-indigo-50 hover:bg-indigo-100', active: true  },
  { id: 3, name: 'Electronics',  icon: '💻', color: 'bg-sky-50 hover:bg-sky-100',       active: true  },
  { id: 4, name: 'Fashion',      icon: '👗', color: 'bg-pink-50 hover:bg-pink-100',     active: true  },
  { id: 5, name: 'Home & Living',icon: '🏠', color: 'bg-emerald-50 hover:bg-emerald-100',active: true },
  { id: 6, name: 'Sports',       icon: '🏋️', color: 'bg-orange-50 hover:bg-orange-100', active: true  },
  { id: 7, name: 'Beauty',       icon: '✨', color: 'bg-purple-50 hover:bg-purple-100', active: false },
];

const CategoryContext = createContext();

const readStoredCategories = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_CATEGORIES;
  }

  try {
    const saved = localStorage.getItem('vexdeals_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  } catch {
    localStorage.removeItem('vexdeals_categories');
    return DEFAULT_CATEGORIES;
  }
};

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState(() => readStoredCategories());
  const channelRef = useRef(null);
  const lastSnapshotRef = useRef(JSON.stringify(categories));

  useEffect(() => {
    const snapshot = JSON.stringify(categories);
    if (snapshot === lastSnapshotRef.current) return;

    lastSnapshotRef.current = snapshot;
    localStorage.setItem('vexdeals_categories', snapshot);
    channelRef.current?.postMessage(snapshot);
  }, [categories]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    channelRef.current = 'BroadcastChannel' in window ? new BroadcastChannel('vexdeals_categories') : null;

    const syncCategories = (nextCategories) => {
      const snapshot = JSON.stringify(nextCategories);
      if (snapshot === lastSnapshotRef.current) return;
      lastSnapshotRef.current = snapshot;
      setCategories(nextCategories);
    };

    const handleStorage = (event) => {
      if (event.key && event.key !== 'vexdeals_categories') return;
      syncCategories(readStoredCategories());
    };

    const handleFocus = () => {
      syncCategories(readStoredCategories());
    };

    const handleMessage = (event) => {
      try {
        syncCategories(JSON.parse(event.data));
      } catch {
        syncCategories(readStoredCategories());
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

  const activeCategories = categories.filter(c => c.active);

  const addCategory = (name, icon) => {
    const id = Date.now();
    const colors = [
      'bg-blue-50 hover:bg-blue-100',
      'bg-indigo-50 hover:bg-indigo-100',
      'bg-pink-50 hover:bg-pink-100',
      'bg-orange-50 hover:bg-orange-100',
      'bg-emerald-50 hover:bg-emerald-100',
      'bg-purple-50 hover:bg-purple-100',
      'bg-amber-50 hover:bg-amber-100',
      'bg-teal-50 hover:bg-teal-100',
    ];
    const color = colors[categories.length % colors.length];
    setCategories(prev => [...prev, { id, name, icon, color, active: true }]);
  };

  const removeCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const toggleCategory = (id) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const updateCategory = (id, updates) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      activeCategories,
      addCategory,
      removeCategory,
      toggleCategory,
      updateCategory,
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => useContext(CategoryContext);
