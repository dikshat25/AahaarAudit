import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Activity } from 'lucide-react';

export default function Login() {
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
            <h2 className="text-2xl font-bold text-emerald-950 mb-2">Authority Portal Login</h2>
            <p className="text-emerald-700 text-sm">Enter your official credentials to access the multi-agent dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-emerald-900 mb-1">Official Email ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-emerald-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="inspector@mahafda.gov.in"
                  className="block w-full pl-10 pr-3 py-2.5 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-emerald-900">Password</label>
                <a href="#" className="text-xs text-emerald-600 hover:text-emerald-800 font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-emerald-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-70"
            >
              {isLoading ? (
                <><Activity className="w-5 h-5 animate-spin" /> Authenticating...</>
              ) : (
                <>Access Dashboard <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-emerald-700">
            Don't have an authority account?{' '}
            <Link to="/signup" className="text-emerald-600 font-bold hover:underline">
              Request Access
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
