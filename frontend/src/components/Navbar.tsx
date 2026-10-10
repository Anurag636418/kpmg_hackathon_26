import React from 'react';
import { LayoutDashboard, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentTab: 'overview' | 'students' | 'interventions';
  onSelectTab: (tab: 'overview' | 'students' | 'interventions') => void;
  openInterventionsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, openInterventionsCount = 0 }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-brand-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              CP
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 tracking-tight text-base">CampusPulse AI</span>
                <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  KPMG Smart Campus
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">Student Analytics & Decision Intelligence</p>
            </div>
          </div>

          {/* Restrained Navigation Controls */}
          <nav className="flex space-x-1" aria-label="Main Navigation">
            <button
              onClick={() => onSelectTab('overview')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                currentTab === 'overview'
                  ? 'bg-slate-100 text-brand-900 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onSelectTab('students')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                currentTab === 'students'
                  ? 'bg-slate-100 text-brand-900 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Student Directory</span>
            </button>

            <button
              onClick={() => onSelectTab('interventions')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                currentTab === 'interventions'
                  ? 'bg-slate-100 text-brand-900 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              <span>Interventions</span>
              {openInterventionsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                  {openInterventionsCount}
                </span>
              )}
            </button>
          </nav>

          {/* System Status Pill */}
          <div className="hidden md:flex items-center space-x-3 text-xs text-slate-500 border-l border-slate-200 pl-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-slate-700">Analytics Engine Active</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-[11px]">
              SQLite WAL
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
