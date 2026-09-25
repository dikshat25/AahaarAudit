import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Star, Edit3, Save, CheckCircle2, ShieldCheck
} from 'lucide-react';

export default function CustomerProfileTab({ profile }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    full_name: profile?.full_name || 'Customer',
    email: profile?.email || '—',
    phone: profile?.phone || 'Not provided',
    address: profile?.address || 'Not provided',
  });

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl space-y-5">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A2647] to-[#153C6E] flex items-center justify-center shrink-0 shadow-md">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-[#0A2647] text-xl leading-tight">
                  {localProfile.full_name}
                </h3>
                <p className="text-xs text-[#0A2647]/60 mt-0.5">
                  Registered Consumer · AhaarAudit Platform
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-[#0A2647] text-white rounded font-mono">
                    CUSTOMER
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono border border-emerald-200">
                    VERIFIED
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

      {/* Profile Fields */}
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card space-y-4">
        <h4 className="text-sm font-bold text-[#0A2647] border-b border-[#0A2647]/10 pb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-[#0A2647]/50" /> Personal Information
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
        <ProfileField
          icon={MapPin} label="Address / City"
          value={localProfile.address}
          editing={editing}
          onChange={(v) => setLocalProfile((p) => ({ ...p, address: v }))}
        />
      </div>

      {/* Consumer Rights Info */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong>Role: Consumer</strong> — You can file food safety complaints, track their resolution,
          view publicly available restaurant hygiene scorecards, and receive notifications on complaint updates.
          Your personal data is visible only to you.
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
