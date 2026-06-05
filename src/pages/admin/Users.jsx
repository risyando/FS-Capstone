import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../utils/api.js';

function EditModal({ user: u, onClose, onSaved }) {
  async function handleSubmit(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (!body.password) delete body.password;
    const { ok } = await api(`/api/admin/users/${u.id}`, { method: 'PUT', body });
    if (ok) { onSaved(); onClose(); } else alert('Gagal menyimpan');
  }
  return (
    <div className="modal">
      <h2>Edit User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row"><label>Nama</label><input name="full_name" defaultValue={u.full_name || ''} /></div>
        <div className="form-row"><label>Username</label><input name="username" defaultValue={u.username || ''} /></div>
        <div className="form-row"><label>Email</label><input name="email" type="email" defaultValue={u.email} /></div>
        <div className="form-row"><label>Tanggal Lahir</label><input name="birth_date" type="date" defaultValue={u.birth_date || ''} /></div>
        <div className="form-row"><label>Password baru (kosongkan jika tidak diubah)</label><input name="password" type="password" /></div>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="btn">Simpan</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminUsers() {
  const { setModalOpen, setModalContent } = useOutletContext();
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => { load(); }, []);

  async function load(query = q) {
    const { data } = await api('/api/admin/users?q=' + encodeURIComponent(query));
    setUsers(data?.items || []);
  }

  async function del(id) {
    if (!confirm('Hapus user ini?')) return;
    await api(`/api/admin/users/${id}`, { method: 'DELETE' });
    load();
  }

  function openEdit(u) {
    setModalContent(<EditModal user={u} onClose={() => setModalOpen(false)} onSaved={() => load()} />);
    setModalOpen(true);
  }

  return (
    <>
      <h1>Manage User</h1>
      <div className="toolbar">
        <input type="text" placeholder="Cari email / nama / username" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(q)} />
        <button className="btn ghost" onClick={() => load(q)}>🔍 Search</button>
      </div>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr><th>Foto</th><th>Nama</th><th>Username</th><th>Email</th><th>Tgl Lahir</th><th>Role</th><th>Verified</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.photo_path ? <img className="thumb" src={`/static/${u.photo_path}`} alt="" /> : '—'}</td>
                <td>{u.full_name || '-'}</td>
                <td>{u.username || '-'}</td>
                <td>{u.email}</td>
                <td>{u.birth_date || '-'}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>{u.is_verified ? <span className="badge ok">YES</span> : <span className="badge bad">NO</span>}</td>
                <td>
                  <button className="btn ghost small" onClick={() => openEdit(u)}>Edit</button>
                  {' '}
                  <button className="btn danger small" onClick={() => del(u.id)}>Hapus</button>
                </td>
              </tr>
            ))}
            {!users.length && <tr><td colSpan="8" className="muted" style={{ padding: '20px' }}>Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
