import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, Pencil, Save, X, BadgeCheck, ShieldCheck, MapPin, Package, CreditCard,
  Mail, Phone, Calendar, User as UserIcon, IndianRupee, Bell, MessageSquare,
  Heart, ArrowRight, AlertTriangle, Sparkles,
} from 'lucide-react';
import CustomerAccountShell from '../../components/CustomerAccountShell';
import { useAuth } from '../../context/AuthContext';
import { useCustomerData } from '../../context/CustomerDataContext';

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

/* small reusable input row */
function Field({ label, value, onChange, type = 'text', placeholder, disabled, icon: Icon, hint, options }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 flex items-center gap-1.5">
        {Icon && <Icon size={12} />} {label}
      </span>
      <div className={`mt-1.5 relative rounded-2xl border-2 transition-all bg-white ${
        disabled ? 'border-gray-100 bg-gray-50' : 'border-gray-200 focus-within:border-primary-600 focus-within:ring-4 focus-within:ring-primary-100'
      }`}>
        {options ? (
          <select
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className="w-full bg-transparent px-4 py-3 text-sm outline-none disabled:text-gray-500 cursor-pointer"
          >
            <option value="">Select…</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-transparent px-4 py-3 text-sm outline-none disabled:text-gray-500"
          />
        )}
      </div>
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </label>
  );
}

/* preference toggle row */
function ToggleRow({ icon: Icon, title, description, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/40 transition-all text-left"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        checked
          ? 'bg-gradient-to-br from-primary-700 to-primary-500 text-white shadow-glow-blue'
          : 'bg-gray-100 text-gray-500'
      }`}>
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-[11px] text-gray-500">{description}</p>
      </div>
      <span className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

export default function CustomerProfile() {
  const { user, updateProfile, logout } = useAuth();
  const { orders = [], transactions = [], addresses = [] } = useCustomerData();
  const fileRef = useRef(null);

  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [savedAt, setSavedAt]   = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const initialState = useMemo(() => ({
    name:    user?.name || user?.fullName || '',
    phone:   user?.phone || '',
    dob:     user?.dob || '',
    gender:  user?.gender || '',
    bio:     user?.bio || '',
    avatar:  user?.avatar || '',
    preferences: {
      emailUpdates:    user?.preferences?.emailUpdates    ?? true,
      smsUpdates:      user?.preferences?.smsUpdates      ?? false,
      whatsappUpdates: user?.preferences?.whatsappUpdates ?? true,
      newsletter:      user?.preferences?.newsletter      ?? true,
    },
  }), [user]);

  const [form, setForm] = useState(initialState);
  useEffect(() => { setForm(initialState); }, [initialState]);

  if (!user) {
    return (
      <CustomerAccountShell title="My Profile" description="Sign in to view your profile.">
        <p className="text-sm text-gray-500">Please <Link to="/login" className="text-primary-700 underline font-semibold">log in</Link>.</p>
      </CustomerAccountShell>
    );
  }

  const stats = {
    orders: orders.length,
    spent:  orders.reduce((a, o) => a + (Number(o.total) || 0), 0),
    addresses: addresses.length,
    transactions: transactions.length,
  };

  const memberSince = user.joinDate
    ? new Date(user.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
    : '—';

  const profileComplete = (() => {
    const fields = ['name', 'email', 'phone', 'dob', 'gender'];
    const filled = fields.filter(f => String((f === 'name' ? user.name : user[f]) || '').trim()).length;
    return Math.round((filled / fields.length) * 100);
  })();

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const setPref  = (k, v) => setForm(prev => ({ ...prev, preferences: { ...prev.preferences, [k]: v } }));

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField('avatar', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 350));
    updateProfile({
      name: form.name.trim() || user.name,
      fullName: form.name.trim() || user.fullName,
      phone: form.phone.trim(),
      dob: form.dob,
      gender: form.gender,
      bio: form.bio.trim(),
      avatar: form.avatar,
      preferences: form.preferences,
    });
    setSaving(false);
    setSavedAt(Date.now());
    setEditing(false);
    setTimeout(() => setSavedAt(0), 2400);
  };

  const handleCancel = () => {
    setForm(initialState);
    setEditing(false);
  };

  const handleDelete = () => {
    try { localStorage.removeItem('vexdeals_user'); } catch { /* */ }
    logout();
  };

  return (
    <CustomerAccountShell
      title="My Profile"
      description="Personal details, preferences and a snapshot of your VexDeals journey."
    >
      {/* ── Identity card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-navy-900 p-6 sm:p-8 text-white shadow-card">
        <div className="absolute inset-0 bg-grid-dark opacity-40 pointer-events-none" />
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-accent-400/30 blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-blob-slow" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with edit */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-br from-accent-400 via-amber-300 to-pink-400 rounded-full blur opacity-70" />
            <img
              src={form.avatar || user.avatar}
              alt={user.name}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white/30"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-accent-500 hover:bg-accent-400 text-navy-950 flex items-center justify-center ring-4 ring-navy-900 transition-all hover:scale-110 shadow-glow-gold"
              aria-label="Change photo"
              title="Change photo"
            >
              <Camera size={15} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarPick} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{user.name}</h2>
              {user.provider === 'google' && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <BadgeCheck size={11} /> Verified
                </span>
              )}
            </div>
            <p className="text-primary-100/80 text-sm mt-1 truncate">{user.email}</p>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-white/60">
              <span className="inline-flex items-center gap-1"><Sparkles size={11} className="text-accent-300" /> Member since {memberSince}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">VexDeals Club</span>
            </div>
          </div>

          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-shine inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 to-amber-400 hover:to-accent-300 text-navy-950 font-extrabold px-5 py-2.5 rounded-2xl text-sm shadow-glow-gold transition-transform hover:scale-[1.03]"
            >
              <Pencil size={14} /> Edit profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2.5 rounded-2xl text-sm font-bold transition-colors hover:bg-white/20"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile completion */}
        <div className="relative mt-6 sm:mt-8">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/60 font-bold mb-2">
            <span>Profile completion</span>
            <span className="text-accent-300">{profileComplete}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-400 via-amber-300 to-accent-500 transition-[width] duration-700"
              style={{ width: `${profileComplete}%` }}
            />
          </div>
          {profileComplete < 100 && (
            <p className="text-[11px] text-white/50 mt-2">Add your phone, DOB and gender to unlock personalised drops.</p>
          )}
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total orders',   value: stats.orders,                  Icon: Package,    color: 'from-blue-500 to-indigo-500',   to: '/account/orders'       },
          { label: 'Total spent',    value: formatPrice(stats.spent),      Icon: IndianRupee,color: 'from-emerald-500 to-teal-500',  to: '/account/transactions' },
          { label: 'Saved addresses',value: stats.addresses,               Icon: MapPin,     color: 'from-fuchsia-500 to-pink-500',  to: '/account/addresses'    },
          { label: 'Transactions',   value: stats.transactions,            Icon: CreditCard, color: 'from-amber-500 to-orange-500',  to: '/account/transactions' },
        ].map(s => (
          <Link
            key={s.label}
            to={s.to}
            className="group relative bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all overflow-hidden"
          >
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity`} />
            <div className="relative flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-soft`}>
                <s.Icon size={17} />
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="font-display text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{s.value}</p>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* ── Personal info form ── */}
      <form onSubmit={handleSave} className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-xl font-bold text-gray-900">Personal information</h3>
            <p className="text-xs text-gray-500 mt-0.5">{editing ? 'Make your changes and save.' : 'Click "Edit profile" above to update.'}</p>
          </div>
          {savedAt > 0 && (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-xs font-bold animate-fade-up">
              <BadgeCheck size={12} /> Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name"
            icon={UserIcon}
            value={form.name}
            disabled={!editing}
            onChange={e => setField('name', e.target.value)}
            placeholder="Your name"
          />
          <Field label="Email address"
            icon={Mail}
            value={user.email}
            disabled
            hint="Email is verified by Google and can't be changed."
          />
          <Field label="Phone number"
            icon={Phone}
            type="tel"
            value={form.phone}
            disabled={!editing}
            onChange={e => setField('phone', e.target.value.replace(/[^\d+\-\s]/g, ''))}
            placeholder="+91 90000 00000"
          />
          <Field label="Date of birth"
            icon={Calendar}
            type="date"
            value={form.dob}
            disabled={!editing}
            onChange={e => setField('dob', e.target.value)}
          />
          <Field label="Gender"
            icon={UserIcon}
            value={form.gender}
            disabled={!editing}
            options={['Male', 'Female', 'Non-binary', 'Prefer not to say']}
            onChange={e => setField('gender', e.target.value)}
          />
        </div>

        <label className="block mt-5">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 flex items-center gap-1.5">
            <Pencil size={12} /> Bio
          </span>
          <textarea
            rows={3}
            value={form.bio}
            disabled={!editing}
            onChange={e => setField('bio', e.target.value.slice(0, 240))}
            placeholder="Tell us a little about your style…"
            className={`mt-1.5 w-full bg-white px-4 py-3 text-sm rounded-2xl border-2 outline-none resize-none transition-all ${
              editing
                ? 'border-gray-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100'
                : 'border-gray-100 bg-gray-50 text-gray-500'
            }`}
          />
          <p className="mt-1 text-[11px] text-gray-400 text-right">{(form.bio || '').length}/240</p>
        </label>

        {editing && (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-shine inline-flex items-center gap-2 bg-gradient-to-r from-primary-700 to-primary-500 text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow-glow-blue hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Save size={15} /> Save changes</>
              )}
            </button>
          </div>
        )}
      </form>

      {/* ── Notification preferences ── */}
      <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-7">
        <div className="mb-4">
          <h3 className="font-display text-xl font-bold text-gray-900">Notifications & preferences</h3>
          <p className="text-xs text-gray-500 mt-0.5">Choose how we keep in touch — saved automatically.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ToggleRow
            icon={Mail}
            title="Email updates"
            description="Order updates, promos and drops"
            checked={form.preferences.emailUpdates}
            onChange={(v) => { setPref('emailUpdates', v); updateProfile({ preferences: { emailUpdates: v } }); }}
          />
          <ToggleRow
            icon={MessageSquare}
            title="WhatsApp updates"
            description="Order tracking & exclusive deals"
            checked={form.preferences.whatsappUpdates}
            onChange={(v) => { setPref('whatsappUpdates', v); updateProfile({ preferences: { whatsappUpdates: v } }); }}
          />
          <ToggleRow
            icon={Bell}
            title="SMS alerts"
            description="Critical order & delivery alerts"
            checked={form.preferences.smsUpdates}
            onChange={(v) => { setPref('smsUpdates', v); updateProfile({ preferences: { smsUpdates: v } }); }}
          />
          <ToggleRow
            icon={Heart}
            title="Newsletter"
            description="Weekly style tips & new arrivals"
            checked={form.preferences.newsletter}
            onChange={(v) => { setPref('newsletter', v); updateProfile({ preferences: { newsletter: v } }); }}
          />
        </div>
      </div>

      {/* ── Security & quick links ── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-7">
          <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-500" /> Account security
          </h3>
          <p className="text-xs text-gray-500 mt-1">Your account is protected by Google sign-in.</p>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2.5">
                <BadgeCheck size={16} className="text-emerald-600" />
                <p className="text-sm font-bold text-emerald-900">Email verified</p>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-700">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-gray-500" />
                <p className="text-sm font-bold text-gray-800">{user.phone ? 'Phone added' : 'Phone not added'}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase ${user.phone ? 'text-emerald-700' : 'text-gray-400'}`}>
                {user.phone ? 'Done' : 'Add now'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-primary-600" />
                <p className="text-sm font-bold text-gray-800">Google sign-in</p>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-700">Connected</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 sm:p-7">
          <h3 className="font-display text-xl font-bold text-gray-900">Quick actions</h3>
          <p className="text-xs text-gray-500 mt-1">Jump back into your shopping flow.</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/account/orders"       className="group rounded-2xl bg-gray-50 hover:bg-primary-50 p-4 transition-colors">
              <Package size={18} className="text-primary-700" />
              <p className="text-sm font-bold text-gray-900 mt-2">My orders</p>
              <p className="text-[11px] text-gray-500">{stats.orders} placed</p>
            </Link>
            <Link to="/account/addresses"    className="group rounded-2xl bg-gray-50 hover:bg-primary-50 p-4 transition-colors">
              <MapPin size={18} className="text-primary-700" />
              <p className="text-sm font-bold text-gray-900 mt-2">Addresses</p>
              <p className="text-[11px] text-gray-500">{stats.addresses} saved</p>
            </Link>
            <Link to="/account/transactions" className="group rounded-2xl bg-gray-50 hover:bg-primary-50 p-4 transition-colors">
              <CreditCard size={18} className="text-primary-700" />
              <p className="text-sm font-bold text-gray-900 mt-2">Transactions</p>
              <p className="text-[11px] text-gray-500">{stats.transactions} entries</p>
            </Link>
            <Link to="/products"             className="group rounded-2xl bg-gradient-to-br from-accent-100 to-amber-50 hover:from-accent-200 hover:to-amber-100 p-4 transition-colors border border-accent-200/50">
              <Sparkles size={18} className="text-accent-600" />
              <p className="text-sm font-bold text-gray-900 mt-2">Shop now</p>
              <p className="text-[11px] text-gray-500">Latest drops</p>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="mt-6 bg-white rounded-3xl border border-red-200/60 shadow-soft p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-bold text-gray-900">Danger zone</h3>
            <p className="text-xs text-gray-500 mt-0.5">Sign out of this device or remove your account from VexDeals.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={logout}
            className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-800 transition-colors"
          >
            Sign out
          </button>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-sm font-bold text-red-700 border border-red-200 transition-colors"
            >
              Remove account
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2">
              <p className="text-xs text-red-700 font-bold">Are you sure? This signs you out and clears your local data.</p>
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-white">Cancel</button>
              <button onClick={handleDelete} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold">Yes, remove</button>
            </div>
          )}
        </div>
      </div>
    </CustomerAccountShell>
  );
}
