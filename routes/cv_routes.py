"""CV upload & matching route."""
import os
from flask import Blueprint, request, jsonify, current_app

from extensions import db
from models import Job, Company, CvUpload
from routes.helpers import login_required, save_upload, ALLOWED_PDF_EXT
from services.cv_service import (
    extract_text_from_pdf,
    extract_skills,
    extract_age,
    extract_experience_years,
    match_jobs,
    KNOWN_SKILLS,
)

cv_bp = Blueprint("cv", __name__, url_prefix="/api/cv")


@cv_bp.post("/upload")
@login_required
def upload_cv(user):
    file = request.files.get("cv")
    if not file or not file.filename:
        return jsonify(ok=False, error="File CV wajib diunggah."), 400

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_PDF_EXT:
        return jsonify(ok=False, error="Hanya file PDF yang diperbolehkan."), 400

    rel_path = save_upload(file, "cvs", ALLOWED_PDF_EXT)
    if not rel_path:
        return jsonify(ok=False, error="Gagal menyimpan file."), 500

    abs_path = os.path.join(current_app.config["UPLOAD_FOLDER"], "..", rel_path.replace("/", os.sep))
    # Normalise to static/uploads/cvs/...
    abs_path = os.path.join(os.path.dirname(current_app.config["UPLOAD_FOLDER"]), rel_path.replace("/", os.sep))

    text = extract_text_from_pdf(abs_path)
    skills = extract_skills(text)
    age = extract_age(text)
    exp_years = extract_experience_years(text)

    # Save to DB
    cv_rec = CvUpload(
        user_id=user.id,
        file_path=rel_path,
        parsed_text=text[:5000],
        parsed_skills=",".join(skills),
        parsed_age=age,
        parsed_experience_years=exp_years,
    )
    db.session.add(cv_rec)
    db.session.commit()

    # Match with active jobs
    active_jobs = (
        Job.query.filter_by(is_active=True)
        .join(Company)
        .filter(Company.is_approved == True)
        .all()
    )
    matches = match_jobs(skills, age, exp_years, active_jobs)

    has_good_match = any(m["score"] >= 60 for m in matches)

    # Suggest skills the user doesn't have but are popular in jobs
    all_job_skills = set()
    for j in active_jobs:
        for s in (j.skills or "").split(","):
            s = s.strip().lower()
            if s:
                all_job_skills.add(s)
    suggestions = sorted(all_job_skills - set(s.lower() for s in skills))[:8]

    return jsonify(
        ok=True,
        parsed={"age": age, "experience_years": exp_years, "skills": skills},
        has_good_match=has_good_match,
        suggestions=suggestions,
        matches=matches,
    )
