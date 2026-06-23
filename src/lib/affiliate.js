// Detect the store name from an affiliate URL so we can label the buy button.
export function affiliateStore(url = '') {
  const u = String(url).toLowerCase();
  if (u.includes('myntra')) return 'Myntra';
  if (u.includes('amazon') || u.includes('amzn')) return 'Amazon';
  if (u.includes('flipkart') || u.includes('fkrt')) return 'Flipkart';
  if (u.includes('ajio')) return 'Ajio';
  if (u.includes('meesho')) return 'Meesho';
  if (u.includes('nykaa')) return 'Nykaa';
  if (u.includes('tatacliq')) return 'Tata CLiQ';
  return 'Store';
}
