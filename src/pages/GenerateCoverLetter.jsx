import { useState, useCallback } from 'react';

const LS_KEY = 'rumahkarir_letter_v1';

const EMPTY = {
  template: 'id', applicant_name: '', applicant_address: '', applicant_email: '', applicant_phone: '',
  letter_place_date: '', enclosure_count: '', subject: '', recipient_name: '', company_name: '',
  company_address: '', position: '', source: '', body: '', attachments: ''
};

const SAMPLE = {
  template: 'id', applicant_name: 'Andi Pratama',
  applicant_address: 'Jl. Sudirman No. 1, Jakarta Selatan 12190',
  applicant_email: 'andi.pratama@example.com', applicant_phone: '+62 812 3456 7890',
  letter_place_date: 'Jakarta, 18 Mei 2026', enclosure_count: '1 (satu) berkas',
  subject: 'Lamaran Pekerjaan Senior Backend Engineer', recipient_name: 'HRD Manager',
  company_name: 'PT Contoh Indonesia', company_address: 'Jl. MH Thamrin No. 10, Jakarta Pusat 10350',
  position: 'Senior Backend Engineer', source: 'RUMAH KARIR',
  body: 'Saya memiliki pengalaman 6 tahun mengembangkan layanan backend dengan Python dan Go.\n\nSaya tertarik bergabung di PT Contoh Indonesia karena fokus perusahaan pada produk yang berdampak luas.\n\nBesar harapan saya untuk diberi kesempatan wawancara guna mendiskusikan kontribusi yang dapat saya berikan.',
  attachments: 'Curriculum Vitae\nFotokopi KTP\nFotokopi Ijazah & Transkrip\nPas foto 4x6\nSertifikat Pendukung'
};

function loadState() {
  try { const r = localStorage.getItem(LS_KEY); if (r) return { ...EMPTY, ...JSON.parse(r) }; } catch (_) {}
  return { ...EMPTY };
}
function saveState(s) { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (_) {} }

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function bodyOrDefault(state) {
  if (state.body && state.body.trim()) return state.body;
  const pos = state.position || 'posisi yang Bapak/Ibu tawarkan';
  return `Dengan hormat,\n\nBerdasarkan informasi lowongan ${pos} yang saya peroleh${state.source ? ' dari ' + state.source : ''}, dengan ini saya bermaksud mengajukan lamaran kerja pada perusahaan yang Bapak/Ibu pimpin.\n\nSaya yakin pengalaman dan keahlian saya relevan dengan posisi tersebut. Bersama surat ini saya lampirkan berkas pendukung untuk bahan pertimbangan Bapak/Ibu.`;
}

function attachsList(s) { return (s || '').split('\n').map(x => x.trim()).filter(Boolean); }

function previewIndonesia(state) {
  const atts = attachsList(state.attachments);
  const attsHtml = atts.length
    ? `<div class="enclosures"><strong>Berkas terlampir:</strong><ul>${atts.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>`
    : '';
  return `
    <div class="header-id">
      <div class="left">
        ${state.enclosure_count ? `<div>Lampiran : ${esc(state.enclosure_count)}</div>` : ''}
        ${state.subject ? `<div>Hal&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>${esc(state.subject)}</strong></div>` : ''}
      </div>
      <div class="right">${esc(state.letter_place_date || '')}</div>
    </div>
    <div class="recipient">
      Kepada Yth.,<br>
      <span class="name">${esc(state.recipient_name || 'HRD Manager')}</span><br>
      ${esc(state.company_name || 'Nama Perusahaan')}<br>
      ${esc(state.company_address || '')}
    </div>
    <div class="salutation">Dengan hormat,</div>
    <div class="body-text">
      Yang bertanda tangan di bawah ini:<br>
      <table style="border-collapse:collapse;margin:8px 0 14px;">
        <tr><td style="padding:1px 14px 1px 0;">Nama</td><td>: ${esc(state.applicant_name || '-')}</td></tr>
        <tr><td style="padding:1px 14px 1px 0;">Alamat</td><td>: ${esc(state.applicant_address || '-')}</td></tr>
        <tr><td style="padding:1px 14px 1px 0;">Email</td><td>: ${esc(state.applicant_email || '-')}</td></tr>
        <tr><td style="padding:1px 14px 1px 0;">Telepon</td><td>: ${esc(state.applicant_phone || '-')}</td></tr>
      </table>
      bermaksud mengajukan lamaran kerja untuk posisi <strong>${esc(state.position || '-')}</strong>${state.source ? ' yang saya peroleh dari ' + esc(state.source) : ''} di ${esc(state.company_name || 'perusahaan yang Bapak/Ibu pimpin')}.

      ${esc(bodyOrDefault(state))}

      Demikian surat lamaran ini saya buat dengan sebenar-benarnya. Atas perhatian dan kesempatan yang diberikan, saya mengucapkan terima kasih.
    </div>
    <div class="closing">Hormat saya,</div>
    <div class="signature">${esc(state.applicant_name || '')}</div>
    ${attsHtml}
  `;
}

function previewIntl(state) {
  const atts = attachsList(state.attachments);
  const attsHtml = atts.length
    ? `<div class="enclosures"><strong>Enclosures:</strong><ul>${atts.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>`
    : '';
  return `
    <div class="applicant">
      <div class="name">${esc(state.applicant_name || 'Your Name')}</div>
      <div class="meta">${esc(state.applicant_address || '')}</div>
      <div class="meta">${[state.applicant_email, state.applicant_phone].filter(Boolean).map(esc).join(' · ')}</div>
    </div>
    <div class="date-line">${esc(state.letter_place_date || '')}</div>
    <div class="recipient">
      <div class="name">${esc(state.recipient_name || 'Hiring Manager')}</div>
      <div>${esc(state.company_name || 'Company Name')}</div>
      <div>${esc(state.company_address || '')}</div>
    </div>
    ${state.subject ? `<div class="subject">Re: ${esc(state.subject)}</div>` : ''}
    <div class="salutation">Dear ${esc(state.recipient_name || 'Hiring Manager')},</div>
    <div class="body-text">
      I am writing to apply for the <strong>${esc(state.position || '—')}</strong> position at ${esc(state.company_name || 'your company')}${state.source ? ', which I learned about through ' + esc(state.source) : ''}.

      ${esc(bodyOrDefault(state))}

      I would welcome the opportunity to discuss how my background can support your team. Thank you for your time and consideration.
    </div>
    <div class="closing">Sincerely,</div>
    <div class="signature">${esc(state.applicant_name || '')}</div>
    ${attsHtml}
  `;
}

function Field({ label, children }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      {children}
    </div>
  );
}

export default function GenerateCoverLetter() {
  const [state, setState] = useState(() => loadState());

  const update = useCallback((key, val) => {
    setState(prev => {
      const next = { ...prev, [key]: val };
      saveState(next);
      return next;
    });
  }, []);

  const previewHtml = state.template === 'intl' ? previewIntl(state) : previewIndonesia(state);

  return (
    <section className="container section">
      <div className="section-title-row">
        <h2>Generate Surat Lamaran</h2>
        <span className="meta-pill">Indonesia &amp; Internasional · siap dicetak</span>
      </div>

      <div className="builder-layout">
        <form className="builder-form" autoComplete="off" onSubmit={e => e.preventDefault()}>

          {/* Template */}
          <h3>Template</h3>
          <div className="template-switch">
            <button type="button" className={state.template === 'id' ? 'active' : ''} onClick={() => update('template', 'id')}>Indonesia</button>
            <button type="button" className={state.template === 'intl' ? 'active' : ''} onClick={() => update('template', 'intl')}>Internasional</button>
          </div>

          {/* Data Pelamar */}
          <h3>Data Pelamar</h3>
          <Field label="Nama Lengkap">
            <input type="text" placeholder="Andi Pratama" value={state.applicant_name} onChange={e => update('applicant_name', e.target.value)} />
          </Field>
          <Field label="Alamat">
            <textarea rows="2" placeholder="Jl. Sudirman No. 1, Jakarta Selatan 12190" value={state.applicant_address} onChange={e => update('applicant_address', e.target.value)} />
          </Field>
          <div className="form-grid cols-2">
            <Field label="Email">
              <input type="email" value={state.applicant_email} onChange={e => update('applicant_email', e.target.value)} />
            </Field>
            <Field label="Telepon">
              <input type="text" value={state.applicant_phone} onChange={e => update('applicant_phone', e.target.value)} />
            </Field>
          </div>
          <div className="form-grid cols-2">
            <Field label="Tempat &amp; Tanggal Surat">
              <input type="text" placeholder="Jakarta, 18 Mei 2026" value={state.letter_place_date} onChange={e => update('letter_place_date', e.target.value)} />
            </Field>
            <Field label="Lampiran (opsional)">
              <input type="text" placeholder="Mis: 1 (satu) berkas" value={state.enclosure_count} onChange={e => update('enclosure_count', e.target.value)} />
            </Field>
          </div>
          <Field label="Hal / Subject">
            <input type="text" placeholder="Lamaran Pekerjaan Senior Backend Engineer" value={state.subject} onChange={e => update('subject', e.target.value)} />
          </Field>

          {/* Penerima */}
          <h3>Penerima</h3>
          <Field label="Yth. (Nama / Jabatan)">
            <input type="text" placeholder="HRD Manager" value={state.recipient_name} onChange={e => update('recipient_name', e.target.value)} />
          </Field>
          <Field label="Nama Perusahaan">
            <input type="text" placeholder="PT Contoh Indonesia" value={state.company_name} onChange={e => update('company_name', e.target.value)} />
          </Field>
          <Field label="Alamat Perusahaan">
            <textarea rows="2" placeholder="Jl. MH Thamrin No. 10, Jakarta Pusat" value={state.company_address} onChange={e => update('company_address', e.target.value)} />
          </Field>

          {/* Detail Lamaran */}
          <h3>Detail Lamaran</h3>
          <Field label="Posisi yang dilamar">
            <input type="text" placeholder="Senior Backend Engineer" value={state.position} onChange={e => update('position', e.target.value)} />
          </Field>
          <Field label="Sumber Lowongan (opsional)">
            <input type="text" placeholder="RUMAH KARIR, LinkedIn, dll." value={state.source} onChange={e => update('source', e.target.value)} />
          </Field>

          {/* Profil Singkat */}
          <h3>Profil Singkat</h3>
          <p className="muted" style={{ fontSize: '12.5px', marginTop: '-6px' }}>
            Tuliskan 1-3 paragraf alasan Anda cocok. Bila dikosongkan, akan dipakai paragraf default.
          </p>
          <div className="form-row">
            <textarea rows="6" placeholder="Saya memiliki 6 tahun pengalaman sebagai Backend Engineer …" value={state.body} onChange={e => update('body', e.target.value)} />
          </div>

          {/* Berkas Terlampir */}
          <h3>Berkas Terlampir</h3>
          <div className="form-row">
            <textarea rows="3" placeholder={"Satu item per baris. Mis:\nCurriculum Vitae\nFotokopi KTP\nPas foto 4x6"} value={state.attachments} onChange={e => update('attachments', e.target.value)} />
          </div>

        </form>

        {/* Preview */}
        <div className="builder-preview-wrap">
          <div className="builder-preview-toolbar">
            <button className="btn" type="button" onClick={() => window.print()}>Cetak / Simpan PDF</button>
            <button className="btn ghost" type="button" onClick={() => { setState(SAMPLE); saveState(SAMPLE); }}>Isi Contoh</button>
            <button className="btn ghost" type="button" onClick={() => { if (confirm('Kosongkan semua data surat lamaran?')) { setState(EMPTY); saveState(EMPTY); } }}>Reset</button>
            <span className="muted" style={{ fontSize: '12.5px' }}>Data tersimpan otomatis di browser ini.</span>
          </div>
          <div
            id="letter-preview"
            className={`doc-sheet letter ${state.template === 'intl' ? 'letter-intl' : 'letter-id'}`}
            aria-label="Preview Surat Lamaran"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </section>
  );
}
