"""Public routes: jobs, stats, locations, companies, partners, experiences."""
from flask import Blueprint, request, jsonify, session
from sqlalchemy import or_

from extensions import db
from models import Job, Company, Partner, Experience, User

public_bp = Blueprint("public", __name__, url_prefix="/api")

PROVINCES = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi",
    "Sumatera Selatan", "Bengkulu", "Lampung", "Kepulauan Bangka Belitung",
    "Kepulauan Riau", "DKI Jakarta", "Jawa Barat", "Jawa Tengah",
    "DI Yogyakarta", "Jawa Timur", "Banten", "Bali",
    "Nusa Tenggara Barat", "Nusa Tenggara Timur",
    "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan",
    "Kalimantan Timur", "Kalimantan Utara",
    "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan",
    "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat",
    "Maluku", "Maluku Utara", "Papua", "Papua Barat",
    "Papua Selatan", "Papua Tengah", "Papua Pegunungan",
]


# ---- GET /api/locations/provinces ------------------------------------
@public_bp.get("/locations/provinces")
def provinces():
    return jsonify(items=PROVINCES)


# ---- GET /api/stats --------------------------------------------------
@public_bp.get("/stats")
def stats():
    users_count = User.query.filter_by(role="user").count()
    companies_count = Company.query.filter_by(is_approved=True).count()
    jobs_count = Job.query.filter_by(is_active=True).count()
    return jsonify(users=users_count, companies=companies_count, jobs=jobs_count)


# ---- GET /api/jobs ---------------------------------------------------
@public_bp.get("/jobs")
def list_jobs():
    q = request.args.get("q", "").strip()
    country = request.args.get("country", "").strip()
    province = request.args.get("province", "").strip()
    city = request.args.get("city", "").strip()
    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(100, request.args.get("per_page", 24, type=int))

    query = Job.query.filter_by(is_active=True).join(Company).filter(Company.is_approved == True)

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Job.title.ilike(like),
                Job.skills.ilike(like),
                Company.name.ilike(like),
            )
        )
    if country:
        query = query.filter(Job.country.ilike(f"%{country}%"))
    if province:
        query = query.filter(Job.province.ilike(f"%{province}%"))
    if city:
        query = query.filter(Job.city.ilike(f"%{city}%"))

    total = query.count()
    jobs = query.order_by(Job.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    logged_in = session.get("user_id") is not None
    items = [j.to_card(locked=not logged_in) for j in jobs]

    return jsonify(items=items, total=total, page=page, per_page=per_page)


# ---- GET /api/jobs/<id> ----------------------------------------------
@public_bp.get("/jobs/<int:job_id>")
def job_detail(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify(ok=False, error="Lowongan tidak ditemukan."), 404

    # Increment search count
    if job.company:
        job.company.search_count = (job.company.search_count or 0) + 1
        db.session.commit()

    logged_in = session.get("user_id") is not None
    return jsonify(item=job.to_detail(locked=not logged_in))


# ---- GET /api/companies/top-openings ---------------------------------
@public_bp.get("/companies/top-openings")
def top_openings():
    companies = Company.query.filter_by(is_approved=True).all()
    result = []
    for c in companies:
        active = sum(1 for j in c.jobs if j.is_active)
        result.append({
            "id": c.id, "name": c.name, "industry": c.industry,
            "open_jobs": active,
        })
    result.sort(key=lambda x: x["open_jobs"], reverse=True)
    return jsonify(items=result[:10])


# ---- GET /api/companies/top-searched ---------------------------------
@public_bp.get("/companies/top-searched")
def top_searched():
    companies = (
        Company.query.filter_by(is_approved=True)
        .order_by(Company.search_count.desc())
        .limit(10)
        .all()
    )
    return jsonify(items=[
        {"id": c.id, "name": c.name, "industry": c.industry, "search_count": c.search_count}
        for c in companies
    ])


# ---- GET /api/partners -----------------------------------------------
@public_bp.get("/partners")
def list_partners():
    items = Partner.query.order_by(Partner.created_at.desc()).all()
    return jsonify(items=[
        {"id": p.id, "name": p.name, "link": p.link, "image_path": p.image_path}
        for p in items
    ])


# ---- GET /api/experiences (public) ------------------------------------
@public_bp.get("/experiences")
def list_experiences():
    exps = (
        Experience.query.join(User)
        .order_by(Experience.created_at.desc())
        .limit(20)
        .all()
    )
    items = []
    for e in exps:
        items.append({
            "id": e.id,
            "full_name": e.author.full_name,
            "photo_path": e.author.photo_path,
            "title": e.title,
            "rating": e.rating,
            "body": e.body,
            "created_at": str(e.created_at),
        })
    return jsonify(items=items)


# ---- POST /api/experiences (user, login required) ---------------------
@public_bp.post("/experiences")
def create_experience():
    uid = session.get("user_id")
    if not uid:
        return jsonify(ok=False, error="Silakan login terlebih dahulu."), 401

    data = request.get_json(silent=True) or {}
    body = (data.get("body") or "").strip()
    if len(body) < 10:
        return jsonify(ok=False, error="Cerita minimal 10 karakter."), 400

    exp = Experience(
        user_id=uid,
        title=data.get("title"),
        rating=min(5, max(1, int(data.get("rating") or 5))),
        body=body,
    )
    db.session.add(exp)
    db.session.commit()
    return jsonify(ok=True, message="Terima kasih! Pengalaman Anda telah dibagikan.")
