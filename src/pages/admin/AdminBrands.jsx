import { useMemo, useRef, useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, Upload, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useBrands } from '../../context/BrandContext';
import { useCategories } from '../../context/CategoryContext';
import BrandLogo from '../../components/BrandLogo';

const emptyForm = (categoryNames = []) => ({
  name: '',
  logo: '',
  active: true,
  categories: [],
  __availableCategories: categoryNames,
});

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = () => reject(new Error('Could not read file'));
    r.readAsDataURL(file);
  });

export default function AdminBrands() {
  const { brands, addBrand, updateBrand, removeBrand, toggleBrand } = useBrands();
  const { categories: adminCategories } = useCategories();

  const categoryNames = useMemo(
    () => adminCategories.map((c) => c.name).filter(Boolean),
    [adminCategories]
  );

  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [addOpen, setAddOpen]     = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(() => emptyForm(categoryNames));
  const [error, setError]         = useState('');
  const [deleteId, setDeleteId]   = useState(null);
  const fileRef = useRef(null);

  const filtered = useMemo(() => {
    return brands.filter((b) => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        filterCat === 'All' ||
        (filterCat === 'Universal' && b.categories.length === 0) ||
        b.categories.includes(filterCat);
      return matchSearch && matchCat;
    });
  }, [brands, search, filterCat]);

  const startAdd = () => {
    setEditId(null);
    setForm(emptyForm(categoryNames));
    setError('');
    setAddOpen(true);
  };

  const startEdit = (brand) => {
    setEditId(brand.id);
    setForm({
      name:       brand.name,
      logo:       brand.logo,
      active:     brand.active,
      categories: brand.categories,
      __availableCategories: categoryNames,
    });
    setError('');
    setAddOpen(true);
  };

  const close = () => {
    setAddOpen(false);
    setEditId(null);
    setForm(emptyForm(categoryNames));
    setError('');
  };

  const handleLogoFile = async (file) => {
    if (!file) return;
    if (file.size > 200 * 1024) {
      setError('Logo must be under 200 KB. Please pick a smaller PNG/SVG.');
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, logo: dataUrl }));
    setError('');
  };

  const toggleCat = (cat) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const submit = (e) => {
    e?.preventDefault();
    const name = form.name.trim();
    if (!name) { setError('Brand name is required.'); return; }

    const payload = {
      name,
      logo: form.logo.trim(),
      active: form.active,
      categories: form.categories,
    };
    if (editId) updateBrand(editId, payload);
    else        addBrand(payload);
    close();
  };

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-6 sm:p-7 border border-white/10">
        <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent-500/20 blur-3xl animate-blob pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-3">
              <Sparkles size={11} className="text-accent-300" /> Brands
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Brand library</h2>
            <p className="text-white/70 text-sm mt-1">
              Manage the brands customers can choose from, including their official logos.
            </p>
          </div>
          <button
            onClick={startAdd}
            className="btn-shine inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 to-amber-400 hover:to-accent-300 text-navy-950 font-extrabold px-5 py-2.5 rounded-2xl text-sm shadow-glow-gold transition-transform hover:scale-[1.03]"
          >
            <Plus size={16} /> New brand
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands…"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer outline-none focus:border-primary-500"
        >
          <option value="All">All categories</option>
          <option value="Universal">Universal (any category)</option>
          {categoryNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <p className="text-xs text-gray-500 font-bold ml-auto">
          {filtered.length} of {brands.length} brands
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
          <p className="font-display text-lg font-bold text-gray-700">No brands match your filters.</p>
          <button onClick={startAdd} className="mt-4 text-primary-700 font-bold text-sm hover:underline">
            + Add your first brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((brand) => (
            <div
              key={brand.id}
              className={`group relative bg-white rounded-3xl border shadow-soft p-5 hover:shadow-card-hover transition-all ${
                brand.active ? 'border-gray-100' : 'border-gray-200 bg-gray-50/60'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Logo preview */}
                <div className="w-16 h-16 rounded-2xl bg-white ring-1 ring-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  <BrandLogo brandObj={brand} size="lg" variant="logo" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-display font-bold text-gray-900 truncate">{brand.name}</p>
                    {!brand.active && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Hidden</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">/{brand.slug}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {brand.categories.length === 0 ? (
                      <span className="text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Universal</span>
                    ) : (
                      brand.categories.map((c) => (
                        <span key={c} className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{c}</span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => toggleBrand(brand.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold ${brand.active ? 'text-emerald-700' : 'text-gray-500'}`}
                >
                  {brand.active ? <Eye size={13} /> : <EyeOff size={13} />}
                  {brand.active ? 'Visible' : 'Hidden'}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(brand)} className="p-2 rounded-lg text-gray-500 hover:text-primary-700 hover:bg-primary-50">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteId(brand.id)} className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={close}>
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-up"
          >
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900">{editId ? 'Edit brand' : 'New brand'}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Brands appear in the Add Product form & on every product card.</p>
              </div>
              <button type="button" onClick={close} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              {/* Logo */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Brand logo</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center overflow-hidden">
                    {form.logo ? (
                      <img src={form.logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-gray-400 text-xs font-bold">Preview</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      value={form.logo}
                      onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))}
                      placeholder="https://logo.clearbit.com/example.com"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg"
                      >
                        <Upload size={13} /> Upload file
                      </button>
                      <p className="text-[11px] text-gray-400">PNG / SVG · &lt; 200 KB</p>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      hidden
                      accept="image/png,image/svg+xml,image/webp,image/jpeg"
                      onChange={(e) => handleLogoFile(e.target.files?.[0])}
                    />
                  </div>
                </div>
              </div>

              {/* Name */}
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Brand name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ray-Ban"
                  className="mt-2 w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500"
                />
              </label>

              {/* Categories */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Available for categories</span>
                <p className="text-[11px] text-gray-400 mt-0.5 mb-2">Pick none for "Universal" — brand will appear on every product.</p>
                <div className="flex flex-wrap gap-2">
                  {(form.__availableCategories || []).map((cat) => {
                    const on = form.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCat(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                          on
                            ? 'bg-primary-600 text-white border-primary-600 shadow-glow-blue'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visibility */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm font-bold text-gray-800">Visible to admins / shoppers</span>
              </label>
            </div>

            <div className="p-5 sm:p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button type="button" onClick={close} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
              <button type="submit" className="btn-shine bg-gradient-to-r from-primary-700 to-primary-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-glow-blue hover:scale-[1.02] transition-transform">
                {editId ? 'Save changes' : 'Add brand'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center">
            <p className="font-display text-lg font-bold text-gray-900">Remove this brand?</p>
            <p className="text-sm text-gray-500 mt-1">Existing products keep their saved brand value.</p>
            <div className="flex gap-2 mt-5 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700">Cancel</button>
              <button onClick={() => { removeBrand(deleteId); setDeleteId(null); }} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
