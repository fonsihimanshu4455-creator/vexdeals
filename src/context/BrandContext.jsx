import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

/**
 * BrandContext — manages the master list of brands shown across the site.
 *
 *  - Persists to localStorage
 *  - Syncs across tabs via BroadcastChannel + storage events
 *  - Seeded with popular watch / eyewear / fashion brands using
 *    Clearbit's logo CDN, which the admin can override at any time
 */

const BrandContext = createContext();
const STORAGE_KEY  = 'vexdeals_brands';
const CHANNEL_KEY  = 'vexdeals_brands_channel';

// Clearbit-served logos — admin can replace any of these from the Brands page.
const LOGO = (domain) => `https://logo.clearbit.com/${domain}`;

const DEFAULT_BRANDS = [
  // ── Eyewear ──
  { name: 'Ray-Ban',           categories: ['Eyewear', 'Sunglasses', 'Eyeglasses'], logo: LOGO('ray-ban.com') },
  { name: 'Oakley',            categories: ['Eyewear', 'Sunglasses'],               logo: LOGO('oakley.com') },
  { name: 'Persol',            categories: ['Eyewear', 'Sunglasses'],               logo: LOGO('persol.com') },
  { name: 'Tom Ford',          categories: ['Eyewear', 'Fashion'],                  logo: LOGO('tomford.com') },
  { name: 'Carrera',           categories: ['Eyewear', 'Sunglasses'],               logo: LOGO('carreraworld.com') },
  { name: 'Maui Jim',          categories: ['Eyewear', 'Sunglasses'],               logo: LOGO('mauijim.com') },
  { name: 'Vogue Eyewear',     categories: ['Eyewear', 'Eyeglasses'],               logo: LOGO('vogue-eyewear.com') },

  // ── Luxury (eyewear + fashion) ──
  { name: 'Louis Vuitton',     categories: ['Eyewear', 'Fashion'],                  logo: LOGO('louisvuitton.com') },
  { name: 'Gucci',             categories: ['Eyewear', 'Fashion'],                  logo: LOGO('gucci.com') },
  { name: 'Prada',             categories: ['Eyewear', 'Fashion'],                  logo: LOGO('prada.com') },
  { name: 'Versace',           categories: ['Eyewear', 'Fashion'],                  logo: LOGO('versace.com') },
  { name: 'Burberry',          categories: ['Eyewear', 'Fashion'],                  logo: LOGO('burberry.com') },
  { name: 'Dior',              categories: ['Eyewear', 'Fashion'],                  logo: LOGO('dior.com') },
  { name: 'Cartier',           categories: ['Eyewear', 'Watches'],                  logo: LOGO('cartier.com') },
  { name: 'Chanel',            categories: ['Eyewear', 'Fashion'],                  logo: LOGO('chanel.com') },
  { name: 'Armani',            categories: ['Eyewear', 'Fashion', 'Watches'],       logo: LOGO('armani.com') },
  { name: 'Hugo Boss',         categories: ['Eyewear', 'Fashion', 'Watches'],       logo: LOGO('hugoboss.com') },

  // ── Watches ──
  { name: 'Rolex',             categories: ['Watches'],            logo: LOGO('rolex.com') },
  { name: 'Omega',             categories: ['Watches'],            logo: LOGO('omegawatches.com') },
  { name: 'Tag Heuer',         categories: ['Watches'],            logo: LOGO('tagheuer.com') },
  { name: 'Tissot',            categories: ['Watches'],            logo: LOGO('tissotwatches.com') },
  { name: 'Casio',             categories: ['Watches'],            logo: LOGO('casio.com') },
  { name: 'G-Shock',           categories: ['Watches'],            logo: LOGO('gshock.com') },
  { name: 'Seiko',             categories: ['Watches'],            logo: LOGO('seikowatches.com') },
  { name: 'Citizen',           categories: ['Watches'],            logo: LOGO('citizenwatch.com') },
  { name: 'Fossil',            categories: ['Watches', 'Fashion'], logo: LOGO('fossil.com') },
  { name: 'Daniel Wellington', categories: ['Watches'],            logo: LOGO('danielwellington.com') },
  { name: 'Titan',             categories: ['Watches'],            logo: LOGO('titanwatches.com') },
  { name: 'Fastrack',          categories: ['Watches'],            logo: LOGO('fastrack.in') },
  { name: 'Apple',             categories: ['Watches', 'Electronics'], logo: LOGO('apple.com') },
  { name: 'Samsung',           categories: ['Watches', 'Electronics'], logo: LOGO('samsung.com') },
];

const slugify = (s) => String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const normalizeBrand = (raw, idx = 0) => {
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.name || '').trim();
  if (!name) return null;
  const slug = String(raw.slug || slugify(name));
  return {
    id:        Number(raw.id) || idx + 1,
    name,
    slug,
    logo:      String(raw.logo || '').trim(),
    active:    raw.active !== false,
    categories: Array.isArray(raw.categories) ? raw.categories.map(String) : [],
    sortOrder: Number(raw.sortOrder) || idx + 1,
  };
};

const normalizeBrandList = (list) => {
  const safe = Array.isArray(list) ? list : DEFAULT_BRANDS;
  // de-dup by slug, preserve order
  const seen = new Set();
  return safe
    .map((b, i) => normalizeBrand(b, i))
    .filter((b) => {
      if (!b) return false;
      if (seen.has(b.slug)) return false;
      seen.add(b.slug);
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
};

const readStored = () => {
  if (typeof window === 'undefined') return normalizeBrandList(DEFAULT_BRANDS);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return normalizeBrandList(DEFAULT_BRANDS);
    return normalizeBrandList(JSON.parse(saved));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return normalizeBrandList(DEFAULT_BRANDS);
  }
};

export function BrandProvider({ children }) {
  const [brands, setBrands] = useState(() => readStored());
  const channelRef = useRef(null);
  const lastSnap   = useRef(JSON.stringify(brands));

  // Persist + broadcast on change
  useEffect(() => {
    const snap = JSON.stringify(brands);
    if (snap === lastSnap.current) return;
    lastSnap.current = snap;
    try { localStorage.setItem(STORAGE_KEY, snap); } catch { /* */ }
    channelRef.current?.postMessage(snap);
  }, [brands]);

  // Cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    channelRef.current = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_KEY) : null;

    const apply = (incoming) => {
      const snap = JSON.stringify(incoming);
      if (snap === lastSnap.current) return;
      lastSnap.current = snap;
      setBrands(incoming);
    };

    const onStorage = (e) => {
      if (e.key && e.key !== STORAGE_KEY) return;
      apply(readStored());
    };
    const onMessage = (e) => {
      try { apply(normalizeBrandList(JSON.parse(e.data))); }
      catch { apply(readStored()); }
    };

    window.addEventListener('storage', onStorage);
    channelRef.current?.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('storage', onStorage);
      channelRef.current?.removeEventListener('message', onMessage);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  const activeBrands = useMemo(() => brands.filter((b) => b.active), [brands]);
  const brandBySlug  = useMemo(() => {
    const m = new Map();
    brands.forEach((b) => m.set(b.slug, b));
    return m;
  }, [brands]);

  const getBrand = (slugOrName) => {
    if (!slugOrName) return null;
    const key = slugify(slugOrName);
    return brandBySlug.get(key) || brands.find((b) => slugify(b.name) === key) || null;
  };

  const brandsForCategory = (categoryName) => {
    if (!categoryName) return activeBrands;
    const cat = String(categoryName).toLowerCase();
    const matched   = activeBrands.filter((b) => b.categories.some((c) => c.toLowerCase() === cat));
    const universal = activeBrands.filter((b) => b.categories.length === 0);
    const others    = activeBrands.filter((b) => !matched.includes(b) && !universal.includes(b));
    return [...matched, ...universal, ...others];
  };

  const addBrand = (data) => {
    const nextId = brands.reduce((m, b) => Math.max(m, b.id), 0) + 1;
    const nextSort = brands.reduce((m, b) => Math.max(m, b.sortOrder), 0) + 1;
    const normalized = normalizeBrand({
      id: nextId,
      sortOrder: nextSort,
      active: true,
      ...data,
      slug: slugify(data?.name || ''),
    }, brands.length);
    if (!normalized) return null;
    setBrands((cur) => normalizeBrandList([...cur, normalized]));
    return normalized;
  };

  const updateBrand = (id, patch) => {
    setBrands((cur) =>
      normalizeBrandList(
        cur.map((b) => (b.id === id ? { ...b, ...patch, slug: slugify(patch?.name ?? b.name) } : b))
      )
    );
  };

  const removeBrand = (id) => setBrands((cur) => cur.filter((b) => b.id !== id));
  const toggleBrand = (id) => setBrands((cur) => cur.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));

  const value = useMemo(() => ({
    brands,
    activeBrands,
    addBrand,
    updateBrand,
    removeBrand,
    toggleBrand,
    getBrand,
    brandsForCategory,
  }), [brands, activeBrands]);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export const useBrands = () => useContext(BrandContext);
