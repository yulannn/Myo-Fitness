import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import api from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

interface FormValues {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

const initialValues: FormValues = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
};

export default function ChangePassword() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [formValues, setFormValues] = useState<FormValues>(initialValues);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormError(null);
        setSuccessMessage(null);
        setFormValues((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        setSuccessMessage(null);

        // Validation locale
        if (!formValues.currentPassword) {
            setFormError('Veuillez entrer votre mot de passe actuel');
            return;
        }

        if (!formValues.newPassword) {
            setFormError('Veuillez entrer un nouveau mot de passe');
            return;
        }

        if (formValues.newPassword.length < 8) {
            setFormError('Le nouveau mot de passe doit contenir au moins 8 caractères');
            return;
        }

        if (formValues.newPassword !== formValues.confirmNewPassword) {
            setFormError('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        if (formValues.currentPassword === formValues.newPassword) {
            setFormError('Le nouveau mot de passe doit être différent de l\'ancien');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/users/me/change-password', {
                currentPassword: formValues.currentPassword,
                newPassword: formValues.newPassword,
            });

            setSuccessMessage(response.data.message || 'Votre mot de passe a été modifié avec succès. Vous allez être déconnecté...');
            setFormValues(initialValues);

            // Déconnecter l'utilisateur et rediriger vers la page de login après 2 secondes
            setTimeout(async () => {
                await logout();
                navigate('/auth/login', { replace: true });
            }, 2000);
        } catch (error: any) {
            if (error.response?.data?.message) {
                setFormError(error.response.data.message);
            } else if (error.response?.status === 401) {
                setFormError('Le mot de passe actuel est incorrect');
            } else {
                setFormError('Une erreur s\'est produite. Veuillez réessayer.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header avec bouton retour */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#94fbdd] transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span>Retour aux paramètres</span>
                    </button>
                    <h1 className="text-2xl font-bold text-white">Modifier mon mot de passe</h1>
                    <p className="text-gray-400 text-sm mt-2">
                        Pour votre sécurité, assurez-vous d'utiliser un mot de passe fort et unique
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[#252527] rounded-2xl shadow-2xl p-8 border border-[#94fbdd]/10">
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        {/* Current Password Field */}
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Mot de passe actuel
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type={showPasswords.current ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={formValues.currentPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-3 bg-[#121214] border border-[#94fbdd]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#94fbdd] focus:ring-[#94fbdd]/30 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('current')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#94fbdd] transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPasswords.current ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* New Password Field */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPasswords.new ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={formValues.newPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-3 bg-[#121214] border border-[#94fbdd]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#94fbdd] focus:ring-[#94fbdd]/30 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#94fbdd] transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPasswords.new ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Au moins 8 caractères
                            </p>
                        </div>

                        {/* Confirm New Password Field */}
                        <div>
                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirmer le nouveau mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    type={showPasswords.confirm ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={formValues.confirmNewPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-3 bg-[#121214] border border-[#94fbdd]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#94fbdd] focus:ring-[#94fbdd]/30 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#94fbdd] transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPasswords.confirm ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {formError && (
                            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400" role="alert">
                                {formError}
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400 flex items-center gap-2" role="alert">
                                <CheckIcon className="h-5 w-5" />
                                {successMessage}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 px-4 rounded-xl font-semibold text-[#121214] bg-[#94fbdd] hover:bg-[#94fbdd]/90 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:ring-offset-2 focus:ring-offset-[#252527] transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'shadow-lg shadow-[#94fbdd]/20'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#121214]/30 border-t-[#121214] rounded-full animate-spin"></div>
                                    Modification en cours...
                                </>
                            ) : (
                                <>
                                    <LockClosedIcon className="h-5 w-5" />
                                    Modifier mon mot de passe
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-[#252527]/50 rounded-xl p-4 border border-[#94fbdd]/5">
                    <h3 className="text-white font-medium text-sm mb-2">Conseils de sécurité</h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Utilisez un mot de passe unique pour chaque service</li>
                        <li>• Combinez lettres, chiffres et caractères spéciaux</li>
                        <li>• Évitez les informations personnelles facilement devinables</li>
                        <li>• Changez régulièrement vos mots de passe</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
