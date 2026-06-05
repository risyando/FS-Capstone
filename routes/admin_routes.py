"""Admin routes: full CRUD for users, companies, jobs, partners, experiences, maintenance."""
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from sqlalchemy import or_

from extensions import db
from models import User, Company, Job, Partner, Experience, AppSetting
from routes.helpers import admin_required, save_upload, ALLOWED_IMAGE_EXT

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _int(val):
    try:
        return int(val)
    except (TypeError, ValueError):
        return None


# ====================== STATS ==========================================
@admin_bp.get("/stats")
@admin_required
def admin_stats(user):
    maint = AppSetting.query.get("maintenance_mode")
    return jsonify(
        users=User.query.count(),
        verified_users=User.query.filter_by(is_verified=True).count(),
        companies=Company.query.filter_by(is_approved=True).count(),
        pending_companies=Company.query.filter_by(is_approved=False).count(),
        jobs=Job.query.filter_by(is_active=True).count(),
        partners=Partner.query.count(),
        experiences=Experience.query.count(),
        maintenance=maint.value == "1" if maint else False,
    )


# ====================== USERS ==========================================
@admin_bp.get("/users")
@admin_required
def list_users(user):
    q = request.args.get("q", "").strip()
    query = User.query
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(User.email.ilike(like), User.full_name.ilike(like), User.username.ilike(like))
        )
    users = query.order_by(User.created_at.desc()).all()
    return jsonify(items=[u.to_public() for u in users])


@admin_bp.put("/users/<int:uid>")
@admin_required
def update_user(admin, uid):
    u = User.query.get(uid)
    if not u:
        return jsonify(ok=False, error="User tidak ditemukan."), 404
    data = request.get_json(silent=True) or {}
    if data.get("full_name"):
        u.full_name = data["full_name"]
    if data.get("username"):
        u.username = data["username"]
    if data.get("email"):
        u.email = data["email"]
    if data.get("birth_date"):
        u.birth_date = data["birth_date"]
    if data.get("password"):
        u.password_hash = generate_password_hash(data["password"])
    db.session.commit()
    return jsonify(ok=True, message="User diperbarui.")


@admin_bp.delete("/users/<int:uid>")
@admin_required
def delete_user(admin, uid):
    u = User.query.get(uid)
    if not u:
        return jsonify(ok=False, error="User tidak ditemukan."), 404
    db.session.delete(u)
    db.session.commit()
    return jsonify(ok=True, message="User dihapus.")


# ---- Approve company --------------------------------------------------
@admin_bp.post("/users/<int:uid>/approve")
@admin_required
def approve_company(admin, uid):
    u = User.query.get(uid)
    if not u or u.role != "company" or not u.company:
        return jsonify(ok=False, error="User / company tidak ditemukan."), 404
    u.company.is_approved = True
    db.session.commit()
    return jsonify(ok=True, message="Perusahaan telah di-approve.")


# ====================== COMPANIES ======================================
@admin_bp.get("/companies")
@admin_required
def list_companies(admin):
    q = request.args.get("q", "").strip()
    query = Company.query
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(Company.name.ilike(like), Company.industry.ilike(like), Company.city.ilike(like))
        )
    companies = query.order_by(Company.created_at.desc()).all()
    return jsonify(items=[c.to_dict() for c in companies])


@admin_bp.post("/companies")
@admin_required
def create_company(admin):
    name = request.form.get("name") or ""
    if not name.strip():
        return jsonify(ok=False, error="Nama perusahaan wajib diisi."), 400

    logo = request.files.get("logo")
    logo_path = save_upload(logo, "logos", ALLOWED_IMAGE_EXT) if logo else None

    comp = Company(
        user_id=admin.id,
        name=name.strip(),
        industry=request.form.get("industry"),
        website=request.form.get("website"),
        province=request.form.get("province"),
        city=request.form.get("city"),
        country=request.form.get("country", "Indonesia"),
        address=request.form.get("address"),
        description=request.form.get("description"),
        logo_path=logo_path,
        employees=request.form.get("employees"),
        founded_year=_int(request.form.get("founded_year")),
        is_approved=True,
    )
    db.session.add(comp)
    db.session.commit()
    return jsonify(ok=True, message="Perusahaan ditambahkan.", id=comp.id)


@admin_bp.put("/companies/<int:cid>")
@admin_required
def update_company(admin, cid):
    c = Company.query.get(cid)
    if not c:
        return jsonify(ok=False, error="Perusahaan tidak ditemukan."), 404

    name = request.form.get("name")
    if name:
        c.name = name.strip()
    for field in ["industry", "website", "province", "city", "country", "address", "description", "employees"]:
        val = request.form.get(field)
        if val is not None:
            setattr(c, field, val)
    fy = request.form.get("founded_year")
    if fy:
        c.founded_year = _int(fy)

    logo = request.files.get("logo")
    if logo and logo.filename:
        path = save_upload(logo, "logos", ALLOWED_IMAGE_EXT)
        if path:
            c.logo_path = path

    db.session.commit()
    return jsonify(ok=True, message="Perusahaan diperbarui.")


@admin_bp.delete("/companies/<int:cid>")
@admin_required
def delete_company(admin, cid):
    c = Company.query.get(cid)
    if not c:
        return jsonify(ok=False, error="Perusahaan tidak ditemukan."), 404
    db.session.delete(c)
    db.session.commit()
    return jsonify(ok=True, message="Perusahaan dihapus.")


# ---- Pending companies -----------------------------------------------
@admin_bp.get("/pending-companies")
@admin_required
def pending_companies(admin):
    pending = Company.query.filter_by(is_approved=False).all()
    items = []
    for c in pending:
        d = c.to_dict()
        d["email"] = c.owner.email if c.owner else ""
        items.append(d)
    return jsonify(items=items)


# ====================== JOBS ============================================
@admin_bp.get("/jobs")
@admin_required
def list_admin_jobs(admin):
    q = request.args.get("q", "").strip()
    query = Job.query.join(Company)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(Job.title.ilike(like), Job.skills.ilike(like), Company.name.ilike(like))
        )
    jobs = query.order_by(Job.created_at.desc()).all()
    return jsonify(items=[
        {
            "id": j.id,
            "title": j.title,
            "company_name": j.company.name if j.company else "",
            "city": j.city,
            "country": j.country,
            "skills": j.skills,
        }
        for j in jobs
    ])


@admin_bp.post("/jobs")
@admin_required
def create_admin_job(admin):
    data = request.get_json(silent=True) or {}
    cid = _int(data.get("company_id"))
    title = (data.get("title") or "").strip()
    if not cid or not title:
        return jsonify(ok=False, error="Perusahaan dan judul wajib diisi."), 400

    job = Job(
        company_id=cid,
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
    return jsonify(ok=True, message="Lowongan ditambahkan.", id=job.id)


@admin_bp.delete("/jobs/<int:jid>")
@admin_required
def delete_admin_job(admin, jid):
    j = Job.query.get(jid)
    if not j:
        return jsonify(ok=False, error="Lowongan tidak ditemukan."), 404
    db.session.delete(j)
    db.session.commit()
    return jsonify(ok=True, message="Lowongan dihapus.")


# ====================== EXPERIENCES =====================================
@admin_bp.get("/experiences")
@admin_required
def list_admin_experiences(admin):
    exps = Experience.query.join(User).order_by(Experience.created_at.desc()).all()
    items = []
    for e in exps:
        items.append({
            "id": e.id,
            "full_name": e.author.full_name,
            "email": e.author.email,
            "rating": e.rating,
            "title": e.title,
            "body": e.body,
            "created_at": str(e.created_at),
        })
    return jsonify(items=items)


@admin_bp.delete("/experiences/<int:eid>")
@admin_required
def delete_experience(admin, eid):
    e = Experience.query.get(eid)
    if not e:
        return jsonify(ok=False, error="Pengalaman tidak ditemukan."), 404
    db.session.delete(e)
    db.session.commit()
    return jsonify(ok=True, message="Pengalaman dihapus.")


# ====================== PARTNERS =======================================
@admin_bp.post("/partners")
@admin_required
def create_partner(admin):
    image = request.files.get("image")
    if not image or not image.filename:
        return jsonify(ok=False, error="Gambar wajib diunggah."), 400
    path = save_upload(image, "partners", ALLOWED_IMAGE_EXT)
    if not path:
        return jsonify(ok=False, error="Format gambar tidak valid."), 400

    p = Partner(
        name=request.form.get("name"),
        link=request.form.get("link"),
        image_path=path,
    )
    db.session.add(p)
    db.session.commit()
    return jsonify(ok=True, message="Mitra ditambahkan.")


@admin_bp.delete("/partners/<int:pid>")
@admin_required
def delete_partner(admin, pid):
    p = Partner.query.get(pid)
    if not p:
        return jsonify(ok=False, error="Mitra tidak ditemukan."), 404
    db.session.delete(p)
    db.session.commit()
    return jsonify(ok=True, message="Mitra dihapus.")


# ====================== MAINTENANCE ====================================
@admin_bp.get("/maintenance")
@admin_required
def get_maintenance(admin):
    s = AppSetting.query.get("maintenance_mode")
    return jsonify(enabled=s.value == "1" if s else False)


@admin_bp.post("/maintenance")
@admin_required
def set_maintenance(admin):
    data = request.get_json(silent=True) or {}
    enabled = bool(data.get("enabled", False))
    s = AppSetting.query.get("maintenance_mode")
    if s:
        s.value = "1" if enabled else "0"
    else:
        s = AppSetting(key="maintenance_mode", value="1" if enabled else "0")
        db.session.add(s)
    db.session.commit()
    return jsonify(ok=True, enabled=enabled)
