import React, { useState } from 'react';
import { Upload, Camera, Bot, Sparkles, CheckCircle2, AlertTriangle, FileText, ChevronRight, RefreshCw } from 'lucide-react';
import { ingestFrame, fetchCopilotChecklist, fetchDebateLog } from '../api/backendApi';

export default function AdminVisionCopilotTab() {
  const [establishmentId, setEstablishmentId] = useState('REST-001');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('idle'); // idle | ingesting | debating | generating_checklist | done
  const [ingestResponse, setIngestResponse] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [loadingDebate, setLoadingDebate] = useState(false);

  const handleUploadAndRun = async () => {
    if (!file) {
      alert('Please select an image frame first');
      return;
    }

    setLoading(true);
    setStep('ingesting');
    setIngestResponse(null);
    setChecklist(null);
    setSelectedDebate(null);

    try {
      // 1. Ingest frame through YOLO vision & Compliance Debate in FastAPI
      const result = await ingestFrame(establishmentId, file);
      setIngestResponse(result);

      // Check if debate occurred in any violation
      const hasDebate = result?.violations?.some(v => v.ai_decision?.debate_id);
      if (hasDebate) {
        setStep('debating');
      }

      // 2. Automatically generate inspection checklist right after debate / ingestion
      setStep('generating_checklist');
      const copilotData = await fetchCopilotChecklist(establishmentId);
      setChecklist(copilotData);

      setStep('done');
    } catch (err) {
      console.error('Pipeline error:', err);
      alert('Error running AI pipeline. Check backend terminal.');
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDebateLog = async (debateId) => {
    if (!debateId) return;
    setLoadingDebate(true);
    const data = await fetchDebateLog(debateId);
    setSelectedDebate(data);
    setLoadingDebate(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-[#0A2647] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#FF9933]" /> Official AI Vision Ingestion Console
            </h2>
            <p className="text-xs text-[#0A2647]/60 mt-1">
              Admin Enforcement Panel: Upload CCTV frames to run YOLO Detection → Rule Engine → Multi-Agent Debate → Automated Copilot Checklist.
            </p>
          </div>
          <span className="text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg">
            Admin Authority Mode
          </span>
        </div>

        {/* Input controls */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-[#F6F5F1] p-4 rounded-xl border border-[#0A2647]/5">
          <div>
            <label className="block text-xs font-bold text-[#0A2647] mb-1">Target Establishment ID</label>
            <input
              type="text"
              value={establishmentId}
              onChange={(e) => setEstablishmentId(e.target.value)}
              placeholder="e.g. REST-001"
              className="w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF9933]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A2647] mb-1">Upload CCTV Camera Frame</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-[#0A2647]/70 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0A2647] file:text-white hover:file:bg-[#0A2647]/90"
            />
          </div>

          <div>
            <button
              onClick={handleUploadAndRun}
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0A2647] hover:bg-[#0A2647]/90 shadow-md'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing {step}...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Run Vision Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        {loading && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs flex items-center gap-2 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-ping" />
            <span>
              {step === 'ingesting' && 'Executing YOLO vision model & checking compliance rules...'}
              {step === 'debating' && 'Triggering Multi-Agent Compliance Debate between Legal & Safety Agents...'}
              {step === 'generating_checklist' && 'Generating automated post-debate Inspector Copilot Checklist...'}
            </span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {ingestResponse && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: AI Vision Detections & Debates */}
          <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-6 space-y-4">
            <h3 className="font-display font-bold text-[#0A2647] flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Detected Violations & AI Debates
            </h3>

            {ingestResponse.violations?.length === 0 ? (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                ✅ No hygiene violations detected in this frame. Compliance passed.
              </p>
            ) : (
              <div className="space-y-3">
                {ingestResponse.violations?.map((v) => (
                  <div key={v.violation_id} className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#0A2647] uppercase">
                        {v.violation_type?.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        v.severity === 'high' || v.severity === 'critical' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {v.severity}
                      </span>
                    </div>

                    <p className="text-xs text-[#0A2647]/70">
                      Category: <span className="font-semibold">{v.category}</span> | Confidence: <span className="font-mono">{Math.round(v.confidence * 100)}%</span>
                    </p>

                    {v.ai_decision?.justification && (
                      <div className="bg-white p-3 rounded-lg border border-red-100 text-xs">
                        <p className="font-bold text-[#0A2647]/80 flex items-center gap-1.5 mb-1">
                          <Bot className="w-3.5 h-3.5 text-indigo-600" /> AI Judge Ruling: {v.ai_decision.final_verdict?.toUpperCase()}
                        </p>
                        <p className="italic text-[#0A2647]/70">{v.ai_decision.justification}</p>

                        {v.ai_decision.debate_id && (
                          <button
                            onClick={() => handleViewDebateLog(v.ai_decision.debate_id)}
                            className="mt-2 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 underline"
                          >
                            <span>Read Full Multi-Agent Debate Transcript</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Copilot Inspection Checklist (Generated right after debate) */}
          <div className="bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-6 space-y-4">
            <h3 className="font-display font-bold text-[#0A2647] flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-[#FF9933]" /> AI Copilot Generated Inspection Checklist
            </h3>

            {checklist ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                  ⚡ <strong>Auto-Generated Post-Debate:</strong> Real-time customized action checklist for field inspectors sent to Admin.
                </div>

                {checklist.checklist && Array.isArray(checklist.checklist) ? (
                  <div className="divide-y divide-[#0A2647]/10">
                    {checklist.checklist.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-[#0A2647]">{item.task || item.item || item}</p>
                          {item.priority && (
                            <span className="text-[10px] font-bold text-amber-700 uppercase">
                              Priority: {item.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="bg-[#F6F5F1] p-3 rounded-lg text-xs font-mono text-[#0A2647] overflow-auto max-h-60">
                    {JSON.stringify(checklist, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#0A2647]/50 italic">
                Copilot checklist will automatically formulate as soon as vision ingestion & debate finishes.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Multi-Agent Debate Transcript Modal / Drawer */}
      {selectedDebate && (
        <div className="bg-white rounded-2xl shadow-gov-card border-2 border-indigo-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#0A2647]/10 pb-3">
            <div>
              <h3 className="font-display font-bold text-indigo-900 text-base flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" /> Multi-Agent Debate Log: {selectedDebate.id?.substring(0, 8)}
              </h3>
              <p className="text-xs text-[#0A2647]/60">
                Agreement Score: <strong>{selectedDebate.agreement_score}</strong> | Verdict: <strong>{selectedDebate.final_verdict?.toUpperCase()}</strong>
              </p>
            </div>
            <button
              onClick={() => setSelectedDebate(null)}
              className="text-xs font-bold text-[#0A2647]/50 hover:text-[#0A2647] bg-[#F6F5F1] px-2.5 py-1 rounded"
            >
              Close
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {selectedDebate.transcript && Array.isArray(selectedDebate.transcript) ? (
              selectedDebate.transcript.map((turn, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#F6F5F1] text-xs space-y-1">
                  <span className="font-bold text-indigo-800 capitalize">{turn.agent || turn.speaker || `Agent Round ${i+1}`}</span>
                  <p className="text-[#0A2647]/80">{turn.argument || turn.message || JSON.stringify(turn)}</p>
                </div>
              ))
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
