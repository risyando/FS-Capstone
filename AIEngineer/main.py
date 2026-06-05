"""
AI Engineer 2 — Flask Backend
Endpoints:
  POST /api/extract-cv
  POST /api/gap-score
  GET  /api/skill-trends
  POST /api/path-recommendation
  POST /api/career-chatbot
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json, time, os, sys, importlib.util, glob

# ─── CONFIG ──────────────────────────────────────────────────────────────────
EXTRACT_AI1    = "/content/DataAI1"
PATH_KERAS     = next(iter(glob.glob(os.path.join(EXTRACT_AI1,'**','*.keras'),recursive=True)), None)
PATH_TOKENIZER = next(iter(glob.glob(os.path.join(EXTRACT_AI1,'**','*.pkl'),recursive=True)), None)
PATH_FAISS     = next(iter(glob.glob(os.path.join(EXTRACT_AI1,'**','*.index'),recursive=True)), None)
PATH_ROLEMAP   = next(iter(glob.glob(os.path.join(EXTRACT_AI1,'**','*.json'),recursive=True)), None)
PATH_TRENDS    = "/content/skill_trends.json"

# ─── GLOBAL STATE ─────────────────────────────────────────────────────────────
PIPELINE     = {}
TREND_DATA   = {}
pipeline_mod = None

app = Flask(__name__)
CORS(app) # Mengizinkan semua origin

# ─── STARTUP / LOADING MODEL ─────────────────────────────────────────────────
def load_all_models():
    global PIPELINE, TREND_DATA, pipeline_mod
    print("🚀 [Startup] Loading semua model...")

    py_path = next(iter(glob.glob(os.path.join(EXTRACT_AI1,'**','*.py'),recursive=True)), None)
    if not py_path:
        raise RuntimeError("File pipeline .py tidak ditemukan di DataAI1!")
    spec = importlib.util.spec_from_file_location("skill_gap_pipeline", py_path)
    pipeline_mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(pipeline_mod)

    for label, path in [('Keras', PATH_KERAS), ('Tokenizer', PATH_TOKENIZER),
                         ('FAISS', PATH_FAISS), ('RoleMap', PATH_ROLEMAP)]:
        if not path or not os.path.exists(path):
            raise RuntimeError(f"[Startup] File {label} tidak ditemukan: {path}")

    PIPELINE = pipeline_mod.load_pipeline(
        PATH_KERAS, PATH_TOKENIZER, PATH_FAISS, PATH_ROLEMAP
    )

    if os.path.exists(PATH_TRENDS):
        with open(PATH_TRENDS) as f:
            TREND_DATA = json.load(f)

    print(f"✅ [Startup] Pipeline OK — {len(TREND_DATA)} skill trends loaded")

# Muat model saat file ini dieksekusi
load_all_models()

# ─── HELPER ──────────────────────────────────────────────────────────────────
def _ranking_engine(gap_result: dict) -> list:
    if gap_result.get('status') != 'SUCCESS':
        return []
    details = {d['req']: d for d in gap_result.get('details', [])}
    ranked  = []
    for skill in gap_result.get('missing_skills', []):
        sim    = details.get(skill, {}).get('score', 0.0)
        gap_sc = round(1.0 - sim, 4)
        ranked.append({
            'skill'     : skill,
            'gap_score' : gap_sc,
            'cosine_sim': round(sim, 4),
        })
    ranked.sort(key=lambda x: x['gap_score'], reverse=True)
    for i, r in enumerate(ranked):
        r['priority_rank'] = i + 1
    return ranked


# ─── ENDPOINTS ───────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "ok", "message": "Skill Gap API (Flask) is running!"})

@app.route("/api/extract-cv", methods=["POST"])
def extract_cv():
    t0 = time.time()
    try:
        data = request.get_json() or {}
        cv_text = data.get("cv_text", "")

        if not cv_text:
            return jsonify({"error": "cv_text is required"}), 400

        skills = pipeline_mod.extract_skill_tf(
            cv_text, PIPELINE['tf_model'], PIPELINE['tokenizer']
        )
        return jsonify({
            "status": "SUCCESS",
            "skills_detected": skills,
            "skill_count": len(skills),
            "word_count": len(cv_text.split()),
            "latency_ms": round((time.time() - t0) * 1000, 1)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/gap-score", methods=["POST"])
def gap_score():
    t0 = time.time()
    try:
        data = request.get_json() or {}
        cv_text = data.get("cv_text", "")
        target_role = data.get("target_role", "")
        top_n = int(data.get("top_n", 10))

        if not cv_text or not target_role:
            return jsonify({"error": "cv_text and target_role are required"}), 400

        gap_result = pipeline_mod.get_skill_gap(
            cv_text, target_role,
            PIPELINE['tf_model'], PIPELINE['tokenizer'],
            PIPELINE['embed_model'], PIPELINE['faiss_index'],
            PIPELINE['skill_records'], PIPELINE['role_skills_map']
        )

        if gap_result.get('status') != 'SUCCESS':
            gap_result["latency_ms"] = round((time.time()-t0)*1000, 1)
            return jsonify(gap_result)

        ranked = _ranking_engine(gap_result)[:top_n]

        gap_result["ranked_recommendations"] = ranked
        gap_result["latency_ms"] = round((time.time() - t0) * 1000, 1)
        return jsonify(gap_result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/skill-trends", methods=["GET"])
def skill_trends():
    label = request.args.get("label")
    limit = int(request.args.get("limit", 50))

    data = [
        {'skill': k, **v}
        for k, v in TREND_DATA.items()
        if not label or v.get('trend_label', '').upper() == label.upper()
    ]
    data.sort(key=lambda x: x.get('growth_pct', 0), reverse=True)
    return jsonify({
        "status": "SUCCESS",
        "note": "Data ini hanya untuk informasi. Tidak mempengaruhi gap scoring pelamar.",
        "filter_label": label,
        "total": len(data),
        "trends": data[:limit]
    })

@app.route("/api/path-recommendation", methods=["POST"])
def path_recommendation():
    t0 = time.time()
    try:
        data = request.get_json() or {}
        current_skills = data.get("current_skills", [])
        target_role = data.get("target_role", "")

        synthetic_cv = (
            f"SKILLS: {', '.join(current_skills)}\n"
            "Experience: Experienced professional with background in technology."
            " Strong analytical and problem-solving skills. Worked on multiple projects"
            " involving data analysis, software development and team collaboration."
            " Familiar with agile methodology and cross-functional teamwork."
        )

        gap_result = pipeline_mod.get_skill_gap(
            synthetic_cv, target_role,
            PIPELINE['tf_model'], PIPELINE['tokenizer'],
            PIPELINE['embed_model'], PIPELINE['faiss_index'],
            PIPELINE['skill_records'], PIPELINE['role_skills_map']
        )

        ranked = _ranking_engine(gap_result)
        mid    = max(1, len(ranked) // 2)
        phase1 = ranked[:mid][:5]
        phase2 = ranked[mid:][:5]

        return jsonify({
            "status": "SUCCESS",
            "target_role": gap_result.get('posisi', target_role),
            "current_skills": current_skills,
            "gap_score": gap_result.get('gap_score'),
            "readiness_score": gap_result.get('readiness_score'),
            "learning_path": {
                "phase_1_immediate": phase1,
                "phase_2_next"     : phase2
            },
            "latency_ms": round((time.time() - t0) * 1000, 1)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/career-chatbot", methods=["POST"])
def career_chatbot():
    data = request.get_json() or {}
    message = data.get("message", "")
    context = data.get("context", None)

    msg = message.lower()

    if any(k in msg for k in ['trend', 'tren', 'rising', 'naik', 'populer']):
        rising = [
            k for k, v in TREND_DATA.items()
            if v.get('trend_label') == 'RISING'
        ][:5]
        reply = (
            f"📈 Skill yang sedang trending naik saat ini: {', '.join(rising)}. "
            "Fokus pada skill-skill ini untuk meningkatkan daya saing Anda!"
        )
        suggestions = ["Lihat semua tren skill", "Analisis gap CV saya"]

    elif any(k in msg for k in ['gap', 'kekurangan', 'missing', 'butuh']):
        reply = (
            "Untuk menganalisis skill gap Anda, silakan gunakan endpoint "
            "/api/gap-score dengan mengirimkan teks CV dan posisi yang dituju."
        )
        suggestions = ["Upload CV saya", "Lihat panduan penggunaan"]

    elif any(k in msg for k in ['rekomendasi', 'recommend', 'jalur', 'path', 'karier', 'career']):
        reply = (
            "Untuk rekomendasi jalur karier personal, gunakan endpoint "
            "/api/path-recommendation dengan daftar skill yang Anda miliki "
            "dan target role Anda."
        )
        suggestions = ["Buat rekomendasi jalur karier", "Cek skill trending"]

    else:
        total_rising = sum(
            1 for v in TREND_DATA.values() if v.get('trend_label') == 'RISING'
        )
        reply = (
            f"Halo! Saya adalah Career Advisor AI. Saat ini saya memantau "
            f"{len(TREND_DATA)} skill dengan {total_rising} skill yang sedang rising. "
            "Tanyakan kepada saya tentang tren skill, analisis gap CV, atau rekomendasi karier!"
        )
        suggestions = ["Skill apa yang sedang trending?", "Analisis gap CV saya",
                       "Rekomendasi jalur karier"]

    return jsonify({
        "status": "SUCCESS",
        "reply": reply,
        "suggestions": suggestions,
        "context": context
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
