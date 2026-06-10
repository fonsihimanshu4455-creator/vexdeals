import { useEffect, useState } from 'react';
import { Save, RefreshCw, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { DEFAULT_ABOUT, mergeAbout } from '../../lib/siteContent';

const Field = ({ label, children, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500';

export default function AdminAbout() {
  const [form, setForm] = useState(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!db) { setLoading(false); return undefined; }
    return onSnapshot(doc(db, 'site', 'about'), (snap) => {
      if (snap.exists()) setForm(mergeAbout(snap.data()));
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setValue = (i, key, value) => setForm(f => ({
    ...f,
    values: f.values.map((v, idx) => idx === i ? { ...v, [key]: value } : v),
  }));

  const save = async () => {
    if (!db) { setMsg('Cloud not available.'); return; }
    try {
      setSaving(true);
      setMsg('');
      await setDoc(doc(db, 'site', 'about'), { ...form, updatedAt: new Date().toISOString() }, { merge: true });
      setMsg('✓ Saved! Changes are live on the About page.');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setForm(DEFAULT_ABOUT);

  if (loading) {
    return <div className="flex items-center justify-center py-20 gap-2 text-gray-400"><RefreshCw size={20} className="animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText size={22} /> About Page</h2>
          <p className="text-gray-500 text-sm mt-0.5">Edit the content shown on your website&apos;s About page.</p>
        </div>
        <Link to="/about" target="_blank" className="flex items-center gap-2 text-sm text-primary-600 font-semibold bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl">
          <Eye size={15} /> View page
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Header</h3>
        <Field label="Badge"><input className={inputCls} value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="Our Story" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Heading"><input className={inputCls} value={form.heading} onChange={e => set('heading', e.target.value)} placeholder="Authentic pieces," /></Field>
          <Field label="Heading highlight (colored)"><input className={inputCls} value={form.headingHighlight} onChange={e => set('headingHighlight', e.target.value)} placeholder="honest prices." /></Field>
        </div>
        <Field label="Intro paragraph">
          <textarea rows={3} className={`${inputCls} resize-none`} value={form.intro} onChange={e => set('intro', e.target.value)} placeholder="Short description of your store…" />
        </Field>
      </div>

      {/* Values */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Highlights (3 cards)</h3>
        {form.values.map((v, i) => (
          <div key={i} className="grid sm:grid-cols-3 gap-3 items-start">
            <input className={inputCls} value={v.title} onChange={e => setValue(i, 'title', e.target.value)} placeholder={`Title ${i + 1}`} />
            <input className={`${inputCls} sm:col-span-2`} value={v.desc} onChange={e => setValue(i, 'desc', e.target.value)} placeholder="Short description" />
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Contact & Social</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Phone"><input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
          <Field label="Email"><input className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} /></Field>
          <Field label="Location"><input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Instagram URL"><input className={inputCls} value={form.instagram} onChange={e => set('instagram', e.target.value)} /></Field>
          <Field label="Facebook URL"><input className={inputCls} value={form.facebook} onChange={e => set('facebook', e.target.value)} /></Field>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-gray-100 py-3">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-60">
          {saving ? <><RefreshCw size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save changes</>}
        </button>
        <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 font-medium">Reset to default</button>
        {msg && <span className="text-sm font-medium text-emerald-600">{msg}</span>}
      </div>
    </div>
  );
}
