import { Link } from 'react-router-dom';
import { Instagram, Facebook, ArrowUpRight } from 'lucide-react';
import { VexLogoInline } from './Logo';

const COLS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Deals',  to: '/products' },
      { label: 'Watches',    to: '/products?category=Watches' },
      { label: 'Sunglasses', to: '/products?category=Sunglasses' },
      { label: 'Eyeglasses', to: '/products?category=Eyeglasses' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My Orders',       to: '/account/orders' },
      { label: 'Transactions',    to: '/account/transactions' },
      { label: 'Saved Addresses', to: '/account/addresses' },
      { label: 'Sign In',         to: '/login' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact',  to: '/about' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-900 bg-ink-mesh text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <VexLogoInline size="lg" variant="dark" />
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight max-w-sm mt-6">
              Authentic watches &amp; eyewear, <span className="text-gradient">honestly priced.</span>
            </h3>
            <Link to="/products" className="inline-flex items-center gap-1.5 mt-6 bg-white text-ink-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-100 transition-colors">
              Shop the collection <ArrowUpRight size={15} />
            </Link>
            <div className="flex gap-3 mt-8">
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/vexdeals/', label: 'Instagram' },
                { Icon: Facebook,  href: 'https://www.facebook.com/profile.php?id=61576514798665', label: 'Facebook' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center text-white/80 hover:bg-brand-gradient hover:text-white transition-all">
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {COLS.map(col => (
              <div key={col.title}>
                <p className="text-[11px] uppercase tracking-widest2 text-white/40 mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to} className="link-underline text-sm text-white/70 hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} VexDeals. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
