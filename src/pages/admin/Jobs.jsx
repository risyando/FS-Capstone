import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../utils/api.js';

function JobModal({ companies, onClose, onSaved }) {
  async function handleSubmit(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const { ok } = await api('/api/admin/jobs', { method: 'POST', body });
    if (ok) { onSaved(); onClose(); } else alert('Gagal menyimpan');
  }
  return (
    <div className="modal">
      <h2>Tambah Lowongan</h2>
      <form id="jform" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Perusahaan</label>
          <select name="company_id" required>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-row"><label>Judul</label><input name="title" required /></div>
        <div className="form-row"><label>Deskripsi</label><textarea name="description" rows="3"></textarea></div>
        <div className="form-row"><label>Persyaratan</label><textarea name="requirements" rows="3"></textarea></div>
        <div className="form-row"><label>Skill (pisah koma)</label><input name="skills" placeholder="python, sql, docker" /></div>
        <div className="form-grid cols-2">
          <div><label>Tipe Kerja</label><input name="employment_type" defaultValue="Full-time" /></div>
          <div><label>Min Pengalaman (tahun)</label><input name="min_experience" type="number" defaultValue="0" /></div>
        </div>
        <div className="form-grid cols-2">
          <div><label>Negara</label><input name="country" defaultValue="Indonesia" /></div>
          <div><label>Provinsi</label><input name="province" /></div>
        </div>
        <div className="form-grid cols-2">
          <div><label>Kota</label><input name="city" /></div>
          <div><label>Min Umur</label><input name="min_age" type="number" /></div>
        </div>
        <div className="form-grid cols-2">
          <div><label>Max Umur</label><input name="max_age" type="number" /></div>
          <div><label>Gaji Min</label><input name="salary_min" type="number" /></div>
        </div>
        <div className="form-row"><label>Gaji Max</label><input name="salary_max" type="number" /></div>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="btn">Simpan</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminJobs() {
  const { setModalOpen, setModalContent } = useOutletContext();
  const [q, setQ] = useState('');
  const [jobs, setJobs] = useState([]);

  useEffect(() => { load(); }, []);

  async function load(query = q) {
    const { data } = await api('/api/admin/jobs?q=' + encodeURIComponent(query));
    setJobs(data?.items || []);
  }

  async function del(id) {
    if (!confirm('Hapus lowongan ini?')) return;
    await api(`/api/admin/jobs/${id}`, { method: 'DELETE' });
    load();
  }

  async function openNewModal() {
    const { data } = await api('/api/admin/companies');
    const companies = data?.items || [];
    setModalContent(<JobModal companies={companies} onClose={() => setModalOpen(false)} onSaved={() => load()} />);
    setModalOpen(true);
  }

  return (
    <>
      <h1>Manage Lowongan</h1>
      <div className="toolbar">
        <input type="text" placeholder="Cari judul / perusahaan / skill" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(q)} />
        <button className="btn ghost" onClick={() => load(q)}>🔍 Search</button>
        <button className="btn" onClick={openNewModal}>+ New Lowongan</button>
      </div>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead><tr><th>Judul</th><th>Perusahaan</th><th>Lokasi</th><th>Skill</th><th>Aksi</th></tr></thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id}>
                <td>{j.title}</td>
                <td>{j.company_name}</td>
                <td>{j.city || '-'}, {j.country || '-'}</td>
                <td><div className="skills">{(j.skills || '').split(',').slice(0, 4).filter(Boolean).map(s => <span key={s} className="skill">{s.trim()}</span>)}</div></td>
                <td><button className="btn danger small" onClick={() => del(j.id)}>Hapus</button></td>
              </tr>
            ))}
            {!jobs.length && <tr><td colSpan="5" className="muted" style={{ padding: '20px' }}>Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
