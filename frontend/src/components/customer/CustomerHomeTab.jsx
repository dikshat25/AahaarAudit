import React from 'react';
import { FileText, Clock, Search as SearchIcon, CheckCircle2, Bell } from 'lucide-react';
import { MOCK_COMPLAINTS } from '../../mockData/complaints';
import { CUSTOMER_NOTIFICATIONS } from '../../mockData/notifications';
import { StatusBadge, PriorityBadge } from '../complaintBadges';

export default function CustomerHomeTab({ profile, onNavigate }) {
  const complaints = MOCK_COMPLAINTS;
  const active = complaints.filter((c) => c.status !== 'Closed').length;
  const underInvestigation = complaints.filter((c) => c.status === 'Under Investigation').length;
  const resolved = complaints.filter((c) => c.status === 'Closed' || c.status === 'Resolution').length;

  const stats = [
    { label: 'Total Complaints', value: complaints.length, icon: FileText },
    { label: 'Active', value: active, icon: Clock },
    { label: 'Under Investigation', value: underInvestigation, icon: SearchIcon },
    { label: 'Resolved', value: resolved, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-6">
        <h3 className="text-lg font-display font-bold text-[#0A2647]">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h3>
        <p className="text-sm text-[#0A2647]/60 mt-1">
          Report a food-safety issue, track your complaints, or check an outlet's hygiene record before you order.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => onNavigate('create-complaint')}
            className="px-4 py-2 rounded-lg bg-[#0A2647] text-white text-sm font-semibold hover:bg-[#0A2647]/90 transition-colors"
          >
            Report an Issue
          </button>
          <button
            onClick={() => onNavigate('find')}
            className="px-4 py-2 rounded-lg border border-[#0A2647]/20 text-[#0A2647] text-sm font-semibold hover:bg-[#0A2647]/5 transition-colors"
          >
            Find an Outlet
          </button>
          <button
            onClick={() => onNavigate('scorecards')}
            className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors"
          >
            Check Scorecards
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-[#0A2647]/10 p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#0A2647]/5">
              <Icon className="w-5 h-5 text-[#0A2647]/70" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-[#0A2647] leading-none">{value}</p>
              <p className="text-xs text-[#0A2647]/50 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[#0A2647]">Recent Complaint Updates</h3>
          <button onClick={() => onNavigate('tracking')} className="text-xs font-semibold text-[#0A2647]/60 hover:text-[#0A2647]">
            View all →
          </button>
        </div>
        <div className="divide-y divide-[#0A2647]/8">
          {complaints.slice(0, 3).map((c) => (
            <div key={c.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#0A2647]">{c.title}</p>
                <p className="text-xs text-[#0A2647]/50">{c.establishment} · {c.id}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[#0A2647] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0A2647]/50" /> Notifications
          </h3>
          <button onClick={() => onNavigate('notifications')} className="text-xs font-semibold text-[#0A2647]/60 hover:text-[#0A2647]">
            View all →
          </button>
        </div>
        <div className="space-y-2">
          {CUSTOMER_NOTIFICATIONS.filter((n) => !n.read).slice(0, 2).map((n) => (
            <div key={n.id} className="text-sm bg-[#F6F5F1] rounded-lg px-3 py-2">
              <p className="font-semibold text-[#0A2647]">{n.title}</p>
              <p className="text-xs text-[#0A2647]/60">{n.body}</p>
            </div>
          ))}
          {CUSTOMER_NOTIFICATIONS.filter((n) => !n.read).length === 0 && (
            <p className="text-sm text-[#0A2647]/50">You're all caught up.</p>
          )}
        </div>
      </div>
    </div>
  );
}
