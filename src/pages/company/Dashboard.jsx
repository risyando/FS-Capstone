import { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

export default function CompanyDashboard() {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const me = await api('/api/company/me');
    if (me.data?.company) setCompany(me.data.company);
    const { data } = await api('/api/company/jobs');
    setJobs(data?.items || []);
  }

  async function del(id) {
    if (!confirm('Hapus lowongan?')) return;
    await api(`/api/company/jobs/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <section className="container section">
      <div className="flex between center">
        <div>
          <h1 style={{ margin: 0 }}>{company?.name || 'Perusahaan Anda'}</h1>
          <div className="muted">{company?.industry || ''}</div>
        </div>
        <a className="btn" href="/company/post-job">+ Pasang Lowongan</a>
      </div>
      <h2 style={{ marginTop: '24px' }}>Lowongan Anda</h2>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead><tr><th>Judul</th><th>Lokasi</th><th>Skill</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {jobs.length ? jobs.map(j => (
              <tr key={j.id}>
                <td>{j.title}</td>
                <td>{j.city || '-'}, {j.country || '-'}</td>
                <td>{(j.skills || '').split(',').slice(0, 4).filter(Boolean).map(s => <span key={s} className="skill">{s.trim()}</span>)}</td>
                <td>{j.is_active ? <span className="badge ok">Aktif</span> : <span className="badge bad">Off</span>}</td>
                <td><button className="btn danger small" onClick={() => del(j.id)}>Hapus</button></td>
              </tr>
            )) : <tr><td colSpan="5" className="muted" style={{ padding: '20px' }}>Belum ada lowongan.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
