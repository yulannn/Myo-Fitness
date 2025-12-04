import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import AuthFetchDataService from '../../api/services/authService';

export default function VerifyCode() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailFromUrl = searchParams.get('email') || '';

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!emailFromUrl) {
            navigate('/forgot-password');
        }
    }, [emailFromUrl, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (code.length !== 6) {
            setError('Le code doit contenir 6 chiffres');
            return;
        }

        setIsLoading(true);

        try {
            // Vérifier le code avec le backend
            await AuthFetchDataService.verifyCode(emailFromUrl, code);

            // Si valide, passer au changement de mot de passe
            navigate(`/reset-password?email=${encodeURIComponent(emailFromUrl)}&code=${code}`);
        } catch (err: any) {
            setError(err.message || 'Code invalide ou expiré');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Bouton Retour */}
                <button
                    onClick={() => navigate('/forgot-password')}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#94fbdd] transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>Retour</span>
                </button>

                {/* Card */}
                <div className="bg-[#252527] rounded-3xl p-8 border border-[#94fbdd]/20 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#94fbdd]/10 rounded-2xl mb-4">
                            <ShieldCheckIcon className="h-8 w-8 text-[#94fbdd]" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Vérification
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Entrez le code à 6 chiffres envoyé à <span className="text-[#94fbdd] font-medium">{emailFromUrl}</span>
                        </p>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Code de vérification */}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                                Code de vérification
                            </label>
                            <input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                maxLength={6}
                                autoFocus
                                className="w-full px-4 py-4 bg-[#121214] border border-[#94fbdd]/20 rounded-xl text-white text-center text-3xl font-bold tracking-[0.5em] placeholder-gray-500 focus:outline-none focus:border-[#94fbdd] transition-colors"
                                placeholder="••••••"
                            />
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                Le code expire dans 15 minutes
                            </p>
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
                            disabled={code.length !== 6 || isLoading}
                            className="w-full py-3 bg-gradient-to-r from-[#94fbdd] to-[#6dd4b8] text-[#121214] font-bold rounded-xl hover:shadow-lg hover:shadow-[#94fbdd]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Vérification...' : 'Vérifier le code'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
