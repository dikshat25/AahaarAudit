import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Video, Clock, XCircle, CheckCircle } from 'lucide-react';

export default function LiveVisionTab() {
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [escalated, setEscalated] = useState(false);

  useEffect(() => {
    // Trigger alert after 3 seconds to show live inference
    const timer = setTimeout(() => {
      setAlertTriggered(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col items-center justify-center p-6 gap-8">
      
      {/* Video Feed Container */}
      <div className="w-full max-w-4xl glass-panel relative overflow-hidden aspect-video border border-emerald-300 shadow-2xl flex-shrink-0">
        
        {/* Mock Video Background (Subtle animated noise/gradient) */}
        <div className="absolute inset-0 bg-emerald-50 opacity-80" style={{ backgroundImage: 'radial-gradient(circle at center, #1A2333 0%, #0B1120 100%)' }}>
          <motion.div 
            className="absolute inset-0 opacity-10"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")', opacity: 0.15 }}
          />
        </div>

        {/* Live Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-emerald-50/90 backdrop-blur-sm px-3 py-1.5 rounded text-emerald-950 font-bold tracking-widest text-sm border border-red-500/30">
          <motion.div 
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          LIVE : KITCHEN-221 (DADAR)
        </div>

        {/* Timestamp */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-emerald-50/90 backdrop-blur-sm px-3 py-1.5 rounded text-emerald-800 font-mono text-sm border border-emerald-200">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleTimeString()}
        </div>

        {/* Base Bounding Boxes (Always there, jittering slightly) */}
        <motion.div 
          className="absolute border-2 border-brand-green/70 z-10"
          style={{ width: '15%', height: '40%', top: '30%', left: '20%' }}
          animate={{ x: [0, 2, -1, 0], y: [0, -1, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <div className="bg-brand-green/70 text-white text-[10px] font-bold px-1 absolute -top-4 left-0">Person 0.97</div>
        </motion.div>

        <motion.div 
          className="absolute border-2 border-brand-green/70 z-10"
          style={{ width: '8%', height: '15%', top: '65%', left: '45%' }}
          animate={{ x: [0, -1, 1, 0], y: [0, 1, -1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <div className="bg-brand-green/70 text-white text-[10px] font-bold px-1 absolute -top-4 left-0">Salad 0.88</div>
        </motion.div>

        {/* Triggered Bounding Boxes (Alert Condition) */}
        <AnimatePresence>
          {alertTriggered && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1, x: [0, 1, -1, 0], y: [0, -1, 1, 0] }}
              transition={{ duration: 0.4, x: { repeat: Infinity, duration: 0.4 }, y: { repeat: Infinity, duration: 0.3 } }}
              className="absolute border-2 border-red-500 z-10"
              style={{ width: '12%', height: '20%', top: '60%', left: '30%' }}
            >
              <div className="bg-red-500 text-white text-[10px] font-bold px-1 absolute -top-4 left-0">Raw Chicken 0.91</div>
              
              {/* Proximity line */}
              <div className="absolute top-1/2 -right-[50%] w-[50%] h-[2px] bg-red-500/50 border-t border-dashed border-red-500 flex items-center justify-center">
                <span className="bg-emerald-50 text-[8px] text-red-500 font-bold px-1 -mt-4">12cm</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Alert Card Bottom Area */}
      <div className="w-full max-w-4xl h-32 relative">
        <AnimatePresence>
          {alertTriggered && !escalated && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 bg-red-500/10 border border-red-500 rounded-xl p-4 flex items-center justify-between shadow-[0_0_30px_rgba(239,68,68,0.2)] backdrop-blur-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-red-500 font-bold text-lg">CRITICAL VIOLATION: Cross-Contamination Risk</h3>
                  <p className="text-emerald-800 text-sm">Vision Agent detected raw poultry within 12cm of ready-to-eat salad prep zone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setAlertTriggered(false)}
                  className="px-4 py-2 bg-white text-emerald-800 border border-emerald-200 rounded font-bold text-sm hover:bg-emerald-100 transition-colors"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => setEscalated(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-bold text-sm transition-colors shadow-lg"
                >
                  Escalate to Inspector
                </button>
              </div>
            </motion.div>
          )}

          {escalated && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-brand-green/10 border border-brand-green rounded-xl p-4 flex items-center justify-center gap-3 backdrop-blur-md"
            >
              <CheckCircle className="w-6 h-6 text-brand-green" />
              <h3 className="text-brand-green font-bold text-lg">Alert escalated to On-Duty Inspector (Rajesh K.)</h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
