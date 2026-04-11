import { createContext, useContext, useState, useEffect } from 'react';
import { users as staticUsers } from '../data/users';

const AuthContext = createContext();
const DEFAULT_AVATAR_SEED = 'vexdeals-user';

const normalizeUser = (rawUser) => {
  if (!rawUser || typeof rawUser !== 'object') return null;

  const name =
    String(rawUser.name || rawUser.fullName || rawUser.username || '').trim() ||
    (rawUser.phone ? `Customer ${String(rawUser.phone).replace(/\D/g, '').slice(-4)}` : 'VexDeals User');

  const role = rawUser.role === 'user' ? 'customer' : rawUser.role;
  const avatarSeed = encodeURIComponent(String(rawUser.email || rawUser.phone || rawUser.id || DEFAULT_AVATAR_SEED));

  return {
    ...rawUser,
    role,
    name,
    fullName: rawUser.fullName || name,
    avatar: rawUser.avatar || `https://picsum.photos/seed/${avatarSeed}/100/100`,
  };
};

// Sub-admins created by main admin are stored in localStorage
const getSubAdmins = () => {
  try {
    return JSON.parse(localStorage.getItem('vexdeals_subadmins') || '[]').map(normalizeUser).filter(Boolean);
  } catch {
    return [];
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vexdeals_user');
      if (saved) {
        const normalizedUser = normalizeUser(JSON.parse(saved));
        if (normalizedUser) {
          setUser(normalizedUser);
          localStorage.setItem('vexdeals_user', JSON.stringify(normalizedUser));
        }
      }
    } catch {
      localStorage.removeItem('vexdeals_user');
    }
    setLoading(false);
  }, []);

  const login = (email, password, preVerifiedUser = null) => {
    // Firebase OTP pre-verified user — skip password check
    if (preVerifiedUser) {
      const normalizedUser = normalizeUser(preVerifiedUser);
      setUser(normalizedUser);
      localStorage.setItem('vexdeals_user', JSON.stringify(normalizedUser));
      return { success: true, user: normalizedUser };
    }
    // Check static users (admin + customers)
    const found = staticUsers.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safeUser } = found;
      const normalizedUser = normalizeUser(safeUser);
      setUser(normalizedUser);
      localStorage.setItem('vexdeals_user', JSON.stringify(normalizedUser));
      return { success: true, user: normalizedUser };
    }
    // Check dynamic sub-admins
    const subAdmins = getSubAdmins();
    const foundSub = subAdmins.find(u => u.email === email && u.password === password && u.active);
    if (foundSub) {
      const { password: _, ...safeSub } = foundSub;
      const normalizedUser = normalizeUser(safeSub);
      setUser(normalizedUser);
      localStorage.setItem('vexdeals_user', JSON.stringify(normalizedUser));
      return { success: true, user: normalizedUser };
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
