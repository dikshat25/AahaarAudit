import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, Clock, Smartphone, Monitor, LayoutGrid, Map as MapIcon, Bell, GitBranch, ClipboardList, FileText, Video, Cpu } from 'lucide-react';
import GovHeader from '../components/GovHeader';
import OverviewTab from '../components/OverviewTab';
import AlertsTab from '../components/AlertsTab';
import TraceabilityTab from '../components/TraceabilityTab';
import MapTab from '../components/MapTab';
import InspectionsTab from '../components/InspectionsTab';
import ReportsTab from '../components/ReportsTab';
import LiveVisionTab from '../components/LiveVisionTab';
import InspectorMobileApp from '../components/InspectorMobileApp';
import ArchitectureTab from '../components/ArchitectureTab';
import ChatbotWidget from '../components/ChatbotWidget';

const TABS = [
  { name: 'Overview', icon: LayoutGrid },
  { name: 'Map View', icon: MapIcon },
  { name: 'Alerts', icon: Bell },
  { name: 'Traceability', icon: GitBranch },
  { name: 'Inspections', icon: ClipboardList },
  { name: 'Reports', icon: FileText },
  { name: 'Live Vision', icon: Video },
  { name: 'Architecture', icon: Cpu },
];

export default function Dashboard() {
  const [persona, setPersona] = useState('regulator');
  const [activeTab, setActiveTab] = useState('Overview');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0A2647] flex flex-col font-sans">
      <GovHeader />

      {/* Header */}
      <header className="relative border-b border-[#0A2647]/10 gov-navbar px-6 py-4 flex items-center justify-between sticky top-0 z-50 overflow-hidden">
        {/* subtle animated tricolor sheen sweeping across the header */}
        <motion.div
          className="absolute inset-y-0 w-1/3 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,153,51,0.10), rgba(19,136,7,0.10), transparent)' }}
          animate={{ left: ['-33%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full gov-emblem-ring flex items-center justify-center"
            whileHover={{ scale: 1.08, rotate: 8 }}
          >
            <Shield className="w-5 h-5 text-[#0A2647]" />
          </motion.div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-white leading-none">AAHAAR-AUDIT</h1>
            <span className="text-[10px] font-mono text-[#FF9933] uppercase tracking-wider hidden md:block">Intelligence</span>
          </div>
        </div>

        <div className="relative flex items-center gap-6">
          {/* Agent Status */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15">
            <div className="flex gap-1">
              {Array.from({length: 9}).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#1B7A3D]"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="text-sm font-mono text-emerald-100 ml-2">9 Agents Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-emerald-100">
            <Clock className="w-4 h-4 text-[#FF9933]" />
            {time}
          </div>

          {/* Persona Toggle */}
          <div className="flex bg-white/10 p-1 rounded-lg border border-white/15 relative">
            {['regulator', 'inspector'].map((p) => (
              <button
                key={p}
                onClick={() => setPersona(p)}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors z-10"
              >
                {persona === p && (
                  <motion.span
                    layoutId="persona-pill"
                    className="absolute inset-0 bg-[#FF9933] rounded-md -z-10 shadow"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={persona === p ? 'flex items-center gap-2 text-[#0A2647] font-bold' : 'flex items-center gap-2 text-emerald-100 hover:text-white'}>
                  {p === 'regulator' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  {p === 'regulator' ? 'Regulator' : 'Inspector'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden" id="main-content">
        {persona === 'regulator' ? (
          <div className="w-full flex flex-col">
            {/* Sub-nav tabs — animated sliding pill indicator */}
            <nav className="flex gap-1 px-6 pt-4 pb-1 border-b border-[#0A2647]/10 overflow-x-auto hide-scrollbar bg-white">
              {TABS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => setActiveTab(name)}
                  className="relative px-4 py-2.5 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 text-sm"
                >
                  {activeTab === name && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute inset-x-1 bottom-0 h-[2.5px] bg-[#FF9933] rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 ${activeTab === name ? 'text-[#0A2647]' : 'text-[#0A2647]/40'}`} />
                  <span className={activeTab === name ? 'text-[#0A2647]' : 'text-[#0A2647]/50 hover:text-[#0A2647]'}>
                    {name}
                  </span>
                </button>
              ))}
            </nav>

            <div className="flex-1 overflow-auto p-6 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
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
          <div className="w-full flex items-center justify-center p-4 sm:p-8 bg-[#F6F5F1] overflow-y-auto">
            <InspectorMobileApp />
          </div>
        )}
      </main>

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}