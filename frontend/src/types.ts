export interface StudentSummary {
  student_id: string;
  student_name: string;
  program: string;
  department: string;
  year_of_study: number;
  cgpa: number;
  overall_attendance_percentage: number;
  success_score: number;
  overall_risk_level: 'High' | 'Medium' | 'Low';
  academic_risk_level: 'High' | 'Medium' | 'Low';
  placement_risk_level: 'High' | 'Medium' | 'Low';
  risk_factors: string;
  segment: string;
  intervention_status: string;
  recommended_intervention?: string;
}

export interface StudentDetail extends StudentSummary {
  semester: number;
  enrollment_status: string;
  gender: string;
  age: number;
  previous_semester_gpa: number;
  current_semester_gpa: number;
  backlog_count: number;
  failed_subject_count: number;
  academic_performance_trend: string;
  lms_login_count: number;
  lms_activity_score: number;
  assignment_completion_rate: number;
  class_participation_score: number;
  engagement_score: number;
  aptitude_score: number;
  coding_score: number;
  technical_interview_score: number;
  mock_interview_score: number;
  communication_score: number;
  resume_readiness_score: number;
  placement_readiness_score: number;
  placement_status: string;
  technical_skills: number;
  soft_skills: number;
  student_feedback: number;
  faculty_feedback: number;
  last_updated: string;
  interventions?: InterventionItem[];
}

export interface IndicatorRecord {
  indicator_id: string;
  student_id: string;
  category: string;
  indicator_name: string;
  value: number;
  unit: string;
  date: string;
  source_system: string;
}

export interface InterventionLogItem {
  id: string;
  intervention_id: string;
  action: string;
  performed_by: string;
  note?: string;
  timestamp: string;
}

export interface InterventionItem {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  category: string;
  ai_brief?: string;
  assigned_faculty: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  priority: 'High' | 'Medium' | 'Low';
  due_date: string;
  created_at: string;
  updated_at: string;
  resolution_notes?: string;
  logs?: InterventionLogItem[];
}

export interface DepartmentAnalytics {
  department: string;
  total: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  avg_score: number;
  avg_attendance: number;
  avg_cgpa: number;
}

export interface DashboardAnalytics {
  kpis: {
    total_enrolled: number;
    avg_success_score: number;
    high_risk_students: number;
    medium_risk_students: number;
    low_risk_students: number;
    open_interventions: number;
    overdue_interventions: number;
    resolved_interventions: number;
    intervention_completion_rate: number;
  };
  academic_summary: {
    avg_cgpa: number;
    avg_attendance: number;
    critical_attendance_count: number;
    critical_cgpa_count: number;
    active_backlog_students: number;
  };
  risk_distributions: {
    overall: Record<string, number>;
    academic: Record<string, number>;
    placement: Record<string, number>;
  };
  department_analytics: DepartmentAnalytics[];
  segments: Record<string, number>;
  interventions_summary: {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
    open: number;
    overdue: number;
    completion_rate: number;
  };
}

export interface StudentsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  data: StudentSummary[];
}
