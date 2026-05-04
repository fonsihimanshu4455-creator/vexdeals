import { useMemo, useRef, useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, Star, Eye, EyeOff, Sparkles, Quote, Upload } from 'lucide-react';
import { useTestimonials } from '../../context/TestimonialContext';

const emptyForm = () => ({
  name: '',
  role: 'Verified buyer',
  avatar: '',
  quote: '',
  rating: 5,
  active: true,
});

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = () => reject(new Error('Could not read file'));
    r.readAsDataURL(file);
  });

export default function AdminTestimonials() {
  const { testimonials, addTestimonial, updateTestimonial, removeTestimonial, toggleTestimonial } = useTestimonials();

  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState(emptyForm);
  const [err, setErr]       = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return testimonials;
    const q = search.toLowerCase();
    return testimonials.filter(t => t.name.toLowerCase().includes(q) || t.quote.toLowerCase().includes(q));
  }, [search, testimonials]);

  const startAdd = () => { setEditId(null); setForm(emptyForm()); setErr(''); setOpen(true); };
  const startEdit = (t) => {
    setEditId(t.id);
    setForm({ name: t.name, role: t.role, avatar: t.avatar, quote: t.quote, rating: t.rating, active: t.active });
    setErr(''); setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); setErr(''); setForm(emptyForm()); };

  const handleAvatar = async (file) => {
    if (!file) return;
    if (file.size > 200 * 1024) { setErr('Avatar must be under 200 KB.'); return; }
    const dataUrl = await readFileAsDataUrl(file);
    setForm((p) => ({ ...p, avatar: dataUrl }));
    setErr('');
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!form.name.trim())  { setErr('Name is required.');  return; }
    if (!form.quote.trim()) { setErr('Quote is required.'); return; }
    if (editId) updateTestimonial(editId, form);
    else        addTestimonial(form);
    close();
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-6 sm:p-7 border border-white/10">
        <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-fuchsia-500/15 blur-3xl animate-blob pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-3">
              <Sparkles size={11} className="text-accent-300" /> Testimonials
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Reviews on the homepage</h2>
            <p className="text-white/70 text-sm mt-1">Add or hide customer testimonials shown on the storefront.</p>
          </div>
          <button
            onClick={startAdd}
            className="btn-shine inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 to-amber-400 hover:to-accent-300 text-navy-950 font-extrabold px-5 py-2.5 rounded-2xl text-sm shadow-glow-gold transition-transform hover:scale-[1.03]"
          >
            <Plus size={16} /> New testimonial
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or quote…"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <p className="text-xs text-gray-500 font-bold ml-auto">{filtered.length} of {testimonials.length}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
          <Quote size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="font-display text-lg font-bold text-gray-700">No testimonials yet.</p>
          <button onClick={startAdd} className="mt-4 text-primary-700 font-bold text-sm hover:underline">+ Add your first testimonial</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className={`bg-white rounded-3xl border shadow-soft p-5 transition-all ${t.active ? 'border-gray-100' : 'border-gray-200 bg-gray-50/60'}`}>
              <div className="flex items-start gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 truncate">{t.name}</p>
                    {!t.active && <span className="text-[9px] font-bold uppercase text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Hidden</span>}
                  </div>
                  <p className="text-[11px] text-gray-500">{t.role}</p>
                  <div className="flex gap-0.5 mt-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-3 line-clamp-3 leading-relaxed">"{t.quote}"</p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => toggleTestimonial(t.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold ${t.active ? 'text-emerald-700' : 'text-gray-500'}`}
                >
                  {t.active ? <Eye size={13} /> : <EyeOff size={13} />}
                  {t.active ? 'Visible on home' : 'Hidden'}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(t)} className="p-2 rounded-lg text-gray-500 hover:text-primary-700 hover:bg-primary-50">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteId(t.id)} className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={close}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900">{editId ? 'Edit testimonial' : 'New testimonial'}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Shows up on the home page in the testimonial section.</p>
              </div>
              <button type="button" onClick={close} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Avatar</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center overflow-hidden">
                    {form.avatar
                      ? <img src={form.avatar} alt="" className="w-full h-full object-cover" />
                      : <span className="text-[10px] font-bold text-gray-400">Preview</span>}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      value={form.avatar}
                      onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
                      placeholder="https://… (or upload)"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500"
                    />
                    <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg">
                      <Upload size={13} /> Upload photo
                    </button>
                    <input ref={fileRef} type="file" hidden accept="image/*" onChange={(e) => handleAvatar(e.target.files?.[0])} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Customer name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-2 w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500"
                    placeholder="Rahul Sharma"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Role / location</span>
                  <input
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    className="mt-2 w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500"
                    placeholder="Verified buyer · Mumbai"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Quote</span>
                <textarea
                  rows={4}
                  value={form.quote}
                  onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value.slice(0, 500) }))}
                  placeholder="What did the customer say?"
                  className="mt-2 w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-primary-500 resize-none"
                />
                <p className="mt-1 text-[11px] text-gray-400 text-right">{form.quote.length}/500</p>
              </label>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Rating</span>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, rating: n }))}
                        className="p-1"
                      >
                        <Star size={20} className={n <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-sm font-bold text-gray-800">Show on homepage</span>
                </label>
              </div>
            </div>

            <div className="p-5 sm:p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button type="button" onClick={close} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100">Cancel</button>
              <button type="submit" className="btn-shine bg-gradient-to-r from-primary-700 to-primary-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-glow-blue hover:scale-[1.02] transition-transform">
                {editId ? 'Save changes' : 'Add testimonial'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center">
            <p className="font-display text-lg font-bold text-gray-900">Remove this testimonial?</p>
            <p className="text-sm text-gray-500 mt-1">This action can't be undone.</p>
            <div className="flex gap-2 mt-5 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700">Cancel</button>
              <button onClick={() => { removeTestimonial(deleteId); setDeleteId(null); }} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
