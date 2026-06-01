import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Lock, Phone, Mail, MapPin, Instagram, Facebook, ArrowRight } from 'lucide-react';

const VALUES = [
  { Icon: ShieldCheck, n: '01', title: 'Authenticated', desc: 'Every product is sourced from genuine, verified brands. No fakes — ever.' },
  { Icon: RotateCcw,   n: '02', title: 'Easy Returns',  desc: 'Changed your mind? Return any order within 7 days, no fuss.' },
  { Icon: Lock,        n: '03', title: 'Secure',        desc: 'Payments protected with industry-standard encryption.' },
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
      <section className="bg-cream-100 bg-paper-grain border-b border-ink-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center animate-fade-up">
          <p className="eyebrow mb-5">Our Story</p>
          <h1 className="font-display text-4xl sm:text-6xl text-ink-900 leading-[1.05]">
            Considered pieces,<br /><span className="italic text-accent-600">honestly priced.</span>
          </h1>
          <p className="mt-6 text-ink-700/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            VexDeals is a small, opinionated edit of authentic watches &amp; eyewear.
            We&apos;d rather offer a handful of things worth keeping than a catalogue of things that aren&apos;t.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 border-l border-t border-ink-900/10">
          {VALUES.map(({ Icon, n, title, desc }) => (
            <div key={title} className="border-r border-b border-ink-900/10 p-8">
              <div className="flex items-center justify-between">
                <Icon size={24} strokeWidth={1.4} className="text-accent-600" />
                <span className="text-xs text-ink-700/40 tabular-nums">{n}</span>
              </div>
              <h3 className="font-display text-2xl text-ink-900 mt-5">{title}</h3>
              <p className="text-sm text-ink-700/70 leading-relaxed mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-ink-900 bg-paper-grain">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow mb-3 text-accent-400">Say hello</p>
            <h2 className="font-display text-3xl sm:text-4xl text-cream-50">Get in touch</h2>
            <p className="text-cream-100/60 text-sm mt-3 mb-7">Questions about an order or a piece? We&apos;re here.</p>
            <ul className="space-y-4">
              {CONTACT.map(({ Icon, label, href }) => (
                <li key={label} className="flex items-center gap-3">
                  <Icon size={18} strokeWidth={1.5} className="text-accent-400 shrink-0" />
                  {href ? (
                    <a href={href} className="link-underline text-cream-50 text-sm">{label}</a>
                  ) : (
                    <span className="text-cream-50 text-sm">{label}</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-7">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="w-10 h-10 border border-cream-100/20 flex items-center justify-center text-cream-100/70 hover:bg-accent-500 hover:border-accent-500 hover:text-cream-50 transition-colors">
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          <div className="border border-cream-100/15 p-10 text-center">
            <h3 className="font-display text-2xl text-cream-50 mb-3">Find your next piece</h3>
            <p className="text-cream-100/60 text-sm mb-7">Browse the edit of watches &amp; eyewear.</p>
            <Link to="/products" className="btn-cognac text-xs uppercase tracking-widest2">
              Shop the Edit <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
