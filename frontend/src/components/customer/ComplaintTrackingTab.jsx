import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Camera, Video, RefreshCw } from 'lucide-react';
import { MOCK_COMPLAINTS } from '../../mockData/complaints';
import { PriorityBadge, StatusBadge } from '../complaintBadges';
import { fetchComplaints, triggerLiveComplaintInspection } from '../../api/backendApi';

export default function ComplaintTrackingTab({ selectedId, onSelect }) {
  const [complaints, setComplaints] = useState([]);
  const [openId, setOpenId] = useState(selectedId || null);
  const [searchId, setSearchId] = useState(selectedId || '');
  const [inspecting, setInspecting] = useState(false);
  const [showCameraFeed, setShowCameraFeed] = useState(false);

  const loadData = async () => {
    const data = await fetchComplaints();
    if (Array.isArray(data)) {
      setComplaints(data);
      if (!openId && data.length > 0) {
        setOpenId(selectedId || data[0]?.id);
      }
    } else {
      setComplaints([]);
    }
  };

  useEffect(() => {
    loadData();
    const iv = setInterval(loadData, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (selectedId) {
      setOpenId(selectedId);
      setSearchId(selectedId);
    }
  }, [selectedId]);

  const openComplaintById = (id) => {
    const normalized = (id || '').trim();
    if (!normalized) return;
    const match = complaints.find((c) => c.id.toLowerCase() === normalized.toLowerCase());
    if (match) {
      setOpenId(match.id);
      setSearchId(match.id);
      onSelect && onSelect(match.id);
      return true;
    }
    return false;
  };

  const activeId = openId || complaints[0]?.id;
  const currentComplaint = complaints.find((c) => c.id === activeId);

  const handleLiveCameraInspection = async () => {
    if (!activeId) return;
    setInspecting(true);
    try {
      await triggerLiveComplaintInspection(activeId);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setInspecting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-1 space-y-3">
        <div className="bg-white rounded-xl border border-[#0A2647]/10 p-3">
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#0A2647]/60 mb-2">Complaint ID lookup</label>
          <div className="flex gap-2">
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter complaint no, e.g. CMP-2222"
              className="flex-1 border border-[#0A2647]/15 rounded-lg px-2.5 py-2 text-xs bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20"
            />
            <button
              onClick={() => openComplaintById(searchId)}
              className="bg-[#0A2647] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#0A2647]/90"
            >
              Open
            </button>
          </div>
        </div>

        {complaints.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setOpenId(c.id);
              setSearchId(c.id);
              onSelect && onSelect(c.id);
            }}
            className={`w-full text-left rounded-xl border p-3 transition-colors ${
              activeId === c.id ? 'border-[#0A2647]/40 bg-[#0A2647]/5' : 'border-[#0A2647]/10 bg-white hover:bg-[#0A2647]/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#0A2647]/50">{c.id}</span>
              <PriorityBadge priority={c.priority} />
            </div>
            <p className="text-sm font-semibold text-[#0A2647] mt-1 truncate">{c.title}</p>
            <p className="text-xs text-[#0A2647]/50 truncate">{c.establishment || c.establishmentId}</p>
          </button>
        ))}
      </div>

      {/* Right Details */}
      <div className="md:col-span-2">
        {currentComplaint && (
          <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-[#0A2647] text-lg">{currentComplaint.title}</h3>
                <p className="text-sm text-[#0A2647]/50">
                  {currentComplaint.establishment || currentComplaint.establishmentId} · {currentComplaint.category}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <PriorityBadge priority={currentComplaint.priority} />
                <StatusBadge status={currentComplaint.status} />
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs text-[#0A2647]/70 bg-[#F6F5F1] rounded-lg p-3">
              <div>
                <dt className="text-[#0A2647]/40">Complaint ID</dt>
                <dd className="font-mono font-semibold">{currentComplaint.id}</dd>
              </div>
              <div>
                <dt className="text-[#0A2647]/40">Submitted</dt>
                <dd>{new Date(currentComplaint.submittedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[#0A2647]/40">Last Updated</dt>
                <dd>{new Date(currentComplaint.lastUpdated).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[#0A2647]/40">Assigned Officer</dt>
                <dd>{currentComplaint.assignedOfficer || 'Inspector R. Deshmukh (Zone 4)'}</dd>
              </div>
            </dl>

            {/* Live Camera Inspection Trigger Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" /> Live Camera Inspection & CCTV Audit
                </h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Request / Authorize real-time CCTV stream inspection for {currentComplaint.establishment || currentComplaint.establishmentId}.
                </p>
              </div>
              <button
                onClick={async () => {
                  await handleLiveCameraInspection();
                  setShowCameraFeed(true);
                }}
                disabled={inspecting}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm disabled:opacity-50"
              >
                {inspecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying Stream...
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5" /> Start Live Camera Audit
                  </>
                )}
              </button>
            </div>

            {/* Live Camera Feed Viewer */}
            {showCameraFeed && (
              <div className="bg-[#0A2647] rounded-xl p-4 text-white space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-xs font-mono font-bold tracking-wider">
                      CCTV FEED · CAM-01 [LIVE RESTAURANT KITCHEN]
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Inspection In Progress · Audit Reference: {currentComplaint.id}
                  </span>
                </div>

                <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20 bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
                    alt="Live Kitchen Camera"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                    YOLO VISION ACTIVE · 2 ANOMALIES DETECTED
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-emerald-300 text-[10px] font-mono px-2.5 py-1 rounded">
                    Audit Logged to FSSAI Regulatory Database & Notified to Hotel Owner
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-[#0A2647] mb-3">Investigation Timeline</h4>
              <ol className="space-y-0">
                {currentComplaint.timeline?.map((step, i) => (
                  <li key={step.label || i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {step.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#0A2647]/20 shrink-0" />
                      )}
                      {i < currentComplaint.timeline.length - 1 && (
                        <div
                          className={`w-px flex-1 my-0.5 ${step.done ? 'bg-emerald-300' : 'bg-[#0A2647]/10'}`}
                        />
                      )}
                    </div>
                    <div className="pb-5">
                      <p
                        className={`text-sm font-semibold ${
                          step.done ? 'text-[#0A2647]' : 'text-[#0A2647]/40'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-[#0A2647]/40">
                          {isNaN(Date.parse(step.date)) ? step.date : new Date(step.date).toLocaleString()}
                        </p>
                      )}
                      {step.note && <p className="text-xs text-[#0A2647]/60 mt-0.5">{step.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
