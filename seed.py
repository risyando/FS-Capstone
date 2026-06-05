"""Seed data: admin, user, company accounts + dummy companies & jobs."""
from werkzeug.security import generate_password_hash
from extensions import db
from models import User, Company, Job, Experience, AppSetting


def seed():
    """Insert seed data if the database is empty."""
    if User.query.first() is not None:
        return  # already seeded

    # ---- Admin --------------------------------------------------------
    admin = User(
        full_name="Administrator",
        username="admin",
        email="admin@admin.com",
        password_hash=generate_password_hash("admin123"),
        role="admin",
        is_verified=True,
    )
    db.session.add(admin)
    db.session.flush()

    # ---- Regular user -------------------------------------------------
    user = User(
        full_name="Budi Santoso",
        username="budi",
        email="user@example.com",
        password_hash=generate_password_hash("user123"),
        role="user",
        birth_date="2000-05-15",
        is_verified=True,
    )
    db.session.add(user)
    db.session.flush()

    # ---- Company user & company ----------------------------------------
    comp_user = User(
        full_name="PT Solusi Teknologi",
        email="company@example.com",
        password_hash=generate_password_hash("company123"),
        role="company",
        is_verified=True,
    )
    db.session.add(comp_user)
    db.session.flush()

    c1 = Company(
        user_id=comp_user.id,
        name="PT Solusi Teknologi",
        industry="Technology",
        website="https://solusiteknologi.id",
        province="DKI Jakarta",
        city="Jakarta Selatan",
        country="Indonesia",
        address="Jl. Sudirman No. 10, Kebayoran Baru",
        description="Perusahaan teknologi yang fokus pada pengembangan solusi digital untuk bisnis enterprise di Indonesia.",
        employees="150-300",
        founded_year=2018,
        is_approved=True,
        search_count=42,
    )
    db.session.add(c1)
    db.session.flush()

    # ---- More dummy companies ------------------------------------------
    comp_user2 = User(
        full_name="PT Data Indonesia",
        email="data@example.com",
        password_hash=generate_password_hash("company123"),
        role="company",
        is_verified=True,
    )
    db.session.add(comp_user2)
    db.session.flush()
    c2 = Company(
        user_id=comp_user2.id,
        name="PT Data Indonesia",
        industry="Data & AI",
        website="https://dataindonesia.co.id",
        province="Jawa Barat",
        city="Bandung",
        country="Indonesia",
        address="Jl. Dago No. 45, Bandung",
        description="Perusahaan berbasis data yang menyediakan layanan analytics, machine learning, dan big data consulting.",
        employees="50-100",
        founded_year=2020,
        is_approved=True,
        search_count=28,
    )
    db.session.add(c2)
    db.session.flush()

    comp_user3 = User(
        full_name="Tokopintar",
        email="tokopintar@example.com",
        password_hash=generate_password_hash("company123"),
        role="company",
        is_verified=True,
    )
    db.session.add(comp_user3)
    db.session.flush()
    c3 = Company(
        user_id=comp_user3.id,
        name="Tokopintar",
        industry="E-commerce",
        website="https://tokopintar.com",
        province="DKI Jakarta",
        city="Jakarta Pusat",
        country="Indonesia",
        address="Jl. Thamrin No. 22",
        description="Platform e-commerce terdepan yang menghubungkan jutaan penjual dan pembeli di seluruh Indonesia.",
        employees="500-1000",
        founded_year=2015,
        is_approved=True,
        search_count=65,
    )
    db.session.add(c3)
    db.session.flush()

    comp_user4 = User(
        full_name="CloudAsia",
        email="cloudasia@example.com",
        password_hash=generate_password_hash("company123"),
        role="company",
        is_verified=True,
    )
    db.session.add(comp_user4)
    db.session.flush()
    c4 = Company(
        user_id=comp_user4.id,
        name="CloudAsia",
        industry="Cloud Computing",
        website="https://cloudasia.io",
        province="Banten",
        city="Tangerang",
        country="Indonesia",
        address="BSD City, Green Office Park",
        description="Penyedia infrastruktur cloud dan DevOps consulting untuk startup dan enterprise di Asia Tenggara.",
        employees="80-150",
        founded_year=2019,
        is_approved=True,
        search_count=33,
    )
    db.session.add(c4)
    db.session.flush()

    # ---- Jobs ----------------------------------------------------------
    jobs_data = [
        # PT Solusi Teknologi
        dict(company_id=c1.id, title="Backend Developer", description="Membangun REST API scalable menggunakan Python/Flask dan PostgreSQL. Bertanggung jawab atas arsitektur microservices.", requirements="Menguasai Python, SQL, dan REST API. Pengalaman dengan Docker menjadi nilai plus.", skills="python, flask, sql, docker, rest api", employment_type="Full-time", min_experience=1, min_age=20, max_age=35, salary_min=6000000, salary_max=12000000, country="Indonesia", province="DKI Jakarta", city="Jakarta Selatan"),
        dict(company_id=c1.id, title="Frontend React Developer", description="Mengembangkan antarmuka web modern menggunakan React dan TypeScript.", requirements="Menguasai React, JavaScript/TypeScript, CSS, dan responsive design.", skills="react, javascript, typescript, css, html", employment_type="Full-time", min_experience=1, min_age=20, max_age=30, salary_min=7000000, salary_max=14000000, country="Indonesia", province="DKI Jakarta", city="Jakarta Selatan"),
        dict(company_id=c1.id, title="DevOps Engineer", description="Mengelola CI/CD pipeline, infrastruktur cloud, dan monitoring.", requirements="Pengalaman dengan AWS/GCP, Docker, Kubernetes, dan Linux.", skills="docker, kubernetes, aws, linux, ci/cd, terraform", employment_type="Full-time", min_experience=2, min_age=22, max_age=40, salary_min=10000000, salary_max=20000000, country="Indonesia", province="DKI Jakarta", city="Jakarta Selatan"),
        # PT Data Indonesia
        dict(company_id=c2.id, title="Junior Data Scientist", description="Menganalisis data bisnis dan membangun model machine learning untuk prediksi.", requirements="Familiar dengan Python, Pandas, dan scikit-learn. Fresh graduate dipersilakan.", skills="python, machine learning, pandas, sql, scikit-learn", employment_type="Full-time", min_experience=0, min_age=20, max_age=28, salary_min=5000000, salary_max=9000000, country="Indonesia", province="Jawa Barat", city="Bandung"),
        dict(company_id=c2.id, title="Data Engineer", description="Membangun dan mengelola data pipeline, ETL proses, dan data warehouse.", requirements="Menguasai SQL, Python, dan tools ETL. Pengalaman dengan Spark menjadi plus.", skills="python, sql, etl, data engineering, postgresql", employment_type="Full-time", min_experience=2, min_age=22, max_age=35, salary_min=8000000, salary_max=16000000, country="Indonesia", province="Jawa Barat", city="Bandung"),
        # Tokopintar
        dict(company_id=c3.id, title="Fullstack Engineer", description="Mengembangkan fitur e-commerce dari frontend hingga backend.", requirements="Menguasai React, Node.js, dan PostgreSQL.", skills="react, node.js, javascript, postgresql, rest api", employment_type="Full-time", min_experience=2, min_age=22, max_age=35, salary_min=10000000, salary_max=20000000, country="Indonesia", province="DKI Jakarta", city="Jakarta Pusat"),
        dict(company_id=c3.id, title="Mobile Developer (React Native)", description="Mengembangkan aplikasi mobile cross-platform untuk marketplace.", requirements="Pengalaman React Native minimal 1 tahun.", skills="react, javascript, react native, firebase", employment_type="Full-time", min_experience=1, min_age=20, max_age=32, salary_min=8000000, salary_max=16000000, country="Indonesia", province="DKI Jakarta", city="Jakarta Pusat"),
        dict(company_id=c3.id, title="QA Engineer", description="Melakukan testing manual dan automasi untuk fitur e-commerce.", requirements="Familiar dengan Selenium, Cypress, atau tools testing lainnya.", skills="javascript, python, agile, jira", employment_type="Full-time", min_experience=1, min_age=20, max_age=30, salary_min=6000000, salary_max=11000000, country="Indonesia", province="DKI Jakarta", city="Jakarta Pusat"),
        # CloudAsia
        dict(company_id=c4.id, title="Cloud Solutions Architect", description="Merancang arsitektur cloud untuk klien enterprise.", requirements="Sertifikasi AWS/GCP diutamakan. Pengalaman minimal 3 tahun.", skills="aws, gcp, terraform, docker, kubernetes, linux", employment_type="Full-time", min_experience=3, min_age=25, max_age=45, salary_min=15000000, salary_max=30000000, country="Indonesia", province="Banten", city="Tangerang"),
        dict(company_id=c4.id, title="Site Reliability Engineer", description="Memastikan uptime 99.9% layanan cloud dan mengelola incident response.", requirements="Menguasai Linux, monitoring tools, dan scripting.", skills="linux, docker, kubernetes, python, bash, ci/cd", employment_type="Full-time", min_experience=2, min_age=22, max_age=38, salary_min=12000000, salary_max=22000000, country="Indonesia", province="Banten", city="Tangerang"),
        # Remote / international
        dict(company_id=c1.id, title="Remote Python Developer", description="Bekerja secara remote membangun microservices untuk klien internasional.", requirements="Bahasa Inggris aktif, menguasai Python dan cloud.", skills="python, fastapi, docker, aws, git", employment_type="Remote", min_experience=2, min_age=22, max_age=40, salary_min=15000000, salary_max=30000000, country="Worldwide", province="", city="Remote"),
        dict(company_id=c2.id, title="ML Engineer Intern", description="Program magang 6 bulan untuk mahasiswa/fresh graduate di bidang Machine Learning.", requirements="Sedang kuliah semester akhir atau baru lulus. Familiar dengan Python dan ML basics.", skills="python, machine learning, tensorflow, numpy, pandas", employment_type="Internship", min_experience=0, min_age=18, max_age=25, salary_min=2000000, salary_max=4000000, country="Indonesia", province="Jawa Barat", city="Bandung"),
    ]

    for jd in jobs_data:
        db.session.add(Job(**jd))

    # ---- Sample experience ---------------------------------------------
    db.session.add(Experience(
        user_id=user.id,
        title="Pengalaman Pertama Pakai RUMAH KARIR",
        rating=5,
        body="Saya sangat terbantu! Dalam seminggu upload CV, saya sudah dapat 3 panggilan interview. Fitur matching-nya akurat sekali.",
    ))

    # ---- App settings --------------------------------------------------
    db.session.add(AppSetting(key="maintenance_mode", value="0"))

    db.session.commit()
    print("[OK] Seed data berhasil dimuat!")
