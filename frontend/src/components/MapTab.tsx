import React from 'react';
import GoogleMapComponent from './shared/GoogleMapComponent';
import { Shield, Building, AlertCircle } from 'lucide-react';

export default function MapTab() {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-[#0A2647]/10 shadow-gov-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-[#0A2647] flex items-center gap-2">
            <Building className="w-5 h-5 text-[#FF9933]" /> Regional Enforcement & Surveillance Map
          </h2>
          <p className="text-xs text-[#0A2647]/60 mt-1">
            Official FSSAI & Municipal Zone Geographic Information System (GIS) powered by Google Maps.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Satellite & Vector View
        </div>
      </div>

      <GoogleMapComponent showAdminDetails={true} />
    </div>
  );
}