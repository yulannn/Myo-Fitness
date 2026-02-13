// ─────────────────────────────────────────────────────────────
// Myo Fitness – Web Application Root
// Routing, Auth provider, and layout orchestration
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// ── Pages ────────────────────────────────────────────────────
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import UserDashboard from './pages/dashboard/UserDashboard.jsx';
import CoachDashboard from './pages/dashboard/CoachDashboard.jsx';

// ── Smart dashboard redirect based on role ───────────────────
function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user?.role === 'COACH'
    ? <Navigate to="/dashboard/coach" replace />
    : <Navigate to="/dashboard/user" replace />;
}

// ── App ──────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected – role-based dashboards */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/coach"
            element={
              <ProtectedRoute requiredRole="COACH">
                <CoachDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
