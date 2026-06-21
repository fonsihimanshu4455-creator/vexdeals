import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, ArrowRight } from 'lucide-react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useProducts } from '../context/ProductContext';

const isEmbed = (v) => /(youtube\.com|youtu\.be|drive\.google\.com)/.test(v);
const embedSrc = (v) => {
  const drive = v.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  const base = v.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
  return `${base}${base.includes('?') ? '&' : '?'}autoplay=1&mute=1&loop=1&playsinline=1`;
};
const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

// Wrap a reel in the right link type based on its `link`.
function ReelLink({ link, children, className }) {
  if (!link) return <div className={className}>{children}</div>;
  if (/^https?:\/\//.test(link)) return <a href={link} target="_blank" rel="noreferrer" className={className}>{children}</a>;
  return <Link to={link} className={className}>{children}</Link>;
}

function Reel({ reel }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.muted = true;
    el.setAttribute('muted', '');
    const tryPlay = () => el.play?.().catch(() => {});
    tryPlay();
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.muted = true; tryPlay(); } else el.pause?.(); },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <ReelLink link={reel.link} className="group relative shrink-0 w-40 sm:w-48 snap-start rounded-2xl overflow-hidden bg-ink-900 shadow-card">
      <div className="aspect-[9/16]">
        {isEmbed(reel.video) ? (
          <iframe src={embedSrc(reel.video)} title={reel.title || 'Reel'} className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <video ref={ref} src={reel.video} muted loop autoPlay playsInline preload="auto"
            onLoadedData={(e) => { e.currentTarget.muted = true; e.currentTarget.play?.().catch(() => {}); }}
            onCanPlay={(e) => { e.currentTarget.muted = true; e.currentTarget.play?.().catch(() => {}); }}
            className="w-full h-full object-cover" />
        )}
      </div>
      {(reel.title || reel.price != null) && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3 pointer-events-none">
          {reel.title && <p className="text-white text-sm font-semibold line-clamp-1">{reel.title}</p>}
          {reel.price != null && (
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-white font-bold">{formatPrice(reel.price)}</span>
              {reel.originalPrice > reel.price && <span className="text-white/60 text-xs line-through">{formatPrice(reel.originalPrice)}</span>}
            </div>
          )}
        </div>
      )}
      {reel.discount > 0 && (
        <span className="absolute top-2 left-2 bg-accent-500 text-ink-900 text-[10px] font-bold px-2 py-0.5 rounded-full">{reel.discount}% OFF</span>
      )}
    </ReelLink>
  );
}

export default function InstagramReels() {
  const { visibleProducts: products } = useProducts();
  const [uploaded, setUploaded] = useState([]);

  useEffect(() => {
    if (!db) return undefined;
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setUploaded(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
  }, []);

  // Admin-uploaded reels first, then any product that has a video attached.
  const reels = [
    ...uploaded.filter((r) => r.video).map((r) => ({ id: r.id, video: r.video, link: r.link || '', title: r.title || '' })),
    ...products.filter((p) => p.video && String(p.video).trim()).map((p) => ({
      id: `p_${p.id}`, video: p.video, link: `/products/${p.id}`, title: p.name,
      price: p.price, originalPrice: p.originalPrice, discount: p.discount,
    })),
  ];

  if (reels.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 reveal">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-1.5"><Instagram size={14} /> @vexdeals</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">Shop Our Reels</h2>
        </div>
        <a href="https://www.instagram.com/vexdeals/" target="_blank" rel="noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-full transition-colors">
          Follow <ArrowRight size={15} />
        </a>
      </div>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none snap-x pb-2">
        {reels.map((r) => <Reel key={r.id} reel={r} />)}
      </div>
    </section>
  );
}
