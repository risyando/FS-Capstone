import { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

export default function AdminExperiences() {
  const [items, setItems] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await api('/api/admin/experiences');
    setItems(data?.items || []);
  }

  async function del(id) {
    if (!confirm('Hapus pengalaman ini?')) return;
    await api(`/api/admin/experiences/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <h1>Pengalaman dari User</h1>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Rating</th><th>Judul</th><th>Cerita</th><th>Tanggal</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {items.length ? items.map(e => (
              <tr key={e.id}>
                <td>{e.full_name || '-'}</td>
                <td>{e.email}</td>
                <td>{'★'.repeat(e.rating)}{'☆'.repeat(5 - e.rating)}</td>
                <td>{e.title || '-'}</td>
                <td style={{ maxWidth: '400px' }}>{e.body}</td>
                <td>{e.created_at}</td>
                <td><button className="btn danger small" onClick={() => del(e.id)}>Hapus</button></td>
              </tr>
            )) : <tr><td colSpan="7" className="muted" style={{ padding: '20px' }}>Belum ada pengalaman.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
