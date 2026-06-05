import { useState } from 'react';

export default function Register() {
  const [role, setRole] = useState('user');
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/register', { method: 'POST', body: fd, credentials: 'same-origin' });
    let data = null; try { data = await res.json(); } catch (_) {}
    if (!res.ok || !data || !data.ok) {
      setMsg([{ type: 'error', text: (data && data.error) || 'Pendaftaran gagal' }]);
      return;
    }
    const msgs = [{ type: 'success', text: data.message }];
    let delay = 800;
    if (data.otp_sent_via_smtp === false) {
      const notice = data.dev_otp_notice || 'OTP tidak terkirim lewat email — SMTP belum dikonfigurasi.';
      msgs.push({ type: 'error', text: notice });
      if (data.dev_otp) msgs.push({ type: 'info', text: `Kode OTP dev: ${data.dev_otp}` });
      delay = 4000;
    }
    setMsg(msgs);
    if (data.email) {
      let url = '/verify-otp?email=' + encodeURIComponent(data.email);
      if (data.dev_otp) url += '&otp=' + encodeURIComponent(data.dev_otp);
      setTimeout(() => { window.location.href = url; }, delay);
    }
  }

  return (
    <div className="container">
      <div className="auth-card">
        <h1>Buat Akun</h1>
        <p className="muted" style={{ marginTop: '-12px' }}>Daftar sebagai pengguna untuk mencari kerja, atau sebagai perusahaan untuk memasang lowongan.</p>
        <div className="auth-toggle" role="tablist">
          <button type="button" className={role === 'user' ? 'active' : ''} onClick={() => setRole('user')}>Sebagai Pengguna</button>
          <button type="button" className={role === 'company' ? 'active' : ''} onClick={() => setRole('company')}>Sebagai Perusahaan</button>
        </div>
        <form id="reg-form" encType="multipart/form-data" onSubmit={handleSubmit}>
          <input type="hidden" name="role" value={role} />

          {role === 'user' && (
            <div id="user-fields">
              <div className="form-row">
                <label>Nama Lengkap (asli)</label>
                <input name="full_name" type="text" required />
              </div>
              <div className="form-grid cols-2">
                <div>
                  <label>Tanggal Lahir</label>
                  <input name="birth_date" type="date" required />
                </div>
                <div>
                  <label>Username (opsional)</label>
                  <input name="username" type="text" />
                </div>
              </div>
              <div className="form-row">
                <label>Foto Profil</label>
                <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" required />
              </div>
            </div>
          )}

          {role === 'company' && (
            <div id="company-fields">
              <div className="form-row">
                <label>Nama Perusahaan</label>
                <input name="company_name" type="text" required />
              </div>
              <div className="form-grid cols-2">
                <div><label>Industri</label><input name="industry" type="text" placeholder="e.g. E-commerce" required /></div>
                <div><label>Website</label><input name="website" type="text" placeholder="https://..." /></div>
              </div>
              <div className="form-grid cols-2">
                <div><label>Provinsi</label><input name="province" type="text" /></div>
                <div><label>Kota</label><input name="city" type="text" required /></div>
              </div>
              <div className="form-row"><label>Alamat</label><input name="address" type="text" /></div>
              <div className="form-row"><label>Deskripsi singkat perusahaan</label><textarea name="description" rows="3"></textarea></div>
              <div className="form-row"><label>Logo (opsional)</label><input name="logo" type="file" accept="image/png,image/jpeg,image/webp" /></div>
            </div>
          )}

          <div className="form-row"><label>Email</label><input name="email" type="email" required /></div>
          <div className="form-row"><label>Password (min 6 karakter)</label><input name="password" type="password" minLength="6" required /></div>
          {msg && msg.map((m, i) => (
            <div key={i} className={`alert${m.type === 'error' ? ' error' : m.type === 'success' ? ' success' : ''}`}
              style={m.type === 'info' ? { marginTop: '8px' } : { marginTop: '8px' }}>
              {m.type === 'info' ? <><strong style={{ fontSize: '18px', letterSpacing: '3px' }}>{m.text.replace('Kode OTP dev: ', '')}</strong></> : m.text}
            </div>
          ))}
          <button className="btn" type="submit" style={{ width: '100%' }}>Daftar</button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: '14px' }}>
          Sudah punya akun? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
