import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { VexLogoInline } from './Logo';

const LINKS = [
  { label: 'All Deals',  to: '/products' },
  { label: 'Watches',    to: '/products?category=Watches' },
  { label: 'Sunglasses', to: '/products?category=Sunglasses' },
  { label: 'Eyeglasses', to: '/products?category=Eyeglasses' },
  { label: 'About Us',   to: '/about' },
];

const SOCIAL = [
  { Icon: Instagram, href: 'https://www.instagram.com/vexdeals/', label: 'Instagram' },
  { Icon: Facebook,  href: 'https://www.facebook.com/profile.php?id=61576514798665', label: 'Facebook' },
];

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-gray-400">
      {/* Accent top line */}
      <div className="h-1 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link to="/">
            <VexLogoInline size="md" variant="dark" />
          </Link>

          {/* Quick links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LINKS.map(({ label, to }) => (
              <Link key={label} to={to} className="text-sm text-gray-400 hover:text-accent-400 transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Social */}
          <div className="flex gap-2.5">
            {SOCIAL.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:border-primary-600 hover:text-white transition-all duration-200"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} VexDeals. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
