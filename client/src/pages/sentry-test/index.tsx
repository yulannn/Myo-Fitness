import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';

export default function SentryTestPage() {
    const navigate = useNavigate();

    const testError = () => {
        throw new Error('🧪 Test Sentry Client - Erreur de test');
    };

    const testMessage = () => {
        Sentry.captureMessage('🧪 Test Sentry Client - Message de test', 'info');
        alert('✅ Message envoyé à Sentry');
    };

    const testException = () => {
        try {
            // Force une erreur
            const data: any = null;
            data.nonExistent.property = 'test';
        } catch (error) {
            Sentry.captureException(error);
            alert('✅ Exception capturée et envoyée à Sentry');
        }
    };

    const testWithContext = () => {
        Sentry.setContext('test_context', {
            testType: 'context_test',
            timestamp: new Date().toISOString(),
            userId: 'test-user-123',
        });

        Sentry.captureMessage('🧪 Test avec contexte personnalisé', 'warning');
        alert('✅ Message avec contexte envoyé à Sentry');
    };

    const testBreadcrumbs = () => {
        Sentry.addBreadcrumb({
            message: 'Étape 1: Début du test',
            level: 'info',
        });

        Sentry.addBreadcrumb({
            message: 'Étape 2: Action utilisateur',
            level: 'info',
            data: { action: 'click', button: 'test' },
        });

        Sentry.addBreadcrumb({
            message: 'Étape 3: Avant l\'erreur',
            level: 'warning',
        });

        Sentry.captureMessage('🧪 Test avec breadcrumbs', 'error');
        alert('✅ Message avec breadcrumbs envoyé à Sentry');
    };

    const checkStatus = () => {
        const isEnabled = import.meta.env.VITE_SENTRY_ENABLED === 'true';
        const hasDSN = !!import.meta.env.VITE_SENTRY_DSN;
        const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'not set';

        const status = isEnabled && hasDSN ? '✅ Sentry est actif' : '⚠️ Sentry est désactivé';
        const message = `
Status: ${status}
Enabled: ${isEnabled}
Has DSN: ${hasDSN}
Environment: ${environment}

${!isEnabled || !hasDSN ? 'Pour activer Sentry, configurez VITE_SENTRY_ENABLED=true et VITE_SENTRY_DSN dans votre .env.development' : 'Sentry est prêt à capturer les erreurs !'}
    `;

        alert(message);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold text-white">
                            🧪 Sentry Test Dashboard
                        </h1>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
                        >
                            ← Retour
                        </button>
                    </div>

                    <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                        <p className="text-blue-100 text-sm">
                            💡 <strong>Astuce:</strong> Ouvrez la console du navigateur (F12) et le dashboard Sentry pour voir les erreurs capturées.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Check */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer" onClick={checkStatus}>
                            <div className="text-white">
                                <div className="text-3xl mb-2">ℹ️</div>
                                <h3 className="text-xl font-bold mb-2">Vérifier le Status</h3>
                                <p className="text-blue-100 text-sm">
                                    Vérifier si Sentry est activé et configuré
                                </p>
                            </div>
                        </div>

                        {/* Test Error */}
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer" onClick={testError}>
                            <div className="text-white">
                                <div className="text-3xl mb-2">💥</div>
                                <h3 className="text-xl font-bold mb-2">Erreur Non Gérée</h3>
                                <p className="text-red-100 text-sm">
                                    Génère une erreur JavaScript non gérée
                                </p>
                            </div>
                        </div>

                        {/* Test Message */}
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer" onClick={testMessage}>
                            <div className="text-white">
                                <div className="text-3xl mb-2">💬</div>
                                <h3 className="text-xl font-bold mb-2">Message Simple</h3>
                                <p className="text-green-100 text-sm">
                                    Envoie un message à Sentry
                                </p>
                            </div>
                        </div>

                        {/* Test Exception */}
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer" onClick={testException}>
                            <div className="text-white">
                                <div className="text-3xl mb-2">⚠️</div>
                                <h3 className="text-xl font-bold mb-2">Exception Capturée</h3>
                                <p className="text-orange-100 text-sm">
                                    Capture et envoie une exception
                                </p>
                            </div>
                        </div>

                        {/* Test Context */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer" onClick={testWithContext}>
                            <div className="text-white">
                                <div className="text-3xl mb-2">🔖</div>
                                <h3 className="text-xl font-bold mb-2">Avec Contexte</h3>
                                <p className="text-purple-100 text-sm">
                                    Message avec données personnalisées
                                </p>
                            </div>
                        </div>

                        {/* Test Breadcrumbs */}
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer" onClick={testBreadcrumbs}>
                            <div className="text-white">
                                <div className="text-3xl mb-2">🍞</div>
                                <h3 className="text-xl font-bold mb-2">Breadcrumbs</h3>
                                <p className="text-indigo-100 text-sm">
                                    Message avec historique d'événements
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                        <h4 className="text-yellow-100 font-bold mb-2">⚡ Test depuis la console</h4>
                        <p className="text-yellow-100 text-sm mb-2">Vous pouvez aussi tester depuis la console du navigateur :</p>
                        <div className="bg-black/30 p-3 rounded font-mono text-xs text-yellow-100 space-y-1">
                            <div>// Test simple</div>
                            <div>throw new Error("Test Sentry")</div>
                            <div></div>
                            <div>// Ou importer Sentry</div>
                            <div>import * as Sentry from '@sentry/react'</div>
                            <div>Sentry.captureMessage("Test message")</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
