import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartToast() {
  const { lastAdded, lastAddedAt } = useCart();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!lastAddedAt) return undefined;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(t);
  }, [lastAddedAt]);

  if (!lastAdded) return null;

  return (
    <div
      className={`fixed z-[70] left-1/2 -translate-x-1/2 bottom-6 sm:bottom-auto sm:top-24 sm:right-6 sm:left-auto sm:translate-x-0 transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-3 bg-white shadow-card rounded-2xl border border-ink-900/5 p-2.5 pr-3 w-[88vw] max-w-sm">
        <img src={lastAdded.image} alt="" className="w-12 h-12 rounded-xl object-contain bg-cream-100 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="flex items-center gap-1 text-[11px] font-bold text-emerald-600"><Check size={13} /> Added to cart</p>
          <p className="text-sm font-medium text-ink-900 truncate">{lastAdded.name}</p>
        </div>
        <Link to="/cart" className="shrink-0 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 px-3.5 py-2 rounded-xl transition-colors">
          View cart
        </Link>
      </div>
    </div>
  );
}
