import { useState } from 'react';
import { api } from '../../utils/api.js';

export default function CompanyPostJob() {
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const { ok, data } = await api('/api/company/jobs', { method: 'POST', body });
    if (!ok || !data || !data.ok) {
      setMsg({ type: 'error', text: (data && data.error) || 'Gagal menyimpan' });
      return;
    }
    setMsg({ type: 'success', text: 'Lowongan disimpan.' });
    setTimeout(() => window.location.href = '/company', 700);
  }

  return (
    <section className="container section">
      <h1>Pasang Lowongan</h1>
      <form className="card" style={{ maxWidth: '760px' }} onSubmit={handleSubmit}>
        <div className="form-row"><label>Judul Lowongan</label><input name="title" required /></div>
        <div className="form-row"><label>Deskripsi</label><textarea name="description" rows="4"></textarea></div>
        <div className="form-row"><label>Persyaratan</label><textarea name="requirements" rows="3"></textarea></div>
        <div className="form-row"><label>Skill (pisah koma)</label><input name="skills" placeholder="python, sql, docker" /></div>
        <div className="form-grid cols-2">
          <div><label>Tipe</label><input name="employment_type" defaultValue="Full-time" /></div>
          <div><label>Min Pengalaman (tahun)</label><input name="min_experience" type="number" defaultValue="0" /></div>
        </div>
        <div className="form-grid cols-2">
          <div><label>Negara</label><input name="country" defaultValue="Indonesia" /></div>
          <div><label>Provinsi</label><input name="province" /></div>
        </div>
        <div className="form-grid cols-2">
          <div><label>Kota</label><input name="city" /></div>
          <div><label>Tipe Usia (min)</label><input name="min_age" type="number" /></div>
        </div>
        <div className="form-grid cols-2">
          <div><label>Tipe Usia (max)</label><input name="max_age" type="number" /></div>
          <div><label>Gaji Min</label><input name="salary_min" type="number" /></div>
        </div>
        <div className="form-row"><label>Gaji Max</label><input name="salary_max" type="number" /></div>
        {msg && <div className={`alert${msg.type === 'error' ? ' error' : ' success'}`}>{msg.text}</div>}
        <button className="btn" type="submit">Simpan</button>
      </form>
    </section>
  );
}
