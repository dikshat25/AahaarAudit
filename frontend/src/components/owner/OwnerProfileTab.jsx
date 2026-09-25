import React, { useState } from 'react';
import {
  Building2, MapPin, FileCheck2, Mail, Phone, User,
  Store, Shield, Star, Edit3, Save, X, CheckCircle2
} from 'lucide-react';

export default function OwnerProfileTab({ profile }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    full_name: profile?.full_name || 'Hotel Owner',
    email: profile?.email || '—',
    phone: profile?.phone || 'Not provided',
    business_name: profile?.business_name || 'Your Outlet',
    business_type: profile?.business_type || 'Restaurant',
    business_address: profile?.business_address || 'Not provided',
    fssai_license: profile?.fssai_license || 'Not provided',
    establishment_id: profile?.establishment_id || 'REST-001',
  });

  const handleSave = () => {
    // In production this would call an API to update the profile
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A2647] to-[#153C6E] flex items-center justify-center shrink-0 shadow-md">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-[#0A2647] text-xl leading-tight">
                  {localProfile.business_name}
                </h3>
                <p className="text-xs text-[#0A2647]/60 mt-0.5">
                  {localProfile.full_name} · {localProfile.business_type}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-[#0A2647] text-white rounded font-mono">
                    OWNER / OPERATOR
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono border border-emerald-200">
                    {localProfile.establishment_id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  editing
                    ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800'
                    : 'border-[#0A2647]/20 text-[#0A2647] hover:bg-[#0A2647]/5'
                }`}
              >
                {editing ? <><Save className="w-3.5 h-3.5" /> Save</> : <><Edit3 className="w-3.5 h-3.5" /> Edit</>}
              </button>
            </div>
          </div>
        </div>
        {saved && (
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" /> Profile updated successfully.
          </div>
        )}
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card space-y-4">
        <h4 className="text-sm font-bold text-[#0A2647] border-b border-[#0A2647]/10 pb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-[#0A2647]/50" /> Account Owner Details
        </h4>
        <ProfileField
          icon={User} label="Full Name"
          value={localProfile.full_name}
          editing={editing}
          onChange={(v) => setLocalProfile((p) => ({ ...p, full_name: v }))}
        />
        <ProfileField
          icon={Mail} label="Email Address"
          value={localProfile.email}
          editing={false}
        />
        <ProfileField
          icon={Phone} label="Phone Number"
          value={localProfile.phone}
          editing={editing}
          onChange={(v) => setLocalProfile((p) => ({ ...p, phone: v }))}
        />
      </div>

      {/* Establishment Info */}
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card space-y-4">
        <h4 className="text-sm font-bold text-[#0A2647] border-b border-[#0A2647]/10 pb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0A2647]/50" /> Establishment Details
        </h4>
        <ProfileField
          icon={Building2} label="Business Name"
          value={localProfile.business_name}
          editing={editing}
          onChange={(v) => setLocalProfile((p) => ({ ...p, business_name: v }))}
        />
        <ProfileField
          icon={Store} label="Business Type"
          value={localProfile.business_type}
          editing={editing}
          onChange={(v) => setLocalProfile((p) => ({ ...p, business_type: v }))}
        />
        <ProfileField
          icon={MapPin} label="Business Address"
          value={localProfile.business_address}
          editing={editing}
          onChange={(v) => setLocalProfile((p) => ({ ...p, business_address: v }))}
        />
        <ProfileField
          icon={FileCheck2} label="FSSAI License No."
          value={localProfile.fssai_license}
          editing={editing}
          onChange={(v) => setLocalProfile((p) => ({ ...p, fssai_license: v }))}
        />
        <ProfileField
          icon={Shield} label="Establishment ID"
          value={localProfile.establishment_id}
          editing={false}
        />
      </div>

      {/* Access Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
        <Star className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Role: Hotel Owner</strong> — You can view and respond to complaints, run AI inspections, and check reports
          linked to your establishment ({localProfile.establishment_id}). Admin scorecards and violations are read-only.
        </p>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value, editing, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[#0A2647]/5 shrink-0">
        <Icon className="w-4 h-4 text-[#0A2647]/60" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-[#0A2647]/50">{label}</p>
        {editing && onChange ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm font-semibold text-[#0A2647] bg-[#F6F5F1] border border-[#0A2647]/15 rounded-lg px-2 py-1 mt-0.5 focus:outline-none focus:border-[#FF9933]"
          />
        ) : (
          <p className="text-sm font-semibold text-[#0A2647]">{value}</p>
        )}
      </div>
    </div>
  );
}
