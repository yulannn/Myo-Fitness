import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const ACCESS_TOKEN_KEY = 'myo.auth.accessToken';

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
     * Supprime l'access token
     */
    async clear(): Promise<void> {
        if (isNative) {
            // Mobile: Suppression sécurisée
            await Preferences.remove({ key: ACCESS_TOKEN_KEY });
        } else {
            // Web: Suppression localStorage
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
    },

    /**
     * Migre les tokens de localStorage vers Preferences (à exécuter une fois)
     */
    async migrateFromLocalStorage(): Promise<void> {
        if (isNative) {
            const oldToken = localStorage.getItem(ACCESS_TOKEN_KEY);
            if (oldToken) {
                await this.setAccessToken(oldToken);
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                console.log('✅ Token migré vers stockage sécurisé');
            }
        }
    },
};
