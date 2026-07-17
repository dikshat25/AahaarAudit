import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, User, Building, Activity } from 'lucide-react';

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
    <div className="min-h-screen bg-emerald-50 flex flex-col font-sans">
      <header className="px-6 py-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <Shield className="w-8 h-8 text-emerald-600" />
          <span className="font-bold text-xl text-emerald-950 tracking-tight">AAHAAR-AUDIT</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-emerald-200/50 border border-emerald-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-emerald-950 mb-2">Request Platform Access</h2>
            <p className="text-emerald-700 text-sm">Register your official authority account to deploy AI agents.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-900 mb-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-900 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-900 mb-1">Department / Jurisdiction</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-emerald-400" />
                </div>
                <select className="block w-full pl-10 pr-3 py-2 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-950 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                  <option>Maha FDA (Mumbai Zone)</option>
                  <option>Maha FDA (Pune Zone)</option>
                  <option>Maha FDA (Nagpur Zone)</option>
                  <option>Local Municipal Corporation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-900 mb-1">Official Email ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-emerald-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@mahafda.gov.in"
                  className="block w-full pl-10 pr-3 py-2 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-900 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-emerald-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-6 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-70"
            >
              {isLoading ? (
                <><Activity className="w-5 h-5 animate-spin" /> Registering...</>
              ) : (
                <>Submit Request <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-emerald-700">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
