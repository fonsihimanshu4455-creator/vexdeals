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

// Stable, deterministic id from an email OR phone so repeat logins map to one
// account. Pass { email } and/or { phone }.
export const buildOtpCustomer = ({ email = '', phone = '', name = '' } = {}) => {
  const e = String(email || '').trim().toLowerCase();
  const p = String(phone || '').replace(/\D/g, '').slice(-10);
  const display = String(name || '').trim() || (e ? e.split('@')[0] : (p ? `User ${p.slice(-4)}` : 'Customer'));
  const id = e ? `email_${e.replace(/[^a-z0-9]/gi, '_')}` : `phone_${p}`;
  return {
    id,
    name: display,
    email: e,
    phone: p,
    role: 'customer',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(display)}&background=009fb7&color=fff`,
    joinDate: new Date().toISOString().split('T')[0],
    totalOrders: 0,
    totalSpent: 0,
    status: 'Active',
    provider: e ? 'email' : 'phone',
  };
};
