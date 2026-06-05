import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api, formatRp } from '../utils/api.js';

export default function JobDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [job, setJob] = useState(null);

  useEffect(() => {
    api('/api/jobs/' + id).then(({ ok, data }) => {
      setLoading(false);
      if (!ok || !data || !data.item) {
        setError((data && data.error) || 'Gagal memuat lowongan');
        return;
      }
      setJob(data.item);
    });
  }, [id]);

  if (loading) return <section className="container section"><div className="muted">Memuat lowongan…</div></section>;
  if (error) return <section className="container section"><div className="alert error">{error}</div></section>;
  if (!job) return null;

  const j = job;
  const skills = (j.skills || '').split(',').filter(Boolean);
  const meta = `${j.company_name} • ${j.city || '-'}, ${j.province || ''} ${j.country || ''}`.replace(/\s+/g, ' ').trim();

  return (
    <section className="container section">
      <div className="job-detail">
        <div className="panel">
          <h1 style={{ margin: '0 0 6px' }}>{j.title}</h1>
          <div className="muted">{meta}</div>
          <div className="skills" style={{ margin: '14px 0' }}>
            {skills.map(s => <span key={s} className="skill">{s.trim()}</span>)}
          </div>

          {j._locked ? (
            <>
              <div className="alert">
                🔒 Untuk melihat <strong>detail lengkap perusahaan dan deskripsi pekerjaan</strong>,
                silakan <a href="/login">login</a> terlebih dahulu.
              </div>
              <div className="locked-blur">
                <p>Login untuk melihat deskripsi lengkap dan kebutuhan posisi ini, termasuk benefit, syarat, dan informasi gaji.</p>
                <p>Anda juga akan bisa upload CV dan dicocokkan otomatis dengan posisi serupa.</p>
              </div>
            </>
          ) : (
            <>
              <h3>Deskripsi</h3>
              <div className="job-text">{j.description || '-'}</div>
              <h3>Persyaratan</h3>
              <div className="job-text">{j.requirements || '-'}</div>
              <p className="muted">Tipe: {j.employment_type || '-'} • Pengalaman min: {j.min_experience || 0} tahun • Usia: {j.min_age || '-'}–{j.max_age || '-'}</p>
              <p className="muted">Gaji: {j.salary_min ? `${formatRp(j.salary_min)} – ${formatRp(j.salary_max)}` : 'Negosiasi'}</p>
            </>
          )}
        </div>

        <div className="panel" id="company-panel">
          <h3 style={{ marginTop: 0 }}>Tentang Perusahaan</h3>
          {j._locked ? (
            <div className="locked-blur">Profil perusahaan, jumlah karyawan, tahun berdiri, dan info kontak hanya untuk pengguna terdaftar.</div>
          ) : (
            <>
              <div style={{ fontWeight: '700' }}>{j.company_name}</div>
              <div className="muted">{j.industry || ''}</div>
              <div className="job-text">{j.company_description || ''}</div>
              <p className="muted">Karyawan: {j.employees || '-'} • Berdiri: {j.founded_year || '-'}</p>
              {j.website && <p><a href={j.website} target="_blank" rel="noopener noreferrer">Website</a></p>}
              <p className="muted">{j.address || ''}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
