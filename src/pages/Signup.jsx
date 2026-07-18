import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, User, Building, Activity } from 'lucide-react';
import GovHeader from '../components/GovHeader';

export default function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] flex flex-col font-sans">
      <GovHeader />

      <header className="px-6 py-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-9 h-9 rounded-full gov-emblem-ring flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#0A2647]" />
          </div>
          <span className="font-display font-bold text-xl text-[#0A2647] tracking-tight">AAHAAR-AUDIT</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6" id="main-content">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-gov-card border border-[#0A2647]/10 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-[#0A2647] mb-2">Request Platform Access</h2>
            <p className="text-[#0A2647]/70 text-sm">Register your official authority account to deploy AI agents.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0A2647] mb-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#0A2647]/40" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-[#0A2647]/15 rounded-lg bg-[#F6F5F1] text-[#0A2647] placeholder-navy-900/40 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A2647] mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg bg-[#F6F5F1] text-[#0A2647] placeholder-navy-900/40 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2647] mb-1">Department / Jurisdiction</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-[#0A2647]/40" />
                </div>
                <select className="block w-full pl-10 pr-3 py-2 border border-[#0A2647]/15 rounded-lg bg-[#F6F5F1] text-[#0A2647] focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors">
                  <option>Maha FDA (Mumbai Zone)</option>
                  <option>Maha FDA (Pune Zone)</option>
                  <option>Maha FDA (Nagpur Zone)</option>
                  <option>Local Municipal Corporation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2647] mb-1">Official Email ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#0A2647]/40" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@mahafda.gov.in"
                  className="block w-full pl-10 pr-3 py-2 border border-[#0A2647]/15 rounded-lg bg-[#F6F5F1] text-[#0A2647] placeholder-navy-900/40 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2647] mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#0A2647]/40" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-[#0A2647]/15 rounded-lg bg-[#F6F5F1] text-[#0A2647] placeholder-navy-900/40 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0A2647] hover:bg-[#153C6E] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-6 transition-all shadow-lg shadow-[#0A2647]/20 disabled:opacity-70"
            >
              {isLoading ? (
                <><Activity className="w-5 h-5 animate-spin" /> Registering...</>
              ) : (
                <>Submit Request <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#0A2647]/70">
            Already have an account?{' '}
            <Link to="/login" className="text-[#7A1220] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}