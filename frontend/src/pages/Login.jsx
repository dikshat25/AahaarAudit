import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import GovHeader from '../components/GovHeader';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { fetchMyProfile } from '../api/authApi';
import { ROLE_HOME_ROUTE } from '../config/roles';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      // Role lives in Firestore, not the Firebase Auth token, so we look it
      // up right after sign-in to know which dashboard to send them to.
      const profile = await fetchMyProfile(idToken);
      navigate(ROLE_HOME_ROUTE[profile.role] || '/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="text-2xl font-display font-bold text-[#0A2647] mb-2">Welcome Back</h2>
            <p className="text-[#0A2647]/70 text-sm">Sign in to your Customer, Regulator, or Owner account.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#7A1220]/10 border border-[#7A1220]/30 text-[#7A1220] rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#0A2647] mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#0A2647]/40" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#0A2647]/15 rounded-lg bg-[#F6F5F1] text-[#0A2647] placeholder-navy-900/40 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-[#0A2647]">Password</label>
                <a href="#" className="text-xs text-[#0A2647]/70 hover:text-[#0A2647] font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#0A2647]/40" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#0A2647]/15 rounded-lg bg-[#F6F5F1] text-[#0A2647] placeholder-navy-900/40 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0A2647] hover:bg-[#153C6E] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0A2647]/20 disabled:opacity-70"
            >
              {isLoading ? (
                <><Activity className="w-5 h-5 animate-spin" /> Authenticating...</>
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#0A2647]/70">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#7A1220] font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
