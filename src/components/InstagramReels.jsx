import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, ArrowRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const isEmbed = (v) => /(youtube\.com|youtu\.be|drive\.google\.com)/.test(v);
const embedSrc = (v) => {
  const drive = v.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  const base = v.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
  return `${base}${base.includes('?') ? '&' : '?'}autoplay=1&mute=1&loop=1&playsinline=1`;
};
const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

function Reel({ product }) {
  const ref = useRef(null);

  // Autoplay muted (set the muted *property* imperatively — React's `muted`
  // attribute alone doesn't always apply it, which makes browsers block autoplay)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.setAttribute('muted', '');
    const tryPlay = () => el.play?.().catch(() => {});
    tryPlay();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.muted = true; tryPlay(); }
        else el.pause?.();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative shrink-0 w-40 sm:w-48 snap-start rounded-2xl overflow-hidden bg-ink-900 shadow-card"
    >
      <div className="aspect-[9/16]">
        {isEmbed(product.video) ? (
          <iframe
            src={embedSrc(product.video)}
            title={product.name}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={ref}
            src={product.video}
            muted
            loop
            autoPlay
            playsInline
            preload="auto"
            onLoadedData={(e) => { e.currentTarget.muted = true; e.currentTarget.play?.().catch(() => {}); }}
            onCanPlay={(e) => { e.currentTarget.muted = true; e.currentTarget.play?.().catch(() => {}); }}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      {/* Info overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3 pointer-events-none">
        <p className="text-white text-sm font-semibold line-clamp-1">{product.name}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-white font-bold">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-white/60 text-xs line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
      {product.discount > 0 && (
        <span className="absolute top-2 left-2 bg-accent-500 text-ink-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {product.discount}% OFF
        </span>
      )}
    </Link>
  );
}

export default function InstagramReels() {
  const { products } = useProducts();
  const reels = products.filter((p) => p.video && String(p.video).trim());
  if (reels.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 reveal">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-1.5">
            <Instagram size={14} /> @vexdeals
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">Shop Our Reels</h2>
        </div>
        <a
          href="https://www.instagram.com/vexdeals/"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-full transition-colors"
        >
          Follow <ArrowRight size={15} />
        </a>
      </div>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none snap-x pb-2">
        {reels.map((p) => (
          <Reel key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
