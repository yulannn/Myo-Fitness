import { Controller, Get } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

@Controller('sentry-test')
export class SentryTestController {
    @Get('error')
    testError() {
        // Test 1: Génère une erreur non gérée
        throw new Error('🧪 Test Sentry - Erreur de test backend');
    }

    @Get('message')
    testMessage() {
        // Test 2: Capture un message simple
        Sentry.captureMessage('🧪 Test Sentry - Message de test', 'info');
        return {
            success: true,
            message: 'Message envoyé à Sentry avec succès'
        };
    }

    @Get('exception')
    testException() {
        // Test 3: Capture une exception manuellement
        try {
            // Force une erreur
            const data: any = null;
            data.nonExistent.property = 'test';
        } catch (error) {
            Sentry.captureException(error);
            return {
                success: true,
                message: 'Exception capturée et envoyée à Sentry',
                error: error.message
            };
        }
    }

    @Get('context')
    testWithContext() {
        // Test 4: Capture avec contexte personnalisé
        Sentry.setContext('test_context', {
            testType: 'context_test',
            timestamp: new Date().toISOString(),
            customData: 'Données personnalisées de test',
        });

        Sentry.captureMessage('🧪 Test avec contexte personnalisé', 'warning');

        return {
            success: true,
            message: 'Message avec contexte envoyé à Sentry'
        };
    }

    @Get('breadcrumbs')
    testBreadcrumbs() {
        // Test 5: Ajouter des breadcrumbs (piste d'audit)
        Sentry.addBreadcrumb({
            message: 'Étape 1: Début du test',
            level: 'info',
        });

        Sentry.addBreadcrumb({
            message: 'Étape 2: Traitement en cours',
            level: 'info',
        });

        Sentry.addBreadcrumb({
            message: 'Étape 3: Avant l\'erreur',
            level: 'warning',
        });

        // Capture un message avec tous les breadcrumbs
        Sentry.captureMessage('🧪 Test avec breadcrumbs', 'error');

        return {
            success: true,
            message: 'Message avec breadcrumbs envoyé à Sentry'
        };
    }

    @Get('status')
    getStatus() {
        // Vérifier si Sentry est activé
        const isEnabled = process.env.SENTRY_ENABLED === 'true';
        const hasDSN = !!process.env.SENTRY_DSN;

        return {
            sentryEnabled: isEnabled,
            hasDSN,
            environment: process.env.SENTRY_ENVIRONMENT || 'not set',
            status: isEnabled && hasDSN ? '✅ Sentry est actif' : '⚠️ Sentry est désactivé',
            instructions: !isEnabled || !hasDSN
                ? 'Activez Sentry en définissant SENTRY_ENABLED=true et SENTRY_DSN dans votre fichier .env'
                : 'Sentry est prêt à capturer les erreurs',
        };
    }
}
