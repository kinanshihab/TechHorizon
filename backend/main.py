from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import numpy as np
from collections import Counter

app = FastAPI(title="TechHorizon API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
SALARY_FILE = os.path.join(DATA_DIR, "salary_data.csv")
SO_SURVEY_CURRENT = os.path.join(DATA_DIR, "stack_overflow_survey.csv") # 2024
SO_SURVEY_PREV = os.path.join(DATA_DIR, "stack_overflow_survey_2.csv") # 2023

# Global Cache
DF_CACHE = {
    "current": pd.DataFrame(),
    "prev": pd.DataFrame(),
    "salary_external": pd.DataFrame()
}

def load_and_process_data():
    print("Loading datasets... this may take a moment.")
    
    # 1. Load Salary Data (Kaggle)
    if os.path.exists(SALARY_FILE):
        DF_CACHE["salary_external"] = pd.read_csv(SALARY_FILE)
        print("External Salary data loaded.")
    
    # 2. Load Stack Overflow Data (Current 2024)
    if os.path.exists(SO_SURVEY_CURRENT):
        try:
            # We keep essential columns in memory for dynamic filtering
            cols = ['DevType', 'LanguageHaveWorkedWith', 'ConvertedCompYearly']
            df = pd.read_csv(SO_SURVEY_CURRENT, usecols=cols, dtype={'ConvertedCompYearly': float})
            df = df.dropna(subset=['LanguageHaveWorkedWith']) # Drop empty skills
            DF_CACHE["current"] = df
            print("Current Survey data loaded (Optimized).")
        except Exception as e:
            print(f"Error loading Current Survey: {e}")

    # 3. Load Breakdown for Growth (2023)
    if os.path.exists(SO_SURVEY_PREV):
        try:
            cols = ['LanguageHaveWorkedWith']
            df_prev = pd.read_csv(SO_SURVEY_PREV, usecols=cols, dtype=str)
            df_prev = df_prev.dropna()
            DF_CACHE["prev"] = df_prev
            print("Previous Survey data loaded.")
        except Exception as e:
            print(f"Error loading Previous Survey: {e}")

# Helper to filter by role
def filter_by_role(df, role):
    if not role or role == "All":
        return df
    # Simple partial match: "Full Stack" matches "DevType" containing "System administrator; Full Stack Developer"
    return df[df['DevType'].str.contains(role, case=False, na=False)]

@app.on_event("startup")
async def startup_event():
    load_and_process_data()

@app.get("/")
def read_root():
    return {"message": "TechHorizon API with Battle Mode"}

@app.get("/api/stats")
def get_stats(role: str = "All"):
    df = filter_by_role(DF_CACHE["current"], role)
    if df.empty:
        return {"top_skill": "N/A", "trend_of_month": "N/A", "total_jobs_analyzed": 0}

    # Top Skill
    all_skills = df['LanguageHaveWorkedWith'].str.split(';').explode()
    top_skill = all_skills.mode()[0] if not all_skills.empty else "N/A"
    
    return {
        "top_skill": top_skill,
        "trend_of_month": "Calculating...", # Simplified for performace
        "total_jobs_analyzed": len(df)
    }

@app.get("/api/skills/heatmap")
def get_skill_heatmap(role: str = "All"):
    df = filter_by_role(DF_CACHE["current"], role)
    if df.empty: return []
    
    all_skills = df['LanguageHaveWorkedWith'].str.split(';').explode()
    counts = Counter(all_skills)
    return [{"text": k, "value": v} for k, v in counts.most_common(20)]

@app.get("/api/skills/growth")
def get_growth_skills(role: str = "All"):
    # Growth is hard to filter by role for PREVIOUS year (schema changes), 
    # so we'll calculate global growth but weight it by current role popularity if needed.
    # For simplicity, we just return Global Growth for now, or refine:
    
    df_curr = filter_by_role(DF_CACHE["current"], role)
    if df_curr.empty or DF_CACHE["prev"].empty: return []

    curr_counts = Counter(df_curr['LanguageHaveWorkedWith'].str.split(';').explode())
    prev_counts = Counter(DF_CACHE["prev"]['LanguageHaveWorkedWith'].str.split(';').explode())

    growth_stats = []
    for skill, curr_val in curr_counts.items():
        if curr_val > 50: # Threshold
             # We assume previous year total is approx same scale, or we normalize
             prev_val = prev_counts.get(skill, 1)
             growth = ((curr_val - prev_val) / prev_val) * 100
             growth_stats.append({"skill": skill, "growth": growth})
    
    growth_stats.sort(key=lambda x: x['growth'], reverse=True)
    return growth_stats[:10]

@app.get("/api/salary/trends")
def get_salary_trends(role: str = "All"):
    # If role is selected, we try to use the SO Survey salary data for accuracy specific to that role's skills
    # Otherwise we use the external Kaggle dataset for generic titles
    
    if role and role != "All":
        # Calculate Average Salary per Top 10 Skills for this Role
        df = filter_by_role(DF_CACHE["current"], role)
        df_sal = df.dropna(subset=['ConvertedCompYearly'])
        
        # Explode skills to link Salary <-> Skill
        # This is expensive, so we sample if too large
        if len(df_sal) > 1000: df_sal = df_sal.sample(1000)
        
        # We assign the row's salary to EACH skill the person knows (approximation)
        df_exp = df_sal.assign(Skill=df_sal['LanguageHaveWorkedWith'].str.split(';')).explode('Skill')
        salary_by_skill = df_exp.groupby('Skill')['ConvertedCompYearly'].mean().sort_values(ascending=False).head(10).reset_index()
        
        return [{"job_title": row['Skill'], "salary_in_usd": round(row['ConvertedCompYearly'])} for _, row in salary_by_skill.iterrows()]

    else:
        # Default global view from Kaggle Data
        df = DF_CACHE["salary_external"]
        if df.empty: return []
        top_jobs = df['job_title'].value_counts().head(20).index
        trends = df[df['job_title'].isin(top_jobs)].groupby('job_title')['salary_in_usd'].mean().sort_values(ascending=False).head(10).reset_index()
        return [{"job_title": row['job_title'], "salary_in_usd": round(row['salary_in_usd'])} for _, row in trends.iterrows()]

@app.get("/api/battle")
def battle_skills(skill1: str, skill2: str, role: str = "All"):
    df = filter_by_role(DF_CACHE["current"], role)
    
    def get_stats_for_skill(skill):
        # Filter people who use this skill
        users = df[df['LanguageHaveWorkedWith'].str.contains(skill, regex=False, na=False)]
        count = len(users)
        salary = users['ConvertedCompYearly'].mean() if not users.empty else 0
        return {"count": count, "salary": 0 if np.isnan(salary) else round(salary)}

    s1_stats = get_stats_for_skill(skill1)
    s2_stats = get_stats_for_skill(skill2)
    s1_stats["name"] = skill1
    s2_stats["name"] = skill2
    
    return {"skill1": s1_stats, "skill2": s2_stats}
