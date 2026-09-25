import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { fetchMyProfile } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // { uid, email, role, full_name, ... }
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return null;
    }
    try {
      const idToken = await user.getIdToken();
      const data = await fetchMyProfile(idToken);
      setProfile(data);
      return data;
    } catch (err) {
      // Profile may not exist yet mid-signup, or the token is stale.
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setFirebaseUser(user);
      await loadProfile(user);
      setLoading(false);
    });
    return unsubscribe;
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile(firebaseUser), [firebaseUser, loadProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  const value = {
    firebaseUser,
    profile,
    role: profile?.role ?? null,
    loading,
    refreshProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
