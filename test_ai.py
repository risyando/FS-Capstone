import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.ai_service import (
    load_skill_trends,
    extract_skills_from_text,
    compute_skill_gap,
    build_learning_path,
    generate_chatbot_reply,
)

# 1. Skill Trends
trends = load_skill_trends()
print(f"[OK] Trends loaded: {len(trends)} kategori")

# 2. Extract Skills
cv = "I am skilled in Python, React, SQL, Docker, and Machine Learning."
skills = extract_skills_from_text(cv)
print(f"[OK] Skills extracted: {skills}")

# 3. Gap Score
gap = compute_skill_gap(cv, "data scientist")
print(f"[OK] Gap Score: {gap['gap_score']} | Readiness: {gap['readiness_score']}")
print(f"     Matched : {gap['matched_skills']}")
print(f"     Missing : {gap['missing_skills']}")

# 4. Learning Path
path = build_learning_path(["python", "sql", "docker"], "data scientist")
print(f"[OK] Learning Path: fase1={[r['skill'] for r in path['learning_path']['phase_1_immediate']]}")

# 5. Chatbot
chat = generate_chatbot_reply("skill apa yang sedang trending?")
print(f"[OK] Chatbot reply status: {chat['status']}")
print(f"     Reply: {chat['reply'][:80]}...")

print("\n=== SEMUA TEST PASSED ===")
