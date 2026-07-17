import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, AlertTriangle } from 'lucide-react';
import { KITCHENS } from '../mockData/kitchens';

export default function MapTab() {
  const [selectedPin, setSelectedPin] = useState<any>(null);

  // Approximate relative coordinates for dummy map layout
  const mapLayout = [
    { ...KITCHENS[0], x: 30, y: 40 },
    { ...KITCHENS[1], x: 25, y: 55 },
    { ...KITCHENS[2], x: 60, y: 60 },
    { ...KITCHENS[3], x: 35, y: 30 },
    { ...KITCHENS[4], x: 85, y: 45 },
    { ...KITCHENS[5], x: 45, y: 20 },
    { ...KITCHENS[6], x: 28, y: 45 },
    { ...KITCHENS[7], x: 25, y: 35 },
  ];

  return (
    <div className="w-full h-[600px] glass-panel relative overflow-hidden flex bg-emerald-50 border border-emerald-200 shadow-xl">
      {/* Background stylized grid to look like a map */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1E8A5F 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <MapPin className="w-[500px] h-[500px]" />
      </div>

      {/* Map Labels */}
      <div className="absolute top-4 left-4 z-0 text-emerald-500 font-mono text-xs font-bold tracking-widest uppercase">Maha FDA Jurisdiction Map</div>

      {/* Pins */}
      {mapLayout.map((k, i) => (
        <motion.div
          key={k.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
          style={{ left: `${k.x}%`, top: `${k.y}%` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, type: 'spring' }}
          onClick={() => setSelectedPin(k)}
        >
          {k.status === 'critical' && (
            <motion.div 
              className="absolute inset-0 bg-red-500 rounded-full z-0"
              animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <div className={`relative z-10 w-6 h-6 rounded-full border-2 border-navy-900 shadow-lg flex items-center justify-center ${
            k.status === 'critical' ? 'bg-red-500' : k.status === 'warning' ? 'bg-brand-saffron' : 'bg-brand-green'
          }`}>
            <span className="sr-only">{k.name}</span>
          </div>
        </motion.div>
      ))}

      {/* Side Panel for Selected Pin */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl border-l border-emerald-200 p-6 shadow-2xl z-20 flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-emerald-950 text-lg">{selectedPin.name}</h3>
                <p className="text-sm text-emerald-600">{selectedPin.location}</p>
                <span className="inline-block mt-2 text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">{selectedPin.type}</span>
              </div>
              <button onClick={() => setSelectedPin(null)} className="text-emerald-600 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-600 text-sm">Risk Score</span>
                <span className={`font-bold font-mono text-lg ${
                  selectedPin.riskScore > 80 ? 'text-red-500' : selectedPin.riskScore > 50 ? 'text-emerald-600' : 'text-brand-green'
                }`}>{selectedPin.riskScore}/100</span>
              </div>
              
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-600 text-sm">Compliance</span>
                <span className="font-bold font-mono text-lg text-emerald-900">{selectedPin.compliance}%</span>
              </div>
              
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-600 text-sm">Last Inspection</span>
                <span className="font-mono text-sm text-emerald-800">{selectedPin.lastInspection}</span>
              </div>

              {selectedPin.status === 'critical' && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mt-4">
                  <div className="flex items-center gap-2 text-red-400 mb-2 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" /> Priority Actions
                  </div>
                  <ul className="text-xs text-emerald-800 list-disc pl-4 space-y-1">
                    <li>Immediate ground inspection required</li>
                    <li>Verify hygiene protocols</li>
                    <li>Check supplier logs for Batch X</li>
                  </ul>
                </div>
              )}
            </div>

            <button className={`w-full mt-auto text-emerald-950 text-sm font-bold py-3 rounded transition-colors ${
              selectedPin.status === 'critical' ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-saffron hover:bg-amber-600 text-navy-900'
            }`}>
              {selectedPin.status === 'critical' ? 'Dispatch Priority Inspector' : 'Schedule Routine Audit'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
