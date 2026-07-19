import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, X, AlertTriangle, Play, MapPin, Navigation, Camera, Clock } from 'lucide-react';
import { KITCHENS } from '../mockData/kitchens';

export default function InspectorMobileApp() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  const tasks = [...KITCHENS].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  return (
    <div className="w-[390px] h-[844px] bg-emerald-50 rounded-[3rem] border-[8px] border-emerald-950 shadow-2xl relative overflow-hidden flex flex-col scale-90 sm:scale-100 origin-top">
      {/* Notch */}
      <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
        <div className="w-32 h-6 bg-emerald-950 rounded-b-3xl"></div>
      </div>

      {/* App Header */}
      <div className="pt-12 pb-4 px-6 bg-white border-b border-emerald-200">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-emerald-600" />
          <h1 className="text-xl font-bold text-emerald-950">Inspector Field App</h1>
        </div>
        <p className="text-emerald-600 text-sm">Zone: Mumbai West (On-Duty)</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        <h2 className="text-sm font-bold text-emerald-800 font-mono uppercase tracking-wider mb-2">Today's Priority Queue</h2>
        
        {tasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedTask(task)}
            className="bg-white rounded-xl p-4 border border-emerald-200 shadow-md cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-emerald-900 text-lg">{task.name}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                task.riskScore > 80 ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
              }`}>
                Risk {task.riskScore}
              </span>
            </div>
            <p className="text-sm text-emerald-600 flex items-center gap-1 mb-4"><MapPin className="w-3 h-3"/> {task.location}</p>
            
            <div className="flex items-center justify-between text-xs text-emerald-600 font-medium">
              <span>Tap to view evidence trail</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Nav Mock */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-emerald-200 flex justify-around items-center px-6 pb-4">
        <div className="flex flex-col items-center gap-1 text-emerald-600"><Shield className="w-5 h-5"/> <span className="text-[10px]">Queue</span></div>
        <div className="flex flex-col items-center gap-1 text-emerald-500"><Navigation className="w-5 h-5"/> <span className="text-[10px]">Map</span></div>
        <div className="flex flex-col items-center gap-1 text-emerald-500"><Camera className="w-5 h-5"/> <span className="text-[10px]">Scan</span></div>
      </div>

      {/* Slide-up Sheet for Task Details */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-emerald-50 z-40 flex flex-col"
          >
            <div className="pt-12 px-4 pb-4 border-b border-emerald-200 flex justify-between items-center bg-white">
              <h2 className="font-bold text-emerald-950 text-lg">Task Details</h2>
              <button onClick={() => setSelectedTask(null)} className="p-2 bg-emerald-100 rounded-full text-emerald-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-bold text-2xl text-emerald-950 mb-1">{selectedTask.name}</h3>
              <p className="text-emerald-600 mb-6">{selectedTask.location}</p>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-2 text-red-500 font-bold mb-2">
                  <AlertTriangle className="w-5 h-5" /> High Risk Target
                </div>
                <p className="text-sm text-emerald-800">AI Agents have flagged this facility for priority inspection due to severe hygiene violations and related customer complaints.</p>
              </div>

              <h4 className="font-bold text-emerald-800 font-mono uppercase text-sm mb-4">Evidence Trail</h4>
              <div className="relative pl-6 border-l border-emerald-200 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-50 border-2 border-red-500"></div>
                  <p className="text-xs font-mono text-emerald-600 mb-1">09:14 AM</p>
                  <p className="text-sm font-semibold text-red-500">Vision Agent Flag</p>
                  <p className="text-xs text-emerald-800 mt-1">Cross-contamination risk detected on prep station 2 (91% conf)</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-50 border-2 border-amber-500"></div>
                  <p className="text-xs font-mono text-emerald-600 mb-1">08:45 AM</p>
                  <p className="text-sm font-semibold text-amber-500">Complaint Intelligence</p>
                  <p className="text-xs text-emerald-800 mt-1">2 new critical reviews citing food poisoning linked to this location.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-emerald-200 pb-10">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="w-full bg-brand-green hover:bg-emerald-500 text-navy-900 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-green/20"
              >
                <Play className="w-5 h-5" fill="currentColor" /> Start Ground Inspection
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
