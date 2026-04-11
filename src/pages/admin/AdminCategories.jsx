import { useState, useRef } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Edit2, Save, X, Tag, Upload, Image } from 'lucide-react';
import { useCategories } from '../../context/CategoryContext';

const EMOJI_OPTIONS = ['⌚','🕶️','💻','👗','🏠','🏋️','✨','📱','🎵','📚','🍎','🚗','💊','🎮','👟','💍','🌿','🎒'];

// Render category icon — emoji string OR image URL/base64
function CatIcon({ icon, size = 'md' }) {
  const isImg = icon && (icon.startsWith('data:') || icon.startsWith('http://') || icon.startsWith('https://'));
  const cls = size === 'sm' ? 'w-8 h-8 rounded-lg object-cover' : 'w-10 h-10 rounded-xl object-cover';
  const emojiCls = size === 'sm' ? 'text-xl' : 'text-2xl';
  if (isImg) return <img src={icon} alt="" className={cls} />;
  return <span className={emojiCls}>{icon}</span>;
}

export default function AdminCategories() {
  const { categories, activeCategories, addCategory, removeCategory, toggleCategory, updateCategory } = useCategories();

  // Add modal state
  const [showAdd, setShowAdd]         = useState(false);
  const [newName, setNewName]         = useState('');
  const [newIcon, setNewIcon]         = useState('🛍️');
  const [newIconMode, setNewIconMode] = useState('emoji'); // 'emoji' | 'image'
  const [newImgPreview, setNewImgPreview] = useState(null);

  // Edit state
  const [editId, setEditId]           = useState(null);
  const [editName, setEditName]       = useState('');
  const [editIcon, setEditIcon]       = useState('');
  const [editIconMode, setEditIconMode] = useState('emoji');
  const [editImgPreview, setEditImgPreview] = useState(null);
  const [customEmoji, setCustomEmoji] = useState('');

  const [deleteId, setDeleteId]       = useState(null);

  const addFileRef  = useRef();
  const editFileRef = useRef();

  // ── Image upload helpers ──────────────────────────────────────────────────
  const readFile = (file, onDone) => {
    if (!file) return;
    if (file.size > 600 * 1024) {
      alert('Image too large. Please use a file under 600 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onDone(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddImageUpload = (e) => {
    readFile(e.target.files[0], (dataUrl) => {
      setNewImgPreview(dataUrl);
      setNewIcon(dataUrl);
    });
  };

  const handleEditImageUpload = (e) => {
    readFile(e.target.files[0], (dataUrl) => {
      setEditImgPreview(dataUrl);
      setEditIcon(dataUrl);
    });
  };

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim(), newIcon);
    setNewName('');
    setNewIcon('🛍️');
    setNewImgPreview(null);
    setNewIconMode('emoji');
    setShowAdd(false);
  };

  const handleEditSave = () => {
    if (!editName.trim()) return;
    updateCategory(editId, { name: editName.trim(), icon: editIcon });
    setEditId(null);
    setEditImgPreview(null);
  };

  const confirmDelete = (id) => {
    removeCategory(id);
    setDeleteId(null);
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon);
    setCustomEmoji('');
    const isImg = cat.icon && (cat.icon.startsWith('data:') || cat.icon.startsWith('http'));
    setEditIconMode(isImg ? 'image' : 'emoji');
    setEditImgPreview(isImg ? cat.icon : null);
  };

  return (
    <div className="space-y-6">
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
                      <div className="space-y-2">
                        {/* Mode switcher */}
                        <div className="flex gap-1 mb-2">
                          <button
                            onClick={() => setEditIconMode('emoji')}
                            className={`text-xs px-2 py-1 rounded-lg font-medium ${editIconMode === 'emoji' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                          >
                            Emoji
                          </button>
                          <button
                            onClick={() => { setEditIconMode('image'); setTimeout(() => editFileRef.current?.click(), 50); }}
                            className={`text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${editIconMode === 'image' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                          >
                            <Upload size={11} /> Image
                          </button>
                          <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageUpload} />
                        </div>

                        {editIconMode === 'emoji' ? (
                          <>
                            <div className="flex flex-wrap gap-1 max-w-48">
                              {EMOJI_OPTIONS.map(e => (
                                <button
                                  key={e}
                                  onClick={() => setEditIcon(e)}
                                  className={`text-lg p-1 rounded ${editIcon === e ? 'bg-primary-100 ring-2 ring-primary-400' : 'hover:bg-gray-100'}`}
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                            <input
                              value={customEmoji}
                              onChange={e => { setCustomEmoji(e.target.value); if (e.target.value) setEditIcon(e.target.value); }}
                              placeholder="or type emoji"
                              className="border rounded px-2 py-1 text-xs w-28 mt-1"
                            />
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            {editImgPreview
                              ? <img src={editImgPreview} alt="" className="w-10 h-10 rounded-xl object-cover border" />
                              : <div className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center"><Image size={14} className="text-gray-400" /></div>
                            }
                            <button
                              onClick={() => editFileRef.current?.click()}
                              className="text-xs text-primary-600 underline"
                            >
                              {editImgPreview ? 'Change' : 'Upload'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <CatIcon icon={cat.icon} />
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {editId === cat.id ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="border-2 border-primary-300 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-primary-600 w-40"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-gray-800">{cat.name}</span>
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
                            onClick={() => { setEditId(null); setEditImgPreview(null); }}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(cat)}
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

      {/* ── Add Category Modal ───────────────────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Add New Category</h3>
              <button onClick={() => { setShowAdd(false); setNewImgPreview(null); setNewIconMode('emoji'); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {/* Name */}
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

              {/* Icon type switcher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon / Image *</label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setNewIconMode('emoji')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-colors ${newIconMode === 'emoji' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    😀 Emoji
                  </button>
                  <button
                    onClick={() => { setNewIconMode('image'); setTimeout(() => addFileRef.current?.click(), 50); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-colors ${newIconMode === 'image' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <Upload size={14} /> Upload Image
                  </button>
                  <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={handleAddImageUpload} />
                </div>

                {newIconMode === 'emoji' ? (
                  <>
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
                  </>
                ) : (
                  <div
                    onClick={() => addFileRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                  >
                    {newImgPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={newImgPreview} alt="preview" className="w-20 h-20 rounded-2xl object-cover border border-gray-200" />
                        <p className="text-xs text-primary-600 font-medium">Click to change image</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Upload size={22} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                        <p className="text-xs text-gray-400">Recommended: <span className="font-semibold">100×100 px</span>, square, JPG/PNG/WebP</p>
                        <p className="text-xs text-gray-400">Max size: <span className="font-semibold">600 KB</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAdd(false); setNewImgPreview(null); setNewIconMode('emoji'); }}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim() || (newIconMode === 'image' && !newImgPreview)}
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
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
