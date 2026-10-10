import React from 'react';
import { StudentSummary } from '../types';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface StudentsTableProps {
  students: StudentSummary[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  selectedRisk: string;
  onSelectRisk: (risk: string) => void;
  selectedDepartment: string;
  onSelectDepartment: (dept: string) => void;
  selectedInterventionStatus: string;
  onSelectInterventionStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (column: string) => void;
  onSelectStudent: (studentId: string) => void;
  loading: boolean;
}

const DEPARTMENTS = [
  'All',
  'Computer Science Dept',
  'Electronics Dept',
  'Mechanical Dept',
  'Business Dept',
  'Civil Dept',
];

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  total,
  page,
  totalPages,
  onPageChange,
  selectedRisk,
  onSelectRisk,
  selectedDepartment,
  onSelectDepartment,
  selectedInterventionStatus,
  onSelectInterventionStatus,
  searchQuery,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  onSelectStudent,
  loading,
}) => {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">High Risk</span>;
      case 'Medium':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Medium</span>;
      case 'Low':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Low</span>;
      default:
        return <span className="text-xs text-slate-500">{risk}</span>;
    }
  };

  const getInterventionBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200">In Progress</span>;
      case 'Resolved':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">Resolved</span>;
      default:
        return <span className="text-slate-400 text-xs">—</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or ID (e.g. STU0004)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-900 focus:border-brand-900"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-900">{students.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{total}</span> filtered students
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center space-x-1">
            <label className="text-slate-500">Risk:</label>
            <select
              value={selectedRisk}
              onChange={(e) => onSelectRisk(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-brand-900"
            >
              <option value="All">All Risks</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center space-x-1">
            <label className="text-slate-500">Department:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => onSelectDepartment(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-brand-900"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Intervention Status Filter */}
          <div className="flex items-center space-x-1">
            <label className="text-slate-500">Intervention:</label>
            <select
              value={selectedInterventionStatus}
              onChange={(e) => onSelectInterventionStatus(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-brand-900"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Action</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="None">None Recorded</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedRisk !== 'All' || selectedDepartment !== 'All' || selectedInterventionStatus !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                onSelectRisk('All');
                onSelectDepartment('All');
                onSelectInterventionStatus('All');
                onSearchChange('');
              }}
              className="text-brand-900 hover:underline font-medium ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* High-density Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-600 font-semibold">
              <tr>
                <th
                  scope="col"
                  className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-100"
                  onClick={() => onSortChange('student_id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-100"
                  onClick={() => onSortChange('student_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th scope="col" className="px-3.5 py-2.5">
                  Program / Year
                </th>
                <th
                  scope="col"
                  className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-100"
                  onClick={() => onSortChange('cgpa')}
                >
                  <div className="flex items-center space-x-1">
                    <span>CGPA</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-100"
                  onClick={() => onSortChange('overall_attendance_percentage')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Attendance</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-100"
                  onClick={() => onSortChange('success_score')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Success Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th scope="col" className="px-3.5 py-2.5">
                  Overall Risk
                </th>
                <th scope="col" className="px-3.5 py-2.5">
                  Identified Drivers
                </th>
                <th scope="col" className="px-3.5 py-2.5">
                  Intervention
                </th>
                <th scope="col" className="px-3.5 py-2.5 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    No student records matching current filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.student_id}
                    onClick={() => onSelectStudent(student.student_id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-3.5 py-2 font-mono text-slate-500 font-medium">
                      {student.student_id}
                    </td>
                    <td className="px-3.5 py-2 font-semibold text-slate-900">
                      {student.student_name}
                    </td>
                    <td className="px-3.5 py-2 text-slate-600">
                      {student.program} • Y{student.year_of_study}
                    </td>
                    <td className="px-3.5 py-2 font-medium">
                      <span className={student.cgpa < 6.0 ? 'text-rose-600 font-semibold' : 'text-slate-800'}>
                        {student.cgpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 font-medium">
                      <span className={student.overall_attendance_percentage < 75.0 ? 'text-rose-600 font-semibold' : 'text-slate-800'}>
                        {student.overall_attendance_percentage}%
                      </span>
                    </td>
                    <td className="px-3.5 py-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 w-9">{student.success_score}</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              student.success_score >= 75
                                ? 'bg-emerald-500'
                                : student.success_score >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, student.success_score))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-2">
                      {getRiskBadge(student.overall_risk_level)}
                    </td>
                    <td className="px-3.5 py-2 text-slate-500 max-w-[150px] truncate" title={student.risk_factors}>
                      {student.risk_factors || 'None'}
                    </td>
                    <td className="px-3.5 py-2">
                      {getInterventionBadge(student.intervention_status)}
                    </td>
                    <td className="px-3.5 py-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(student.student_id);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
