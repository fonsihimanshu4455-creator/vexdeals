import { useEffect, useRef } from 'react';

// Lightweight flow-field particles on a plain <canvas> — organic drifting lines,
// no Three.js. ~60fps on phones; pauses when offscreen + respects reduced-motion.
export default function FlowField({ className = '', color = '15,159,183' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !canvas.parentElement) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const N = window.innerWidth < 640 ? 70 : 140;
    let w = 0, h = 0, t = 0, raf = 0, running = true;
    const parts = [];

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    for (let i = 0; i < N; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      parts.push({ x, y, px: x, py: y });
    }

    const angle = (x, y) => {
      const s = 0.0024;
      return (Math.sin(x * s + t) + Math.cos(y * s - t * 0.8) + Math.sin((x + y) * s * 0.6 + t * 0.5)) * 1.2;
    };

    const step = () => {
      if (!running) return;
      t += 0.0016;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = `rgba(${color},0.32)`;
      ctx.beginPath();
      for (const p of parts) {
        p.px = p.x; p.py = p.y;
        const a = angle(p.x, p.y);
        p.x += Math.cos(a) * 0.7;
        p.y += Math.sin(a) * 0.7;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        if (Math.abs(p.x - p.px) < 6 && Math.abs(p.y - p.py) < 6) {
          ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
      raf = requestAnimationFrame(step);
    };
    if (!reduce) raf = requestAnimationFrame(step);

    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting && !reduce;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(step);
    }, { threshold: 0 });
    io.observe(canvas);

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', onResize); };
  }, [color]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
