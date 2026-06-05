import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Watches',       icon: '⌚',  color: 'bg-blue-50 hover:bg-blue-100',       active: true },
  { id: 2, name: 'Eyewear',       icon: '🕶️', color: 'bg-indigo-50 hover:bg-indigo-100',   active: true },
  { id: 3, name: 'Electronics',   icon: '💻', color: 'bg-sky-50 hover:bg-sky-100',         active: true },
  { id: 4, name: 'Fashion',       icon: '👗', color: 'bg-pink-50 hover:bg-pink-100',       active: true },
  { id: 5, name: 'Home & Living', icon: '🏠', color: 'bg-emerald-50 hover:bg-emerald-100', active: true },
  { id: 6, name: 'Sports',        icon: '🏋️', color: 'bg-orange-50 hover:bg-orange-100',   active: true },
  { id: 7, name: 'Beauty',        icon: '✨', color: 'bg-purple-50 hover:bg-purple-100',    active: false },
  { id: 8, name: 'Eyeglasses',    icon: '👓', color: 'bg-teal-50 hover:bg-teal-100',       active: true },
  { id: 9, name: 'Sunglasses',    icon: '🕶️', color: 'bg-amber-50 hover:bg-amber-100',      active: true },
  { id: 10, name: 'Contacts',     icon: '👁️', color: 'bg-cyan-50 hover:bg-cyan-100',       active: true },
];

const CategoryContext = createContext();
const STORAGE_KEY = 'vexdeals_categories';
const CLOUD_COLLECTION = 'categories';

// Categories that ship after the original 7 defaults. A one-time, per-device
// migration makes sure these appear even when a device already cached an older
// category list, without resurrecting them once an admin deletes them.
const NEW_SEED_CATEGORIES = DEFAULT_CATEGORIES.filter((category) => category.id >= 8);
const SEED_VERSION = 2;
const SEED_VERSION_KEY = 'vexdeals_categories_seed_version';

const buildSyncState = (overrides = {}) => ({
  mode: db ? 'connecting' : 'local',
  message: db
    ? 'Connecting shared category sync...'
    : 'Cloud category sync is off. Categories save only on this device.',
  errorCode: '',
  ...overrides,
});

const mapCloudError = (error) => {
  switch (error?.code) {
    case 'failed-precondition':
      return 'Enable Cloud Firestore in Firebase Console so categories sync to every device.';
    case 'permission-denied':
      return 'Firestore rules are blocking category sync. Categories are saving only on this device.';
    case 'unavailable':
      return 'Cloud category sync is temporarily unavailable. Categories are saving only on this device.';
    default:
      return 'Cloud category sync is not available right now. Categories are saving only on this device.';
  }
};

const normalizeCategoryList = (list) => {
  const safeList = Array.isArray(list) ? list : DEFAULT_CATEGORIES;
  const total = safeList.length;

  return safeList
    .map((category, index) => ({
      ...category,
      id: Number(category?.id) || index + 1,
      name: String(category?.name || '').trim(),
      icon: String(category?.icon || '🛍️').trim() || '🛍️',
      color: String(category?.color || 'bg-blue-50 hover:bg-blue-100').trim() || 'bg-blue-50 hover:bg-blue-100',
      image: typeof category?.image === 'string' ? category.image.trim() : '',
      active: Boolean(category?.active),
      sortOrder: Number(category?.sortOrder) || index + 1 || total,
    }))
    .filter((category) => category.name)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
};

const readStoredCategories = () => {
  if (typeof window === 'undefined') {
    return normalizeCategoryList(DEFAULT_CATEGORIES);
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeCategoryList(JSON.parse(saved)) : normalizeCategoryList(DEFAULT_CATEGORIES);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return normalizeCategoryList(DEFAULT_CATEGORIES);
  }
};

const serializeCategory = (category) => ({
  ...category,
  updatedAt: new Date().toISOString(),
});

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState(() => readStoredCategories());
  const [syncState, setSyncState] = useState(() => buildSyncState());
  const channelRef = useRef(null);
  const lastSnapshotRef = useRef(JSON.stringify(categories));
  const categoriesRef = useRef(categories);
  const cloudHasDataRef = useRef(false);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    const snapshot = JSON.stringify(categories);
    if (snapshot === lastSnapshotRef.current) return;

    lastSnapshotRef.current = snapshot;
    try { localStorage.setItem(STORAGE_KEY, snapshot); } catch { /* quota / private mode */ }
    channelRef.current?.postMessage(snapshot);
  }, [categories]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    channelRef.current = 'BroadcastChannel' in window ? new BroadcastChannel(STORAGE_KEY) : null;

    const syncCategories = (nextCategories) => {
      const snapshot = JSON.stringify(nextCategories);
      if (snapshot === lastSnapshotRef.current) return;
      lastSnapshotRef.current = snapshot;
      setCategories(nextCategories);
    };

    const handleStorage = (event) => {
      if (event.key && event.key !== STORAGE_KEY) return;
      syncCategories(readStoredCategories());
    };

    const handleFocus = () => {
      syncCategories(readStoredCategories());
    };

    const handleMessage = (event) => {
      try {
        syncCategories(normalizeCategoryList(JSON.parse(event.data)));
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

  useEffect(() => {
    if (!db) return undefined;

    const categoriesQuery = query(collection(db, CLOUD_COLLECTION), orderBy('sortOrder', 'asc'));

    return onSnapshot(
      categoriesQuery,
      (snapshot) => {
        if (snapshot.empty) {
          cloudHasDataRef.current = false;
          setSyncState(buildSyncState({
            mode: 'cloud-empty',
            message: 'Shared category sync is ready. Add or edit a category once to publish it to every device.',
          }));
          return;
        }

        const nextCategories = normalizeCategoryList(
          snapshot.docs.map((docSnapshot) => ({
            ...docSnapshot.data(),
            id: docSnapshot.data().id ?? docSnapshot.id,
          }))
        );

        cloudHasDataRef.current = nextCategories.length > 0;
        setCategories(nextCategories);
        setSyncState(buildSyncState({
          mode: 'cloud',
          message: 'Categories are syncing live across devices.',
        }));
      },
      (error) => {
        cloudHasDataRef.current = false;
        setSyncState(buildSyncState({
          mode: 'local-error',
          message: mapCloudError(error),
          errorCode: error?.code || '',
        }));
      }
    );
  }, []);

  // One-time migration: ensure newer default categories are present even on
  // devices that cached an older list. Deferred so the cloud subscription has
  // settled first; guarded by a version flag so it only runs once per device.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return undefined;

    let applied = 0;
    try { applied = Number(localStorage.getItem(SEED_VERSION_KEY) || 0); } catch { applied = 0; }
    if (applied >= SEED_VERSION) { seededRef.current = true; return undefined; }

    const timer = window.setTimeout(() => {
      seededRef.current = true;
      try { localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION)); } catch { /* ignore */ }

      const current = categoriesRef.current;
      const existingNames = new Set(current.map((category) => category.name.toLowerCase()));
      const additions = NEW_SEED_CATEGORIES.filter((category) => !existingNames.has(category.name.toLowerCase()));
      if (!additions.length) return;

      const merged = normalizeCategoryList([...current, ...additions]);
      setCategories(merged);

      if (!db) return;

      if (cloudHasDataRef.current) {
        // Cloud already populated — just publish the new categories.
        additions.forEach((category) => {
          const full = merged.find((item) => item.name.toLowerCase() === category.name.toLowerCase());
          if (full) setDoc(doc(db, CLOUD_COLLECTION, String(full.id)), serializeCategory(full)).catch(() => {});
        });
      } else {
        // Cloud empty — publish the full merged catalog so nothing is dropped.
        Promise.all(
          merged.map((category) => setDoc(doc(db, CLOUD_COLLECTION, String(category.id)), serializeCategory(category)))
        ).then(() => { cloudHasDataRef.current = true; }).catch(() => {});
      }
    }, 2000);

    return () => window.clearTimeout(timer);
  }, []);

  const ensureCloudSeeded = async (baselineCategories) => {
    if (!db || cloudHasDataRef.current) return;

    const normalizedBaseline = normalizeCategoryList(baselineCategories);
    if (!normalizedBaseline.length) return;

    await Promise.all(
      normalizedBaseline.map((category) =>
        setDoc(doc(db, CLOUD_COLLECTION, String(category.id)), serializeCategory(category))
      )
    );

    cloudHasDataRef.current = true;
  };

  const writeCloudCategory = async (category) => {
    if (!db) return;

    await setDoc(doc(db, CLOUD_COLLECTION, String(category.id)), serializeCategory(category));
    setSyncState(buildSyncState({
      mode: 'cloud',
      message: 'Categories are syncing live across devices.',
    }));
  };

  const handleCloudFailure = (error) => {
    setSyncState(buildSyncState({
      mode: 'local-error',
      message: mapCloudError(error),
      errorCode: error?.code || '',
    }));
  };

  const activeCategories = useMemo(
    () => categories.filter((category) => category.active),
    [categories]
  );

  const addCategory = async (name, icon, image = '') => {
    const baselineCategories = categoriesRef.current;
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

    const nextId = baselineCategories.reduce((maxId, category) => Math.max(maxId, category.id), 0) + 1;
    const nextSortOrder = baselineCategories.reduce((maxSortOrder, category) => Math.max(maxSortOrder, category.sortOrder || 0), 0) + 1;
    const normalized = normalizeCategoryList([{
      id: nextId,
      name,
      icon,
      image,
      color: colors[baselineCategories.length % colors.length],
      active: true,
      sortOrder: nextSortOrder,
    }])[0];

    if (!normalized) return null;

    let fullUpdated = null;
    setCategories((currentCategories) => {
      const next = [...currentCategories, normalized];
      fullUpdated = next;
      return next;
    });

    if (!db) return normalized;

    try {
      if (!cloudHasDataRef.current) {
        // Seed with the post-add list so onSnapshot never reverts the optimistic add
        await Promise.all(
          fullUpdated.map((cat) =>
            setDoc(doc(db, CLOUD_COLLECTION, String(cat.id)), serializeCategory(cat))
          )
        );
        cloudHasDataRef.current = true;
      } else {
        await writeCloudCategory(normalized);
      }
      setSyncState(buildSyncState({ mode: 'cloud', message: 'Categories are syncing live across devices.' }));
    } catch (error) {
      handleCloudFailure(error);
    }

    return normalized;
  };

  const removeCategory = async (id) => {
    let fullUpdated = null;

    setCategories((currentCategories) => {
      const next = currentCategories.filter((category) => category.id !== id);
      fullUpdated = next;
      return next;
    });

    if (!db) return;

    try {
      if (!cloudHasDataRef.current) {
        // Seed with the post-remove list so onSnapshot never reverts the optimistic removal
        await Promise.all(
          fullUpdated.map((cat) =>
            setDoc(doc(db, CLOUD_COLLECTION, String(cat.id)), serializeCategory(cat))
          )
        );
        cloudHasDataRef.current = true;
      } else {
        await deleteDoc(doc(db, CLOUD_COLLECTION, String(id)));
      }
      setSyncState(buildSyncState({
        mode: 'cloud',
        message: 'Categories are syncing live across devices.',
      }));
    } catch (error) {
      handleCloudFailure(error);
    }
  };

  const toggleCategory = async (id) => {
    let nextCategory = null;
    let fullUpdated = null;

    setCategories((currentCategories) => {
      const next = currentCategories.map((category) => {
        if (category.id !== id) return category;
        nextCategory = { ...category, active: !category.active };
        return nextCategory;
      });
      fullUpdated = next;
      return next;
    });

    if (!db || !nextCategory) return;

    try {
      if (!cloudHasDataRef.current) {
        // Seed ALL categories with the already-toggled state so onSnapshot
        // never reverts the optimistic UI update
        await Promise.all(
          fullUpdated.map((cat) =>
            setDoc(doc(db, CLOUD_COLLECTION, String(cat.id)), serializeCategory(cat))
          )
        );
        cloudHasDataRef.current = true;
      } else {
        await writeCloudCategory(nextCategory);
      }
      setSyncState(buildSyncState({ mode: 'cloud', message: 'Categories are syncing live across devices.' }));
    } catch (error) {
      handleCloudFailure(error);
    }
  };

  const updateCategory = async (id, updates) => {
    let nextCategory = null;
    let fullUpdated = null;

    setCategories((currentCategories) => {
      const next = currentCategories.map((category) => {
        if (category.id !== id) return category;
        nextCategory = normalizeCategoryList([{ ...category, ...updates }])[0] || category;
        return nextCategory;
      });
      fullUpdated = next;
      return next;
    });

    if (!db || !nextCategory) return nextCategory;

    try {
      if (!cloudHasDataRef.current) {
        // Seed with the post-update list so onSnapshot never reverts the optimistic update
        await Promise.all(
          fullUpdated.map((cat) =>
            setDoc(doc(db, CLOUD_COLLECTION, String(cat.id)), serializeCategory(cat))
          )
        );
        cloudHasDataRef.current = true;
      } else {
        await writeCloudCategory(nextCategory);
      }
      setSyncState(buildSyncState({ mode: 'cloud', message: 'Categories are syncing live across devices.' }));
    } catch (error) {
      handleCloudFailure(error);
    }

    return nextCategory;
  };

  const value = useMemo(() => ({
    categories,
    activeCategories,
    addCategory,
    removeCategory,
    toggleCategory,
    updateCategory,
    syncState,
  }), [categories, activeCategories, syncState]);

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => useContext(CategoryContext);
