import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Pencil, Check, X, Shield, Users, Package, MapPin, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* Single editable field row */
function EditableRow({ Icon, label, value, placeholder, type = 'text', onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const start = () => { setDraft(value || ''); setEditing(true); };
  const cancel = () => { setEditing(false); setDraft(value || ''); };
  const save = () => { onSave((draft || '').trim()); setEditing(false); };

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-1.5">
            <input
              type={type}
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={placeholder}
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
              className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-primary-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-200"
            />
            <button onClick={save} className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 shrink-0">
              <Check size={16} />
            </button>
            <button onClick={cancel} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 shrink-0">
              <X size={16} />
            </button>
          </div>
        ) : (
          <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
            {value || <span className="text-gray-300 font-normal">{placeholder}</span>}
          </p>
        )}
      </div>
      {!editing && (
        <button onClick={start} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 shrink-0">
          <Pencil size={13} /> Edit
        </button>
      )}
    </div>
  );
}

export default function ProfilePanel() {
  const { user, updateUser, logout, isAdmin, isSubAdmin, isCustomer } = useAuth();
  const [saved, setSaved] = useState(false);
  if (!user) return null;

  const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const update = (patch) => { updateUser(patch); flashSaved(); };

  const gender = user.gender || '';
  const roleLabel = isAdmin ? 'Main Admin'
    : isSubAdmin ? (user.department === 'marketing' ? 'Marketing Staff' : 'Products Staff')
    : 'Customer';

  const accountLinks = [
    { to: '/account/orders', label: 'My Orders', Icon: Package },
    { to: '/account/transactions', label: 'Transaction History', Icon: CreditCard },
    { to: '/account/addresses', label: 'Saved Addresses', Icon: MapPin },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-100" />
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{user.name}</h2>
          <p className="text-sm text-gray-500 truncate">{user.email || user.phone}</p>
          <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
            <Shield size={12} /> {roleLabel}
          </span>
        </div>
      </div>

      {/* Personal information */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
          {saved && <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><Check size={13} /> Saved</span>}
        </div>

        <div className="divide-y divide-gray-100">
          <EditableRow
            Icon={User}
            label="Full Name"
            value={user.name === user.fullName ? user.name : user.fullName}
            placeholder="Add your name"
            onSave={(v) => update({ name: v, fullName: v })}
          />

          {/* Gender row */}
          <div className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <Users size={18} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Gender</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Male', 'Female', 'Other'].map((val) => (
                  <button
                    key={val}
                    onClick={() => update({ gender: val })}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      gender === val
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <EditableRow
            Icon={Mail}
            label="Email Address"
            value={user.email}
            type="email"
            placeholder="Add your email"
            onSave={(v) => update({ email: v })}
          />

          <EditableRow
            Icon={Phone}
            label="Mobile Number"
            value={user.phone}
            type="tel"
            placeholder="Add your mobile number"
            onSave={(v) => update({ phone: v })}
          />
        </div>
      </div>

      {/* Account quick links (customers) */}
      {isCustomer && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2">
          {accountLinks.map(({ to, label, Icon }) => (
            <Link key={to} to={to}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-primary-600" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
              <ChevronRight size={17} className="text-gray-300" />
            </Link>
          ))}
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-red-50 transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <LogOut size={17} className="text-red-500" />
            </div>
            <span className="flex-1 text-sm font-medium text-red-600">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
