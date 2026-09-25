import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchComplaints, updateComplaint } from '../api/backendApi';
import { Calendar, ChevronDown, Loader2 } from 'lucide-react';

const RadialProgress = ({ value }: { value: number }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const color = value > 80 ? '#EF4444' : value > 50 ? '#F59E0B' : '#22C55E';

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 transform -rotate-90">
        <circle cx="24" cy="24" r={radius} stroke="#a7f3d0" strokeWidth="4" fill="none" />
        <motion.circle 
          cx="24" cy="24" r={radius} 
          stroke={color} 
          strokeWidth="4" 
          fill="none" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-emerald-950">{value}</span>
    </div>
  );
}

export default function InspectionsTab({ onRunLiveVision }: { onRunLiveVision?: (complaint: any) => void }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadComplaints = async () => {
      const data = await fetchComplaints();
      if (mounted) {
        setComplaints(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    };

    loadComplaints();
    const refresh = window.setInterval(loadComplaints, 5000);
    return () => {
      mounted = false;
      window.clearInterval(refresh);
    };
  }, []);

  const sortedComplaints = [...complaints].sort((a, b) => {
    const priorityRank: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
  });

  const riskScore = (complaint: any) => ({ Critical: 95, High: 80, Medium: 55, Low: 25 }[complaint.priority] || 50);
  const formatDate = (value: string) => value ? new Date(value).toLocaleDateString() : 'Not submitted';
  const assignInspector = async (complaint: any, assignedOfficer: string) => {
    const updated = await updateComplaint(complaint.id, { assignedOfficer });
    if (updated) setComplaints((current) => current.map((item) => item.id === complaint.id ? updated : item));
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-emerald-950">Prioritized Inspection Queue</h2>
        <span className="text-sm font-mono text-emerald-600">Total: {sortedComplaints.length} Complaints</span>
      </div>

      <div className="glass-panel overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-emerald-200 bg-white text-xs font-mono text-emerald-600 uppercase">
          <div className="col-span-1 text-center">Risk</div>
          <div className="col-span-4">Facility Details</div>
          <div className="col-span-2">Last Audit</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Assignment</div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-10 text-center text-emerald-700">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading filed complaints...
            </div>
          ) : sortedComplaints.length === 0 ? (
            <div className="p-10 text-center text-emerald-700">No filed complaints are waiting for inspection.</div>
          ) : sortedComplaints.map((complaint, i) => {
            const score = riskScore(complaint);
            return (
            <motion.div 
              key={complaint.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-12 gap-4 p-4 border-b border-emerald-200/50 hover:bg-white/80 transition-colors items-center"
            >
              <div className="col-span-1 flex justify-center">
                <RadialProgress value={score} />
              </div>
              
              <div className="col-span-4 flex flex-col justify-center">
                <span className="font-bold text-emerald-900">{complaint.establishment || complaint.establishmentName || complaint.establishmentId}</span>
                <span className="text-xs text-emerald-600 truncate">{complaint.location || 'Location not provided'}</span>
                <span className="text-[10px] text-emerald-600 font-mono mt-1 w-fit bg-brand-saffron/10 px-1 rounded">{complaint.id} · {complaint.category}</span>
              </div>
              
              <div className="col-span-2 flex items-center text-sm text-emerald-800">
                <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                {formatDate(complaint.submittedAt)}
              </div>
              
              <div className="col-span-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  score > 80 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  score > 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-brand-green/20 text-brand-green border border-brand-green/30'
                }`}>
                  {complaint.status || (score > 80 ? 'Pending Urgent' : 'Assigned')}
                </span>
              </div>
              
              <div className="col-span-3">
                <div className="relative">
                  <select
                    value={complaint.assignedOfficer || ''}
                    onChange={(event) => assignInspector(complaint, event.target.value)}
                    className="w-full appearance-none bg-emerald-50 border border-emerald-200 rounded p-2 pr-8 text-sm text-emerald-800 focus:outline-none focus:border-brand-saffron"
                  >
                    <option value="">Select Inspector...</option>
                    <option value="Dr. Rajesh">Dr. Rajesh</option>
                    <option value="Inspector Priya">Inspector Priya</option>
                    <option value="Team Alpha (Zone 1)">Team Alpha (Zone 1)</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-emerald-500 pointer-events-none" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-emerald-700 truncate flex-1">
                    Assigned: {complaint.assignedOfficer || 'Unassigned'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRunLiveVision?.(complaint)}
                    className="shrink-0 rounded bg-emerald-700 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-800"
                  >
                    Run Live Vision
                  </button>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
