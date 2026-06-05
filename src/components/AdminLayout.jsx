import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import '../dashboard.css';

export default function AdminLayout({ active }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  return (
    <div className="dash">
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar">
        <div className="brand" style={{ padding: '12px 16px' }}>
          <img src="/img/logo.png" alt="RUMAH KARIR" style={{ height: '56px', width: 'auto', display: 'block' }} />
          <span style={{ fontSize: '10px', opacity: .6, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>ADMIN PANEL</span>
        </div>
        <nav>
          <Link to="/admin" className={active === 'dashboard' ? 'active' : ''}>📊 Dashboard</Link>
          <Link to="/admin/companies" className={active === 'companies' ? 'active' : ''}>🏢 Perusahaan</Link>
          <Link to="/admin/jobs" className={active === 'jobs' ? 'active' : ''}>📝 Lowongan</Link>
          <Link to="/admin/approvals" className={active === 'approvals' ? 'active' : ''}>✅ Approval Perusahaan</Link>
          <Link to="/admin/users" className={active === 'users' ? 'active' : ''}>👥 Manage User</Link>
          <Link to="/admin/partners" className={active === 'partners' ? 'active' : ''}>🤝 Kerja Sama</Link>
          <Link to="/admin/experiences" className={active === 'experiences' ? 'active' : ''}>💬 Pengalaman</Link>
          <Link to="/admin/maintenance" className={active === 'maintenance' ? 'active' : ''}>🛠️ Maintenance</Link>
          <Link to="/" style={{ marginTop: '18px', borderTop: '1px solid #333', paddingTop: '18px' }}>↩︎ Kembali ke Situs</Link>
          <a href="/api/auth/logout" onClick={async e => { e.preventDefault(); await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); window.location.href = '/'; }}>Logout</a>
        </nav>
      </aside>

      <div>
        <div className="mobile-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/img/logo.png" alt="RUMAH KARIR" style={{ height: '44px', width: 'auto' }} />
            <span style={{ fontWeight: '700', fontSize: '13px' }}>Admin</span>
          </div>
          <button className="hamburger" type="button" onClick={() => setSidebarOpen(o => !o)}>☰</button>
        </div>
        <main>
          <Outlet context={{ setModalOpen, setModalContent }} />
        </main>
      </div>

      {/* Modal backdrop - shared by child pages via context */}
      <div className={`modal-backdrop${modalOpen ? ' open' : ''}`} id="modal-root" onClick={e => { if (e.target.id === 'modal-root') setModalOpen(false); }}>
        {modalContent}
      </div>
    </div>
  );
}
