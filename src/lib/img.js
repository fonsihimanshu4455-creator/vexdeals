// Smaller image URL for thumbnails: Drive (lh3) and Cloudinary resize on their CDN.
export function thumb(url, w = 500) {
  if (typeof url !== 'string') return url;
  if (url.includes('lh3.googleusercontent.com')) return url.replace(/=w\d+(-h\d+)?$/, '') + `=w${w}`;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/f_auto'))
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
  return url;
}
