// Shared customer helpers — persist a customer to localStorage + Firestore
// `users` (so the admin sees them), and build a customer object from an
// OTP-verified email (used by both Login and Checkout).
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const saveCustomer = (user) => {
  try {
    const customers = JSON.parse(localStorage.getItem('vexdeals_customers') || '[]');
    const idx = customers.findIndex((c) => c.id === user.id || c.email === user.email);
    if (idx === -1) customers.push({ ...user, firstLogin: new Date().toISOString() });
    else customers[idx] = { ...customers[idx], ...user };
    localStorage.setItem('vexdeals_customers', JSON.stringify(customers));
  } catch { /* ignore */ }

  if (db) {
    setDoc(doc(db, 'users', String(user.id)), {
      ...user, updatedAt: new Date().toISOString(),
    }, { merge: true }).catch(() => {});
  }
};

// Stable, deterministic id from an email so repeat logins map to one account.
export const buildOtpCustomer = (email, name) => {
  const clean = String(email || '').trim().toLowerCase();
  const display = String(name || '').trim() || clean.split('@')[0];
  return {
    id: `email_${clean.replace(/[^a-z0-9]/gi, '_')}`,
    name: display,
    email: clean,
    phone: '',
    role: 'customer',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(display)}&background=009fb7&color=fff`,
    joinDate: new Date().toISOString().split('T')[0],
    totalOrders: 0,
    totalSpent: 0,
    status: 'Active',
    provider: 'email',
  };
};
