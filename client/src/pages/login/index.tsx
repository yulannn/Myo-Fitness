import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FieldErrors } from '../../types/auth.type';
import { ApiError } from '../../types/auth.type';
import { useLogin, type LoginFormValues } from '../../api/hooks/auth/useLogin';
import { ValidationError } from '../../api/hooks/errors';
import { useAuth } from '../../context/AuthContext'

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
    <section className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500">Connexion</p>
        <h1 className="text-3xl font-bold text-slate-900">Ravi de te revoir</h1>
        <p className="text-sm text-slate-500">Accède à ton cockpit, tes programmes et tes recommandations IA.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <label className="block text-sm text-slate-600">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@exemple.com"
            value={formValues.email}
            onChange={handleChange}
            className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
              fieldErrors.email ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-300'
            }`}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
        </label>
        <label className="block text-sm text-slate-600">
          Mot de passe
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={formValues.password}
            onChange={handleChange}
            className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
              fieldErrors.password ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-300'
            }`}
          />
          {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
        </label>
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-slate-500">
            <input
              name="rememberMe"
              type="checkbox"
              checked={formValues.rememberMe}
              onChange={handleChange}
              className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-200"
            />
            Se souvenir de moi
          </label>
          <Link to="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Mot de passe oublié ?
          </Link>
        </div>

        {formError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert" aria-live="assertive">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className={`w-full rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 ${
            loginMutation.isPending ? 'cursor-not-allowed bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {loginMutation.isPending ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        Pas encore de compte ?{' '}
        <Link to="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Créer mon espace
        </Link>
      </p>
    </section>
  )
}

