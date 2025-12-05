import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyIcon, CheckCircleIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthFetchDataService from '../../api/services/authService';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailFromUrl = searchParams.get('email') || '';
    const codeFromUrl = searchParams.get('code') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!emailFromUrl || !codeFromUrl) {
            navigate('/forgot-password');
        }
    }, [emailFromUrl, codeFromUrl, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (newPassword.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setIsLoading(true);

        try {
            await AuthFetchDataService.resetPassword(emailFromUrl, codeFromUrl, newPassword);
            setSuccess(true);

            // Rediriger vers login après 2 secondes
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Code invalide ou expiré');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-[#252527] rounded-3xl p-8 border border-green-500/30 shadow-2xl text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
                            <CheckCircleIcon className="h-12 w-12 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Mot de passe réinitialisé !
                        </h2>
                        <p className="text-gray-400 mb-2">
                            Votre mot de passe a été modifié avec succès.
                        </p>
                        <p className="text-gray-500 text-sm mb-6">
                            📧 Un email de confirmation vient de vous être envoyé. Redirection vers la page de connexion...
                        </p>
                        <div className="w-16 h-1 bg-gradient-to-r from-[#94fbdd] to-[#6dd4b8] mx-auto rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Bouton Annuler */}
                <button
                    onClick={() => navigate('/login')}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#94fbdd] transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>Annuler</span>
                </button>

                {/* Card */}
                <div className="bg-[#252527] rounded-3xl p-8 border border-[#94fbdd]/20 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#94fbdd]/10 rounded-2xl mb-4">
                            <KeyIcon className="h-8 w-8 text-[#94fbdd]" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Nouveau mot de passe
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Choisissez un mot de passe sécurisé pour votre compte
                        </p>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nouveau mot de passe */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    autoFocus
                                    className="w-full pl-11 pr-12 py-3 bg-[#121214] border border-[#94fbdd]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#94fbdd] transition-colors"
                                    placeholder="Minimum 8 caractères"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#94fbdd] transition-colors"
                                    tabIndex={-1}
                                >
                                    {showNewPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirmer mot de passe */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full pl-11 pr-12 py-3 bg-[#121214] border border-[#94fbdd]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#94fbdd] transition-colors"
                                    placeholder="Retapez votre mot de passe"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#94fbdd] transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Message d'erreur */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Bouton Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !newPassword || !confirmPassword}
                            className="w-full py-3 bg-gradient-to-r from-[#94fbdd] to-[#6dd4b8] text-[#121214] font-bold rounded-xl hover:shadow-lg hover:shadow-[#94fbdd]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
