import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api, formatRp } from '../utils/api.js';
import IndonesiaMap from '../components/IndonesiaMap.jsx';

function SearchEngine() {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    api('/api/locations/provinces').then(r => setProvinces(r.data?.items || []));
  }, []);

  function submit(e) {
    e && e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (country) params.set('country', country);
    if (province) params.set('province', province);
    if (city) params.set('city', city);
    window.location.href = '/jobs?' + params.toString();
  }

  return (
    <form className="search-card" onSubmit={submit}>
      <input className="span-2" type="text" placeholder="Cari posisi, perusahaan, atau skill (mis: Python, Backend)" value={q} onChange={e => setQ(e.target.value)} />
      <select value={country} onChange={e => setCountry(e.target.value)}>
        <option value="">Semua negara</option>
        <option value="Indonesia">Indonesia</option>
        <option value="Singapore">Singapore</option>
        <option value="Australia">Australia</option>
        <option value="Worldwide">Luar Negeri (Remote)</option>
      </select>
      <select value={province} onChange={e => setProvince(e.target.value)}>
        <option value="">Semua provinsi</option>
        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <input type="text" placeholder="Kota (opsional)" value={city} onChange={e => setCity(e.target.value)} />
      <button className="btn" type="submit">Cari</button>
    </form>
  );
}

export default function Home() {
  const { user } = useOutletContext();
  const [latestJobs, setLatestJobs] = useState([]);
  const [latestMeta, setLatestMeta] = useState('memuat…');
  const [topOpenings, setTopOpenings] = useState([]);
  const [topSearched, setTopSearched] = useState([]);
  const [stats, setStats] = useState({ users: '—', companies: '—', jobs: '—' });
  const STATIC_PARTNERS = [
    { name: 'DBS Foundation', color: '#e31837', link: 'https://www.dbs.com/foundation' },
    { name: 'Dicoding',       color: '#2d9cdb', link: 'https://www.dicoding.com' },
    { name: 'Google',         color: '#4285f4', link: 'https://careers.google.com' },
    { name: 'Tokopedia',      color: '#42b549', link: 'https://www.tokopedia.com' },
    { name: 'Gojek',          color: '#00aa13', link: 'https://www.gojek.com' },
    { name: 'Bukalapak',      color: '#e31e52', link: 'https://www.bukalapak.com' },
    { name: 'Shopee',         color: '#ee4d2d', link: 'https://careers.shopee.co.id' },
    { name: 'Traveloka',      color: '#0194f3', link: 'https://www.traveloka.com' },
  ];
  const [partners, setPartners] = useState(STATIC_PARTNERS);
  const [experiences, setExperiences] = useState([]);
  const [cvResult, setCvResult] = useState(null);
  const [cvLoading, setCvLoading] = useState(false);

  useEffect(() => {
    Promise.allSettled([loadLatestJobs(), loadTopOpenings(), loadTopSearched(), loadStats(), loadPartners(), loadExperiences()]);
  }, []);

  async function loadLatestJobs() {
    const { ok, data } = await api('/api/jobs?per_page=4');
    if (!ok || !data) return;
    if (data.total != null) setLatestMeta(Number(data.total).toLocaleString('id-ID') + ' lowongan aktif');
    setLatestJobs((data.items || []).slice(0, 4));
  }
  async function loadTopOpenings() {
    const { ok, data } = await api('/api/companies/top-openings');
    if (!ok || !data) return;
    setTopOpenings((data.items || []).slice(0, 4));
  }
  async function loadTopSearched() {
    const { ok, data } = await api('/api/companies/top-searched');
    if (!ok || !data) return;
    setTopSearched((data.items || []).slice(0, 4));
  }
  async function loadStats() {
    const { ok, data } = await api('/api/stats');
    if (!ok || !data) return;
    setStats({ users: Number(data.users || 0).toLocaleString('id-ID'), companies: Number(data.companies || 0).toLocaleString('id-ID'), jobs: Number(data.jobs || 0).toLocaleString('id-ID') });
  }
  async function loadPartners() {
    // Partners shown from static list; try to merge with server data if available
    try {
      const { ok, data } = await api('/api/partners');
      if (ok && data && data.items && data.items.length > 0) {
        // Server has partners – keep using static colored tiles (image loading unreliable)
      }
    } catch (_) { /* ignore */ }
  }
  async function loadExperiences() {
    const { ok, data } = await api('/api/experiences');
    if (!ok || !data) return;
    setExperiences(data.items || []);
  }

  async function handleQuickCv(e) {
    e.preventDefault();
    setCvLoading(true);
    setCvResult(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/cv/upload', { method: 'POST', body: fd, credentials: 'same-origin' });
    const data = await res.json().catch(() => null);
    setCvLoading(false);
    if (!res.ok || !data || !data.ok) { setCvResult({ error: (data && data.error) || 'Gagal memproses CV' }); return; }
    setCvResult(data);
  }

  // Triplicate for seamless marquee
  const marqueeItems = [...partners, ...partners, ...partners];

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Temukan pekerjaan impian Anda di RUMAH KARIR</h1>
          <p>Cari lowongan di Indonesia &amp; luar negeri. Upload CV untuk pencocokan otomatis, atau buat CV &amp; surat lamaran standar internasional langsung dari sini.</p>

          <div className="hero-tools">
            <div className="hero-tool-card">
              <h3>Upload CV Anda</h3>
              <p>Sistem akan membaca <strong>umur</strong>, <strong>skill</strong>, dan <strong>pengalaman</strong> dari CV PDF lalu mencocokkan dengan lowongan yang sedang dibuka.</p>
              {user ? (
                <>
                  <form encType="multipart/form-data" onSubmit={handleQuickCv}>
                    <div className="file-row">
                      <input type="file" name="cv" accept="application/pdf" required />
                      <button className="btn" type="submit">{cvLoading ? 'Memproses…' : 'Cocokkan'}</button>
                    </div>
                  </form>
                  {cvResult && (
                    <div className="quick-result">
                      {cvResult.error ? (
                        <span className="alert error" style={{ display: 'block' }}>{cvResult.error}</span>
                      ) : (
                        <>
                          <div><strong>Umur:</strong> {cvResult.parsed?.age || '-'} tahun &nbsp; <strong>Pengalaman:</strong> {cvResult.parsed?.experience_years || 0} tahun</div>
                          <div className="skills" style={{ marginTop: '6px' }}>
                            {(cvResult.parsed?.skills || []).length ? cvResult.parsed.skills.map(s => <span key={s} className="skill">{s}</span>) : <span className="muted">tidak terdeteksi</span>}
                          </div>
                          {cvResult.matches?.[0] ? (
                            <div style={{ marginTop: '6px' }}><strong>Match terbaik:</strong> <a href={`/jobs/${cvResult.matches[0].job_id}`}>{cvResult.matches[0].job_title}</a> di {cvResult.matches[0].company_name} ({cvResult.matches[0].score}/100)</div>
                          ) : (
                            <div className="muted" style={{ marginTop: '6px' }}>Belum ada lowongan yang sangat cocok. <a href="/cv">Lihat saran skill</a>.</div>
                          )}
                          <div style={{ marginTop: '8px' }}><a className="btn small ghost" href="/cv">Lihat semua match</a></div>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="muted">Anda perlu <a href="/login">login</a> untuk mengunggah CV. Setelah login, file PDF langsung diparsing dan dicocokkan dengan lowongan.</p>
                  <div className="actions"><a className="btn" href="/login">Login</a><a className="btn ghost" href="/register">Daftar Gratis</a></div>
                </>
              )}
            </div>
            <div className="hero-tool-card">
              <h3>Buat CV &amp; Surat Lamaran</h3>
              <p>Belum punya CV? Generate CV standar internasional atau surat lamaran langsung di sini, lalu simpan ke PDF.</p>
              <div className="actions">
                <a className="btn" href="/generate-cv">Generate CV</a>
                <a className="btn ghost" href="/generate-cover-letter">Generate Surat Lamaran</a>
              </div>
            </div>
          </div>

          <SearchEngine />
        </div>
      </section>

      {/* Lowongan Terbaru */}
      <section className="section container">
        <div className="section-title-row">
          <h2>Lowongan Terbaru</h2>
          <div className="flex center gap-8">
            <span className="meta-pill">{latestMeta}</span>
            <a className="btn ghost" href="/jobs">Lihat semua lowongan</a>
          </div>
        </div>
        <div className="grid-2x2">
          {latestJobs.length ? latestJobs.map(j => (
            <a key={j.id} className="card" href={`/jobs/${j.id}`}>
              <div className="title">{j.title}</div>
              <div className="meta">{j.company_name} • {j.city || '-'}, {j.country || '-'}</div>
              <div className="skills">{(j.skills || '').split(',').slice(0, 4).filter(Boolean).map(s => <span key={s} className="skill">{s.trim()}</span>)}</div>
              <div className="muted" style={{ marginTop: '6px' }}>{j.salary_min ? `${formatRp(j.salary_min)} – ${formatRp(j.salary_max)}` : 'Gaji negosiasi'}</div>
            </a>
          )) : <div className="muted" style={{ gridColumn: '1/-1', padding: '24px 0' }}>Memuat lowongan terbaru…</div>}
        </div>
      </section>

      {/* Top Openings */}
      <section className="section container">
        <div className="section-title-row">
          <h2>Top Perusahaan Membuka Banyak Lowongan</h2>
          <a className="btn ghost" href="/jobs">Lihat lowongan</a>
        </div>
        <div className="grid-2x2">
          {topOpenings.length ? topOpenings.map(c => (
            <a key={c.id} className="card" href={`/jobs?q=${encodeURIComponent(c.name)}`}>
              <div className="title">{c.name}</div>
              <div className="meta">{c.industry || '-'}</div>
              <div className="muted">{c.open_jobs || 0} lowongan aktif</div>
            </a>
          )) : <div className="muted" style={{ gridColumn: '1/-1', padding: '24px 0' }}>Memuat data perusahaan…</div>}
        </div>
      </section>

      {/* Top Searched */}
      <section className="section container">
        <div className="section-title-row">
          <h2>Perusahaan Paling Banyak Dicari</h2>
          <span className="meta-pill">Top 4 hari ini</span>
        </div>
        <div className="grid-2x2">
          {topSearched.length ? topSearched.map(c => (
            <a key={c.id} className="card" href={`/jobs?q=${encodeURIComponent(c.name)}`}>
              <div className="title">{c.name}</div>
              <div className="meta">{c.industry || '-'}</div>
              <div className="muted">{c.search_count || 0} kali dilihat</div>
            </a>
          )) : <div className="muted" style={{ gridColumn: '1/-1', padding: '24px 0' }}>Memuat data perusahaan…</div>}
        </div>
      </section>

      {/* Peta */}
      <section className="section container">
        <div className="section-title-row">
          <h2>RUMAH KARIR di Seluruh Indonesia</h2>
          <span className="meta-pill">Klik provinsi untuk filter</span>
        </div>
        <div className="id-map" style={{ animation: 'fadeUp .9s ease both', animationDelay: '.3s' }}>
          <div className="map-legend">
            <span className="legend-dot"></span>
            <span>Sorot provinsi untuk efek glow · klik untuk memfilter lowongan</span>
          </div>
          <IndonesiaMap />
        </div>
      </section>

      {/* Statistik */}
      <section className="section container">
        <h2>Statistik Komunitas</h2>
        <div className="stats-row">
          <div className="stat"><div className="num">{stats.users}</div><div className="lbl">Akun Pengguna Terdaftar</div></div>
          <div className="stat"><div className="num">{stats.companies}</div><div className="lbl">Perusahaan Terdaftar</div></div>
          <div className="stat"><div className="num">{stats.jobs}</div><div className="lbl">Lowongan Aktif</div></div>
        </div>
      </section>

      {/* Partners Marquee */}
      <section className="section container">
        <h2>Kerja Sama dengan Kami</h2>
        <p className="muted">Mitra dan kolaborator yang mempercayai RUMAH KARIR.</p>
        <div className="partners-marquee-wrap">
          <div className="partners-marquee">
            {[...partners, ...partners, ...partners].map((p, i) => (
              <a
                key={i}
                href={p.link || p.image_path ? (p.link || '#') : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="partner-tile"
                style={{
                  borderColor: (p.color || '#ffffff') + '55',
                  background: `linear-gradient(135deg, ${(p.color || '#ffffff')}18 0%, ${(p.color || '#ffffff')}08 100%)`,
                  textDecoration: 'none',
                }}
              >
                <span style={{
                  color: p.color || 'var(--text)',
                  fontWeight: 800,
                  fontSize: '15px',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                  textShadow: `0 0 20px ${p.color || '#fff'}55`,
                }}>
                  {p.name || 'Mitra'}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Pengalaman */}
      <section className="section container">
        <div className="section-title-row">
          <h2>Pengalaman Pengguna</h2>
          <a className="btn ghost" href="/share-experience">Bagikan Pengalaman Anda</a>
        </div>
        <div className="grid">
          {experiences.length ? experiences.map(ex => {
            const rating = Math.max(0, Math.min(5, Number(ex.rating) || 0));
            const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
            return (
              <div key={ex.id} className="card">
                <div className="flex center gap-8">
                  {ex.photo_path && <img src={`/static/${ex.photo_path}`} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} alt="" />}
                  <div>
                    <div className="title" style={{ fontSize: '14px' }}>{ex.full_name || 'User'}</div>
                    <div className="meta">Rating: {stars}</div>
                  </div>
                </div>
                {ex.title && <div style={{ fontWeight: '700' }}>{ex.title}</div>}
                <div>{ex.body}</div>
              </div>
            );
          }) : <div className="muted" style={{ gridColumn: '1/-1', padding: '24px 0' }}>Memuat pengalaman…</div>}
        </div>
      </section>
    </>
  );
}
