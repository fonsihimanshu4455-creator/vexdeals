import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
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
    <footer className="bg-navy-900 text-gray-400">
      {/* Accent top line */}
      <div className="h-1 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1 space-y-4">
            <VexLogoInline size="md" variant="dark" />
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Premium watches &amp; eyewear — hand-picked deals you won't find anywhere else. Authentic brands, unbeatable prices.
            </p>
            {/* Social links */}
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
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:border-primary-600 hover:text-white transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5">
              {LINKS.shop.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-accent-400 flex items-center gap-1 transition-colors group"
                  >
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-0.5 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Account</h4>
            <ul className="space-y-2.5">
              {LINKS.account.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-accent-400 flex items-center gap-1 transition-colors group"
                  >
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-0.5 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <Phone size={15} className="text-primary-400 shrink-0 mt-0.5" />
                <span>+91 90349 48078</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Mail size={15} className="text-primary-400 shrink-0 mt-0.5" />
                <span>officialvexdeals@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin size={15} className="text-primary-400 shrink-0 mt-0.5" />
                <span>India</span>
              </li>
            </ul>

            {/* Trust badges */}
            <div className="mt-6 flex flex-col gap-2">
              {['100% Authentic Products', '7-Day Easy Returns', 'Secure Payments'].map(badge => (
                <div key={badge} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                  {badge}
                </div>
              ))}
            </div>
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
