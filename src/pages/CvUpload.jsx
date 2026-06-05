import { useState } from 'react';
import { formatRp } from '../utils/api.js';

export default function CvUpload() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/cv/upload', { method: 'POST', body: fd, credentials: 'same-origin' });
    let data = null; try { data = await res.json(); } catch (_) {}
    setLoading(false);
    if (!res.ok || !data || !data.ok) {
      setResult({ error: (data && data.error) || 'Gagal memproses CV' });
      return;
    }
    setResult(data);
  }

  return (
    <section className="container section">
      <h1>Upload CV (PDF)</h1>
      <p className="muted">Sistem akan mengekstrak skill, pengalaman, dan umur Anda lalu mencocokkan ke lowongan yang relevan.</p>
      <form id="cv-form" encType="multipart/form-data" style={{ maxWidth: '480px' }} onSubmit={handleSubmit}>
        <div className="form-row">
          <label>File CV (PDF, maks 16 MB)</label>
          <input type="file" name="cv" accept="application/pdf" required />
        </div>
        <button className="btn" type="submit">{loading ? 'Memproses…' : 'Unggah & Cocokkan'}</button>
      </form>

      {result && (
        <div style={{ marginTop: '18px' }}>
          {result.error ? (
            <div className="alert error">{result.error}</div>
          ) : (
            <>
              <div className="card">
                <h3 style={{ margin: '0 0 6px' }}>Hasil Analisis CV</h3>
                <div><strong>Umur terdeteksi:</strong> {result.parsed?.age || '-'} tahun</div>
                <div><strong>Pengalaman:</strong> {result.parsed?.experience_years || 0} tahun</div>
                <div><strong>Skill terdeteksi:</strong>{' '}
                  {(result.parsed?.skills || []).length
                    ? result.parsed.skills.map(s => <span key={s} className="skill">{s}</span>)
                    : <span className="muted">tidak terdeteksi</span>}
                </div>
              </div>

              {!result.has_good_match && (
                <div className="alert">
                  Kami tidak menemukan lowongan yang sangat cocok untuk profil Anda saat ini.
                  Untuk meningkatkan peluang, pertimbangkan untuk meningkatkan skill berikut:
                  <div className="skills" style={{ marginTop: '8px' }}>
                    {(result.suggestions || []).length
                      ? result.suggestions.map(s => <span key={s} className="skill">{s}</span>)
                      : <span className="muted">-</span>}
                  </div>
                </div>
              )}

              <h2 style={{ marginTop: '24px' }}>{result.has_good_match ? 'Lowongan yang cocok untuk Anda' : 'Lowongan yang masih bisa Anda coba'}</h2>
              <div className="grid">
                {(result.matches || []).map(m => (
                  <a key={m.job_id} className="card" href={`/jobs/${m.job_id}`}>
                    <div className="match-score">{m.score} / 100</div>
                    <div className="match-bar"><div className="fill" style={{ width: `${m.score}%` }}></div></div>
                    <div className="title">{m.job_title}</div>
                    <div className="meta">{m.company_name}</div>
                    <div className="muted" style={{ fontSize: '12px' }}>Skill cocok: {m.matched_skills.join(', ') || '-'}</div>
                    <div className="muted" style={{ fontSize: '12px' }}>Skill yang kurang: {m.missing_skills.join(', ') || '-'}</div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
