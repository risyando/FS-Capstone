"""RUMAH KARIR — Flask Backend Entry Point."""
import os
# pyrefly: ignore [missing-import]
from flask import Flask
from flask_cors import CORS

from config import Config
from extensions import db, sess

# Import all models so SQLAlchemy registers them
from models import User, Company, Job, Experience, Partner, OtpCode, AppSetting, CvUpload  # noqa: F401

# Import blueprints
from routes.auth_routes import auth_bp
from routes.public_routes import public_bp
from routes.cv_routes import cv_bp
from routes.company_routes import company_bp
from routes.admin_routes import admin_bp
from routes.ai_routes import ai_bp


def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/static")
    app.config.from_object(Config)

    # Ensure directories exist
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "photos"), exist_ok=True)
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "logos"), exist_ok=True)
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "cvs"), exist_ok=True)
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "partners"), exist_ok=True)
    os.makedirs(os.path.join(app.instance_path), exist_ok=True)
    os.makedirs(app.config.get("SESSION_FILE_DIR", "instance/flask_session"), exist_ok=True)

    # Init extensions
    db.init_app(app)
    sess.init_app(app)

    # CORS — allow the Vite dev server
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5173",
    ])

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(cv_bp)
    app.register_blueprint(company_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(ai_bp)

    # Create tables & seed on first run
    with app.app_context():
        db.create_all()
        from seed import seed
        seed()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
