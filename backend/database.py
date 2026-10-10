import sqlite3
import os
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(__file__), "campuspulse.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Enable WAL mode for concurrency
    cursor.execute("PRAGMA journal_mode=WAL;")
    
    # Interventions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interventions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        ai_brief TEXT,
        assigned_faculty TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Pending', 'In Progress', 'Resolved')),
        priority TEXT NOT NULL CHECK(priority IN ('High', 'Medium', 'Low')),
        due_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        resolution_notes TEXT
    );
    """)

    # Intervention activity logs (audit trail for closed-loop lifecycle)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS intervention_logs (
        id TEXT PRIMARY KEY,
        intervention_id TEXT NOT NULL,
        action TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        note TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY(intervention_id) REFERENCES interventions(id)
    );
    """)

    conn.commit()

    # Seed initial sample interventions if empty so dashboard shows meaningful closed-loop state
    cursor.execute("SELECT COUNT(*) FROM interventions")
    count = cursor.fetchone()[0]
    if count == 0:
        sample_interventions = [
            (
                "int-001", "STU0004", "Alexander Chander",
                "Attendance & Academic Recovery Plan", "Academic",
                "- Schedule bi-weekly mentor check-in\n- Enroll in remedial tutoring for backlogs\n- Implement attendance monitoring contract",
                "Dr. S. Sharma", "In Progress", "High",
                "2026-10-25", "2026-10-01T09:30:00", "2026-10-05T14:15:00", None
            ),
            (
                "int-002", "STU0005", "Jackson Tiwari",
                "Placement & Technical Interview Bootcamp", "Placement",
                "- Assign 5 LeetCode medium algorithms weekly\n- Conduct mock behavioral interview session\n- Resume review with placement coordinator",
                "Prof. K. Verma", "Pending", "Medium",
                "2026-10-30", "2026-10-06T11:00:00", "2026-10-06T11:00:00", None
            ),
            (
                "int-003", "STU0001", "Amaira Maharaj",
                "LMS Assignment Catch-up Mentoring", "Academic",
                "- Verified completion of remaining Module 3 labs\n- Student submitted pending assignments on time\n- Attendance stabilized above 75%",
                "Dr. A. Gupta", "Resolved", "High",
                "2026-10-08", "2026-09-20T10:00:00", "2026-10-08T16:45:00",
                "Completed all assignments and attended counseling sessions."
            ),
            (
                "int-004", "STU0006", "Ira Saini",
                "Mock Interview Preparation Guidance", "Placement",
                "- Student has 9.49 CGPA but low mock interview score\n- Need targeted soft-skills training session",
                "Prof. K. Verma", "Pending", "Medium",
                "2026-10-02", "2026-09-25T10:00:00", "2026-09-25T10:00:00", None
            )
        ]
        
        cursor.executemany("""
        INSERT INTO interventions (
            id, student_id, student_name, title, category, ai_brief,
            assigned_faculty, status, priority, due_date, created_at, updated_at, resolution_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, sample_interventions)

        sample_logs = [
            ("log-001", "int-001", "Created", "Dr. S. Sharma", "Initial intervention plan formulated.", "2026-10-01T09:30:00"),
            ("log-002", "int-001", "Status Changed", "Dr. S. Sharma", "Status changed from Pending to In Progress.", "2026-10-05T14:15:00"),
            ("log-003", "int-002", "Created", "Prof. K. Verma", "Assigned after placement diagnostic test.", "2026-10-06T11:00:00"),
            ("log-004", "int-003", "Created", "Dr. A. Gupta", "Academic intervention created.", "2026-09-20T10:00:00"),
            ("log-005", "int-003", "Resolved", "Dr. A. Gupta", "Student resolved all backlogs and submitted coursework.", "2026-10-08T16:45:00"),
            ("log-006", "int-004", "Created", "Prof. K. Verma", "Urgent placement interview coaching required.", "2026-09-25T10:00:00"),
        ]

        cursor.executemany("""
        INSERT INTO intervention_logs (id, intervention_id, action, performed_by, note, timestamp)
        VALUES (?, ?, ?, ?, ?, ?);
        """, sample_logs)

        conn.commit()

    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_FILE)
