import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, BrainCircuit, Activity, Database, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-emerald-50 text-emerald-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-emerald-200 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-bold tracking-tight text-emerald-950">AAHAAR-AUDIT</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6 font-medium text-emerald-700">
          <a href="#features" className="hover:text-emerald-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-emerald-900 transition-colors">How it Works</a>
          <a href="#about" className="hover:text-emerald-900 transition-colors">About</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-900 transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-600/20">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-medium text-sm mb-8 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> FDA Modernization Initiative
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-emerald-950 tracking-tight mb-6 max-w-4xl">
            AI-Powered Intelligence for <span className="text-emerald-600">Food Safety</span>
          </h2>
          <p className="text-lg md:text-xl text-emerald-700 max-w-2xl mb-10 leading-relaxed">
            Aahaar-Audit deploys 9 specialized AI agents to monitor, reason, and act on live evidence across Maharashtra's food supply chain, ensuring unparalleled regulatory compliance.
          </p>
          <div className="flex gap-4">
            <Link to="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-transform hover:scale-105 shadow-xl shadow-emerald-600/20">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#demo" className="bg-white border border-emerald-200 hover:border-emerald-300 text-emerald-900 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-colors shadow-sm">
              View Demo
            </a>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-white py-24 border-y border-emerald-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-emerald-950 mb-4">Multi-Agent Architecture</h3>
              <p className="text-emerald-700 max-w-2xl mx-auto">Our platform doesn't just collect data. It deploys specialized AI agents that reason together to identify risks before they become public health crises.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-200 flex items-center justify-center mb-6">
                  <BrainCircuit className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-emerald-950 mb-3">Vision Intelligence</h4>
                <p className="text-emerald-700 leading-relaxed">Real-time CCTV analysis detects hygiene violations, PPE non-compliance, and cross-contamination instantly.</p>
              </div>
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-200 flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-emerald-950 mb-3">Predictive Risk</h4>
                <p className="text-emerald-700 leading-relaxed">Machine learning models synthesize historical data, public reviews, and IoT streams to predict high-risk facilities.</p>
              </div>
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-200 flex items-center justify-center mb-6">
                  <Database className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-emerald-950 mb-3">End-to-End Traceability</h4>
                <p className="text-emerald-700 leading-relaxed">Knowledge graph resolution tracks ingredient batches from supplier to plate, automating recall intelligence.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h3 className="text-2xl font-bold text-emerald-950 mb-12">Built for Modern Regulatory Authorities</h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-emerald-700 font-medium">
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500"/> FSSAI Compliant Guidelines</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500"/> Real-time IoT Integration</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500"/> Automated Dossier Generation</div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 py-12 text-emerald-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-500" />
            <span className="font-bold text-white text-lg tracking-tight">AAHAAR-AUDIT</span>
          </div>
          <div className="text-sm text-emerald-400">
            &copy; {new Date().getFullYear()} Aahaar-Audit Intelligence Platform. Hackathon Prototype.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
