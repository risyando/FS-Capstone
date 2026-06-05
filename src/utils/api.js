export async function api(url, opts = {}) {
  const init = Object.assign({ credentials: 'same-origin' }, opts);
  if (init.body && typeof init.body === 'object' && !(init.body instanceof FormData)) {
    init.headers = Object.assign({ 'Content-Type': 'application/json' }, init.headers || {});
    init.body = JSON.stringify(init.body);
  }
  const res = await fetch(url, init);
  let data = null;
  try { data = await res.json(); } catch (_) { data = null; }
  return { ok: res.ok, status: res.status, data };
}

export function formatRp(n) {
  if (!n && n !== 0) return '-';
  try { return 'Rp ' + Number(n).toLocaleString('id-ID'); } catch (_) { return '-'; }
}

export function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
