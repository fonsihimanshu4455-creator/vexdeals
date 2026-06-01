import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Lock, Phone, Mail, MapPin, Instagram, Facebook, ArrowRight } from 'lucide-react';
import { VexLogoInline } from '../components/Logo';

const FEATURES = [
  { Icon: ShieldCheck, title: '100% Authentic Products', desc: 'Every product is sourced from genuine, verified brands — no fakes, ever.' },
  { Icon: RotateCcw,   title: '7-Day Easy Returns',      desc: 'Changed your mind? Return any order within 7 days, hassle-free.' },
  { Icon: Lock,        title: 'Secure Payments',          desc: 'Your payments are protected with industry-standard encryption.' },
];

const CONTACT = [
  { Icon: Phone,  label: '+91 90349 48078',          href: 'tel:+919034948078' },
  { Icon: Mail,   label: 'officialvexdeals@gmail.com', href: 'mailto:officialvexdeals@gmail.com' },
  { Icon: MapPin, label: 'India',                      href: null },
];

const SOCIAL = [
  { Icon: Instagram, href: 'https://www.instagram.com/vexdeals/', label: 'Instagram' },
  { Icon: Facebook,  href: 'https://www.facebook.com/profile.php?id=61576514798665', label: 'Facebook' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-navy-900 via-primary-900 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400 opacity-10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <div className="inline-block mb-5">
            <VexLogoInline size="lg" variant="dark" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">About VexDeals</h1>
          <p className="text-primary-200 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Premium watches &amp; eyewear — hand-picked deals you won't find anywhere else.
            Authentic brands, unbeatable prices.
          </p>
        </div>
      </section>

      {/* ── Why shop with us ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Why Shop With Us</h2>
          <div className="mt-2 h-1 w-12 bg-accent-500 rounded-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h2>
            <p className="text-sm text-gray-500 mb-6">
              Questions about an order or a product? We're always here to help.
            </p>
            <ul className="space-y-4">
              {CONTACT.map(({ Icon, label, href }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary-600" />
                  </span>
                  {href ? (
                    <a href={href} className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">{label}</a>
                  ) : (
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex gap-2.5 mt-6">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-primary-600 hover:text-white transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to find your next deal?</h3>
            <p className="text-sm text-gray-500 mb-5">Browse our hand-picked collection of watches &amp; eyewear.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Shop All Deals <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
