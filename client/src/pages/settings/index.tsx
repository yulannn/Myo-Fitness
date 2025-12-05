import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    UserCircleIcon,
    BellIcon,
    ChatBubbleLeftRightIcon,
    ArrowRightOnRectangleIcon,
    KeyIcon
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

    const handleMyProfile = () => {
        navigate('/my-profile');
    };

    const handleChangePassword = () => {
        navigate('/change-password');
    };

    const handleNotifications = () => {
        // Pas de logique pour le moment
        console.log('Notifications clicked');
    };

    const handleFeedback = () => {
        // Pas de logique pour le moment
        console.log('Feedback clicked');
    };

    const handleLogout = async () => {
        await logout();
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
                        onClick={handleLogout}
                        variant="danger"
                    />
                </section>
            </div>
        </div>
    );
}
