/**
 * Inline SVG monograms for iconic brands. These are used as a 100%-reliable
 * fallback when an external logo (Clearbit / brand site) fails to load,
 * so customers always see a recognizable brand mark on every product.
 *
 * Each entry maps a brand slug → a function that returns an inline SVG.
 * The SVG sits inside a 100x100 viewBox; it's expected to be wrapped in a
 * square container by BrandLogo, so it auto-scales.
 *
 * Marks are typographic (initials/monograms) using each brand's signature
 * colour palette — close enough to the real wordmark to feel premium
 * without infringing on actual logo artwork.
 */

const baseStyles = {
  fontFamily: 'Space Grotesk, Inter, system-ui, sans-serif',
  textAnchor: 'middle',
  dominantBaseline: 'central',
};

// Reusable mark factories
const TypoMark = ({ bg, fg, text, size = 44, letterSpacing = '-2', italic = false }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill={bg} />
    <text
      x="50" y="52"
      fontSize={size}
      fontWeight="800"
      fontStyle={italic ? 'italic' : 'normal'}
      letterSpacing={letterSpacing}
      fill={fg}
      style={baseStyles}
    >
      {text}
    </text>
  </svg>
);

const RayBanMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#000" />
    <rect x="14" y="38" width="30" height="22" rx="6" fill="none" stroke="#cf1f1f" strokeWidth="3.5" />
    <rect x="56" y="38" width="30" height="22" rx="6" fill="none" stroke="#cf1f1f" strokeWidth="3.5" />
    <line x1="44" y1="49" x2="56" y2="49" stroke="#cf1f1f" strokeWidth="3" />
    <text x="50" y="78" fontSize="14" fontWeight="900" letterSpacing="1.5" fill="#cf1f1f" style={baseStyles}>
      Ray-Ban
    </text>
  </svg>
);

const GucciMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#0a0a0a" />
    <rect x="0" y="34" width="100" height="10" fill="#1d6041" />
    <rect x="0" y="56" width="100" height="10" fill="#b91212" />
    <text x="50" y="50" fontSize="46" fontWeight="800" fill="#f6c453" style={baseStyles}>
      G
    </text>
  </svg>
);

const LouisVuittonMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#4a2c19" />
    <text x="50" y="52" fontSize="38" fontWeight="900" letterSpacing="-3" fill="#f0c987" style={baseStyles}>
      LV
    </text>
  </svg>
);

const CartierMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#7a0019" />
    <text x="50" y="50" fontSize="22" fontWeight="800" fill="#f7d676" style={{ ...baseStyles, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
      Cartier
    </text>
  </svg>
);

const ChanelMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#000" />
    <text x="50" y="52" fontSize="40" fontWeight="900" letterSpacing="-4" fill="#fff" style={baseStyles}>
      CC
    </text>
  </svg>
);

const RolexMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#0c5641" />
    {/* simplified crown */}
    <path d="M30 36 L36 28 L42 36 L50 26 L58 36 L64 28 L70 36 L66 46 L34 46 Z" fill="#f6c453" />
    <text x="50" y="68" fontSize="14" fontWeight="900" letterSpacing="1" fill="#f6c453" style={baseStyles}>
      ROLEX
    </text>
  </svg>
);

const OmegaMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#cc092f" />
    <text x="50" y="56" fontSize="48" fontWeight="900" fill="#fff" style={baseStyles}>
      Ω
    </text>
  </svg>
);

const AppleMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#1a1a1a" />
    <path
      d="M64 56c0-8 6-12 6-12-3-5-9-6-11-6-5-1-9 3-11 3s-6-3-10-3c-5 0-10 3-12 8-5 9-1 22 4 30 2 4 5 8 9 8 4 0 5-2 10-2 4 0 6 2 10 2 4 0 7-4 9-8 2-3 3-7 4-7-7-3-8-6-8-13zM58 28c2-3 4-7 3-11-3 0-7 2-9 5-2 2-3 6-3 9 3 0 7-1 9-3z"
      fill="#fff"
    />
  </svg>
);

const SamsungMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#1428a0" />
    <text x="50" y="58" fontSize="34" fontWeight="800" letterSpacing="-1" fill="#fff" style={baseStyles}>
      SAM
    </text>
  </svg>
);

const TagHeuerMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#0a0f2c" />
    <text x="50" y="42" fontSize="24" fontWeight="900" letterSpacing="-1" fill="#e1c456" style={baseStyles}>TAG</text>
    <line x1="20" y1="50" x2="80" y2="50" stroke="#e1c456" strokeWidth="2" />
    <text x="50" y="64" fontSize="16" fontWeight="700" letterSpacing="2" fill="#fff" style={baseStyles}>Heuer</text>
  </svg>
);

const PradaMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#000" />
    <text x="50" y="56" fontSize="22" fontWeight="900" letterSpacing="3" fill="#fff" style={baseStyles}>
      PRADA
    </text>
  </svg>
);

const VersaceMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#000" />
    <text x="50" y="50" fontSize="48" fontWeight="900" fill="#f6c453" style={baseStyles}>V</text>
    <text x="50" y="78" fontSize="11" fontWeight="700" letterSpacing="2" fill="#f6c453" style={baseStyles}>VERSACE</text>
  </svg>
);

const TomFordMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#0a0a0a" />
    <text x="50" y="44" fontSize="18" fontWeight="900" letterSpacing="3" fill="#c8a960" style={baseStyles}>TOM</text>
    <text x="50" y="68" fontSize="18" fontWeight="900" letterSpacing="2" fill="#c8a960" style={baseStyles}>FORD</text>
  </svg>
);

const BurberryMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    {/* Burberry tan check */}
    <rect width="100" height="100" rx="14" fill="#c19f6b" />
    <rect x="0" y="0" width="100" height="6"  fill="#0a0a0a" />
    <rect x="0" y="46" width="100" height="6" fill="#0a0a0a" />
    <rect x="0" y="92" width="100" height="6" fill="#0a0a0a" />
    <rect x="0" y="0" width="6"  height="100" fill="#0a0a0a" />
    <rect x="46" y="0" width="6" height="100" fill="#0a0a0a" />
    <rect x="92" y="0" width="6" height="100" fill="#0a0a0a" />
    <text x="50" y="52" fontSize="22" fontWeight="900" fill="#fff" style={baseStyles}>B</text>
  </svg>
);

const DiorMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#000" />
    <text x="50" y="56" fontSize="28" fontWeight="900" letterSpacing="2" fill="#fff" style={baseStyles}>
      DIOR
    </text>
  </svg>
);

const HugoBossMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#000" />
    <text x="50" y="56" fontSize="22" fontWeight="900" letterSpacing="3" fill="#fff" style={baseStyles}>
      BOSS
    </text>
  </svg>
);

const ArmaniMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#0a0a0a" />
    <circle cx="50" cy="50" r="22" fill="none" stroke="#fff" strokeWidth="3" />
    <path d="M62 41 L38 59" stroke="#fff" strokeWidth="3" />
  </svg>
);

const OakleyMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#0a0a0a" />
    <ellipse cx="35" cy="50" rx="14" ry="9" fill="none" stroke="#fff" strokeWidth="3" />
    <ellipse cx="65" cy="50" rx="14" ry="9" fill="none" stroke="#fff" strokeWidth="3" />
    <path d="M48 50 L52 50" stroke="#fff" strokeWidth="3" />
  </svg>
);

const PersolMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#7a0000" />
    <text x="50" y="56" fontSize="22" fontWeight="800" letterSpacing="2" fill="#fff" style={baseStyles}>
      PERSOL
    </text>
  </svg>
);

const CarreraMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#fff" />
    <text x="50" y="56" fontSize="18" fontWeight="900" letterSpacing="1.5" fill="#0a0a0a" style={baseStyles}>
      CARRERA
    </text>
  </svg>
);

const CasioMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#0a59a8" />
    <text x="50" y="58" fontSize="26" fontWeight="900" letterSpacing="-1" fill="#fff" style={baseStyles}>
      CASIO
    </text>
  </svg>
);

const GShockMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="14" fill="#0a0a0a" />
    <text x="50" y="46" fontSize="40" fontWeight="900" fill="#f6c453" style={baseStyles}>G</text>
    <text x="50" y="76" fontSize="14" fontWeight="900" letterSpacing="2" fill="#fff" style={baseStyles}>SHOCK</text>
  </svg>
);

const SeikoMark   = () => <TypoMark bg="#0a0a0a" fg="#fff"  text="SEIKO" size={20} letterSpacing="3" />;
const CitizenMark = () => <TypoMark bg="#cc092f" fg="#fff"  text="CITIZEN" size={16} letterSpacing="2" />;
const FossilMark  = () => <TypoMark bg="#0a0a0a" fg="#c8a960" text="FOSSIL" size={20} letterSpacing="2" />;
const TitanMark   = () => <TypoMark bg="#15355c" fg="#fff" text="TITAN" size={22} letterSpacing="2" />;
const FastrackMark= () => <TypoMark bg="#ffeb3b" fg="#0a0a0a" text="F" size={56} />;
const TissotMark  = () => <TypoMark bg="#0a3a85" fg="#fff" text="T" size={56} />;
const DanielWellingtonMark = () => <TypoMark bg="#0a0a0a" fg="#fff" text="DW" size={42} />;
const VogueMark   = () => <TypoMark bg="#000" fg="#fff" text="VOGUE" size={18} letterSpacing="3" />;
const MauiJimMark = () => <TypoMark bg="#0a4d8b" fg="#fff" text="MJ" size={42} />;

const MARKS = {
  'ray-ban':           RayBanMark,
  'rayban':            RayBanMark,
  'gucci':             GucciMark,
  'louis-vuitton':     LouisVuittonMark,
  'lv':                LouisVuittonMark,
  'cartier':           CartierMark,
  'chanel':            ChanelMark,
  'rolex':             RolexMark,
  'omega':             OmegaMark,
  'apple':             AppleMark,
  'samsung':           SamsungMark,
  'tag-heuer':         TagHeuerMark,
  'tagheuer':          TagHeuerMark,
  'prada':             PradaMark,
  'versace':           VersaceMark,
  'tom-ford':          TomFordMark,
  'burberry':          BurberryMark,
  'dior':              DiorMark,
  'hugo-boss':         HugoBossMark,
  'armani':            ArmaniMark,
  'oakley':            OakleyMark,
  'persol':            PersolMark,
  'carrera':           CarreraMark,
  'casio':             CasioMark,
  'g-shock':           GShockMark,
  'gshock':            GShockMark,
  'seiko':             SeikoMark,
  'citizen':           CitizenMark,
  'fossil':            FossilMark,
  'titan':             TitanMark,
  'fastrack':          FastrackMark,
  'tissot':            TissotMark,
  'daniel-wellington': DanielWellingtonMark,
  'vogue-eyewear':     VogueMark,
  'maui-jim':          MauiJimMark,
};

export const hasBrandMark = (slug) => Boolean(MARKS[String(slug || '').toLowerCase()]);
export const renderBrandMark = (slug) => {
  const Mark = MARKS[String(slug || '').toLowerCase()];
  return Mark ? <Mark /> : null;
};
