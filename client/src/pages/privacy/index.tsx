import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ShieldCheckIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    ClockIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    EnvelopeIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function Privacy() {
    const navigate = useNavigate()

    const [analyticsConsent, setAnalyticsConsent] = useState(false)
    const [marketingConsent, setMarketingConsent] = useState(false)

    // Handlers fantômes - à implémenter plus tard
    const handleExportData = () => {
        // TODO: Implémenter l'export des données utilisateur
    }

    const handleDeleteAccount = () => {
        // TODO: Implémenter la suppression de compte avec confirmation
    }

    const handleContactDPO = () => {
        // TODO: Implémenter le formulaire de contact DPO
    }

    const handleViewPrivacyPolicy = () => {
        // TODO: Afficher ou naviguer vers la politique complète
    }

    const handleViewTerms = () => {
        // TODO: Afficher ou naviguer vers les CGU
    }

    const handleViewConsentHistory = () => {
        // TODO: Afficher l'historique des consentements
    }

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Back button */}
                <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#94fbdd] transition-colors mb-4"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Retour</span>
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-[#94fbdd]/10 rounded-2xl">
                        <ShieldCheckIcon className="h-8 w-8 text-[#94fbdd]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Confidentialité & Données</h1>
                        <p className="text-sm text-gray-400">Gérez vos données et votre vie privée</p>
                    </div>
                </div>

                {/* Section: Documents légaux */}
                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-[#94fbdd]" />
                        Documents légaux
                    </h2>

                    <button
                        onClick={handleViewPrivacyPolicy}
                        className="w-full flex items-center justify-between p-4 bg-[#252527] border border-[#94fbdd]/20 hover:bg-[#94fbdd]/10 hover:border-[#94fbdd]/40 rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd]" />
                            <div className="text-left">
                                <p className="text-base font-medium text-gray-300 group-hover:text-[#94fbdd]">
                                    Politique de confidentialité
                                </p>
                                <p className="text-xs text-gray-500">
                                    Comment nous utilisons vos données
                                </p>
                            </div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd]" />
                    </button>

                    <button
                        onClick={handleViewTerms}
                        className="w-full flex items-center justify-between p-4 bg-[#252527] border border-[#94fbdd]/20 hover:bg-[#94fbdd]/10 hover:border-[#94fbdd]/40 rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd]" />
                            <div className="text-left">
                                <p className="text-base font-medium text-gray-300 group-hover:text-[#94fbdd]">
                                    Conditions d'utilisation
                                </p>
                                <p className="text-xs text-gray-500">
                                    Règles d'usage de l'application
                                </p>
                            </div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd]" />
                    </button>
                </section>

                {/* Section: Gestion des consentements */}
                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-[#94fbdd]" />
                        Gestion des consentements
                    </h2>

                    <div className="bg-[#252527] border border-[#94fbdd]/20 rounded-xl p-4 space-y-4">
                        {/* Cookies essentiels */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-base font-medium text-gray-300">Cookies essentiels</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Nécessaires au fonctionnement de l'app (obligatoires)
                                </p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <div className="w-12 h-6 bg-[#94fbdd]/20 rounded-full flex items-center px-1 opacity-50 cursor-not-allowed">
                                    <div className="w-4 h-4 bg-[#94fbdd] rounded-full ml-auto shadow-lg"></div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#94fbdd]/10">
                            <div className="flex-1">
                                <p className="text-base font-medium text-gray-300">Analytics</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Nous aide à améliorer l'application
                                </p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <button
                                    onClick={() => setAnalyticsConsent(!analyticsConsent)}
                                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${analyticsConsent ? 'bg-[#94fbdd]' : 'bg-gray-600'
                                        }`}
                                >
                                    <div
                                        className={`w-4 h-4 bg-white rounded-full shadow-lg transition-all ${analyticsConsent ? 'ml-auto' : ''
                                            }`}
                                    ></div>
                                </button>
                            </div>
                        </div>

                        {/* Marketing */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#94fbdd]/10">
                            <div className="flex-1">
                                <p className="text-base font-medium text-gray-300">Marketing</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Personnalisation de votre expérience
                                </p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <button
                                    onClick={() => setMarketingConsent(!marketingConsent)}
                                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${marketingConsent ? 'bg-[#94fbdd]' : 'bg-gray-600'
                                        }`}
                                >
                                    <div
                                        className={`w-4 h-4 bg-white rounded-full shadow-lg transition-all ${marketingConsent ? 'ml-auto' : ''
                                            }`}
                                    ></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleViewConsentHistory}
                        className="w-full flex items-center justify-between p-4 bg-[#252527] border border-[#94fbdd]/20 hover:bg-[#94fbdd]/10 hover:border-[#94fbdd]/40 rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <ClockIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd]" />
                            <p className="text-base font-medium text-gray-300 group-hover:text-[#94fbdd]">
                                Historique des consentements
                            </p>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd]" />
                    </button>
                </section>

                {/* Section: Vos droits RGPD */}
                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ShieldCheckIcon className="h-5 w-5 text-[#94fbdd]" />
                        Vos droits RGPD
                    </h2>

                    {/* Droit d'accès - Export */}
                    <button
                        onClick={handleExportData}
                        className="w-full flex items-center justify-between p-4 bg-[#252527] border border-[#94fbdd]/20 hover:bg-[#94fbdd]/10 hover:border-[#94fbdd]/40 rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <ArrowDownTrayIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd]" />
                            <div className="text-left">
                                <p className="text-base font-medium text-gray-300 group-hover:text-[#94fbdd]">
                                    Télécharger mes données
                                </p>
                                <p className="text-xs text-gray-500">
                                    Droit d'accès - Export complet en JSON
                                </p>
                            </div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd]" />
                    </button>

                    {/* Droit à l'oubli */}
                    <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <TrashIcon className="h-5 w-5 text-red-400" />
                            <div className="text-left">
                                <p className="text-base font-medium text-red-300">
                                    Supprimer mon compte
                                </p>
                                <p className="text-xs text-red-400/70">
                                    Droit à l'oubli - Suppression définitive
                                </p>
                            </div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-red-400" />
                    </button>
                </section>

                {/* Section: Délégué à la protection des données */}
                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <EnvelopeIcon className="h-5 w-5 text-[#94fbdd]" />
                        Contact
                    </h2>

                    <button
                        onClick={handleContactDPO}
                        className="w-full flex items-center justify-between p-4 bg-[#252527] border border-[#94fbdd]/20 hover:bg-[#94fbdd]/10 hover:border-[#94fbdd]/40 rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd]" />
                            <div className="text-left">
                                <p className="text-base font-medium text-gray-300 group-hover:text-[#94fbdd]">
                                    Contacter le DPO
                                </p>
                                <p className="text-xs text-gray-500">
                                    Délégué à la Protection des Données
                                </p>
                            </div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-[#94fbdd]" />
                    </button>
                </section>

                {/* Info Box */}
                <div className="bg-[#94fbdd]/5 border border-[#94fbdd]/20 rounded-xl p-4">
                    <p className="text-xs text-gray-400 leading-relaxed">
                        <span className="font-semibold text-[#94fbdd]">Vos données sont protégées.</span> Conformément au RGPD,
                        vous disposez d'un droit d'accès, de rectification, d'opposition et de suppression de vos données personnelles.
                        Pour exercer ces droits, contactez notre DPO.
                    </p>
                </div>

                {/* Version et dernière mise à jour */}
                <div className="text-center pt-4 space-y-1">
                    <p className="text-xs text-gray-500">
                        Politique mise à jour le 9 décembre 2025
                    </p>
                    <p className="text-xs text-gray-600">
                        Version 1.0
                    </p>
                </div>
            </div>
        </div>
    )
}
