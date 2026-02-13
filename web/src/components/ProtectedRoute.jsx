// ─────────────────────────────────────────────────────────────
// ProtectedRoute – Redirects to /login when not authenticated
// Optionally checks for a specific role
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {'USER' | 'COACH'} [props.requiredRole] – optional role gate
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Still resolving the session – show nothing (or a spinner)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm font-medium">Chargement…</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login, remembering where they were
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role gate
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect coaches trying to access user pages (and vice-versa)
    const fallback = user?.role === 'COACH' ? '/dashboard/coach' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
