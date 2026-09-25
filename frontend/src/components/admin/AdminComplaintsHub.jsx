import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareWarning, Camera, Video, Loader2, CheckCircle2, Circle,
  ShieldAlert, AlertTriangle, Gavel, Sparkles, Scale, ChevronRight,
  RefreshCw, Send, HelpCircle, ArrowLeft, Upload, Eye
} from 'lucide-react';
import { fetchComplaints, streamInspection, updateComplaint } from '../../api/backendApi';
import { PriorityBadge, StatusBadge } from '../complaintBadges';

// ─── AGENT COLORS ────────────────────────────────────────────────────────────
const AGENT_STYLES = {
  Prosecution: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-600',
    text: 'text-red-950',
    label: 'Food Security Legal Agent',
  },
  Defense: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-500',
    text: 'text-amber-950',
    label: 'Risk Mitigation Agent',
  },
  Judge: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    badge: 'bg-indigo-900',
    text: 'text-indigo-950',
    label: 'Chief Regulatory Judge',
    isJudge: true,
  },
};

// Map raw role strings from backend to AGENT_STYLES keys
function resolveAgentKey(role) {
  const r = (role || '').toLowerCase();
  if (r === 'judge') return 'Judge';
  // Risk / defense roles
  if (r.includes('risk') || r.includes('defense') || r === 'groq_risk' || r === 'risk_review') return 'Defense';
  // Legal / prosecution roles (gemini_legal, legal_review, gemini, prosecution)
  return 'Prosecution';
}

const STANDARD_CHECKLIST = [
  { task: 'Verify gloves, hairnets, and aprons in active zones', priority: 'Critical', done: false },
  { task: 'Inspect sanitization logs for the last 48 hours', priority: 'High', done: false },
  { task: 'Check raw and ready-to-eat food separation', priority: 'High', done: false },
  { task: 'Check cold storage temperature is below 4 C', priority: 'Medium', done: false },
  { task: 'Document visual evidence and corrective action', priority: 'High', done: false },
  { task: 'Schedule follow-up inspection', priority: 'Medium', done: false },
];

// ─── CHECKLIST ITEMS ─────────────────────────────────────────────────────────

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdminComplaintsHub({ forceVision = false, readOnly = false }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inspection flow state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'inspection'

  // Vision state
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [detections, setDetections] = useState([]);
  const [ruleEvaluation, setRuleEvaluation] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  // Debate state
  const [debateMessages, setDebateMessages] = useState([]);
  const [debateRunning, setDebateRunning] = useState(false);
  const [debateComplete, setDebateComplete] = useState(false);
  const debateRef = useRef(null);

  // Checklist & scorecard state
  const [checklist, setChecklist] = useState([]);
  const [violations, setViolations] = useState([]);
  const [scorecard, setScorecard] = useState(null);
  const [inspectionReport, setInspectionReport] = useState('');
  const [reportId, setReportId] = useState('');
  const [scorecardId, setScorecardId] = useState('');

  // ── Load complaints ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchComplaints();
        setComplaints(Array.isArray(data) ? data : []);
      } catch (e) {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  // ── Handle entering inspection view ──
  const openInspection = (complaint) => {
    setSelectedComplaint(complaint);
    setPreviewUrl(null);
    setFile(null);
    setDebateMessages([]);
    setDebateRunning(false);
    setDebateComplete(false);
    setChecklist(STANDARD_CHECKLIST.map((item) => ({ ...item })));
    setViolations([]);
    setScorecard(null);
    setInspectionReport('');
    setReportId('');
    setScorecardId('');
    setDetections([]);
    setRuleEvaluation(null);
    setAnalysisError('');
    setView('inspection');
  };

  // ── Run debate ──
  const runDebate = async () => {
    if (debateRunning || debateComplete || !selectedComplaint || !file) {
      if (!file) setAnalysisError('Upload a real inspection frame before starting backend analysis.');
      return;
    }
    setDebateRunning(true);
    setDebateMessages([]);
    setAnalysisError('');
    try {
      await streamInspection(selectedComplaint.establishmentId, file, selectedComplaint.id, (event) => {
        if (event.type === 'yolo') {
          setDetections(Array.isArray(event.detections) ? event.detections : []);
          setRuleEvaluation(event.rule_evaluation || null);
        }
        if (event.type === 'agent') {
          const agentKey = resolveAgentKey(event.message?.role);
          setDebateMessages((current) => [
            ...current,
            {
              id: `${Date.now()}-${current.length}`,
              agent: agentKey,
              rawRole: event.message?.role,
              text: event.message?.content || event.message?.argument || event.message?.message || ''
            }
          ]);
        }
        if (event.type === 'debate_error') setAnalysisError(`YOLO completed, but debate providers failed: ${event.error}`);
        if (event.type === 'complete') {
          setViolations(event.violations || []);
          setScorecard(event.scorecard || null);
          setInspectionReport(event.report || '');
          setReportId(event.report_id || '');
          setScorecardId(event.scorecard_id || '');
          setDebateComplete(true);
        }
      });
      setDebateComplete(true);
    } catch (error) {
      setAnalysisError(error.message || 'Backend inspection failed.');
    } finally {
      setDebateRunning(false);
    }
  };

  const dismissComplaint = async () => {
    if (!selectedComplaint) return;
    await updateComplaint(selectedComplaint.id, { status: 'Dismissed' });
    setComplaints((current) => current.filter((item) => item.id !== selectedComplaint.id));
    setSelectedComplaint(null);
    setView('list');
  };

  const downloadReportJson = () => {
    const payload = { complaint_id: selectedComplaint?.id, report: inspectionReport, scorecard, violations };
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    link.download = `inspection-${selectedComplaint?.id || 'report'}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ── Upload handler ──
  const handleFileUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setDebateMessages([]);
    setDebateComplete(false);
    setAnalysisError('');
  };

  const renderComplaint = (c) => (
    <button
      key={c.id}
      onClick={() => openInspection(c)}
      className="w-full text-left bg-white rounded-xl border border-[#0A2647]/10 p-4 shadow-gov-card hover:border-[#0A2647]/30 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-xs text-[#0A2647]/50">{c.id}</span>
        <PriorityBadge priority={c.priority} />
        <StatusBadge status={c.status} />
      </div>
      <p className="font-semibold text-[#0A2647] truncate">{c.title}</p>
      <p className="text-xs text-[#0A2647]/50 mt-0.5">{c.establishment || c.establishmentId} · {c.location || 'Location not recorded'} · {c.category}</p>
      {c.ownerEmail && <p className="text-xs text-emerald-700 mt-1">{c.ownerEmail}</p>}
      <span className="mt-3 inline-flex text-xs font-semibold text-[#0A2647] bg-[#0A2647]/5 border border-[#0A2647]/10 px-3 py-1.5 rounded-lg items-center gap-1.5">
        <Camera className="w-3.5 h-3.5 text-red-600" /> Open Complaint
      </span>
    </button>
  );

  // ── RENDER: Read-Only (Customer) View ──
  if (readOnly) {
    return (
      <div className="space-y-4 max-w-4xl">
        {loading ? (
          <div className="text-center py-8 text-xs text-[#0A2647]/50">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-8 text-center shadow-gov-card">
            <p className="text-sm text-[#0A2647]/50">No regulatory complaints on record.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-amber-900">Pending Inspections ({complaints.filter((c) => c.status !== 'Inspection Completed').length})</h4>
              {complaints.filter((c) => c.status !== 'Inspection Completed').map((c) => (
                <div key={c.id} className="w-full text-left bg-white rounded-xl border border-[#0A2647]/10 p-4 shadow-gov-card">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#0A2647]/50">{c.id}</span>
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="font-semibold text-[#0A2647] truncate">{c.title}</p>
                  <p className="text-xs text-[#0A2647]/50 mt-0.5">{c.establishment || c.establishmentId} · {c.location || 'Location not recorded'} · {c.category}</p>
                  <p className="text-xs text-[#0A2647]/60 mt-2 leading-relaxed line-clamp-2">{c.description}</p>
                </div>
              ))}
            </section>
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-emerald-900">Completed Inspections ({complaints.filter((c) => c.status === 'Inspection Completed').length})</h4>
              {complaints.filter((c) => c.status === 'Inspection Completed').map((c) => (
                <div key={c.id} className="w-full text-left bg-white rounded-xl border border-emerald-200 p-4 shadow-gov-card">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#0A2647]/50">{c.id}</span>
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="font-semibold text-[#0A2647] truncate">{c.title}</p>
                  <p className="text-xs text-[#0A2647]/50 mt-0.5">{c.establishment || c.establishmentId} · {c.category}</p>
                  {c.report && (
                    <p className="text-xs text-emerald-700 mt-2 font-semibold">✓ Inspection report generated</p>
                  )}
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    );
  }

  // ── RENDER: List View ──
  if (view === 'list' && !forceVision) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-bold text-base text-[#0A2647] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" /> All Regulatory Complaints
            </h3>
            <p className="text-xs text-[#0A2647]/60 mt-1">Click a complaint to start the AI Vision Inspection & Debate flow.</p>
          </div>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#0A2647]/40" />
          ) : (
            <span className="text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg">
              {complaints.length} Complaints
            </span>
          )}
        </div>

        {!loading && complaints.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-8 text-center shadow-gov-card">
            <p className="text-sm font-semibold text-[#0A2647]">No complaints found in Firestore</p>
            <p className="text-xs text-[#0A2647]/60 mt-2">Create a complaint from the admin portal or sync the backend with the Firebase project.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-amber-900">Pending Inspections ({complaints.filter((c) => c.status !== 'Inspection Completed').length})</h4>
            {complaints.filter((c) => c.status !== 'Inspection Completed').map(renderComplaint)}
          </section>
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-emerald-900">Completed Inspections ({complaints.filter((c) => c.status === 'Inspection Completed').length})</h4>
            {complaints.filter((c) => c.status === 'Inspection Completed').map(renderComplaint)}
          </section>
        </div>
      </div>
    );
  }


  // ── RENDER: Inspection View (or forced vision) ──
  return (
    <div className="space-y-5 max-w-7xl">
      {/* Back button */}
      {!forceVision && (
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-1.5 text-sm text-[#0A2647]/60 hover:text-[#0A2647] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Complaints
        </button>
      )}
      {selectedComplaint && <div className="flex justify-end gap-2">
        <button onClick={downloadReportJson} disabled={!inspectionReport} className="rounded-lg border border-[#0A2647]/20 px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Download JSON Report</button>
        <button onClick={dismissComplaint} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white">Dismiss Complaint</button>
      </div>}

      {/* Context Banner */}
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded uppercase tracking-wider">
                Live Regulatory Inspection Mode
              </span>
              {selectedComplaint && (
                <span className="text-[11px] font-mono bg-[#0A2647] text-white px-2 py-0.5 rounded">
                  {selectedComplaint.id}
                </span>
              )}
            </div>
            <h2 className="text-lg font-display font-bold text-[#0A2647] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#FF9933]" />
              {selectedComplaint ? selectedComplaint.title : 'AI Camera Inspection & Multi-Agent Debate'}
            </h2>
            {selectedComplaint && (
              <p className="text-xs text-[#0A2647]/60 mt-0.5">
                {selectedComplaint.establishment || selectedComplaint.establishmentId} ·
                <span className="text-emerald-700 font-semibold ml-1">{selectedComplaint.ownerEmail || 'Owner not linked'}</span>
              </p>
            )}
          </div>

          {selectedComplaint && (
            <div className="text-xs bg-[#F6F5F1] p-3 rounded-xl border border-[#0A2647]/5 max-w-sm">
              <p className="font-bold text-[#0A2647] mb-0.5">Complaint Statement:</p>
              <p className="text-[#0A2647]/70 italic">"{selectedComplaint.description}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-column grid: Left = Vision + Debate | Right = Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left Col (2/3): Video + Debate ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* CCTV / Frame Viewer */}
          <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0A2647] flex items-center gap-2">
                <Video className="w-4 h-4 text-red-600 animate-pulse" /> CCTV & Frame Analysis
              </h3>
              <label className="cursor-pointer text-xs font-semibold text-[#0A2647] border border-[#0A2647]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#0A2647]/5">
                <Upload className="w-3.5 h-3.5" /> Upload Frame
                <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Frame with YOLO overlay */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-[#0A2647]/20">
              {previewUrl ? (
                <img src={previewUrl} alt="Inspection Frame" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
                  <Camera className="w-10 h-10" />
                  <p className="mt-2">Upload a real frame for backend YOLO analysis.</p>
                </div>
              )}

              {/* Live badge */}
              <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> BACKEND FRAME
              </div>
              <div className="absolute top-2.5 right-2.5 bg-black/70 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded">
                {new Date().toLocaleTimeString()}
              </div>

              {detections.map((detection, index) => {
                const [x, y, width, height] = detection.bbox || [0.5, 0.5, 0.2, 0.2];
                return <div key={`${detection.class}-${index}`} className="absolute border-2 border-red-500 bg-red-500/10" style={{ left: `${(x - width / 2) * 100}%`, top: `${(y - height / 2) * 100}%`, width: `${width * 100}%`, height: `${height * 100}%` }}>
                  <span className="absolute -top-5 left-0 whitespace-nowrap bg-red-600 text-[9px] font-mono font-bold text-white px-1 py-0.5 rounded">{detection.class} [{(Number(detection.confidence || 0) * 100).toFixed(1)}%]</span>
                </div>;
              })}
            </div>
            {ruleEvaluation && <p className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">YOLO detections: {detections.length} · Rule status: {ruleEvaluation.status} · Rules: {ruleEvaluation.matched_rules?.join('; ') || 'none'}</p>}
            {analysisError && <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-900">{analysisError}</p>}

            {/* Analyse button */}
            <div className="flex justify-end">
              <button
                onClick={runDebate}
                disabled={debateRunning || debateComplete}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow transition-all"
              >
                {debateRunning ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Agents Deliberating...</>
                ) : debateComplete ? (
                  <><CheckCircle2 className="w-4 h-4" /> Debate Complete — Verdict Delivered</>
                ) : (
                  <><Scale className="w-4 h-4" /> Run AI Analysis &amp; Multi-Agent Debate</>
                )}
              </button>
            </div>
          </div>

          {/* ── Debate Wall ── */}
          <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#0A2647]/10 pb-3">
              <h3 className="font-display font-bold text-base text-[#0A2647] flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-700" /> Tri-Agent Adversarial Courtroom
              </h3>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-full font-bold ${
                debateComplete ? 'bg-red-100 text-red-800' :
                debateRunning ? 'bg-amber-100 text-amber-800 animate-pulse' :
                'bg-[#F6F5F1] text-[#0A2647]/50'
              }`}>
                {debateComplete ? 'VERDICT DELIVERED' : debateRunning ? 'DEBATE IN PROGRESS...' : 'AWAITING INITIATION'}
              </span>
            </div>

            {/* Conversation thread */}
            <div
              ref={debateRef}
              className="space-y-3 min-h-[160px] max-h-72 overflow-y-auto pr-1 scroll-smooth"
            >
              {debateMessages.length === 0 && !debateRunning && (
                <div className="text-center text-xs text-[#0A2647]/40 py-10 bg-[#F6F5F1] rounded-xl border border-dashed border-[#0A2647]/15">
                  <Scale className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Click "Run AI Analysis & Multi-Agent Debate" to start the courtroom session.
                </div>
              )}

              {debateRunning && debateMessages.length === 0 && (
                <div className="text-center text-xs text-[#0A2647]/50 py-8 animate-pulse">
                  Agents are reviewing YOLO evidence and complaint data...
                </div>
              )}

              {debateMessages.map((msg) => {
                const style = AGENT_STYLES[msg.agent] || AGENT_STYLES.Prosecution;
                return (
                  <div
                    key={msg.id}
                    className={`rounded-xl border p-4 ${style.bg} ${style.border} transition-all`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full ${style.badge} text-white flex items-center justify-center text-[9px] font-bold`}>
                        {msg.agent === 'Judge' ? '⚖' : msg.agent === 'Prosecution' ? 'P' : 'D'}
                      </div>
                      <span className={`text-xs font-bold ${style.text}`}>{style.label}</span>
                      {msg.agent === 'Judge' && (
                        <span className="ml-auto text-[9px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">
                          FINAL RULING
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${style.text}`}>{msg.text}</p>
                  </div>
                );
              })}

              {debateComplete && violations.length > 0 && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-indigo-900" />
                    <p className="text-xs font-bold text-indigo-950">
                      Ruling: {scorecard?.overall_score >= 80 ? 'Clear' : 'Violation'} · Grade {scorecard?.grade || 'pending'} · {selectedComplaint?.ownerEmail || 'Owner not linked'}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* ── Explainability ── */}
          {debateComplete && (
            <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card space-y-3">
              <h3 className="font-display font-bold text-sm text-[#0A2647] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" /> Why This Conclusion? (Explainability)
              </h3>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#F6F5F1] p-3 rounded-xl border border-[#0A2647]/5">
                  <p className="font-bold text-[#0A2647] mb-1">1. YOLO Visual Evidence</p>
                  <p className="text-[#0A2647]/70">YOLO returned {detections.length} detections. Rule status: {ruleEvaluation?.status || 'not evaluated'}.</p>
                </div>
                <div className="bg-[#F6F5F1] p-3 rounded-xl border border-[#0A2647]/5">
                  <p className="font-bold text-[#0A2647] mb-1">2. Statutory Basis</p>
                  <p className="text-[#0A2647]/70">Matched backend rules: {ruleEvaluation?.matched_rules?.join('; ') || 'none'}.</p>
                </div>
                <div className="bg-[#F6F5F1] p-3 rounded-xl border border-[#0A2647]/5">
                  <p className="font-bold text-[#0A2647] mb-1">3. Scorecard Impact</p>
                  <p className="text-[#0A2647]/70">Backend score: {scorecard?.overall_score ?? 'pending'}% · Grade {scorecard?.grade || 'pending'} · Active violations: {scorecard?.active_violations ?? 'pending'}.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Violations stored ── */}
          {violations.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card space-y-3">
              <h3 className="font-display font-bold text-sm text-[#0A2647] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Violation Stored in Regulatory Database
              </h3>
              {violations.map((v) => (
                <div key={v.violation_id} className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-red-900">{v.violation_id}</span>
                    <span className="bg-red-200 text-red-900 px-2 py-0.5 rounded font-bold uppercase">{v.severity}</span>
                  </div>
                  <p className="text-red-950"><strong>Type:</strong> {v.violation_type}</p>
                  <p className="text-red-800 italic">{v.ai_decision?.justification}</p>
                  <p className="text-red-700 font-mono text-[10px]">Logged at: {new Date(v.detected_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Updated Scorecard ── */}
          {scorecard && (
            <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card space-y-4">
              <h3 className="font-display font-bold text-sm text-[#0A2647] flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-700" /> Updated Compliance Scorecard
              </h3>
              <p className="text-[10px] font-mono text-[#0A2647]/50">Scorecard ID: {scorecardId || 'persisting'} · Report ID: {reportId || 'persisting'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Overall Score', value: `${scorecard.overall_score}%`, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
                  { label: 'Active Violations', value: scorecard.active_violations, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
                  { label: 'Recent Violations', value: scorecard.recent_violations, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
                  { label: 'Grade', value: scorecard.grade, color: 'text-indigo-900', bg: 'bg-indigo-50 border-indigo-200' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                    <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-[#0A2647]/60 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#0A2647]/60 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <strong>Trend:</strong> {scorecard.trend || 'stable'}. Owner linked: <strong className="text-emerald-800">{selectedComplaint?.ownerEmail || 'Owner not linked'}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* ── Right Col (1/3): Side-view Checklist ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card sticky top-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#0A2647]/10 pb-3">
              <h3 className="font-display font-bold text-sm text-[#0A2647] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF9933]" /> Inspector Copilot Checklist
              </h3>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                LIVE
              </span>
            </div>

            {checklist.length === 0 ? (
              <p className="text-xs text-center text-[#0A2647]/40 py-8 bg-[#F6F5F1] rounded-xl border border-dashed border-[#0A2647]/15">
                Open a complaint and run the inspection to generate the checklist.
              </p>
            ) : (
              <div className="space-y-2">
                {checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      item.done
                        ? 'bg-emerald-50 border-emerald-200'
                        : item.priority === 'Critical'
                        ? 'bg-red-50/70 border-red-200'
                        : 'bg-[#F6F5F1] border-[#0A2647]/10'
                    }`}
                    onClick={() => {
                      const updated = [...checklist];
                      updated[idx].done = !updated[idx].done;
                      setChecklist(updated);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#0A2647]/20 mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className={`font-medium leading-snug ${item.done ? 'line-through text-emerald-700' : ''}`}>
                          {item.task}
                        </p>
                        {item.priority && (
                          <span className={`inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            item.priority === 'Critical' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'
                          }`}>
                            {item.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Complaint details card */}
            {selectedComplaint && (
              <div className="border-t border-[#0A2647]/10 pt-4 space-y-2 text-xs">
                <p className="font-bold text-[#0A2647]">Inspection Context</p>
                <div className="bg-[#F6F5F1] p-2.5 rounded-lg space-y-1">
                  <div className="flex justify-between"><span className="text-[#0A2647]/60">Complaint ID</span><span className="font-mono font-bold">{selectedComplaint.id}</span></div>
                  <div className="flex justify-between"><span className="text-[#0A2647]/60">Establishment</span><span className="font-semibold truncate ml-2">{selectedComplaint.establishment || selectedComplaint.establishmentId}</span></div>
                  <div className="flex justify-between"><span className="text-[#0A2647]/60">Owner Email</span><span className="font-mono text-emerald-800 text-[10px]">{selectedComplaint.ownerEmail || 'Owner not linked'}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
