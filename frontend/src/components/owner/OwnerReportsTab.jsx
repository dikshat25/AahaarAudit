import React, { useEffect, useState } from 'react';
import { FileText, Download, CheckCircle, AlertTriangle, ShieldCheck, Scale, Gavel, ArrowUpRight, Code2 } from 'lucide-react';
import { fetchEstablishmentViolations, fetchEstablishmentScorecard, fetchReports, fetchComplaints } from '../../api/backendApi';

export default function OwnerReportsTab({ profile }) {
  const [violations, setViolations] = useState([]);
  const [reports, setReports] = useState([]);
  const [scorecard, setScorecard] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [downloadedId, setDownloadedId] = useState(null);

  const establishmentId = profile?.establishment_id || 'REST-001';
  const ownerEmail = profile?.email || 'hotel@gmail.com';

  useEffect(() => {
    const loadData = async () => {
      try {
        const vData = await fetchEstablishmentViolations(establishmentId);
        if (Array.isArray(vData)) setViolations(vData);

        const sData = await fetchEstablishmentScorecard(establishmentId);
        if (sData) setScorecard(sData);

        const rData = await fetchReports(null, establishmentId);
        const complaintsData = await fetchComplaints(null, establishmentId, ownerEmail);
        
        // Merge reports from reports collection and complaints with reports
        const mergedReports = [];
        if (Array.isArray(rData)) {
          rData.forEach((r) => mergedReports.push(r));
        }
        if (Array.isArray(complaintsData)) {
          complaintsData.forEach((c) => {
            if (c.report && !mergedReports.some((r) => r.complaint_id === c.id)) {
              mergedReports.push({
                id: c.report_id || `RPT-${c.id}`,
                complaint_id: c.id,
                facility: c.establishment || c.establishmentName || establishmentId,
                date: c.lastUpdated || c.submittedAt || new Date().toISOString(),
                type: 'Live Vision Inspection',
                summary: c.report,
                scorecard: c.scorecard,
                status: 'Generated',
                raw: c
              });
            }
          });
        }
        setReports(mergedReports);
      } catch (err) {
        console.error('Error loading owner reports:', err);
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [establishmentId, ownerEmail]);

  const handleDownload = (rpt, format = 'txt') => {
    setDownloadedId(rpt.id || rpt.violation_id);
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(rpt, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Inspection_Dossier_${rpt.complaint_id || rpt.id || 'record'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const content = `AAHAAR-AUDIT OFFICIAL REGULATORY INSPECTION REPORT\n` +
      `=======================================================\n` +
      `Target Facility: ${rpt.facility || rpt.establishment_name || establishmentId}\n` +
      `Owner Account: ${ownerEmail}\n` +
      `Notice / Report ID: ${rpt.id || rpt.violation_id}\n` +
      `Date: ${new Date(rpt.date || rpt.detected_at || Date.now()).toLocaleString()}\n` +
      `\nAUDIT SUMMARY & RULING:\n${rpt.summary || rpt.ai_decision?.justification || 'Inspection finding recorded.'}\n` +
      `=======================================================\n` +
      `Authorized by Aahaar-Audit AI Regulatory Magistrate`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Inspection_Notice_${rpt.complaint_id || rpt.id || 'report'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-[#0A2647]/10 p-6 shadow-gov-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-[#0A2647] flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-700" /> Official AI Inspection Reports & Debate Verdicts
            </h3>
            <p className="text-xs text-[#0A2647]/60 mt-1">
              Surveillance records and certified Magistrate Rulings issued to <strong>{profile?.business_name || 'Hotel Grand Palace'}</strong> ({profile?.email || 'hotel@gmail.com'}).
            </p>
          </div>
          {scorecard && (
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-800 font-bold">Your Compliance Score</p>
                <p className="text-lg font-display font-bold text-emerald-950 leading-none">
                  {Math.round(scorecard.overall_score || 92)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Featured AI Debate Ruling Report Card */}
      <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-indigo-800" />
            <h4 className="font-bold text-sm text-indigo-950">
              Latest Statutory AI Debate Report: Food Safety Hearing
            </h4>
          </div>
          <span className="text-[11px] font-mono font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded">
            Status: Action Required (24h)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-100 text-xs space-y-2.5 shadow-sm">
          <p className="text-[#0A2647]/80 leading-relaxed">
            <strong>Adjudicated Matter:</strong> In response to CCTV optical audit and customer complaint, a Tri-Agent statutory debate was convened. While hotel mitigation regarding prompt employee repositioning was noted, the Chief Regulatory Magistrate has affirmed a <strong>Grade-B Non-Conformance</strong> under FSSAI Schedule 4 Section 2.1 (Barrier Protection & Bare-Hand Contact).
          </p>
          <div className="grid sm:grid-cols-2 gap-3 pt-2 text-[11px]">
            <div className="bg-[#F6F5F1] p-2.5 rounded-lg border border-[#0A2647]/5">
              <span className="font-bold text-indigo-900 block mb-0.5">Prosecution Finding:</span>
              <p className="text-[#0A2647]/70">YOLO visual confirmation of unbarriered food contact in active staging area.</p>
            </div>
            <div className="bg-[#F6F5F1] p-2.5 rounded-lg border border-[#0A2647]/5">
              <span className="font-bold text-amber-900 block mb-0.5">Mitigation Accepted:</span>
              <p className="text-[#0A2647]/70">Good historical rating (92%); no shutdown imposed. Standard improvement notice dispatched.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <span className="text-indigo-900 font-mono text-[11px]">
            Notice Dispatched to: <strong>hotel@gmail.com</strong>
          </span>
          <button
            onClick={() =>
              setSelectedReport({
                violation_id: 'RPT-AI-DEBATE-849',
                establishment_name: 'Hotel Grand Palace',
                violation_type: 'Statutory AI Debate Notice: Section 4 Hygiene',
                severity: 'medium',
                status: 'Action Required',
                ai_decision: {
                  justification:
                    'Compliance violation confirmed after Tri-Agent deliberation. Remedial training and protective glove enforcement required within 24 hours.'
                }
              })
            }
            className="bg-[#0A2647] hover:bg-[#153C6E] text-white px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>View Full Legal Notice</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Certified Live Inspection Dossiers from Admin / Surveillance */}
      {reports.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-[#0A2647]/60 tracking-wider flex items-center justify-between">
            <span>Official Inspection Reports & AI Vision Audits</span>
            <span className="font-mono text-emerald-700 font-bold">{reports.length} Reports Linked</span>
          </h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {reports.map((rpt) => (
              <div
                key={rpt.id}
                className="bg-white rounded-2xl border border-[#0A2647]/10 shadow-gov-card p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded">
                      {rpt.complaint_id || rpt.id}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                      {rpt.status || 'Verified'}
                    </span>
                  </div>

                  <h5 className="font-bold text-[#0A2647] text-sm">{rpt.facility}</h5>
                  <p className="text-[11px] text-[#0A2647]/50 mt-0.5">
                    Date: {new Date(rpt.date || Date.now()).toLocaleDateString()} · {rpt.type || 'AI Vision Audit'}
                  </p>

                  <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-[#0A2647]/80 whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {rpt.summary || 'Official inspection audit report recorded.'}
                  </div>

                  {rpt.scorecard && (
                    <div className="mt-2 text-[11px] flex items-center justify-between bg-[#F6F5F1] p-2 rounded-lg text-[#0A2647]">
                      <span>Overall Rating: <strong>{rpt.scorecard.overall_score || 85}%</strong></span>
                      <span className="font-bold text-emerald-700">Grade {rpt.scorecard.grade || 'A'}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#0A2647]/10">
                  <button
                    onClick={() => handleDownload(rpt, 'txt')}
                    className="flex-1 bg-[#0A2647] hover:bg-[#153C6E] text-white py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadedId === (rpt.id || rpt.violation_id) ? 'Downloaded' : 'Download Dossier'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(rpt, 'json')}
                    title="Download Raw JSON"
                    className="border border-[#0A2647]/20 text-[#0A2647] hover:bg-[#0A2647]/5 px-2.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live AI Inspection Audit Findings */}
      {violations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-[#0A2647]/60 tracking-wider">
            All Recorded AI Findings & Audit Notices
          </h4>
          {violations.map((v) => (
            <div
              key={v.violation_id}
              className="bg-white rounded-xl border border-[#0A2647]/10 shadow-gov-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    v.severity === 'high' || v.severity === 'critical' ? 'bg-red-50' : 'bg-amber-50'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      v.severity === 'high' || v.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#0A2647]">
                      {v.violation_type?.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        v.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[#0A2647]/50 mt-0.5">
                    Category: {v.category} · Detected: {new Date(v.detected_at).toLocaleDateString()} · Ref: {v.violation_id}
                  </p>
                  {v.ai_decision?.justification && (
                    <p className="text-xs text-[#0A2647]/75 mt-2 bg-[#F6F5F1] p-2.5 rounded-lg border border-[#0A2647]/5">
                      <strong>Audit Finding Summary:</strong> {v.ai_decision.justification}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0A2647] border border-[#0A2647]/20 rounded-lg px-3 py-1.5 hover:bg-[#0A2647]/5 shrink-0 self-start sm:self-center"
              >
                <Download className="w-3.5 h-3.5" /> View Notice
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#0A2647]/10 space-y-4">
            <div className="flex justify-between items-start border-b border-[#0A2647]/10 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[#0A2647]">Official Food Safety Audit Notice</h3>
                <p className="text-xs text-[#0A2647]/50">Notice ID: {selectedReport.violation_id}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-sm font-bold text-[#0A2647]/50 hover:text-[#0A2647]">
                ✕
              </button>
            </div>
            <div className="text-xs space-y-3">
              <p>
                <strong>Establishment:</strong> {selectedReport.establishment_name || 'Hotel Grand Palace'}
              </p>
              <p>
                <strong>Registered Owner:</strong> hotel@gmail.com
              </p>
              <p>
                <strong>Violation Type:</strong> {selectedReport.violation_type?.replace(/_/g, ' ').toUpperCase()}
              </p>
              <p>
                <strong>Severity Level:</strong>{' '}
                <span className="uppercase font-bold text-amber-600">{selectedReport.severity}</span>
              </p>
              <div className="bg-[#F6F5F1] p-3 rounded-lg border border-[#0A2647]/10">
                <p className="font-semibold text-[#0A2647] mb-1">Formal Auditor Finding & Directive:</p>
                <p className="text-[#0A2647]/80">
                  {selectedReport.ai_decision?.justification ||
                    'Corrective action must be documented in the Corrective Actions tab within 24 hours.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="w-full bg-[#0A2647] text-white py-2 rounded-lg text-xs font-semibold"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
