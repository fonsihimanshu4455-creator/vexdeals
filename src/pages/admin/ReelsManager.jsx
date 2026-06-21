import { useEffect, useRef, useState } from 'react';
import { Film, Upload, Trash2, Link as LinkIcon, Loader2, Plus } from 'lucide-react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';

const MAX_SECONDS = 7;

// Read a video file's duration (seconds) in the browser.
const getDuration = (file) => new Promise((resolve) => {
  const v = document.createElement('video');
  v.preload = 'metadata';
  v.onloadedmetadata = () => { const d = v.duration; URL.revokeObjectURL(v.src); resolve(d); };
  v.onerror = () => resolve(999);
  v.src = URL.createObjectURL(file);
});

export default function ReelsManager() {
  const [reels, setReels] = useState([]);
  const [video, setVideo] = useState('');
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (!db) return undefined;
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setReels(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
  }, []);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (!file.type.startsWith('video/')) { setError('Sirf video file daalo.'); return; }
    const dur = await getDuration(file);
    if (dur > MAX_SECONDS + 0.6) {
      setError(`Video ${MAX_SECONDS} second se chhoti honi chahiye (ye ${Math.round(dur)}s hai). Chhoti karke daalo.`);
      return;
    }
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file, 'video');
      setVideo(url);
    } catch (err) {
      setError(err.message || 'Upload fail. Dobara try karo.');
    } finally {
      setUploading(false);
    }
  };

  const addReel = async () => {
    if (!video) { setError('Pehle video upload karo.'); return; }
    setSaving(true);
    const id = `reel_${Date.now()}`;
    const reel = { id, video, link: link.trim(), title: title.trim(), createdAt: new Date().toISOString() };
    try {
      if (db) await setDoc(doc(db, 'reels', id), reel);
      setVideo(''); setLink(''); setTitle(''); setError('');
    } catch {
      setError('Save fail. Dobara try karo.');
    } finally {
      setSaving(false);
    }
  };

  const removeReel = async (id) => {
    if (db) await deleteDoc(doc(db, 'reels', id)).catch(() => {});
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500';

  return (
    <div className="space-y-5">
      {/* Add reel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Film size={18} /> Add homepage video (max {MAX_SECONDS}s)</h3>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2 text-sm">{error}</div>}

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Upload / preview */}
          <div className="shrink-0">
            <div className="w-32 aspect-[9/16] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
              {video ? (
                <video src={video} muted loop autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <Film size={28} className="text-gray-300" />
              )}
            </div>
            <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={onPick} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="mt-2 w-32 flex items-center justify-center gap-1.5 bg-ink-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-primary-700 disabled:opacity-60">
              {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> : <><Upload size={13} /> {video ? 'Change' : 'Upload'}</>}
            </button>
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1"><LinkIcon size={12} /> Video pe click karne pe kahan jaye (link)</label>
              <input className={inputCls} value={link} onChange={(e) => setLink(e.target.value)}
                placeholder="/products/47  ya  https://wa.me/91..." />
              <p className="text-[11px] text-gray-400 mt-1">Product link (jaise <b>/products/47</b>) ya koi bhi URL. Khaali = sirf video.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New Arrival 🔥" />
            </div>
            <button onClick={addReel} disabled={saving || !video}
              className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add Reel
            </button>
          </div>
        </div>
      </div>

      {/* Existing reels */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">{reels.length} reel{reels.length !== 1 ? 's' : ''} on homepage</p>
        {reels.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Abhi koi reel nahi. Upar se add karo.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {reels.map((r) => (
              <div key={r.id} className="relative rounded-2xl overflow-hidden bg-ink-900 aspect-[9/16] group">
                <video src={r.video} muted loop autoPlay playsInline className="w-full h-full object-cover" />
                {r.title && <span className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-[10px] font-semibold line-clamp-1 drop-shadow">{r.title}</span>}
                {r.link && <span className="absolute top-1.5 left-1.5 bg-white/85 text-ink-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full max-w-[80%] truncate">{r.link}</span>}
                <button onClick={() => removeReel(r.id)}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
