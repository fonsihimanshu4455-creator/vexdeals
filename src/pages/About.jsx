import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Lock, Phone, Mail, MapPin, Instagram, Facebook, ArrowRight } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { DEFAULT_ABOUT, mergeAbout } from '../lib/siteContent';

const VALUE_ICONS = [ShieldCheck, RotateCcw, Lock];

export default function About() {
  const [content, setContent] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(doc(db, 'site', 'about'), (snap) => {
      if (snap.exists()) setContent(mergeAbout(snap.data()));
    }, () => {});
  }, []);

  const contactRows = [
    content.phone && { Icon: Phone, label: content.phone, href: `tel:${content.phone.replace(/\s/g, '')}` },
    content.email && { Icon: Mail, label: content.email, href: `mailto:${content.email}` },
    content.location && { Icon: MapPin, label: content.location, href: null },
  ].filter(Boolean);

  return (
    <div className="bg-cream-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream-100 bg-mesh">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center animate-fade-up">
          {content.badge && (
            <span className="inline-flex items-center gap-2 bg-white shadow-soft text-primary-700 text-xs font-semibold px-4 py-2 rounded-full">{content.badge}</span>
          )}
          <h1 className="mt-6 font-display text-5xl sm:text-6xl font-bold text-ink-900 leading-[1.05]">
            {content.heading} {content.headingHighlight && <span className="text-gradient">{content.headingHighlight}</span>}
          </h1>
          {content.intro && (
            <p className="mt-6 text-ink-700/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed whitespace-pre-line">{content.intro}</p>
          )}
        </div>
      </section>

      {/* Values */}
      {content.values?.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {content.values.map((v, i) => {
              const Icon = VALUE_ICONS[i] || ShieldCheck;
              return (
                <div key={i} className="bg-white rounded-3xl border border-ink-900/5 shadow-soft p-7">
                  <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center">
                    <Icon size={22} className="text-primary-600" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink-900 mt-5">{v.title}</h3>
                  <p className="text-sm text-ink-700/60 leading-relaxed mt-2">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink-900 bg-ink-mesh p-8 sm:p-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest2 text-white/70">Say hello</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2">Get in touch</h2>
            <p className="text-white/70 text-sm mt-3 mb-7">Questions about an order or a piece? We&apos;re here.</p>
            <ul className="space-y-4">
              {contactRows.map(({ Icon, label, href }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-white" />
                  </span>
                  {href ? <a href={href} className="link-underline text-white text-sm font-medium">{label}</a>
                        : <span className="text-white text-sm font-medium">{label}</span>}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-7">
              {content.instagram && (
                <a href={content.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                  className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center text-white hover:bg-white hover:text-primary-600 transition-colors"><Instagram size={17} /></a>
              )}
              {content.facebook && (
                <a href={content.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                  className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center text-white hover:bg-white hover:text-primary-600 transition-colors"><Facebook size={17} /></a>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 text-center">
            <h3 className="font-display text-2xl font-bold text-ink-900 mb-3">Find your next piece</h3>
            <p className="text-ink-700/60 text-sm mb-7">Browse the full edit of watches &amp; eyewear.</p>
            <Link to="/products" className="btn-grad text-sm">Shop Now <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
