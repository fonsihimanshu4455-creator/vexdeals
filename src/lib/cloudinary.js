// Shared Cloudinary unsigned upload (free, no card). Cloud name + preset are
// public values, safe in client code. Override via env if needed.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlgnlc3nm';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'testvex';

// resourceType: 'image' | 'video'
export function uploadToCloudinary(file, resourceType = 'image') {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      reject(new Error('Upload not configured.'));
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, { method: 'POST', body: fd })
      .then((r) => r.json())
      .then((d) => (d.secure_url ? resolve(d.secure_url) : reject(new Error(d.error?.message || 'Upload failed'))))
      .catch(() => reject(new Error('Network error during upload')));
  });
}
