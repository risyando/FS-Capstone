import { useState } from 'react';
import { api } from '../utils/api.js';

export default function ShareExperience() {
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const { ok, data } = await api('/api/experiences', { method: 'POST', body });
    if (!ok || !data || !data.ok) {
      setMsg({ type: 'error', text: (data && data.error) || 'Gagal membagikan' });
      return;
    }
    setMsg({ type: 'success', text: 'Terima kasih! Cerita Anda telah dibagikan.' });
    setTimeout(() => window.location.href = '/', 1200);
  }

  return (
    <section className="container section">
      <h1>Bagikan Pengalaman Anda</h1>
      <p className="muted">Cerita Anda akan tampil di halaman utama dan menjadi inspirasi bagi pencari kerja lain.</p>
      <form id="exp-form" style={{ maxWidth: '600px' }} onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Judul (opsional)</label>
          <input name="title" type="text" maxLength="120" />
        </div>
        <div className="form-row">
          <label>Rating Pengalaman (1–5)</label>
          <select name="rating">
            <option value="5">★★★★★</option>
            <option value="4">★★★★☆</option>
            <option value="3">★★★☆☆</option>
            <option value="2">★★☆☆☆</option>
            <option value="1">★☆☆☆☆</option>
          </select>
        </div>
        <div className="form-row">
          <label>Cerita Anda</label>
          <textarea name="body" rows="6" required minLength="10" placeholder="Bagaimana pengalaman Anda menggunakan RUMAH KARIR?"></textarea>
        </div>
        {msg && <div className={`alert${msg.type === 'error' ? ' error' : ' success'}`}>{msg.text}</div>}
        <button className="btn" type="submit">Bagikan</button>
      </form>
    </section>
  );
}
