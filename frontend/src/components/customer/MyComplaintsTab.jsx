import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { MOCK_COMPLAINTS } from '../../mockData/complaints';
import { PriorityBadge, StatusBadge } from '../complaintBadges';
import { fetchComplaints } from '../../api/backendApi';
import { useAuth } from '../../context/AuthContext';

export default function MyComplaintsTab({ onOpenComplaint }) {
  const { profile, firebaseUser } = useAuth();
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const loadComplaints = async () => {
      const email = profile?.email || firebaseUser?.email || '';
      const uid = profile?.uid || firebaseUser?.uid || null;
      const data = await fetchComplaints(uid, null, null, email);
      setComplaints(Array.isArray(data) ? data : []);
    };
    loadComplaints();
    const iv = setInterval(loadComplaints, 5000);
    return () => clearInterval(iv);
  }, [profile?.email, profile?.uid, firebaseUser?.email, firebaseUser?.uid]);

  return (
    <div className="space-y-3">
      {complaints.map((c) => (
        <button
          key={c.id}
          onClick={() => onOpenComplaint(c.id)}
          className="w-full text-left bg-white rounded-xl border border-[#0A2647]/10 shadow-gov-card p-4 flex items-center justify-between gap-4 hover:border-[#0A2647]/25 transition-colors"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-[#0A2647]/50">{c.id}</span>
              <PriorityBadge priority={c.priority} />
            </div>
            <p className="font-semibold text-[#0A2647] truncate">{c.title}</p>
            <p className="text-xs text-[#0A2647]/50 mt-0.5">
              {c.establishment || c.establishmentId} · {c.category} · submitted{' '}
              {new Date(c.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={c.status} />
            <ChevronRight className="w-4 h-4 text-[#0A2647]/30" />
          </div>
        </button>
      ))}
      {complaints.length === 0 && (
        <p className="text-sm text-[#0A2647]/50 text-center py-10">You haven't submitted any complaints yet.</p>
      )}
    </div>
  );
}
