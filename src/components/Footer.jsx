import { Link } from 'react-router-dom';
import { Zap, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', path: '/' },
                { label: 'All Products', path: '/products' },
                { label: 'Electronics', path: '/products?category=Electronics' },
                { label: 'Fashion', path: '/products?category=Fashion' },
                { label: 'Home & Living', path: '/products?category=Home+%26+Living' },
                { label: 'My Cart', path: '/cart' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.path} className="hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              {['Track Your Order', 'Return & Refund Policy', 'Shipping Policy', 'FAQs', 'Size Guide', 'Gift Cards'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-primary-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-primary-400 shrink-0 mt-0.5" />
                <span>VexDeals HQ, 123 Tech Park, Bangalore, Karnataka 560001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary-400 shrink-0" />
                <span>+91 1800-VEX-DEAL</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary-400 shrink-0" />
                <span>support@vexdeals.com</span>
              </li>
            </ul>
            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-2">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-gray-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button className="bg-primary-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-primary-700 transition-colors font-medium">
                  Go
                </button>
              </div>
            </div>
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
