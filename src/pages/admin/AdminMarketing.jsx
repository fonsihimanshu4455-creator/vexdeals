import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Image, Tag, Calendar, Percent, IndianRupee, X, Check, Copy, Eye, Edit2, Upload, Wifi, WifiOff } from 'lucide-react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const getPosters = () => {
  try { return JSON.parse(localStorage.getItem('vexdeals_posters') || '[]'); }
  catch { return []; }
};
const getPromoCodes = () => {
  try { return JSON.parse(localStorage.getItem('vexdeals_promos') || '[]'); }
  catch { return []; }
};
const savePosters = (d) => localStorage.setItem('vexdeals_posters', JSON.stringify(d));
const savePromos  = (d) => localStorage.setItem('vexdeals_promos', JSON.stringify(d));

// Cloudinary (free, no card) — poster images upload here so the stored value is
// a small URL (base64 images blow past Firestore's 1MB doc limit).
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlgnlc3nm';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'testvex';
const uploadImageToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
      .then(r => r.json())
      .then(d => d.secure_url ? resolve(d.secure_url) : reject(new Error(d.error?.message || 'Upload failed')))
      .catch(() => reject(new Error('Network error during upload')));
  });

// Mirror posters to the shared Firestore `posters` collection so customers see them.
const syncPosterToCloud = (poster) => {
  if (db) setDoc(doc(db, 'posters', String(poster.id)), poster).catch(() => {});
};
const deletePosterFromCloud = (id) => {
  if (db) deleteDoc(doc(db, 'posters', String(id))).catch(() => {});
};

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'VEX' + Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const BLANK_POSTER = { title: '', imageUrl: '', caption: '', startDate: '', endDate: '' };

export default function AdminMarketing() {
  const { canManageMarketing } = useAuth();
  const [tab, setTab]           = useState('posters');
  const [posters, setPosters]   = useState(getPosters);
  const [promos, setPromos]     = useState(getPromoCodes);
  const [promoSync, setPromoSync] = useState(!!db);

  // poster modal state
  const [showPoster, setShowPoster]       = useState(false);
  const [editPosterId, setEditPosterId]   = useState(null); // null = add new, else edit
  const [posterForm, setPosterForm]       = useState(BLANK_POSTER);
  const [posterImgMode, setPosterImgMode] = useState('url'); // 'url' | 'upload'
  const [posterImgPreview, setPosterImgPreview] = useState('');
  const [posterError, setPosterError]     = useState('');
  const [posterUploading, setPosterUploading] = useState(false);
  const posterFileRef = useRef();

  // promo state
  const [showPromo, setShowPromo]   = useState(false);
  const [deletePromoId, setDeletePromoId] = useState(null);
  const [promoForm, setPromoForm]   = useState({
    code: generateCode(), type: 'percent', value: '', minOrder: '', maxUses: '', expiry: '', description: '',
  });
  const [promoError, setPromoError] = useState('');

  // misc
  const [deletePosterId, setDeletePosterId] = useState(null);
  const [copiedCode, setCopiedCode]         = useState(null);
  const [previewPoster, setPreviewPoster]   = useState(null);

  useEffect(() => { savePosters(posters); }, [posters]);
  useEffect(() => { savePromos(promos);   }, [promos]);

  // Real-time poster sync from Firestore (+ migrate existing URL posters once)
  useEffect(() => {
    if (!db) return;
    getPosters()
      .filter(p => p.imageUrl && !p.imageUrl.startsWith('data:'))
      .forEach(syncPosterToCloud);
    const q = query(collection(db, 'posters'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      if (snap.empty) return;
      setPosters(snap.docs.map(d => ({ ...d.data(), id: d.data().id ?? d.id })));
    }, () => {});
  }, []);

  // Real-time promo sync from Firestore
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'promos'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      if (snap.empty) { setPromoSync(true); return; }
      const fsPromos = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setPromos(fsPromos);
      setPromoSync(true);
    }, () => setPromoSync(false));
  }, []);

  if (!canManageMarketing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Tag size={48} className="text-gray-200 mb-4" />
        <p className="text-gray-500 font-semibold">You don't have access to marketing features.</p>
      </div>
    );
  }

  // ── Poster helpers ────────────────────────────────────────────────────────
  const openAddPoster = () => {
    setEditPosterId(null);
    setPosterForm(BLANK_POSTER);
    setPosterImgMode('url');
    setPosterImgPreview('');
    setPosterError('');
    setShowPoster(true);
  };

  const openEditPoster = (poster) => {
    setEditPosterId(poster.id);
    setPosterForm({ title: poster.title, imageUrl: poster.imageUrl, caption: poster.caption || '', startDate: poster.startDate || '', endDate: poster.endDate || '' });
    const isBase64 = poster.imageUrl?.startsWith('data:');
    setPosterImgMode(isBase64 ? 'upload' : 'url');
    setPosterImgPreview(poster.imageUrl || '');
    setPosterError('');
    setShowPoster(true);
  };

  const handlePosterImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setPosterError('Image too large. Max 10 MB.');
      return;
    }
    try {
      setPosterUploading(true);
      setPosterError('');
      const url = await uploadImageToCloudinary(file);
      setPosterImgPreview(url);
      setPosterForm(f => ({ ...f, imageUrl: url }));
    } catch (err) {
      setPosterError(err.message || 'Image upload failed.');
    } finally {
      setPosterUploading(false);
    }
  };

  const handleSavePoster = () => {
    if (!posterForm.title.trim() || !posterForm.imageUrl.trim()) {
      setPosterError('Title and image are required');
      return;
    }
    if (editPosterId) {
      setPosters(prev => prev.map(p => {
        if (p.id !== editPosterId) return p;
        const updated = { ...p, ...posterForm, title: posterForm.title.trim() };
        syncPosterToCloud(updated);
        return updated;
      }));
    } else {
      const newPoster = {
        id: Date.now(),
        ...posterForm,
        title: posterForm.title.trim(),
        active: true,
        createdAt: new Date().toISOString(),
      };
      setPosters(prev => [...prev, newPoster]);
      syncPosterToCloud(newPoster);
    }
    setShowPoster(false);
    setPosterError('');
  };

  const togglePoster = (id) => setPosters(prev => prev.map(p => {
    if (p.id !== id) return p;
    const updated = { ...p, active: !p.active };
    syncPosterToCloud(updated);
    return updated;
  }));

  // ── Promo helpers ─────────────────────────────────────────────────────────
  const handleAddPromo = () => {
    if (!promoForm.code.trim() || !promoForm.value) {
      setPromoError('Code and discount value are required');
      return;
    }
    if (isNaN(Number(promoForm.value)) || Number(promoForm.value) <= 0) {
      setPromoError('Enter a valid discount value');
      return;
    }
    if (promos.find(p => p.code.toUpperCase() === promoForm.code.toUpperCase())) {
      setPromoError('This promo code already exists');
      return;
    }
    const newPromo = {
      id: String(Date.now()),
      code: promoForm.code.toUpperCase().trim(),
      type: promoForm.type,
      value: Number(promoForm.value),
      minOrder: promoForm.minOrder ? Number(promoForm.minOrder) : 0,
      maxUses: promoForm.maxUses ? Number(promoForm.maxUses) : null,
      usedCount: 0,
      expiry: promoForm.expiry || null,
      description: promoForm.description.trim(),
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPromos(prev => [...prev, newPromo]);
    if (db) {
      setDoc(doc(db, 'promos', newPromo.id), newPromo).catch(() => {});
    }
    setPromoForm({ code: generateCode(), type: 'percent', value: '', minOrder: '', maxUses: '', expiry: '', description: '' });
    setPromoError('');
    setShowPromo(false);
  };

  const togglePromo = (id) => {
    setPromos(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, active: !p.active };
      if (db) setDoc(doc(db, 'promos', String(id)), updated, { merge: true }).catch(() => {});
      return updated;
    }));
  };
  const isExpired = (expiry) => {
    if (!expiry) return false;
    const endOfDay = new Date(`${expiry}T23:59:59`);
    return Number.isFinite(endOfDay.getTime()) && endOfDay.getTime() < Date.now();
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-gray-500 text-sm">{posters.length} posters · {promos.length} promo codes</p>
            {promoSync ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><Wifi size={11} /> Live</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium"><WifiOff size={11} /> Local</span>
            )}
          </div>
        </div>
        <button
          onClick={() => tab === 'posters' ? openAddPoster() : setShowPromo(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus size={18} /> {tab === 'posters' ? 'Add Poster' : 'New Promo Code'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Posters',  value: posters.length,                                              color: 'text-primary-700' },
          { label: 'Active Posters', value: posters.filter(p => p.active).length,                       color: 'text-emerald-600' },
          { label: 'Total Codes',    value: promos.length,                                               color: 'text-primary-700' },
          { label: 'Active Codes',   value: promos.filter(p => p.active && !isExpired(p.expiry)).length, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'posters', label: 'Marketing Posters', Icon: Image },
          { key: 'promos',  label: 'Promo Codes',       Icon: Tag   },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === key ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ── POSTERS TAB ─────────────────────────────────────────────────────── */}
      {tab === 'posters' && (
        <div>
          {posters.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Image size={48} className="text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No marketing posters yet</h3>
              <p className="text-gray-400 text-sm mb-6">Add daily promotional banners to feature on your site</p>
              <button onClick={openAddPoster} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 inline-flex items-center gap-2">
                <Plus size={18} /> Add First Poster
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posters.map(poster => (
                <div key={poster.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="relative aspect-video bg-gray-100 cursor-pointer" onClick={() => setPreviewPoster(poster)}>
                    <img
                      src={poster.imageUrl}
                      alt={poster.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = `https://picsum.photos/seed/${poster.id}/400/225`; }}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye size={24} className="text-white drop-shadow opacity-0 group-hover:opacity-100" />
                    </div>
                    <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                      poster.active ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
                    }`}>
                      {poster.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 text-sm">{poster.title}</h4>
                    {poster.caption && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{poster.caption}</p>}
                    {(poster.startDate || poster.endDate) && (
                      <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                        <Calendar size={11} />
                        {poster.startDate || '—'} → {poster.endDate || '∞'}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => togglePoster(poster.id)}
                        className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors ${
                          poster.active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {poster.active ? 'Hide' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openEditPoster(poster)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletePosterId(poster.id)}
                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PROMO CODES TAB ──────────────────────────────────────────────────── */}
      {tab === 'promos' && (
        <div>
          {promos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Tag size={48} className="text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No promo codes yet</h3>
              <p className="text-gray-400 text-sm mb-6">Create discount codes for campaigns and flash sales</p>
              <button onClick={() => setShowPromo(true)} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 inline-flex items-center gap-2">
                <Plus size={18} /> Create First Code
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Order</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promos.map((promo, i) => {
                      const expired = isExpired(promo.expiry);
                      return (
                        <tr key={promo.id} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded-lg text-sm">{promo.code}</span>
                              <button onClick={() => copyCode(promo.code)} className="text-gray-400 hover:text-primary-600 transition-colors" title="Copy">
                                {copiedCode === promo.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                              </button>
                            </div>
                            {promo.description && <p className="text-xs text-gray-400 mt-0.5">{promo.description}</p>}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-gray-900 flex items-center gap-0.5">
                              {promo.type === 'percent' ? <Percent size={14} /> : <IndianRupee size={14} />}
                              {promo.value}{promo.type === 'percent' ? '% off' : ' off'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {promo.minOrder ? `₹${promo.minOrder.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {promo.usedCount}{promo.maxUses ? `/${promo.maxUses}` : ''} uses
                          </td>
                          <td className="px-5 py-4 text-sm">
                            {promo.expiry ? (
                              <span className={expired ? 'text-red-500 font-semibold' : 'text-gray-600'}>
                                {promo.expiry}{expired && <span className="ml-1 text-xs">(expired)</span>}
                              </span>
                            ) : <span className="text-gray-400">Never</span>}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => togglePromo(promo.id)}
                              className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                                promo.active && !expired
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {promo.active && !expired ? 'Active' : expired ? 'Expired' : 'Disabled'}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => setDeletePromoId(promo.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ADD / EDIT POSTER MODAL ──────────────────────────────────────────── */}
      {showPoster && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{editPosterId ? 'Edit Poster' : 'Add Marketing Poster'}</h3>
              <button onClick={() => setShowPoster(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {posterError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{posterError}</div>}

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Poster Title *</label>
                <input
                  type="text"
                  value={posterForm.title}
                  onChange={e => setPosterForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Summer Watch Sale 2026"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600"
                />
              </div>

              {/* Image — URL or Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poster Image *</label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setPosterImgMode('url')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${posterImgMode === 'url' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    Paste URL
                  </button>
                  <button
                    onClick={() => { setPosterImgMode('upload'); setTimeout(() => posterFileRef.current?.click(), 50); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors flex items-center justify-center gap-1.5 ${posterImgMode === 'upload' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    <Upload size={14} /> Upload File
                  </button>
                  <input
                    ref={posterFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePosterImageUpload}
                  />
                </div>

                {posterImgMode === 'url' ? (
                  <input
                    type="url"
                    value={posterForm.imageUrl.startsWith('data:') ? '' : posterForm.imageUrl}
                    onChange={e => { setPosterForm(f => ({ ...f, imageUrl: e.target.value })); setPosterImgPreview(e.target.value); }}
                    placeholder="https://example.com/poster.jpg"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600"
                  />
                ) : (
                  <div
                    onClick={() => !posterUploading && posterFileRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                  >
                    {posterUploading ? (
                      <div className="py-6 flex flex-col items-center gap-2 text-primary-600">
                        <Upload size={26} className="animate-pulse" />
                        <p className="text-sm font-medium">Uploading…</p>
                      </div>
                    ) : posterImgPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={posterImgPreview} alt="preview" className="w-full max-h-36 object-cover rounded-xl border" />
                        <p className="text-xs text-primary-600 font-medium">Click to change</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload size={28} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload poster image</p>
                        <p className="text-xs text-gray-400 mt-1">JPG / PNG / WebP · Max 10 MB</p>
                        <p className="text-xs text-gray-400">Recommended: <strong>1200×630 px</strong> (landscape)</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Preview for URL mode */}
                {posterImgMode === 'url' && posterImgPreview && !posterImgPreview.startsWith('data:') && (
                  <div className="mt-2 rounded-xl overflow-hidden aspect-video bg-gray-100">
                    <img src={posterImgPreview} alt="preview" className="w-full h-full object-cover"
                      onError={e => { e.target.src = `https://picsum.photos/seed/poster/400/225`; }} />
                  </div>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Caption</label>
                <textarea
                  value={posterForm.caption}
                  onChange={e => setPosterForm(f => ({ ...f, caption: e.target.value }))}
                  placeholder="Up to 50% off on premium watches this season…"
                  rows={2}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 resize-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input type="date" value={posterForm.startDate} onChange={e => setPosterForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                  <input type="date" value={posterForm.endDate} onChange={e => setPosterForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-600" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPoster(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSavePoster} className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700">
                {editPosterId ? 'Save Changes' : 'Add Poster'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD PROMO MODAL ──────────────────────────────────────────────────── */}
      {showPromo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Create Promo Code</h3>
              <button onClick={() => { setShowPromo(false); setPromoError(''); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {promoError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{promoError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Promo Code *</label>
                <div className="flex gap-2">
                  <input type="text" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="VEXSALE25" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 font-mono font-bold uppercase" />
                  <button type="button" onClick={() => setPromoForm(f => ({ ...f, code: generateCode() }))}
                    className="bg-gray-100 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-200 text-xs font-semibold whitespace-nowrap">
                    Random
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'percent', label: '% Percent', Icon: Percent },
                    { value: 'flat',    label: '₹ Flat',    Icon: IndianRupee },
                  ].map(({ value, label, Icon }) => (
                    <label key={value} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      promoForm.type === value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="radio" name="type" value={value} checked={promoForm.type === value} onChange={() => setPromoForm(f => ({ ...f, type: value }))} className="hidden" />
                      <Icon size={16} className={promoForm.type === value ? 'text-primary-600' : 'text-gray-400'} />
                      <span className="text-sm font-semibold text-gray-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Discount Value * {promoForm.type === 'percent' ? '(%)' : '(₹)'}
                </label>
                <input type="number" value={promoForm.value} onChange={e => setPromoForm(f => ({ ...f, value: e.target.value }))}
                  placeholder={promoForm.type === 'percent' ? '10' : '100'} min="1"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Order (₹)</label>
                  <input type="number" value={promoForm.minOrder} onChange={e => setPromoForm(f => ({ ...f, minOrder: e.target.value }))}
                    placeholder="500" min="0"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Uses</label>
                  <input type="number" value={promoForm.maxUses} onChange={e => setPromoForm(f => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Unlimited" min="1"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date <span className="text-gray-400 font-normal">(blank = never expires)</span></label>
                <input type="date" value={promoForm.expiry} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setPromoForm(f => ({ ...f, expiry: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (internal)</label>
                <input type="text" value={promoForm.description} onChange={e => setPromoForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Summer launch campaign - June 2026"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowPromo(false); setPromoError(''); }} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddPromo} className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700">Create Code</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Poster Modal */}
      {previewPoster && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewPoster(null)}>
          <div className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={previewPoster.imageUrl} alt={previewPoster.title} className="w-full object-cover max-h-96"
                onError={e => { e.target.src = `https://picsum.photos/seed/${previewPoster.id}/600/300`; }} />
              <button onClick={() => setPreviewPoster(null)} className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"><X size={18} /></button>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 text-lg">{previewPoster.title}</h3>
              {previewPoster.caption && <p className="text-gray-500 text-sm mt-1">{previewPoster.caption}</p>}
              <p className="text-xs text-gray-400 mt-2">Campaign: {previewPoster.startDate || '—'} to {previewPoster.endDate || '∞'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Poster */}
      {deletePosterId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="font-bold text-gray-900 mb-2">Delete Poster?</h3>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePosterId(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={() => { deletePosterFromCloud(deletePosterId); setPosters(prev => prev.filter(p => p.id !== deletePosterId)); setDeletePosterId(null); }}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Promo */}
      {deletePromoId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="font-bold text-gray-900 mb-2">Delete Promo Code?</h3>
            <p className="text-gray-500 text-sm mb-5">
              Code <span className="font-mono font-bold">{promos.find(p => p.id === deletePromoId)?.code}</span> will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePromoId(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={() => {
                setPromos(prev => prev.filter(p => p.id !== deletePromoId));
                if (db) deleteDoc(doc(db, 'promos', String(deletePromoId))).catch(() => {});
                setDeletePromoId(null);
              }}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
