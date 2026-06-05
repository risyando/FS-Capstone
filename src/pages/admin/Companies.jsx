import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../utils/api.js';

function Modal({ isNew, id, onClose, onSaved }) {
  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const url = isNew ? '/api/admin/companies' : `/api/admin/companies/${id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, { method, body: fd, credentials: 'same-origin' });
    if (res.ok) { onSaved(); onClose(); } else alert('Gagal menyimpan');
  }
  return (
    <div className="modal">
      <h2>{isNew ? 'Tambah' : 'Edit'} Perusahaan</h2>
      <form id="cform" encType="multipart/form-data" onSubmit={handleSubmit}>
        <div className="form-row"><label>Nama</label><input name="name" required /></div>
        <div className="form-grid cols-2">
          <div><label>Industri</label><input name="industry" /></div>
          <div><label>Website</label><input name="website" /></div>
        </div>
        <div className="form-grid cols-2">
          <div><label>Kota</label><input name="city" /></div>
          <div><label>Provinsi</label><input name="province" /></div>
        </div>
        <div className="form-grid cols-2">
          <div><label>Negara</label><input name="country" defaultValue="Indonesia" /></div>
          <div><label>Jumlah karyawan</label><input name="employees" /></div>
        </div>
        <div className="form-row"><label>Alamat</label><input name="address" /></div>
        <div className="form-row"><label>Deskripsi</label><textarea name="description" rows="3"></textarea></div>
        <div className="form-grid cols-2">
          <div><label>Logo</label><input type="file" name="logo" accept="image/*" /></div>
          <div><label>Tahun berdiri</label><input name="founded_year" type="number" /></div>
        </div>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="btn">Simpan</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminCompanies() {
  const { setModalOpen, setModalContent } = useOutletContext();
  const [q, setQ] = useState('');
  const [companies, setCompanies] = useState([]);

  useEffect(() => { load(); }, []);

  async function load(query = q) {
    const { data } = await api('/api/admin/companies?q=' + encodeURIComponent(query));
    setCompanies(data?.items || []);
  }

  async function del(id) {
    if (!confirm('Hapus perusahaan ini? Semua lowongannya juga akan hilang.')) return;
    await api(`/api/admin/companies/${id}`, { method: 'DELETE' });
    load();
  }

  function openModal(id = null) {
    const isNew = !id;
    setModalContent(
      <Modal isNew={isNew} id={id}
        onClose={() => setModalOpen(false)}
        onSaved={() => load()} />
    );
    setModalOpen(true);
  }

  return (
    <>
      <h1>Manage Perusahaan</h1>
      <div className="toolbar">
        <input type="text" placeholder="Cari nama / industri / kota" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(q)} />
        <button className="btn ghost" onClick={() => load(q)}>🔍 Search</button>
        <button className="btn" onClick={() => openModal(null)}>+ New</button>
      </div>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr><th>Logo</th><th>Nama</th><th>Industri</th><th>Kota</th><th>Negara</th><th>Approved</th><th>Search</th><th style={{ width: '1%' }}>Aksi</th></tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id}>
                <td>{c.logo_path ? <img className="thumb" src={`/static/${c.logo_path}`} alt="" /> : '—'}</td>
                <td>{c.name}</td>
                <td>{c.industry || '-'}</td>
                <td>{c.city || '-'}</td>
                <td>{c.country || '-'}</td>
                <td>{c.is_approved ? <span className="badge ok">YES</span> : <span className="badge bad">NO</span>}</td>
                <td>{c.search_count}</td>
                <td>
                  <button className="btn ghost small" onClick={() => openModal(c.id)}>Edit</button>
                  {' '}
                  <button className="btn danger small" onClick={() => del(c.id)}>Hapus</button>
                </td>
              </tr>
            ))}
            {!companies.length && <tr><td colSpan="8" className="muted" style={{ padding: '20px' }}>Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
