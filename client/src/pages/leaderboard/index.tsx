import React, { useState } from 'react';
import { useFriendsLeaderboard, useLeaderboardTypes } from '../../api/hooks/leaderboard/useLeaderboard';
import { LeaderboardType } from '../../types/leaderboard.type';
import LeaderboardCard from '../../components/leaderboard/LeaderboardCard';
import { Trophy, Users, Loader2, TrendingUp, Flame, Dumbbell, Award, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Podium Component ---
const Podium: React.FC<{ topThree: any[], type: string }> = ({ topThree, type }) => {
    // Organiser l'ordre : 2ème (gauche), 1er (centre), 3ème (droite)
    const first = topThree.find(e => e.rank === 1);
    const second = topThree.find(e => e.rank === 2);
    const third = topThree.find(e => e.rank === 3);

    // Fonction de formatage (dupliquée pour l'indépendance du composant)
    const formatValue = (val: number, type: string) => {
        if (!val) return '0';
        switch (type) {
            case 'TOTAL_VOLUME': return val >= 1000 ? `${(val / 1000).toFixed(1)}t` : `${val.toFixed(0)} kg`;
            case 'CURRENT_STREAK': return `${val}j`;
            case 'TOTAL_SESSIONS': return `${val}`;
            case 'LEVEL': return `Niv ${val}`;
            default: return val.toString();
        }
    };

    const PodiumItem = ({ entry, position }: { entry: any, position: 'first' | 'second' | 'third' }) => {
        if (!entry) return <div className="w-1/3" />; // Placeholder si pas assez d'utilisateurs

        const height = position === 'first' ? 'h-40' : position === 'second' ? 'h-32' : 'h-24';
        const color = position === 'first' ? 'bg-gradient-to-t from-yellow-500/20 to-yellow-500/5 border-yellow-500/30' :
            position === 'second' ? 'bg-gradient-to-t from-gray-400/20 to-gray-400/5 border-gray-400/30' :
                'bg-gradient-to-t from-amber-700/20 to-amber-700/5 border-amber-700/30';

        const ringColor = position === 'first' ? 'ring-yellow-500' :
            position === 'second' ? 'ring-gray-400' : 'ring-amber-700';

        return (
            <div className={`flex flex-col items-center w-1/3 ${position === 'first' ? '-mt-12 z-10' : ''}`}>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                    className="relative mb-3"
                >
                    {position === 'first' && (
                        <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500 fill-yellow-500 animate-bounce" />
                    )}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 ${ringColor} shadow-lg overflow-hidden relative bg-[#18181b]`}>
                        {entry.profilePictureUrl ? (
                            <img src={entry.profilePictureUrl} alt={entry.userName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500 bg-[#27272a]">
                                {entry.userName.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-sm ${position === 'first' ? 'bg-yellow-500' : position === 'second' ? 'bg-gray-400' : 'bg-amber-700'}`}>
                        {position === 'first' ? '1er' : position === 'second' ? '2ème' : '3ème'}
                    </div>
                </motion.div>

                <div className="text-center mb-2 px-1">
                    <p className={`font-bold text-sm sm:text-base truncate max-w-full ${entry.isCurrentUser ? 'text-[#94fbdd]' : 'text-white'}`}>
                        {entry.userName}
                    </p>
                    <p className="text-xs font-mono text-gray-400">
                        {formatValue(entry.value, type)}
                    </p>
                </div>

                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: height === 'h-40' ? 160 : height === 'h-32' ? 128 : 96 }}
                    className={`w-full rounded-t-lg border-x border-t backdrop-blur-sm ${color} relative overflow-hidden`}
                >
                    {/* Glossy effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                </motion.div>
            </div>
        );
    };

    return (
        <div className="flex items-end justify-center gap-2 sm:gap-4 w-full max-w-lg mx-auto mb-10 mt-20 px-4 h-64">
            <PodiumItem entry={second} position="second" />
            <PodiumItem entry={first} position="first" />
            <PodiumItem entry={third} position="third" />
        </div>
    );
};

const LeaderboardPage: React.FC = () => {
    const [selectedType, setSelectedType] = useState<LeaderboardType>(LeaderboardType.TOTAL_SESSIONS);

    const { data: leaderboard, isLoading, error } = useFriendsLeaderboard(selectedType);
    const { data: types } = useLeaderboardTypes();

    const topThree = leaderboard?.entries.filter(e => e.rank <= 3) || [];


    const getTypeIcon = (type: string) => {
        switch (type) {
            case LeaderboardType.TOTAL_SESSIONS: return <Dumbbell className="w-4 h-4" />;
            case LeaderboardType.CURRENT_STREAK: return <Flame className="w-4 h-4" />;
            case LeaderboardType.LEVEL: return <Award className="w-4 h-4" />;
            case LeaderboardType.TOTAL_VOLUME: return <TrendingUp className="w-4 h-4" />;
            default: return <Trophy className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            {/* Modern Header */}
            <div className="sticky top-0 z-30 bg-[#121214]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-[#94fbdd]" />
                            <h1 className="text-xl font-black text-white tracking-tight">
                                CLASSEMENT
                            </h1>
                        </div>
                        {leaderboard && (
                            <div className="text-xs font-bold px-3 py-1 bg-[#18181b] rounded-full text-gray-400 border border-white/5">
                                {leaderboard.totalParticipants} participants
                            </div>
                        )}
                    </div>

                    {/* Grid Type Selector (Mobile First) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        {types?.map((typeInfo) => (
                            <button
                                key={typeInfo.type}
                                onClick={() => setSelectedType(typeInfo.type as LeaderboardType)}
                                className={`
                                    flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-2 py-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border
                                    ${selectedType === typeInfo.type
                                        ? 'bg-[#94fbdd] text-[#121214] border-[#94fbdd] shadow-[0_0_15px_rgba(148,251,221,0.2)]'
                                        : 'bg-[#18181b] text-gray-400 border-white/5 hover:border-white/10 hover:bg-[#27272a]'
                                    }
                                `}
                            >
                                <div className={selectedType === typeInfo.type ? 'text-[#121214]' : 'text-[#94fbdd]'}>
                                    {getTypeIcon(typeInfo.type)}
                                </div>
                                <span className="truncate max-w-full">{typeInfo.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4">
                {error && (
                    <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center">
                        Erreur lors du chargement du classement
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#94fbdd] mb-4" />
                        <p className="text-gray-500 font-medium">Calcul des scores...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedType}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Empty State */}
                            {leaderboard?.entries.length === 0 && (
                                <div className="text-center py-20 px-8">
                                    <div className="w-20 h-20 bg-[#18181b] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                        <Users className="w-10 h-10 text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white">C'est calme ici...</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        Invitez vos amis pour commencer la compétition et voir qui est le meilleur !
                                    </p>
                                </div>
                            )}

                            {/* Podium for Top 3 (Featured) */}
                            {topThree.length > 0 && (
                                <Podium topThree={topThree} type={selectedType} />
                            )}

                            {/* Divider with Pyramid Delimitation */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="h-px bg-white/10 flex-1" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Tous les participants
                                </span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            {/* Full List (All Positions) */}
                            <div className="bg-[#18181b] rounded-xl border border-white/5 overflow-hidden mb-6">
                                {leaderboard?.entries.map((entry, index) => (
                                    <LeaderboardCard
                                        key={entry.userId}
                                        entry={entry}
                                        type={selectedType}
                                        index={index}
                                    />
                                ))}
                            </div>


                        </motion.div>
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
};

export default LeaderboardPage;
