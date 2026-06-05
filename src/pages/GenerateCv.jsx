import { useState, useEffect, useCallback } from 'react';

const LS_KEY = 'rumahkarir_cv_v1';

const SAMPLE = {
  template: 'modern', full_name: 'Andi Pratama', headline: 'Senior Backend Engineer',
  email: 'andi.pratama@example.com', phone: '+62 812 3456 7890', dob: '1996-04-15',
  nationality: 'Indonesia', address: 'Jakarta Selatan, DKI Jakarta, Indonesia',
  website: 'linkedin.com/in/andipratama', portfolio: 'github.com/andipratama',
  summary: 'Backend engineer dengan 6+ tahun pengalaman membangun sistem distribusi dengan Python, Go, dan AWS.',
  experience: [
    { role: 'Senior Backend Engineer', company: 'Tokopedia', start: '2022-01', end: 'Sekarang', location: 'Jakarta', body: '• Memimpin migrasi monolit ke microservices.\n• Membangun pipeline data real-time.' },
    { role: 'Backend Engineer', company: 'Bukalapak', start: '2019-03', end: '2021-12', location: 'Jakarta', body: '• Mengembangkan layanan pembayaran dengan Go.' }
  ],
  education: [{ school: 'Universitas Indonesia', degree: 'S1 Ilmu Komputer', start: '2014', end: '2018', gpa: '3.75 / 4.00', body: '' }],
  skills: 'Python, Go, PostgreSQL, Redis, Kafka, Docker, Kubernetes, AWS',
  languages: 'Bahasa Indonesia (Native), English (Professional)',
  certifications: 'AWS Certified Solutions Architect (2024)',
  references: 'Available upon request.', photoDataUrl: ''
};

const EMPTY = {
  template: 'modern', full_name: '', headline: '', email: '', phone: '', dob: '',
  nationality: '', address: '', website: '', portfolio: '', summary: '',
  experience: [{ role: '', company: '', start: '', end: '', location: '', body: '' }],
  education: [{ school: '', degree: '', start: '', end: '', gpa: '', body: '' }],
  skills: '', languages: '', certifications: '', references: '', photoDataUrl: ''
};

function loadState() {
  try { const r = localStorage.getItem(LS_KEY); if (r) return { ...EMPTY, ...JSON.parse(r) }; } catch (_) {}
  return { ...EMPTY };
}
function saveState(s) { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (_) {} }

function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtRange(s, e) { return [s, e].filter(Boolean).join(' – '); }
function listChips(t) { return (t||'').split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<span class="chip">${esc(s)}</span>`).join(''); }

function previewModern(state) {
  const photo = state.photoDataUrl ? `<img src="${state.photoDataUrl}" class="cv-avatar" alt="Foto" />` : `<div class="cv-avatar placeholder">Foto profil<br>(opsional)</div>`;
  const exp = (state.experience||[]).filter(e=>e.role||e.company).map(e=>`<div class="item"><div class="head"><span>${esc(e.role||'-')} · ${esc(e.company||'')}</span><span class="when">${esc(fmtRange(e.start,e.end))}</span></div>${e.location?`<div class="sub">${esc(e.location)}</div>`:''}<div class="body">${esc(e.body)}</div></div>`).join('');
  const edu = (state.education||[]).filter(e=>e.school||e.degree).map(e=>`<div class="item"><div class="head"><span>${esc(e.school||'-')}</span><span class="when">${esc(fmtRange(e.start,e.end))}</span></div>${e.degree?`<div class="sub">${esc(e.degree)}${e.gpa?' · IPK '+esc(e.gpa):''}</div>`:''}<div class="body">${esc(e.body)}</div></div>`).join('');
  return `<div class="cv-header">${photo}<div><div class="cv-name">${esc(state.full_name||'Nama Lengkap Anda')}</div><div class="cv-headline">${esc(state.headline||'Posisi / Headline')}</div><div class="cv-contact">${state.email?`<div>✉ ${esc(state.email)}</div>`:''}${state.phone?`<div>☎ ${esc(state.phone)}</div>`:''}${state.address?`<div>⌂ ${esc(state.address)}</div>`:''}${state.dob?`<div>★ ${esc(state.dob)}${state.nationality?' · '+esc(state.nationality):''}</div>`:''}${state.website?`<div>🌐 ${esc(state.website)}</div>`:''}${state.portfolio?`<div>⌥ ${esc(state.portfolio)}</div>`:''}</div></div></div>${state.summary?`<div class="cv-section"><h2>Ringkasan</h2><div class="body" style="white-space:pre-line;">${esc(state.summary)}</div></div>`:''}${exp?`<div class="cv-section"><h2>Pengalaman Kerja</h2>${exp}</div>`:''}${edu?`<div class="cv-section"><h2>Pendidikan</h2>${edu}</div>`:''}${state.skills?`<div class="cv-section"><h2>Skills</h2><div class="cv-skills">${listChips(state.skills)}</div></div>`:''}${state.languages?`<div class="cv-section"><h2>Bahasa</h2><div class="body" style="white-space:pre-line;">${esc(state.languages)}</div></div>`:''}${state.certifications?`<div class="cv-section"><h2>Sertifikasi &amp; Penghargaan</h2>${(state.certifications||'').split('\n').filter(Boolean).map(s=>`<div>• ${esc(s)}</div>`).join('')}</div>`:''}${state.references?`<div class="cv-section"><h2>Referensi</h2><div class="body">${esc(state.references)}</div></div>`:''}`;
}

function RowItem({ item, idx, fields, onUpdate, onRemove }) {
  return (
    <div className="row-item" data-idx={idx}>
      {fields.map(f => (
        <div key={f.key} className="form-row">
          <label>{f.label}</label>
          {f.type === 'textarea'
            ? <textarea data-key={f.key} rows={f.rows||3} placeholder={f.placeholder||''} value={item[f.key]||''} onChange={e => onUpdate(idx, f.key, e.target.value)} />
            : <input type={f.type||'text'} data-key={f.key} placeholder={f.placeholder||''} value={item[f.key]||''} onChange={e => onUpdate(idx, f.key, e.target.value)} />
          }
        </div>
      ))}
      <div className="row-actions"><button type="button" onClick={() => onRemove(idx)}>Hapus</button></div>
    </div>
  );
}

const EXP_FIELDS = [
  { key:'role', label:'Posisi' }, { key:'company', label:'Perusahaan' },
  { key:'start', label:'Mulai (mis: 2022-01)' }, { key:'end', label:'Selesai (mis: Sekarang)' },
  { key:'location', label:'Lokasi (opsional)' },
  { key:'body', label:'Pencapaian / deskripsi', type:'textarea', rows:4, placeholder:'Satu poin per baris.' }
];
const EDU_FIELDS = [
  { key:'school', label:'Sekolah / Universitas' }, { key:'degree', label:'Gelar / Jurusan' },
  { key:'start', label:'Mulai' }, { key:'end', label:'Selesai' },
  { key:'gpa', label:'IPK / GPA (opsional)' }, { key:'body', label:'Catatan (opsional)', type:'textarea', rows:2 }
];

export default function GenerateCv() {
  const [state, setState] = useState(() => loadState());

  const update = useCallback((key, val) => {
    setState(prev => { const next = {...prev, [key]: val}; saveState(next); return next; });
  }, []);

  const updateListItem = useCallback((list, idx, key, val) => {
    setState(prev => {
      const arr = [...(prev[list]||[])];
      arr[idx] = {...(arr[idx]||{}), [key]: val};
      const next = {...prev, [list]: arr};
      saveState(next);
      return next;
    });
  }, []);

  const addItem = useCallback((list, empty) => {
    setState(prev => { const next = {...prev, [list]: [...(prev[list]||[]), empty]}; saveState(next); return next; });
  }, []);

  const removeItem = useCallback((list, idx, empty) => {
    setState(prev => {
      let arr = (prev[list]||[]).filter((_,i)=>i!==idx);
      if (!arr.length) arr = [empty];
      const next = {...prev, [list]: arr}; saveState(next); return next;
    });
  }, []);

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4*1024*1024) { alert('Foto terlalu besar (maks 4 MB).'); return; }
    const reader = new FileReader();
    reader.onload = ev => update('photoDataUrl', ev.target.result);
    reader.readAsDataURL(file);
  }

  const previewHtml = previewModern(state);

  return (
    <section className="container section">
      <div className="section-title-row">
        <h2>Generate CV Standar Internasional</h2>
        <span className="meta-pill">Preview live · siap dicetak ke PDF</span>
      </div>

      <div className="builder-layout">
        <form className="builder-form" autoComplete="off" onSubmit={e => e.preventDefault()}>
          <h3>Template</h3>
          <div className="template-switch">
            <button type="button" className={state.template==='modern'?'active':''} onClick={()=>update('template','modern')}>Modern</button>
            <button type="button" className={state.template==='classic'?'active':''} onClick={()=>update('template','classic')}>Klasik</button>
          </div>

          <h3>Identitas</h3>
          <div className="form-row"><label>Foto Profil (opsional)</label><input type="file" id="cv-photo" accept="image/*" onChange={handlePhoto} /></div>
          <div className="form-row"><label>Nama Lengkap</label><input type="text" placeholder="Mis: Andi Pratama" value={state.full_name} onChange={e=>update('full_name',e.target.value)} /></div>
          <div className="form-row"><label>Posisi / Headline</label><input type="text" placeholder="Mis: Senior Backend Engineer" value={state.headline} onChange={e=>update('headline',e.target.value)} /></div>
          <div className="form-grid cols-2">
            <div className="form-row"><label>Email</label><input type="email" value={state.email} onChange={e=>update('email',e.target.value)} /></div>
            <div className="form-row"><label>Telepon</label><input type="text" value={state.phone} onChange={e=>update('phone',e.target.value)} /></div>
          </div>
          <div className="form-grid cols-2">
            <div className="form-row"><label>Tanggal Lahir</label><input type="date" value={state.dob} onChange={e=>update('dob',e.target.value)} /></div>
            <div className="form-row"><label>Kewarganegaraan</label><input type="text" placeholder="Indonesia" value={state.nationality} onChange={e=>update('nationality',e.target.value)} /></div>
          </div>
          <div className="form-row"><label>Alamat</label><input type="text" placeholder="Kota, Provinsi, Negara" value={state.address} onChange={e=>update('address',e.target.value)} /></div>
          <div className="form-grid cols-2">
            <div className="form-row"><label>LinkedIn / Website</label><input type="text" placeholder="linkedin.com/in/…" value={state.website} onChange={e=>update('website',e.target.value)} /></div>
            <div className="form-row"><label>GitHub / Portofolio</label><input type="text" value={state.portfolio} onChange={e=>update('portfolio',e.target.value)} /></div>
          </div>

          <h3>Ringkasan Profesional</h3>
          <div className="form-row"><textarea rows="4" placeholder="3-5 kalimat tentang pengalaman, keahlian utama, dan tujuan karir Anda." value={state.summary} onChange={e=>update('summary',e.target.value)} /></div>

          <h3>Pengalaman Kerja</h3>
          <div className="row-list">
            {(state.experience||[]).map((it,idx) => (
              <RowItem key={idx} item={it} idx={idx} fields={EXP_FIELDS}
                onUpdate={(i,k,v)=>updateListItem('experience',i,k,v)}
                onRemove={i=>removeItem('experience',i,{role:'',company:'',start:'',end:'',location:'',body:''})} />
            ))}
          </div>
          <button type="button" className="btn ghost small" style={{marginTop:'8px'}} onClick={()=>addItem('experience',{role:'',company:'',start:'',end:'',location:'',body:''})}>+ Tambah Pengalaman</button>

          <h3 style={{marginTop:'14px'}}>Pendidikan</h3>
          <div className="row-list">
            {(state.education||[]).map((it,idx) => (
              <RowItem key={idx} item={it} idx={idx} fields={EDU_FIELDS}
                onUpdate={(i,k,v)=>updateListItem('education',i,k,v)}
                onRemove={i=>removeItem('education',i,{school:'',degree:'',start:'',end:'',gpa:'',body:''})} />
            ))}
          </div>
          <button type="button" className="btn ghost small" style={{marginTop:'8px'}} onClick={()=>addItem('education',{school:'',degree:'',start:'',end:'',gpa:'',body:''})}>+ Tambah Pendidikan</button>

          <h3 style={{marginTop:'14px'}}>Skills</h3>
          <div className="form-row"><textarea rows="3" placeholder="Pisahkan dengan koma. Mis: Python, SQL, Docker, AWS" value={state.skills} onChange={e=>update('skills',e.target.value)} /></div>
          <h3>Bahasa</h3>
          <div className="form-row"><textarea rows="2" placeholder="Mis: Bahasa Indonesia (Native), English (Professional)" value={state.languages} onChange={e=>update('languages',e.target.value)} /></div>
          <h3>Sertifikasi / Penghargaan</h3>
          <div className="form-row"><textarea rows="3" placeholder="Satu item per baris." value={state.certifications} onChange={e=>update('certifications',e.target.value)} /></div>
          <h3>Referensi</h3>
          <div className="form-row"><textarea rows="2" placeholder="Mis: Available upon request" value={state.references} onChange={e=>update('references',e.target.value)} /></div>
        </form>

        <div className="builder-preview-wrap">
          <div className="builder-preview-toolbar">
            <button className="btn" type="button" onClick={()=>window.print()}>Cetak / Simpan PDF</button>
            <button className="btn ghost" type="button" onClick={()=>{ const s={...SAMPLE}; saveState(s); setState(s); }}>Isi Contoh</button>
            <button className="btn ghost" type="button" onClick={()=>{ if(confirm('Kosongkan semua data CV?')){ const s={...EMPTY}; saveState(s); setState(s); } }}>Reset</button>
            <span className="muted" style={{fontSize:'12.5px'}}>Perubahan tersimpan otomatis di browser ini.</span>
          </div>
          <div id="cv-preview" className={`doc-sheet cv-${state.template||'modern'}`} aria-label="Preview CV"
            dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </div>
    </section>
  );
}
