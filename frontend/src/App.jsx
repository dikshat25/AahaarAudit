import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROLES, ROLE_HOME_ROUTE } from './config/roles';

// Sends a bare /dashboard hit to the right role-specific dashboard, or to
// login if nobody's signed in yet. ProtectedRoute guards the redirect target.
function DashboardRedirect() {
  const { role } = useAuth();
  return <Navigate to={(role && ROLE_HOME_ROUTE[role]) || '/login'} replace />;
}

export default function App() {
  const [booting, setBooting] = useState(true);

  return (
    <AuthProvider>
      {booting && <LoadingSpinner onFinish={() => setBooting(false)} duration={3200} />}
      <div className={booting ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/dashboard/regulator"
              element={
                <ProtectedRoute allowedRoles={[ROLES.REGULATOR]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/owner"
              element={
                <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/customer"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Legacy link support: send any bare /dashboard hit to a
                role-appropriate route once we know who's signed in. */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}
