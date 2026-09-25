import React from 'react';
import { Navigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME_ROUTE } from '../config/roles';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { firebaseUser, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <Activity className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (!role) {
    // Signed in with Firebase but no Firestore profile yet (e.g. registration
    // was interrupted). Send them back to finish signup.
    return <Navigate to="/signup" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME_ROUTE[role] || '/'} replace />;
  }

  return children;
}
