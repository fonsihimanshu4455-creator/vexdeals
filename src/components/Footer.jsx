import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { VexLogoInline } from './Logo';

// Pill quick-links (Culture-Circle style)
const QUICK = [
  { label: "What's New", to: '/products' },
  { label: 'Sale', to: '/products' },
  { label: 'Watches', to: '/products?category=Watches' },
  { label: 'Sunglasses', to: '/products?category=Sunglasses' },
  { label: 'Eyeglasses', to: '/products?category=Eyeglasses' },
  { label: 'Brands', to: '/products' },
  { label: 'About', to: '/about' },
];

const COLS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Deals', to: '/products' },
      { label: 'Watches', to: '/products?category=Watches' },
      { label: 'Sunglasses', to: '/products?category=Sunglasses' },
      { label: 'Eyeglasses', to: '/products?category=Eyeglasses' },
      { label: 'Best Sellers', to: '/products' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', to: '/login' },
      { label: 'My Orders', to: '/account/orders' },
      { label: 'Transactions', to: '/account/transactions' },
      { label: 'Saved Addresses', to: '/account/addresses' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
  {
    title: 'Know More',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Reviews', to: '/about' },
      { label: 'Privacy Policy', to: '/about' },
      { label: 'Terms of Service', to: '/about' },
      { label: 'Shipping & Returns', to: '/about' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-white/70">
      {/* Top — logo + pill quick links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10">
        <VexLogoInline size="lg" variant="dark" />
        <div className="flex flex-wrap gap-2.5">
          {QUICK.map(({ label, to }) => (
            <Link key={label} to={to}
              className="text-sm font-semibold text-white/85 border border-white/15 rounded-full px-4 py-2 hover:bg-white hover:text-ink-900 transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {COLS.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] uppercase tracking-widest2 text-white/40 mb-4">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-white/65 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div>
          <p className="text-[11px] uppercase tracking-widest2 text-white/40 mb-4">Contact Us</p>
          <p className="text-sm text-white/65 leading-relaxed">Authentic watches &amp; eyewear, honestly priced. Pan-India delivery.</p>
          <a href="https://wa.me/919034948078" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 mt-4 bg-emerald-500 text-white text-sm font-bold px-4 py-2.5 rounded-full hover:bg-emerald-600 transition-colors">
            <MessageCircle size={15} /> WhatsApp Support
          </a>
          <div className="flex gap-3 mt-5">
            {[
              { Icon: Instagram, href: 'https://www.instagram.com/vexdeals/', label: 'Instagram' },
              { Icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61576514798665', label: 'Facebook' },
            ].map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/80 hover:bg-white hover:text-ink-900 transition-all">
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} VexDeals. All rights reserved.</p>
          <p>Made in India 🇮🇳 · Secure payments by Razorpay</p>
        </div>
      </div>
    </footer>
  );
}
