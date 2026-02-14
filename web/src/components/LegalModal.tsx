import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function LegalModal({ type, onClose }) {
    if (!type) return null;

    const isPrivacy = type === 'privacy';
    const isContact = type === 'contact';

    let title = 'Conditions Générales d\'Utilisation';
    if (isPrivacy) title = 'Politique de Confidentialité';
    if (isContact) title = 'Contact';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#121212] border border-white/10 w-full max-w-3xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#121212] sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto text-gray-300 space-y-8 leading-relaxed text-sm md:text-base">

                    {/* DISCLAIMER */}
                    <div className="border-l-2 border-gray-600 pl-4 py-1">
                        <p className="text-gray-400 text-sm italic">
                            Note : Myo Fitness n'est pas une marque déposée. Ce site est une ébauche pour une application en cours de développement.
                        </p>
                    </div>

                    {isPrivacy ? (
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-white font-medium mb-2">1. Collecte des données</h3>
                                <p>
                                    Dans le cadre du développement de Myo Fitness, nous pouvons être amenés à collecter certaines données techniques à des fins de test et d'amélioration.
                                    Aucune donnée personnelle sensible n'est stockée de manière permanente durant cette phase d'ébauche.
                                </p>
                            </section>
                            <section>
                                <h3 className="text-white font-medium mb-2">2. Utilisation des données</h3>
                                <p>
                                    Les données collectées servent uniquement à :
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                                        <li>Améliorer les fonctionnalités de l'application.</li>
                                        <li>Corriger les bugs et optimiser les performances.</li>
                                        <li>Analyser l'utilisation pour guider le développement.</li>
                                    </ul>
                                </p>
                            </section>
                        </div>
                    ) : isContact ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <p className="text-gray-300">
                                Pour toute question ou suggestion :
                            </p>
                            <a
                                href="mailto:myofitnessapp@gmail.com"
                                className="text-lg text-white hover:text-gray-300 transition-colors border-b border-white/20 pb-1"
                            >
                                myofitnessapp@gmail.com
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-white font-medium mb-2">1. Objet</h3>
                                <p>
                                    Les présentes CGU ont pour objet de définir les modalités de mise à disposition du site et de l'application Myo Fitness (version ébauche).
                                </p>
                            </section>
                            <section>
                                <h3 className="text-white font-medium mb-2">2. Propriété Intellectuelle</h3>
                                <p>
                                    Bien que "Myo Fitness" ne soit pas encore une marque déposée, l'ensemble du design, du code et des concepts présentés restent la propriété de leurs créateurs respectifs durant cette phase de développement.
                                </p>
                            </section>
                            <section>
                                <h3 className="text-white font-medium mb-2">3. Responsabilité</h3>
                                <p>
                                    L'application étant en cours de développement, elle est fournie "telle quelle". Nous ne saurions être tenus responsables d'éventuels bugs, pertes de données ou dysfonctionnements survenant lors de l'utilisation de cette version de test.
                                </p>
                            </section>
                        </div>
                    )}

                    <section className="pt-8 border-t border-white/5 mt-8">
                        <p className="text-xs text-gray-500">
                            Dernière mise à jour : Janvier 2026
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
