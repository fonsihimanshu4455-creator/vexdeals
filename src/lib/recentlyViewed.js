// Tracks recently viewed product ids in localStorage (most recent first, max 12).
const KEY = 'vexdeals_recent';
const MAX = 12;

export function getRecent() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function addRecent(id) {
  if (id == null) return;
  try {
    const list = getRecent().filter((x) => x !== id);
    list.unshift(id);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch { /* quota */ }
}
