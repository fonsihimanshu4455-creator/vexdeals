/**
 * VexDeals brand logo — SVG recreation of the shield + glasses + watch mark.
 * Matches the uploaded logo: navy shield, sunglasses top, gold watch center,
 * VEX (navy) / DEALS (gold) text.
 */

export function VexLogoMark({ size = 40 }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s * 1.1}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldFill" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0b2340" />
          <stop offset="100%" stopColor="#08243a" />
        </linearGradient>
        <linearGradient id="goldRing" x1="30" y1="55" x2="70" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ffd54f" />
          <stop offset="100%" stopColor="#009fb7" />
        </linearGradient>
        <radialGradient id="watchFace" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffffff" />
        </radialGradient>
      </defs>

      {/* ── Shield body ── */}
      <path
        d="M50 4 L8 20 L8 52 C8 76 27 94 50 102 C73 94 92 76 92 52 L92 20 Z"
        fill="url(#shieldFill)"
        stroke="#1a3a5c"
        strokeWidth="1"
      />

      {/* ── Glasses / Sunglasses ── */}
      {/* Left lens frame */}
      <rect x="14" y="24" width="28" height="18" rx="6" ry="6"
        fill="none" stroke="#009fb7" strokeWidth="2.5" />
      {/* Right lens frame */}
      <rect x="58" y="24" width="28" height="18" rx="6" ry="6"
        fill="none" stroke="#009fb7" strokeWidth="2.5" />
      {/* Bridge between lenses */}
      <line x1="42" y1="33" x2="58" y2="33" stroke="#009fb7" strokeWidth="2.5" />
      {/* Left arm */}
      <line x1="14" y1="33" x2="8" y2="30" stroke="#009fb7" strokeWidth="2" strokeLinecap="round" />
      {/* Right arm */}
      <line x1="86" y1="33" x2="92" y2="30" stroke="#009fb7" strokeWidth="2" strokeLinecap="round" />
      {/* Lens tint */}
      <rect x="15.5" y="25.5" width="25" height="15" rx="5" ry="5"
        fill="#0b2340" fillOpacity="0.6" />
      <rect x="59.5" y="25.5" width="25" height="15" rx="5" ry="5"
        fill="#0b2340" fillOpacity="0.6" />

      {/* ── Watch / Clock ── */}
      {/* Gold outer bezel */}
      <circle cx="50" cy="68" r="24" fill="url(#goldRing)" />
      {/* Bezel inner ring */}
      <circle cx="50" cy="68" r="21" fill="#08243a" />
      {/* Watch face */}
      <circle cx="50" cy="68" r="18" fill="url(#watchFace)" />
      {/* Minute tick marks */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
        const rad = (deg - 90) * Math.PI / 180;
        const isHour = i % 3 === 0;
        const r1 = isHour ? 13 : 14.5;
        const r2 = 16;
        return (
          <line
            key={deg}
            x1={50 + r1 * Math.cos(rad)}
            y1={68 + r1 * Math.sin(rad)}
            x2={50 + r2 * Math.cos(rad)}
            y2={68 + r2 * Math.sin(rad)}
            stroke={isHour ? '#0b2340' : '#8ad7e6'}
            strokeWidth={isHour ? 2 : 1}
            strokeLinecap="round"
          />
        );
      })}
      {/* Hour hand — pointing to ~10 */}
      <line x1="50" y1="68" x2="43" y2="60"
        stroke="#0b2340" strokeWidth="2.5" strokeLinecap="round" />
      {/* Minute hand — pointing to ~2 */}
      <line x1="50" y1="68" x2="56" y2="57"
        stroke="#0b2340" strokeWidth="2" strokeLinecap="round" />
      {/* Second hand — gold */}
      <line x1="50" y1="68" x2="54" y2="80"
        stroke="#009fb7" strokeWidth="1.2" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="50" cy="68" r="2" fill="#0b2340" />

      {/* Crown at 3 o'clock */}
      <rect x="72" y="66" width="5" height="4" rx="1" fill="#009fb7" />

      {/* Watch strap top */}
      <rect x="45" y="44" width="10" height="6" rx="2" fill="#009fb7" opacity="0.7" />
      {/* Watch strap bottom */}
      <rect x="45" y="90" width="10" height="6" rx="2" fill="#009fb7" opacity="0.7" />
    </svg>
  );
}

/** Full stacked logo for hero/splash/login screens
 *  variant='light' → dark text (default, white bg)
 *  variant='dark'  → white text (dark/navy bg)
 */
export function VexLogoFull({ className = '', variant = 'dark' }) {
  const vexColor      = variant === 'dark' ? 'text-white'      : 'text-primary-800';
  const taglineColor  = variant === 'dark' ? 'text-primary-300' : 'text-gray-400';
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <VexLogoMark size={80} />
      <div className="text-center leading-none mt-1">
        <div className={`text-4xl font-black ${vexColor} tracking-tight`}>VEX</div>
        <div className="text-2xl font-black text-accent-500 tracking-[0.25em] -mt-1">DEALS</div>
        <div className={`text-[9px] font-semibold tracking-[0.3em] ${taglineColor} uppercase mt-1`}>
          · Premium Watches & Eyewear ·
        </div>
      </div>
    </div>
  );
}

/** Compact inline logo for navbar
 *  variant='light' → dark text on white background (default, navbar)
 *  variant='dark'  → white text on dark background (admin sidebar)
 */
export function VexLogoInline({ size = 'md', variant = 'light' }) {
  const logoSize = size === 'sm' ? 32 : size === 'lg' ? 52 : 40;
  const vexColor  = variant === 'dark' ? 'text-white'      : 'text-primary-800';
  const dealsColor = variant === 'dark' ? 'text-accent-400' : 'text-accent-500';
  const vexText   = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const dealsText = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-[13px]' : 'text-[11px]';
  return (
    <div className="flex items-center gap-2.5">
      <VexLogoMark size={logoSize} />
      <div className="leading-none">
        <div className={`font-black tracking-tight ${vexColor} ${vexText}`}>VEX</div>
        <div className={`font-black tracking-[0.2em] ${dealsColor} ${dealsText} -mt-0.5`}>DEALS</div>
      </div>
    </div>
  );
}
