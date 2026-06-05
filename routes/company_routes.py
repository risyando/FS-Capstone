"""Company dashboard routes."""
from flask import Blueprint, request, jsonify

from extensions import db
from models import Job
from routes.helpers import company_required

company_bp = Blueprint("company", __name__, url_prefix="/api/company")


# ---- GET /api/company/me ---------------------------------------------
@company_bp.get("/me")
@company_required
def company_me(user):
    return jsonify(ok=True, company=user.company.to_dict())


# ---- GET /api/company/jobs --------------------------------------------
@company_bp.get("/jobs")
@company_required
def company_jobs(user):
    jobs = Job.query.filter_by(company_id=user.company.id).order_by(Job.created_at.desc()).all()
    items = []
    for j in jobs:
        items.append({
            "id": j.id,
            "title": j.title,
            "city": j.city,
            "country": j.country,
            "skills": j.skills,
            "is_active": j.is_active,
        })
    return jsonify(items=items)


# ---- POST /api/company/jobs ------------------------------------------
@company_bp.post("/jobs")
@company_required
def company_create_job(user):
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify(ok=False, error="Judul lowongan wajib diisi."), 400

    job = Job(
        company_id=user.company.id,
        title=title,
        description=data.get("description"),
        requirements=data.get("requirements"),
        skills=data.get("skills"),
        employment_type=data.get("employment_type", "Full-time"),
        min_experience=_int(data.get("min_experience")),
        min_age=_int(data.get("min_age")),
        max_age=_int(data.get("max_age")),
        salary_min=_int(data.get("salary_min")),
        salary_max=_int(data.get("salary_max")),
        country=data.get("country", "Indonesia"),
        province=data.get("province"),
        city=data.get("city"),
    )
    db.session.add(job)
    db.session.commit()
    return jsonify(ok=True, message="Lowongan berhasil disimpan.", id=job.id)


# ---- DELETE /api/company/jobs/<id> ------------------------------------
@company_bp.delete("/jobs/<int:job_id>")
@company_required
def company_delete_job(user, job_id):
    job = Job.query.get(job_id)
    if not job or job.company_id != user.company.id:
        return jsonify(ok=False, error="Lowongan tidak ditemukan atau bukan milik Anda."), 404
    db.session.delete(job)
    db.session.commit()
    return jsonify(ok=True, message="Lowongan dihapus.")


def _int(val):
    try:
        return int(val)
    except (TypeError, ValueError):
        return None
