import { useEffect, useMemo, useState } from 'react';
import { Star, Trash2, Search, MessageSquare, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useProducts } from '../../context/ProductContext';

function Stars({ value, size = 13 }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size} className={i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const { products } = useProducts();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [search, setSearch] = useState('');
  const [minStars, setMinStars] = useState(0);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!db) { setLoading(false); return undefined; }
    return onSnapshot(collection(db, 'reviews'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 9e15) - (a.createdAt?.seconds || 9e15));
      setReviews(list);
      setLive(true);
      setLoading(false);
    }, () => { setLive(false); setLoading(false); });
  }, []);

  const productName = (pid) => products.find(p => String(p.id) === String(pid))?.name || `Product #${pid}`;
  const fmtDate = (ts) => ts?.seconds ? new Date(ts.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const filtered = useMemo(() => reviews.filter(r => {
    if (minStars && (r.rating || 0) < minStars) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.userName || '').toLowerCase().includes(q)
      || (r.comment || '').toLowerCase().includes(q)
      || productName(r.productId).toLowerCase().includes(q);
  }), [reviews, search, minStars, products]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length : 0;

  const removeReview = async (id) => {
    if (db) await deleteDoc(doc(db, 'reviews', id)).catch(() => {});
    setReviews(list => list.filter(r => r.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-gray-500 text-sm">{reviews.length} customer reviews</p>
            {live ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><Wifi size={12} /> Live</span>
            ) : !loading && (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium"><WifiOff size={12} /> Offline</span>
            )}
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm flex items-center gap-2">
          <Star size={15} className="text-amber-500 fill-amber-500" />
          <span className="font-semibold text-amber-700">{avg ? avg.toFixed(1) : '—'} average</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by product, customer, or text…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500" />
        </div>
        <div className="flex gap-2">
          {[0, 5, 4, 3, 2, 1].map(s => (
            <button key={s} onClick={() => setMinStars(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                minStars === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s === 0 ? 'All' : `${s}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <RefreshCw size={20} className="animate-spin" /> <span className="text-sm">Loading reviews…</span>
        </div>
      )}

      {/* List */}
      {!loading && (
        filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {String(r.userName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{r.userName || 'Customer'}</span>
                      <Stars value={r.rating} />
                      <span className="text-xs text-gray-400">{fmtDate(r.createdAt)}</span>
                    </div>
                    <p className="text-xs text-primary-600 font-medium mt-1.5">on {productName(r.productId)}</p>
                    <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                  </div>
                  <button onClick={() => setDeleteId(r.id)}
                    className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors shrink-0" title="Delete review">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={26} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete this review?</h3>
            <p className="text-gray-500 text-sm mb-6">This will permanently remove the review from the product page.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => removeReview(deleteId)} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
