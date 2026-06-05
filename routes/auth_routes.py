"""Auth routes: register, login, logout, me, verify-otp, resend-otp."""
import random
from datetime import datetime, timedelta, timezone

from flask import Blueprint, request, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db
from models import User, Company, OtpCode
from routes.helpers import current_user, save_upload, ALLOWED_IMAGE_EXT

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _generate_otp() -> str:
    return str(random.randint(100000, 999999))


# ---- GET /api/auth/me -------------------------------------------------
@auth_bp.get("/me")
def me():
    u = current_user()
    if u is None:
        return jsonify(ok=False, error="Belum login"), 401
    return jsonify(ok=True, user=u.to_public())


# ---- POST /api/auth/login ---------------------------------------------
@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify(ok=False, error="Email dan password wajib diisi."), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify(ok=False, error="Email atau password salah."), 401

    if not user.is_verified:
        return jsonify(ok=False, error="Akun belum diverifikasi. Silakan verifikasi OTP."), 403

    if user.role == "company" and user.company and not user.company.is_approved:
        return jsonify(ok=False, error="Perusahaan Anda belum di-approve oleh admin."), 403

    session["user_id"] = user.id

    redirect_map = {"admin": "/admin", "company": "/company", "user": "/"}
    return jsonify(
        ok=True,
        user={"id": user.id, "email": user.email, "role": user.role},
        redirect=redirect_map.get(user.role, "/"),
    )


# ---- POST /api/auth/logout --------------------------------------------
@auth_bp.post("/logout")
def logout():
    session.pop("user_id", None)
    return jsonify(ok=True, message="Berhasil logout.")


# ---- POST /api/auth/register ------------------------------------------
@auth_bp.post("/register")
def register():
    # Accept FormData (file uploads) or JSON
    role = request.form.get("role", "user")
    email = (request.form.get("email") or "").strip().lower()
    password = request.form.get("password") or ""

    if not email or not password:
        return jsonify(ok=False, error="Email dan password wajib diisi."), 400
    if len(password) < 6:
        return jsonify(ok=False, error="Password minimal 6 karakter."), 400
    if User.query.filter_by(email=email).first():
        return jsonify(ok=False, error="Email sudah digunakan."), 400

    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        role=role,
        full_name=request.form.get("full_name"),
        username=request.form.get("username"),
        birth_date=request.form.get("birth_date"),
        is_verified=False,
    )

    # Photo upload (user)
    photo = request.files.get("photo")
    if photo:
        path = save_upload(photo, "photos", ALLOWED_IMAGE_EXT)
        if path:
            user.photo_path = path

    db.session.add(user)
    db.session.flush()  # get user.id

    # Company data
    if role == "company":
        logo = request.files.get("logo")
        logo_path = save_upload(logo, "logos", ALLOWED_IMAGE_EXT) if logo else None
        comp = Company(
            user_id=user.id,
            name=request.form.get("company_name") or email,
            industry=request.form.get("industry"),
            website=request.form.get("website"),
            province=request.form.get("province"),
            city=request.form.get("city"),
            address=request.form.get("address"),
            description=request.form.get("description"),
            logo_path=logo_path,
            is_approved=False,
        )
        db.session.add(comp)

    # Generate OTP
    code = _generate_otp()
    otp = OtpCode(
        user_id=user.id,
        code=code,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    db.session.add(otp)
    db.session.commit()

    # In dev mode, return OTP in response (no SMTP)
    return jsonify(
        ok=True,
        message="Registrasi berhasil! Silakan verifikasi OTP.",
        email=email,
        otp_sent_via_smtp=False,
        dev_otp_notice="OTP tidak dikirim via email (SMTP belum dikonfigurasi). Gunakan kode berikut.",
        dev_otp=code,
    ), 201


# ---- POST /api/auth/verify-otp ----------------------------------------
@auth_bp.post("/verify-otp")
def verify_otp():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    code = (data.get("code") or "").strip()
    if not email or not code:
        return jsonify(ok=False, error="Email dan kode OTP wajib diisi."), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify(ok=False, error="Email tidak ditemukan."), 404

    otp = (
        OtpCode.query.filter_by(user_id=user.id, code=code, is_used=False)
        .order_by(OtpCode.created_at.desc())
        .first()
    )
    if not otp:
        return jsonify(ok=False, error="Kode OTP tidak valid."), 400

    now = datetime.now(timezone.utc)
    if otp.expires_at.replace(tzinfo=timezone.utc) < now:
        return jsonify(ok=False, error="Kode OTP sudah kadaluarsa."), 400

    otp.is_used = True
    user.is_verified = True
    db.session.commit()
    return jsonify(ok=True, message="Verifikasi berhasil! Silakan login.")


# ---- POST /api/auth/resend-otp ----------------------------------------
@auth_bp.post("/resend-otp")
def resend_otp():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify(ok=False, error="Email wajib diisi."), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify(ok=False, error="Email tidak ditemukan."), 404

    code = _generate_otp()
    otp = OtpCode(
        user_id=user.id,
        code=code,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    db.session.add(otp)
    db.session.commit()

    return jsonify(
        ok=True,
        message="Kode OTP baru telah dikirim.",
        otp_sent_via_smtp=False,
        dev_otp_notice="OTP tidak dikirim via email (SMTP belum dikonfigurasi). Gunakan kode berikut.",
        dev_otp=code,
    )
