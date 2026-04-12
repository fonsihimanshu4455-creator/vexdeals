import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Edit2, Save, X, Tag } from 'lucide-react';
import { useCategories } from '../../context/CategoryContext';

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

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim(), newIcon);
    setNewName('');
    setNewIcon('🛍️');
    setShowAdd(false);
  };

  const handleEditSave = () => {
    if (!editName.trim()) return;
    updateCategory(editId, { name: editName.trim(), icon: editIcon });
    setEditId(null);
  };

  const confirmDelete = (id) => {
    removeCategory(id);
    setDeleteId(null);
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
                        <input
                          value={customEmoji}
                          onChange={e => { setCustomEmoji(e.target.value); if (e.target.value) setEditIcon(e.target.value); }}
                          placeholder="or type"
                          className="border rounded px-2 py-1 text-xs w-16"
                        />
                      </div>
                    ) : (
                      <span className="text-2xl">{cat.icon}</span>
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
                            onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditIcon(cat.icon); setCustomEmoji(''); }}
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
