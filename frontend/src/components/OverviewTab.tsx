import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, Building2, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CHART_DATA } from '../mockData/chartData';
import { AGENTS } from '../mockData/agents';
import { MOCK_ALERTS } from '../mockData/alerts';
import EvidenceFusionVisual from './EvidenceFusionVisual';

// Counter component for KPIs
const Counter = ({ value, suffix = '' }: { value: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1s
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

export default function OverviewTab() {
  const [feed, setFeed] = useState<string[]>([]);

  // Simulate agent activity feed
  useEffect(() => {
    const actions = [
      "Vision Inspection Agent flagged Kitchen #221 — gloves not detected",
      "Risk Prediction Agent updated score for Dadar Dark Store #58",
      "Fraud Detection Agent scanning invoice logs for Bandra Central",
      "Complaint Intelligence Agent analyzing 12 new reviews for Pune Express",
      "Product Verification Agent validating batch #4471 expiry",
      "Compliance Reasoning Agent processing latest FSSAI circular",
      "Food Traceability Agent mapping supply chain for Supplier Y",
    ];
    
    const addFeedItem = () => {
      const newAction = actions[Math.floor(Math.random() * actions.length)];
      setFeed(prev => {
        const next = [`${new Date().toLocaleTimeString()} - ${newAction}`, ...prev];
        return next.slice(0, 5); // Keep last 5
      });
    };
    
    addFeedItem(); // initial
    const timer = setInterval(addFeedItem, 3500);
    return () => clearInterval(timer);
  }, []);

  const kpis = [
    { label: 'Establishments Monitored', value: 18420, icon: Building2, color: 'text-emerald-600', trend: '+12%' },
    { label: 'High-Risk Flags Today', value: 63, icon: AlertTriangle, color: 'text-risk-high', trend: '-5%' },
    { label: 'Inspections Scheduled', value: 214, icon: Activity, color: 'text-brand-green', trend: '+18%' },
    { label: 'Avg. Compliance Score', value: 82, suffix: '%', icon: TrendingUp, color: 'text-emerald-900', trend: '+2%' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-5 flex flex-col justify-between group hover:-translate-y-1 transition-transform"
          >
            <div className="flex justify-between items-start">
              <p className="text-sm text-emerald-600 font-medium">{kpi.label}</p>
              <kpi.icon className={`w-5 h-5 ${kpi.color} opacity-80`} />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-3xl font-mono font-bold text-emerald-950">
                <Counter value={kpi.value} suffix={kpi.suffix} />
              </h3>
              <span className={`text-xs font-bold ${kpi.trend.startsWith('+') ? 'text-brand-green' : 'text-risk-high'}`}>
                {kpi.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hero Visual */}
      <div className="w-full">
        <EvidenceFusionVisual />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Activity Feed */}
        <div className="glass-panel p-5 flex flex-col">
          <h3 className="text-lg font-bold text-emerald-950 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-green" /> Agent Activity Log
          </h3>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 pointer-events-none z-10 top-2/3" />
            <div className="space-y-3">
              <AnimatePresence>
                {feed.map((item, idx) => {
                  const [time, ...rest] = item.split(' - ');
                  const text = rest.join(' - ');
                  return (
                    <motion.div
                      key={item + idx}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0 }}
                      className="text-sm bg-emerald-50/80 p-2.5 rounded border border-emerald-200/50"
                    >
                      <span className="text-xs font-mono text-emerald-500 mr-2">{time}</span>
                      <span className="text-emerald-800">{text}</span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="glass-panel p-5 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold text-emerald-950 mb-4">Platform Intelligence Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
            <div className="h-full">
              <p className="text-xs text-emerald-600 mb-2 font-mono uppercase">Compliance Trend (30 Days)</p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E8A5F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1E8A5F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#a7f3d0', borderRadius: '8px' }}
                    itemStyle={{ color: '#022c22' }}
                  />
                  <Area type="monotone" dataKey="compliance" stroke="#1E8A5F" fillOpacity={1} fill="url(#colorComp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="h-full flex flex-col items-center justify-center relative">
              <p className="text-xs text-emerald-600 mb-2 font-mono uppercase absolute top-0 left-0">Risk Distribution</p>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Critical', value: 12, color: '#EF4444' },
                      { name: 'Warning', value: 28, color: '#F59E0B' },
                      { name: 'Compliant', value: 60, color: '#22C55E' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {[
                      { name: 'Critical', value: 12, color: '#EF4444' },
                      { name: 'Warning', value: 28, color: '#F59E0B' },
                      { name: 'Compliant', value: 60, color: '#22C55E' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#a7f3d0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
