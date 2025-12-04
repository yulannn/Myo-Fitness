import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FieldErrors } from '../../types/auth.type';
import { ApiError } from '../../types/auth.type';
import { useLogin, type LoginFormValues } from '../../api/hooks/auth/useLogin';
import { ValidationError } from '../../api/hooks/errors';
import { useAuth } from '../../context/AuthContext'
import { ArrowRightIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

interface LoginFormState extends LoginFormValues {
  rememberMe: boolean
}

const initialValues: LoginFormState = {
  email: '',
  password: '',
  rememberMe: false,
}

export default function Login() {
  const navigate = useNavigate();
  const { applyAuthResult } = useAuth();
  const loginMutation = useLogin();
  const [formValues, setFormValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

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

    const { rememberMe, ...credentials } = formValues

    try {
      const result = await loginMutation.mutateAsync(credentials)
      applyAuthResult(result)

      if (!rememberMe) {
        setFormValues(initialValues)
      }

      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ValidationError) {
        setFieldErrors(error.fieldErrors)
        setFormError(error.message)
        return
      }

      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors ?? {})
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
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formValues.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-[#121214] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors.password
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-[#94fbdd]/20 focus:border-[#94fbdd] focus:ring-[#94fbdd]/30'
                    }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer group">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={formValues.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 bg-[#121214] text-[#94fbdd] focus:ring-[#94fbdd]/30 focus:ring-offset-0"
                />
                <span className="group-hover:text-gray-300 transition-colors">Se souvenir de moi</span>
              </label>
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
