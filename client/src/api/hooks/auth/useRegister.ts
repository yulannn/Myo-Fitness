import { useMutation } from '@tanstack/react-query';
import AuthService from '../../services/authService';
import type { AuthSuccessResponse, RegisterPayload, FieldErrors } from '../../../types/auth.type';
import { ApiError } from '../../../types/auth.type';
import { ValidationError } from '../errors';

export interface RegisterFormValues {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'USER' | 'COACH';
}

const emailPattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

function normaliseName({ firstName, lastName }: Pick<RegisterFormValues, 'firstName' | 'lastName'>): string {
    return `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim();
}

function toPayload(values: RegisterFormValues): RegisterPayload {
    const email = values.email.trim().toLowerCase();
    const name = normaliseName(values);

    return {
        email,
        name: name || email.split('@')[0],
        password: values.password,
        role: values.role,
    };
}

function validate(values: RegisterFormValues): FieldErrors {
    const errors: FieldErrors = {};

    if (!values.firstName.trim()) {
        errors.firstName = 'Le prénom est requis.';
    }

    if (!values.lastName.trim()) {
        errors.lastName = 'Le nom est requis.';
    }

    if (!values.email.trim()) {
        errors.email = 'L\'email est requis.';
    } else if (!emailPattern.test(values.email.trim())) {
        errors.email = 'Merci d\'indiquer une adresse e-mail valide.';
    }

    if (!values.password) {
        errors.password = 'Le mot de passe est requis.';
    } else if (values.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    }

    return errors;
}

export function useRegister() {
    return useMutation<AuthSuccessResponse, ApiError | ValidationError, RegisterFormValues>({
        mutationFn: async (values: RegisterFormValues) => {
            const clientErrors = validate(values);

            if (Object.keys(clientErrors).length > 0) {
                throw new ValidationError('Merci de corriger les champs indiqués.', clientErrors);
            }

            return AuthService.register(toPayload(values));
        },
    });
}

export default useRegister;

