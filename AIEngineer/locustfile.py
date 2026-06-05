from locust import HttpUser, task, between

SAMPLE_CV = """
Jane Smith | jane@email.com | Portfolio: github.com/janesmith

EXPERIENCE
Machine Learning Engineer — Tech Corp (2022–2024)
- Developed and deployed ML models using Python, TensorFlow, and scikit-learn
- Built data pipelines with Apache Spark and Kafka for real-time processing
- Optimized model performance reducing inference time by 40%
- Collaborated with data engineers using Docker and Kubernetes

Data Analyst — Startup XYZ (2020–2022)
- Built dashboards using Tableau and Power BI
- Wrote complex SQL queries and managed PostgreSQL databases
- Applied A/B testing and statistical analysis for product decisions

EDUCATION
S1 Ilmu Komputer, Institut Teknologi Bandung, 2020

SKILLS
Python, TensorFlow, PyTorch, scikit-learn, SQL, Spark, Docker,
Kubernetes, Tableau, Power BI, Git, Machine Learning, Deep Learning
"""

class SkillGapUser(HttpUser):
    wait_time = between(0.5, 2)

    @task(3)
    def test_gap_score(self):
        self.client.post("/api/gap-score", json={
            "cv_text": SAMPLE_CV,
            "target_role": "Data Scientist",
            "top_n": 10
        })

    @task(2)
    def test_extract_cv(self):
        self.client.post("/api/extract-cv", json={"cv_text": SAMPLE_CV})

    @task(1)
    def test_skill_trends(self):
        self.client.get("/api/skill-trends?label=RISING&limit=20")

    @task(1)
    def test_chatbot(self):
        self.client.post("/api/career-chatbot", json={
            "message": "Skill apa yang sedang trending saat ini?"
        })
