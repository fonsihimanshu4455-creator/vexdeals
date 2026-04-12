import { Link } from 'react-router-dom';
import { Zap, Facebook, Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 rounded-lg p-1.5">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-extrabold text-white">Vex<span className="text-accent-500">Deals</span></span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your one-stop destination for the best deals on electronics, fashion, home essentials and more.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/vexdeals/', label: 'Instagram' },
                { Icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61576514798665', label: 'Facebook' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary-400 shrink-0" />
                <span>+91 90349 48078</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary-400 shrink-0" />
                <span>officialvexdeals@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 VexDeals. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
