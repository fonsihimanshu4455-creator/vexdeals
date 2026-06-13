import { useEffect, useState } from 'react';
import { Save, RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { DEFAULT_SETTINGS } from '../../lib/settings';

export default function AdminSettings() {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!db) { setLoading(false); return; }
    getDoc(doc(db, 'site', 'settings'))
      .then(snap => { if (snap.exists()) setForm({ ...DEFAULT_SETTINGS, ...snap.data() }); })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!db) { setMsg('Cloud not available.'); return; }
    const min = Number(form.freeShippingMin);
    if (!Number.isFinite(min) || min < 0) { setMsg('Free shipping amount must be 0 or more.'); return; }
    try {
      setSaving(true);
      setMsg('');
      await setDoc(doc(db, 'site', 'settings'), {
        announcement: String(form.announcement || '').trim(),
        freeShippingMin: min,
        whatsappNumber: String(form.whatsappNumber || '').replace(/\D/g, ''),
        trustBadges: (form.trustBadges || []).map(b => ({
          t: String(b.t || '').trim(),
          s: String(b.s || '').trim(),
        })),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setMsg('✓ Saved! Changes are live across the site.');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 gap-2 text-gray-400"><RefreshCw size={20} className="animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><SettingsIcon size={22} /> Store Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Site-wide settings — changes apply instantly for all customers.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Announcement bar text <span className="text-gray-400 font-normal">(top strip on every page)</span></label>
          <input
            value={form.announcement}
            onChange={e => setForm(f => ({ ...f, announcement: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500"
            placeholder="✦ Free shipping over ₹1000 · Use code VEXFIRST for 10% off"
          />
          <p className="text-xs text-gray-400 mt-1">Khaali chhodoge to announcement bar hide ho jayega.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Free shipping above (₹)</label>
          <input
            type="number" min="0"
            value={form.freeShippingMin}
            onChange={e => setForm(f => ({ ...f, freeShippingMin: e.target.value }))}
            className="w-48 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500"
          />
          <p className="text-xs text-gray-400 mt-1">Cart subtotal isse upar ho to shipping FREE. 0 = hamesha free shipping.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp support number <span className="text-gray-400 font-normal">(country code ke saath, bina +)</span></label>
          <input
            value={form.whatsappNumber}
            onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
            className="w-64 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500"
            placeholder="919034948078"
          />
          <p className="text-xs text-gray-400 mt-1">Site pe floating WhatsApp button isi number pe message kholega. Khaali = button hide.</p>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Trust badges <span className="text-gray-400 font-normal">(home page ki 3 strip — 100% Authentic etc.)</span></label>
          <p className="text-xs text-gray-400 mb-3">Title + chhoti line edit karo. Icon fixed rehta hai. Title khaali = wo badge hide.</p>
          <div className="space-y-3">
            {[0, 1, 2].map((i) => {
              const b = (form.trustBadges || [])[i] || { t: '', s: '' };
              const setBadge = (key, val) => setForm(f => {
                const list = [ ...(f.trustBadges || []) ];
                while (list.length < 3) list.push({ t: '', s: '' });
                list[i] = { ...list[i], [key]: val };
                return { ...f, trustBadges: list };
              });
              return (
                <div key={i} className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={b.t}
                    onChange={e => setBadge('t', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500"
                    placeholder={`Title ${i + 1} (e.g. 100% Authentic)`}
                  />
                  <input
                    value={b.s}
                    onChange={e => setBadge('s', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500"
                    placeholder={`Subtitle ${i + 1} (e.g. Verified genuine brands)`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-60">
          {saving ? <><RefreshCw size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save settings</>}
        </button>
        {msg && <span className={`text-sm font-medium ${msg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</span>}
      </div>
    </div>
  );
}
