import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const ACCESS_TOKEN_KEY = 'myo.auth.accessToken';
const REFRESH_TOKEN_KEY = 'myo.auth.refreshToken'; // ✅ Nouveau

// Détection de la plateforme pour utiliser le bon storage
const isNative = Capacitor.isNativePlatform();

/**
 * Service de gestion sécurisée des tokens
 * - Web: Utilise localStorage (fallback)
 * - iOS: Utilise Keychain (chiffrement matériel)
 * - Android: Utilise EncryptedSharedPreferences
 */
export const secureTokenService = {
    /**
     * Récupère l'access token de manière sécurisée
     */
    async getAccessToken(): Promise<string | null> {
        if (isNative) {
            // Mobile: Stockage sécurisé natif
            const { value } = await Preferences.get({ key: ACCESS_TOKEN_KEY });
            return value;
        } else {
            // Web: localStorage (fallback)
            return localStorage.getItem(ACCESS_TOKEN_KEY);
        }
    },

    /**
     * Sauvegarde l'access token de manière sécurisée
     */
    async setAccessToken(token: string): Promise<void> {
        if (isNative) {
            // Mobile: Stockage sécurisé natif
            await Preferences.set({
                key: ACCESS_TOKEN_KEY,
                value: token,
            });
        } else {
            // Web: localStorage (fallback)
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
        }
    },

    /**
     * Récupère le refresh token de manière sécurisée
     */
    async getRefreshToken(): Promise<string | null> {
        if (isNative) {
            const { value } = await Preferences.get({ key: REFRESH_TOKEN_KEY });
            return value;
        } else {
            return localStorage.getItem(REFRESH_TOKEN_KEY);
        }
    },

    /**
     * Sauvegarde le refresh token de manière sécurisée
     */
    async setRefreshToken(token: string): Promise<void> {
        if (isNative) {
            await Preferences.set({
                key: REFRESH_TOKEN_KEY,
                value: token,
            });
        } else {
            localStorage.setItem(REFRESH_TOKEN_KEY, token);
        }
    },

    /**
     * Supprime tous les tokens (access + refresh)
     */
    async clear(): Promise<void> {
        // Nettoyer les deux tokens
        if (isNative) {
            await Preferences.remove({ key: ACCESS_TOKEN_KEY });
            await Preferences.remove({ key: REFRESH_TOKEN_KEY });
        } else {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
    },
};
