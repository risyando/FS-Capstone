import { useState } from 'react';
import { api } from '../utils/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const { ok, data } = await api('/api/auth/login', { method: 'POST', body: { email: email.trim(), password } });
    if (!ok || !data || !data.ok) {
      setMsg({ type: 'error', text: (data && data.error) || 'Login gagal' });
      return;
    }
    window.location.href = data.redirect || '/';
  }

  return (
    <div className="container">
      <div className="auth-card">
        <h1>Login</h1>
        <p className="muted" style={{ marginTop: '-12px' }}>Masuk untuk membuka semua fitur RUMAH KARIR.</p>
        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Masukkan email Anda" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {msg && <div className={`alert${msg.type === 'error' ? ' error' : ' success'}`}>{msg.text}</div>}
          <button className="btn" type="submit" style={{ width: '100%' }}>Masuk</button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: '14px' }}>
          Belum punya akun? <a href="/register">Daftar di sini</a>
        </p>
        <p className="muted" style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px' }}>
          Admin: gunakan email <code>admin@admin.com</code>
        </p>
      </div>
    </div>
  );
}
