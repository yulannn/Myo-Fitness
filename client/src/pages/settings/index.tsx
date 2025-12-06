import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    UserCircleIcon,
    BellIcon,
    ChatBubbleLeftRightIcon,
    ArrowRightOnRectangleIcon,
    KeyIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface SettingButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
}

function SettingButton({ icon, label, onClick, variant = 'default' }: SettingButtonProps) {
    const baseClasses = "w-full flex items-center gap-4 p-4 rounded-xl border transition-all group";
    const variantClasses = variant === 'danger'
        ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40"
        : "bg-[#252527] border-[#94fbdd]/20 hover:bg-[#94fbdd]/10 hover:border-[#94fbdd]/40";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses}`}
        >
            <div className={variant === 'danger' ? 'text-red-400' : 'text-gray-400 group-hover:text-[#94fbdd]'}>
                {icon}
            </div>
            <span className={`text-lg font-medium ${variant === 'danger' ? 'text-red-300' : 'text-gray-300 group-hover:text-[#94fbdd]'}`}>
                {label}
            </span>
        </button>
    );
}

export default function Settings() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleMyProfile = () => {
        navigate('/my-profile');
    };

    const handleChangePassword = () => {
        navigate('/change-password');
    };

    const handlePremium = () => {
        navigate('/premium');
    };

    const handleNotifications = () => {
        // Pas de logique pour le moment
        console.log('Notifications clicked');
    };

    const handleFeedback = () => {
        // Pas de logique pour le moment
        console.log('Feedback clicked');
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        setIsLoggingOut(false);
        setShowLogoutModal(false);
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
                {/* Header */}
                <h1 className="text-xl font-bold text-white">Paramètres</h1>

                {/* Settings Buttons */}
                <section className="space-y-4">
                    <SettingButton
                        icon={<UserCircleIcon className="h-6 w-6" />}
                        label="Mon profil"
                        onClick={handleMyProfile}
                    />

                    <SettingButton
                        icon={<SparklesIcon className="h-6 w-6" />}
                        label="Mon abonnement Premium"
                        onClick={handlePremium}
                    />

                    <SettingButton
                        icon={<KeyIcon className="h-6 w-6" />}
                        label="Modifier mon mot de passe"
                        onClick={handleChangePassword}
                    />

                    <SettingButton
                        icon={<BellIcon className="h-6 w-6" />}
                        label="Activer les notifications"
                        onClick={handleNotifications}
                    />

                    <SettingButton
                        icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
                        label="Feedback"
                        onClick={handleFeedback}
                    />

                    <SettingButton
                        icon={<ArrowRightOnRectangleIcon className="h-6 w-6" />}
                        label="Se déconnecter"
                        onClick={handleLogoutClick}
                        variant="danger"
                    />
                </section>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#252527] rounded-2xl shadow-2xl border border-[#94fbdd]/10 max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                                <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-white text-center mb-2">
                            Se déconnecter ?
                        </h2>

                        {/* Message */}
                        <p className="text-gray-400 text-center mb-6">
                            Es-tu sûr de vouloir te déconnecter ? Tu devras te reconnecter pour accéder à ton compte.
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelLogout}
                                disabled={isLoggingOut}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-300 bg-[#121214] hover:bg-[#1a1a1c] border border-gray-700 hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                disabled={isLoggingOut}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                            >
                                {isLoggingOut ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Déconnexion...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                        Déconnexion
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Close button (X) */}
                        <button
                            onClick={handleCancelLogout}
                            disabled={isLoggingOut}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                            aria-label="Fermer"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
