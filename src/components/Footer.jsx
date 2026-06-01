import { Link } from 'react-router-dom';
import { Instagram, Facebook, ArrowUpRight } from 'lucide-react';

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
    <footer className="bg-ink-900 text-cream-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand statement */}
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4 text-accent-400">VexDeals</p>
            <h3 className="font-display text-3xl sm:text-4xl text-cream-50 leading-tight max-w-sm">
              Authentic watches &amp; eyewear, honestly priced.
            </h3>
            <Link to="/products" className="link-underline inline-flex items-center gap-1.5 text-cream-50 mt-6 text-sm font-medium">
              Shop the collection <ArrowUpRight size={15} />
            </Link>
            <div className="flex gap-3 mt-8">
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/vexdeals/', label: 'Instagram' },
                { Icon: Facebook,  href: 'https://www.facebook.com/profile.php?id=61576514798665', label: 'Facebook' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="w-10 h-10 border border-cream-100/20 flex items-center justify-center text-cream-100/70 hover:bg-accent-500 hover:border-accent-500 hover:text-cream-50 transition-colors">
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {COLS.map(col => (
              <div key={col.title}>
                <p className="text-[11px] uppercase tracking-widest2 text-cream-100/40 mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to} className="link-underline text-sm text-cream-100/70 hover:text-cream-50 transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-cream-100/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] uppercase tracking-widest2 text-cream-100/40">
          <p>© {new Date().getFullYear()} VexDeals</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-cream-50 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cream-50 transition-colors">Terms</a>
            <a href="#" className="hover:text-cream-50 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
