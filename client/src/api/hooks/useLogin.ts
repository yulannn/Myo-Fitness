import { useMutation } from '@tanstack/react-query'
import type { AuthSuccessResponse, FieldErrors, LoginPayload } from '../services/authService'
import { ApiError, login as loginService } from '../services/authService'
import { ValidationError } from './errors'

export interface LoginFormValues {
  email: string
  password: string
}

function validate(values: LoginFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.email.trim()) {
    errors.email = 'L’email est requis.'
  }

  if (!values.password) {
    errors.password = 'Le mot de passe est requis.'
  }

  return errors
}

function toPayload(values: LoginFormValues): LoginPayload {
  return {
    email: values.email.trim().toLowerCase(),
    password: values.password,
  }
}

export function useLoginMutation() {
  return useMutation<AuthSuccessResponse, ApiError | ValidationError, LoginFormValues>({
    mutationFn: async (values: LoginFormValues) => {
      const clientErrors = validate(values)

      if (Object.keys(clientErrors).length > 0) {
        throw new ValidationError('Merci de corriger les champs indiqués.', clientErrors)
      }

      return loginService(toPayload(values))
    },
  })
}

