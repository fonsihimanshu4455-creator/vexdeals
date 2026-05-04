import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll to top of the page on every route change.
 * - Honors anchor links (#hash) — scrolls only when there is no hash.
 * - Falls back to instant scroll when reduced-motion is enabled.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return; // let the browser handle anchor jumps
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [pathname, hash]);

  return null;
}
