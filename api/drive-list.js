// Lists image files inside a PUBLIC Google Drive folder WITHOUT needing a
// Drive API key. It reads Drive's public "embeddedfolderview" page (the same
// HTML Google serves for shared folders) and extracts the file ids + names.
// The folder just needs to be shared as "Anyone with the link".

function parseEmbeddedView(html) {
  const out = [];
  const seen = new Set();
  // Each file row looks like: <div class="flip-entry" id="entry-<FILE_ID>">
  // ... <div class="flip-entry-title">name.jpg</div>
  const entryRe = /id="entry-([\w-]{20,})"[\s\S]*?flip-entry-title">([^<]*)</g;
  let m;
  while ((m = entryRe.exec(html)) !== null) {
    const id = m[1];
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name: (m[2] || '').trim() });
  }
  // Fallback: if titles weren't captured, grab any entry ids in order.
  if (!out.length) {
    const idRe = /id="entry-([\w-]{20,})"/g;
    while ((m = idRe.exec(html)) !== null) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      out.push({ id: m[1], name: '' });
    }
  }
  return out;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

// Strategy A: the public "embeddedfolderview" page (clean flip-entry markup).
async function viaEmbeddedView(folderId) {
  const url = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`;
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } });
  if (!r.ok) return { files: [], status: r.status };
  return { files: parseEmbeddedView(await r.text()), status: 200 };
}

// Strategy B: the normal folder page, which embeds file rows as JS arrays like
// ["<id>",["<parent>"],"<name>",..."image/jpeg"...]. We pull id+name pairs that
// sit next to an image mime type.
async function viaFolderPage(folderId) {
  const url = `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } });
  if (!r.ok) return { files: [], status: r.status };
  const html = await r.text();
  const out = [];
  const seen = new Set();
  // Match: "ID","PARENT",["NAME"  ... up to an image mime nearby.
  const re = /\["([\w-]{25,})"\s*,\s*\["[\w-]{10,}"\]\s*,\s*"((?:[^"\\]|\\.)*)"[\s\S]{0,400}?"(image\/[a-z+]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const id = m[1];
    if (seen.has(id)) continue;
    seen.add(id);
    let name = '';
    try { name = JSON.parse(`"${m[2]}"`); } catch { name = m[2]; }
    out.push({ id, name });
  }
  return { files: out, status: 200 };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const folderId = String((req.query && req.query.folderId) || '').trim();
  if (!folderId) { res.status(400).json({ error: 'Missing folderId' }); return; }

  try {
    let { files, status } = await viaEmbeddedView(folderId);
    if (!files.length) {
      const b = await viaFolderPage(folderId);
      if (b.files.length) { files = b.files; status = 200; }
      else if (status >= 400 || b.status >= 400) {
        res.status(502).json({ error: `Drive ne folder nahi diya (${status}/${b.status}). Folder ko "Anyone with the link" public karo.` });
        return;
      }
    }
    // Keep image-like files; if names are missing we can't filter, so keep all.
    const imgs = files.filter((f) => !f.name || /\.(jpe?g|png|webp|gif|bmp|avif|heic)$/i.test(f.name));
    const result = imgs.length ? imgs : files;
    // Natural sort by name so 1,2,10 order correctly.
    result.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true }));
    res.status(200).json({ files: result });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to read folder' });
  }
}
