import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Building2,
  CalendarCheck,
  ShieldCheck,
  Circle,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CHART_DATA } from '../mockData/chartData';
import { AGENTS } from '../mockData/agents';
import { MOCK_ALERTS } from '../mockData/alerts';

// ── Counter — unchanged logic, animates a number up to its target value ──
const Counter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
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

const RISK_SLICES = [
  { name: 'Critical', value: 12, color: '#8B1E1E' },
  { name: 'Warning', value: 28, color: '#9A5B0A' },
  { name: 'Compliant', value: 60, color: '#1B5E3F' },
];

// Reflects the 9-agent CrewAI/LangGraph architecture. Swap `name`/`role` to
// match the real shape of `AGENTS` from mockData once that's wired in —
// the count badge below already reads AGENTS.length where available.
const AGENT_ROSTER = [
  { name: 'Vision Inspection', role: 'CCTV feed → PPE & hygiene detection', status: 'active' },
  { name: 'Risk Prediction', role: 'Establishment risk scoring', status: 'active' },
  { name: 'Fraud Detection', role: 'Invoice & billing anomaly scan', status: 'active' },
  { name: 'Complaint Intelligence', role: 'Customer review analysis', status: 'active' },
  { name: 'Product Verification', role: 'Batch & expiry validation', status: 'active' },
  { name: 'Compliance Reasoning', role: 'FSSAI circular interpretation', status: 'active' },
  { name: 'Food Traceability', role: 'Supply-chain mapping', status: 'active' },
  { name: 'Geo-Risk Mapping', role: 'Ward-level risk clustering', status: 'idle' },
  { name: 'Alert Orchestration', role: 'Inspector task routing', status: 'active' },
];

export default function OverviewTab() {
  const [feed, setFeed] = useState<string[]>([]);

  // Simulate agent activity feed — unchanged logic
  useEffect(() => {
    const actions = [
      'Vision Inspection Agent flagged Kitchen #221 — gloves not detected',
      'Risk Prediction Agent updated score for Dadar Dark Store #58',
      'Fraud Detection Agent scanning invoice logs for Bandra Central',
      'Complaint Intelligence Agent analyzing 12 new reviews for Pune Express',
      'Product Verification Agent validating batch #4471 expiry',
      'Compliance Reasoning Agent processing latest FSSAI circular',
      'Food Traceability Agent mapping supply chain for Supplier Y',
    ];

    const addFeedItem = () => {
      const newAction = actions[Math.floor(Math.random() * actions.length)];
      setFeed((prev) => {
        const next = [`${new Date().toLocaleTimeString()} — ${newAction}`, ...prev];
        return next.slice(0, 5); // Keep last 5
      });
    };

    addFeedItem(); // initial
    const timer = setInterval(addFeedItem, 3500);
    return () => clearInterval(timer);
  }, []);

  const kpis = [
    { label: 'Establishments monitored', value: 18420, icon: Building2, trend: '+12%', up: true },
    { label: 'High-risk flags today', value: 63, icon: AlertTriangle, trend: '-5%', up: false },
    { label: 'Inspections scheduled', value: 214, icon: CalendarCheck, trend: '+18%', up: true },
    { label: 'Avg. compliance score', value: 82, suffix: '%', icon: TrendingUp, trend: '+2%', up: true },
  ];

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const agentCount = Array.isArray(AGENTS) && AGENTS.length ? AGENTS.length : AGENT_ROSTER.length;

  return (
    <div className="space-y-6 bg-[#F6F4EF] p-1">
      {/* Jurisdiction strip */}
      <div className="flex items-center justify-between border-b border-[#DCD9D2] pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#0B2545]" strokeWidth={1.5} />
          <div>
            <h2 className="font-serif text-lg text-[#0B2545] leading-tight">
              Maharashtra FDA — Food Safety Regulatory Intelligence
            </h2>
            <p className="text-xs text-slate-500">Aahaar-Audit · statewide monitoring, {today}</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 text-right hidden sm:block">
          <div>{agentCount} agents deployed</div>
          <div>FSSAI compliance cycle</div>
        </div>
      </div>

      {/* KPI ledger — one bordered panel, divided by rules, not four stacked cards */}
      <div className="bg-white border border-[#DCD9D2] rounded-sm flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[#E5E2D8]">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="flex-1 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">{kpi.label}</p>
              <kpi.icon className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-mono font-semibold text-[#0B2545] tabular-nums">
                <Counter value={kpi.value} suffix={kpi.suffix} />
              </h3>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  kpi.up ? 'text-[#1B5E3F]' : 'text-[#8B1E1E]'
                }`}
              >
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent roster + live activity */}
        <div className="bg-white border border-[#DCD9D2] rounded-sm p-5 flex flex-col lg:col-span-1">
          <h3 className="font-serif text-base text-[#0B2545] mb-3">Regulatory agents</h3>
          <div className="space-y-2 mb-5">
            {AGENT_ROSTER.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between text-sm py-1">
                <div>
                  <div className="text-slate-800">{agent.name}</div>
                  <div className="text-xs text-slate-400">{agent.role}</div>
                </div>
                <Circle
                  className={`w-2 h-2 ${agent.status === 'active' ? 'text-[#1B5E3F] fill-[#1B5E3F]' : 'text-slate-300 fill-slate-300'}`}
                />
              </div>
            ))}
          </div>

          <h3 className="font-serif text-base text-[#0B2545] mb-3 pt-3 border-t border-[#E5E2D8]">
            Live activity
          </h3>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-white pointer-events-none z-10" />
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {feed.map((item, idx) => {
                  const [time, ...rest] = item.split(' — ');
                  const text = rest.join(' — ');
                  return (
                    <motion.div
                      key={item + idx}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-sm border-l-2 border-[#E5E2D8] pl-3 py-1"
                    >
                      <div className="text-[11px] font-mono text-slate-400">{time}</div>
                      <div className="text-slate-700 leading-snug">{text}</div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white border border-[#DCD9D2] rounded-sm p-5 col-span-1 lg:col-span-2">
          <h3 className="font-serif text-base text-[#0B2545] mb-4">Platform intelligence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
            <div className="h-full">
              <p className="text-xs text-slate-500 mb-2">Compliance trend, last 30 days</p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B5E3F" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1B5E3F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#DCD9D2',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                    itemStyle={{ color: '#0B2545' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="compliance"
                    stroke="#1B5E3F"
                    strokeWidth={1.75}
                    fillOpacity={1}
                    fill="url(#colorComp)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="h-full flex flex-col">
              <p className="text-xs text-slate-500 mb-2">Risk distribution</p>
              <div className="flex-1 flex items-center gap-4">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie
                      data={RISK_SLICES}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {RISK_SLICES.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#DCD9D2',
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {RISK_SLICES.map((slice) => (
                    <div key={slice.name} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} />
                      {slice.name}
                      <span className="text-slate-400">{slice.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}