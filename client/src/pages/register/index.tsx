import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FieldErrors } from '../../types/auth.type';
import { ApiError } from '../../types/auth.type';
import { useRegister, type RegisterFormValues } from '../../api/hooks/auth/useRegister';
import { ValidationError } from '../../api/hooks/errors';
import { useAuth } from '../../context/AuthContext'

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
      applyAuthResult(result)
      setFormValues(initialFormValues)
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

      setFormError("Impossible de créer ton compte pour le moment. Merci de réessayer.")
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500">Inscription</p>
        <h1 className="text-3xl font-bold text-slate-900">Bienvenue sur Myo Fitness</h1>
        <p className="text-sm text-slate-500">
          Rejoins la communauté et commence à suivre tes progrès, programmes et recommandations personnalisées.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-600">
            Prénom
            <input
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Alicia"
              value={formValues.firstName}
              onChange={handleChange}
              className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                fieldErrors.firstName ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-300'
              }`}
            />
            {fieldErrors.firstName && <p className="mt-1 text-xs text-red-500">{fieldErrors.firstName}</p>}
          </label>

          <label className="text-sm text-slate-600">
            Nom
            <input
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Martin"
              value={formValues.lastName}
              onChange={handleChange}
              className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                fieldErrors.lastName ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-300'
              }`}
            />
            {fieldErrors.lastName && <p className="mt-1 text-xs text-red-500">{fieldErrors.lastName}</p>}
          </label>
        </div>

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
            autoComplete="new-password"
            placeholder="••••••••"
            value={formValues.password}
            onChange={handleChange}
            className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
              fieldErrors.password ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-300'
            }`}
          />
          <p className="mt-1 text-xs text-slate-400">Minimum 6 caractères, idéalement une combinaison de lettres et chiffres.</p>
          {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
        </label>

        {formError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert" aria-live="assertive">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className={`w-full rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 ${
            registerMutation.isPending ? 'cursor-not-allowed bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {submitLabel}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Déjà inscrit ?{' '}
        <Link to="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Me connecter
        </Link>
      </p>
    </section>
  )
}
