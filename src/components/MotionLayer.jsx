import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Lets inner scroll areas (drawers, dropdowns, horizontal rails) scroll natively.
function insideScrollable(node) {
  let el = node;
  while (el && el !== document.body && el.nodeType === 1) {
    if (el.hasAttribute?.('data-lenis-prevent')) return true;
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1) return true;
    el = el.parentElement;
  }
  return false;
}

/**
 * Site-wide motion for the storefront:
 *  - buttery inertia scrolling on desktop (Lenis; touch devices keep native scroll)
 *  - thin scroll-progress bar at the top
 *  - any element with .reveal / .reveal-stagger animates in when it scrolls into view
 */
export default function MotionLayer() {
  const { pathname } = useLocation();
  const barRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    let lenis = null;
    let raf = 0;
    if (!reducedMotion()) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        prevent: insideScrollable,
      });
      lenisRef.current = lenis;
      document.documentElement.classList.add('lenis');
      const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      lenis?.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove('lenis');
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.reveal, .reveal-stagger, .reveal-self').forEach((el) => el.classList.add('in-view'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    const seen = new WeakSet();
    const scan = () => document
      .querySelectorAll('.reveal:not(.in-view), .reveal-stagger:not(.in-view), .reveal-self:not(.in-view)')
      .forEach((el) => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
    scan();
    let pending = 0;
    const mo = new MutationObserver(() => {
      if (pending) return;
      pending = requestAnimationFrame(() => { pending = 0; scan(); });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); cancelAnimationFrame(pending); };
  }, [pathname]);

  return (
    <div aria-hidden className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none">
      <div ref={barRef} className="h-full origin-left bg-brand-gradient" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}
