"""CV parsing and job-matching service."""
import re
import os

# Try pdfplumber first, fall back to PyPDF2
try:
    import pdfplumber
    PDF_ENGINE = "pdfplumber"
except ImportError:
    pdfplumber = None
    try:
        from PyPDF2 import PdfReader
        PDF_ENGINE = "pypdf2"
    except ImportError:
        PDF_ENGINE = None

# -------------------------------------------------------------------
# Skill dictionary – used for extraction AND for missing-skill suggestions
# -------------------------------------------------------------------
KNOWN_SKILLS = [
    "python", "java", "javascript", "typescript", "go", "rust", "c++", "c#",
    "ruby", "php", "swift", "kotlin", "dart", "scala", "r", "matlab",
    "html", "css", "react", "vue", "angular", "svelte", "next.js", "nuxt",
    "node.js", "express", "flask", "django", "fastapi", "spring", "laravel",
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "ansible",
    "git", "github", "gitlab", "ci/cd", "jenkins", "linux", "bash",
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "data analysis", "data engineering", "etl", "power bi", "tableau",
    "figma", "adobe", "photoshop", "illustrator",
    "agile", "scrum", "jira", "project management",
    "rest api", "graphql", "grpc", "microservices",
    "firebase", "supabase", "vercel", "heroku", "railway",
]


def extract_text_from_pdf(filepath: str) -> str:
    """Return all text from a PDF file."""
    if PDF_ENGINE == "pdfplumber":
        with pdfplumber.open(filepath) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages)
    elif PDF_ENGINE == "pypdf2":
        reader = PdfReader(filepath)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    return ""


def extract_skills(text: str) -> list[str]:
    lower = text.lower()
    found = []
    for sk in KNOWN_SKILLS:
        if sk in lower:
            found.append(sk)
    return sorted(set(found))


def extract_age(text: str) -> int | None:
    """Try to find an age or birth year in the text."""
    # Pattern: "Umur: 25" or "Age: 25" or "25 tahun"
    m = re.search(r"(?:umur|age|usia)\s*[:\-]?\s*(\d{2})", text, re.I)
    if m:
        age = int(m.group(1))
        if 15 <= age <= 70:
            return age
    m = re.search(r"(\d{2})\s*tahun", text, re.I)
    if m:
        age = int(m.group(1))
        if 15 <= age <= 70:
            return age
    # Try birth year
    from datetime import datetime
    m = re.search(r"(?:lahir|born|ttl)[^\d]{0,20}(\d{4})", text, re.I)
    if m:
        year = int(m.group(1))
        if 1950 <= year <= 2010:
            return datetime.now().year - year
    return None


def extract_experience_years(text: str) -> int:
    """Estimate total years of experience."""
    total = 0
    # "X tahun pengalaman" or "X years"
    for m in re.finditer(r"(\d+)\s*(?:tahun|year|yr)", text, re.I):
        total += int(m.group(1))
    if total:
        return min(total, 40)
    return 0


def match_jobs(parsed_skills, parsed_age, parsed_exp, active_jobs) -> list[dict]:
    """
    Match CV data against active jobs.
    Scoring: 70 % skill, 20 % experience, 10 % age.
    Returns sorted list of match dicts.
    """
    results = []
    cv_skills_set = set(s.lower().strip() for s in parsed_skills)

    for job in active_jobs:
        job_skills_raw = [s.strip().lower() for s in (job.skills or "").split(",") if s.strip()]
        job_skills_set = set(job_skills_raw)

        # Skill score (70 %)
        if job_skills_set:
            matched = cv_skills_set & job_skills_set
            skill_score = len(matched) / len(job_skills_set) * 70
        else:
            matched = set()
            skill_score = 35  # neutral

        # Experience score (20 %)
        min_exp = job.min_experience or 0
        if min_exp == 0:
            exp_score = 20
        elif parsed_exp >= min_exp:
            exp_score = 20
        else:
            exp_score = max(0, 20 * parsed_exp / min_exp)

        # Age score (10 %)
        if parsed_age and (job.min_age or job.max_age):
            in_range = True
            if job.min_age and parsed_age < job.min_age:
                in_range = False
            if job.max_age and parsed_age > job.max_age:
                in_range = False
            age_score = 10 if in_range else 0
        else:
            age_score = 5  # neutral

        score = round(skill_score + exp_score + age_score)
        missing = sorted(job_skills_set - cv_skills_set)
        results.append({
            "job_id": job.id,
            "job_title": job.title,
            "company_name": job.company.name if job.company else "",
            "score": score,
            "matched_skills": sorted(matched),
            "missing_skills": missing,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:20]
