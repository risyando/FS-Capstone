import { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api('/api/admin/stats').then(({ data }) => { if (data) setStats(data); });
  }, []);

  return (
    <>
      <h1>Dashboard</h1>
      <div className="dash-stats">
        <div className="stat"><div className="num">{stats.users ?? '—'}</div><div className="lbl">Total User</div></div>
        <div className="stat"><div className="num">{stats.verified_users ?? '—'}</div><div className="lbl">User Terverifikasi</div></div>
        <div className="stat"><div className="num">{stats.companies ?? '—'}</div><div className="lbl">Perusahaan Aktif</div></div>
        <div className="stat"><div className="num">{stats.pending_companies ?? '—'}</div><div className="lbl">Menunggu Approval</div></div>
        <div className="stat"><div className="num">{stats.jobs ?? '—'}</div><div className="lbl">Lowongan Aktif</div></div>
        <div className="stat"><div className="num">{stats.partners ?? '—'}</div><div className="lbl">Mitra Kerja Sama</div></div>
        <div className="stat"><div className="num">{stats.experiences ?? '—'}</div><div className="lbl">Pengalaman User</div></div>
        <div className="stat"><div className="num">{stats.maintenance != null ? (stats.maintenance ? 'AKTIF' : 'Nonaktif') : '—'}</div><div className="lbl">Status Maintenance</div></div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Aksi Cepat</h3>
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          <a className="btn" href="/admin/companies">+ Tambah / Cari Perusahaan</a>
          <a className="btn ghost" href="/admin/jobs">+ Tambah / Cari Lowongan</a>
          <a className="btn ghost" href="/admin/approvals">Lihat Approval Perusahaan</a>
          <a className="btn ghost" href="/admin/maintenance">Toggle Maintenance</a>
        </div>
      </div>
    </>
  );
}
