import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, FileText, BarChart2, MessageSquare, AlertTriangle, Crosshair, ChevronRight, Clock } from 'lucide-react';
import { MOCK_ALERTS } from '../mockData/alerts';
import type { Alert } from '../mockData/alerts';
import clsx from 'clsx';

const AlertIcon = ({ type, color }: { type: string, color: string }) => {
  switch(type) {
    case 'vision': return <Camera className={`w-5 h-5 ${color}`} />;
    case 'document': return <FileText className={`w-5 h-5 ${color}`} />;
    case 'chart': return <BarChart2 className={`w-5 h-5 ${color}`} />;
    case 'review': return <MessageSquare className={`w-5 h-5 ${color}`} />;
    default: return <AlertTriangle className={`w-5 h-5 ${color}`} />;
  }
};

const EvidenceThumbnail = ({ alert }: { alert: Alert }) => {
  if (alert.evidenceType === 'vision') {
    return (
      <div className="w-24 h-24 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-center relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMxMTE4MjciPjwvcmVjdD48cGF0aCBkPSJNMCAwTDQgNFpNMyAxTDQgMlptMCAyTDEgM1oiIHN0cm9rZT0iIzFBMjMzMyIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+PC9zdmc+')] opacity-50"></div>
        {/* Mock bounding box */}
        <div className="absolute border border-red-500 w-12 h-14 top-2 left-6 bg-red-500/10">
          <div className="bg-red-500 text-white text-[8px] font-bold px-1 absolute -top-3 -left-[1px] whitespace-nowrap">Person 0.94</div>
        </div>
        <Crosshair className="w-4 h-4 text-red-500/50" />
      </div>
    );
  }
  if (alert.evidenceType === 'document') {
    return (
      <div className="w-24 h-24 bg-emerald-50 border border-emerald-200 rounded p-2 flex flex-col justify-center text-[8px] font-mono leading-tight flex-shrink-0">
        <span className="text-emerald-500 border-b border-emerald-200 pb-1 mb-1 block">Expected: <br/><span className="text-brand-green">{alert.evidenceData?.claimed}</span></span>
        <span className="text-emerald-500">Scanned: <br/><span className="text-red-500">{alert.evidenceData?.observed}</span></span>
      </div>
    );
  }
  if (alert.evidenceType === 'chart') {
    return (
      <div className="w-24 h-24 bg-emerald-50 border border-emerald-200 rounded p-2 flex flex-col justify-end gap-1 flex-shrink-0 pb-3">
        <div className="flex items-end justify-center gap-3 h-full pt-4">
          <div className="w-4 bg-brand-green/80 h-full relative rounded-sm"><span className="absolute -top-4 text-[8px] text-brand-green w-full text-center">500</span></div>
          <div className="w-4 bg-red-500/80 h-[25%] relative rounded-sm"><span className="absolute -top-4 text-[8px] text-red-500 w-full text-center">120</span></div>
        </div>
      </div>
    );
  }
  if (alert.evidenceType === 'review') {
    return (
      <div className="w-24 h-24 bg-emerald-50 border border-emerald-200 rounded p-2 flex flex-col gap-1 overflow-hidden flex-shrink-0">
        <div className="flex justify-between items-center">
          <span className="text-[8px] bg-red-500/20 text-red-400 px-1 py-0.5 rounded font-bold">{alert.evidenceData?.sentiment}</span>
        </div>
        <span className="text-[9px] text-emerald-800 italic leading-tight mt-1">
          {alert.evidenceData?.snippet}
        </span>
      </div>
    );
  }
  return null;
}

import { fetchAlerts } from '../api/backendApi';

export default function AlertsTab() {
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      const data = await fetchAlerts();
      if (Array.isArray(data)) {
        setLiveAlerts(data);
      }
    };
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full gap-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-bold text-emerald-950">Live Alert Feed</h2>
          <p className="text-xs text-emerald-700">Real-time alerts synced from AI Vision Ingestion & FastAPI database</p>
        </div>
        <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full animate-pulse">
          ● {liveAlerts.length} Live FastAPI Alerts | {MOCK_ALERTS.length} System Flags
        </span>
      </div>

      {/* Live backend alerts section */}
      {liveAlerts.length > 0 && (
        <div className="space-y-3 mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span> Live Ingestion Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveAlerts.map((la: any) => (
              <div
                key={la.alert_id}
                className="bg-red-50/80 border-2 border-red-200 rounded-xl p-4 shadow-sm hover:border-red-400 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    EST: {la.establishment_id}
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    {new Date(la.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="font-bold text-red-900 text-sm mt-2">{la.message}</h4>
                <p className="text-xs text-red-700 mt-1">Severity: <span className="font-bold uppercase">{la.severity}</span> | ID: {la.alert_id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
        {MOCK_ALERTS.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-4 cursor-pointer group hover:bg-emerald-100/90 transition-all hover:shadow-xl hover:border-emerald-300"
            onClick={() => setSelectedAlert(alert)}
          >
            <div className="flex gap-4">
              <EvidenceThumbnail alert={alert} />
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider">{alert.agentName}</span>
                  <span className="text-xs text-emerald-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-red-400 font-semibold text-sm mb-1">{alert.type}</h4>
                <p className="text-emerald-800 text-xs mb-2 line-clamp-2 leading-relaxed">{alert.description}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 truncate max-w-[150px]">
                    📍 {alert.location}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-500">Risk {alert.riskScore}</span>
                    <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Evidence Trail Modal Overlay */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-50/90 backdrop-blur-sm"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-panel w-full max-w-lg p-6 bg-white"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-emerald-950">Evidence Trail</h3>
                <button onClick={() => setSelectedAlert(null)} className="text-emerald-600 hover:text-white">&times;</button>
              </div>
              
              {/* Timeline */}
              <div className="relative pl-6 border-l border-emerald-200 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-100 border-2 border-brand-saffron"></div>
                  <p className="text-xs font-mono text-emerald-600 mb-1">{new Date(new Date(selectedAlert.timestamp).getTime() - 1000 * 60 * 2).toLocaleTimeString()}</p>
                  <p className="text-sm font-semibold text-emerald-600">{selectedAlert.agentName} activated</p>
                  <p className="text-xs text-emerald-600 mt-1">Began processing stream from {selectedAlert.location}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-100 border-2 border-red-500"></div>
                  <p className="text-xs font-mono text-emerald-600 mb-1">{new Date(selectedAlert.timestamp).toLocaleTimeString()}</p>
                  <p className="text-sm font-semibold text-red-500">Anomaly Detected ({selectedAlert.confidence * 100}% conf)</p>
                  <p className="text-xs text-emerald-800 mt-1">{selectedAlert.description}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-100 border-2 border-brand-green"></div>
                  <p className="text-xs font-mono text-emerald-600 mb-1">Just now</p>
                  <p className="text-sm font-semibold text-brand-green">Risk Prediction Agent updated score</p>
                  <p className="text-xs text-emerald-600 mt-1">Overall risk score for {selectedAlert.location} raised to {selectedAlert.riskScore}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
