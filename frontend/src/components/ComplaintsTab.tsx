import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, User, MapPin, ClipboardList, CheckCircle2 } from 'lucide-react';
import { MOCK_COMPLAINTS } from '../mockData/complaints';
import type { Complaint } from '../mockData/complaints';

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'text-brand-green bg-brand-green/10 border-brand-green/30',
  MEDIUM: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  HIGH: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
  CRITICAL: 'text-red-500 bg-red-500/10 border-red-500/30',
};

export default function ComplaintsTab() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [note, setNote] = useState('');

  const sorted = [...complaints].sort((a, b) => b.riskScore - a.riskScore);

  const advanceStatus = (id: string, status: Complaint['status']) => {
    setComplaints((cs) => cs.map((c) => (c.id === id ? { ...c, status, lastUpdated: new Date().toISOString() } : c)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full gap-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-emerald-950">Customer Complaint Queue</h2>
        <span className="text-sm font-mono text-emerald-600">Total: {complaints.length} Complaints</span>
      </div>

      <div className="glass-panel overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-emerald-200 bg-white text-xs font-mono text-emerald-600 uppercase">
          <div className="col-span-3">Complaint</div>
          <div className="col-span-3">Establishment</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Submitted</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sorted.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(c)}
              className="w-full grid grid-cols-12 gap-4 p-4 border-b border-emerald-200/50 hover:bg-white/80 transition-colors items-center text-left"
            >
              <div className="col-span-3">
                <p className="font-mono text-[11px] text-emerald-500">{c.id}</p>
                <p className="font-semibold text-emerald-950 text-sm truncate">{c.title}</p>
                <p className="text-[11px] text-emerald-600">{c.category}</p>
              </div>
              <div className="col-span-3 flex items-center gap-1.5 text-sm text-emerald-800">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{c.establishment}</span>
              </div>
              <div className="col-span-2">
                <span className={`text-xs px-2 py-1 rounded-full font-bold border ${PRIORITY_COLOR[c.priority]}`}>{c.priority}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {c.status}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-between text-xs text-emerald-600 font-mono">
                {new Date(c.submittedAt).toLocaleDateString()}
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-50/90 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-2xl p-6 bg-white max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono text-xs text-emerald-500">{selected.id}</p>
                  <h3 className="text-lg font-bold text-emerald-950">{selected.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-emerald-600 hover:text-emerald-950 text-xl leading-none">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex items-center gap-1.5 text-emerald-700"><User className="w-3.5 h-3.5" /> {selected.customerName}</div>
                <div className="flex items-center gap-1.5 text-emerald-700"><MapPin className="w-3.5 h-3.5" /> {selected.establishment}</div>
                <div className="flex items-center gap-1.5 text-emerald-700"><Clock className="w-3.5 h-3.5" /> {new Date(selected.submittedAt).toLocaleString()}</div>
                <div className="flex items-center gap-1.5 text-emerald-700"><ClipboardList className="w-3.5 h-3.5" /> Risk score {selected.riskScore}</div>
              </div>

              <p className="text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">{selected.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-bold border ${PRIORITY_COLOR[selected.priority]}`}>{selected.priority} PRIORITY</span>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">{selected.status}</span>
                {selected.assignedOfficer && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-brand-saffron/10 text-brand-saffron border border-brand-saffron/30">
                    Assigned: {selected.assignedOfficer}
                  </span>
                )}
              </div>

              {selected.correctiveAction && (
                <div className="mb-4 bg-brand-green/10 border border-brand-green/30 rounded-lg p-3 text-sm text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Owner corrective action:</p>
                    <p>{selected.correctiveAction.ownerResponse}</p>
                  </div>
                </div>
              )}

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add investigation notes..."
                rows={2}
                className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-brand-saffron"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => advanceStatus(selected.id, 'Under Investigation')}
                  className="text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-900 text-white hover:bg-emerald-800"
                >
                  Start Investigation
                </button>
                <button
                  onClick={() => advanceStatus(selected.id, 'Inspection Scheduled')}
                  className="text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  Schedule Inspection
                </button>
                <button
                  onClick={() => advanceStatus(selected.id, 'Closed')}
                  className="text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  Close Complaint
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
