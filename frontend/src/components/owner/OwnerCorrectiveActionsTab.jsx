import React, { useState } from 'react';
import { Upload, CheckCircle2, Clock } from 'lucide-react';

const INITIAL_ACTIONS = [
  {
    id: 'CA-301',
    action: 'Clean and sanitize preparation area',
    reason: 'Customer complaint CMP-10238 — hygiene',
    related: 'Complaint CMP-10238',
    deadline: '2026-09-19',
    status: 'Verification',
  },
  {
    id: 'CA-302',
    action: 'Correct cold-storage temperature',
    reason: 'Sensor anomaly — Cold Storage 2 excursion',
    related: 'Sensor Alert #SA-118',
    deadline: '2026-09-25',
    status: 'Action Required',
  },
  {
    id: 'CA-303',
    action: 'Replace expired chicken stock',
    reason: 'Inventory expiry warning',
    related: 'Product batch B-9981',
    deadline: '2026-09-24',
    status: 'Action Required',
  },
  {
    id: 'CA-304',
    action: 'Switch to leak-proof packaging',
    reason: 'Customer complaint CMP-10201 — packaging',
    related: 'Complaint CMP-10201',
    deadline: '2026-09-05',
    status: 'Completed',
  },
];

const STAGES = ['Action Required', 'Submitted', 'Verification', 'Completed'];

function StageBadge({ status }) {
  const idx = STAGES.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {STAGES.map((s, i) => (
        <div key={s} className={`h-1.5 w-6 rounded-full ${i <= idx ? 'bg-[#1B7A3D]' : 'bg-[#0A2647]/10'}`} />
      ))}
    </div>
  );
}

export default function OwnerCorrectiveActionsTab() {
  const [actions, setActions] = useState(INITIAL_ACTIONS);

  const submitEvidence = (id) => {
    setActions((as) => as.map((a) => (a.id === id ? { ...a, status: 'Verification' } : a)));
  };

  return (
    <div className="space-y-4">
      {actions.map((a) => (
        <div key={a.id} className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[#0A2647]">{a.action}</p>
              <p className="text-xs text-[#0A2647]/50 mt-0.5">{a.reason} · linked to {a.related}</p>
              {a.deadline && (
                <p className="text-xs text-[#0A2647]/40 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Deadline {a.deadline}
                </p>
              )}
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full border shrink-0 ${
                a.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : a.status === 'Verification'
                  ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {a.status}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <StageBadge status={a.status} />
            {a.status === 'Action Required' && (
              <button
                onClick={() => submitEvidence(a.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0A2647] border border-[#0A2647]/20 rounded-lg px-3 py-1.5 hover:bg-[#0A2647]/5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Evidence & Submit
              </button>
            )}
            {a.status === 'Verification' && (
              <span className="text-xs text-[#0A2647]/50">Awaiting regulator verification</span>
            )}
            {a.status === 'Completed' && (
              <span className="text-xs text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
