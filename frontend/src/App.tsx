import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { StudentsTable } from './components/StudentsTable';
import { InterventionsHub } from './components/InterventionsHub';
import { StudentDetailModal } from './components/StudentDetailModal';
import {
  fetchDashboardAnalytics,
  fetchStudents,
  fetchStudentProfile,
  fetchInterventions,
  fetchInterventionTimeline,
  updateIntervention,
} from './api';
import { DashboardAnalytics, StudentSummary, StudentDetail, InterventionItem, InterventionLogItem } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'students' | 'interventions'>('overview');

  // Analytics State
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);

  // Students Directory State
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [studentsTotal, setStudentsTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedInterventionStatus, setSelectedInterventionStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('success_score');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);

  // Interventions Hub State
  const [interventions, setInterventions] = useState<InterventionItem[]>([]);
  const [timeline, setTimeline] = useState<InterventionLogItem[]>([]);
  const [loadingInterventions, setLoadingInterventions] = useState<boolean>(false);

  // Student Profile Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // Feedback banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Load Dashboard Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const data = await fetchDashboardAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // 2. Load Students Directory
  const loadStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const res = await fetchStudents({
        risk: selectedRisk,
        department: selectedDepartment,
        intervention_status: selectedInterventionStatus,
        search: searchQuery,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: 20,
      });
      setStudents(res.data);
      setStudentsTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedRisk, selectedDepartment, selectedInterventionStatus, searchQuery, sortBy, sortOrder, page]);

  // 3. Load Interventions Hub
  const loadInterventions = useCallback(async () => {
    try {
      setLoadingInterventions(true);
      const [intvs, time] = await Promise.all([
        fetchInterventions(),
        fetchInterventionTimeline(),
      ]);
      setInterventions(intvs);
      setTimeline(time);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setLoadingInterventions(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAnalytics();
    loadInterventions();
  }, [loadAnalytics, loadInterventions]);

  // Reload students on filter changes
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Handlers
  const handleSelectStudent = async (studentId: string) => {
    setLoadingProfile(true);
    try {
      const profile = await fetchStudentProfile(studentId);
      setSelectedStudent(profile);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleFilterRiskFromOverview = (risk: string) => {
    setSelectedRisk(risk);
    setCurrentTab('students');
  };

  const handleSortChange = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const handleUpdateInterventionStatus = async (
    id: string,
    status: 'Pending' | 'In Progress' | 'Resolved',
    notes?: string
  ) => {
    await updateIntervention(id, {
      status,
      resolution_notes: notes,
      log_note: notes || `Status updated to ${status}`,
    });
    showToast(`Intervention ${id} updated to ${status}`);
    await Promise.all([loadInterventions(), loadAnalytics(), loadStudents()]);
  };

  const handleInterventionCreated = async () => {
    showToast('New intervention successfully created & recorded in SQLite');
    await Promise.all([loadInterventions(), loadAnalytics(), loadStudents()]);
    if (selectedStudent) {
      // Reload profile
      const updated = await fetchStudentProfile(selectedStudent.student_id);
      setSelectedStudent(updated);
    }
  };

  const openInterventionsCount = analytics?.kpis.open_interventions || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        openInterventionsCount={openInterventionsCount}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium animate-fade-in flex items-center space-x-2 border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          loadingAnalytics || !analytics ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              Loading Institutional Analytics...
            </div>
          ) : (
            <OverviewDashboard
              analytics={analytics}
              onFilterRisk={handleFilterRiskFromOverview}
              onNavigateToInterventions={() => setCurrentTab('interventions')}
            />
          )
        )}

        {currentTab === 'students' && (
          <StudentsTable
            students={students}
            total={studentsTotal}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            selectedRisk={selectedRisk}
            onSelectRisk={setSelectedRisk}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={setSelectedDepartment}
            selectedInterventionStatus={selectedInterventionStatus}
            onSelectInterventionStatus={setSelectedInterventionStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onSelectStudent={handleSelectStudent}
            loading={loadingStudents}
          />
        )}

        {currentTab === 'interventions' && (
          <InterventionsHub
            interventions={interventions}
            timeline={timeline}
            onUpdateStatus={handleUpdateInterventionStatus}
            onInspectStudent={handleSelectStudent}
            loading={loadingInterventions}
            onRefresh={() => {
              loadInterventions();
              loadAnalytics();
            }}
          />
        )}
      </main>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onInterventionCreated={handleInterventionCreated}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        CampusPulse AI • KPMG HacXLerate 2026 Round 1 • Production-Minded Analytics & Closed-Loop Interventions
      </footer>
    </div>
  );
}

export default App;
