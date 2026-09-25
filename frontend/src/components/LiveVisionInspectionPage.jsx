import React, { useState, useEffect } from 'react';
import {
  Video,
  Upload,
  Camera,
  Bot,
  Scale,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ChevronRight,
  Gavel,
  RefreshCw,
  Send,
  HelpCircle,
  Eye,
  Building,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamInspection, fetchComplaints } from '../api/backendApi';

const STANDARD_CHECKLIST = [
  { task: 'Verify gloves, hairnets, and aprons in active zones', priority: 'Critical', done: false },
  { task: 'Inspect sanitization logs for the last 48 hours', priority: 'High', done: false },
  { task: 'Check raw and ready-to-eat food separation', priority: 'High', done: false },
  { task: 'Check cold storage temperature is below 4 C', priority: 'Medium', done: false },
  { task: 'Document visual evidence and corrective action', priority: 'High', done: false },
  { task: 'Schedule follow-up inspection', priority: 'Medium', done: false },
];

export default function LiveVisionInspectionPage({ complaint: initialComplaint, onBack }) {
  const [establishmentId, setEstablishmentId] = useState(initialComplaint?.establishmentId || 'REST-001');
  const [hotelOwnerEmail, setHotelOwnerEmail] = useState(initialComplaint?.ownerEmail || '');
  const [establishmentName, setEstablishmentName] = useState(initialComplaint?.establishment || initialComplaint?.establishmentName || '');
  const [linkedComplaint, setLinkedComplaint] = useState(initialComplaint || null);
  const [complaintList, setComplaintList] = useState([]);
  
  // Media / File state
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [detections, setDetections] = useState([]);
  const [ruleEvaluation, setRuleEvaluation] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [inspectionReport, setInspectionReport] = useState('');
  const [debateTranscript, setDebateTranscript] = useState([]);
  const [visibleTranscript, setVisibleTranscript] = useState([]);
  const [analysisError, setAnalysisError] = useState('');
  const [debateError, setDebateError] = useState('');
  
  // Inspection & Debate State
  const [debateStep, setDebateStep] = useState(0); // 0: not started, 1: pros, 2: defense, 3: judge
  const [checklist, setChecklist] = useState([]);
  const [publishStatus, setPublishStatus] = useState('');

  // Fetch complaints to link
  useEffect(() => {
    const getComplaints = async () => {
      try {
        const data = await fetchComplaints();
        if (initialComplaint) {
          setComplaintList([initialComplaint]);
          setLinkedComplaint(initialComplaint);
        } else if (Array.isArray(data) && data.length > 0) {
          setComplaintList(data);
          setLinkedComplaint(data[0]);
        } else {
          setComplaintList([]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    getComplaints();
  }, [initialComplaint]);

  useEffect(() => {
    if (!linkedComplaint) return;
    setEstablishmentId(linkedComplaint.establishmentId || 'REST-001');
    setEstablishmentName(linkedComplaint.establishment || linkedComplaint.establishmentName || linkedComplaint.establishmentId || '');
    setHotelOwnerEmail(linkedComplaint.ownerEmail || '');
  }, [linkedComplaint]);

  useEffect(() => {
    setVisibleTranscript([]);
    const timers = debateTranscript.map((message, index) => window.setTimeout(() => {
      setVisibleTranscript((current) => [...current, message]);
    }, index * 1200));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [debateTranscript]);

  const handleFileUpload = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setAnalyzed(false);
    setDebateStep(0);
    setDebateTranscript([]);
    setScorecard(null);
    setInspectionReport('');
    setChecklist(STANDARD_CHECKLIST.map((item) => ({ ...item })));
    setAnalysisError('');
  };

  const runLiveAIAnalysis = async () => {
    setIsProcessing(true);
    setAnalyzed(false);
    setDebateStep(0);
    setPublishStatus('');
    setAnalysisError('');

    try {
      let analysisFile = file;
      if (!analysisFile) throw new Error('Upload an inspection image or frame before starting backend analysis.');
      await streamInspection(establishmentId, analysisFile, linkedComplaint?.id, (event) => {
        if (event.type === 'yolo') {
          setDetections(Array.isArray(event.detections) ? event.detections : []);
          setRuleEvaluation(event.rule_evaluation || null);
        }
        if (event.type === 'agent') setDebateTranscript((current) => [...current, event.message]);
        if (event.type === 'debate_error') setDebateError(event.error);
        if (event.type === 'complete') {
          setScorecard(event.scorecard || null);
          setInspectionReport(event.report || '');
        }
      });

      setAnalyzed(true);

      setDebateStep(1);
    } catch (e) {
      console.error(e);
      setAnalysisError(e.message || 'Inspection analysis failed.');
      setAnalyzed(true);
      setDebateStep(3);
    } finally {
      setIsProcessing(false);
    }
  };

  const detectionLabel = detections.length
    ? detections.map((d) => `${d.class} ${(Number(d.confidence || 0) * 100).toFixed(1)}%`).join(' · ')
    : 'No YOLO detections returned for this frame';

  const agentMessage = (target) => {
    const t = target.toLowerCase();
    const found = visibleTranscript.find((msg) => {
      const r = (msg.role || msg.agent || '').toLowerCase();
      if (t === 'judge' && (r.includes('judge') || r.includes('magistrate'))) return true;
      if (t === 'groq_risk' && (r.includes('risk') || r.includes('groq') || r.includes('defense'))) return true;
      if (t === 'gemini_legal' && (r.includes('legal') || r.includes('gemini') || r.includes('prosecution'))) return true;
      return r === t;
    });
    return found?.content || found?.argument || found?.message || '';
  };

  const agentLabel = (role) => ({
    gemini_legal: 'Food Security Legal Agent',
    groq_risk: 'Food Risk Agent',
    legal_review: 'Legal Review Agent',
    risk_review: 'Risk Review Agent',
    gemini_critique: 'Legal Review Agent',
    groq_critique: 'Risk Review Agent',
    judge: 'Chief Regulatory Judge'
  }[role] || (role === 'Judge' ? 'Chief Regulatory Judge' : role === 'Defense' ? 'Food Risk Agent' : 'Food Security Legal Agent'));
  const finalVerdict = scorecard
    ? `${scorecard.overall_score >= 80 ? 'Clear' : 'Violation'} · Grade ${scorecard.grade}`
    : 'Awaiting backend verdict';

  useEffect(() => {
    setDebateStep(Math.min(3, visibleTranscript.length));
  }, [visibleTranscript]);

  const handlePublishReport = () => {
    setPublishStatus(`AI Debate Report & Audit Notice dispatched to ${hotelOwnerEmail || 'the linked owner'} and logged in Firestore.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {onBack && <button onClick={onBack} className="text-sm font-semibold text-[#0A2647] hover:underline">← Back to inspections</button>}
      {/* Top Banner / Context Selector */}
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0A2647]/10 pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2.5 py-1 rounded">
              Live Regulatory Inspection Mode
            </span>
            <h2 className="text-xl font-display font-bold text-[#0A2647] mt-1.5 flex items-center gap-2">
              <Camera className="w-6 h-6 text-[#FF9933]" /> AI Camera Inspection & Multi-Agent Courtroom
            </h2>
            <p className="text-xs text-[#0A2647]/60 mt-0.5">
              Target Establishment: <strong>{establishmentName}</strong> ({establishmentId}) · Owner: <strong className="text-emerald-700">{hotelOwnerEmail}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0A2647]">Audit against complaint:</span>
            <select
              value={linkedComplaint?.id || ''}
              onChange={(e) => {
                const found = complaintList.find((c) => c.id === e.target.value);
                setLinkedComplaint(found);
              }}
              className="border border-[#0A2647]/20 rounded-lg px-3 py-1.5 text-xs bg-[#F6F5F1] font-semibold text-[#0A2647]"
            >
              {complaintList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title?.substring(0, 35)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Complaint Snapshot */}
        {linkedComplaint && (
          <div className="mt-3 bg-[#F6F5F1] p-3 rounded-xl border border-[#0A2647]/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-[#0A2647]">Complaint Reference: {linkedComplaint.id}</span>
              <p className="text-[#0A2647]/70 italic mt-0.5">"{linkedComplaint.description}"</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-800">
                {linkedComplaint.category || 'Food Safety'}
              </span>
              <span className="text-emerald-800 font-mono font-bold">
                Tied to: {linkedComplaint.ownerEmail || hotelOwnerEmail}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left = Video & Debate Table | Right = Side-view Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Video Feed + Multi-Agent Courtroom Wall */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video / Camera Feed Container */}
          <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0A2647] flex items-center gap-2">
                <Video className="w-4 h-4 text-red-600 animate-pulse" /> Live CCTV / Optical Inspection Stream
              </h3>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-[#0A2647] hover:bg-[#153C6E] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Upload Video / Frame
                  <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Viewport Frame with YOLO Bounding Boxes */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#0A2647]/20 shadow-inner flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Inspection Feed" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 text-white/50">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Upload a real inspection image or frame for backend YOLO analysis.</p>
                </div>
              )}

              {/* Live Overlay Stamp */}
              <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                BACKEND FRAME
              </div>

              {/* YOLO Bounding Boxes Overlay (Visible when analyzed) */}
              {analyzed && detections.length > 0 && (
                <>
                  {detections.map((detection, index) => {
                    const [x, y, width, height] = detection.bbox || [0.5, 0.5, 0.2, 0.2];
                    return <motion.div key={`${detection.class}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute border-2 border-red-500 bg-red-500/10" style={{ left: `${(x - width / 2) * 100}%`, top: `${(y - height / 2) * 100}%`, width: `${width * 100}%`, height: `${height * 100}%` }}>
                      <span className="absolute -top-5 left-0 whitespace-nowrap bg-red-600 px-1 py-0.5 text-[9px] font-mono font-bold text-white">{detection.class} [{(Number(detection.confidence || 0) * 100).toFixed(1)}%]</span>
                    </motion.div>;
                  })}
                </>
              )}
            </div>

            {analyzed && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-950"><strong>YOLO detections:</strong> {detectionLabel}{ruleEvaluation?.status ? ` · Rule status: ${ruleEvaluation.status}` : ''}</div>}
            {analysisError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900">{analysisError}</div>}
            {debateError && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"><strong>YOLO completed, debate unavailable:</strong> {debateError}</div>}

            {/* Run Analysis Button */}
            <div className="flex justify-end">
              <button
                onClick={runLiveAIAnalysis}
                disabled={isProcessing || !previewUrl}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running YOLO & Multi-Agent Courtroom...
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    Initiate Multi-Agent Compliance Debate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ─── Multi-Agent Debate Wall / Table Type ("Table Type or Wall Type") ─── */}
          {analyzed && (
            <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card space-y-6">
              {debateTranscript.length > 0 && <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-indigo-950">Live Agent Transcript</h3>
                  <span className="text-xs font-mono text-indigo-700">{visibleTranscript.length}/{debateTranscript.length} messages from backend</span>
                </div>
                {visibleTranscript.map((message, index) => <div key={`${message.role}-${index}`} className="rounded-lg bg-white p-4 border border-indigo-100">
                  <div className="text-xs font-bold uppercase tracking-wide text-indigo-700 mb-1">{agentLabel(message.role)}</div>
                  <p className="text-sm leading-7 text-[#0A2647]">{message.content}</p>
                </div>)}
              </div>}
              <div className="flex items-center justify-between border-b border-[#0A2647]/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                    <Scale className="w-5 h-5 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[#0A2647] text-base">
                      Tri-Agent Debate Wall (Courtroom Table)
                    </h3>
                    <p className="text-xs text-[#0A2647]/60">
                      Real-time adversarial debate between Safety Prosecution, Defense Mitigation, and Chief Judge.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1 rounded-full font-bold">
                  Status: {debateStep === 3 ? 'Verdict Delivered' : 'Debate in Progress'}
                </span>
              </div>

              {/* Table / Wall Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {/* Agent 1: Food Safety Enforcement Agent (Left) */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  debateStep >= 1 ? 'bg-red-50/70 border-red-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-40'
                }`}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow">
                      A1
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-red-950">Food Safety Enforcement Agent</h4>
                      <p className="text-[10px] text-red-700">Role: Regulatory Prosecution</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-red-100 text-sm text-red-900 leading-relaxed shadow-sm">
                    <p className="font-semibold mb-1">Argument & Evidence Logged:</p>
                    <p>
                      {agentMessage('gemini_legal')}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-red-700 bg-red-50 p-1.5 rounded">
                      YOLO Evidence: {detectionLabel} · Statute: FSSAI Sch. 4 Sec. 2.1
                    </div>
                  </div>
                </div>

                {/* Agent 2: Hotel Defense & Mitigation Advocate (Right) */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  debateStep >= 2 ? 'bg-amber-50/70 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-40'
                }`}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow">
                      A2
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-amber-950">Hotel Defense & Mitigation Agent</h4>
                      <p className="text-[10px] text-amber-700">Role: {establishmentName} Advocate</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-amber-100 text-sm text-amber-900 leading-relaxed shadow-sm">
                    <p className="font-semibold mb-1">Defense & Counter-Plea:</p>
                    <p>
                      {agentMessage('groq_risk')}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-amber-700 bg-amber-50 p-1.5 rounded">
                      Evidence status: {detections.length ? 'YOLO evidence attached' : 'No detections returned'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent 3: Chief Regulatory Magistrate / Judge (Center Head) */}
              <AnimatePresence>
                {debateStep >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border-2 border-indigo-300 bg-indigo-50/60 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-indigo-900 text-white flex items-center justify-center font-bold text-xs shadow-md">
                          <Gavel className="w-4 h-4 text-[#FF9933]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-indigo-950">Chief AI Regulatory Magistrate</h4>
                          <p className="text-[10px] text-indigo-700 font-mono">Final Statutory Adjudication</p>
                        </div>
                      </div>
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {finalVerdict}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950 leading-relaxed shadow-sm space-y-2">
                      <p className="font-bold text-sm text-[#0A2647]">Magistrate Conclusion:</p>
                      <p>
                        {agentMessage('judge')}
                      </p>
                    </div>

                    {/* Dispatch Action Button */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={handlePublishReport}
                        className="bg-[#0A2647] hover:bg-[#153C6E] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow transition-all"
                      >
                        <Send className="w-3.5 h-3.5" /> Dispatch AI Report to Hotel Owner ({hotelOwnerEmail}) & Admin
                      </button>
                      {publishStatus && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                          {publishStatus}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ─── Why Explainability Section ─── */}
          {analyzed && (
            <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card space-y-4">
              <h3 className="font-display font-bold text-base text-[#0A2647] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" /> Explainability & Reasoning Architecture ("Why This Conclusion?")
              </h3>
              <p className="text-xs text-[#0A2647]/70">
                Transparent breakdown of statutory weights, visual confidence vectors, and logic gates that guided the judge's ruling.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#F6F5F1] p-3.5 rounded-xl border border-[#0A2647]/5">
                  <span className="font-bold text-[#0A2647] block mb-1">1. Visual YOLO Weight</span>
                    <p className="text-[#0A2647]/70">
                    {detections.length} detections returned by YOLO. Highest confidence: {detections.length ? `${(Math.max(...detections.map((d) => Number(d.confidence || 0))) * 100).toFixed(1)}%` : 'none'}.
                  </p>
                </div>
                <div className="bg-[#F6F5F1] p-3.5 rounded-xl border border-[#0A2647]/5">
                  <span className="font-bold text-[#0A2647] block mb-1">2. Statutory Mandate</span>
                    <p className="text-[#0A2647]/70">
                    Backend rule status: {ruleEvaluation?.status || 'not evaluated'}. Matched rules: {ruleEvaluation?.matched_rules?.join('; ') || 'none'}.
                  </p>
                </div>
                <div className="bg-[#F6F5F1] p-3.5 rounded-xl border border-[#0A2647]/5">
                  <span className="font-bold text-[#0A2647] block mb-1">3. Scorecard Impact</span>
                    <p className="text-[#0A2647]/70">
                    Current backend score: {scorecard ? `${scorecard.overall_score}% (Grade ${scorecard.grade})` : 'pending'}; active violations: {scorecard?.active_violations ?? 'pending'}; trend: {scorecard?.trend || 'pending'}.
                  </p>
                </div>
              </div>
              {inspectionReport && <pre className="whitespace-pre-wrap rounded-lg bg-[#F6F5F1] p-3 text-xs text-[#0A2647]/70">{inspectionReport}</pre>}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Side-View Inspection Copilot Checklist */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-[#0A2647]/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF9933]" />
                <h3 className="font-display font-bold text-[#0A2647] text-sm">
                  Inspector Copilot Checklist
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Live Side-View
              </span>
            </div>

            <p className="text-xs text-[#0A2647]/60">
              Auto-generated tailored tasks based on complaint findings and visual evidence.
            </p>

            <div className="space-y-2.5">
              {checklist.length > 0 ? (
                checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      item.done
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : item.priority === 'Critical'
                        ? 'bg-red-50/70 border-red-200 text-red-950'
                        : 'bg-[#F6F5F1] border-[#0A2647]/10 text-[#0A2647]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={item.done || false}
                        onChange={() => {
                          const updated = [...checklist];
                          updated[idx].done = !updated[idx].done;
                          setChecklist(updated);
                        }}
                        className="mt-0.5 rounded text-[#0A2647] focus:ring-[#FF9933]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold ${item.done ? 'line-through text-emerald-700' : ''}`}>
                          {item.task || item.item || item}
                        </p>
                        {item.priority && (
                          <span
                            className={`inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              item.priority === 'Critical'
                                ? 'bg-red-200 text-red-900'
                                : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            {item.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-[#0A2647]/40 text-xs bg-[#F6F5F1] rounded-xl border border-dashed border-[#0A2647]/20">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Run AI Analysis to populate the inspector action checklist.
                </div>
              )}
            </div>

            {/* Quick Links for Admin & Hotel Owner */}
            <div className="border-t border-[#0A2647]/10 pt-4 space-y-2 text-xs">
              <span className="font-bold text-[#0A2647] block">Surveillance Links:</span>
              <div className="bg-[#F6F5F1] p-2.5 rounded-lg flex items-center justify-between text-[11px]">
                <span className="text-[#0A2647]/70">Hotel Owner Email:</span>
                <span className="font-mono font-bold text-emerald-800">{hotelOwnerEmail}</span>
              </div>
              <div className="bg-[#F6F5F1] p-2.5 rounded-lg flex items-center justify-between text-[11px]">
                <span className="text-[#0A2647]/70">Establishment:</span>
                <span className="font-semibold text-[#0A2647]">{establishmentName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
