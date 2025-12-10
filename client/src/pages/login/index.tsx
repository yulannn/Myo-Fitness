import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FieldErrors } from '../../types/auth.type';
import { ApiError } from '../../types/auth.type';
import { useLogin, type LoginFormValues } from '../../api/hooks/auth/useLogin';
import { ValidationError } from '../../api/hooks/errors';
import { useAuth } from '../../context/AuthContext'
import { ArrowRightIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const initialValues: LoginFormValues = {
  email: '',
  password: '',
}

export default function Login() {
  const navigate = useNavigate();
  const { applyAuthResult } = useAuth();
  const loginMutation = useLogin();
  const [formValues, setFormValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    setFieldErrors({})
    setFormError(null)
    setFormValues((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)

    try {
      const result = await loginMutation.mutateAsync(formValues)
      applyAuthResult(result)
      setFormValues(initialValues)

      // ✅ window.location.replace garantit le changement d'URL
      // Fonctionne même si le composant se démonte
      window.location.replace('/');
    } catch (error) {
      if (error instanceof ValidationError) {
        setFieldErrors(error.fieldErrors)
        setFormError(error.message)
        return
      }

      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors ?? {})

        // Vérifier si c'est une erreur de vérification d'email
        if (error.message?.includes('vérifier votre email') || error.message?.includes('verify')) {
          setFormError(error.message)
          // Rediriger vers la page de vérification après 2 secondes
          setTimeout(() => {
            navigate(`/verify-email?email=${encodeURIComponent(formValues.email)}`)
          }, 2000)
          return
        }

        setFormError(error.message)
        return
      }

      setFormError('Impossible de te connecter pour le moment. Merci de réessayer.')
    }
  }

  return (
    <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#94fbdd] to-[#94fbdd]/70 bg-clip-text text-transparent mb-2">
            Myo Fitness
          </h1>
          <p className="text-gray-400 text-sm">Transforme ton corps, transforme ta vie</p>
        </div>

        {/* Card */}
        <div className="bg-[#252527] rounded-2xl shadow-2xl p-8 border border-[#94fbdd]/10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Bon retour !</h2>
            <p className="text-gray-400 text-sm">Connecte-toi pour accéder à ton espace</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ton@email.com"
                  value={formValues.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-[#121214] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors.email
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-[#94fbdd]/20 focus:border-[#94fbdd] focus:ring-[#94fbdd]/30'
                    }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formValues.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 bg-[#121214] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors.password
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-[#94fbdd]/20 focus:border-[#94fbdd] focus:ring-[#94fbdd]/30'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#94fbdd] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-center text-sm">
              <Link
                to="/forgot-password"
                className="text-[#94fbdd] hover:text-[#94fbdd]/80 font-medium transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400" role="alert">
                {formError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-[#121214] bg-[#94fbdd] hover:bg-[#94fbdd]/90 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:ring-offset-2 focus:ring-offset-[#252527] transition-all flex items-center justify-center gap-2 group ${loginMutation.isPending ? 'opacity-70 cursor-not-allowed' : 'shadow-lg shadow-[#94fbdd]/20'
                }`}
            >
              {loginMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#121214]/30 border-t-[#121214] rounded-full animate-spin"></div>
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400">
              Pas encore de compte ?{' '}
              <Link
                to="/auth/register"
                className="text-[#94fbdd] hover:text-[#94fbdd]/80 font-semibold transition-colors"
              >
                Créer mon espace
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          En te connectant, tu acceptes nos conditions d'utilisation
        </p>
      </div>
    </div>
  )
}
