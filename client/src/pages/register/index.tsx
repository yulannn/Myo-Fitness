import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FieldErrors } from '../../types/auth.type';
import { ApiError } from '../../types/auth.type';
import { useRegister, type RegisterFormValues } from '../../api/hooks/auth/useRegister';
import { ValidationError } from '../../api/hooks/errors';
import { useAuth } from '../../context/AuthContext'
import { ArrowRightIcon, EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const initialFormValues: RegisterFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
}

export default function Register() {
  const navigate = useNavigate();
  const { applyAuthResult } = useAuth();
  const registerMutation = useRegister();
  const [formValues, setFormValues] = useState(initialFormValues)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const submitLabel = useMemo(() => (registerMutation.isPending ? 'Création en cours...' : 'Créer mon compte'), [registerMutation.isPending])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)

    try {
      const result = await registerMutation.mutateAsync(formValues)

      // Ne plus connecter automatiquement, rediriger vers la vérification d'email
      setFormValues(initialFormValues)
      navigate(`/verify-email?email=${encodeURIComponent(formValues.email)}`, { replace: true })
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

      setFormError("Impossible de créer ton compte pour le moment. Merci de réessayer.")
    }
  }

  return (
    <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#94fbdd] to-[#94fbdd]/70 bg-clip-text text-transparent mb-2">
            Myo Fitness
          </h1>
          <p className="text-gray-400 text-sm">Rejoins la communauté et commence ta transformation</p>
        </div>

        {/* Card */}
        <div className="bg-[#252527] rounded-2xl shadow-2xl p-8 border border-[#94fbdd]/10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Créer ton compte</h2>
            <p className="text-gray-400 text-sm">Quelques informations pour personnaliser ton expérience</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Alicia"
                    value={formValues.firstName}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-[#121214] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors.firstName
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-[#94fbdd]/20 focus:border-[#94fbdd] focus:ring-[#94fbdd]/30'
                      }`}
                  />
                </div>
                {fieldErrors.firstName && (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Martin"
                    value={formValues.lastName}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-[#121214] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors.lastName
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-[#94fbdd]/20 focus:border-[#94fbdd] focus:ring-[#94fbdd]/30'
                      }`}
                  />
                </div>
                {fieldErrors.lastName && (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

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
                  autoComplete="new-password"
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
              <p className="mt-2 text-xs text-gray-500">
                Minimum 6 caractères, idéalement une combinaison de lettres et chiffres
              </p>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                  {fieldErrors.password}
                </p>
              )}
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
              disabled={registerMutation.isPending}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-[#121214] bg-[#94fbdd] hover:bg-[#94fbdd]/90 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:ring-offset-2 focus:ring-offset-[#252527] transition-all flex items-center justify-center gap-2 group ${registerMutation.isPending ? 'opacity-70 cursor-not-allowed' : 'shadow-lg shadow-[#94fbdd]/20'
                }`}
            >
              {registerMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#121214]/30 border-t-[#121214] rounded-full animate-spin"></div>
                  {submitLabel}
                </>
              ) : (
                <>
                  {submitLabel}
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400">
              Déjà inscrit ?{' '}
              <Link
                to="/auth/login"
                className="text-[#94fbdd] hover:text-[#94fbdd]/80 font-semibold transition-colors"
              >
                Me connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          En créant un compte, tu acceptes nos conditions d'utilisation et notre politique de confidentialité
        </p>
      </div>
    </div>
  )
}
