import { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await api('/api/partners');
    setPartners(data?.items || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/partners', { method: 'POST', body: fd, credentials: 'same-origin' });
    if (res.ok) { e.currentTarget.reset(); load(); } else alert('Gagal mengunggah');
  }

  async function del(id) {
    if (!confirm('Hapus mitra ini?')) return;
    await api(`/api/admin/partners/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <h1>Kerja Sama dengan Kami</h1>
      <p className="muted">Unggah gambar logo mitra. Akan tampil di halaman utama pada bagian "Kerja Sama dengan Kami".</p>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="card">
        <div className="form-grid cols-2">
          <div><label>Nama (opsional)</label><input name="name" /></div>
          <div><label>Link (opsional)</label><input name="link" placeholder="https://..." /></div>
        </div>
        <div className="form-row" style={{ marginTop: '10px' }}>
          <label>Gambar (png/jpg/webp)</label>
          <input type="file" name="image" accept="image/*" required />
        </div>
        <button className="btn" type="submit">+ Tambah Mitra</button>
      </form>

      <h2 style={{ marginTop: '24px' }}>Daftar Mitra</h2>
      <div className="grid">
        {partners.length ? partners.map(p => (
          <div key={p.id} className="card" style={{ alignItems: 'center' }}>
            <img src={`/static/${p.image_path}`} style={{ maxHeight: '80px', objectFit: 'contain' }} alt={p.name || ''} />
            <div className="meta">{p.name || '-'}</div>
            {p.link && <a className="muted" href={p.link} target="_blank" rel="noopener noreferrer">{p.link}</a>}
            <button className="btn danger small" onClick={() => del(p.id)}>Hapus</button>
          </div>
        )) : <div className="muted">Belum ada mitra.</div>}
      </div>
    </>
  );
}
