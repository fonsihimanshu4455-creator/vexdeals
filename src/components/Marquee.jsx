/**
 * Auto-scrolling horizontal marquee. Renders children twice for a seamless loop.
 *
 * Props:
 *   - speed:     'slow' | 'normal'  — animation speed
 *   - direction: 'left' | 'right'   — scroll direction
 *   - className: extra container classes
 */
export default function Marquee({ children, speed = 'normal', direction = 'left', className = '' }) {
  const animClass =
    direction === 'right'
      ? (speed === 'slow' ? 'animate-marquee-right' : 'animate-marquee-right')
      : (speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee');

  return (
    <div className={`relative overflow-hidden mask-fade-x ${className}`}>
      <div className={`flex w-max gap-12 ${animClass} will-change-transform`}>
        <div className="flex items-center gap-12 shrink-0">{children}</div>
        <div className="flex items-center gap-12 shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
