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

export const driveImageUrl = (id) => `https://drive.google.com/uc?export=download&id=${id}`;

// Lists image files inside a PUBLIC Drive folder (requires Drive API enabled).
export async function listFolderImages(folderId) {
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
