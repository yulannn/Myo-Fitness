import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePremium } from '../../context/PremiumContext';
import { getImageUrl } from '../../utils/imageUtils'; // Ensure utils are imported
import {
    UserCircleIcon,
    BellIcon,
    ChatBubbleLeftRightIcon,
    ArrowRightOnRectangleIcon,
    KeyIcon,
    QueueListIcon,
    SparklesIcon,
    ShieldCheckIcon,
    ChevronRightIcon,
    BookOpenIcon,

} from '@heroicons/react/24/outline';
import api from '../../api/apiClient';
import { useQueryClient } from '@tanstack/react-query';

export default function Settings() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isPremium } = usePremium();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const queryClient = useQueryClient();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoadingShare, setIsLoadingShare] = useState(false);

    const handleToggleShare = async () => {
        if (!user) return;
        setIsLoadingShare(true);
        try {
            const newState = !user.shareActivities;
            await api.patch('/users/me', { shareActivities: newState });
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        } catch (error) {
            console.error('Failed to toggle share activities', error);
        } finally {
            setIsLoadingShare(false);
        }
    };

    // Navigation Handlers
    const handleMyProfile = () => navigate('/my-profile');
    const handleMyExercises = () => navigate('/my-exercises');
    const handleExercises = () => navigate('/exercises');
    const handleChangePassword = () => navigate('/change-password');
    const handlePremium = () => navigate('/premium');
    const handlePrivacy = () => navigate('/privacy');
    const handleNotifications = () => navigate('/notifications');
    const handleFeedback = () => navigate('/feedback');
    const handleLogoutClick = () => setShowLogoutModal(true);

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
            setShowLogoutModal(false);
            window.location.replace('/auth/login');
        }
    };

    // Sub-components for cleaner render
    const SettingsSection = ({ title, children }: { title: string, children: ReactNode }) => (
        <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">{title}</h3>
            <div className="bg-[#252527] rounded-2xl overflow-hidden border border-purple-500/10 divide-y divide-[#121214]">
                {children}
            </div>
        </div>
    );

    const SettingsItem = ({ icon: Icon, label, onClick, isDestructive = false, value }: any) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 hover:bg-[#121214]/50 transition-colors group ${isDestructive ? 'text-red-400 hover:text-red-300' : 'text-gray-200'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDestructive ? 'bg-red-500/10' : 'bg-[#121214] border border-purple-500/10 group-hover:border-purple-500/30'}`}>
                    <Icon className={`h-5 w-5 ${isDestructive ? 'text-red-400' : 'text-gray-400 group-hover:text-purple-400 transition-colors'}`} />
                </div>
                <span className={`font-medium ${isDestructive ? '' : 'group-hover:text-white transition-colors'}`}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {value && <span className="text-xs text-gray-500 font-medium">{value}</span>}
                <ChevronRightIcon className="h-4 w-4 text-gray-600 group-hover:text-gray-400" />
            </div>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Header Title */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Paramètres</h1>
                </div>

                {/* Compact Profile Card */}
                <div className="bg-gradient-to-r from-[#252527] to-[#1e1e20] p-4 rounded-2xl border border-purple-500/10 mb-8 flex items-center gap-4 relative overflow-hidden group hover:border-purple-500/30 transition-all cursor-pointer" onClick={handleMyProfile}>
                    {/* Decorative blur */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-[#121214] p-1 border border-purple-500/20">
                            {user?.profilePictureUrl ? (
                                <img src={getImageUrl(user.profilePictureUrl)} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-full h-full text-gray-600" />
                            )}
                        </div>
                        {isPremium && (
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-[#121214]">
                                PREMIUM
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-bold text-lg truncate">{user?.name}</h2>
                        <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                            {isPremium ? (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded-md">
                                    <SparklesIcon className="h-3 w-3" />
                                    Abonnement Actif
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-700/30 px-2 py-0.5 rounded-md">
                                    Plan Gratuit
                                </span>
                            )}
                        </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                </div>

                {/* Settings Groups */}
                <SettingsSection title="Compte">
                    <SettingsItem icon={UserCircleIcon} label="Informations personnelles" onClick={handleMyProfile} />
                    <SettingsItem icon={KeyIcon} label="Sécurité & Mot de passe" onClick={handleChangePassword} />
                    <SettingsItem
                        icon={SparklesIcon}
                        label="Abonnement"
                        value={isPremium ? "Premium" : "Gratuit"}
                        onClick={handlePremium}
                    />
                </SettingsSection>

                <SettingsSection title="Entraînement">
                    <SettingsItem icon={QueueListIcon} label="Mes exercices" onClick={handleMyExercises} />
                    <SettingsItem icon={BookOpenIcon} label="Bibliothèque d'exercices" onClick={handleExercises} />
                </SettingsSection>

                <SettingsSection title="Application">
                    <SettingsItem icon={BellIcon} label="Notifications" onClick={handleNotifications} />

                    <div className="w-full flex items-center justify-between p-4 bg-[#252527] border-t border-[#121214] first:border-t-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#121214] border border-purple-500/10">
                                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-200">Partager mes activités</span>
                                <span className="text-xs text-gray-500">Visible par mes amis</span>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleShare}
                            disabled={isLoadingShare}
                            className={`w-11 h-6 flex items-center rounded-full transition-colors duration-200 ease-in-out px-1 ${user?.shareActivities ? 'bg-purple-600' : 'bg-gray-700'
                                }`}
                        >
                            <span
                                className={`h-4 w-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${user?.shareActivities ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    <SettingsItem icon={ShieldCheckIcon} label="Politique de confidentialité" onClick={handlePrivacy} />
                    <SettingsItem icon={ChatBubbleLeftRightIcon} label="Envoyer un avis" onClick={handleFeedback} />
                </SettingsSection>

                <SettingsSection title="Zone de danger">
                    <SettingsItem icon={ArrowRightOnRectangleIcon} label="Se déconnecter" onClick={handleLogoutClick} isDestructive />
                </SettingsSection>

                {/* App Version */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-600 font-medium">MyoFitness v1.0.0</p>
                </div>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#252527] rounded-2xl shadow-2xl border border-red-500/20 max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ArrowRightOnRectangleIcon className="h-8 w-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Déconnexion</h2>
                            <p className="text-gray-400 text-sm">Voulez-vous vraiment vous déconnecter ?</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-300 bg-[#121214] hover:bg-[#1a1a1c] transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                disabled={isLoggingOut}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoggingOut ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Déconnecter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
