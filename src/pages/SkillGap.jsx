import { useState, useEffect, useRef } from 'react';

const AI_BASE = '/api/ai';

/* ─── helpers ─── */
async function apiFetch(url, opts = {}) {
  const init = { credentials: 'same-origin', ...opts };
  if (init.body && typeof init.body === 'object') {
    init.headers = { 'Content-Type': 'application/json', ...(init.headers || {}) };
    init.body = JSON.stringify(init.body);
  }
  const res = await fetch(url, init);
  let data = null;
  try { data = await res.json(); } catch (_) {}
  return { ok: res.ok, data };
}

/* ─── Tab Ids ─── */
const TABS = [
  { id: 'trends',   icon: '📊', label: 'Skill Trends'   },
  { id: 'gap',      icon: '🔍', label: 'Analisis CV'    },
  { id: 'path',     icon: '🗺️', label: 'Jalur Karier'   },
  { id: 'chat',     icon: '💬', label: 'Career Chat'    },
];

/* ─── Target roles list ─── */
const ROLES = [
  'Data Scientist', 'Data Analyst', 'Data Engineer',
  'Machine Learning Engineer', 'Backend Developer', 'Frontend Developer',
  'Fullstack Developer', 'DevOps Engineer', 'Software Engineer',
  'UI/UX Designer', 'Product Manager', 'Cybersecurity Analyst',
  'Cloud Architect', 'NLP Engineer', 'Information Technology',
  'Accounting/Auditing', 'Marketing', 'Human Resources',
  'Finance', 'Project Management', 'Business Development',
];

/* ══════════════════════════════════════════════════════════════
   1.  SKILL TRENDS TAB
══════════════════════════════════════════════════════════════ */
function TrendsTab() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch(`${AI_BASE}/skill-trends?limit=50`).then(({ ok, data }) => {
      if (ok && data?.trends) setTrends(data.trends);
      setLoading(false);
    });
  }, []);

  const filtered = trends.filter(t =>
    t.skill.toLowerCase().includes(search.toLowerCase())
  );

  const maxGrowth = Math.max(...trends.map(t => t.growth_pct || 0), 1);

  return (
    <div className="sk-panel">
      <div className="sk-panel-header">
        <div>
          <h2 className="sk-panel-title">📊 Tren Skill Pasar Kerja</h2>
          <p className="sk-panel-desc">
            Data pertumbuhan kategori skill berdasarkan forecast 6 bulan ke depan.
          </p>
        </div>
        <input
          className="sk-search"
          placeholder="Cari skill…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="sk-loading"><span className="sk-spinner" />Memuat data tren…</div>
      ) : (
        <div className="sk-trend-list">
          {filtered.map((t, i) => (
            <div key={t.skill} className="sk-trend-row">
              <div className="sk-trend-rank">#{i + 1}</div>
              <div className="sk-trend-info">
                <div className="sk-trend-name">{t.skill}</div>
                <div className="sk-trend-bar-wrap">
                  <div
                    className="sk-trend-bar"
                    style={{ width: `${(t.growth_pct / maxGrowth) * 100}%` }}
                  />
                </div>
              </div>
              <div className="sk-trend-meta">
                <span className="sk-badge rising">{t.trend_label}</span>
                <span className="sk-trend-pct">+{t.growth_pct?.toFixed(0)}%</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="sk-empty">Tidak ada skill yang cocok dengan pencarian.</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   2.  CV GAP ANALYSIS TAB
══════════════════════════════════════════════════════════════ */
function GapTab() {
  const [cvText, setCvText] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setError('');
    const { ok, data } = await apiFetch(`${AI_BASE}/gap-score`, {
      method: 'POST',
      body: { cv_text: cvText, target_role: role, top_n: 10 },
    });
    setLoading(false);
    if (!ok || !data) { setError('Gagal menghubungi server.'); return; }
    if (data.error) { setError(data.error); return; }
    setResult(data);
  }

  const readinessPct = result ? Math.round((result.readiness_score || 0) * 100) : 0;

  return (
    <div className="sk-panel">
      <div className="sk-panel-header">
        <div>
          <h2 className="sk-panel-title">🔍 Analisis Skill Gap CV</h2>
          <p className="sk-panel-desc">
            Paste teks CV Anda dan pilih posisi yang dituju. AI akan mendeteksi skill
            yang sudah Anda miliki dan apa yang masih perlu dipelajari.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="sk-form">
        <div className="sk-form-row">
          <label className="sk-label">Target Posisi / Role</label>
          <select
            className="sk-select"
            value={role}
            onChange={e => setRole(e.target.value)}
            required
          >
            <option value="">— Pilih role yang dituju —</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="sk-form-row">
          <label className="sk-label">Teks CV Anda</label>
          <textarea
            className="sk-textarea"
            rows={10}
            placeholder="Paste isi CV Anda di sini (pengalaman, skill, pendidikan, dll.)…"
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            required
          />
        </div>

        {error && <div className="alert error">{error}</div>}

        <button type="submit" className="btn sk-submit-btn" disabled={loading}>
          {loading ? <><span className="sk-spinner dark" />Menganalisis…</> : '🔍 Analisis Sekarang'}
        </button>
      </form>

      {result && (
        <div className="sk-result-area">
          {/* Readiness meter */}
          <div className="sk-readiness-card">
            <div className="sk-readiness-label">Tingkat Kesiapan untuk <strong>{result.posisi}</strong></div>
            <div className="sk-readiness-ring-wrap">
              <svg viewBox="0 0 120 120" className="sk-ring-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10"/>
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={readinessPct >= 60 ? 'var(--success)' : readinessPct >= 30 ? '#f59e0b' : 'var(--danger)'}
                  strokeWidth="10"
                  strokeDasharray={`${readinessPct * 3.14159} 314.159`}
                  strokeDashoffset="78.54"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
                <text x="60" y="65" textAnchor="middle" fill="white" fontSize="22" fontWeight="800">
                  {readinessPct}%
                </text>
              </svg>
            </div>
            <div className="sk-readiness-sub">
              Gap Score: <strong>{(result.gap_score * 100).toFixed(0)}%</strong>
            </div>
          </div>

          {/* Skill chips */}
          <div className="sk-skills-section">
            <div className="sk-skills-col">
              <div className="sk-skills-head matched">✅ Skill yang Dimiliki ({result.matched_skills?.length})</div>
              <div className="sk-chips">
                {(result.matched_skills || []).map(s => (
                  <span key={s} className="sk-chip matched">{s}</span>
                ))}
                {!result.matched_skills?.length && <span className="sk-empty-chip">—</span>}
              </div>
            </div>
            <div className="sk-skills-col">
              <div className="sk-skills-head missing">❌ Skill yang Perlu Dipelajari ({result.missing_skills?.length})</div>
              <div className="sk-chips">
                {(result.missing_skills || []).map(s => (
                  <span key={s} className="sk-chip missing">{s}</span>
                ))}
                {!result.missing_skills?.length && <span className="sk-empty-chip">Semua skill terpenuhi! 🎉</span>}
              </div>
            </div>
          </div>

          {/* Ranked recommendations */}
          {result.ranked_recommendations?.length > 0 && (
            <div className="sk-reco-section">
              <div className="sk-reco-title">🎯 Rekomendasi Prioritas Belajar</div>
              <div className="sk-reco-list">
                {result.ranked_recommendations.map(r => (
                  <div key={r.skill} className="sk-reco-row">
                    <span className="sk-reco-rank">#{r.priority_rank}</span>
                    <span className="sk-reco-skill">{r.skill}</span>
                    <div className="sk-reco-bar-wrap">
                      <div
                        className="sk-reco-bar"
                        style={{ width: `${r.gap_score * 100}%` }}
                      />
                    </div>
                    <span className="sk-reco-pct">{(r.gap_score * 100).toFixed(0)}% gap</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   3.  LEARNING PATH TAB
══════════════════════════════════════════════════════════════ */
function PathTab() {
  const [skillInput, setSkillInput] = useState('');
  const [skillList, setSkillList] = useState([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function addSkill() {
    const s = skillInput.trim().toLowerCase();
    if (s && !skillList.includes(s)) {
      setSkillList(prev => [...prev, s]);
    }
    setSkillInput('');
  }

  function removeSkill(s) {
    setSkillList(prev => prev.filter(x => x !== s));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setError('');
    const { ok, data } = await apiFetch(`${AI_BASE}/path-recommendation`, {
      method: 'POST',
      body: { current_skills: skillList, target_role: role },
    });
    setLoading(false);
    if (!ok || !data) { setError('Gagal menghubungi server.'); return; }
    if (data.error) { setError(data.error); return; }
    setResult(data);
  }

  return (
    <div className="sk-panel">
      <div className="sk-panel-header">
        <div>
          <h2 className="sk-panel-title">🗺️ Rekomendasi Jalur Karier</h2>
          <p className="sk-panel-desc">
            Masukkan skill yang sudah kamu miliki dan target role impianmu.
            AI akan membuat roadmap belajar 2 fase untukmu.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="sk-form">
        <div className="sk-form-row">
          <label className="sk-label">Target Role</label>
          <select className="sk-select" value={role} onChange={e => setRole(e.target.value)} required>
            <option value="">— Pilih target role —</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="sk-form-row">
          <label className="sk-label">Skill yang Sudah Kamu Miliki</label>
          <div className="sk-skill-input-row">
            <input
              className="sk-input"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Ketik skill lalu Enter atau klik +"
            />
            <button type="button" className="btn ghost sk-add-btn" onClick={addSkill}>+ Tambah</button>
          </div>
          <div className="sk-chips" style={{ marginTop: 8 }}>
            {skillList.map(s => (
              <span key={s} className="sk-chip matched removable" onClick={() => removeSkill(s)}>
                {s} <span className="sk-chip-x">×</span>
              </span>
            ))}
            {skillList.length === 0 && <span className="sk-empty-chip">Belum ada skill ditambahkan</span>}
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <button type="submit" className="btn sk-submit-btn" disabled={loading || !role}>
          {loading ? <><span className="sk-spinner dark" />Membuat roadmap…</> : '🗺️ Buat Jalur Belajar'}
        </button>
      </form>

      {result && (
        <div className="sk-result-area">
          {/* Header stats */}
          <div className="sk-path-stats">
            <div className="sk-stat-box">
              <div className="sk-stat-val">{Math.round((result.readiness_score || 0) * 100)}%</div>
              <div className="sk-stat-label">Kesiapan</div>
            </div>
            <div className="sk-stat-box">
              <div className="sk-stat-val">{result.matched_skills?.length || 0}</div>
              <div className="sk-stat-label">Skill Cocok</div>
            </div>
            <div className="sk-stat-box">
              <div className="sk-stat-val">{result.missing_skills?.length || 0}</div>
              <div className="sk-stat-label">Perlu Dipelajari</div>
            </div>
          </div>

          {/* Phase 1 */}
          <div className="sk-phase-card phase1">
            <div className="sk-phase-header">
              <span className="sk-phase-badge">Fase 1</span>
              <span className="sk-phase-title">⚡ Prioritas Utama — Pelajari Sekarang</span>
            </div>
            <div className="sk-chips" style={{ marginTop: 10 }}>
              {(result.learning_path?.phase_1_immediate || []).map(r => (
                <span key={r.skill} className="sk-chip phase1">
                  {r.skill}
                  <span className="sk-chip-badge">{(r.gap_score * 100).toFixed(0)}% gap</span>
                </span>
              ))}
              {!result.learning_path?.phase_1_immediate?.length && (
                <span className="sk-empty-chip">Kamu sudah memenuhi skill utama! 🎉</span>
              )}
            </div>
          </div>

          {/* Phase 2 */}
          <div className="sk-phase-card phase2">
            <div className="sk-phase-header">
              <span className="sk-phase-badge phase2">Fase 2</span>
              <span className="sk-phase-title">📚 Selanjutnya — Tingkatkan Lebih Jauh</span>
            </div>
            <div className="sk-chips" style={{ marginTop: 10 }}>
              {(result.learning_path?.phase_2_next || []).map(r => (
                <span key={r.skill} className="sk-chip phase2">
                  {r.skill}
                  <span className="sk-chip-badge">{(r.gap_score * 100).toFixed(0)}% gap</span>
                </span>
              ))}
              {!result.learning_path?.phase_2_next?.length && (
                <span className="sk-empty-chip">Tidak ada fase 2 — sangat siap! 🚀</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   4.  CAREER CHATBOT TAB
══════════════════════════════════════════════════════════════ */
function ChatTab() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '👋 Halo! Saya **Career Advisor AI**. Saya bisa membantu kamu dengan tren skill, analisis karier, dan rekomendasi belajar. Tanyakan apa saja!',
      suggestions: ['Skill apa yang sedang trending?', 'Analisis gap CV saya', 'Rekomendasi jalur karier'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const { ok, data } = await apiFetch(`${AI_BASE}/career-chatbot`, {
      method: 'POST',
      body: { message: text },
    });
    setLoading(false);

    if (!ok || !data) {
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Gagal menghubungi server. Coba lagi.' }]);
      return;
    }
    setMessages(prev => [...prev, {
      role: 'bot',
      text: data.reply,
      suggestions: data.suggestions,
    }]);
  }

  function renderText(text) {
    // minimal markdown: **bold**
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  }

  return (
    <div className="sk-panel sk-chat-panel">
      <div className="sk-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`sk-msg-wrap ${msg.role}`}>
            {msg.role === 'bot' && <div className="sk-avatar">🤖</div>}
            <div className="sk-msg-block">
              <div className={`sk-bubble ${msg.role}`}>
                {renderText(msg.text)}
              </div>
              {msg.suggestions?.length > 0 && (
                <div className="sk-suggestions">
                  {msg.suggestions.map(s => (
                    <button
                      key={s}
                      className="sk-suggestion-btn"
                      onClick={() => sendMessage(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && <div className="sk-avatar user">👤</div>}
          </div>
        ))}
        {loading && (
          <div className="sk-msg-wrap bot">
            <div className="sk-avatar">🤖</div>
            <div className="sk-bubble bot sk-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="sk-chat-input-row"
        onSubmit={e => { e.preventDefault(); sendMessage(input); }}
      >
        <input
          className="sk-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ketik pesan…"
          disabled={loading}
        />
        <button type="submit" className="btn sk-send-btn" disabled={loading || !input.trim()}>
          Kirim ➤
        </button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function SkillGap() {
  const [activeTab, setActiveTab] = useState('trends');

  return (
    <div className="sg-page">
      {/* ── Hero ── */}
      <section className="sg-hero">
        <div className="container">
          <div className="sg-hero-badge">🤖 AI Career Advisor</div>
          <h1 className="sg-hero-title">Analisis Karier Berbasis AI</h1>
          <p className="sg-hero-sub">
            Gunakan kecerdasan buatan untuk menganalisis tren skill pasar kerja,
            mengevaluasi gap CV Anda, dan mendapatkan roadmap belajar personal.
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 80 }}>
        {/* ── Tab Nav ── */}
        <div className="sg-tab-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              className={`sg-tab-btn${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="sg-tab-icon">{t.icon}</span>
              <span className="sg-tab-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="sg-content">
          {activeTab === 'trends' && <TrendsTab />}
          {activeTab === 'gap'    && <GapTab />}
          {activeTab === 'path'   && <PathTab />}
          {activeTab === 'chat'   && <ChatTab />}
        </div>
      </div>

      {/* ── Scoped Styles ── */}
      <style>{`
        /* ── Page ── */
        .sg-page { min-height: 100vh; }

        /* ── Hero ── */
        .sg-hero {
          padding: 64px 0 48px;
          background: radial-gradient(70% 60% at 50% 0%, rgba(99,130,255,0.09) 0%, transparent 70%);
          border-bottom: 1px solid var(--border);
          margin-bottom: 36px;
        }
        .sg-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,130,255,0.1); border: 1px solid rgba(99,130,255,0.25);
          border-radius: 999px; padding: 4px 16px;
          font-size: 12px; font-weight: 700; color: #a5b4fc;
          letter-spacing: .5px; text-transform: uppercase; margin-bottom: 18px;
        }
        .sg-hero-title {
          font-size: clamp(26px, 4vw, 44px); font-weight: 800;
          letter-spacing: -.02em; margin: 0 0 12px;
          background: linear-gradient(180deg, #fff 0%, #9aa3d0 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .sg-hero-sub {
          color: var(--muted); font-size: 16px; max-width: 640px;
          margin: 0; line-height: 1.65;
        }

        /* ── Tab Nav ── */
        .sg-tab-nav {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 24px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 6px;
        }
        .sg-tab-btn {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 10px 16px;
          background: transparent; border: none; border-radius: var(--radius-sm);
          cursor: pointer; color: var(--muted);
          font-size: 14px; font-weight: 600; transition: all .2s ease;
          min-width: 120px;
        }
        .sg-tab-btn:hover { background: rgba(255,255,255,0.06); color: var(--text); }
        .sg-tab-btn.active {
          background: rgba(255,255,255,0.1); color: var(--text-strong);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.12);
        }
        .sg-tab-icon { font-size: 18px; }
        @media (max-width: 600px) {
          .sg-tab-label { display: none; }
          .sg-tab-btn { min-width: 48px; padding: 10px; }
        }

        /* ── Panel ── */
        .sk-panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px;
          backdrop-filter: blur(12px);
          animation: fadeUp .3s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sk-panel-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px;
          margin-bottom: 24px; flex-wrap: wrap;
        }
        .sk-panel-title {
          font-size: 20px; font-weight: 800; color: var(--text-strong);
          margin: 0 0 6px;
        }
        .sk-panel-desc { color: var(--muted); font-size: 14px; margin: 0; }

        /* ── Search ── */
        .sk-search {
          padding: 9px 14px; border: 1px solid var(--border);
          border-radius: var(--radius-sm); background: rgba(255,255,255,0.05);
          color: var(--text); min-width: 200px; font-size: 14px;
          transition: border-color .2s, box-shadow .2s;
        }
        .sk-search:focus {
          outline: none; border-color: rgba(255,255,255,0.3);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.06);
        }

        /* ── Loading ── */
        .sk-loading {
          display: flex; align-items: center; gap: 10px;
          color: var(--muted); padding: 40px 0; justify-content: center;
        }
        .sk-spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.15);
          border-top-color: var(--text); border-radius: 50%;
          animation: spin .6s linear infinite;
        }
        .sk-spinner.dark {
          border-color: rgba(0,0,0,0.2); border-top-color: #0b0d12;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Trend List ── */
        .sk-trend-list { display: flex; flex-direction: column; gap: 10px; }
        .sk-trend-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 14px; border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          transition: background .2s, border-color .2s;
        }
        .sk-trend-row:hover { background: rgba(255,255,255,0.06); border-color: var(--border-strong); }
        .sk-trend-rank { color: var(--muted-2); font-size: 12px; min-width: 28px; }
        .sk-trend-info { flex: 1; }
        .sk-trend-name { font-weight: 600; font-size: 14px; color: var(--text-strong); margin-bottom: 5px; }
        .sk-trend-bar-wrap {
          height: 4px; border-radius: 999px;
          background: rgba(255,255,255,0.07); overflow: hidden;
        }
        .sk-trend-bar {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #6366f1, #a5b4fc);
          transition: width .8s ease;
        }
        .sk-trend-meta { display: flex; align-items: center; gap: 10px; }
        .sk-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
        .sk-badge.rising { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
        .sk-trend-pct { font-size: 13px; font-weight: 700; color: #a5b4fc; min-width: 70px; text-align: right; }
        .sk-empty { text-align: center; color: var(--muted); padding: 40px 0; }

        /* ── Form ── */
        .sk-form { display: flex; flex-direction: column; gap: 16px; }
        .sk-form-row { display: flex; flex-direction: column; gap: 6px; }
        .sk-label { font-size: 13px; font-weight: 600; color: var(--muted); }
        .sk-select, .sk-input {
          padding: 11px 14px; border: 1px solid var(--border);
          border-radius: var(--radius-sm); background: rgba(255,255,255,0.04);
          color: var(--text); font-size: 14px; width: 100%;
          transition: border-color .2s, box-shadow .2s;
        }
        .sk-select:focus, .sk-input:focus {
          outline: none; border-color: rgba(255,255,255,0.35);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.07);
        }
        .sk-select option { background: #11141b; }
        .sk-textarea {
          padding: 11px 14px; border: 1px solid var(--border);
          border-radius: var(--radius-sm); background: rgba(255,255,255,0.04);
          color: var(--text); font-size: 14px; width: 100%; resize: vertical;
          font-family: inherit; transition: border-color .2s, box-shadow .2s;
          line-height: 1.55;
        }
        .sk-textarea:focus {
          outline: none; border-color: rgba(255,255,255,0.35);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.07);
        }
        .sk-submit-btn {
          width: 100%; justify-content: center; font-size: 15px;
          padding: 13px 24px; gap: 8px;
        }

        /* ── Result Area ── */
        .sk-result-area {
          margin-top: 28px;
          display: flex; flex-direction: column; gap: 20px;
          border-top: 1px solid var(--border); padding-top: 28px;
        }

        /* ── Readiness Ring ── */
        .sk-readiness-card {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 24px;
        }
        .sk-readiness-label { font-size: 14px; color: var(--muted); text-align: center; }
        .sk-ring-svg { width: 130px; height: 130px; }
        .sk-readiness-sub { font-size: 13px; color: var(--muted); }

        /* ── Skill Chips ── */
        .sk-skills-section {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        @media (max-width: 680px) { .sk-skills-section { grid-template-columns: 1fr; } }
        .sk-skills-col {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 16px;
        }
        .sk-skills-head {
          font-size: 13px; font-weight: 700; margin-bottom: 10px;
        }
        .sk-skills-head.matched { color: var(--success); }
        .sk-skills-head.missing { color: var(--danger); }
        .sk-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .sk-chip {
          font-size: 12px; font-weight: 600; padding: 4px 10px;
          border-radius: 999px; border: 1px solid transparent;
          cursor: default;
        }
        .sk-chip.matched { background: var(--success-bg); color: var(--success); border-color: rgba(126,227,165,0.3); }
        .sk-chip.missing { background: var(--danger-bg); color: var(--danger); border-color: rgba(255,138,138,0.3); }
        .sk-chip.phase1 { background: rgba(99,102,241,0.15); color: #a5b4fc; border-color: rgba(99,102,241,0.3); display: flex; align-items: center; gap: 6px; }
        .sk-chip.phase2 { background: rgba(245,158,11,0.12); color: #fbbf24; border-color: rgba(245,158,11,0.3); display: flex; align-items: center; gap: 6px; }
        .sk-chip.removable { cursor: pointer; transition: opacity .2s; }
        .sk-chip.removable:hover { opacity: .7; }
        .sk-chip-x { opacity: .6; font-size: 14px; }
        .sk-chip-badge {
          font-size: 10px; background: rgba(255,255,255,0.12);
          border-radius: 999px; padding: 1px 6px; font-weight: 700;
        }
        .sk-empty-chip { font-size: 12px; color: var(--muted-2); }

        /* ── Ranked Reco ── */
        .sk-reco-section {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 18px;
        }
        .sk-reco-title { font-size: 14px; font-weight: 700; color: var(--text-strong); margin-bottom: 14px; }
        .sk-reco-list { display: flex; flex-direction: column; gap: 8px; }
        .sk-reco-row { display: flex; align-items: center; gap: 10px; }
        .sk-reco-rank { color: var(--muted-2); font-size: 12px; min-width: 24px; }
        .sk-reco-skill { font-size: 13px; font-weight: 600; color: var(--text); min-width: 140px; }
        .sk-reco-bar-wrap { flex: 1; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.07); overflow: hidden; }
        .sk-reco-bar { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .sk-reco-pct { font-size: 12px; color: #fbbf24; min-width: 60px; text-align: right; }

        /* ── Path Stats ── */
        .sk-path-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .sk-stat-box {
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 18px; text-align: center;
        }
        .sk-stat-val { font-size: 28px; font-weight: 800; color: var(--text-strong); }
        .sk-stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }

        /* ── Phase Cards ── */
        .sk-phase-card {
          border-radius: var(--radius); padding: 18px;
          border: 1px solid rgba(99,102,241,0.25);
          background: rgba(99,102,241,0.06);
        }
        .sk-phase-card.phase2 {
          border-color: rgba(245,158,11,0.25);
          background: rgba(245,158,11,0.05);
        }
        .sk-phase-header { display: flex; align-items: center; gap: 10px; }
        .sk-phase-badge {
          background: rgba(99,102,241,0.2); color: #a5b4fc;
          border: 1px solid rgba(99,102,241,0.3);
          font-size: 11px; font-weight: 800; padding: 2px 10px;
          border-radius: 999px; text-transform: uppercase; letter-spacing: .5px;
        }
        .sk-phase-badge.phase2 {
          background: rgba(245,158,11,0.2); color: #fbbf24;
          border-color: rgba(245,158,11,0.3);
        }
        .sk-phase-title { font-size: 14px; font-weight: 700; color: var(--text-strong); }

        /* ── Skill input row ── */
        .sk-skill-input-row { display: flex; gap: 8px; }
        .sk-skill-input-row .sk-input { flex: 1; }
        .sk-add-btn { white-space: nowrap; }

        /* ── Chat ── */
        .sk-chat-panel { display: flex; flex-direction: column; height: 600px; padding: 0; }
        .sk-chat-messages {
          flex: 1; overflow-y: auto; padding: 24px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .sk-chat-messages::-webkit-scrollbar { width: 4px; }
        .sk-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .sk-chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .sk-msg-wrap { display: flex; gap: 10px; align-items: flex-start; }
        .sk-msg-wrap.user { flex-direction: row-reverse; }
        .sk-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          display: grid; place-items: center; font-size: 18px;
          background: rgba(255,255,255,0.07); border: 1px solid var(--border);
        }
        .sk-avatar.user { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); }
        .sk-msg-block { display: flex; flex-direction: column; gap: 6px; max-width: 75%; }
        .sk-msg-wrap.user .sk-msg-block { align-items: flex-end; }
        .sk-bubble {
          padding: 12px 16px; border-radius: 14px; font-size: 14px;
          line-height: 1.6; border: 1px solid var(--border);
        }
        .sk-bubble.bot { background: rgba(255,255,255,0.05); border-radius: 4px 14px 14px 14px; }
        .sk-bubble.user {
          background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.3);
          color: #e0e7ff; border-radius: 14px 4px 14px 14px;
        }
        .sk-typing {
          display: flex; align-items: center; gap: 5px; padding: 14px 20px;
        }
        .sk-typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--muted); display: inline-block;
          animation: bounce .9s infinite;
        }
        .sk-typing span:nth-child(2) { animation-delay: .15s; }
        .sk-typing span:nth-child(3) { animation-delay: .3s; }
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .sk-suggestions { display: flex; flex-wrap: wrap; gap: 6px; }
        .sk-suggestion-btn {
          background: rgba(255,255,255,0.05); border: 1px solid var(--border);
          border-radius: 999px; padding: 4px 12px;
          font-size: 12px; color: var(--muted); cursor: pointer;
          transition: background .2s, color .2s, border-color .2s;
        }
        .sk-suggestion-btn:hover {
          background: rgba(255,255,255,0.1); color: var(--text);
          border-color: var(--border-strong);
        }
        .sk-chat-input-row {
          display: flex; gap: 8px; padding: 16px 20px;
          border-top: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          border-radius: 0 0 var(--radius) var(--radius);
        }
        .sk-chat-input-row .sk-input { flex: 1; }
        .sk-send-btn { white-space: nowrap; }
      `}</style>
    </div>
  );
}
