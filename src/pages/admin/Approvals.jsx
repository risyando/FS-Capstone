import { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

export default function AdminApprovals() {
  const [pending, setPending] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await api('/api/admin/pending-companies');
    setPending(data?.items || []);
  }

  async function approve(userId) {
    await api(`/api/admin/users/${userId}/approve`, { method: 'POST' });
    load();
  }

  async function reject(userId) {
    if (!confirm('Tolak & hapus pendaftaran perusahaan ini?')) return;
    await api(`/api/admin/users/${userId}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <h1>Approval Pendaftaran Perusahaan</h1>
      <p className="muted">Perusahaan yang baru daftar harus disetujui di sini sebelum dapat login dan memposting lowongan.</p>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr><th>Logo</th><th>Nama</th><th>Industri</th><th>Email Pemilik</th><th>Kota</th><th>Deskripsi</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {pending.length ? pending.map(c => (
              <tr key={c.user_id}>
                <td>{c.logo_path ? <img className="thumb" src={`/static/${c.logo_path}`} alt="" /> : '—'}</td>
                <td>{c.name || '-'}</td>
                <td>{c.industry || '-'}</td>
                <td>{c.email}</td>
                <td>{c.city || '-'}</td>
                <td style={{ maxWidth: '300px' }}>{c.description || '-'}</td>
                <td>
                  <button className="btn small" onClick={() => approve(c.user_id)}>Setujui</button>
                  {' '}
                  <button className="btn danger small" onClick={() => reject(c.user_id)}>Tolak</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="muted" style={{ padding: '20px' }}>Tidak ada permintaan pendaftaran perusahaan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
