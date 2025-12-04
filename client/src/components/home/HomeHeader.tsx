import { useAuth } from '../../context/AuthContext';

export default function HomeHeader() {
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    return (
        <div className="flex items-center justify-between gap-4 mb-6">
            {/* Greeting - Left side */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'Champion'}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    Prêt à t'entraîner aujourd'hui ?
                </p>
            </div>

            {/* XP Bar - Removed */}
        </div>
    );
}


