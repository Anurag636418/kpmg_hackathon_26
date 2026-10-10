import pandas as pd
import numpy as np
from faker import Faker
import random
import os
import uuid
from datetime import datetime, timedelta

# Configuration
NUM_STUDENTS = 400
SEED = 42
DATA_DIR = "data"

os.makedirs(DATA_DIR, exist_ok=True)
np.random.seed(SEED)
random.seed(SEED)
fake = Faker('en_IN')
Faker.seed(SEED)

def generate_student_data():
    students = []
    indicators_data = []
    programs = ['Computer Science', 'Electronics', 'Mechanical', 'Business', 'Civil']
    program_probs = [0.4, 0.2, 0.15, 0.15, 0.1]
    
    segments_dist = ['High Academic + High Placement'] * 80 + \
                    ['High Academic + Low Placement'] * 80 + \
                    ['Low Academic + At Risk'] * 80 + \
                    ['Average'] * 160
    np.random.shuffle(segments_dist)
    current_date = datetime.now()

    for i in range(1, NUM_STUDENTS + 1):
        student_id = f"STU{i:04d}"
        gender = np.random.choice(['Male', 'Female'], p=[0.55, 0.45])
        student_name = fake.name_male() if gender == 'Male' else fake.name_female()
        program = np.random.choice(programs, p=program_probs)
        department = f"{program} Dept"
        year_of_study = np.random.choice([1, 2, 3, 4], p=[0.25, 0.25, 0.25, 0.25])
        semester = year_of_study * 2 - np.random.randint(0, 2)
        enrollment_status = "Active"
        age = 17 + year_of_study + np.random.randint(0, 3)
        segment = segments_dist[i-1]

        if segment == 'High Academic + High Placement':
            cgpa = np.clip(np.random.normal(9.1, 0.35), 8.3, 10.0)
            overall_attendance = np.clip(np.random.normal(92, 4), 85, 100)
            aptitude_score = np.clip(np.random.normal(85, 8), 70, 100)
            coding_score = np.clip(np.random.normal(85, 10), 70, 100)
            mock_interview_score = np.clip(np.random.normal(85, 8), 70, 100)
        elif segment == 'High Academic + Low Placement':
            cgpa = np.clip(np.random.normal(8.9, 0.4), 8.0, 10.0)
            overall_attendance = np.clip(np.random.normal(90, 4), 82, 100)
            aptitude_score = np.clip(np.random.normal(55, 10), 30, 70)
            coding_score = np.clip(np.random.normal(50, 12), 30, 65)
            mock_interview_score = np.clip(np.random.normal(50, 10), 30, 65)
        elif segment == 'Low Academic + At Risk':
            cgpa = np.clip(np.random.normal(5.0, 0.8), 3.5, 6.0)
            overall_attendance = np.clip(np.random.normal(55, 10), 30, 65)
            aptitude_score = np.clip(np.random.normal(45, 15), 20, 65)
            coding_score = np.clip(np.random.normal(40, 15), 20, 60)
            mock_interview_score = np.clip(np.random.normal(40, 15), 20, 60)
        else: # Average
            cgpa = np.clip(np.random.normal(7.0, 0.6), 6.2, 8.0)
            overall_attendance = np.clip(np.random.normal(73, 6), 66, 82)
            aptitude_score = np.clip(np.random.normal(62, 10), 45, 78)
            coding_score = np.clip(np.random.normal(62, 12), 45, 78)
            mock_interview_score = np.clip(np.random.normal(62, 10), 45, 78)

        # Backlogs guard
        if year_of_study == 1:
            backlog_count = 0
        elif cgpa < 6.0:
            backlog_count = np.random.randint(1, 4)
        elif cgpa < 7.0:
            backlog_count = np.random.randint(0, 2)
        else:
            backlog_count = 0
            
        failed_subject_count = backlog_count

        lms_login_count = int(np.clip(overall_attendance * 0.8 + np.random.normal(0, 10), 0, 100))
        assignment_completion_rate = np.clip(cgpa * 10 + np.random.normal(0, 5), 0, 100)
        lms_activity_score = ((lms_login_count / 100) * 50 + (assignment_completion_rate / 100) * 50)
        
        engagement_score = np.clip(overall_attendance * 0.6 + lms_login_count * 0.4 + np.random.normal(0, 5), 0, 100)
        class_participation_score = engagement_score
        
        technical_skills = np.clip(coding_score * 0.9 + np.random.normal(5, 5), 0, 100)
        soft_skills = np.clip(mock_interview_score * 0.8 + aptitude_score * 0.2 + np.random.normal(0, 5), 0, 100)
        technical_interview_score = technical_skills
        communication_score = soft_skills
        resume_readiness_score = np.clip(soft_skills + np.random.normal(5, 5), 0, 100)
        
        student_feedback = np.clip(overall_attendance * 0.05 + np.random.normal(0, 0.5), 1, 5)
        faculty_feedback = np.clip(cgpa * 0.5 + np.random.normal(0, 0.5), 1, 5)

        academic_score_base = (cgpa / 10) * 100
        attendance_score_base = overall_attendance
        lms_score_base = (lms_login_count + assignment_completion_rate) / 2
        engagement_score_base = engagement_score
        placement_readiness_score = (aptitude_score + coding_score + mock_interview_score) / 3
        skills_feedback_base = (technical_skills + soft_skills + (student_feedback/5)*100 + (faculty_feedback/5)*100) / 4

        success_score = (
            academic_score_base * 0.35 +
            attendance_score_base * 0.20 +
            lms_score_base * 0.15 +
            engagement_score_base * 0.10 +
            placement_readiness_score * 0.15 +
            skills_feedback_base * 0.05
        )
        
        if segment != 'High Academic + High Placement':
            success_score = success_score * 0.95 

        if cgpa < 5.5 or overall_attendance < 60 or backlog_count > 2:
            academic_risk_level = "High"
        elif cgpa < 7.0 or overall_attendance < 75 or backlog_count > 0:
            academic_risk_level = "Medium"
        else:
            academic_risk_level = "Low"

        if placement_readiness_score < 50:
            placement_risk_level = "High"
        elif placement_readiness_score < 72:
            placement_risk_level = "Medium"
        else:
            placement_risk_level = "Low"
            
        overall_risk_level = "High" if (academic_risk_level == "High" or placement_risk_level == "High") else ("Medium" if (academic_risk_level == "Medium" or placement_risk_level == "Medium") else "Low")
        
        placement_status = 'Placed' if (year_of_study == 4 and placement_readiness_score > 75) else 'Unplaced'
        
        previous_semester_gpa = np.clip(cgpa + np.random.normal(0, 0.4), 0, 10)
        current_semester_gpa = cgpa
        if current_semester_gpa > previous_semester_gpa:
            academic_performance_trend = 'Improving'
        elif current_semester_gpa < previous_semester_gpa:
            academic_performance_trend = 'Declining'
        else:
            academic_performance_trend = 'Stable'
            
        factors = []
        if cgpa < 6.0: factors.append("Low CGPA")
        if overall_attendance < 75: factors.append("Low Attendance")
        if backlog_count > 0: factors.append("Active Backlogs")
        if placement_readiness_score < 60: factors.append("Low Placement Readiness")
        risk_factors = ", ".join(factors) if factors else "None"

        days_since_update = np.random.randint(0, 30)
        last_updated = (current_date - timedelta(days=days_since_update)).strftime('%Y-%m-%d')

        students.append({
            'student_id': student_id,
            'student_name': student_name,
            'program': program,
            'department': department,
            'year_of_study': year_of_study,
            'semester': semester,
            'enrollment_status': enrollment_status,
            'gender': gender,
            'age': age,
            'cgpa': round(cgpa, 2),
            'previous_semester_gpa': round(previous_semester_gpa, 2),
            'current_semester_gpa': round(current_semester_gpa, 2),
            'backlog_count': backlog_count,
            'failed_subject_count': failed_subject_count,
            'academic_performance_trend': academic_performance_trend,
            'overall_attendance_percentage': round(overall_attendance, 1),
            'lms_login_count': int(lms_login_count),
            'lms_activity_score': round(lms_activity_score, 1),
            'assignment_completion_rate': round(assignment_completion_rate, 1),
            'class_participation_score': round(class_participation_score, 1),
            'engagement_score': round(engagement_score, 1),
            'aptitude_score': round(aptitude_score, 1),
            'coding_score': round(coding_score, 1),
            'technical_interview_score': round(technical_interview_score, 1),
            'mock_interview_score': round(mock_interview_score, 1),
            'communication_score': round(communication_score, 1),
            'resume_readiness_score': round(resume_readiness_score, 1),
            'placement_readiness_score': round(placement_readiness_score, 1),
            'placement_status': placement_status,
            'technical_skills': round(technical_skills, 1),
            'soft_skills': round(soft_skills, 1),
            'student_feedback': round(student_feedback, 2),
            'faculty_feedback': round(faculty_feedback, 2),
            'success_score': round(success_score, 2),
            'academic_risk_level': academic_risk_level,
            'placement_risk_level': placement_risk_level,
            'overall_risk_level': overall_risk_level,
            'risk_factors': risk_factors,
            'recommended_intervention': 'See AI Brief',
            'segment': segment,
            'last_updated': last_updated
        })

        # Skew dates toward present (last 6 months mostly)
        def random_date():
            days_ago = int(np.random.exponential(scale=30))
            days_ago = min(days_ago, 180) # Cap at 6 months
            return (current_date - timedelta(days=days_ago)).strftime('%Y-%m-%d')

        indicators_to_add = [
            ('Academic', 'CGPA', round(cgpa, 2), 'score', 'SIS'),
            ('Academic', 'Backlogs', backlog_count, 'count', 'SIS'),
            ('Attendance', 'Overall Attendance', round(overall_attendance, 1), 'percentage', 'AttendanceTracker'),
            ('LMS', 'LMS Login Frequency', int(lms_login_count), 'count', 'Moodle'),
            ('LMS', 'Assignment Completion', round(assignment_completion_rate, 1), 'percentage', 'Moodle'),
            ('Engagement', 'Engagement Score', round(engagement_score, 1), 'score', 'StudentPortal'),
            ('Placement', 'Aptitude Score', round(aptitude_score, 1), 'score', 'PlacementPortal'),
            ('Placement', 'Coding Score', round(coding_score, 1), 'score', 'PlacementPortal'),
            ('Placement', 'Mock Interview Score', round(mock_interview_score, 1), 'score', 'PlacementPortal'),
            ('Skills', 'Technical Skills', round(technical_skills, 1), 'score', 'PlacementPortal'),
            ('Skills', 'Soft Skills', round(soft_skills, 1), 'score', 'PlacementPortal'),
            ('Feedback', 'Student Feedback', round(student_feedback, 2), 'score', 'SurveySystem'),
            ('Feedback', 'Faculty Feedback', round(faculty_feedback, 2), 'score', 'SurveySystem')
        ]

        for cat, ind_name, val, unit, source in indicators_to_add:
            indicators_data.append({
                'indicator_id': str(uuid.uuid4()),
                'student_id': student_id,
                'category': cat,
                'indicator_name': ind_name,
                'value': val,
                'unit': unit,
                'date': random_date(),
                'source_system': source
            })

    df_students = pd.DataFrame(students)
    df_indicators = pd.DataFrame(indicators_data)

    df_students.to_csv(f'{DATA_DIR}/students.csv', index=False)
    df_indicators.to_csv(f'{DATA_DIR}/indicators.csv', index=False)
    
    print("\n--- SCHEMA UPDATE COMPLETE ---")
    print(f"Generated {len(df_students)} students and {len(df_indicators)} indicators with new schema.")

if __name__ == "__main__":
    generate_student_data()
