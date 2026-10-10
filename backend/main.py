from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, FileResponse
import pandas as pd
import os
import uuid
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from groq import Groq
from dotenv import load_dotenv

from database import init_db, get_db_connection
from schemas import InterventionCreate, InterventionUpdate, InterventionRequest

# Load environment variables from root directory first
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
root_env = os.path.join(BASE_DIR, ".env")
if os.path.exists(root_env):
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()

# Ensure DB is initialized
init_db()

app = FastAPI(
    title="CampusPulse AI - Student Analytics & Success Platform",
    description="Enterprise Analytics & Closed-Loop Intervention Engine",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CSV datasets into memory
DATA_DIR = os.path.join(BASE_DIR, "data")
STUDENTS_CSV = os.path.join(DATA_DIR, "students.csv")
INDICATORS_CSV = os.path.join(DATA_DIR, "indicators.csv")

try:
    df_students = pd.read_csv(STUDENTS_CSV)
    df_students = df_students.where(pd.notnull(df_students), None)
    print(f"Loaded {len(df_students)} student records.")
except Exception as e:
    print(f"Error loading students.csv: {e}")
    df_students = pd.DataFrame()

try:
    df_indicators = pd.read_csv(INDICATORS_CSV)
    df_indicators = df_indicators.where(pd.notnull(df_indicators), None)
    print(f"Loaded {len(df_indicators)} indicator observations.")
except Exception as e:
    print(f"Error loading indicators.csv: {e}")
    df_indicators = pd.DataFrame()

# Initialize Groq Client
try:
    groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY", "placeholder_key"))
except Exception as e:
    print(f"Groq setup error: {e}")
    groq_client = None


# Helper function to get intervention stats from SQLite
def get_intervention_metrics():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT status, due_date FROM interventions")
    rows = cursor.fetchall()
    conn.close()

    total = len(rows)
    pending = sum(1 for r in rows if r['status'] == 'Pending')
    in_progress = sum(1 for r in rows if r['status'] == 'In Progress')
    resolved = sum(1 for r in rows if r['status'] == 'Resolved')
    open_count = pending + in_progress

    today_str = date.today().isoformat()
    overdue = sum(1 for r in rows if r['status'] != 'Resolved' and r['due_date'] < today_str)

    completion_rate = round((resolved / total * 100), 1) if total > 0 else 0.0

    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "open": open_count,
        "overdue": overdue,
        "completion_rate": completion_rate
    }

# Helper to map latest intervention status for each student
def get_student_intervention_status_map():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT student_id, status, title, updated_at
        FROM interventions
        ORDER BY updated_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    status_map = {}
    for r in rows:
        sid = r['student_id']
        if sid not in status_map:
            status_map[sid] = {
                "status": r['status'],
                "title": r['title'],
                "updated_at": r['updated_at']
            }
    return status_map


# ==========================================
# 1. CORE ANALYTICS DASHBOARD API
# ==========================================

@app.get("/api/dashboard")
def get_dashboard_analytics():
    if df_students.empty:
        raise HTTPException(status_code=500, detail="Student dataset not loaded")

    total_students = len(df_students)
    avg_score = round(float(df_students['success_score'].mean()), 1)

    # Risk Distributions
    overall_risk = df_students['overall_risk_level'].value_counts().to_dict()
    academic_risk = df_students['academic_risk_level'].value_counts().to_dict()
    placement_risk = df_students['placement_risk_level'].value_counts().to_dict()

    # Department and Program aggregates
    dept_risk = []
    for dept, group in df_students.groupby('department'):
        dept_risk.append({
            "department": dept,
            "total": len(group),
            "high_risk": int(sum(group['overall_risk_level'] == 'High')),
            "medium_risk": int(sum(group['overall_risk_level'] == 'Medium')),
            "low_risk": int(sum(group['overall_risk_level'] == 'Low')),
            "avg_score": round(float(group['success_score'].mean()), 1),
            "avg_attendance": round(float(group['overall_attendance_percentage'].mean()), 1),
            "avg_cgpa": round(float(group['cgpa'].mean()), 2)
        })

    # Academic & Attendance Summaries
    avg_cgpa = round(float(df_students['cgpa'].mean()), 2)
    avg_attendance = round(float(df_students['overall_attendance_percentage'].mean()), 1)
    low_attendance_count = int(sum(df_students['overall_attendance_percentage'] < 75.0))
    low_cgpa_count = int(sum(df_students['cgpa'] < 6.0))
    backlog_students_count = int(sum(df_students['backlog_count'] > 0))

    # Segment counts
    segment_counts = df_students['segment'].value_counts().to_dict()

    # Intervention performance KPIs
    intervention_metrics = get_intervention_metrics()

    return {
        "kpis": {
            "total_enrolled": total_students,
            "avg_success_score": avg_score,
            "high_risk_students": overall_risk.get("High", 0),
            "medium_risk_students": overall_risk.get("Medium", 0),
            "low_risk_students": overall_risk.get("Low", 0),
            "open_interventions": intervention_metrics["open"],
            "overdue_interventions": intervention_metrics["overdue"],
            "resolved_interventions": intervention_metrics["resolved"],
            "intervention_completion_rate": intervention_metrics["completion_rate"],
        },
        "academic_summary": {
            "avg_cgpa": avg_cgpa,
            "avg_attendance": avg_attendance,
            "critical_attendance_count": low_attendance_count,
            "critical_cgpa_count": low_cgpa_count,
            "active_backlog_students": backlog_students_count
        },
        "risk_distributions": {
            "overall": overall_risk,
            "academic": academic_risk,
            "placement": placement_risk
        },
        "department_analytics": dept_risk,
        "segments": segment_counts,
        "interventions_summary": intervention_metrics
    }


# ==========================================
# 2. STUDENT DIRECTORY & DETAIL APIS
# ==========================================

@app.get("/api/students")
def get_students_directory(
    risk: Optional[str] = None,
    department: Optional[str] = None,
    program: Optional[str] = None,
    intervention_status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "success_score",
    sort_order: str = "asc",
    page: int = 1,
    page_size: int = 25
):
    if df_students.empty:
        return {"total": 0, "page": page, "page_size": page_size, "data": []}

    df = df_students.copy()

    # Filters
    if risk and risk != "All":
        df = df[df['overall_risk_level'] == risk]

    if department and department != "All":
        df = df[df['department'] == department]

    if program and program != "All":
        df = df[df['program'] == program]

    if search:
        search_lower = search.strip().lower()
        df = df[
            df['student_name'].astype(str).str.lower().str.contains(search_lower) |
            df['student_id'].astype(str).str.lower().str.contains(search_lower)
        ]

    # Map current intervention status
    status_map = get_student_intervention_status_map()
    df['intervention_status'] = df['student_id'].apply(lambda sid: status_map.get(sid, {}).get("status", "None"))

    if intervention_status and intervention_status != "All":
        df = df[df['intervention_status'] == intervention_status]

    # Sorting
    ascending = (sort_order.lower() == "asc")
    if sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=ascending)

    total_records = len(df)

    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated_df = df.iloc[start:end]

    cols = [
        'student_id', 'student_name', 'program', 'department', 'year_of_study',
        'cgpa', 'overall_attendance_percentage', 'success_score',
        'overall_risk_level', 'academic_risk_level', 'placement_risk_level',
        'risk_factors', 'segment', 'intervention_status', 'recommended_intervention'
    ]

    records = paginated_df[cols].to_dict(orient="records")

    return {
        "total": total_records,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total_records + page_size - 1) // page_size),
        "data": records
    }


@app.get("/api/students/{student_id}")
def get_student_profile(student_id: str):
    student = df_students[df_students['student_id'] == student_id]
    if student.empty:
        raise HTTPException(status_code=404, detail="Student not found")

    student_data = student.iloc[0].to_dict()

    # Retrieve student's interventions and logs from SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM interventions
        WHERE student_id = ?
        ORDER BY created_at DESC
    """, (student_id,))
    interventions = [dict(r) for r in cursor.fetchall()]

    for intv in interventions:
        cursor.execute("""
            SELECT * FROM intervention_logs
            WHERE intervention_id = ?
            ORDER BY timestamp ASC
        """, (intv["id"],))
        intv["logs"] = [dict(log) for log in cursor.fetchall()]

    conn.close()

    student_data["interventions"] = interventions
    return student_data


@app.get("/api/students/{student_id}/indicators")
def get_student_indicators(student_id: str):
    if df_indicators.empty:
        return []

    inds = df_indicators[df_indicators['student_id'] == student_id]
    if inds.empty:
        return []

    inds_sorted = inds.sort_values(by="date", ascending=True)
    return inds_sorted.to_dict(orient="records")


# ==========================================
# 3. CLOSED-LOOP INTERVENTION MANAGEMENT APIS
# ==========================================

@app.get("/api/interventions")
def list_interventions(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    student_id: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM interventions WHERE 1=1"
    params = []

    if status and status != "All":
        query += " AND status = ?"
        params.append(status)

    if priority and priority != "All":
        query += " AND priority = ?"
        params.append(priority)

    if student_id:
        query += " AND student_id = ?"
        params.append(student_id)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    interventions = [dict(r) for r in cursor.fetchall()]

    # Fetch logs for each intervention
    for item in interventions:
        cursor.execute("SELECT * FROM intervention_logs WHERE intervention_id = ? ORDER BY timestamp ASC", (item["id"],))
        item["logs"] = [dict(log) for log in cursor.fetchall()]

    conn.close()
    return interventions


@app.get("/api/interventions/timeline")
def get_intervention_timeline(limit: int = 15):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT l.*, i.student_name, i.title, i.priority
        FROM intervention_logs l
        JOIN interventions i ON l.intervention_id = i.id
        ORDER BY l.timestamp DESC
        LIMIT ?
    """, (limit,))
    logs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return logs


@app.post("/api/interventions")
def create_intervention(payload: InterventionCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    intv_id = f"int-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now().isoformat(timespec='seconds')

    cursor.execute("""
        INSERT INTO interventions (
            id, student_id, student_name, title, category, ai_brief,
            assigned_faculty, status, priority, due_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        intv_id, payload.student_id, payload.student_name, payload.title, payload.category,
        payload.ai_brief, payload.assigned_faculty, "Pending", payload.priority,
        payload.due_date, now_iso, now_iso
    ))

    # Add initial activity log
    log_id = f"log-{uuid.uuid4().hex[:8]}"
    log_note = payload.note if payload.note else "Intervention record created."
    cursor.execute("""
        INSERT INTO intervention_logs (id, intervention_id, action, performed_by, note, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (log_id, intv_id, "Created", payload.assigned_faculty, log_note, now_iso))

    conn.commit()
    conn.close()

    return {"message": "Intervention created successfully", "id": intv_id}


@app.patch("/api/interventions/{intervention_id}")
def update_intervention(intervention_id: str, payload: InterventionUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM interventions WHERE id = ?", (intervention_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Intervention not found")

    now_iso = datetime.now().isoformat(timespec='seconds')
    updates = []
    params = []

    old_status = existing["status"]
    new_status = payload.status if payload.status else old_status

    if payload.status:
        updates.append("status = ?")
        params.append(payload.status)

    if payload.priority:
        updates.append("priority = ?")
        params.append(payload.priority)

    if payload.assigned_faculty:
        updates.append("assigned_faculty = ?")
        params.append(payload.assigned_faculty)

    if payload.due_date:
        updates.append("due_date = ?")
        params.append(payload.due_date)

    if payload.resolution_notes:
        updates.append("resolution_notes = ?")
        params.append(payload.resolution_notes)

    updates.append("updated_at = ?")
    params.append(now_iso)

    params.append(intervention_id)
    update_sql = f"UPDATE interventions SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(update_sql, params)

    # Add audit log entry
    action = "Status Changed" if (payload.status and payload.status != old_status) else "Note Added"
    if payload.status == "Resolved":
        action = "Resolved"

    log_desc = payload.log_note or f"Updated status to {new_status}"
    if payload.resolution_notes:
        log_desc += f" | Notes: {payload.resolution_notes}"

    log_id = f"log-{uuid.uuid4().hex[:8]}"
    cursor.execute("""
        INSERT INTO intervention_logs (id, intervention_id, action, performed_by, note, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (log_id, intervention_id, action, payload.performed_by, log_desc, now_iso))

    conn.commit()
    conn.close()

    return {"message": "Intervention updated successfully", "id": intervention_id, "status": new_status}


# ==========================================
# 4. GROQ AI INTERVENTION BRIEF API
# ==========================================

@app.post("/api/students/intervention")
def generate_ai_intervention(req: InterventionRequest):
    current_key = os.environ.get("GROQ_API_KEY", "")
    if not groq_client or current_key in [None, "", "placeholder_key", "your_groq_api_key_here"]:
        return {
            "brief": (
                "* Schedule mandatory 1:1 meeting with academic advisor within 48 hours.\n"
                "* Implement bi-weekly attendance audit and remediation contract.\n"
                "* Enroll in peer-tutoring lab for primary backlog and coding fundamentals."
            )
        }

    student = df_students[df_students['student_id'] == req.student_id]
    if student.empty:
        raise HTTPException(status_code=404, detail="Student not found")

    s = student.iloc[0]

    prompt = f"""
    You are an AI academic advisor in higher education. Provide exactly 3 short, punchy bullet points of immediate actions the faculty should take.
    Format the output as a simple markdown list. Do not use bold text. Keep each point under 20 words. No intro or outro text.
    
    Student Data:
    Name: {s['student_name']}
    Program: {s['program']}
    Score: {s['success_score']}/100
    Academic Risk: {s['academic_risk_level']} (CGPA: {s['cgpa']}, Attendance: {s['overall_attendance_percentage']}%)
    Placement Risk: {s['placement_risk_level']} (Coding: {s['coding_score']}, Mock Interview: {s['mock_interview_score']})
    Risk Factors: {s.get('risk_factors', 'None')}
    """

    try:
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="qwen/qwen3.8-27b",
            temperature=0.3,
            max_tokens=200
        )
        return {"brief": completion.choices[0].message.content}
    except Exception as e:
        print(f"Groq generation failed: {e}")
        return {
            "brief": (
                "* Schedule mandatory 1:1 meeting with academic advisor within 48 hours.\n"
                "* Implement bi-weekly attendance audit and remediation contract.\n"
                "* Enroll in peer-tutoring lab for primary backlog and coding fundamentals."
            )
        }


# ==========================================
# 5. API SERVICE ROOT
# ==========================================

@app.get("/")
def read_root():
    return {
        "service": "CampusPulse AI - Student Analytics & Success Platform",
        "version": "2.0.0",
        "status": "operational",
        "documentation": "/docs",
        "endpoints": {
            "dashboard": "/api/dashboard",
            "students": "/api/students",
            "interventions": "/api/interventions"
        }
    }
