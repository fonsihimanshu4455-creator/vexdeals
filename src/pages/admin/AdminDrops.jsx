import { useMemo, useState } from 'react';
import { Sparkles, Search, X, Check, GripVertical } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

// Manage the homepage "Drops" 3D coverflow — pick products and write the
// custom line shown under each product's picture.
export default function AdminDrops() {
  const { products, updateProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('in'); // 'in' = in drops, 'add' = add more

  const inDrops = useMemo(
    () => products.filter((p) => p.drops).sort((a, b) => (Number(a.dropsOrder) || 9999) - (Number(b.dropsOrder) || 9999)),
    [products]
  );
  const notInDrops = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => !p.drops && (!q || p.name.toLowerCase().includes(q)))
      .slice(0, 40);
  }, [products, search]);

  const addToDrops = (p) => updateProduct(p.id, { drops: true, dropsOrder: inDrops.length + 1 });
  const removeFromDrops = (p) => updateProduct(p.id, { drops: false });
  const setText = (p, dropsText) => updateProduct(p.id, { dropsText });
  const setOrder = (p, dropsOrder) => updateProduct(p.id, { dropsOrder: Number(dropsOrder) || '' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Sparkles size={22} /> Drops — Homepage 3D Showcase</h2>
        <p className="text-gray-500 text-sm mt-0.5">Choose products for the rotating 3D "Drops" section, aur har picture ke neeche apni line likho.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ k: 'in', l: `In Drops (${inDrops.length})` }, { k: 'add', l: 'Add products' }].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === k ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'in' ? (
        inDrops.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12 bg-white rounded-2xl border border-gray-100">
            Abhi koi product Drops me nahi. "Add products" tab se choose karo.
          </p>
        ) : (
          <div className="space-y-3">
            {inDrops.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
                <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-gray-50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                  <p className="text-xs text-gray-400">₹{Number(p.price).toLocaleString('en-IN')}</p>
                  <input
                    value={p.dropsText || ''}
                    onChange={(e) => setText(p, e.target.value)}
                    placeholder="Picture ke neeche likhne ke liye (jaise: Limited Drop 🔥)"
                    className="mt-1.5 w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-primary-500"
                  />
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <input type="number" value={p.dropsOrder || ''} onChange={(e) => setOrder(p, e.target.value)}
                    placeholder="#" title="Order (lower = first)"
                    className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:border-primary-500" />
                  <button onClick={() => removeFromDrops(p)} className="text-xs text-red-500 font-semibold hover:underline flex items-center gap-1"><X size={13} /> Remove</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products to add…"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {notInDrops.map((p) => (
              <button key={p.id} onClick={() => addToDrops(p)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2.5 text-left hover:border-primary-400 transition-colors group">
                <img src={p.image} alt={p.name} className="w-full aspect-square rounded-xl object-cover bg-gray-50" />
                <p className="text-xs font-medium text-gray-800 line-clamp-1 mt-2">{p.name}</p>
                <p className="text-[11px] text-gray-400">₹{Number(p.price).toLocaleString('en-IN')}</p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 opacity-0 group-hover:opacity-100"><Check size={12} /> Add to Drops</span>
              </button>
            ))}
          </div>
          {notInDrops.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Koi product nahi mila.</p>}
        </div>
      )}
    </div>
  );
}
