import { useEffect, useRef } from 'react';

/**
 * Slim gradient progress bar pinned to the top of the viewport.
 * Writes width directly to the bar via rAF — never causes a React re-render.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const h   = document.documentElement;
      const sc  = h.scrollTop || document.body.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (sc / max) * 100 : 0;
      if (barRef.current) barRef.current.style.width = `${pct}%`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-primary-500 via-accent-400 to-fuchsia-500 will-change-[width]"
        style={{ width: 0 }}
      />
    </div>
  );
}
