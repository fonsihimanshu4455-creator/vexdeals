// Default content for the customer-facing About / description page.
// Admin can override these via Admin → About Page (stored in Firestore site/about).
export const DEFAULT_ABOUT = {
  badge: 'Our Story',
  heading: 'Authentic pieces,',
  headingHighlight: 'honest prices.',
  intro: "VexDeals is a curated store of authentic watches & eyewear. We'd rather offer a handful of things worth keeping than a catalogue of things that aren't.",
  values: [
    { title: 'Authenticated', desc: 'Every product is sourced from genuine, verified brands. No fakes — ever.' },
    { title: 'Easy Returns',  desc: 'Changed your mind? Return any order within 7 days, no fuss.' },
    { title: 'Secure',        desc: 'Payments protected with industry-standard encryption.' },
  ],
  phone: '+91 90349 48078',
  email: 'officialvexdeals@gmail.com',
  location: 'India',
  instagram: 'https://www.instagram.com/vexdeals/',
  facebook: 'https://www.facebook.com/profile.php?id=61576514798665',
};

// Merge stored content over defaults so missing fields always have a value.
export const mergeAbout = (stored) => {
  if (!stored || typeof stored !== 'object') return DEFAULT_ABOUT;
  const values = Array.isArray(stored.values) && stored.values.length
    ? stored.values.map((v, i) => ({
        title: v?.title ?? DEFAULT_ABOUT.values[i]?.title ?? '',
        desc: v?.desc ?? DEFAULT_ABOUT.values[i]?.desc ?? '',
      }))
    : DEFAULT_ABOUT.values;
  return { ...DEFAULT_ABOUT, ...stored, values };
};
