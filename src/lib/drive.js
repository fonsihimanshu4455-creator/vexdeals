// Google Drive helpers — expand a public folder link into its image files.
const DRIVE_KEY = import.meta.env.VITE_DRIVE_API_KEY
  || import.meta.env.VITE_FIREBASE_API_KEY
  || 'AIzaSyBVrk2cTyDCSJ_0xwWNPa9-ZvyzMhEGLjA';

export const extractFolderId = (link) => {
  const m = String(link || '').match(/\/folders\/([\w-]{15,})/) || String(link || '').match(/[?&]id=([\w-]{15,})/);
  // Only treat as folder if URL clearly references a folder
  return /folders\//.test(String(link || '')) && m ? m[1] : '';
};

export const extractFileId = (link) => {
  const m = String(link || '').match(/\/d\/([\w-]{15,})/) || String(link || '').match(/[?&]id=([\w-]{15,})/);
  return m ? m[1] : '';
};

// lh3 serves the raw image bytes for any public Drive file — Cloudinary can
// fetch this reliably (uc?export=download often returns an HTML interstitial).
export const driveImageUrl = (id) => `https://lh3.googleusercontent.com/d/${id}=w2000`;

// Lists image files inside a PUBLIC Drive folder.
// Primary path: our serverless endpoint that reads Drive's public folder page —
// needs NO API key, so it works even without Cloud-console access. The folder
// just has to be shared as "Anyone with the link".
// Fallback: the official Drive API (only works if a Drive-enabled key exists).
export async function listFolderImages(folderId) {
  // 1) Try the keyless serverless scraper first.
  try {
    const res = await fetch(`/api/drive-list?folderId=${encodeURIComponent(folderId)}`);
    const data = await res.json();
    if (res.ok && Array.isArray(data.files) && data.files.length) return data.files;
    if (data.error && !DRIVE_KEY) throw new Error(data.error);
  } catch (e) {
    if (!DRIVE_KEY) throw e;
    // otherwise fall through to the API attempt below
  }

  // 2) Fallback to the official Drive API (requires a Drive-enabled key).
  const out = [];
  let pageToken = '';
  do {
    const q = `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`
      + `&key=${DRIVE_KEY}&fields=files(id,name),nextPageToken&pageSize=1000`
      + `&supportsAllDrives=true&includeItemsFromAllDrives=true`
      + (pageToken ? `&pageToken=${pageToken}` : '');
    // eslint-disable-next-line no-await-in-loop
    const res = await fetch(url);
    // eslint-disable-next-line no-await-in-loop
    const data = await res.json();
    if (data.error) throw new Error(data.error?.message || 'Drive API error');
    (data.files || []).forEach((f) => out.push(f));
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  out.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true }));
  return out;
}
