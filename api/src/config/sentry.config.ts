import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry() {
  // Ne pas initialiser Sentry si désactivé ou si pas de DSN
  if (process.env.SENTRY_ENABLED !== 'true' || !process.env.SENTRY_DSN) {
    console.log('ℹ️  Sentry monitoring is disabled');
    return;
  }

  const environment = process.env.SENTRY_ENVIRONMENT || 'development';
  const tracesSampleRate = parseFloat(
    process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1',
  );

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment,

    // Intégrations
    integrations: [
      // Profiling pour les performances
      nodeProfilingIntegration(),
    ],

    // Taux d'échantillonnage des traces de performance
    // 1.0 = 100% des transactions, 0.1 = 10%
    tracesSampleRate,

    // Taux d'échantillonnage du profiling
    // Relative au tracesSampleRate (1.0 = profile toutes les transactions tracées)
    profilesSampleRate: 1.0,

    // Fonction pour filtrer les données sensibles avant l'envoi
    beforeSend(event, hint) {
      // Filtrer les données sensibles des breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data) {
            // Nettoyer les données sensibles
            breadcrumb.data = sanitizeSensitiveData(breadcrumb.data);
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

        // Nettoyer les données du body
        if (event.request.data) {
          event.request.data = sanitizeSensitiveData(event.request.data);
        }
      }

      // Filtrer les données sensibles des contextes supplémentaires
      if (event.contexts) {
        Object.keys(event.contexts).forEach((key) => {
          if (event.contexts && event.contexts[key]) {
            event.contexts[key] = sanitizeSensitiveData(event.contexts[key]);
          }
        });
      }

      return event;
    },

    // Ignorer certaines erreurs non critiques
    ignoreErrors: [
      // Erreurs de connexion réseau
      'Network request failed',
      'NetworkError',

      // Erreurs de timeout
      'timeout',
      'AbortError',

      // Erreurs CORS (souvent côté client)
      'CORS',
      'Cross-Origin',
    ],
  });

  console.log(
    `✅ Sentry initialized successfully (environment: ${environment}, sample rate: ${tracesSampleRate * 100}%)`,
  );
}

/**
 * Nettoie les données sensibles d'un objet
 */
function sanitizeSensitiveData(data: any): any {
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

  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();

    // Vérifier si la clé contient un mot sensible
    const isSensitive = sensitiveKeys.some((sensitiveKey) =>
      lowerKey.includes(sensitiveKey.toLowerCase()),
    );

    if (isSensitive) {
      sanitized[key] = '[FILTERED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // Récursion pour les objets imbriqués
      sanitized[key] = sanitizeSensitiveData(sanitized[key]);
    }
  });

  return sanitized;
}
