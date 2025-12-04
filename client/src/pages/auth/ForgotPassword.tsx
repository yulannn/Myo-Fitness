import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import AuthFetchDataService from '../../api/services/authService';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await AuthFetchDataService.forgotPassword(email);
            // Rediriger vers la page de vérification du code
            navigate(`/verify-code?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Bouton Retour */}
                <button
                    onClick={() => navigate('/login')}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#94fbdd] transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>Retour à la connexion</span>
                </button>

                {/* Card */}
                <div className="bg-[#252527] rounded-3xl p-8 border border-[#94fbdd]/20 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#94fbdd]/10 rounded-2xl mb-4">
                            <EnvelopeIcon className="h-8 w-8 text-[#94fbdd]" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Mot de passe oublié ?
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Entrez votre adresse email et nous vous enverrons un code de vérification.
                        </p>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Adresse email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[#121214] border border-[#94fbdd]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#94fbdd] transition-colors"
                                placeholder="votre.email@example.com"
                            />
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
                            disabled={isLoading || !email}
                            className="w-full py-3 bg-gradient-to-r from-[#94fbdd] to-[#6dd4b8] text-[#121214] font-bold rounded-xl hover:shadow-lg hover:shadow-[#94fbdd]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Envoi en cours...' : 'Envoyer le code'}
                        </button>
                    </form>

                    {/* Info supplémentaire */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Le code de vérification sera valide pendant 15 minutes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
