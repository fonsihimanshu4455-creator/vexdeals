import { useEffect, useRef, useState } from 'react';

/**
 * Counts up from 0 → `to` once the element scrolls into view.
 *
 * Props:
 *   - to:        target number
 *   - duration:  ms (default 1500)
 *   - prefix / suffix
 *   - decimals
 *   - format:    one of 'plain' | 'compact' (e.g. 12k)
 */
export default function CountUp({
  to = 0,
  duration = 1500,
  prefix = '',
  suffix = '',
  decimals = 0,
  format = 'plain',
  className = '',
}) {
  const [val, setVal]   = useState(0);
  const [seen, setSeen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !seen) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [seen]);

  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);

  let display;
  if (format === 'compact') {
    display = val >= 1000
      ? `${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k`
      : Math.round(val).toLocaleString('en-IN');
  } else {
    display = decimals > 0
      ? val.toFixed(decimals)
      : Math.round(val).toLocaleString('en-IN');
  }

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
