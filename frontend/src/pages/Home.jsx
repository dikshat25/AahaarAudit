
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, BrainCircuit, Activity, Database, CheckCircle, ShieldCheck } from 'lucide-react';
import GovHeader from '../components/GovHeader';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0A2647] flex flex-col font-sans">
      <GovHeader />

      {/* Header / primary nav */}
      <header className="border-b border-[#0A2647]/10 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full gov-emblem-ring flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#0A2647]" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-[#0A2647] leading-none">AAHAAR-AUDIT</h1>
            <p className="text-[10px] font-mono text-[#7A1220] uppercase tracking-[0.15em] mt-0.5"> Regulatory Intelligence</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 font-medium text-[#0A2647]/70">
          <a href="#features" className="hover:text-[#0A2647] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#0A2647] transition-colors">How it Works</a>
          <a href="#about" className="hover:text-[#0A2647] transition-colors">About</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="font-bold text-[#0A2647]/80 hover:text-[#0A2647] transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="bg-[#0A2647] hover:bg-[#153C6E] text-white px-5 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-[#0A2647]/20">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1" id="main-content">
        <section className="relative overflow-hidden">
          {/* subtle tricolor diagonal wash, echoing the national-portal hero band */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            background: 'linear-gradient(115deg, #FF9933 0%, transparent 25%, transparent 75%, #128807 100%)'
          }} />
          <div className="max-w-6xl mx-auto px-6 py-20 text-center flex flex-col items-center relative">
            <h2 className="text-5xl md:text-7xl font-display font-bold text-[#0A2647] tracking-tight mb-6 max-w-4xl">
              AI-Powered Intelligence for <span className="text-[#1B7A3D]">Food Safety</span>
            </h2>
            <p className="text-lg md:text-xl text-[#0A2647]/70 max-w-2xl mb-4 leading-relaxed">
              Aahaar-Audit deploys 9 specialized AI agents to monitor, reason, and act on live evidence across state food supply chain, ensuring unparalleled regulatory compliance.
            </p>
            <p className="font-devanagari text-[#7A1220] font-semibold mb-10">
              सही अन्न. उत्तम जीवन. &nbsp;|&nbsp; सही भोजन. बेहतर जीवन.
            </p>
            <div className="flex gap-4">
              <Link to="/signup" className="bg-[#FF9933] hover:bg-amber-500 text-[#0A2647] px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-transform hover:scale-105 shadow-xl shadow-[#FF9933]/30">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-white py-24 border-y border-[#0A2647]/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-display font-bold text-[#0A2647] mb-4">Multi-Agent Architecture</h3>
              <p className="text-[#0A2647]/70 max-w-2xl mx-auto">Our platform doesn't just collect data. It deploys specialized AI agents that reason together to identify risks before they become public health crises.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-[#F6F5F1] border border-[#0A2647]/10 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#0A2647]/10 flex items-center justify-center mb-6">
                  <BrainCircuit className="w-6 h-6 text-[#0A2647]" />
                </div>
                <h4 className="text-xl font-bold text-[#0A2647] mb-3">Vision Intelligence</h4>
                <p className="text-[#0A2647]/70 leading-relaxed">Real-time CCTV analysis detects hygiene violations, PPE non-compliance, and cross-contamination instantly.</p>
              </div>
              <div className="p-8 rounded-2xl bg-[#F6F5F1] border border-[#0A2647]/10 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#0A2647]/10 flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6 text-[#1B7A3D]" />
                </div>
                <h4 className="text-xl font-bold text-[#0A2647] mb-3">Predictive Risk</h4>
                <p className="text-[#0A2647]/70 leading-relaxed">Machine learning models synthesize historical data, public reviews, and IoT streams to predict high-risk facilities.</p>
              </div>
              <div className="p-8 rounded-2xl bg-[#F6F5F1] border border-[#0A2647]/10 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#0A2647]/10 flex items-center justify-center mb-6">
                  <Database className="w-6 h-6 text-[#FF9933]" />
                </div>
                <h4 className="text-xl font-bold text-[#0A2647] mb-3">End-to-End Traceability</h4>
                <p className="text-[#0A2647]/70 leading-relaxed">Knowledge graph resolution tracks ingredient batches from supplier to plate, automating recall intelligence.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h3 className="text-2xl font-display font-bold text-[#0A2647] mb-12">Built for Modern Regulatory Authorities</h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-[#0A2647]/80 font-medium">
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#1B7A3D]"/> FSSAI Compliant Guidelines</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#1B7A3D]"/> Real-time IoT Integration</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#1B7A3D]"/> Automated Dossier Generation</div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A2647] py-12 text-emerald-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#FF9933]" />
            <span className="font-bold text-white text-lg tracking-tight">AAHAAR-AUDIT</span>
          </div>
          <div className="text-sm text-emerald-200/70 text-center">
            &copy; {new Date().getFullYear()} Hackathon Prototype.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-emerald-200/80 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-emerald-200/80 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-emerald-200/80 hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}