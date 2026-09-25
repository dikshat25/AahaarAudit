import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, TrendingDown, Minus, AlertTriangle, Search } from 'lucide-react';
import { fetchComplaintScorecard, fetchEstablishmentScorecard } from '../../api/backendApi';

export default function ScorecardTab({ establishmentId }) {
  const [lookupId, setLookupId] = useState(establishmentId || '');
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadScorecard = async () => {
    setLoading(true);
    try {
      const data = lookupId.toUpperCase().startsWith('CMP-')
        ? await fetchComplaintScorecard(lookupId.trim())
        : await fetchEstablishmentScorecard(lookupId.trim());
      setScorecard(data);
    } catch (error) {
      setScorecard(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (lookupId) loadScorecard();
  }, []);

  const TrendIcon =
    scorecard?.trend === 'improving'
      ? TrendingUp
      : scorecard?.trend === 'declining'
      ? TrendingDown
      : Minus;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-5">
        <h3 className="text-base font-display font-bold text-[#0A2647] mb-2">Live Food Safety Scorecard</h3>
        <p className="text-xs text-[#0A2647]/60 mb-4">
          Query real-time establishment compliance rating, calculated directly from AI inspection vision logs and violation history.
        </p>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#0A2647]/40 absolute left-3 top-2.5" />
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Enter complaint ID (e.g. CMP-47147)"
              className="w-full pl-9 pr-3 py-2 border border-[#0A2647]/15 rounded-lg text-sm bg-[#F6F5F1] text-[#0A2647] focus:outline-none focus:border-[#FF9933]"
            />
          </div>
          <button
            onClick={loadScorecard}
            className="bg-[#0A2647] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0A2647]/90 transition-colors shadow-sm"
          >
            Check Scorecard
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-[#0A2647]/60">Fetching latest scorecard...</p>}

      {scorecard && (
        <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0A2647]/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-display font-bold text-[#0A2647]">
                    {Number(scorecard.overall_score || 0).toFixed(0)}%
                  </p>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                      scorecard.overall_score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : scorecard.overall_score >= 60
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {scorecard.overall_score >= 80 ? 'Grade A' : scorecard.overall_score >= 60 ? 'Grade B' : 'Critical'}
                  </span>
                </div>
                <p className="text-xs text-[#0A2647]/50 mt-0.5">Establishment ID: {scorecard.establishment_id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#F6F5F1] px-3 py-1.5 rounded-lg border border-[#0A2647]/5 text-sm text-[#0A2647]">
              <TrendIcon
                className={`w-4 h-4 ${
                  scorecard.trend === 'improving'
                    ? 'text-emerald-600'
                    : scorecard.trend === 'declining'
                    ? 'text-red-500'
                    : 'text-amber-500'
                }`}
              />
              <span className="text-xs font-semibold capitalize">Trend: {scorecard.trend || 'Stable'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F6F5F1] rounded-xl p-4 border border-[#0A2647]/5 text-center">
              <p className="text-2xl font-bold text-red-600">{scorecard.active_violations || 0}</p>
              <p className="text-xs font-medium text-[#0A2647]/60 mt-1">Active AI Violations</p>
            </div>
            <div className="bg-[#F6F5F1] rounded-xl p-4 border border-[#0A2647]/5 text-center">
              <p className="text-2xl font-bold text-amber-600">{scorecard.recent_violations || 0}</p>
              <p className="text-xs font-medium text-[#0A2647]/60 mt-1">Violations (Last 30 Days)</p>
            </div>
            <div className="bg-[#F6F5F1] rounded-xl p-4 border border-[#0A2647]/5 text-center">
              <p className="text-2xl font-bold text-orange-600">{scorecard.recurring_violations || 0}</p>
              <p className="text-xs font-medium text-[#0A2647]/60 mt-1">Recurring Incidents</p>
            </div>
          </div>

          {scorecard.categories && Object.keys(scorecard.categories).length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-[#0A2647] mb-3">Hygiene Breakdown by Category</h4>
              <div className="space-y-3">
                {Object.entries(scorecard.categories).map(([cat, score]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#0A2647] capitalize">{cat.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-[#0A2647]/70">{Number(score).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-[#F6F5F1] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!scorecard && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            No stored scorecard found for <strong>{lookupId}</strong>. Use the CMP number from the complaint record.
          </p>
        </div>
      )}
    </div>
  );
}
