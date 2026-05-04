import { useEffect, useState } from 'react';
import { useBrands } from '../context/BrandContext';
import { hasBrandMark, renderBrandMark } from '../data/brandMarks';

/**
 * Renders the logo + name for a brand stored on a product.
 *
 * Loading order (so a logo always shows up):
 *   1. Remote image URL stored on the brand (admin-managed / Clearbit CDN)
 *   2. Inline SVG monogram for iconic brands (data/brandMarks.jsx)
 *   3. Typographic initial fallback
 *
 * Props:
 *   - brand:     slug or name (string) ── or pass `brandObj` directly
 *   - size:      'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   - variant:   'chip' (logo + name pill) | 'logo' (logo only) | 'inline' (logo + name plain)
 *   - className: extras
 */
export default function BrandLogo({ brand, brandObj, size = 'sm', variant = 'chip', className = '' }) {
  const { getBrand } = useBrands();
  const b = brandObj || getBrand(brand);
  const [imageBroken, setImageBroken] = useState(false);

  // reset when the brand changes
  useEffect(() => { setImageBroken(false); }, [b?.slug, b?.logo]);

  if (!b) return null;

  const dim = { xs: 16, sm: 22, md: 32, lg: 48, xl: 72 }[size] || 22;
  const text =
    size === 'xs' ? 'text-[10px]' :
    size === 'lg' || size === 'xl' ? 'text-sm' :
                    'text-[11px]';

  const initial = b.name.charAt(0).toUpperCase();
  const hasMark = hasBrandMark(b.slug);

  // Decide what to render inside the square logo box:
  //  • working remote URL → <img>
  //  • inline SVG mark exists → SVG
  //  • else typographic initial
  let Inner;
  if (b.logo && !imageBroken) {
    Inner = (
      <img
        src={b.logo}
        alt={b.name}
        loading="lazy"
        decoding="async"
        onError={() => setImageBroken(true)}
        className="w-full h-full object-contain"
      />
    );
  } else if (hasMark) {
    Inner = renderBrandMark(b.slug);
  } else {
    Inner = (
      <span
        className="font-display font-bold text-navy-900 leading-none"
        style={{ fontSize: dim * 0.55 }}
      >
        {initial}
      </span>
    );
  }

  // The inner SVG marks already include their own background — when an SVG
  // mark is showing we drop the white frame so the mark's brand colour
  // stays visible.
  const showFrame = b.logo && !imageBroken; // only frame for raster images
  const Logo = (
    <span
      className={`inline-flex items-center justify-center rounded-md overflow-hidden shrink-0 ${
        showFrame ? 'bg-white ring-1 ring-gray-200' : ''
      }`}
      style={{ width: dim, height: dim }}
      title={b.name}
    >
      {Inner}
    </span>
  );

  if (variant === 'logo') return <span className={className}>{Logo}</span>;

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        {Logo}
        <span className={`font-bold text-gray-700 ${text} truncate max-w-[120px]`}>{b.name}</span>
      </span>
    );
  }

  // 'chip'
  return (
    <span className={`inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full pl-1 pr-2.5 py-0.5 shadow-sm ${className}`}>
      {Logo}
      <span className={`font-bold text-gray-800 ${text} truncate max-w-[110px]`}>{b.name}</span>
    </span>
  );
}
