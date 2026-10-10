import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_dashboard_analytics():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_enrolled"] == 400
    assert "risk_distributions" in data
    assert "department_analytics" in data
    assert len(data["department_analytics"]) > 0
    assert "interventions_summary" in data

def test_students_directory():
    response = client.get("/api/students?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 400
    assert len(data["data"]) == 10
    first = data["data"][0]
    assert "student_id" in first
    assert "student_name" in first
    assert "overall_risk_level" in first
    assert "intervention_status" in first

def test_students_search_and_filter():
    response = client.get("/api/students?risk=High")
    assert response.status_code == 200
    data = response.json()
    for s in data["data"]:
        assert s["overall_risk_level"] == "High"

def test_student_profile():
    response = client.get("/api/students/STU0001")
    assert response.status_code == 200
    data = response.json()
    assert data["student_id"] == "STU0001"
    assert "cgpa" in data
    assert "interventions" in data

def test_student_indicators():
    response = client.get("/api/students/STU0001/indicators")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 13
    assert data[0]["student_id"] == "STU0001"

def test_interventions_crud():
    # 1. List
    list_res = client.get("/api/interventions")
    assert list_res.status_code == 200
    initial_count = len(list_res.json())

    # 2. Create
    payload = {
        "student_id": "STU0002",
        "student_name": "Jasmit Dewan",
        "title": "Aptitude Coaching Program",
        "category": "Placement",
        "assigned_faculty": "Prof. Rao",
        "priority": "Medium",
        "due_date": "2026-11-15",
        "note": "Scheduled initial intake interview."
    }
    create_res = client.post("/api/interventions", json=payload)
    assert create_res.status_code == 200
    intv_id = create_res.json()["id"]

    # 3. Verify created
    verify_res = client.get(f"/api/interventions?student_id=STU0002")
    assert verify_res.status_code == 200
    items = verify_res.json()
    assert any(i["id"] == intv_id for i in items)

    # 4. Update status to In Progress
    patch_res = client.patch(f"/api/interventions/{intv_id}", json={
        "status": "In Progress",
        "log_note": "Student attended first diagnostic session."
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "In Progress"

    # 5. Check timeline
    timeline_res = client.get("/api/interventions/timeline")
    assert timeline_res.status_code == 200
    assert len(timeline_res.json()) > 0
