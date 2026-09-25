import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, User, Building, Activity, AlertCircle, ChevronLeft } from 'lucide-react';
import GovHeader from '../components/GovHeader';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { registerProfile } from '../api/authApi';
import { ROLES, ROLE_OPTIONS, ROLE_HOME_ROUTE } from '../config/roles';
import { useAuth } from '../context/AuthContext';

const inputClass =
  'block w-full pl-10 pr-3 py-2 border border-[#0A2647]/15 rounded-lg bg-[#F6F5F1] text-[#0A2647] placeholder-navy-900/40 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors';
const plainInputClass =
  'block w-full px-3 py-2 border border-[#0A2647]/15 rounded-lg bg-[#F6F5F1] text-[#0A2647] placeholder-navy-900/40 focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] transition-colors';
const labelClass = 'block text-sm font-medium text-[#0A2647] mb-1';

export default function Signup() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState(1); // 1 = choose role, 2 = fill details
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Regulator-only
  const [designation, setDesignation] = useState('Inspector');
  const [department, setDepartment] = useState('Maha FDA (Mumbai Zone)');

  // Owner-only
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // Customer-only
  const [phone, setPhone] = useState('');

  const chooseRole = (key) => {
    setRole(key);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let createdUser = null;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      createdUser = cred.user;
      const idToken = await createdUser.getIdToken();

      const profile = { role, full_name: fullName };
      if (role === ROLES.REGULATOR) {
        profile.designation = designation;
        profile.department = department;
      } else if (role === ROLES.OWNER) {
        profile.business_name = businessName;
        profile.business_type = businessType;
        profile.fssai_license = fssaiLicense || undefined;
        profile.business_address = businessAddress || undefined;
      } else if (role === ROLES.CUSTOMER) {
        profile.phone = phone || undefined;
      }

      await registerProfile(idToken, profile);
      await refreshProfile();
      navigate(ROLE_HOME_ROUTE[role]);
    } catch (err) {
      // Roll back the Firebase account if profile registration failed, so the
      // person can retry signup cleanly instead of getting stuck.
      if (createdUser) {
        try {
          await createdUser.delete();
        } catch {
          // best-effort cleanup only
        }
      }
      setError(err.message || 'Failed to create an account.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleMeta = ROLE_OPTIONS.find((r) => r.key === role);

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
          {step === 1 ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-bold text-[#0A2647] mb-2">Create Your Account</h2>
                <p className="text-[#0A2647]/70 text-sm">Choose the account type that fits you.</p>
              </div>

              <div className="space-y-3">
                {ROLE_OPTIONS.map(({ key, label, description, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => chooseRole(key)}
                    className="w-full text-left flex items-start gap-3 p-4 border border-[#0A2647]/15 rounded-xl hover:border-[#FF9933] hover:bg-[#F6F5F1] transition-colors group"
                  >
                    <Icon className="w-6 h-6 text-[#0A2647] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0A2647]">{label}</p>
                      <p className="text-xs text-[#0A2647]/60 mt-0.5">{description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0A2647]/25 ml-auto mt-1 group-hover:text-[#FF9933] transition-colors" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-[#0A2647]/70 hover:text-[#0A2647] mb-4 font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Change account type
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-bold text-[#0A2647] mb-1">{roleMeta.label}</h2>
                <p className="text-[#0A2647]/70 text-sm">{roleMeta.description}</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-[#7A1220]/10 border border-[#7A1220]/30 text-[#7A1220] rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-[#0A2647]/40" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {role === ROLES.REGULATOR && (
                  <>
                    <div>
                      <label className={labelClass}>Designation</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-[#0A2647]/40" />
                        </div>
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className={inputClass}
                        >
                          <option>Admin</option>
                          <option>Regulator</option>
                          <option>Inspector</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Department / Jurisdiction</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="h-5 w-5 text-[#0A2647]/40" />
                        </div>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className={inputClass}
                        >
                          <option>Maha FDA (Mumbai Zone)</option>
                          <option>Maha FDA (Pune Zone)</option>
                          <option>Maha FDA (Nagpur Zone)</option>
                          <option>Local Municipal Corporation</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {role === ROLES.OWNER && (
                  <>
                    <div>
                      <label className={labelClass}>Business Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="h-5 w-5 text-[#0A2647]/40" />
                        </div>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Business Type</label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className={plainInputClass}
                        >
                          <option>Hotel</option>
                          <option>Restaurant</option>
                          <option>Cloud Kitchen</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>FSSAI License No.</label>
                        <input
                          type="text"
                          value={fssaiLicense}
                          onChange={(e) => setFssaiLicense(e.target.value)}
                          placeholder="Optional"
                          className={plainInputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Business Address</label>
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        className={plainInputClass}
                      />
                    </div>
                  </>
                )}

                {role === ROLES.CUSTOMER && (
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Optional"
                      className={plainInputClass}
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>{role === ROLES.REGULATOR ? 'Official Email ID' : 'Email'}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#0A2647]/40" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === ROLES.REGULATOR ? 'name@mahafda.gov.in' : 'name@example.com'}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#0A2647]/40" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0A2647] hover:bg-[#153C6E] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-6 transition-all shadow-lg shadow-[#0A2647]/20 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Activity className="w-5 h-5 animate-spin" /> Creating account...
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

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
