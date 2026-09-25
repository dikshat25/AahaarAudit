import React from 'react';

const PRIORITY_STYLES = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
};

export function PriorityBadge({ priority }) {
  const cls = PRIORITY_STYLES[priority] || 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide border ${cls}`}>
      {priority}
    </span>
  );
}

const STATUS_STYLES = {
  Submitted: 'bg-slate-50 text-slate-600 border-slate-200',
  'AI Analysis': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Assigned: 'bg-blue-50 text-blue-600 border-blue-200',
  'Under Investigation': 'bg-amber-50 text-amber-700 border-amber-200',
  'Inspection Scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
  'Inspection Completed': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Resolution: 'bg-teal-50 text-teal-700 border-teal-200',
  Closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {status}
    </span>
  );
}
