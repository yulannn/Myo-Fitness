import * as Sentry from '@sentry/react';

export function initializeSentry() {
    // Ne pas initialiser Sentry si désactivé ou si pas de DSN
    if (
        import.meta.env.VITE_SENTRY_ENABLED !== 'true' ||
        !import.meta.env.VITE_SENTRY_DSN
    ) {
        console.log('ℹ️  Sentry monitoring is disabled');
        return;
    }

    const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
    const tracesSampleRate = parseFloat(
        import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1',
    );
    const replaysSessionSampleRate = parseFloat(
        import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1',
    );
    const replaysOnErrorSampleRate = parseFloat(
        import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0',
    );

    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment,

        // Intégrations
        integrations: [
            // Intégration Browser Tracing pour les performances
            // Détecte automatiquement React Router v6
            Sentry.browserTracingIntegration(),

            // Session Replay pour capturer les interactions utilisateur
            // Très utile pour déboguer les problèmes rapportés par les utilisateurs
            Sentry.replayIntegration({
                maskAllText: true, // Masquer tout le texte pour la confidentialité
                blockAllMedia: true, // Bloquer tous les médias
            }),
        ],

        // Taux d'échantillonnage des traces de performance
        // 1.0 = 100% des transactions, 0.1 = 10%
        tracesSampleRate,

        // Capture de session replay pour déboguer les problèmes
        replaysSessionSampleRate, // 10% des sessions normales
        replaysOnErrorSampleRate, // 100% des sessions avec erreurs

        // Fonction pour filtrer les données sensibles avant l'envoi
        beforeSend(event) {
            // Filtrer les données sensibles des breadcrumbs
            if (event.breadcrumbs) {
                event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
                    if (breadcrumb.data) {
                        breadcrumb.data = sanitizeSensitiveData(breadcrumb.data) as Record<
                            string,
                            unknown
                        >;
                    }
                    return breadcrumb;
                });
            }

            // Filtrer les données sensibles du contexte de la requête
            if (event.request) {
                // Nettoyer les headers
                if (event.request.headers) {
                    delete event.request.headers['authorization'];
                    delete event.request.headers['cookie'];
                    delete event.request.headers['x-api-key'];
                }

                // Nettoyer les données
                if (event.request.data) {
                    event.request.data = sanitizeSensitiveData(
                        event.request.data,
                    ) as Record<string, unknown>;
                }
            }

            // Filtrer les données sensibles du contexte utilisateur
            if (event.user) {
                // Garder seulement l'ID utilisateur, pas d'email ou autres infos
                const userId = event.user.id;
                event.user = { id: userId };
            }

            // Filtrer les données sensibles des contextes supplémentaires
            if (event.contexts) {
                Object.keys(event.contexts).forEach((key) => {
                    if (event.contexts && event.contexts[key]) {
                        event.contexts[key] = sanitizeSensitiveData(
                            event.contexts[key],
                        ) as Sentry.Context;
                    }
                });
            }

            return event;
        },

        // Ignorer certaines erreurs non critiques
        ignoreErrors: [
            // Erreurs de réseau courantes
            'Network request failed',
            'NetworkError',
            'Failed to fetch',

            // Erreurs de timeout
            'timeout',
            'AbortError',

            // Erreurs de navigation (souvent bénignes)
            'Non-Error promise rejection captured',
            'cancelled',

            // Erreurs d'extensions navigateur
            'top.GLOBALS',
            'chrome-extension://',
            'moz-extension://',

            // Erreurs React courantes en développement
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications',
        ],
    });

    console.log(
        `✅ Sentry initialized successfully (environment: ${environment}, sample rate: ${tracesSampleRate * 100}%)`,
    );
}

/**
 * Nettoie les données sensibles d'un objet
 */
function sanitizeSensitiveData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const sensitiveKeys = [
        'password',
        'token',
        'secret',
        'apiKey',
        'api_key',
        'accessToken',
        'refreshToken',
        'jwt',
        'authorization',
        'cookie',
        'sessionId',
        'creditCard',
        'cardNumber',
        'cvv',
        'ssn',
        'email', // Optionnel : décommenter si vous voulez masquer les emails
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    Object.keys(sanitized as Record<string, unknown>).forEach((key) => {
        const lowerKey = key.toLowerCase();

        // Vérifier si la clé contient un mot sensible
        const isSensitive = sensitiveKeys.some((sensitiveKey) =>
            lowerKey.includes(sensitiveKey.toLowerCase()),
        );

        if (isSensitive) {
            (sanitized as Record<string, unknown>)[key] = '[FILTERED]';
        } else if (
            typeof (sanitized as Record<string, unknown>)[key] === 'object' &&
            (sanitized as Record<string, unknown>)[key] !== null
        ) {
            // Récursion pour les objets imbriqués
            (sanitized as Record<string, unknown>)[key] = sanitizeSensitiveData(
                (sanitized as Record<string, unknown>)[key],
            );
        }
    });

    return sanitized;
}
