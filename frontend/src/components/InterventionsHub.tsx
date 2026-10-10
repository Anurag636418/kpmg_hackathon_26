import React, { useState } from 'react';
import { InterventionItem, InterventionLogItem } from '../types';
import { ShieldAlert, CheckCircle, Clock, AlertTriangle, UserCheck, MessageSquarePlus, RefreshCw } from 'lucide-react';

interface InterventionsHubProps {
  interventions: InterventionItem[];
  timeline: InterventionLogItem[];
  onUpdateStatus: (
    id: string,
    status: 'Pending' | 'In Progress' | 'Resolved',
    notes?: string
  ) => Promise<void>;
  onInspectStudent: (studentId: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const InterventionsHub: React.FC<InterventionsHubProps> = ({
  interventions,
  timeline,
  onUpdateStatus,
  onInspectStudent,
  loading,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionItem | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<'Pending' | 'In Progress' | 'Resolved'>('In Progress');
  const [statusNote, setStatusNote] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculated metrics
  const total = interventions.length;
  const pending = interventions.filter((i) => i.status === 'Pending').length;
  const inProgress = interventions.filter((i) => i.status === 'In Progress').length;
  const resolved = interventions.filter((i) => i.status === 'Resolved').length;
  const overdue = interventions.filter(
    (i) => i.status !== 'Resolved' && i.due_date < todayStr
  ).length;

  const filtered = interventions.filter((i) => {
    if (filterStatus !== 'All' && i.status !== filterStatus) return false;
    if (filterPriority !== 'All' && i.priority !== filterPriority) return false;
    return true;
  });

  const handleOpenStatusModal = (intv: InterventionItem) => {
    setSelectedIntervention(intv);
    setNewStatus(intv.status);
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleSubmitStatusUpdate = async () => {
    if (!selectedIntervention) return;
    setUpdatingId(selectedIntervention.id);
    try {
      await onUpdateStatus(selectedIntervention.id, newStatus, statusNote);
      setStatusModalOpen(false);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Closed-Loop Intervention Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-tracked faculty recovery workflows, follow-up deadlines, and student resolution outcomes.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="mt-3 sm:mt-0 inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 rounded text-slate-700 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
          <span className="text-xs font-medium text-slate-500">Total Cases</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{total}</p>
          <p className="text-[11px] text-slate-400">All registered student interventions</p>
        </div>

        <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40">
          <span className="text-xs font-medium text-amber-800">Pending Outreach</span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{pending}</p>
          <p className="text-[11px] text-amber-600">Awaiting initial faculty contact</p>
        </div>

        <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40">
          <span className="text-xs font-medium text-blue-800">In Progress</span>
          <p className="text-2xl font-bold text-blue-700 mt-1">{inProgress}</p>
          <p className="text-[11px] text-blue-600">Active tutoring or counseling</p>
        </div>

        <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40">
          <span className="text-xs font-medium text-rose-800">Overdue Follow-ups</span>
          <p className="text-2xl font-bold text-rose-700 mt-1">{overdue}</p>
          <p className="text-[11px] text-rose-600">Past target completion deadline</p>
        </div>

        <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40">
          <span className="text-xs font-medium text-emerald-800">Resolved</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{resolved}</p>
          <p className="text-[11px] text-emerald-600">
            {total > 0 ? `${Math.round((resolved / total) * 100)}% resolution rate` : '0%'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interventions Table */}
        <div className="lg:col-span-2 space-y-3">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <label className="text-slate-500 font-medium">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <label className="text-slate-500 font-medium">Priority:</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <span className="text-slate-500">
              Showing {filtered.length} of {total} records
            </span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th scope="col" className="px-3.5 py-2.5">Case Title</th>
                    <th scope="col" className="px-3.5 py-2.5">Student</th>
                    <th scope="col" className="px-3.5 py-2.5">Assigned Faculty</th>
                    <th scope="col" className="px-3.5 py-2.5">Due Date</th>
                    <th scope="col" className="px-3.5 py-2.5">Status</th>
                    <th scope="col" className="px-3.5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Loading intervention records...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No interventions matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((intv) => {
                      const isOverdue = intv.status !== 'Resolved' && intv.due_date < todayStr;
                      return (
                        <tr key={intv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3.5 py-2.5">
                            <div className="font-semibold text-slate-900">{intv.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {intv.category} • Priority: <span className="font-medium text-slate-700">{intv.priority}</span>
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <button
                              onClick={() => onInspectStudent(intv.student_id)}
                              className="font-medium text-brand-900 hover:underline text-left"
                            >
                              {intv.student_name}
                            </button>
                            <div className="text-[11px] font-mono text-slate-400">{intv.student_id}</div>
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-700 font-medium">
                            {intv.assigned_faculty}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                              {intv.due_date}
                            </span>
                            {isOverdue && (
                              <span className="block text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                                Overdue
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                                intv.status === 'Resolved'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : intv.status === 'In Progress'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {intv.status}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <button
                              onClick={() => handleOpenStatusModal(intv)}
                              className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Trail Activity Timeline */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Audit Activity Timeline</h2>
            <span className="text-[11px] text-slate-400">Live Log</span>
          </div>

          <p className="text-xs text-slate-500">
            Chronological audit trail of all intervention status changes and notes recorded in SQLite.
          </p>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {timeline.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No activity events recorded yet.</p>
            ) : (
              timeline.map((item, idx) => (
                <div key={item.id || idx} className="text-xs border-l-2 border-slate-300 pl-3 py-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{item.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {item.timestamp ? item.timestamp.replace('T', ' ').slice(0, 16) : ''}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{item.note}</p>
                  <p className="text-[10px] text-slate-400">Recorded by: {item.performed_by}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal for Status & Note Update */}
      {statusModalOpen && selectedIntervention && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-base font-semibold text-slate-900">Update Intervention Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedIntervention.student_name} ({selectedIntervention.student_id}) — {selectedIntervention.title}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">New Workflow Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 bg-white focus:outline-none focus:border-brand-900"
                >
                  <option value="Pending">Pending (Not Started)</option>
                  <option value="In Progress">In Progress (Active Coaching)</option>
                  <option value="Resolved">Resolved (Outcome Verified)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Audit Note / Meeting Outcome</label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Record advisor notes, attendance verification, or remediation outcome..."
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 bg-white focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitStatusUpdate}
                disabled={updatingId !== null}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-900 hover:bg-brand-950 rounded transition disabled:opacity-50"
              >
                {updatingId ? 'Saving...' : 'Save & Record Audit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
