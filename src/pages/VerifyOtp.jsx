import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

export default function VerifyOtp() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('email')) setEmail(params.get('email'));
    if (params.get('otp')) setCode(params.get('otp'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsgs([]);
    const { ok, data } = await api('/api/auth/verify-otp', { method: 'POST', body: { email: email.trim(), code: code.trim() } });
    if (!ok || !data || !data.ok) {
      setMsgs([{ type: 'error', text: (data && data.error) || 'Verifikasi gagal' }]);
      return;
    }
    setMsgs([{ type: 'success', text: data.message }]);
    setTimeout(() => window.location.href = '/login', 800);
  }

  async function handleResend() {
    setMsgs([]);
    const { data } = await api('/api/auth/resend-otp', { method: 'POST', body: { email: email.trim() } });
    if (!data || !data.ok) {
      setMsgs([{ type: 'error', text: (data && data.error) || 'Gagal mengirim ulang' }]);
      return;
    }
    if (data.otp_sent_via_smtp === false) {
      const notice = data.dev_otp_notice || 'OTP tidak terkirim lewat email — SMTP belum dikonfigurasi.';
      const m = [{ type: 'error', text: notice }];
      if (data.dev_otp) { setCode(data.dev_otp); m.push({ type: 'info', text: `Kode OTP dev: ${data.dev_otp}` }); }
      setMsgs(m);
    } else {
      setMsgs([{ type: 'success', text: 'Kode OTP baru dikirim ke email Anda.' }]);
    }
  }

  return (
    <div className="container">
      <div className="auth-card">
        <h1>Verifikasi OTP</h1>
        <p className="muted" style={{ marginTop: '-12px' }}>Masukkan kode 6 digit yang dikirim ke email Anda. Kode berlaku 10 menit.</p>
        <form id="otp-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Kode OTP</label>
            <input id="code" type="text" inputMode="numeric" maxLength="6" pattern="[0-9]{6}" required value={code} onChange={e => setCode(e.target.value)} />
          </div>
          {msgs.map((m, i) => (
            <div key={i} className={`alert${m.type === 'error' ? ' error' : m.type === 'success' ? ' success' : ''}`} style={{ marginTop: '8px' }}>
              {m.type === 'info' ? <strong style={{ fontSize: '18px', letterSpacing: '3px' }}>{m.text}</strong> : m.text}
            </div>
          ))}
          <button className="btn" type="submit" style={{ width: '100%' }}>Verifikasi</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '12px' }}>
          <button className="btn ghost small" type="button" onClick={handleResend}>Kirim ulang OTP</button>
        </p>
      </div>
    </div>
  );
}
