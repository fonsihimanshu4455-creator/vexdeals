import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { users as staticUsers } from '../data/users';

// ─────────────────────────────────────────────────────────────────────────────
// Shared admin data layer.
//
// Every admin screen (Dashboard, Orders, Users, Analytics) must read from the
// SAME live source so the numbers always agree. Orders live in the Firestore
// `orders` collection (written on checkout) with a localStorage fallback under
// `vexdeals_customer_orders`. Customers live in the Firestore `users`
// collection with a localStorage fallback under `vexdeals_customers`.
// ─────────────────────────────────────────────────────────────────────────────

const ORDER_STORE_KEY = 'vexdeals_customer_orders';
const CUSTOMER_STORE_KEY = 'vexdeals_customers';

// Orders are stored keyed by user (email/id) → flatten them into one list.
export const getLocalOrders = () => {
  try {
    const store = JSON.parse(localStorage.getItem(ORDER_STORE_KEY) || '{}');
    return Object.values(store).flat().filter(Boolean);
  } catch {
    return [];
  }
};

export const getLocalCustomers = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_STORE_KEY) || '[]');
  } catch {
    return [];
  }
};

// Count orders + total spent for a single user from localStorage fallback.
export const getOrderStats = (userId, userEmail) => {
  try {
    const store = JSON.parse(localStorage.getItem(ORDER_STORE_KEY) || '{}');
    const key = userEmail || userId;
    const orders = Array.isArray(store[key]) ? store[key] : [];
    const totalOrders = orders.length;
    const totalSpent = orders
      .filter((o) => ['Delivered', 'Confirmed'].includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0);
    return { totalOrders, totalSpent };
  } catch {
    return { totalOrders: 0, totalSpent: 0 };
  }
};

const sortByDate = (a, b) =>
  new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);

// Merge static admins + real customers (Firestore takes priority over local).
export const buildUserList = (firestoreUsers) => {
  const admins = staticUsers
    .filter((u) => u.role === 'admin' || u.role === 'subadmin')
    .map((u) => ({ ...u, source: 'static' }));

  const customers = firestoreUsers.length > 0
    ? firestoreUsers
    : getLocalCustomers().map((u) => ({ ...u, source: 'local' }));

  const merged = [...admins];
  customers.forEach((cu) => {
    if (!merged.find((u) => u.id === cu.id || u.email === cu.email)) {
      const stats = getOrderStats(cu.id, cu.email);
      merged.push({
        ...cu,
        role: cu.role || 'customer',
        status: cu.status || 'Active',
        totalOrders: cu.totalOrders ?? stats.totalOrders,
        totalSpent: cu.totalSpent ?? stats.totalSpent,
        joinDate: cu.joinDate || cu.firstLogin?.split('T')[0] || '—',
      });
    }
  });

  return merged;
};

// ── Live orders (Firestore + localStorage fallback) ──────────────────────────
export function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveSync, setLiveSync] = useState(false);

  useEffect(() => {
    if (!db) {
      setOrders(getLocalOrders().sort(sortByDate));
      setLoading(false);
      return undefined;
    }

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const firestoreOrders = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        const fsIds = new Set(firestoreOrders.map((o) => o.id));
        const localOnly = getLocalOrders().filter((o) => !fsIds.has(o.id));
        setOrders([...firestoreOrders, ...localOnly].sort(sortByDate));
        setLiveSync(true);
        setLoading(false);
      },
      () => {
        setOrders(getLocalOrders().sort(sortByDate));
        setLiveSync(false);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  return { orders, setOrders, loading, liveSync };
}

// ── Live users (Firestore + localStorage fallback) ───────────────────────────
export function useAdminUsers() {
  const [users, setUsers] = useState(() => buildUserList([]));
  const [loading, setLoading] = useState(true);
  const [liveSync, setLiveSync] = useState(false);

  useEffect(() => {
    if (!db) {
      setUsers(buildUserList([]));
      setLoading(false);
      return undefined;
    }

    const q = query(collection(db, 'users'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const fsUsers = snap.docs.map((d) => ({ ...d.data(), id: d.id, source: 'cloud' }));
        setUsers(buildUserList(fsUsers));
        setLiveSync(true);
        setLoading(false);
      },
      () => {
        setUsers(buildUserList([]));
        setLiveSync(false);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  return { users, loading, liveSync };
}
