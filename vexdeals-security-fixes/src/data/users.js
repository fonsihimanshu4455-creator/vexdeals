// Admin credentials come from env vars — NOT hardcoded in source.
// Set VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD in Vercel / .env
// NOTE: This is a client-side stopgap. For real security, migrate
// admin auth to Firebase Auth with server-verified custom claims.
const adminEmail    = import.meta.env.VITE_ADMIN_EMAIL;
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

export const users = (adminEmail && adminPassword)
  ? [
      {
        id: 1,
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        avatar: 'https://picsum.photos/seed/admin/100/100',
        joinDate: '2026-01-01',
        phone: '+91 99999 00000',
        totalOrders: 0,
        totalSpent: 0,
        status: 'Active',
      },
    ]
  : [];
