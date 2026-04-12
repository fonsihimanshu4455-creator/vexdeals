import { useMemo, useState } from 'react';
import { Check, Edit2, MapPin, Plus } from 'lucide-react';
import CustomerAccountShell from '../../components/CustomerAccountShell';
import { useCustomerData } from '../../context/CustomerDataContext';
import { useAuth } from '../../context/AuthContext';

const EMPTY_FORM = {
  label: 'Home',
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

export default function CustomerAddresses() {
  const { user } = useAuth();
  const { addresses, defaultAddress, saveAddress, setDefaultAddress } = useCustomerData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    fullName: user?.name || '',
    phone: String(user?.phone || '').replace(/\D/g, '').slice(-10),
    isDefault: addresses.length === 0,
  }));
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const labels = useMemo(() => ['Home', 'Office', 'Other'], []);

  const openNewForm = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      fullName: user?.name || '',
      phone: String(user?.phone || '').replace(/\D/g, '').slice(-10),
      isDefault: addresses.length === 0,
    });
    setError('');
    setShowForm(true);
  };

  const openEditForm = (address) => {
    setEditingId(address.id);
    setForm({
      label: address.label || 'Home',
      fullName: address.fullName || '',
      phone: String(address.phone || '').replace(/\D/g, '').slice(-10),
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      isDefault: Boolean(address.isDefault),
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = () => {
    const result = saveAddress(form, editingId);
    if (!result.success) {
      setError(result.message);
      return;
    }

    if (form.isDefault && result.address?.id) {
      setDefaultAddress(result.address.id);
    }

    setShowForm(false);
    setEditingId(null);
  };

  return (
    <CustomerAccountShell
      title="Saved Addresses"
      description="Add delivery locations now and edit them later before your next checkout."
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-500">
          {defaultAddress ? `Default address: ${defaultAddress.label}` : 'No saved address yet'}
        </div>
        <button
          onClick={openNewForm}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus size={16} />
          Add Address Details
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Address' : 'Add Address'}</h2>
          <p className="mt-1 text-sm text-gray-500">Save your delivery details so checkout becomes faster next time.</p>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-gray-700">
              <span className="mb-1 block font-medium">Label</span>
              <select
                value={form.label}
                onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-primary-500"
              >
                {labels.map((label) => <option key={label} value={label}>{label}</option>)}
              </select>
            </label>

            <label className="text-sm text-gray-700">
              <span className="mb-1 block font-medium">Full Name</span>
              <input
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
                placeholder="Rahul Sharma"
              />
            </label>

            <label className="text-sm text-gray-700">
              <span className="mb-1 block font-medium">Phone</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
                placeholder="9876543210"
              />
            </label>

            <label className="text-sm text-gray-700 sm:col-span-2">
              <span className="mb-1 block font-medium">Address</span>
              <textarea
                rows={3}
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
                placeholder="House / Flat / Area / Street"
              />
            </label>

            <label className="text-sm text-gray-700">
              <span className="mb-1 block font-medium">City</span>
              <input
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
                placeholder="Bangalore"
              />
            </label>

            <label className="text-sm text-gray-700">
              <span className="mb-1 block font-medium">State</span>
              <input
                value={form.state}
                onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
                placeholder="Karnataka"
              />
            </label>

            <label className="text-sm text-gray-700">
              <span className="mb-1 block font-medium">PIN Code</span>
              <input
                value={form.pincode}
                onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value.replace(/\D/g, '').slice(0, 6) }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-primary-500"
                placeholder="560001"
              />
            </label>

            <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
                className="accent-primary-600"
              />
              Set as default delivery address
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleSubmit}
              className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {editingId ? 'Save Changes' : 'Save Address'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setError(''); }}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <MapPin size={40} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900">No saved addresses</h2>
          <p className="mt-2 text-sm text-gray-500">Use the button above to add your first delivery address.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">{address.label}</p>
                    {address.isDefault && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-800">{address.fullName}</p>
                  <p className="text-sm text-gray-500">+91 {address.phone.slice(-10)}</p>
                  <p className="mt-3 text-sm text-gray-600">
                    {address.address}, {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
                <button
                  onClick={() => openEditForm(address)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>

              {!address.isDefault && (
                <button
                  onClick={() => setDefaultAddress(address.id)}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
                >
                  <Check size={16} />
                  Make Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </CustomerAccountShell>
  );
}
