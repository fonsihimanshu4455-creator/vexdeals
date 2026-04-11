import { createContext, useContext, useState, useEffect } from 'react';

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

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('vexdeals_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  useEffect(() => {
    localStorage.setItem('vexdeals_categories', JSON.stringify(categories));
  }, [categories]);

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
