import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { KITCHENS } from '../mockData/kitchens';
import { Calendar, User, ChevronDown } from 'lucide-react';

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

export default function InspectionsTab() {
  const sortedKitchens = [...KITCHENS].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-emerald-950">Prioritized Inspection Queue</h2>
        <span className="text-sm font-mono text-emerald-600">Total: {sortedKitchens.length} Facilities</span>
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
          {sortedKitchens.map((kitchen, i) => (
            <motion.div 
              key={kitchen.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-12 gap-4 p-4 border-b border-emerald-200/50 hover:bg-white/80 transition-colors items-center"
            >
              <div className="col-span-1 flex justify-center">
                <RadialProgress value={kitchen.riskScore} />
              </div>
              
              <div className="col-span-4 flex flex-col justify-center">
                <span className="font-bold text-emerald-900">{kitchen.name}</span>
                <span className="text-xs text-emerald-600 truncate">{kitchen.location}</span>
                <span className="text-[10px] text-emerald-600 font-mono mt-1 w-fit bg-brand-saffron/10 px-1 rounded">{kitchen.type}</span>
              </div>
              
              <div className="col-span-2 flex items-center text-sm text-emerald-800">
                <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                {kitchen.lastInspection}
              </div>
              
              <div className="col-span-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  kitchen.riskScore > 80 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  kitchen.riskScore > 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-brand-green/20 text-brand-green border border-brand-green/30'
                }`}>
                  {kitchen.riskScore > 80 ? 'Pending Urgent' : kitchen.riskScore > 50 ? 'Assigned' : 'Completed'}
                </span>
              </div>
              
              <div className="col-span-3">
                <div className="relative">
                  <select className="w-full appearance-none bg-emerald-50 border border-emerald-200 rounded p-2 pr-8 text-sm text-emerald-800 focus:outline-none focus:border-brand-saffron">
                    <option>Select Inspector...</option>
                    <option selected={kitchen.riskScore > 80}>Inspector Rajesh (On-Duty)</option>
                    <option>Inspector Priya</option>
                    <option>Team Alpha (Zone 1)</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-emerald-500 pointer-events-none" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
