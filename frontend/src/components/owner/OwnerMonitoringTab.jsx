import React, { useEffect, useState } from 'react';
import { Camera, Wifi, AlertTriangle, Thermometer } from 'lucide-react';
import { fetchEstablishmentViolations } from '../../api/backendApi';

const CAMERAS = [
  { name: 'Kitchen Prep Cam', status: 'online' },
  { name: 'Storage Room Cam', status: 'online' },
  { name: 'Wash Station Cam', status: 'offline' },
];

export default function OwnerMonitoringTab({ profile }) {
  const [violations, setViolations] = useState([]);
  const establishmentId = profile?.establishment_id || 'REST-001';

  useEffect(() => {
    const loadViolations = async () => {
      const data = await fetchEstablishmentViolations(establishmentId);
      // Filter out resolved if we only want active, but let's show all for demo
      setViolations(data.reverse()); // Show newest first
    };
    loadViolations();
    
    // Auto refresh every 5 seconds for live demo feel
    const interval = setInterval(loadViolations, 5000);
    return () => clearInterval(interval);
  }, [establishmentId]);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        {CAMERAS.map((c) => (
          <div key={c.name} className="bg-white rounded-xl border border-[#0A2647]/10 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${c.status === 'online' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <Camera className={`w-4 h-4 ${c.status === 'online' ? 'text-emerald-600' : 'text-red-500'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A2647]">{c.name}</p>
              <p className={`text-xs flex items-center gap-1 ${c.status === 'online' ? 'text-emerald-600' : 'text-red-500'}`}>
                <Wifi className="w-3 h-3" /> {c.status === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6">
        <h3 className="font-display font-bold text-[#0A2647] mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#0A2647]/50" /> LIVE AI Detections</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded animate-pulse">Syncing Database</span>
        </h3>
        
        {violations.length === 0 ? (
           <p className="text-sm text-[#0A2647]/50 py-4">No AI detections found in the live database for {establishmentId}.</p>
        ) : (
          <div className="divide-y divide-[#0A2647]/8">
            {violations.map((v) => (
              <div key={v.violation_id} className="py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#0A2647]">Violation: {v.violation_type.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-xs text-[#0A2647]/40">{new Date(v.detected_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className={`text-xs px-2 py-1 rounded font-bold ${v.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {v.severity.toUpperCase()}
                     </span>
                     <span className="text-xs font-mono text-[#0A2647]/50 shrink-0">{Math.round(v.confidence * 100)}% conf</span>
                  </div>
                </div>
                
                {/* Expand evidence & AI debate reasoning */}
                {v.ai_decision && v.ai_decision.justification && (
                   <div className="mt-2 bg-[#F6F5F1] p-3 rounded-lg border border-[#0A2647]/5">
                      <p className="text-xs font-bold text-[#0A2647]/70 mb-1">🤖 AI Judge Ruling (Debate ID: {v.ai_decision.debate_id.substring(0,8)})</p>
                      <p className="text-xs text-[#0A2647]/70 italic">{v.ai_decision.justification}</p>
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[#0A2647]/40 text-center pt-2">
        Connected to Live FastAPI Backend via /api/v1/violations/establishment/{establishmentId}
      </p>
    </div>
  );
}
