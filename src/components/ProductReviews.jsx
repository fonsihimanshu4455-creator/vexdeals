import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle2 } from 'lucide-react';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

function Stars({ value, size = 14 }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size} className={i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'} />
      ))}
    </div>
  );
}

export default function ProductReviews({ productId, baseRating = 0 }) {
  const { user, isCustomer } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!db || !productId) return undefined;
    const q = query(collection(db, 'reviews'), where('productId', '==', String(productId)));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 9e15) - (a.createdAt?.seconds || 9e15));
      setReviews(list);
    }, () => {});
  }, [productId]);

  const submit = async () => {
    if (!comment.trim()) { setMsg('Please write a short review.'); return; }
    if (!db) { setMsg('Unable to submit right now. Try again later.'); return; }
    try {
      setSubmitting(true);
      setMsg('');
      await addDoc(collection(db, 'reviews'), {
        productId: String(productId),
        userName: user?.name || user?.fullName || 'Customer',
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      setComment('');
      setRating(5);
      setMsg('✓ Thanks! Your review has been added.');
    } catch {
      setMsg('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / count : baseRating;
  const fmtDate = (ts) => ts?.seconds
    ? new Date(ts.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Just now';

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-5 bg-gray-50 rounded-2xl p-5">
        <div className="text-center shrink-0">
          <p className="text-4xl font-bold text-gray-900">{avg ? avg.toFixed(1) : '—'}</p>
          <Stars value={avg} />
          <p className="text-xs text-gray-500 mt-1">{count} review{count === 1 ? '' : 's'}</p>
        </div>
        <div className="text-sm text-gray-600">
          {count === 0
            ? 'No reviews yet. Be the first to share your experience!'
            : 'Based on verified customer experiences.'}
        </div>
      </div>

      {/* Write a review */}
      {isCustomer ? (
        <div className="border border-gray-100 rounded-2xl p-5">
          <p className="font-semibold text-gray-800 mb-3">Write a review</p>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}>
                <Star size={24} className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'} />
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share what you liked about this product…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 resize-none"
          />
          <div className="flex items-center gap-3 mt-3">
            <button onClick={submit} disabled={submitting}
              className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-700 disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
            {msg && <span className="text-xs text-emerald-600 font-medium">{msg}</span>}
          </div>
        </div>
      ) : (
        <div className="border border-gray-100 rounded-2xl p-5 text-sm text-gray-600">
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link> to write a review.
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                  {String(review.userName || 'C').charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-800 text-sm">{review.userName || 'Customer'}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                  <CheckCircle2 size={11} /> Verified
                </span>
              </div>
              <span className="text-xs text-gray-400">{fmtDate(review.createdAt)}</span>
            </div>
            <Stars value={review.rating} size={13} />
            <p className="text-sm text-gray-600 mt-1.5">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
