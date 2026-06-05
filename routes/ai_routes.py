"""AI Engineer Routes — blueprint untuk fitur AI Career Advisor.

Endpoints:
  GET  /api/ai/skill-trends
  POST /api/ai/extract-cv
  POST /api/ai/gap-score
  POST /api/ai/path-recommendation
  POST /api/ai/career-chatbot
"""
import time
from flask import Blueprint, request, jsonify

from services.ai_service import (
    load_skill_trends,
    extract_skills_from_text,
    compute_skill_gap,
    ranking_engine,
    build_learning_path,
    generate_chatbot_reply,
)

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


# ─── Skill Trends ─────────────────────────────────────────────────────────────
@ai_bp.get("/skill-trends")
def skill_trends():
    """Kembalikan data tren skill, opsional difilter by label."""
    trend_data = load_skill_trends()
    label = request.args.get("label")
    limit = int(request.args.get("limit", 50))

    data = [
        {"skill": k, **v}
        for k, v in trend_data.items()
        if not label or v.get("trend_label", "").upper() == label.upper()
    ]
    data.sort(key=lambda x: x.get("growth_pct", 0), reverse=True)

    return jsonify({
        "status": "SUCCESS",
        "note": "Data tren skill pasar kerja. Tidak mempengaruhi gap scoring.",
        "filter_label": label,
        "total": len(data),
        "trends": data[:limit],
    })


# ─── Extract CV Skills ────────────────────────────────────────────────────────
@ai_bp.post("/extract-cv")
def extract_cv():
    """Ekstrak skill dari teks CV yang dikirimkan."""
    t0 = time.time()
    try:
        data = request.get_json() or {}
        cv_text = data.get("cv_text", "").strip()

        if not cv_text:
            return jsonify({"error": "cv_text is required"}), 400

        skills = extract_skills_from_text(cv_text)
        return jsonify({
            "status": "SUCCESS",
            "skills_detected": skills,
            "skill_count": len(skills),
            "word_count": len(cv_text.split()),
            "latency_ms": round((time.time() - t0) * 1000, 1),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Gap Score ────────────────────────────────────────────────────────────────
@ai_bp.post("/gap-score")
def gap_score():
    """Hitung skill gap antara teks CV dan target role."""
    try:
        data = request.get_json() or {}
        cv_text = data.get("cv_text", "").strip()
        target_role = data.get("target_role", "").strip()
        top_n = int(data.get("top_n", 10))

        if not cv_text or not target_role:
            return jsonify({"error": "cv_text and target_role are required"}), 400

        gap_result = compute_skill_gap(cv_text, target_role)
        ranked = ranking_engine(gap_result, top_n=top_n)
        gap_result["ranked_recommendations"] = ranked
        return jsonify(gap_result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Path Recommendation ──────────────────────────────────────────────────────
@ai_bp.post("/path-recommendation")
def path_recommendation():
    """Rekomendasikan jalur belajar dari current_skills ke target_role."""
    try:
        data = request.get_json() or {}
        current_skills = data.get("current_skills", [])
        target_role = data.get("target_role", "").strip()

        if not target_role:
            return jsonify({"error": "target_role is required"}), 400

        result = build_learning_path(current_skills, target_role)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Career Chatbot ───────────────────────────────────────────────────────────
@ai_bp.post("/career-chatbot")
def career_chatbot():
    """Chatbot career advisor berbasis aturan + data tren."""
    try:
        data = request.get_json() or {}
        message = data.get("message", "").strip()
        context = data.get("context", None)

        if not message:
            return jsonify({"error": "message is required"}), 400

        result = generate_chatbot_reply(message, context)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
