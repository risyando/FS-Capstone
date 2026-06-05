import { useState, useEffect } from 'react';
import { api, formatRp, escapeHtml } from '../utils/api.js';

const PER_PAGE = 24;

function JobCard({ j }) {
  const skills = (j.skills || '').split(',').slice(0, 5).filter(Boolean);
  return (
    <div className="card">
      <div className="title">{j.title}</div>
      <div className="meta">{j.company_name} • {j.city || '-'}, {j.country || '-'}</div>
      <div className="skills">{skills.map(s => <span key={s} className="skill">{s.trim()}</span>)}</div>
      <div className="muted">{j.salary_min ? `${formatRp(j.salary_min)} – ${formatRp(j.salary_max)}` : 'Gaji negosiasi'}</div>
      <div className="flex between center" style={{ marginTop: '8px' }}>
        <span className="badge">{j.employment_type || '-'}</span>
        <a className="btn small ghost" href={`/jobs/${j.id}`}>Lihat Selengkapnya</a>
      </div>
      {j._locked && <div className="muted" style={{ fontSize: '12px' }}>🔒 Login untuk melihat detail lengkap perusahaan</div>}
    </div>
  );
}

export default function Jobs() {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [metaText, setMetaText] = useState('');

  useEffect(() => {
    api('/api/locations/provinces').then(r => setProvinces(r.data?.items || []));
    // pre-fill from URL
    const usp = new URLSearchParams(window.location.search);
    if (usp.get('q')) setQ(usp.get('q'));
    if (usp.get('country')) setCountry(usp.get('country'));
    if (usp.get('province')) setProvince(usp.get('province'));
    if (usp.get('city')) setCity(usp.get('city'));
  }, []);

  useEffect(() => {
    doSearch(1, false);
  }, []);

  async function doSearch(pg = 1, append = false) {
    const usp = new URLSearchParams();
    if (q) usp.set('q', q);
    if (country) usp.set('country', country);
    if (province) usp.set('province', province);
    if (city) usp.set('city', city);
    usp.set('page', String(pg));
    usp.set('per_page', String(PER_PAGE));
    history.replaceState(null, '', '/jobs?' + usp.toString());
    const { data } = await api('/api/jobs?' + usp.toString());
    const items = data?.items || [];
    const tot = data?.total || 0;
    if (append) {
      setJobs(prev => [...prev, ...items]);
    } else {
      setJobs(items);
      setPage(1);
    }
    setTotal(tot);
    if (tot > 0) setMetaText(`Menampilkan ${append ? jobs.length + items.length : items.length} dari ${tot} lowongan`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    doSearch(1, false);
  }

  async function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    await doSearch(nextPage, true);
  }

  return (
    <>
      <section className="hero" style={{ paddingTop: '32px', paddingBottom: '18px' }}>
        <div className="container">
          <h1 style={{ fontSize: '28px' }}>Cari Lowongan Kerja</h1>
          <p>Filter berdasarkan negara, provinsi, dan kota.</p>
          <form className="search-card" onSubmit={handleSubmit}>
            <input className="span-2" name="q" type="text" placeholder="Posisi / Perusahaan / Skill" value={q} onChange={e => setQ(e.target.value)} />
            <select name="country" value={country} onChange={e => setCountry(e.target.value)}>
              <option value="">Semua negara</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Singapore">Singapore</option>
              <option value="Australia">Australia</option>
              <option value="Worldwide">Luar Negeri</option>
            </select>
            <select name="province" value={province} onChange={e => setProvince(e.target.value)}>
              <option value="">Semua provinsi</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input name="city" type="text" placeholder="Kota (opsional)" value={city} onChange={e => setCity(e.target.value)} />
            <button className="btn" type="submit">Cari</button>
          </form>
        </div>
      </section>

      <section className="container section">
        <div className="muted" style={{ marginBottom: '12px' }}>{metaText}</div>
        {jobs.length === 0 ? (
          <div className="muted" style={{ padding: '24px' }}>Tidak ada lowongan ditemukan.</div>
        ) : (
          <div className="grid">
            {jobs.map(j => <JobCard key={j.id} j={j} />)}
          </div>
        )}
        <div className="flex center" style={{ justifyContent: 'center', marginTop: '18px', gap: '10px' }}>
          {jobs.length < total && (
            <button className="btn ghost" type="button" onClick={loadMore}>Tampilkan lebih banyak</button>
          )}
        </div>
      </section>
    </>
  );
}
