import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Shield, Users, Package, Megaphone, X, Check, AlertTriangle } from 'lucide-react';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

// Mirror a sub-admin record into the shared Firestore `subadmins` collection
// so staff can sign in from any device (not just the admin's browser).
const syncSubAdminToCloud = (sub) => {
  if (!db) return;
  setDoc(doc(db, 'subadmins', String(sub.id)), sub).catch(() => {});
};
const deleteSubAdminFromCloud = (id) => {
  if (!db) return;
  deleteDoc(doc(db, 'subadmins', String(id))).catch(() => {});
};

const DEPARTMENTS = [
  { value: 'products',   label: 'Products',   Icon: Package,    desc: 'Can add & edit products'           },
  { value: 'marketing',  label: 'Marketing',  Icon: Megaphone,  desc: 'Can manage posters & promo codes'  },
];

const getSubAdmins = () => {
  try { return JSON.parse(localStorage.getItem('vexdeals_subadmins') || '[]'); }
  catch { return []; }
};
const saveSubAdmins = (list) => {
  localStorage.setItem('vexdeals_subadmins', JSON.stringify(list));
};

export default function AdminSubAdmins() {
  const { isAdmin } = useAuth();
  const [subAdmins, setSubAdmins] = useState(getSubAdmins);
  const [showAdd, setShowAdd]     = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [showPw, setShowPw]       = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: 'products' });
  const [formError, setFormError] = useState('');

  useEffect(() => { saveSubAdmins(subAdmins); }, [subAdmins]);

  // Pull the shared list from Firestore on mount and merge (cloud wins by email)
  useEffect(() => {
    if (!db) return;
    getDocs(collection(db, 'subadmins'))
      .then(snap => {
        const cloud = snap.docs.map(d => ({ ...d.data(), id: d.data().id ?? d.id }));
        if (cloud.length === 0) return;
        setSubAdmins(prev => {
          const byEmail = new Map();
          prev.forEach(s => byEmail.set(s.email?.toLowerCase(), s));
          cloud.forEach(s => byEmail.set(s.email?.toLowerCase(), s));
          return Array.from(byEmail.values());
        });
      })
      .catch(() => {});
  }, []);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500 font-semibold">Only the main admin can manage sub-admins.</p>
      </div>
    );
  }

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('All fields are required');
      return;
    }
    if (!form.email.includes('@')) {
      setFormError('Enter a valid email');
      return;
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    const exists = subAdmins.find(s => s.email === form.email);
    if (exists) {
      setFormError('Email already exists');
      return;
    }
    const newSub = {
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: 'subadmin',
      department: form.department,
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
      avatar: `https://picsum.photos/seed/${Date.now()}/100/100`,
    };
    setSubAdmins(prev => [...prev, newSub]);
    syncSubAdminToCloud(newSub);
    setForm({ name: '', email: '', password: '', department: 'products' });
    setFormError('');
    setShowAdd(false);
  };

  const toggleActive = (id) => {
    setSubAdmins(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, active: !s.active };
      syncSubAdminToCloud(updated);
      return updated;
    }));
  };

  const handleDelete = (id) => {
    setSubAdmins(prev => prev.filter(s => s.id !== id));
    deleteSubAdminFromCloud(id);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sub-Admins</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage department staff accounts</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus size={18} /> Add Sub-Admin
        </button>
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DEPARTMENTS.map(({ value, label, Icon, desc }) => {
          const count = subAdmins.filter(s => s.department === value && s.active).length;
          return (
            <div key={value} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={22} className="text-primary-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{label} Dept.</p>
                <p className="text-xs text-gray-500">{desc}</p>
                <p className="text-xs text-primary-600 font-semibold mt-1">{count} active staff</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub-admins table */}
      {subAdmins.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Users size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No sub-admins yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create department accounts to delegate access</p>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} /> Add First Sub-Admin
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissions</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subAdmins.map((sub, i) => {
                  const dept = DEPARTMENTS.find(d => d.value === sub.department);
                  return (
                    <tr key={sub.id} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={sub.avatar} alt={sub.name} className="w-9 h-9 rounded-full object-cover border-2 border-gray-100" />
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{sub.name}</p>
                            <p className="text-xs text-gray-400">{sub.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {dept && (
                          <div className="flex items-center gap-2">
                            <dept.Icon size={15} className="text-primary-600" />
                            <span className="text-sm font-medium text-gray-700">{dept.label}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {sub.department === 'products' && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                              <Package size={10} /> Add/Edit Products
                            </span>
                          )}
                          {sub.department === 'marketing' && (
                            <>
                              <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                <Megaphone size={10} /> Posters
                              </span>
                              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium ml-1">
                                Promo Codes
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleActive(sub.id)}
                          className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                            sub.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {sub.active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setDeleteId(sub.id)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
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

      {/* Add Sub-Admin Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Add Sub-Admin</h3>
              <button onClick={() => { setShowAdd(false); setFormError(''); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
                <AlertTriangle size={16} /> {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  placeholder="Priya Sharma"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  placeholder="priya@vexdeals.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({...f, password: e.target.value}))}
                    placeholder="Min 6 characters"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-primary-600 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <div className="grid grid-cols-2 gap-3">
                  {DEPARTMENTS.map(({ value, label, Icon, desc }) => (
                    <label
                      key={value}
                      className={`flex flex-col gap-1 p-3 rounded-2xl border-2 cursor-pointer transition-colors ${
                        form.department === value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input type="radio" name="dept" value={value} checked={form.department === value} onChange={() => setForm(f => ({...f, department: value}))} className="hidden" />
                      <Icon size={18} className={form.department === value ? 'text-primary-600' : 'text-gray-500'} />
                      <span className="text-sm font-semibold text-gray-800">{label}</span>
                      <span className="text-xs text-gray-500">{desc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAdd(false); setFormError(''); }} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleAdd} className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 flex items-center justify-center gap-2">
                <Check size={18} /> Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Sub-Admin?</h3>
            <p className="text-gray-500 text-sm mb-6">
              <span className="font-semibold">{subAdmins.find(s => s.id === deleteId)?.name}</span> will lose all access to the admin panel.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
