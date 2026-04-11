import { createContext, useContext, useState, useEffect } from 'react';
import { users as staticUsers } from '../data/users';

const AuthContext = createContext();

// Sub-admins created by main admin are stored in localStorage
const getSubAdmins = () => {
  try {
    return JSON.parse(localStorage.getItem('vexdeals_subadmins') || '[]');
  } catch {
    return [];
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('vexdeals_user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Check static users (admin + customers)
    const found = staticUsers.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem('vexdeals_user', JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    // Check dynamic sub-admins
    const subAdmins = getSubAdmins();
    const foundSub = subAdmins.find(u => u.email === email && u.password === password && u.active);
    if (foundSub) {
      const { password: _, ...safeSub } = foundSub;
      setUser(safeSub);
      localStorage.setItem('vexdeals_user', JSON.stringify(safeSub));
      return { success: true, user: safeSub };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vexdeals_user');
  };

  // role hierarchy
  const isAdmin    = user?.role === 'admin';
  const isSubAdmin = user?.role === 'subadmin';
  const isStaff    = isAdmin || isSubAdmin;  // any admin-panel user
  const isCustomer = user?.role === 'customer';

  // permission helpers for sub-admins
  const canManageProducts  = isAdmin || (isSubAdmin && user?.department === 'products');
  const canManageMarketing = isAdmin || (isSubAdmin && user?.department === 'marketing');

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin,
      isSubAdmin,
      isStaff,
      isCustomer,
      canManageProducts,
      canManageMarketing,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
