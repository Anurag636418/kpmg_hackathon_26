import React from 'react';

interface KPICardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  status?: 'normal' | 'danger' | 'warning' | 'success';
  definition?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  subtitle,
  status = 'normal',
  definition,
  onClick
}) => {
  const getStatusBorder = () => {
    switch (status) {
      case 'danger':
        return 'border-rose-300 bg-rose-50/40 text-rose-950';
      case 'warning':
        return 'border-amber-300 bg-amber-50/40 text-amber-950';
      case 'success':
        return 'border-emerald-300 bg-emerald-50/40 text-emerald-950';
      default:
        return 'border-slate-200 bg-white text-slate-900';
    }
  };

  const getNumberColor = () => {
    switch (status) {
      case 'danger':
        return 'text-rose-700';
      case 'warning':
        return 'text-amber-700';
      case 'success':
        return 'text-emerald-700';
      default:
        return 'text-slate-900';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-lg border transition-all ${getStatusBorder()} ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''
      }`}
      title={definition}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600 truncate">{label}</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <span className={`text-2xl font-bold tracking-tight ${getNumberColor()}`}>
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-slate-500 font-medium ml-2">{subtitle}</span>
        )}
      </div>
      {definition && (
        <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{definition}</p>
      )}
    </div>
  );
};
