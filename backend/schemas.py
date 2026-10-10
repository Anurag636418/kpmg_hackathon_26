from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class InterventionCreate(BaseModel):
    student_id: str
    student_name: str
    title: str
    category: str = "Academic" # Academic, Attendance, Placement, Holistic
    ai_brief: Optional[str] = None
    assigned_faculty: str = "Academic Advisor"
    priority: str = "Medium" # High, Medium, Low
    due_date: str # YYYY-MM-DD
    note: Optional[str] = None

class InterventionUpdate(BaseModel):
    status: Optional[str] = None # Pending, In Progress, Resolved
    priority: Optional[str] = None # High, Medium, Low
    assigned_faculty: Optional[str] = None
    due_date: Optional[str] = None
    resolution_notes: Optional[str] = None
    performed_by: str = "Faculty Administrator"
    log_note: Optional[str] = None

class InterventionLog(BaseModel):
    id: str
    intervention_id: str
    action: str
    performed_by: str
    note: Optional[str] = None
    timestamp: str

class Intervention(BaseModel):
    id: str
    student_id: str
    student_name: str
    title: str
    category: str
    ai_brief: Optional[str] = None
    assigned_faculty: str
    status: str
    priority: str
    due_date: str
    created_at: str
    updated_at: str
    resolution_notes: Optional[str] = None
    logs: Optional[List[InterventionLog]] = []

class InterventionRequest(BaseModel):
    student_id: str
