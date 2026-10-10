import React from 'react';
import { DashboardAnalytics } from '../types';
import { KPICard } from './KPICard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AlertCircle, GraduationCap, Clock, Award, Activity } from 'lucide-react';

interface OverviewDashboardProps {
  analytics: DashboardAnalytics;
  onFilterRisk: (risk: string) => void;
  onNavigateToInterventions: () => void;
}

const RISK_COLORS = {
  High: '#e11d48', // rose-600
  Medium: '#d97706', // amber-600
  Low: '#16a34a', // emerald-600
};

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  analytics,
  onFilterRisk,
  onNavigateToInterventions,
}) => {
  const { kpis, academic_summary, risk_distributions, department_analytics } = analytics;

  // Prepare overall risk pie data
  const overallRiskData = [
    { name: 'High Risk', value: risk_distributions.overall.High || 0, color: RISK_COLORS.High },
    { name: 'Medium Risk', value: risk_distributions.overall.Medium || 0, color: RISK_COLORS.Medium },
    { name: 'Low Risk', value: risk_distributions.overall.Low || 0, color: RISK_COLORS.Low },
  ];

  // Prepare department comparison data
  const deptData = department_analytics.map((d) => ({
    name: d.department.replace(' Dept', ''),
    High: d.high_risk,
    Medium: d.medium_risk,
    Low: d.low_risk,
    AvgScore: d.avg_score,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Overview & Risk Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cohort health, early-warning signals, and closed-loop intervention tracking across 400 enrolled students.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Cohort Benchmark:</span>
          <span className="px-2.5 py-1 text-xs font-semibold bg-brand-50 text-brand-900 rounded border border-brand-200">
            Avg Success Score: {kpis.avg_success_score} / 100
          </span>
        </div>
      </div>

      {/* A. Compact Enterprise KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard
          label="Total Enrolled"
          value={kpis.total_enrolled}
          subtitle="Students"
          definition="Total active student cohort loaded from SIS records."
        />
        <KPICard
          label="High Risk"
          value={kpis.high_risk_students}
          subtitle={`${Math.round((kpis.high_risk_students / kpis.total_enrolled) * 100)}%`}
          status="danger"
          definition="Critical academic or placement failure risk."
          onClick={() => onFilterRisk('High')}
        />
        <KPICard
          label="Medium Risk"
          value={kpis.medium_risk_students}
          subtitle={`${Math.round((kpis.medium_risk_students / kpis.total_enrolled) * 100)}%`}
          status="warning"
          definition="Requires monitoring and timely support."
          onClick={() => onFilterRisk('Medium')}
        />
        <KPICard
          label="Low Risk"
          value={kpis.low_risk_students}
          subtitle={`${Math.round((kpis.low_risk_students / kpis.total_enrolled) * 100)}%`}
          status="success"
          definition="Meeting academic and employability standards."
          onClick={() => onFilterRisk('Low')}
        />
        <KPICard
          label="Open Interventions"
          value={kpis.open_interventions}
          subtitle="Pending / Active"
          status={kpis.open_interventions > 0 ? 'warning' : 'normal'}
          definition="Action items currently assigned to advisors."
          onClick={onNavigateToInterventions}
        />
        <KPICard
          label="Overdue Cases"
          value={kpis.overdue_interventions}
          subtitle="Needs Attention"
          status={kpis.overdue_interventions > 0 ? 'danger' : 'normal'}
          definition="Interventions past target follow-up deadline."
          onClick={onNavigateToInterventions}
        />
        <KPICard
          label="Resolved / Rate"
          value={`${kpis.intervention_completion_rate}%`}
          subtitle={`${kpis.resolved_interventions} Completed`}
          status="success"
          definition="Closed-loop recovery actions verified."
          onClick={onNavigateToInterventions}
        />
      </div>

      {/* Academic & Attendance Health Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Observed Primary Indicators vs Derived Risk Summary
          </h2>
          <span className="text-[11px] text-slate-400">Source: Moodle LMS + SIS</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-3 p-2.5 rounded bg-slate-50 border border-slate-100">
            <GraduationCap className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Cohort CGPA Average</p>
              <p className="text-base font-bold text-slate-900">{academic_summary.avg_cgpa} <span className="text-xs font-normal text-slate-500">/ 10.0</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2.5 rounded bg-slate-50 border border-slate-100">
            <Activity className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Overall Attendance Avg</p>
              <p className="text-base font-bold text-slate-900">{academic_summary.avg_attendance}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2.5 rounded bg-rose-50/50 border border-rose-100">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs text-rose-800 font-medium">Critical Attendance (&lt;75%)</p>
              <p className="text-base font-bold text-rose-700">{academic_summary.critical_attendance_count} students</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2.5 rounded bg-amber-50/50 border border-amber-100">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs text-amber-800 font-medium">Active Backlogs Reported</p>
              <p className="text-base font-bold text-amber-700">{academic_summary.active_backlog_students} students</p>
            </div>
          </div>
        </div>
      </div>

      {/* B. Student Risk Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-slate-900">Cohort Risk Distribution</h2>
              <span className="text-[11px] font-medium text-slate-500">All 400 Students</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Overall risk tier determined from academic and placement indicators.</p>
          </div>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallRiskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {overallRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} students (${Math.round((val / 400) * 100)}%)`, 'Count']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-1.5 bg-slate-50 rounded">
              <span className="text-slate-500 block text-[11px]">Academic Risk (High)</span>
              <span className="font-bold text-rose-700">{risk_distributions.academic.High || 0}</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded">
              <span className="text-slate-500 block text-[11px]">Placement Risk (High)</span>
              <span className="font-bold text-amber-700">{risk_distributions.placement.High || 0}</span>
            </div>
          </div>
        </div>

        {/* Department-level Risk Distribution */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-slate-900">Risk Profile by Academic Department</h2>
              <span className="text-[11px] font-medium text-slate-500">Stacked Headcount</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">Compares high, medium, and low risk distribution across engineering and business programs.</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="High" name="High Risk" stackId="a" fill={RISK_COLORS.High} />
                <Bar dataKey="Medium" name="Medium Risk" stackId="a" fill={RISK_COLORS.Medium} />
                <Bar dataKey="Low" name="Low Risk" stackId="a" fill={RISK_COLORS.Low} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Highest Risk Density: Computer Science & Civil</span>
            <button
              onClick={() => onFilterRisk('High')}
              className="text-brand-900 font-semibold hover:underline"
            >
              Filter High Risk Students &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
