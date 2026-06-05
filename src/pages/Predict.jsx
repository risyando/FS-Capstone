import { useState } from 'react';
import { api } from '../utils/api.js';

const INITIAL = {
  age: '',
  job: '',
  marital: '',
  education: '',
  default: '',
  housing: '',
  loan: '',
  contact: '',
  month: '',
  day_of_week: '',
  duration: '',
  campaign: '',
  previous: '',
  poutcome: '',
  'emp.var.rate': '',
  'cons.price.idx': '',
  'cons.conf.idx': '',
  euribor3m: '',
  'nr.employed': '',
};

const JOBS = [
  'admin.','blue-collar','entrepreneur','housemaid',
  'management','retired','self-employed','services',
  'student','technician','unemployed','unknown',
];
const MARITAL = ['divorced','married','single','unknown'];
const EDUCATION = [
  'basic.4y','basic.6y','basic.9y','high.school',
  'illiterate','professional.course','university.degree','unknown',
];
const YES_NO_UNK = ['no','yes','unknown'];
const CONTACT   = ['cellular','telephone'];
const MONTHS    = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const DAYS      = ['mon','tue','wed','thu','fri'];
const POUTCOME  = ['failure','nonexistent','success'];

function Field({ label, hint, children }) {
  return (
    <div className="pred-field">
      <label style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4, display: 'block' }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 12, marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Sel({ name, options, value, onChange }) {
  return (
    <select name={name} value={value} onChange={onChange} required>
      <option value="">— pilih —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Num({ name, value, onChange, placeholder, step = 1 }) {
  return (
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      required
    />
  );
}

export default function Predict() {
  const [form, setForm]     = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');

    // Convert numeric fields
    const payload = { ...form };
    const numFields = ['age','duration','campaign','previous','emp.var.rate','cons.price.idx','cons.conf.idx','euribor3m','nr.employed'];
    for (const k of numFields) payload[k] = payload[k] === '' ? 0 : Number(payload[k]);

    const { ok, data } = await api('/api/predict', { method: 'POST', body: payload });
    setLoading(false);

    if (!ok || !data) { setError('Gagal menghubungi server.'); return; }
    if (data.error)   { setError(data.error); return; }
    setResult(data.prediction);
  }

  const subscribed = result === '1' || result === 1;
  const predicted  = result !== null;

  return (
    <div className="predict-page">
      {/* ── Hero ── */}
      <section className="pred-hero">
        <div className="container">
          <div className="pred-badge">🏦 Bank Marketing ML</div>
          <h1 className="pred-title">Prediksi Berlangganan Deposito</h1>
          <p className="pred-sub">
            Masukkan data nasabah berdasarkan kampanye pemasaran bank.
            Model machine learning akan memprediksi apakah nasabah akan
            berlangganan deposito berjangka.
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="pred-layout">

          {/* ── Form ── */}
          <form className="pred-form card" onSubmit={handleSubmit}>

            {/* === Data Pribadi === */}
            <div className="pred-section-label">👤 Data Pribadi Nasabah</div>
            <div className="pred-grid">
              <Field label="Usia (age)" hint="tahun">
                <Num name="age" value={form.age} onChange={handleChange} placeholder="cth: 35" />
              </Field>
              <Field label="Pekerjaan (job)">
                <Sel name="job" options={JOBS} value={form.job} onChange={handleChange} />
              </Field>
              <Field label="Status Pernikahan (marital)">
                <Sel name="marital" options={MARITAL} value={form.marital} onChange={handleChange} />
              </Field>
              <Field label="Pendidikan (education)">
                <Sel name="education" options={EDUCATION} value={form.education} onChange={handleChange} />
              </Field>
              <Field label="Kredit Macet (default)" hint="punya riwayat default?">
                <Sel name="default" options={YES_NO_UNK} value={form.default} onChange={handleChange} />
              </Field>
              <Field label="Kredit Rumah (housing)">
                <Sel name="housing" options={YES_NO_UNK} value={form.housing} onChange={handleChange} />
              </Field>
              <Field label="Pinjaman Pribadi (loan)">
                <Sel name="loan" options={YES_NO_UNK} value={form.loan} onChange={handleChange} />
              </Field>
            </div>

            {/* === Kontak Kampanye === */}
            <div className="pred-section-label" style={{ marginTop: 28 }}>📞 Detail Kontak Kampanye</div>
            <div className="pred-grid">
              <Field label="Metode Kontak (contact)">
                <Sel name="contact" options={CONTACT} value={form.contact} onChange={handleChange} />
              </Field>
              <Field label="Bulan Kontak (month)">
                <Sel name="month" options={MONTHS} value={form.month} onChange={handleChange} />
              </Field>
              <Field label="Hari Kontak (day_of_week)">
                <Sel name="day_of_week" options={DAYS} value={form.day_of_week} onChange={handleChange} />
              </Field>
              <Field label="Durasi Panggilan (duration)" hint="detik">
                <Num name="duration" value={form.duration} onChange={handleChange} placeholder="cth: 180" />
              </Field>
              <Field label="Jumlah Kontak Kampanye Ini (campaign)">
                <Num name="campaign" value={form.campaign} onChange={handleChange} placeholder="cth: 2" />
              </Field>
              <Field label="Kontak Kampanye Sebelumnya (previous)">
                <Num name="previous" value={form.previous} onChange={handleChange} placeholder="cth: 0" />
              </Field>
              <Field label="Hasil Kampanye Sebelumnya (poutcome)">
                <Sel name="poutcome" options={POUTCOME} value={form.poutcome} onChange={handleChange} />
              </Field>
            </div>

            {/* === Indikator Ekonomi === */}
            <div className="pred-section-label" style={{ marginTop: 28 }}>📈 Indikator Sosial &amp; Ekonomi</div>
            <div className="pred-grid">
              <Field label="emp.var.rate" hint="Employment Variation Rate">
                <Num name="emp.var.rate" value={form['emp.var.rate']} onChange={handleChange} placeholder="cth: 1.1" step="0.01" />
              </Field>
              <Field label="cons.price.idx" hint="Consumer Price Index">
                <Num name="cons.price.idx" value={form['cons.price.idx']} onChange={handleChange} placeholder="cth: 93.994" step="0.001" />
              </Field>
              <Field label="cons.conf.idx" hint="Consumer Confidence Index">
                <Num name="cons.conf.idx" value={form['cons.conf.idx']} onChange={handleChange} placeholder="cth: -36.4" step="0.1" />
              </Field>
              <Field label="euribor3m" hint="Euribor 3 Month Rate">
                <Num name="euribor3m" value={form.euribor3m} onChange={handleChange} placeholder="cth: 4.857" step="0.001" />
              </Field>
              <Field label="nr.employed" hint="Number of Employees">
                <Num name="nr.employed" value={form['nr.employed']} onChange={handleChange} placeholder="cth: 5191" step="0.1" />
              </Field>
            </div>

            {error && <div className="alert error" style={{ marginTop: 16 }}>{error}</div>}

            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{ marginTop: 24, width: '100%', justifyContent: 'center', fontSize: 16, padding: '13px 24px' }}
            >
              {loading ? (
                <><span className="pred-spinner" /> Memproses…</>
              ) : (
                <><span>🔮</span> Prediksi Sekarang</>
              )}
            </button>
          </form>

          {/* ── Result Panel ── */}
          <div className="pred-result-wrap">
            <div className={`pred-result-card${predicted ? ' visible' : ''} ${predicted ? (subscribed ? 'yes' : 'no') : ''}`}>
              {!predicted ? (
                <>
                  <div className="pred-result-icon idle">🤖</div>
                  <div className="pred-result-label">Hasil Prediksi</div>
                  <p className="pred-result-hint">Isi form di sebelah kiri dan klik <strong>Prediksi Sekarang</strong> untuk melihat hasilnya.</p>
                  <div className="pred-features-list">
                    {[
                      '19 fitur input','Random Forest model','Bank Marketing dataset','Sklearn Pipeline',
                    ].map(t => (
                      <span key={t} className="pred-feat-chip">{t}</span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className={`pred-result-icon ${subscribed ? 'yes' : 'no'}`}>
                    {subscribed ? '✅' : '❌'}
                  </div>
                  <div className="pred-result-label">
                    {subscribed ? 'AKAN BERLANGGANAN' : 'TIDAK BERLANGGANAN'}
                  </div>
                  <p className="pred-result-hint">
                    {subscribed
                      ? 'Model memprediksi nasabah ini kemungkinan besar akan berlangganan deposito berjangka.'
                      : 'Model memprediksi nasabah ini kemungkinan besar tidak akan berlangganan deposito berjangka.'}
                  </p>
                  <div className={`pred-result-badge ${subscribed ? 'yes' : 'no'}`}>
                    Prediksi: <strong>{result}</strong>
                  </div>
                  <button
                    className="btn ghost"
                    style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
                    onClick={() => { setResult(null); setError(''); }}
                  >
                    🔄 Coba Lagi
                  </button>
                </>
              )}
            </div>

            {/* Info card */}
            <div className="card" style={{ marginTop: 16, fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-strong)' }}>ℹ️ Tentang Model</div>
              <p className="muted" style={{ margin: 0 }}>
                Model ini dilatih menggunakan <strong>Bank Marketing Dataset</strong> dari UCI.
                Target prediksi adalah apakah nasabah akan berlangganan (<code>y=1</code>) atau
                tidak berlangganan (<code>y=0</code>) deposito berjangka setelah dihubungi
                oleh tim pemasaran bank.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .predict-page { min-height: 100vh; }

        .pred-hero {
          padding: 64px 0 48px;
          background: radial-gradient(60% 60% at 50% 0%, rgba(180,200,255,0.07) 0%, transparent 70%);
          border-bottom: 1px solid var(--border);
          margin-bottom: 40px;
        }
        .pred-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 4px 14px;
          font-size: 12px;
          font-weight: 700;
          color: var(--muted);
          letter-spacing: .5px;
          margin-bottom: 18px;
          text-transform: uppercase;
        }
        .pred-title {
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 800;
          letter-spacing: -.02em;
          background: linear-gradient(180deg, #fff 0%, #b0bcd0 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin: 0 0 12px;
        }
        .pred-sub {
          color: var(--muted);
          font-size: 16px;
          max-width: 620px;
          margin: 0;
          line-height: 1.6;
        }

        .pred-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .pred-layout { grid-template-columns: 1fr; }
        }

        .pred-form { padding: 28px; }

        .pred-section-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: .6px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
          margin-bottom: 16px;
        }

        .pred-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }

        .pred-field { display: flex; flex-direction: column; }

        /* Spinner */
        .pred-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0b0d12;
          border-radius: 50%;
          animation: spin .6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Result panel */
        .pred-result-wrap { position: sticky; top: 90px; }

        .pred-result-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px 22px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(10px);
          transition: border-color .3s, box-shadow .3s;
        }
        .pred-result-card.yes {
          border-color: rgba(126,227,165,0.45);
          box-shadow: 0 0 32px rgba(126,227,165,0.12);
        }
        .pred-result-card.no {
          border-color: rgba(255,138,138,0.4);
          box-shadow: 0 0 32px rgba(255,100,100,0.10);
        }

        .pred-result-icon {
          font-size: 52px;
          line-height: 1;
          animation: pop .4s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .pred-result-label {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-strong);
          letter-spacing: -.01em;
        }

        .pred-result-hint {
          font-size: 13px;
          color: var(--muted);
          margin: 0;
          line-height: 1.5;
        }

        .pred-result-badge {
          padding: 8px 20px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
        }
        .pred-result-badge.yes {
          background: var(--success-bg);
          color: var(--success);
          border: 1px solid rgba(126,227,165,0.3);
        }
        .pred-result-badge.no {
          background: var(--danger-bg);
          color: var(--danger);
          border: 1px solid rgba(255,138,138,0.3);
        }

        .pred-features-list {
          display: flex; flex-wrap: wrap;
          gap: 6px; justify-content: center;
          margin-top: 4px;
        }
        .pred-feat-chip {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 3px 10px;
          font-size: 12px;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
