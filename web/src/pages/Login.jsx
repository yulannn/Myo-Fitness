// ─────────────────────────────────────────────────────────────
// Myo Fitness – Login Page (Web)
// Premium dark-theme login with animations & full error handling
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  BoltIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authed
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'COACH' ? '/dashboard/coach' : '/dashboard';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // ── form state ─────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // ── Client-side validation ─────────────────────────────────
  function validate() {
    const errs = {};
    if (!email.trim()) errs.email = 'L\'adresse e-mail est requise';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Format d\'e-mail invalide';
    if (!password) errs.password = 'Le mot de passe est requis';
    else if (password.length < 4) errs.password = 'Mot de passe trop court';
    return errs;
  }

  // ── Submit ─────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);

      // Navigate to intended page or role-based dashboard
      // The useEffect above will handle the redirect after user state updates
    } catch (err) {
      if (err.status === 401) {
        setError('Identifiants incorrects. Vérifiez votre e-mail et mot de passe.');
      } else if (err.status === 429) {
        setError('Trop de tentatives. Veuillez patienter une minute avant de réessayer.');
      } else {
        setError(err.message || 'Une erreur est survenue. Réessayez plus tard.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* ── Ambient blobs ─────────────────────────────────── */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      {/* ── Card ──────────────────────────────────────────── */}
      <div className="w-full max-w-md relative">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8 group text-sm"
        >
          <ArrowRightIcon className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Retour au site
        </Link>

        <div className="bg-surface border border-border-subtle rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* ── Logo ────────────────────────────────────────── */}
          <div className="flex flex-col items-center mb-10">
            <div className="p-3 rounded-xl bg-primary/10 mb-4 ring-1 ring-primary/20">
              <BoltIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide font-montserrat">
              MYO <span className="text-primary">FITNESS</span>
            </h1>
            <p className="text-text-secondary text-sm mt-2">
              Connectez-vous à votre espace
            </p>
          </div>

          {/* ── Global error ────────────────────────────────── */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-fade-in-up">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── Form ────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Adresse e-mail
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/50 pointer-events-none" />
                <input
                  ref={emailRef}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((p) => ({ ...p, email: undefined }));
                    setError('');
                  }}
                  placeholder="coach@myo-fitness.app"
                  className={`w-full pl-11 pr-4 py-3.5 bg-background border rounded-xl text-white placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${fieldErrors.email
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-border-subtle focus:ring-primary/30 focus:border-primary/40'
                    }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/50 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, password: undefined }));
                    setError('');
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3.5 bg-background border rounded-xl text-white placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${fieldErrors.password
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-border-subtle focus:ring-primary/30 focus:border-primary/40'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              id="login-submit"
              className="w-full py-3.5 mt-2 bg-primary text-background font-bold rounded-xl text-sm uppercase tracking-wider
                         hover:shadow-[0_0_30px_rgba(148,251,221,0.25)] hover:scale-[1.02]
                         active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Connexion…
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Separator ───────────────────────────────────── */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-text-secondary/50 text-xs uppercase tracking-wider">Pas encore inscrit ?</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* ── Signup CTA (redirects to app) ───────────────── */}
          <div className="text-center">
            <p className="text-text-secondary text-sm mb-4">
              Les inscriptions se font exclusivement via l'application mobile.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-primary/30 text-primary rounded-xl text-sm font-semibold
                         hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
            >
              <BoltIcon className="w-4 h-4" />
              Télécharger l'application
            </Link>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <p className="text-center text-text-secondary/40 text-xs mt-6">
          © {new Date().getFullYear()} Myo Fitness — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
