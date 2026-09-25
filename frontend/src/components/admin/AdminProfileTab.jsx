import React from 'react';
import { User, Shield, Mail, Building, ClipboardList } from 'lucide-react';

export default function AdminProfileTab({ profile }) {
  const fields = [
    { label: 'Full Name',    value: profile?.full_name || 'Admin Officer' },
    { label: 'Email',        value: profile?.email || 'admin@gmail.com' },
    { label: 'Role',         value: 'Regulatory Inspector / Admin' },
    { label: 'Designation',  value: profile?.designation || 'Senior Food Inspector' },
    { label: 'Department',   value: profile?.department || 'FSSAI Enforcement Division' },
    { label: 'Zone',         value: 'Zone 4 — Mumbai & MMR' },
  ];

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#0A2647] flex items-center justify-center shrink-0">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-[#0A2647] text-xl">{profile?.full_name || 'Admin Officer'}</h3>
          <p className="text-xs text-[#0A2647]/60 mt-0.5">{profile?.designation || 'Senior Food Inspector'} · FSSAI Enforcement</p>
          <span className="mt-1 inline-block text-[11px] font-bold px-2 py-0.5 bg-[#0A2647] text-white rounded font-mono">
            {profile?.role?.toUpperCase() || 'REGULATOR'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card space-y-4">
        <h4 className="text-sm font-bold text-[#0A2647] border-b border-[#0A2647]/10 pb-2">Profile Details</h4>
        <dl className="space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex items-start justify-between gap-4 text-xs">
              <dt className="text-[#0A2647]/50 w-32 shrink-0">{f.label}</dt>
              <dd className="font-semibold text-[#0A2647] text-right">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
