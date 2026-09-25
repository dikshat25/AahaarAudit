import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Thermometer, PackageSearch, Camera, ClipboardCheck } from 'lucide-react';
import { MOCK_COMPLAINTS } from '../../mockData/complaints';
import { fetchEstablishmentScorecard } from '../../api/backendApi';

export default function OwnerHomeTab({ profile, onNavigate }) {
  const [scoreData, setScoreData] = useState(null);
  
  // Use profile establishment ID or default to REST-001 for demo
  const establishmentId = profile?.establishment_id || 'REST-001';

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchEstablishmentScorecard(establishmentId);
      setScoreData(data);
    };
    loadData();
  }, [establishmentId]);

  const complianceScore = scoreData ? scoreData.overall_score : 100;
  
  let riskLevel = 'LOW';
  let riskTone = 'emerald';
  if (complianceScore < 60) {
      riskLevel = 'CRITICAL';
      riskTone = 'red';
  } else if (complianceScore < 85) {
      riskLevel = 'MEDIUM';
      riskTone = 'amber';
  }

  const activeComplaints = MOCK_COMPLAINTS.filter((c) => c.status !== 'Closed').length;
  const openCorrective = MOCK_COMPLAINTS.filter((c) => c.correctiveAction && !c.correctiveAction.verified).length;

  const cards = [
    { label: 'Compliance Score', value: `${complianceScore.toFixed(0)}%`, icon: ShieldCheck, tone: 'emerald' },
    { label: 'Current Risk Level', value: riskLevel, icon: AlertTriangle, tone: riskTone },
    { label: 'Active Complaints', value: activeComplaints, icon: ClipboardCheck, tone: 'blue' },
    { label: 'Active AI Violations', value: scoreData ? scoreData.active_violations : 0, icon: Camera, tone: 'orange' },
  ];

  const toDo = [
    { icon: Camera, text: `${scoreData?.active_violations || 0} active AI camera violations detected that require attention.`, action: () => onNavigate('monitoring') },
    { icon: ClipboardCheck, text: 'Corrective action pending verification for hygiene complaint CMP-10238.', action: () => onNavigate('corrective-actions') },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-6">
        <h3 className="text-lg font-display font-bold text-[#0A2647]">{profile?.business_name || 'Your Outlet'}</h3>
        <p className="text-sm text-[#0A2647]/60 mt-1 flex items-center justify-between">
          <span>{profile?.business_type || 'Establishment'} — What problems exist in your establishment, and what do you need to fix?</span>
          <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">LIVE DB SYNC: {establishmentId}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-[#0A2647]/10 p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#0A2647]/5">
              <Icon className="w-5 h-5 text-[#0A2647]/70" />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-[#0A2647] leading-none">{value}</p>
              <p className="text-xs text-[#0A2647]/50 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-6">
        <h3 className="font-display font-bold text-[#0A2647] mb-3">What Needs Your Attention</h3>
        <div className="space-y-2">
          {toDo.map(({ icon: Icon, text, action }, i) => (
            <button
              key={i}
              onClick={action}
              className="w-full flex items-start gap-3 text-left bg-[#F6F5F1] rounded-lg px-4 py-3 hover:bg-[#0A2647]/5 transition-colors"
            >
              <Icon className="w-4 h-4 text-[#0A2647]/60 mt-0.5 shrink-0" />
              <span className="text-sm text-[#0A2647]">{text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
