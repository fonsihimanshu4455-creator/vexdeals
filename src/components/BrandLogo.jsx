import { useState } from 'react';
import { useBrands } from '../context/BrandContext';

/**
 * Renders the logo + name for a brand stored on a product.
 * Falls back gracefully if the logo fails to load (Clearbit miss, offline, etc.).
 *
 * Props:
 *   - brand:   slug or name (string)  ── or pass `brandObj` directly
 *   - size:    'xs' | 'sm' | 'md' | 'lg'
 *   - variant: 'chip' (logo + name pill) | 'logo' (logo only) | 'inline' (logo + name plain)
 *   - className extras
 */
export default function BrandLogo({ brand, brandObj, size = 'sm', variant = 'chip', className = '' }) {
  const { getBrand } = useBrands();
  const b = brandObj || getBrand(brand);
  const [errored, setErrored] = useState(false);

  if (!b) return null;

  const dim = { xs: 16, sm: 20, md: 28, lg: 40 }[size] || 20;
  const text =
    size === 'xs' ? 'text-[10px]' :
    size === 'lg' ? 'text-sm'    :
                    'text-[11px]';

  const initial = b.name.charAt(0).toUpperCase();

  const Logo = (
    <span
      className="inline-flex items-center justify-center rounded-md bg-white ring-1 ring-gray-200 overflow-hidden shrink-0"
      style={{ width: dim, height: dim }}
      title={b.name}
    >
      {b.logo && !errored ? (
        <img
          src={b.logo}
          alt={b.name}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <span className="font-display font-bold text-navy-900" style={{ fontSize: dim * 0.55 }}>
          {initial}
        </span>
      )}
    </span>
  );

  if (variant === 'logo') return <span className={className}>{Logo}</span>;

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        {Logo}
        <span className={`font-bold text-gray-700 ${text}`}>{b.name}</span>
      </span>
    );
  }

  // 'chip'
  return (
    <span className={`inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full pl-1 pr-2.5 py-0.5 shadow-sm ${className}`}>
      {Logo}
      <span className={`font-bold text-gray-800 ${text}`}>{b.name}</span>
    </span>
  );
}
