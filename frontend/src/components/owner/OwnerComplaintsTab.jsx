import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle2, AlertTriangle, MessageSquare, Clock, ShieldAlert } from 'lucide-react';
import { MOCK_COMPLAINTS } from '../../mockData/complaints';
import { PriorityBadge, StatusBadge } from '../complaintBadges';
import { fetchComplaints, updateComplaint } from '../../api/backendApi';

export default function OwnerComplaintsTab({ profile }) {
  const [complaints, setComplaints] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  const ownerEmail = profile?.email || 'hotel@gmail.com';
  const establishmentId = profile?.establishment_id || 'REST-001';

  const loadComplaints = async () => {
    try {
      const data = await fetchComplaints(null, establishmentId, ownerEmail);
      if (Array.isArray(data)) {
        setComplaints(data);
        if (!openId && data.length > 0) setOpenId(data[0]?.id);
      } else {
        setComplaints([]);
      }
    } catch (e) {
      console.error('Error fetching owner complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    const interval = setInterval(loadComplaints, 5000);
    return () => clearInterval(interval);
  }, [ownerEmail, establishmentId]);

  const active = complaints.find((c) => c.id === openId) || complaints[0];

  const downloadReport = (complaint) => {
    const text = complaint?.report || `Complaint ID: ${complaint?.id}\nEstablishment: ${complaint?.establishment || complaint?.establishmentId}\nOwner: ${ownerEmail}\nStatus: ${complaint?.status || 'Unknown'}\n`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${complaint?.id || 'complaint'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [ackNotice, setAckNotice] = useState('');

  const acknowledge = async (id) => {
    const timestamp = new Date().toISOString();
    const ackPayload = {
      status: 'Acknowledged',
      acknowledgement: {
        acknowledgedBy: ownerEmail,
        acknowledgedAt: timestamp,
        status: 'Acknowledged',
        message: 'Notice received and acknowledged by hotel management.'
      }
    };
    await updateComplaint(id, ackPayload);
    setComplaints((cs) => cs.map((c) => (c.id === id ? { ...c, ...ackPayload } : c)));
    setAckNotice('Acknowledgment sent and recorded in regulatory database.');
    setTimeout(() => setAckNotice(''), 4000);
  };

  const submitAction = async (id) => {
    const timestamp = new Date().toISOString();
    const actionPayload = {
      status: 'Resolution',
      correctiveAction: {
        requested: active?.correctiveAction?.requested || 'Corrective action requested.',
        ownerResponse: response || 'Corrective action taken and documented.',
        submittedAt: timestamp,
        evidenceUploaded: true,
        verified: false,
      }
    };
    await updateComplaint(id, actionPayload);
    setComplaints((cs) =>
      cs.map((c) =>
        c.id === id ? { ...c, ...actionPayload } : c
      )
    );
    setResponse('');
    setAckNotice('Corrective response submitted and saved in Firestore.');
    setTimeout(() => setAckNotice(''), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-5 shadow-gov-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-base text-[#0A2647] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" /> Customer Complaints Lodged Against Your Outlet
            </h3>
            <p className="text-xs text-[#0A2647]/60 mt-1">
              Active regulatory complaints tied to <strong>{profile?.business_name || 'Hotel Grand Palace'}</strong> ({ownerEmail}).
            </p>
          </div>
          <span className="text-xs font-mono bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg font-bold">
            {complaints.length} Recorded Complaints
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Left List */}
        <div className="md:col-span-1 space-y-2">
          {loading && complaints.length === 0 && (
            <p className="text-xs text-[#0A2647]/50 p-4">Checking complaints...</p>
          )}

          {complaints.map((c) => (
            <button
              key={c.id}
              onClick={() => setOpenId(c.id)}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${
                active?.id === c.id
                  ? 'border-[#0A2647]/40 bg-[#0A2647]/5'
                  : 'border-[#0A2647]/10 bg-white hover:bg-[#0A2647]/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#0A2647]/50">{c.id}</span>
                <PriorityBadge priority={c.priority} />
              </div>
              <p className="text-sm font-semibold text-[#0A2647] mt-1 truncate">{c.title}</p>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-[#0A2647]/50">{new Date(c.submittedAt || Date.now()).toLocaleDateString()}</span>
                <StatusBadge status={c.status} />
              </div>
            </button>
          ))}
        </div>

        {/* Right Details */}
        <div className="md:col-span-2">
          {active && (
            <div className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-[#0A2647] text-lg">{active.title}</h3>
                  <p className="text-xs text-[#0A2647]/50">
                    Category: {active.category} · Logged against: {active.establishment || active.establishmentId}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={active.priority} />
                  <StatusBadge status={active.status} />
                </div>
              </div>

              <div className="bg-[#F6F5F1] p-4 rounded-xl space-y-2 text-xs">
                <p className="font-semibold text-[#0A2647]">Customer Statement:</p>
                <p className="text-[#0A2647]/80 leading-relaxed">{active.description}</p>
                {active.productInvolved && (
                  <p className="text-[#0A2647]/60">
                    <strong>Product Involved:</strong> {active.productInvolved}
                  </p>
                )}
                {active.location && (
                  <p className="text-[#0A2647]/60">
                    <strong>Location:</strong> {active.location}
                  </p>
                )}
              </div>

              {/* Status and Action flow */}
              <div className="border-t border-[#0A2647]/10 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-[#0A2647] uppercase tracking-wider">
                  Hotel Owner Compliance Response
                </h4>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Enter immediate corrective steps taken by kitchen staff..."
                    className="w-full border border-[#0A2647]/15 rounded-lg p-3 text-xs bg-[#F6F5F1] focus:outline-none focus:border-[#FF9933]"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => submitAction(active.id)}
                      className="bg-[#0A2647] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0A2647]/90 transition-colors"
                    >
                      Submit Corrective Action Response
                    </button>
                    {active.status !== 'Resolution' && active.status !== 'Closed' && (
                      <button
                        onClick={() => acknowledge(active.id)}
                        className="border border-[#0A2647]/20 text-[#0A2647] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0A2647]/5 transition-colors"
                      >
                        Acknowledge Notice
                      </button>
                    )}
                    {ackNotice && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg animate-fade-in">
                        ✓ {ackNotice}
                      </span>
                    )}
                  </div>
                </div>

                {active.acknowledgement?.status && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-900 mt-2 flex items-center justify-between">
                    <span><strong>Acknowledgment Logged:</strong> {active.acknowledgement.message}</span>
                    <span className="font-mono text-[10px] text-blue-700">{new Date(active.acknowledgement.acknowledgedAt || Date.now()).toLocaleTimeString()}</span>
                  </div>
                )}

                {active.correctiveAction?.ownerResponse && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 mt-2">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Action Documented:
                    </p>
                    <p>{active.correctiveAction.ownerResponse}</p>
                  </div>
                )}

                {(active.report || active.scorecard) && (
                  <div className="border-t border-[#0A2647]/10 pt-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h4 className="text-xs font-bold text-[#0A2647] uppercase tracking-wider">Inspection Report & Scorecard</h4>
                      <button
                        onClick={() => downloadReport(active)}
                        className="text-xs bg-[#0A2647] text-white px-3 py-1.5 rounded-lg hover:bg-[#0A2647]/90"
                      >
                        Download Report
                      </button>
                    </div>
                    <div className="bg-[#F6F5F1] border border-[#0A2647]/10 rounded-xl p-3 text-xs text-[#0A2647]/70 whitespace-pre-wrap">
                      {active.report || 'Report is available in the admin inspection trail.'}
                    </div>
                    {active.scorecard && (
                      <div className="mt-2 text-xs bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900">
                        <strong>Linked scorecard:</strong> {active.scorecard.overall_score || active.scorecard.overallScore}% · Grade {active.scorecard.grade || 'B'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
