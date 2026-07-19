import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, ArrowRight, Package, Truck, Store, AlertTriangle, ArrowDown } from 'lucide-react';

export default function TraceabilityTab() {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!query) return;
    setIsSearching(true);
    setShowResults(false);
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
    }, 1200);
  };

  const presetQuery = "Show all kitchens using Batch X from Supplier Y stored above safe temperature, with linked complaints";

  const nodes = [
    { id: 'supplier', label: 'Supplier Y', icon: Truck, type: 'source' },
    { id: 'ingredient', label: 'Paneer Batch X', icon: Package, type: 'item' },
    { id: 'kitchen1', label: 'Nashik Fresh Bites', icon: Store, type: 'target' },
    { id: 'kitchen2', label: 'Pune Express', icon: Store, type: 'target' },
    { id: 'alert', label: 'Temp Violation + Complaints', icon: AlertTriangle, type: 'alert' }
  ];

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">
      {/* Search Header */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-emerald-950 mb-4">Food Traceability Agent</h2>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-emerald-600" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-emerald-200 rounded-lg bg-white text-emerald-900 placeholder-slate-500 focus:outline-none focus:border-brand-saffron focus:ring-1 focus:ring-brand-saffron transition-colors"
            placeholder="Ask natural language query (e.g., 'Trace milk batch #123...')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            className="absolute inset-y-1 right-1 bg-brand-saffron hover:bg-amber-500 text-navy-900 font-bold px-4 rounded-md transition-colors"
          >
            Run Query
          </button>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <button 
            onClick={() => setQuery(presetQuery)}
            className="text-xs bg-emerald-100 hover:bg-navy-600 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
          >
            Example: Batch X Complaints
          </button>
          <button 
            onClick={() => setQuery("Identify origin of expired flour found at Dadar Dark Store")}
            className="text-xs bg-emerald-100 hover:bg-navy-600 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
          >
            Example: Flour Origin
          </button>
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 glass-panel p-6 flex flex-col relative overflow-hidden min-h-[400px]">
        {isSearching && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-50/80 backdrop-blur-sm z-10">
            <Database className="w-8 h-8 text-emerald-600 animate-bounce mb-4" />
            <p className="text-emerald-600 font-mono animate-pulse">Querying Knowledge Graph...</p>
          </div>
        )}

        {!showResults && !isSearching && (
          <div className="flex-1 flex items-center justify-center text-emerald-500 font-mono">
            Enter a query to generate traceability graph
          </div>
        )}

        {showResults && (
          <div className="flex-1 flex flex-col items-center justify-center pt-8">
            {/* Simple Tree Visualization */}
            <div className="relative flex flex-col items-center">
              
              {/* Supplier Node */}
              <motion.div 
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0 }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-slate-400 flex items-center justify-center shadow-lg">
                  <Truck className="w-8 h-8 text-emerald-800" />
                </div>
                <p className="mt-2 font-bold text-emerald-900">Supplier Y</p>
              </motion.div>

              <motion.div initial={{ height: 0 }} animate={{ height: 40 }} transition={{ delay: 0.3 }} className="w-0.5 bg-brand-saffron/50 my-2" />

              {/* Batch Node */}
              <motion.div 
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-brand-saffron flex items-center justify-center shadow-lg shadow-brand-saffron/20">
                  <Package className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="mt-2 font-bold text-emerald-600">Batch X (Paneer)</p>
              </motion.div>

              <div className="flex w-64 justify-between mt-2 mb-2 relative">
                <motion.div initial={{ width: 0 }} animate={{ width: '50%' }} transition={{ delay: 0.9 }} className="absolute top-0 right-1/2 h-0.5 bg-brand-green/50 origin-right" />
                <motion.div initial={{ width: 0 }} animate={{ width: '50%' }} transition={{ delay: 0.9 }} className="absolute top-0 left-1/2 h-0.5 bg-red-500/50 origin-left" />
                <motion.div initial={{ height: 0 }} animate={{ height: 30 }} transition={{ delay: 1.1 }} className="absolute top-0 left-0 w-0.5 bg-brand-green/50" />
                <motion.div initial={{ height: 0 }} animate={{ height: 30 }} transition={{ delay: 1.1 }} className="absolute top-0 right-0 w-0.5 bg-red-500/50" />
              </div>
              <div className="h-[30px]" /> {/* Spacer */}

              {/* Kitchen Nodes */}
              <div className="flex w-80 justify-between z-10">
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-brand-green flex items-center justify-center shadow-lg">
                    <Store className="w-8 h-8 text-brand-green" />
                  </div>
                  <p className="mt-2 font-bold text-emerald-900 text-sm">Pune Express</p>
                  <p className="text-xs text-brand-green">Safe Temp</p>
                </motion.div>
                
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    <Store className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="mt-2 font-bold text-emerald-900 text-sm">Nashik Fresh Bites</p>
                  <p className="text-xs text-red-500 font-bold flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Temp Violation</p>
                </motion.div>
              </div>

            </div>

            {/* Results Summary Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0 }}
              className="mt-12 bg-white border border-red-500/30 rounded-lg p-4 w-full max-w-2xl"
            >
              <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Root Cause Identified</h4>
              <p className="text-sm text-emerald-800">
                Batch X was dispatched from Supplier Y on Oct 10. Nashik Fresh Bites reported a freezer failure on Oct 11, matching the timeline of 4 customer complaints for food poisoning. Pune Express maintained safe storage and has no related complaints.
              </p>
              <div className="mt-3 flex gap-2">
                <button className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors">Issue Recall Notice</button>
                <button className="bg-emerald-100 hover:bg-navy-600 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded border border-emerald-200 transition-colors">Schedule Inspection</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
