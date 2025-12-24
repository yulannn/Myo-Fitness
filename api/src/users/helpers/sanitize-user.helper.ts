import { UserEntity } from '../entities/users.entity';

/**
 * 🔒 Type pour un utilisateur "safe" sans données sensibles
 */
export type SafeUser = Omit<UserEntity, 'password' | 'refreshToken' | 'resetPasswordCode' | 'resetPasswordExpires' | 'emailVerificationCode' | 'emailVerificationExpires'>;

/**
 * 🧹 Nettoie un objet User pour retirer toutes les données sensibles
 * @param user - L'utilisateur brut de la DB
 * @returns L'utilisateur sans données sensibles
 */
export function sanitizeUser(user: UserEntity): SafeUser {
  const {
    password,
    refreshToken,
    resetPasswordCode,
    resetPasswordExpires,
    emailVerificationCode,
    emailVerificationExpires,
    ...safeUser
  } = user;

  return safeUser;
}

/**
 * 🧹 Version tableau : nettoie plusieurs utilisateurs
 */
export function sanitizeUsers(users: UserEntity[]): SafeUser[] {
  return users.map(sanitizeUser);
}
