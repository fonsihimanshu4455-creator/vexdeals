import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Check, ZoomIn, Loader2 } from 'lucide-react';

const VIEW = 320; // on-screen square crop viewport (px)
const OUT = 1000; // exported square size (px)

/**
 * Simple square image cropper — drag to position, slider to zoom.
 * Calls onCropped(blob) with a 1:1 JPEG of the selected region.
 */
export default function ImageCropper({ src, uploading, onCancel, onCropped }) {
  const [nat, setNat] = useState(null); // natural { w, h }
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);

  const baseScale = nat ? Math.max(VIEW / nat.w, VIEW / nat.h) : 1;
  const displayScale = baseScale * zoom;
  const dispW = nat ? nat.w * displayScale : VIEW;
  const dispH = nat ? nat.h * displayScale : VIEW;

  const clamp = useCallback((o) => {
    const maxX = Math.max(0, (dispW - VIEW) / 2);
    const maxY = Math.max(0, (dispH - VIEW) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, o.x)), y: Math.max(-maxY, Math.min(maxY, o.y)) };
  }, [dispW, dispH]);

  useEffect(() => { setOffset((o) => clamp(o)); }, [zoom, nat, clamp]);

  const start = (e) => {
    const p = e.touches ? e.touches[0] : e;
    drag.current = { sx: p.clientX, sy: p.clientY, ox: offset.x, oy: offset.y };
  };
  const move = (e) => {
    if (!drag.current) return;
    const p = e.touches ? e.touches[0] : e;
    setOffset(clamp({ x: drag.current.ox + (p.clientX - drag.current.sx), y: drag.current.oy + (p.clientY - drag.current.sy) }));
  };
  const end = () => { drag.current = null; };

  const doCrop = () => {
    if (!nat) return;
    const cropSize = VIEW / displayScale;
    const sx = nat.w / 2 - offset.x / displayScale - cropSize / 2;
    const sy = nat.h / 2 - offset.y / displayScale - cropSize / 2;
    const canvas = document.createElement('canvas');
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUT, OUT);
    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, OUT, OUT);
      canvas.toBlob((blob) => { if (blob) onCropped(blob); }, 'image/jpeg', 0.9);
    };
    img.src = src;
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Crop image</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <p className="text-xs text-gray-500 mb-3">Drag to position · slider to zoom. Square area will be saved.</p>

        <div
          className="relative mx-auto overflow-hidden rounded-xl bg-gray-100 touch-none select-none cursor-move"
          style={{ width: VIEW, height: VIEW }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        >
          {nat && (
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                width: dispW,
                height: dispH,
                left: VIEW / 2 - dispW / 2 + offset.x,
                top: VIEW / 2 - dispH / 2 + offset.y,
                maxWidth: 'none',
              }}
            />
          )}
          {/* rule-of-thirds grid */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <ZoomIn size={16} className="text-gray-500 shrink-0" />
          <input type="range" min="1" max="3" step="0.01" value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-primary-600" />
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} disabled={uploading}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={doCrop} disabled={uploading || !nat}
            className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : <><Check size={16} /> Crop & Upload</>}
          </button>
        </div>
      </div>
    </div>
  );
}
