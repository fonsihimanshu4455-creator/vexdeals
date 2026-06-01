import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Lock, Phone, Mail, MapPin, Instagram, Facebook, ArrowRight } from 'lucide-react';

const VALUES = [
  { Icon: ShieldCheck, title: 'Authenticated', desc: 'Every product is sourced from genuine, verified brands. No fakes — ever.' },
  { Icon: RotateCcw,   title: 'Easy Returns',  desc: 'Changed your mind? Return any order within 7 days, no fuss.' },
  { Icon: Lock,        title: 'Secure',        desc: 'Payments protected with industry-standard encryption.' },
];

const CONTACT = [
  { Icon: Phone,  label: '+91 90349 48078',           href: 'tel:+919034948078' },
  { Icon: Mail,   label: 'officialvexdeals@gmail.com', href: 'mailto:officialvexdeals@gmail.com' },
  { Icon: MapPin, label: 'India',                      href: null },
];

const SOCIAL = [
  { Icon: Instagram, href: 'https://www.instagram.com/vexdeals/', label: 'Instagram' },
  { Icon: Facebook,  href: 'https://www.facebook.com/profile.php?id=61576514798665', label: 'Facebook' },
];

export default function About() {
  return (
    <div className="bg-cream-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream-100 bg-mesh">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 bg-white shadow-soft text-primary-700 text-xs font-semibold px-4 py-2 rounded-full">Our Story</span>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl font-bold text-ink-900 leading-[1.05]">
            Authentic pieces, <span className="text-gradient">honest prices.</span>
          </h1>
          <p className="mt-6 text-ink-700/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            VexDeals is a small, opinionated edit of authentic watches &amp; eyewear.
            We&apos;d rather offer a handful of things worth keeping than a catalogue of things that aren&apos;t.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {VALUES.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-3xl border border-ink-900/5 shadow-soft p-7">
              <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center">
                <Icon size={22} className="text-primary-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-900 mt-5">{title}</h3>
              <p className="text-sm text-ink-700/60 leading-relaxed mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-gradient bg-ink-mesh p-8 sm:p-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest2 text-white/70">Say hello</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2">Get in touch</h2>
            <p className="text-white/70 text-sm mt-3 mb-7">Questions about an order or a piece? We&apos;re here.</p>
            <ul className="space-y-4">
              {CONTACT.map(({ Icon, label, href }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-white" />
                  </span>
                  {href ? (
                    <a href={href} className="link-underline text-white text-sm font-medium">{label}</a>
                  ) : (
                    <span className="text-white text-sm font-medium">{label}</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-7">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center text-white hover:bg-white hover:text-primary-600 transition-colors">
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 text-center">
            <h3 className="font-display text-2xl font-bold text-ink-900 mb-3">Find your next piece</h3>
            <p className="text-ink-700/60 text-sm mb-7">Browse the full edit of watches &amp; eyewear.</p>
            <Link to="/products" className="btn-grad text-sm">
              Shop Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
