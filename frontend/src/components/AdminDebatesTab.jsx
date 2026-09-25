import React, { useState, useEffect } from 'react';
import { Gavel, Search, Bot, ChevronRight, AlertCircle } from 'lucide-react';
import { fetchComplaintViolations, fetchEstablishmentViolations, fetchDebateLog } from '../api/backendApi';

export default function AdminDebatesTab() {
  const [lookupId, setLookupId] = useState('');
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [loadingDebate, setLoadingDebate] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = lookupId.toUpperCase().startsWith('CMP-')
        ? await fetchComplaintViolations(lookupId.trim())
        : await fetchEstablishmentViolations(lookupId.trim());
      setViolations(Array.isArray(data) ? [...data].reverse() : []);
    } catch {
      setViolations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const viewDebate = async (debateId) => {
    if (!debateId) return;
    setLoadingDebate(true);
    const log = await fetchDebateLog(debateId);
    setSelectedDebate(log);
    setLoadingDebate(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-5">
        <h3 className="font-display font-bold text-[#0A2647] text-base mb-1">
          Violations & Multi-Agent Debate Retrieval
        </h3>
        <p className="text-xs text-[#0A2647]/60 mb-4">
          Query any establishment to inspect full legal-risk agent debate transcripts and final rulings.
        </p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Complaint ID (e.g. CMP-47147)"
            className="px-3 py-2 border border-[#0A2647]/15 rounded-lg text-sm bg-[#F6F5F1] w-64 focus:outline-none focus:border-[#FF9933]"
          />
          <button
            onClick={loadData}
            className="bg-[#0A2647] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0A2647]/90"
          >
            Fetch Records
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-[#0A2647]/50">Loading violations...</p>}

      {!loading && violations.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
          No violations recorded for {lookupId || 'this complaint'}.
        </div>
      )}

      <div className="space-y-3">
        {violations.map((v) => (
          <div key={v.violation_id} className="bg-white rounded-xl border border-[#0A2647]/10 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#0A2647] uppercase">{v.violation_type?.replace(/_/g, ' ')}</p>
                <p className="text-xs text-[#0A2647]/40">
                  {new Date(v.detected_at).toLocaleString()} | ID: {v.violation_id}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                  v.severity === 'high' || v.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {v.severity}
                </span>
                <span className="text-xs font-mono text-[#0A2647]/50">{Math.round(v.confidence * 100)}% conf</span>
              </div>
            </div>

            {v.ai_decision?.justification && (
              <div className="bg-[#F6F5F1] p-3 rounded-lg border border-[#0A2647]/5 text-xs">
                <p className="font-bold text-[#0A2647]/80 flex items-center gap-1.5 mb-1">
                  <Bot className="w-3.5 h-3.5 text-indigo-600" /> AI Ruling Verdict: {v.ai_decision.final_verdict?.toUpperCase()}
                </p>
                <p className="italic text-[#0A2647]/70">{v.ai_decision.justification}</p>

                {v.ai_decision.debate_id && (
                  <button
                    onClick={() => viewDebate(v.ai_decision.debate_id)}
                    className="mt-2 text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 underline"
                  >
                    <span>Inspect Full Multi-Agent Transcript ({v.ai_decision.debate_id.substring(0, 8)})</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedDebate && (
        <div className="bg-white rounded-2xl shadow-gov-card border-2 border-indigo-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#0A2647]/10 pb-3">
            <div>
              <h3 className="font-display font-bold text-indigo-900 text-base">
                Multi-Agent Debate Transcript: {selectedDebate.id}
              </h3>
              <p className="text-xs text-[#0A2647]/60">
                Agreement Score: <strong>{selectedDebate.agreement_score}</strong> | Final Verdict: <strong>{selectedDebate.final_verdict?.toUpperCase()}</strong>
              </p>
            </div>
            <button
              onClick={() => setSelectedDebate(null)}
              className="text-xs font-bold text-[#0A2647]/50 hover:text-[#0A2647] bg-[#F6F5F1] px-2.5 py-1 rounded"
            >
              Close Transcript
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {selectedDebate.transcript && Array.isArray(selectedDebate.transcript) ? (
              selectedDebate.transcript.map((turn, i) => {
                const roleLower = (turn.role || turn.agent || turn.speaker || '').toLowerCase();
                const roleMap = {
                  gemini_legal: 'Food Security Legal Agent',
                  groq_risk: 'Food Risk Agent',
                  legal_review: 'Legal Compliance Agent',
                  risk_review: 'Operational Risk Agent',
                  gemini_critique: 'Legal Compliance Agent',
                  groq_critique: 'Operational Risk Agent',
                  judge: 'Chief Regulatory Magistrate'
                };
                const displayAgent = roleMap[roleLower] || turn.agent || turn.speaker || `Round ${i+1}`;
                return (
                  <div key={i} className="p-3 rounded-lg bg-[#F6F5F1] text-xs space-y-1">
                    <span className="font-bold text-indigo-800">{displayAgent}</span>
                    <p className="text-[#0A2647]/80">{turn.content || turn.argument || turn.message || JSON.stringify(turn)}</p>
                  </div>
                );
              })
            ) : (
              <pre className="bg-[#F6F5F1] p-3 rounded text-xs font-mono whitespace-pre-wrap">
                {typeof selectedDebate.transcript === 'string'
                  ? selectedDebate.transcript
                  : JSON.stringify(selectedDebate, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
