"""AI Engineer Service — ported from AIEngineer/main.py.

Menyediakan logika untuk:
  - Skill Trends   : membaca skill_trends.json
  - Extract CV     : keyword-matching (tidak butuh model Keras)
  - Gap Score      : cosine-similarity sederhana via sklearn
  - Path Reco      : rekomendasi jalur belajar berbasis gap
  - Career Chatbot : rule-based + trend-aware chatbot
"""
import json
import os
import re
import time
from functools import lru_cache

# ─── PATH ────────────────────────────────────────────────────────────────────
_HERE = os.path.dirname(os.path.abspath(__file__))
_AI_DIR = os.path.join(_HERE, "..", "AIEngineer")
_TRENDS_PATH = os.path.join(_AI_DIR, "skill_trends.json")

# ─── ROLE → SKILL MAP ────────────────────────────────────────────────────────
# Peta target role ke daftar skill yang biasanya dibutuhkan.
ROLE_SKILLS_MAP: dict[str, list[str]] = {
    "data scientist": [
        "python", "machine learning", "deep learning", "pandas", "numpy",
        "scikit-learn", "tensorflow", "pytorch", "sql", "statistics",
        "data analysis", "nlp", "visualization",
    ],
    "data analyst": [
        "sql", "python", "excel", "power bi", "tableau", "pandas",
        "data analysis", "statistics", "reporting", "etl",
    ],
    "data engineer": [
        "python", "sql", "spark", "hadoop", "airflow", "kafka",
        "etl", "data engineering", "postgresql", "mongodb",
        "docker", "aws", "gcp", "azure",
    ],
    "machine learning engineer": [
        "python", "machine learning", "deep learning", "tensorflow",
        "pytorch", "scikit-learn", "docker", "kubernetes", "mlops",
        "rest api", "git",
    ],
    "backend developer": [
        "python", "node.js", "java", "rest api", "sql", "postgresql",
        "mongodb", "docker", "git", "flask", "django", "fastapi",
        "redis", "microservices",
    ],
    "frontend developer": [
        "javascript", "typescript", "react", "vue", "angular",
        "html", "css", "git", "figma", "rest api", "next.js",
    ],
    "fullstack developer": [
        "javascript", "typescript", "react", "node.js", "html", "css",
        "sql", "git", "docker", "rest api", "postgresql",
    ],
    "devops engineer": [
        "docker", "kubernetes", "aws", "gcp", "azure", "terraform",
        "ansible", "ci/cd", "jenkins", "linux", "bash", "git",
    ],
    "software engineer": [
        "python", "java", "javascript", "git", "sql", "rest api",
        "docker", "agile", "scrum",
    ],
    "ui/ux designer": [
        "figma", "adobe", "photoshop", "illustrator", "css",
        "html", "prototyping", "user research",
    ],
    "product manager": [
        "agile", "scrum", "jira", "product management", "data analysis",
        "project management", "sql",
    ],
    "cybersecurity analyst": [
        "linux", "bash", "networking", "penetration testing",
        "python", "git", "security",
    ],
    "cloud architect": [
        "aws", "gcp", "azure", "terraform", "docker", "kubernetes",
        "networking", "linux",
    ],
    "nlp engineer": [
        "python", "nlp", "deep learning", "pytorch", "tensorflow",
        "machine learning", "pandas", "numpy", "scikit-learn",
    ],
    "information technology": [
        "python", "sql", "networking", "linux", "git", "docker",
        "rest api",
    ],
    "accounting/auditing": [
        "excel", "sql", "data analysis", "reporting", "power bi",
    ],
    "marketing": [
        "data analysis", "sql", "power bi", "tableau", "excel",
        "google analytics",
    ],
    "human resources": [
        "excel", "data analysis", "reporting", "project management",
    ],
    "finance": [
        "excel", "sql", "data analysis", "power bi", "python", "statistics",
    ],
    "project management": [
        "agile", "scrum", "jira", "project management", "excel",
        "microsoft project",
    ],
    "business development": [
        "data analysis", "excel", "sql", "project management",
        "agile", "crm",
    ],
}

# ─── EXTENDED SKILL LIST ─────────────────────────────────────────────────────
KNOWN_SKILLS: list[str] = sorted({
    # Programming
    "python", "java", "javascript", "typescript", "go", "rust",
    "c++", "c#", "ruby", "php", "swift", "kotlin", "dart", "scala",
    "r", "matlab", "bash", "shell",
    # Web
    "html", "css", "react", "vue", "angular", "svelte", "next.js",
    "nuxt", "node.js", "express", "flask", "django", "fastapi",
    "spring", "laravel",
    # Data
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "sqlite", "cassandra", "dynamodb",
    # ML / AI
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "data analysis", "data engineering", "etl", "statistics",
    "visualization", "mlops", "huggingface", "keras",
    # BI
    "power bi", "tableau", "google analytics", "excel", "looker",
    # DevOps / Cloud
    "docker", "kubernetes", "aws", "gcp", "azure", "terraform",
    "ansible", "ci/cd", "jenkins", "linux", "git", "github", "gitlab",
    # Misc
    "figma", "adobe", "photoshop", "illustrator", "prototyping",
    "agile", "scrum", "jira", "project management", "user research",
    "rest api", "graphql", "grpc", "microservices",
    "firebase", "supabase", "vercel", "heroku", "railway",
    "networking", "security", "penetration testing", "hadoop",
    "spark", "airflow", "kafka", "crm", "microsoft project",
    "reporting",
})


# ─── LOAD TRENDS ─────────────────────────────────────────────────────────────
@lru_cache(maxsize=1)
def load_skill_trends() -> dict:
    """Load skill_trends.json sekali saja (cached)."""
    if not os.path.exists(_TRENDS_PATH):
        return {}
    with open(_TRENDS_PATH, encoding="utf-8") as f:
        return json.load(f)


# ─── EXTRACT SKILLS ──────────────────────────────────────────────────────────
def extract_skills_from_text(cv_text: str) -> list[str]:
    """Ekstrak skill dari teks CV dengan keyword matching."""
    lower = cv_text.lower()
    found = []
    for sk in KNOWN_SKILLS:
        # whole-word / phrase match
        pattern = r"(?<![a-z0-9\.])" + re.escape(sk) + r"(?![a-z0-9\.])"
        if re.search(pattern, lower):
            found.append(sk)
    return sorted(set(found))


# ─── GAP SCORE ───────────────────────────────────────────────────────────────
def _cosine_sim_simple(cv_skills: set[str], required_skills: set[str]) -> float:
    """Jaccard-based similarity sebagai pengganti cosine."""
    if not required_skills:
        return 1.0
    if not cv_skills:
        return 0.0
    intersection = len(cv_skills & required_skills)
    union = len(cv_skills | required_skills)
    return intersection / union


def compute_skill_gap(cv_text: str, target_role: str) -> dict:
    """Hitung skill gap antara teks CV dan target role."""
    t0 = time.time()
    cv_skills = set(extract_skills_from_text(cv_text))

    # Cari role yang paling mirip (case-insensitive prefix/substring match)
    role_key = target_role.strip().lower()
    matched_key = None
    for key in ROLE_SKILLS_MAP:
        if role_key == key or role_key in key or key in role_key:
            matched_key = key
            break
    # fallback — pakai semua skill yang dikenal
    required_skills = set(ROLE_SKILLS_MAP.get(matched_key, list(KNOWN_SKILLS)[:15]))

    matched = cv_skills & required_skills
    missing = required_skills - cv_skills

    if required_skills:
        readiness = len(matched) / len(required_skills)
        gap_score = 1.0 - readiness
    else:
        readiness = 0.5
        gap_score = 0.5

    details = []
    for skill in required_skills:
        sim = 1.0 if skill in cv_skills else _cosine_sim_simple({skill}, cv_skills)
        details.append({"req": skill, "score": round(sim, 4)})

    return {
        "status": "SUCCESS",
        "posisi": matched_key or target_role,
        "cv_skills": sorted(cv_skills),
        "required_skills": sorted(required_skills),
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "gap_score": round(gap_score, 4),
        "readiness_score": round(readiness, 4),
        "details": details,
        "latency_ms": round((time.time() - t0) * 1000, 1),
    }


# ─── RANKING ENGINE ───────────────────────────────────────────────────────────
def ranking_engine(gap_result: dict, top_n: int = 10) -> list[dict]:
    """Ranking missing skills by gap priority (port dari AIEngineer)."""
    if gap_result.get("status") != "SUCCESS":
        return []
    details = {d["req"]: d for d in gap_result.get("details", [])}
    ranked = []
    for skill in gap_result.get("missing_skills", []):
        sim = details.get(skill, {}).get("score", 0.0)
        gap_sc = round(1.0 - sim, 4)
        ranked.append({
            "skill": skill,
            "gap_score": gap_sc,
            "cosine_sim": round(sim, 4),
        })
    ranked.sort(key=lambda x: x["gap_score"], reverse=True)
    for i, r in enumerate(ranked):
        r["priority_rank"] = i + 1
    return ranked[:top_n]


# ─── LEARNING PATH ───────────────────────────────────────────────────────────
def build_learning_path(current_skills: list[str], target_role: str) -> dict:
    """Bangun rekomendasi learning path dari current_skills ke target_role."""
    synthetic_cv = (
        f"SKILLS: {', '.join(current_skills)}\n"
        "Experience: Professional with background in technology. "
        "Strong analytical and problem-solving skills."
    )
    gap = compute_skill_gap(synthetic_cv, target_role)
    ranked = ranking_engine(gap)
    mid = max(1, len(ranked) // 2)
    phase1 = ranked[:mid][:5]
    phase2 = ranked[mid:][:5]
    return {
        "status": "SUCCESS",
        "target_role": gap.get("posisi", target_role),
        "current_skills": current_skills,
        "gap_score": gap.get("gap_score"),
        "readiness_score": gap.get("readiness_score"),
        "matched_skills": gap.get("matched_skills", []),
        "missing_skills": gap.get("missing_skills", []),
        "learning_path": {
            "phase_1_immediate": phase1,
            "phase_2_next": phase2,
        },
    }


# ─── CAREER CHATBOT ───────────────────────────────────────────────────────────
def generate_chatbot_reply(message: str, context=None) -> dict:
    """Rule-based chatbot career advisor (port dari AIEngineer)."""
    trend_data = load_skill_trends()
    msg = message.lower()

    if any(k in msg for k in ["trend", "tren", "rising", "naik", "populer", "popular"]):
        rising = [k for k, v in trend_data.items() if v.get("trend_label") == "RISING"][:5]
        reply = (
            f"📈 Skill yang sedang trending naik saat ini: {', '.join(rising)}. "
            "Fokus pada area-area ini untuk meningkatkan daya saing Anda!"
        )
        suggestions = ["Lihat semua tren skill", "Analisis gap CV saya", "Rekomendasi jalur karier"]

    elif any(k in msg for k in ["gap", "kekurangan", "missing", "butuh", "kurang"]):
        reply = (
            "🔍 Untuk menganalisis skill gap Anda, masukkan teks CV dan pilih posisi yang dituju "
            "di tab **Analisis CV**. Sistem akan mendeteksi skill yang Anda miliki dan yang masih perlu dikembangkan."
        )
        suggestions = ["Buka Analisis CV", "Lihat tren skill", "Buat rekomendasi jalur"]

    elif any(k in msg for k in ["rekomendasi", "recommend", "jalur", "path", "karier", "career", "belajar", "learn"]):
        reply = (
            "🗺️ Untuk mendapatkan rekomendasi jalur karier personal, buka tab **Jalur Karier**, "
            "masukkan skill yang Anda miliki dan target role impian Anda. "
            "Saya akan membuatkan roadmap belajar fase per fase!"
        )
        suggestions = ["Buka Jalur Karier", "Cek skill trending", "Analisis gap CV saya"]

    elif any(k in msg for k in ["halo", "hai", "hello", "hi", "mulai", "apa yang"]):
        total_rising = sum(1 for v in trend_data.values() if v.get("trend_label") == "RISING")
        reply = (
            f"👋 Halo! Saya **Career Advisor AI** dari RUMAH KARIR. "
            f"Saat ini saya memantau **{len(trend_data)} kategori skill** dengan "
            f"**{total_rising} kategori yang sedang rising**. "
            "Saya bisa membantu Anda dengan:\n"
            "• Analisis tren skill pasar kerja\n"
            "• Evaluasi skill gap dari CV Anda\n"
            "• Rekomendasi jalur belajar personal"
        )
        suggestions = ["Skill apa yang sedang trending?", "Analisis gap CV saya", "Rekomendasi jalur karier"]

    elif any(k in msg for k in ["skill", "kemampuan", "keahlian"]):
        top_skills = sorted(
            trend_data.items(),
            key=lambda x: x[1].get("growth_pct", 0),
            reverse=True,
        )[:5]
        skill_list = ", ".join(k for k, _ in top_skills)
        reply = (
            f"💡 Top 5 kategori skill dengan pertumbuhan tertinggi: **{skill_list}**. "
            "Investasikan waktu belajar Anda di area-area tersebut!"
        )
        suggestions = ["Analisis gap CV saya", "Buat jalur belajar", "Info lebih lengkap"]

    elif any(k in msg for k in ["cv", "resume", "portofolio"]):
        reply = (
            "📄 CV yang baik harus mencantumkan skill teknis secara eksplisit agar mudah terdeteksi "
            "oleh sistem ATS. Gunakan tab **Analisis CV** untuk melihat skill apa saja yang sudah terdeteksi "
            "dari teks CV Anda dan apa yang masih perlu ditambahkan."
        )
        suggestions = ["Buka Analisis CV", "Lihat skill trending", "Tips menulis CV"]

    else:
        total_rising = sum(1 for v in trend_data.values() if v.get("trend_label") == "RISING")
        reply = (
            f"🤖 Saya Career Advisor AI siap membantu! Saat ini saya memantau "
            f"{len(trend_data)} kategori skill dengan {total_rising} yang sedang rising. "
            "Tanyakan kepada saya tentang tren skill, analisis gap CV, atau rekomendasi karier!"
        )
        suggestions = [
            "Skill apa yang sedang trending?",
            "Analisis gap CV saya",
            "Rekomendasi jalur karier",
        ]

    return {
        "status": "SUCCESS",
        "reply": reply,
        "suggestions": suggestions,
        "context": context,
    }
