import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, Clock, Smartphone, Monitor } from 'lucide-react';
import OverviewTab from '../components/OverviewTab';
import AlertsTab from '../components/AlertsTab';
import TraceabilityTab from '../components/TraceabilityTab';
import MapTab from '../components/MapTab';
import InspectionsTab from '../components/InspectionsTab';
import ReportsTab from '../components/ReportsTab';
import LiveVisionTab from '../components/LiveVisionTab';
import InspectorMobileApp from '../components/InspectorMobileApp';
import ArchitectureTab from '../components/ArchitectureTab';

export default function Dashboard() {
  const [persona, setPersona] = useState('regulator');
  const [activeTab, setActiveTab] = useState('Overview');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tabs = ['Overview', 'Map View', 'Alerts', 'Traceability', 'Inspections', 'Reports', 'Live Vision', 'Architecture'];

  return (
    <div className="min-h-screen bg-emerald-50 text-emerald-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-emerald-200 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-bold tracking-tight text-emerald-950">AAHAAR-AUDIT</h1>
          <span className="text-xs font-mono text-emerald-600 mt-1 uppercase tracking-wider hidden md:block">Maha FDA Intelligence</span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Agent Status */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
            <div className="flex gap-1">
              {Array.from({length: 9}).map((_, i) => (
                <motion.div 
                  key={i} 
                  className="w-2 h-2 rounded-full bg-brand-green"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="text-sm font-mono text-brand-green ml-2">9 Agents Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-emerald-800">
            <Clock className="w-4 h-4 text-emerald-600" />
            {time}
          </div>

          {/* Persona Toggle */}
          <div className="flex bg-emerald-100 p-1 rounded-lg border border-emerald-200">
            <button 
              onClick={() => setPersona('regulator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${persona === 'regulator' ? 'bg-navy-600 text-emerald-950 shadow' : 'text-emerald-600 hover:text-emerald-900'}`}
            >
              <Monitor className="w-4 h-4" /> Regulator
            </button>
            <button 
              onClick={() => setPersona('inspector')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${persona === 'inspector' ? 'bg-navy-600 text-emerald-950 shadow' : 'text-emerald-600 hover:text-emerald-900'}`}
            >
              <Smartphone className="w-4 h-4" /> Inspector
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {persona === 'regulator' ? (
          <div className="w-full flex flex-col">
            {/* Sub-nav tabs */}
            <nav className="flex gap-1 px-6 pt-4 border-b border-emerald-200/50 overflow-x-auto hide-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'border-brand-saffron text-emerald-950' : 'border-transparent text-emerald-600 hover:text-emerald-900'}`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="flex-1 overflow-auto p-6 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeTab === 'Overview' && <OverviewTab />}
                  {activeTab === 'Map View' && <MapTab />}
                  {activeTab === 'Alerts' && <AlertsTab />}
                  {activeTab === 'Traceability' && <TraceabilityTab />}
                  {activeTab === 'Inspections' && <InspectionsTab />}
                  {activeTab === 'Reports' && <ReportsTab />}
                  {activeTab === 'Live Vision' && <LiveVisionTab />}
                  {activeTab === 'Architecture' && <ArchitectureTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center p-4 sm:p-8 bg-emerald-50/80 overflow-y-auto">
            <InspectorMobileApp />
          </div>
        )}
      </main>
    </div>
  );
}

