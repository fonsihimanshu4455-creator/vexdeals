import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Edit2, Save, X, Tag, Upload, Loader2 } from 'lucide-react';
import { useCategories } from '../../context/CategoryContext';
import { uploadToCloudinary } from '../../lib/cloudinary';
import ImageCropper from '../../components/ImageCropper';

const EMOJI_OPTIONS = ['⌚','🕶️','💻','👗','🏠','🏋️','✨','📱','🎵','📚','🍎','🚗','💊','🎮','👟','💍','🌿','🎒'];

export default function AdminCategories() {
  const {
    categories,
    activeCategories,
    addCategory,
    removeCategory,
    toggleCategory,
    updateCategory,
    syncState: categorySyncState,
  } = useCategories();
  const [showAdd, setShowAdd]       = useState(false);
  const [newName, setNewName]       = useState('');
  const [newIcon, setNewIcon]       = useState('🛍️');
  const [editId, setEditId]         = useState(null);
  const [editName, setEditName]     = useState('');
  const [editIcon, setEditIcon]     = useState('');
  const [deleteId, setDeleteId]     = useState(null);
  const [customEmoji, setCustomEmoji] = useState('');
  const [newImage, setNewImage]     = useState('');
  const [editImage, setEditImage]   = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const [cropper, setCropper] = useState(null); // { url, setter }

  // Open the crop+zoom tool when a photo is picked.
  const pickImage = (file, setter) => {
    if (!file) return;
    setCropper({ url: URL.createObjectURL(file), setter });
  };
  const closeCropper = () => {
    setCropper((c) => { if (c?.url) URL.revokeObjectURL(c.url); return null; });
  };
  const handleCropped = async (blob) => {
    const setter = cropper?.setter;
    try {
      setImgUploading(true);
      const file = new File([blob], `vex-cat-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = await uploadToCloudinary(file, 'image');
      setter?.(url);
    } catch {
      alert('Image upload failed. Try again.');
    } finally {
      setImgUploading(false);
      closeCropper();
    }
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim(), newIcon, newImage, newPriority);
    setNewName('');
    setNewIcon('🛍️');
    setNewImage('');
    setNewPriority('');
    setShowAdd(false);
  };

  const handleEditSave = () => {
    if (!editName.trim()) return;
    const updates = { name: editName.trim(), icon: editIcon, image: editImage };
    const p = Number(editPriority);
    if (Number.isFinite(p) && p > 0) updates.sortOrder = p;
    updateCategory(editId, updates);
    setEditId(null);
  };

  const confirmDelete = (id) => {
    removeCategory(id);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {cropper && (
        <ImageCropper src={cropper.url} uploading={imgUploading} onCancel={closeCropper} onCropped={handleCropped} />
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {activeCategories.length} active · {categories.length - activeCategories.length} hidden
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          categorySyncState.mode === 'cloud'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : categorySyncState.mode === 'cloud-empty'
              ? 'border-primary-200 bg-primary-50 text-primary-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}
      >
        <p className="font-semibold">
          {categorySyncState.mode === 'cloud' ? 'Realtime category sync is live' : 'Realtime category sync needs attention'}
        </p>
        <p className="mt-1">{categorySyncState.message}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
          <p className="text-sm text-gray-500">Total Categories</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-emerald-600">{activeCategories.length}</p>
          <p className="text-sm text-gray-500">Active (shown on site)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-400">{categories.length - activeCategories.length}</p>
          <p className="text-sm text-gray-500">Hidden</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-start gap-3">
        <Tag size={18} className="text-primary-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-primary-800">Full Admin Control</p>
          <p className="text-xs text-primary-600 mt-0.5">
            Only <span className="font-bold">active</span> categories appear in the navbar, home page, and product filters.
            Toggle any category to show or hide it instantly across the entire site.
          </p>
        </div>
      </div>

      {/* Categories table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Icon</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-5 py-3.5">
                    {editId === cat.id ? (
                      <div className="max-w-56 space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {EMOJI_OPTIONS.map(e => (
                            <button
                              key={e}
                              onClick={() => setEditIcon(e)}
                              className={`text-lg p-1 rounded ${editIcon === e ? 'bg-primary-100 ring-2 ring-primary-400' : 'hover:bg-gray-100'}`}
                            >
                              {e}
                            </button>
                          ))}
                          <input
                            value={customEmoji}
                            onChange={e => { setCustomEmoji(e.target.value); if (e.target.value) setEditIcon(e.target.value); }}
                            placeholder="or type"
                            className="border rounded px-2 py-1 text-xs w-16"
                          />
                        </div>
                        {/* Photo upload */}
                        <div className="flex items-center gap-2">
                          {editImage && <img src={editImage} alt="" className="w-10 h-10 rounded-lg object-cover border" />}
                          <label className="flex items-center gap-1 text-xs font-medium text-primary-600 cursor-pointer hover:text-primary-700">
                            {imgUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                            {editImage ? 'Change photo' : 'Add photo'}
                            <input type="file" accept="image/*" className="hidden" onChange={e => { pickImage(e.target.files?.[0], setEditImage); e.target.value = ''; }} />
                          </label>
                          {editImage && <button onClick={() => setEditImage('')} className="text-xs text-red-500 hover:text-red-600">Remove</button>}
                        </div>
                      </div>
                    ) : (
                      cat.image
                        ? <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                        : <span className="text-2xl">{cat.icon}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {editId === cat.id ? (
                      <div className="space-y-2">
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="border-2 border-primary-300 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-primary-600 w-40"
                          autoFocus
                        />
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">Order:</span>
                          <input
                            type="number" min="1"
                            value={editPriority}
                            onChange={e => setEditPriority(e.target.value)}
                            placeholder="#"
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-16 outline-none focus:border-primary-500"
                          />
                          <span className="text-[11px] text-gray-400">(lower = first)</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-gray-800">{cat.name}</span>
                        <span className="ml-2 text-xs text-gray-400">#{cat.sortOrder}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${cat.active ? 'text-emerald-600' : 'text-gray-400'}`}
                    >
                      {cat.active
                        ? <ToggleRight size={24} className="text-emerald-500" />
                        : <ToggleLeft size={24} className="text-gray-300" />
                      }
                      {cat.active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {editId === cat.id ? (
                        <>
                          <button
                            onClick={handleEditSave}
                            className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditIcon(cat.icon); setCustomEmoji(''); setEditImage(cat.image || ''); setEditPriority(cat.sortOrder ?? ''); }}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteId(cat.id)}
                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Add New Category</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Sunglasses"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-600 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon / Emoji *</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => setNewIcon(e)}
                      className={`text-2xl p-1.5 rounded-lg transition-colors ${newIcon === e ? 'bg-primary-100 ring-2 ring-primary-400' : 'hover:bg-gray-100'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type any emoji"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary-600"
                  onChange={e => { if (e.target.value) setNewIcon(e.target.value); }}
                />
                <p className="text-xs text-gray-400 mt-1">Selected: <span className="text-xl">{newIcon}</span></p>
              </div>

              {/* Category photo (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Photo <span className="text-gray-400 font-normal">(optional — shows instead of emoji)</span></label>
                {newImage ? (
                  <div className="flex items-center gap-3">
                    <img src={newImage} alt="" className="w-16 h-16 rounded-xl object-cover border" />
                    <button onClick={() => setNewImage('')} className="text-sm text-red-500 hover:text-red-600 font-medium">Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 text-sm cursor-pointer hover:border-primary-400 text-gray-500">
                    {imgUploading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : <><Upload size={16} /> Upload photo</>}
                    <input type="file" accept="image/*" className="hidden" onChange={e => { pickImage(e.target.files?.[0], setNewImage); e.target.value = ''; }} />
                  </label>
                )}
              </div>

              {/* Display order / priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Order <span className="text-gray-400 font-normal">(lower number shows first — blank = last)</span></label>
                <input
                  type="number" min="1"
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-600"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Category?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Removing <span className="font-semibold">{categories.find(c => c.id === deleteId)?.name}</span> will hide it from the entire site. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => confirmDelete(deleteId)} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
