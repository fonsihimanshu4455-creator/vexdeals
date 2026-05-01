import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { VexLogoInline } from './Logo';

const LINKS = {
  shop: [
    { label: 'All Deals',    to: '/products' },
    { label: 'Watches',      to: '/products?category=Watches' },
    { label: 'Sunglasses',   to: '/products?category=Sunglasses' },
    { label: 'Eyeglasses',   to: '/products?category=Eyeglasses' },
  ],
  account: [
    { label: 'My Orders',       to: '/account/orders' },
    { label: 'Transactions',    to: '/account/transactions' },
    { label: 'Saved Addresses', to: '/account/addresses' },
    { label: 'Sign In',         to: '/login' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-gray-400">
      {/* Top accent gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
      <div className="h-1 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 animate-gradient" />

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-blob-slow" />
        <div className="absolute inset-0 bg-grid-dark opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1 space-y-5">
            <VexLogoInline size="md" variant="dark" />
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Premium watches & eyewear — hand-picked deals you won't find anywhere else. Authentic brands, unbeatable prices.
            </p>
            {/* Social */}
            <div className="flex gap-2.5 pt-1">
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/vexdeals/', label: 'Instagram' },
                { Icon: Facebook,  href: 'https://www.facebook.com/profile.php?id=61576514798665', label: 'Facebook' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="group relative w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-accent-400/50 transition-all"
                >
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/0 to-accent-400/0 group-hover:from-primary-500/30 group-hover:to-accent-400/30 transition-all" />
                  <Icon size={16} className="relative text-gray-300 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-accent-400" /> Shop
            </h4>
            <ul className="space-y-2.5">
              {LINKS.shop.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="group inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-accent-300 transition-colors"
                  >
                    <ArrowRight size={12} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-accent-400" /> Account
            </h4>
            <ul className="space-y-2.5">
              {LINKS.account.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="group inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-accent-300 transition-colors"
                  >
                    <ArrowRight size={12} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-px bg-accent-400" /> Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <Phone size={15} className="text-accent-400 shrink-0 mt-0.5" />
                <span>+91 90349 48078</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm break-all">
                <Mail size={15} className="text-accent-400 shrink-0 mt-0.5" />
                <span>officialvexdeals@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin size={15} className="text-accent-400 shrink-0 mt-0.5" />
                <span>India</span>
              </li>
            </ul>

            {/* Trust badges */}
            <div className="mt-6 flex flex-col gap-2">
              {['100% Authentic Products', '7-Day Easy Returns', 'Secure Payments'].map(badge => (
                <div key={badge} className="flex items-center gap-2 text-xs text-gray-500">
                  <Sparkles size={11} className="text-accent-500/80" />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Big brand wordmark */}
        <div className="mt-14 pt-8 border-t border-white/5 select-none overflow-hidden">
          <p className="text-center font-display font-bold text-[18vw] sm:text-[12rem] leading-none bg-gradient-to-b from-white/5 to-transparent bg-clip-text text-transparent tracking-tighter">
            VEXDEALS
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} VexDeals. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-accent-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
