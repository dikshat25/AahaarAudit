import React, { useMemo, useState } from 'react';
import { Search, MapPin, ShieldCheck } from 'lucide-react';
import { KITCHENS } from '../../mockData/kitchens';

const TYPE_FILTERS = ['All', 'Restaurant Kitchen', 'Cloud Kitchen', 'Dark Store', 'Supermarket Prep'];

// Customer-safe view of compliance: a coarse public rating only.
// Internal risk scores and inspection notes are never surfaced here.
function publicRating(complianceScore) {
  if (complianceScore >= 85) return { label: 'Good Hygiene Record', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (complianceScore >= 65) return { label: 'Satisfactory', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { label: 'Needs Improvement', color: 'text-red-600 bg-red-50 border-red-200' };
}

export default function FindEstablishmentsTab({ onCreateComplaint }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const results = useMemo(() => {
    return KITCHENS.filter((k) => {
      const matchesQuery = (k.name + ' ' + k.location).toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === 'All' || k.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [query, typeFilter]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A2647]/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by hotel, restaurant or cloud kitchen name, or locality..."
            className="w-full pl-10 pr-3 py-2.5 border border-[#0A2647]/15 rounded-lg bg-[#F6F5F1] text-sm text-[#0A2647] placeholder-[#0A2647]/40 focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                typeFilter === t
                  ? 'bg-[#0A2647] text-white border-[#0A2647]'
                  : 'bg-white text-[#0A2647]/60 border-[#0A2647]/15 hover:text-[#0A2647]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {results.map((k) => {
          const rating = publicRating(k.compliance);
          return (
            <div key={k.id} className="bg-white rounded-xl border border-[#0A2647]/10 p-5 shadow-gov-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-display font-bold text-[#0A2647]">{k.name}</h4>
                  <p className="text-xs text-[#0A2647]/50 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {k.location} · {k.type}
                  </p>
                </div>
                <span className={`shrink-0 text-[11px] font-bold px-2 py-1 rounded-full border ${rating.color}`}>
                  {rating.label}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#0A2647]/50 mt-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Last inspected {k.lastInspection}
              </div>
              <button
                onClick={() => onCreateComplaint(k)}
                className="mt-4 w-full text-sm font-semibold text-[#0A2647] border border-[#0A2647]/20 rounded-lg py-2 hover:bg-[#0A2647]/5 transition-colors"
              >
                Report an Issue Here
              </button>
            </div>
          );
        })}
        {results.length === 0 && (
          <p className="text-sm text-[#0A2647]/50 col-span-full text-center py-10">No establishments match your search.</p>
        )}
      </div>
    </div>
  );
}
