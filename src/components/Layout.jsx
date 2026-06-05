import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';

export default function Layout() {
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api('/api/auth/me').then(({ ok, data }) => {
      if (ok && data && data.user) setUser(data.user);
    });
  }, []);

  async function handleLogout() {
    await api('/api/auth/logout', { method: 'POST' });
    setUser(null);
    navigate('/');
  }

  return (
    <>
      <header className="site-header">
        <div className="inner">
          <Link className="brand" to="/">
            <img src="/img/logo.png" alt="RUMAH KARIR" style={{ height: '64px', width: 'auto', display: 'block' }} />
          </Link>
          <ul className="nav-links">
            <li><Link to="/">Beranda</Link></li>
            <li><Link to="/jobs">Cari Kerja</Link></li>
            <li><Link to="/cv">Upload CV</Link></li>
            <li><Link to="/generate-cv">Generate CV</Link></li>
            <li><Link to="/generate-cover-letter">Surat Lamaran</Link></li>
            <li><Link to="/share-experience">Pengalaman</Link></li>
            <li><Link to="/predict">Prediksi ML</Link></li>
            <li><Link to="/skill-gap">AI Career</Link></li>
          </ul>
          <div className="header-actions">
            {user ? (
              <>
                {user.role === 'admin' && <Link className="btn ghost" to="/admin">Dashboard</Link>}
                {user.role === 'company' && <Link className="btn ghost" to="/company">Dashboard</Link>}
                <button className="btn ghost" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn ghost" to="/register">Sign Up</Link>
                <Link className="btn" to="/login">Login</Link>
              </>
            )}
            <button className="hamburger" aria-label="Menu" type="button" onClick={() => setDrawerOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <aside className={`mobile-drawer${drawerOpen ? ' open' : ''}`} aria-label="Menu mobile">
        <button className="close-x" aria-label="Tutup menu" onClick={() => setDrawerOpen(false)}>&times;</button>
        <Link to="/" onClick={() => setDrawerOpen(false)}>Beranda</Link>
        <Link to="/jobs" onClick={() => setDrawerOpen(false)}>Cari Kerja</Link>
        <Link to="/cv" onClick={() => setDrawerOpen(false)}>Upload CV</Link>
        <Link to="/generate-cv" onClick={() => setDrawerOpen(false)}>Generate CV</Link>
        <Link to="/generate-cover-letter" onClick={() => setDrawerOpen(false)}>Generate Surat Lamaran</Link>
        <Link to="/share-experience" onClick={() => setDrawerOpen(false)}>Bagikan Pengalaman</Link>
        <Link to="/predict" onClick={() => setDrawerOpen(false)}>Prediksi ML</Link>
        <Link to="/skill-gap" onClick={() => setDrawerOpen(false)}>AI Career</Link>
        {user ? (
          <>
            {user.role === 'admin' && <Link to="/admin" onClick={() => setDrawerOpen(false)}>Dashboard Admin</Link>}
            {user.role === 'company' && <Link to="/company" onClick={() => setDrawerOpen(false)}>Dashboard Perusahaan</Link>}
            <button
              onClick={() => { setDrawerOpen(false); handleLogout(); }}
              style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: '600', padding: '12px 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', width: '100%' }}
            >Logout</button>
          </>
        ) : (
          <>
            <Link to="/register" onClick={() => setDrawerOpen(false)}>Sign Up</Link>
            <Link to="/login" onClick={() => setDrawerOpen(false)}>Login</Link>
          </>
        )}
      </aside>

      <main>
        <Outlet context={{ user, setUser }} />
      </main>

      <footer className="site-footer">
        <div className="inner">
          <div>
            <img src="/img/logo.png" alt="RUMAH KARIR" style={{ height: '52px', width: 'auto', opacity: .9 }} />
            <div style={{ fontSize: '13px', opacity: .8, marginTop: '6px' }}>
              Platform pencarian kerja dengan pencocokan otomatis berdasarkan CV.
            </div>
          </div>
          <div style={{ fontSize: '13px', opacity: .8 }}>
            © RUMAH KARIR. Untuk keperluan demo.
          </div>
        </div>
      </footer>
    </>
  );
}
