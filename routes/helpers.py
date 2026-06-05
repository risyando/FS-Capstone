"""Shared helpers for route blueprints."""
import os
import uuid
from functools import wraps
from flask import session, jsonify, current_app
from models import User


def current_user() -> User | None:
    uid = session.get("user_id")
    if uid is None:
        return None
    return User.query.get(uid)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        u = current_user()
        if u is None:
            return jsonify(ok=False, error="Silakan login terlebih dahulu."), 401
        return f(u, *args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        u = current_user()
        if u is None:
            return jsonify(ok=False, error="Silakan login terlebih dahulu."), 401
        if u.role != "admin":
            return jsonify(ok=False, error="Akses ditolak."), 403
        return f(u, *args, **kwargs)
    return decorated


def company_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        u = current_user()
        if u is None:
            return jsonify(ok=False, error="Silakan login terlebih dahulu."), 401
        if u.role != "company":
            return jsonify(ok=False, error="Akses ditolak."), 403
        if not u.company:
            return jsonify(ok=False, error="Data perusahaan tidak ditemukan."), 404
        return f(u, *args, **kwargs)
    return decorated


ALLOWED_IMAGE_EXT = {"png", "jpg", "jpeg", "webp", "gif"}
ALLOWED_PDF_EXT = {"pdf"}


def _ext(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def save_upload(file_storage, subfolder: str, allowed_exts: set) -> str | None:
    """Save an uploaded file; returns relative path from static/ or None."""
    if not file_storage or not file_storage.filename:
        return None
    ext = _ext(file_storage.filename)
    if ext not in allowed_exts:
        return None
    folder = os.path.join(current_app.config["UPLOAD_FOLDER"], subfolder)
    os.makedirs(folder, exist_ok=True)
    unique = f"{uuid.uuid4().hex}.{ext}"
    dest = os.path.join(folder, unique)
    file_storage.save(dest)
    return f"uploads/{subfolder}/{unique}"
