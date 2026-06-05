import { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

export default function AdminMaintenance() {
  const [enabled, setEnabled] = useState(null);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    const { data } = await api('/api/admin/maintenance');
    setEnabled(data?.enabled ?? false);
  }

  async function toggle() {
    await api('/api/admin/maintenance', { method: 'POST', body: { enabled: !enabled } });
    refresh();
  }

  return (
    <>
      <h1>Mode Maintenance</h1>
      <p className="muted">Jika diaktifkan, semua halaman tidak dapat dibuka kecuali oleh admin.</p>
      <div className="card">
        <div className="flex between center">
          <div>
            <div style={{ fontWeight: '700' }}>
              Status saat ini: <span>{enabled === null ? '—' : enabled ? 'AKTIF' : 'NONAKTIF'}</span>
            </div>
            <div className="muted">
              {enabled ? 'Situs tidak dapat diakses oleh user biasa. Hanya admin yang bisa.' : 'Situs berjalan normal.'}
            </div>
          </div>
          <button
            className={`btn${enabled ? ' danger' : ''}`}
            onClick={toggle}
            disabled={enabled === null}
          >
            {enabled === null ? 'Memuat…' : enabled ? 'Nonaktifkan' : 'Aktifkan Maintenance'}
          </button>
        </div>
      </div>
    </>
  );
}
