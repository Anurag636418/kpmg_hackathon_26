import { DashboardAnalytics, StudentsResponse, StudentDetail, IndicatorRecord, InterventionItem, InterventionLogItem } from './types';

const API_BASE = 'http://localhost:8000/api';

export async function fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchStudents(params: {
  risk?: string;
  department?: string;
  intervention_status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}): Promise<StudentsResponse> {
  const query = new URLSearchParams();
  if (params.risk && params.risk !== 'All') query.set('risk', params.risk);
  if (params.department && params.department !== 'All') query.set('department', params.department);
  if (params.intervention_status && params.intervention_status !== 'All') query.set('intervention_status', params.intervention_status);
  if (params.search) query.set('search', params.search);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);
  if (params.page) query.set('page', params.page.toString());
  if (params.page_size) query.set('page_size', params.page_size.toString());

  const res = await fetch(`${API_BASE}/students?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function fetchStudentProfile(studentId: string): Promise<StudentDetail> {
  const res = await fetch(`${API_BASE}/students/${studentId}`);
  if (!res.ok) throw new Error(`Failed to fetch student profile for ${studentId}`);
  return res.json();
}

export async function fetchStudentIndicators(studentId: string): Promise<IndicatorRecord[]> {
  const res = await fetch(`${API_BASE}/students/${studentId}/indicators`);
  if (!res.ok) throw new Error(`Failed to fetch indicators for ${studentId}`);
  return res.json();
}

export async function fetchInterventions(params?: {
  status?: string;
  priority?: string;
  student_id?: string;
}): Promise<InterventionItem[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== 'All') query.set('status', params.status);
  if (params?.priority && params.priority !== 'All') query.set('priority', params.priority);
  if (params?.student_id) query.set('student_id', params.student_id);

  const res = await fetch(`${API_BASE}/interventions?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch interventions');
  return res.json();
}

export async function fetchInterventionTimeline(): Promise<InterventionLogItem[]> {
  const res = await fetch(`${API_BASE}/interventions/timeline`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function createIntervention(data: {
  student_id: string;
  student_name: string;
  title: string;
  category: string;
  ai_brief?: string;
  assigned_faculty: string;
  priority: string;
  due_date: string;
  note?: string;
}): Promise<{ message: string; id: string }> {
  const res = await fetch(`${API_BASE}/interventions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create intervention');
  return res.json();
}

export async function updateIntervention(
  id: string,
  data: {
    status?: string;
    priority?: string;
    assigned_faculty?: string;
    due_date?: string;
    resolution_notes?: string;
    performed_by?: string;
    log_note?: string;
  }
): Promise<{ message: string; id: string; status: string }> {
  const res = await fetch(`${API_BASE}/interventions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update intervention');
  return res.json();
}

export async function generateAIBrief(studentId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/students/intervention`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId }),
  });
  if (!res.ok) throw new Error('Failed to generate AI brief');
  const data = await res.json();
  return data.brief;
}
