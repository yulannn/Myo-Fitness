import type { FieldErrors } from '../services/authService'

export class ValidationError extends Error {
  fieldErrors: FieldErrors

  constructor(message: string, fieldErrors: FieldErrors) {
    super(message)
    this.name = 'ValidationError'
    this.fieldErrors = fieldErrors
  }
}

