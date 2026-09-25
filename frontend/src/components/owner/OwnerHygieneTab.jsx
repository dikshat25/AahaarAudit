import React from 'react';
import { Thermometer, Sparkles, Users, Camera, TrendingUp } from 'lucide-react';

const TEMP_READINGS = [
  { unit: 'Cold Storage 1', value: '3.8°C', status: 'ok' },
  { unit: 'Cold Storage 2', value: '9.2°C', status: 'warning' },
  { unit: 'Freezer', value: '-16°C', status: 'ok' },
];

const CLEANING_RECORDS = [
  { area: 'Prep Counter A', last: '2026-09-23 07:10', by: 'Shift Staff', status: 'done' },
  { area: 'Prep Counter B', last: '2026-09-23 07:15', by: 'Shift Staff', status: 'done' },
  { area: 'Walk-in Cooler', last: '2026-09-21 19:00', by: 'Closing Staff', status: 'overdue' },
];

export default function OwnerHygieneTab() {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        {TEMP_READINGS.map((t) => (
          <div key={t.unit} className={`rounded-xl border p-4 ${t.status === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#0A2647]/10'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className={`w-4 h-4 ${t.status === 'warning' ? 'text-amber-600' : 'text-[#0A2647]/50'}`} />
              <span className="text-xs text-[#0A2647]/60">{t.unit}</span>
            </div>
            <p className={`text-xl font-display font-bold ${t.status === 'warning' ? 'text-amber-700' : 'text-[#0A2647]'}`}>{t.value}</p>
            {t.status === 'warning' && <p className="text-[11px] text-amber-700 mt-1">Above safe threshold — action recommended</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6">
        <h3 className="font-display font-bold text-[#0A2647] mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0A2647]/50" /> Cleaning Records
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#0A2647]/40 text-xs uppercase">
              <th className="pb-2">Area</th>
              <th className="pb-2">Last Cleaned</th>
              <th className="pb-2">By</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0A2647]/8">
            {CLEANING_RECORDS.map((r) => (
              <tr key={r.area}>
                <td className="py-2 font-medium text-[#0A2647]">{r.area}</td>
                <td className="py-2 text-[#0A2647]/70">{r.last}</td>
                <td className="py-2 text-[#0A2647]/70">{r.by}</td>
                <td className="py-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${r.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {r.status === 'done' ? 'Completed' : 'Overdue'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6">
          <h3 className="font-display font-bold text-[#0A2647] mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0A2647]/50" /> Staff Hygiene Alerts
          </h3>
          <p className="text-sm text-[#0A2647]/60">1 alert this week — gloves not detected on prep station 2 (2026-09-22).</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6">
          <h3 className="font-display font-bold text-[#0A2647] mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#0A2647]/50" /> CCTV Findings
          </h3>
          <p className="text-sm text-[#0A2647]/60">No open CCTV violations this week besides the glove-detection alert above.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6">
        <h3 className="font-display font-bold text-[#0A2647] mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#0A2647]/50" /> Compliance Trend
        </h3>
        <div className="flex items-end gap-2 h-24">
          {[68, 71, 74, 70, 78, 80, 82].map((v, i) => (
            <div key={i} className="flex-1 bg-[#0A2647]/10 rounded-t" style={{ height: `${v}%` }}>
              <div className="w-full bg-[#0A2647] rounded-t" style={{ height: '4px' }} />
            </div>
          ))}
        </div>
        <p className="text-xs text-[#0A2647]/40 mt-2">Last 7 inspections / audits · current score 82%</p>
      </div>
    </div>
  );
}
