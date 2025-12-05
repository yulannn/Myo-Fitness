import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import api from '../../api/apiClient';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Cooldown pour renvoyer le code
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Redirection si pas d'email
    useEffect(() => {
        if (!email) {
            navigate('/auth/register');
        }
    }, [email, navigate]);

    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Seulement des chiffres

        const newCode = [...code];
        newCode[index] = value.slice(-1); // Prendre seulement le dernier caractère
        setCode(newCode);
        setError(null);

        // Auto-focus sur le prochain input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit si tous les champs sont remplis
        if (index === 5 && value) {
            const fullCode = [...newCode.slice(0, 5), value].join('');
            if (fullCode.length === 6) {
                handleVerify(fullCode);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        if (pastedData.length === 6) {
            const newCode = pastedData.split('');
            setCode(newCode);
            inputRefs.current[5]?.focus();
            handleVerify(pastedData);
        }
    };

    const handleVerify = async (verificationCode?: string) => {
        const codeToVerify = verificationCode || code.join('');

        if (codeToVerify.length !== 6) {
            setError('Veuillez entrer un code à 6 chiffres');
            return;
        }

        setIsVerifying(true);
        setError(null);

        try {
            await api.post('/auth/verify-email', {
                email,
                code: codeToVerify,
            });

            setSuccess(true);

            // Redirection vers login après 2 secondes
            setTimeout(() => {
                navigate('/auth/login', {
                    state: { message: 'Email vérifié ! Vous pouvez maintenant vous connecter.' }
                });
            }, 2000);
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Code invalide ou expiré. Veuillez réessayer.');
            }
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setIsResending(true);
        setError(null);

        try {
            await api.post('/auth/resend-verification', { email });
            setResendCooldown(60); // 60 secondes de cooldown
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Impossible de renvoyer le code. Réessayez plus tard.');
            }
        } finally {
            setIsResending(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="bg-[#252527] rounded-2xl shadow-2xl p-8 border border-[#94fbdd]/10">
                        <div className="mb-6">
                            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto animate-bounce" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Email vérifié !</h1>
                        <p className="text-gray-400">
                            Redirection vers la page de connexion...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-[#94fbdd] to-[#94fbdd]/70 bg-clip-text text-transparent mb-2">
                        Myo Fitness
                    </h1>
                    <p className="text-gray-400 text-sm">Transforme ton corps, transforme ta vie</p>
                </div>

                {/* Card */}
                <div className="bg-[#252527] rounded-2xl shadow-2xl p-8 border border-[#94fbdd]/10">
                    <div className="mb-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#94fbdd]/20 to-[#94fbdd]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <EnvelopeIcon className="h-8 w-8 text-[#94fbdd]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Vérifiez votre email</h2>
                        <p className="text-gray-400 text-sm">
                            Nous avons envoyé un code à 6 chiffres à
                        </p>
                        <p className="text-[#94fbdd] font-medium mt-1">{email}</p>
                    </div>

                    {/* Code Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                            Entrez le code de vérification
                        </label>
                        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-[#121214] border rounded-xl text-white focus:outline-none focus:ring-2 transition-all border-[#94fbdd]/20 focus:border-[#94fbdd] focus:ring-[#94fbdd]/30"
                                    disabled={isVerifying}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 text-center">
                            {error}
                        </div>
                    )}

                    {/* Verify Button */}
                    <button
                        onClick={() => handleVerify()}
                        disabled={isVerifying || code.some(d => !d)}
                        className={`w-full py-3 px-4 rounded-xl font-semibold text-[#121214] bg-[#94fbdd] hover:bg-[#94fbdd]/90 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all flex items-center justify-center gap-2 ${(isVerifying || code.some(d => !d)) ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-[#94fbdd]/20'
                            }`}
                    >
                        {isVerifying ? (
                            <>
                                <div className="w-5 h-5 border-2 border-[#121214]/30 border-t-[#121214] rounded-full animate-spin"></div>
                                Vérification...
                            </>
                        ) : (
                            'Vérifier le code'
                        )}
                    </button>

                    {/* Resend Code */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400 mb-2">
                            Vous n'avez pas reçu le code ?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={isResending || resendCooldown > 0}
                            className={`text-[#94fbdd] hover:text-[#94fbdd]/80 font-medium text-sm transition-colors ${(isResending || resendCooldown > 0) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isResending ? (
                                'Envoi en cours...'
                            ) : resendCooldown > 0 ? (
                                `Renvoyer le code (${resendCooldown}s)`
                            ) : (
                                'Renvoyer le code'
                            )}
                        </button>
                    </div>

                    {/* Info */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <p className="text-xs text-gray-500 text-center">
                            💡 Le code est valide pendant 24 heures
                        </p>
                    </div>
                </div>

                {/* Back to register */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/auth/register')}
                        className="text-gray-400 hover:text-[#94fbdd] text-sm transition-colors"
                    >
                        ← Retour à l'inscription
                    </button>
                </div>
            </div>
        </div>
    );
}
