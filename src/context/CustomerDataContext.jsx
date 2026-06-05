import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { orders as seedOrders } from '../data/orders';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const CustomerDataContext = createContext();

const ORDER_STORE_KEY = 'vexdeals_customer_orders';
const TRANSACTION_STORE_KEY = 'vexdeals_customer_transactions';
const ADDRESS_STORE_KEY = 'vexdeals_customer_addresses';

const readStore = (key) => {
  if (typeof window === 'undefined') return {};

  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  } catch {
    localStorage.removeItem(key);
    return {};
  }
};

const writeStore = (key, value) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota / private mode */ }
};

const getUserKey = (user) => String(user?.email || user?.id || '');

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');
const normalizeText = (value) => String(value || '').trim();

const addressToLine = (address) => [
  address.address,
  address.city,
  address.state,
  address.pincode,
].filter(Boolean).join(', ');

const splitSeedAddress = (value) => {
  const parts = String(value || '').split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) {
    return {
      address: String(value || '').trim(),
      city: '',
      state: '',
      pincode: '',
    };
  }

  const address = parts.slice(0, Math.max(1, parts.length - 2)).join(', ');
  const city = parts[parts.length - 2] || '';
  const stateAndPin = parts[parts.length - 1] || '';
  const stateMatch = stateAndPin.match(/^(.*?)(\d{6})$/);

  return {
    address,
    city,
    state: stateMatch ? stateMatch[1].trim().replace(/[-,]$/, '').trim() : stateAndPin,
    pincode: stateMatch ? stateMatch[2] : '',
  };
};

const normalizeAddress = (rawAddress, fallbackId, defaultName, defaultEmail) => {
  if (!rawAddress || typeof rawAddress !== 'object') return null;

  const fullName = normalizeText(rawAddress.fullName || rawAddress.name || defaultName);
  const phone = normalizePhone(rawAddress.phone);
  const address = normalizeText(rawAddress.address);
  const city = normalizeText(rawAddress.city);
  const state = normalizeText(rawAddress.state);
  const pincode = normalizePhone(rawAddress.pincode).slice(0, 6);

  if (!fullName || !phone || !address || !city || !state || pincode.length !== 6) {
    return null;
  }

  return {
    id: rawAddress.id || `ADDR-${fallbackId}`,
    label: normalizeText(rawAddress.label || 'Home'),
    fullName,
    email: normalizeText(rawAddress.email || defaultEmail),
    phone,
    address,
    city,
    state,
    pincode,
    isDefault: Boolean(rawAddress.isDefault),
    createdAt: rawAddress.createdAt || new Date().toISOString(),
  };
};

const normalizeOrder = (rawOrder, fallbackId, user) => {
  if (!rawOrder || typeof rawOrder !== 'object') return null;

  const products = Array.isArray(rawOrder.products)
    ? rawOrder.products
        .map((product, index) => {
          if (!product || typeof product !== 'object') return null;
          return {
            productId: Number(product.productId || product.id || index + 1),
            name: normalizeText(product.name || 'Product'),
            price: Number(product.price || 0),
            qty: Math.max(1, Number(product.qty || 1)),
            image: normalizeText(product.image),
          };
        })
        .filter(Boolean)
    : [];

  return {
    id: rawOrder.id || `VEX-${fallbackId}`,
    userId: rawOrder.userId ?? user?.id ?? null,
    userName: normalizeText(rawOrder.userName || user?.name),
    userEmail: normalizeText(rawOrder.userEmail || user?.email),
    products,
    subtotal: Number(rawOrder.subtotal || 0),
    shipping: Number(rawOrder.shipping || 0),
    total: Number(rawOrder.total || 0),
    status: normalizeText(rawOrder.status || 'Pending'),
    date: rawOrder.date || new Date().toISOString().split('T')[0],
    address: normalizeText(rawOrder.address),
    paymentMethod: normalizeText(rawOrder.paymentMethod || 'COD'),
    paymentId: normalizeText(rawOrder.paymentId),
    createdAt: rawOrder.createdAt || new Date().toISOString(),
  };
};

const normalizeTransaction = (rawTransaction, fallbackId) => {
  if (!rawTransaction || typeof rawTransaction !== 'object') return null;

  return {
    id: rawTransaction.id || `TXN-${fallbackId}`,
    orderId: normalizeText(rawTransaction.orderId),
    type: normalizeText(rawTransaction.type || 'Debit'),
    method: normalizeText(rawTransaction.method || 'Payment'),
    amount: Number(rawTransaction.amount || 0),
    status: normalizeText(rawTransaction.status || 'Paid'),
    paymentId: normalizeText(rawTransaction.paymentId),
    note: normalizeText(rawTransaction.note),
    date: rawTransaction.date || new Date().toISOString(),
  };
};

const deriveSeedAddresses = (user) => {
  if (!user) return [];

  const matchedOrders = seedOrders
    .filter((order) => order.userEmail === user.email || order.userId === user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const unique = new Map();
  matchedOrders.forEach((order, index) => {
    const parsed = splitSeedAddress(order.address);
    const address = normalizeAddress({
      id: `ADDR-SEED-${index + 1}`,
      label: index === 0 ? 'Primary' : `Saved ${index + 1}`,
      fullName: order.userName || user.name,
      email: order.userEmail || user.email,
      phone: user.phone,
      ...parsed,
      isDefault: index === 0,
      createdAt: order.date,
    }, index + 1, user.name, user.email);

    if (address && !unique.has(addressToLine(address))) {
      unique.set(addressToLine(address), address);
    }
  });

  return [...unique.values()];
};

const deriveSeedOrders = (user) => {
  if (!user) return [];
  return seedOrders
    .filter((order) => order.userEmail === user.email || order.userId === user.id)
    .map((order, index) => normalizeOrder(order, index + 1, user))
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

const deriveSeedTransactions = (user) =>
  deriveSeedOrders(user).map((order, index) =>
    normalizeTransaction({
      id: `TXN-SEED-${index + 1}`,
      orderId: order.id,
      type: 'Debit',
      method: order.paymentMethod,
      amount: order.total,
      status: order.paymentMethod === 'COD' ? 'Pending on delivery' : 'Paid',
      note: `Order payment for ${order.id}`,
      date: `${order.date}T10:00:00.000Z`,
    }, index + 1)
  ).filter(Boolean);

const hydrateForUser = (storeKey, user, seedBuilder, normalizer) => {
  const userKey = getUserKey(user);
  if (!userKey) return [];

  const store = readStore(storeKey);
  const seeded = seedBuilder(user);
  const stored = Array.isArray(store[userKey]) ? store[userKey] : [];
  const normalizedStored = stored
    .map((item, index) => normalizer(item, index + 1))
    .filter(Boolean);

  if (normalizedStored.length === 0 && seeded.length > 0) {
    store[userKey] = seeded;
    writeStore(storeKey, store);
    return seeded;
  }

  return normalizedStored;
};

export function CustomerDataProvider({ children }) {
  const { user, isCustomer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!isCustomer || !user) {
      setOrders([]);
      setTransactions([]);
      setAddresses([]);
      return;
    }

    setOrders(hydrateForUser(ORDER_STORE_KEY, user, deriveSeedOrders, (item, fallbackId) =>
      normalizeOrder(item, fallbackId, user)
    ));
    setTransactions(hydrateForUser(TRANSACTION_STORE_KEY, user, deriveSeedTransactions, normalizeTransaction));
    setAddresses(hydrateForUser(ADDRESS_STORE_KEY, user, deriveSeedAddresses, (item, fallbackId) =>
      normalizeAddress(item, fallbackId, user?.name, user?.email)
    ));
  }, [user, isCustomer]);

  useEffect(() => {
    if (!isCustomer || !user) return;
    const userKey = getUserKey(user);
    const store = readStore(ORDER_STORE_KEY);
    store[userKey] = orders;
    writeStore(ORDER_STORE_KEY, store);
  }, [orders, user, isCustomer]);

  useEffect(() => {
    if (!isCustomer || !user) return;
    const userKey = getUserKey(user);
    const store = readStore(TRANSACTION_STORE_KEY);
    store[userKey] = transactions;
    writeStore(TRANSACTION_STORE_KEY, store);
  }, [transactions, user, isCustomer]);

  useEffect(() => {
    if (!isCustomer || !user) return;
    const userKey = getUserKey(user);
    const store = readStore(ADDRESS_STORE_KEY);
    store[userKey] = addresses;
    writeStore(ADDRESS_STORE_KEY, store);
  }, [addresses, user, isCustomer]);

  const saveAddress = (draftAddress, addressId = null) => {
    const normalized = normalizeAddress(
      { ...draftAddress, id: addressId || draftAddress.id || `ADDR-${Date.now()}` },
      Date.now(),
      user?.name,
      user?.email
    );

    if (!normalized) {
      return { success: false, message: 'Please complete all address fields correctly.' };
    }

    setAddresses((currentAddresses) => {
      const hasDefault = currentAddresses.some((address) => address.isDefault && address.id !== normalized.id);
      const nextAddress = {
        ...normalized,
        isDefault: draftAddress.isDefault ?? (!hasDefault || currentAddresses.length === 0),
      };

      const nextAddresses = currentAddresses.some((address) => address.id === nextAddress.id)
        ? currentAddresses.map((address) =>
            address.id === nextAddress.id ? nextAddress : nextAddress.isDefault ? { ...address, isDefault: false } : address
          )
        : [
            nextAddress,
            ...currentAddresses.map((address) => nextAddress.isDefault ? { ...address, isDefault: false } : address),
          ];

      return nextAddresses;
    });

    return { success: true, address: normalized };
  };

  const setDefaultAddress = (addressId) => {
    setAddresses((currentAddresses) =>
      currentAddresses.map((address) => ({ ...address, isDefault: address.id === addressId }))
    );
  };

  const placeCustomerOrder = ({ cartItems, subtotal, shipping, total, shippingAddress, paymentMethod, paymentId }) => {
    if (!user || !isCustomer) return null;

    const normalizedAddress = normalizeAddress(
      {
        ...shippingAddress,
        id: shippingAddress.id || `ADDR-${Date.now()}`,
        isDefault: addresses.length === 0,
      },
      Date.now(),
      user.name,
      user.email
    );

    if (normalizedAddress) {
      setAddresses((currentAddresses) => {
        const existing = currentAddresses.find(
          (address) =>
            address.address === normalizedAddress.address &&
            address.city === normalizedAddress.city &&
            address.state === normalizedAddress.state &&
            address.pincode === normalizedAddress.pincode
        );

        if (existing) {
          return currentAddresses.map((address) =>
            address.id === existing.id
              ? { ...address, fullName: normalizedAddress.fullName, phone: normalizedAddress.phone, email: normalizedAddress.email }
              : address
          );
        }

        return [
          { ...normalizedAddress, isDefault: currentAddresses.length === 0 },
          ...currentAddresses,
        ];
      });
    }

    const orderId = `VEX-${Date.now().toString().slice(-6)}`;
    const createdAt = new Date().toISOString();
    const order = normalizeOrder({
      id: orderId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      products: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
      })),
      subtotal,
      shipping,
      total,
      status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Confirmed',
      date: createdAt.split('T')[0],
      address: normalizedAddress ? addressToLine(normalizedAddress) : '',
      paymentMethod,
      paymentId,
      createdAt,
    }, Date.now(), user);

    const transaction = normalizeTransaction({
      id: `TXN-${Date.now().toString().slice(-8)}`,
      orderId,
      type: 'Debit',
      method: paymentMethod,
      amount: total,
      status: paymentMethod === 'Cash on Delivery' ? 'Pending on delivery' : 'Paid',
      paymentId,
      note: `Order payment for ${orderId}`,
      date: createdAt,
    }, Date.now());

    setOrders((currentOrders) => [order, ...currentOrders]);
    setTransactions((currentTransactions) => [transaction, ...currentTransactions]);

    // Save to Firestore so admin sees it in real-time
    if (db && order) {
      setDoc(doc(db, 'orders', order.id), order).catch(() => {});
    }

    return order;
  };

  // ── Real-time order status sync from Firestore ───────────────────────────
  useEffect(() => {
    if (!db || !user?.id || !isCustomer) return undefined;

    // No orderBy here — combining where+orderBy on different fields needs a
    // composite Firestore index; we sort client-side instead so the query
    // works with only the default single-field indexes.
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', String(user.id))
    );

    return onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const firestoreOrders = snap.docs
        .map((d, i) => normalizeOrder({ ...d.data(), id: d.id }, i + 1, user))
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
      if (firestoreOrders.length > 0) {
        setOrders(firestoreOrders);
      }
    }, () => { /* silent fail — keep localStorage orders */ });
  }, [user?.id, isCustomer]); // eslint-disable-line react-hooks/exhaustive-deps

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) || addresses[0] || null,
    [addresses]
  );

  const value = useMemo(() => ({
    orders,
    transactions,
    addresses,
    defaultAddress,
    saveAddress,
    setDefaultAddress,
    placeCustomerOrder,
  }), [orders, transactions, addresses, defaultAddress]);

  return (
    <CustomerDataContext.Provider value={value}>
      {children}
    </CustomerDataContext.Provider>
  );
}

export const useCustomerData = () => useContext(CustomerDataContext);
