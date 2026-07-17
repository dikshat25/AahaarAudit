import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Zap, FileText, FileSignature, MessageSquare, History, BrainCircuit } from 'lucide-react';

export default function EvidenceFusionVisual() {
  const sources = [
    { name: 'CCTV / Vision', icon: Camera, color: '#1E8A5F' },
    { name: 'IoT Sensors', icon: Zap, color: '#F5A623' },
    { name: 'Inventory & Invoices', icon: FileText, color: '#3B82F6' },
    { name: 'FSSAI Records', icon: FileSignature, color: '#8B5CF6' },
    { name: 'Customer Reviews', icon: MessageSquare, color: '#EC4899' },
    { name: 'Inspection History', icon: History, color: '#6366F1' },
  ];

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-white/80 rounded-xl border border-emerald-200 overflow-hidden glass-panel">
      {/* Central Node */}
      <div className="absolute z-10 flex flex-col items-center">
        <motion.div 
          className="w-24 h-24 rounded-full bg-brand-saffron/20 border-2 border-brand-saffron flex items-center justify-center relative shadow-[0_0_30px_rgba(245,166,35,0.3)]"
          animate={{ boxShadow: ['0 0 30px rgba(245,166,35,0.3)', '0 0 50px rgba(245,166,35,0.6)', '0 0 30px rgba(245,166,35,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <BrainCircuit className="w-10 h-10 text-emerald-600" />
          {/* Output to final decision */}
          <motion.div 
            className="absolute -bottom-24 w-1 bg-brand-saffron"
            initial={{ height: 0 }}
            animate={{ height: 60 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
        <div className="mt-3 text-center">
          <p className="font-bold text-emerald-950 tracking-wide">Multi-Agent Reasoning</p>
          <p className="text-xs text-emerald-600 font-mono">9 AGENTS ACTIVE</p>
        </div>
      </div>

      {/* Final Decision Node */}
      <div className="absolute bottom-4 flex flex-col items-center z-10">
        <div className="px-4 py-2 bg-emerald-100 border border-brand-saffron rounded-lg text-center">
          <p className="text-[10px] uppercase text-emerald-600 font-bold tracking-wider">Unified Decision</p>
          <p className="text-xl font-bold text-emerald-950">Live Risk Score</p>
        </div>
      </div>

      {/* Source Nodes */}
      {sources.map((source, i) => {
        const angle = (i * Math.PI * 2) / sources.length;
        const radius = 150;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius - 40;

        return (
          <div 
            key={source.name} 
            className="absolute flex flex-col items-center z-10"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center relative shadow-lg">
              <source.icon className="w-5 h-5 text-emerald-800" style={{ color: source.color }} />
            </div>
            <p className="mt-2 text-xs text-emerald-800 font-medium whitespace-nowrap">{source.name}</p>
          </div>
        );
      })}

      {/* Animated Connecting Lines (Particles) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5A623" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="80" fill="url(#centerGlow)" />
        {sources.map((source, i) => {
          const angle = (i * Math.PI * 2) / sources.length;
          const r1 = 150;
          const x1 = Math.cos(angle) * r1;
          const y1 = Math.sin(angle) * r1 - 40;
          
          return (
            <g key={i}>
              <line 
                x1={`calc(50% + ${x1}px)`} 
                y1={`calc(50% + ${y1}px)`} 
                x2="50%" 
                y2="50%" 
                stroke={source.color} 
                strokeWidth="1" 
                strokeDasharray="4 4"
                opacity="0.3" 
              />
              <motion.circle 
                r="3" 
                fill={source.color}
                initial={{ 
                  cx: `calc(50% + ${x1}px)`, 
                  cy: `calc(50% + ${y1}px)`,
                  opacity: 0
                }}
                animate={{ 
                  cx: '50%', 
                  cy: '50%',
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
