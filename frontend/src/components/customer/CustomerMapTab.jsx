import React from 'react';
import GoogleMapComponent from '../shared/GoogleMapComponent';

export default function CustomerMapTab() {
  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="bg-white p-5 rounded-2xl border border-[#0A2647]/10 shadow-gov-card">
        <h3 className="text-base font-display font-bold text-[#0A2647]">
          Verified Hygiene Map & Nearby Outlets
        </h3>
        <p className="text-xs text-[#0A2647]/60 mt-1">
          Explore restaurants, cloud kitchens, and food stores audited by Aahaar-Audit AI. Green pins indicate Grade-A compliance.
        </p>
      </div>

      <GoogleMapComponent />
    </div>
  );
}
