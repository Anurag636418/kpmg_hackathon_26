import React, { useState, useEffect } from 'react';
import { StudentDetail, IndicatorRecord, InterventionItem } from '../types';
import { fetchStudentIndicators, generateAIBrief, createIntervention } from '../api';
import {
  X as CloseIcon,
  Sparkles as SparklesIcon,
  AlertTriangle as AlertIcon,
  GraduationCap as GradIcon,
  Briefcase as BriefIcon,
  Activity as ActivityIcon,
  CheckCircle as CheckIcon,
  Clock as ClockIcon,
  PlusCircle as PlusIcon,
} from 'lucide-react';

interface StudentDetailModalProps {
  student: StudentDetail;
  onClose: () => void;
  onInterventionCreated: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onInterventionCreated,
}) => {
  const [indicators, setIndicators] = useState<IndicatorRecord[]>([]);
  const [loadingIndicators, setLoadingIndicators] = useState<boolean>(true);
  const [aiBrief, setAiBrief] = useState<string>('');
  const [generatingAI, setGeneratingAI] = useState<boolean>(false);

  // New intervention form state
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Academic');
  const [newPriority, setNewPriority] = useState<string>('High');
  const [newFaculty, setNewFaculty] = useState<string>('Academic Advisor');
  const [newDueDate, setNewDueDate] = useState<string>(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [newNote, setNewNote] = useState<string>('');
  const [submittingIntervention, setSubmittingIntervention] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadIndicators() {
      try {
        const data = await fetchStudentIndicators(student.student_id);
        if (isMounted) setIndicators(data);
      } catch (err) {
        console.error('Failed to load indicators:', err);
      } finally {
        if (isMounted) setLoadingIndicators(false);
      }
    }
    loadIndicators();
    return () => {
      isMounted = false;
    };
  }, [student.student_id]);

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    try {
      const brief = await generateAIBrief(student.student_id);
      setAiBrief(brief);
    } catch (err) {
      console.error('AI brief generation failed:', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmittingIntervention(true);
    try {
      await createIntervention({
        student_id: student.student_id,
        student_name: student.student_name,
        title: newTitle,
        category: newCategory,
        ai_brief: aiBrief || undefined,
        assigned_faculty: newFaculty,
        priority: newPriority,
        due_date: newDueDate,
        note: newNote,
      });
      setShowCreateForm(false);
      setNewTitle('');
      setNewNote('');
      onInterventionCreated();
    } catch (err) {
      console.error('Failed to create intervention:', err);
    } finally {
      setSubmittingIntervention(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-900 text-white flex items-center justify-center font-bold text-base">
              {student.student_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">{student.student_name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded">
                  {student.student_id}
                </span>
                <span className="text-xs px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium">
                  {student.enrollment_status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {student.program} • {student.department} • Year {student.year_of_study} (Sem {student.semester}) • Age {student.age}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* 1. Score & Risk Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Success Score Hero */}
            <div className="p-4 rounded-lg border border-brand-200 bg-brand-50/40 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-brand-900 uppercase tracking-wider">
                  Success Score
                </span>
                <p className="text-3xl font-extrabold text-brand-900 mt-1">
                  {student.success_score} <span className="text-xs font-normal text-slate-500">/ 100</span>
                </p>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      student.success_score >= 75 ? 'bg-emerald-500' : student.success_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${student.success_score}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Segment: {student.segment}</span>
              </div>
            </div>

            {/* Academic Risk */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Academic Risk</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    student.academic_risk_level === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : student.academic_risk_level === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {student.academic_risk_level}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-slate-600">
                <p>CGPA: <strong className="text-slate-900">{student.cgpa.toFixed(2)}</strong></p>
                <p>Active Backlogs: <strong className={student.backlog_count > 0 ? 'text-rose-600' : 'text-slate-900'}>{student.backlog_count}</strong></p>
                <p>Trend: <strong className="text-slate-900">{student.academic_performance_trend}</strong></p>
              </div>
            </div>

            {/* Attendance & LMS Risk */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Attendance & LMS</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${student.overall_attendance_percentage < 75 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {student.overall_attendance_percentage}%
                </span>
              </div>
              <div className="mt-2 space-y-1 text-slate-600">
                <p>Attendance Avg: <strong className="text-slate-900">{student.overall_attendance_percentage}%</strong></p>
                <p>LMS Logins: <strong className="text-slate-900">{student.lms_login_count}</strong></p>
                <p>Assignment Completion: <strong className="text-slate-900">{student.assignment_completion_rate}%</strong></p>
              </div>
            </div>

            {/* Placement Risk */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Placement Readiness</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    student.placement_risk_level === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : student.placement_risk_level === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {student.placement_risk_level}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-slate-600">
                <p>Coding Score: <strong className="text-slate-900">{student.coding_score}</strong></p>
                <p>Aptitude Score: <strong className="text-slate-900">{student.aptitude_score}</strong></p>
                <p>Mock Interview: <strong className="text-slate-900">{student.mock_interview_score}</strong></p>
              </div>
            </div>
          </div>

          {/* 2. Explainable Risk Factors Banner */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3.5 flex items-start space-x-3">
            <AlertIcon className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 text-xs">Explainable AI Risk Factors Identified</span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                {student.risk_factors && student.risk_factors !== 'None'
                  ? `Deterministic thresholds breached: ${student.risk_factors}. Prior semester GPA: ${student.previous_semester_gpa}, current semester GPA: ${student.current_semester_gpa}.`
                  : 'No critical risk thresholds breached. Student is progressing within institutional tolerances.'}
              </p>
            </div>
          </div>

          {/* 3. Indicators Grid & Longitudinal Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detailed Skills & Assessments */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-slate-900 text-xs flex items-center space-x-1.5 pb-2 border-b border-slate-100">
                <BriefIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Skills & Assessment Diagnostics</span>
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Technical Skills:</span>{' '}
                  <strong className="text-slate-900">{student.technical_skills}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Soft Skills:</span>{' '}
                  <strong className="text-slate-900">{student.soft_skills}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Resume Readiness:</span>{' '}
                  <strong className="text-slate-900">{student.resume_readiness_score}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Class Participation:</span>{' '}
                  <strong className="text-slate-900">{student.class_participation_score}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Faculty Feedback:</span>{' '}
                  <strong className="text-slate-900">{student.faculty_feedback} / 5</strong>
                </div>
                <div>
                  <span className="text-slate-500">Placement Status:</span>{' '}
                  <strong className="text-slate-900">{student.placement_status}</strong>
                </div>
              </div>
            </div>

            {/* Time-series Observation Observations */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-slate-900 text-xs flex items-center space-x-1.5 pb-2 border-b border-slate-100">
                <ActivityIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Sample Historical Indicator Log (indicators.csv)</span>
              </h3>
              {loadingIndicators ? (
                <p className="text-slate-400 py-3 text-center">Loading longitudinal indicators...</p>
              ) : indicators.length === 0 ? (
                <p className="text-slate-400 py-3 text-center">No time-series indicator records found.</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {indicators.slice(0, 6).map((ind) => (
                    <div key={ind.indicator_id} className="flex items-center justify-between text-[11px] p-1.5 bg-slate-50 rounded">
                      <span className="font-medium text-slate-700">{ind.indicator_name}</span>
                      <div className="space-x-2 text-slate-500">
                        <span className="font-bold text-slate-900">{ind.value} {ind.unit}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ind.date}</span>
                        <span className="text-[9px] bg-white border border-slate-200 px-1 py-0.2 rounded text-slate-500">{ind.source_system}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. AI-Generated Intervention Brief (Groq LLM) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-brand-900" />
                <h3 className="font-semibold text-slate-900 text-xs">AI Recommendation Engine (Groq Llama-3/Qwen)</h3>
              </div>
              <button
                onClick={handleGenerateAI}
                disabled={generatingAI}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-brand-900 text-white rounded hover:bg-brand-950 font-medium text-xs transition disabled:opacity-50"
              >
                {generatingAI ? (
                  <span>Generating AI Brief...</span>
                ) : (
                  <>
                    <SparklesIcon className="w-3 h-3" />
                    <span>Generate Action Plan</span>
                  </>
                )}
              </button>
            </div>

            {aiBrief ? (
              <div className="p-3.5 bg-brand-50/60 border border-brand-200 rounded-md">
                <span className="text-[11px] font-bold text-brand-950 block mb-1">
                  Tailored Actionable Recommendations:
                </span>
                <div className="whitespace-pre-line text-brand-900 text-xs leading-relaxed font-sans">
                  {aiBrief}
                </div>
                <div className="mt-2.5 pt-2 border-t border-brand-200/60 flex justify-end">
                  <button
                    onClick={() => {
                      setNewTitle(`AI Action Plan: ${student.student_name}`);
                      setShowCreateForm(true);
                    }}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-900 hover:underline"
                  >
                    <PlusIcon className="w-3 h-3" />
                    <span>Adopt into Closed-Loop Intervention &rarr;</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">
                Click &quot;Generate Action Plan&quot; to synthesize student metrics into a 3-bullet prescriptive intervention brief.
              </p>
            )}
          </div>

          {/* 5. Closed-Loop Interventions for This Student */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-xs">Active & Past Interventions ({student.interventions?.length || 0})</h3>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center space-x-1 text-xs text-brand-900 font-semibold hover:underline"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>{showCreateForm ? 'Cancel Form' : 'Create New Intervention'}</span>
              </button>
            </div>

            {/* Creation Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateIntervention} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <span className="font-bold text-slate-800 text-xs block">Register New Case in SQLite</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Intervention Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Remedial Tutoring & Weekly Attendance Audit"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Attendance">Attendance</option>
                      <option value="Placement">Placement</option>
                      <option value="Holistic">Holistic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Assigned Faculty / Mentor</label>
                    <input
                      type="text"
                      required
                      value={newFaculty}
                      onChange={(e) => setNewFaculty(e.target.value)}
                      placeholder="e.g. Dr. S. Sharma"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Target Due Date</label>
                    <input
                      type="date"
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">Initial Advisor Note</label>
                    <textarea
                      rows={2}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Action steps agreed during advisement..."
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingIntervention}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-900 hover:bg-brand-950 rounded transition disabled:opacity-50"
                  >
                    {submittingIntervention ? 'Saving...' : 'Save & Commit Intervention'}
                  </button>
                </div>
              </form>
            )}

            {/* Existing Interventions List */}
            {(!student.interventions || student.interventions.length === 0) ? (
              <p className="text-slate-400 text-center py-3">No interventions registered for this student yet.</p>
            ) : (
              <div className="space-y-2">
                {student.interventions.map((intv) => (
                  <div key={intv.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{intv.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          intv.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : intv.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {intv.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Category: {intv.category} • Assigned: <strong className="text-slate-700">{intv.assigned_faculty}</strong> • Target: {intv.due_date}
                    </p>
                    {intv.resolution_notes && (
                      <p className="text-[11px] text-emerald-800 bg-emerald-50/60 p-1.5 rounded border border-emerald-100">
                        Resolution Note: {intv.resolution_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-400">Last record update: {student.last_updated}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded transition shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
