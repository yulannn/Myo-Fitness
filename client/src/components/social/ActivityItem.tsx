import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    TrophyIcon,
    FireIcon,
    CheckCircleIcon,
    CalendarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    StarIcon
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/apiClient';

const REACTION_TYPES = [
    { emoji: '💪', label: 'Strong' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '👏', label: 'Clap' },
    { emoji: '🏆', label: 'Trophy' },
];

// Types for session details
interface SessionPerformance {
    set_index: number;
    reps_effectuees: number | null;
    weight: number | null;
    rpe: number | null;
    success: boolean | null;
}

interface SessionExercise {
    id: number;
    sets: number;
    reps: number;
    weight: number | null;
    duration?: number | null; // 🆕 Pour cardio
    exercice: {
        name: string;
        type?: string | null; // 🆕 Pour détecter cardio
        groupes: { groupe: { name: string } }[];
    };
    performances: SessionPerformance[];
}

interface SessionDetails {
    id: number;
    sessionName: string | null;
    performedAt: string | null;
    duration: number | null;
    exercices: SessionExercise[];
    summary: {
        totalSets: number;
        totalReps: number;
        totalVolume: number;
        avgRPE: number | null;
        caloriesBurned: number | null;
        muscleGroups: string[];
    } | null;
}

export default function ActivityItem({ activity, onReact }: { activity: any, onReact: (id: number, emoji: string) => void }) {
    const { user } = useAuth();
    const [isReacting, setIsReacting] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const myReaction = activity.reactions.find((r: any) => r.user.id === user?.id);

    const handleReaction = async (emoji: string) => {
        setIsReacting(true);
        try {
            await onReact(activity.id, emoji);
        } finally {
            setIsReacting(false);
        }
    };

    const handleShowDetails = async () => {
        if (showDetails) {
            setShowDetails(false);
            return;
        }

        // Only fetch if we don't have the data yet
        if (!sessionDetails && activity.data?.sessionId) {
            setIsLoadingDetails(true);
            try {
                const { data } = await api.get(`/activity/session/${activity.data.sessionId}/details`);
                setSessionDetails(data);
            } catch (error) {
                console.error('Failed to fetch session details:', error);
            } finally {
                setIsLoadingDetails(false);
            }
        }
        setShowDetails(true);
    };

    const renderIcon = () => {
        switch (activity.type) {
            case 'SESSION_COMPLETED': return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
            case 'PERSONAL_RECORD': return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
            case 'PROGRAM_COMPLETED': return <CalendarIcon className="h-6 w-6 text-purple-500" />;
            case 'STREAK_REACHED': return <FireIcon className="h-6 w-6 text-orange-500" />;
            case 'BADGE_UNLOCKED': return <StarIcon className="h-6 w-6 text-indigo-400" />;
            default: return <CheckCircleIcon className="h-6 w-6 text-gray-500" />;
        }
    };

    const renderContent = () => {
        const data = activity.data;
        switch (activity.type) {
            case 'SESSION_COMPLETED':
                return (
                    <div>
                        <p className="text-sm text-gray-300">
                            <span className="font-bold text-white">{activity.user.name}</span> a terminé la séance <span className="text-[#94fbdd]">{data.sessionName}</span>
                        </p>
                        {data.programName && <p className="text-xs text-gray-500 mt-0.5">{data.programName}</p>}
                    </div>
                );
            case 'PERSONAL_RECORD':
                return (
                    <div>
                        <p className="text-sm text-gray-300">
                            <span className="font-bold text-white">{activity.user.name}</span> a battu son record !
                        </p>
                        <p className="text-sm font-semibold text-yellow-400 mt-1">{data.exerciseName}: {data.value}</p>
                    </div>
                );
            case 'BADGE_UNLOCKED':
                return (
                    <div>
                        <p className="text-sm text-gray-300">
                            <span className="font-bold text-white">{activity.user.name}</span> a débloqué le badge <span className="text-indigo-400 font-bold">{data.badgeName || 'Inconnu'}</span> !
                        </p>
                        {data.badgeIcon && (
                            <div className="mt-2 bg-white/5 p-2 rounded-lg inline-flex items-center gap-3 border border-white/10">
                                <img src={data.badgeIcon} alt={data.badgeName} className="w-10 h-10 object-contain drop-shadow-lg" />
                                <div>
                                    <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Badge débloqué</p>
                                    <p className="font-bold text-white">{data.badgeName}</p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <p className="text-sm text-gray-300">
                        <span className="font-bold text-white">{activity.user.name}</span> a accompli quelque chose.
                    </p>
                )
        }
    };

    const renderSessionDetails = () => {
        if (!sessionDetails) return <p>Aucune données disponible</p>;

        // Format volume: kg if < 1000, otherwise tonnes
        const formatVolume = (volume: number) => {
            if (volume >= 1000) {
                return `${(volume / 1000).toFixed(1)}t`;
            }
            return `${Math.round(volume)} kg`;
        };

        return (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-4 animate-fadeIn">
                {/* Summary Stats */}
                {sessionDetails.summary && (
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-white">{sessionDetails.summary.totalSets}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Séries</p>
                        </div>
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-white">{sessionDetails.summary.totalReps}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Reps</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#94fbdd]/10 to-[#94fbdd]/5 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-[#94fbdd]">{formatVolume(sessionDetails.summary.totalVolume)}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Volume</p>
                        </div>
                    </div>
                )}

                {/* Exercises List */}
                <div className="space-y-3">
                    {sessionDetails.exercices.map((ex) => {
                        const isCardio = ex.exercice.type === 'CARDIO';

                        return (
                            <div key={ex.id} className="bg-white/[0.03] rounded-xl overflow-hidden">
                                {/* Exercise Header */}
                                <div className="flex items-center justify-between px-3 py-2.5 bg-white/5">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-white text-sm">{ex.exercice.name}</h4>
                                        {isCardio && (
                                            <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-medium">
                                                Cardio
                                            </span>
                                        )}
                                    </div>
                                    {ex.exercice.groupes[0] && (
                                        <span className="text-[10px] text-[#94fbdd] bg-[#94fbdd]/10 px-2 py-0.5 rounded-full font-medium">
                                            {ex.exercice.groupes[0].groupe.name}
                                        </span>
                                    )}
                                </div>

                                {/* Cardio: Affichage spécial durée */}
                                {isCardio ? (
                                    <div className="px-3 py-3">
                                        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-[#94fbdd]/10 rounded-lg">
                                            <span className="text-lg font-bold text-[#94fbdd]">
                                                {ex.duration || ex.reps || 15} minutes
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Standard: Affichage sets/reps/poids */
                                    <>
                                        {/* Performances Table */}
                                        {ex.performances.length > 0 ? (
                                            <div className="px-3 py-2">
                                                {/* Table Header */}
                                                <div className="grid grid-cols-3 gap-4 text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-1">
                                                    <span>Série</span>
                                                    <span className="text-center">Reps</span>
                                                    <span className="text-center">Poids</span>
                                                </div>

                                                {/* Performance Rows */}
                                                <div className="space-y-1.5">
                                                    {ex.performances.map((perf, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`grid grid-cols-3 gap-4 items-center py-1.5 px-1 rounded-lg transition-colors ${perf.success === false
                                                                ? 'bg-red-500/10'
                                                                : 'hover:bg-white/5'
                                                                }`}
                                                        >
                                                            {/* Set Number */}
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${perf.success === false
                                                                    ? 'bg-red-500/20 text-red-400'
                                                                    : 'bg-white/10 text-gray-400'
                                                                    }`}>
                                                                    {perf.set_index}
                                                                </span>
                                                            </div>

                                                            {/* Reps */}
                                                            <span className={`text-center text-sm font-semibold ${perf.success === false ? 'text-red-400' : 'text-white'
                                                                }`}>
                                                                {perf.reps_effectuees ?? '-'}
                                                            </span>

                                                            {/* Weight */}
                                                            <span className="text-center text-sm text-gray-300">
                                                                {perf.weight ? `${perf.weight} kg` : '-'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="px-3 py-2">
                                                {/* Table Header */}
                                                <div className="grid grid-cols-3 gap-4 text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-1">
                                                    <span>Série</span>
                                                    <span className="text-center">Reps</span>
                                                    <span className="text-center">Poids</span>
                                                </div>

                                                {/* Planned Sets Rows */}
                                                <div className="space-y-1.5">
                                                    {Array.from({ length: ex.sets }, (_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="grid grid-cols-3 gap-4 items-center py-1.5 px-1 rounded-lg hover:bg-white/5 transition-colors"
                                                        >
                                                            {/* Set Number */}
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center bg-white/10 text-gray-400">
                                                                    {idx + 1}
                                                                </span>
                                                            </div>

                                                            {/* Reps */}
                                                            <span className="text-center text-sm font-semibold text-white">
                                                                {ex.reps}
                                                            </span>

                                                            {/* Weight */}
                                                            <span className="text-center text-sm text-gray-300">
                                                                {ex.weight ? `${ex.weight} kg` : '-'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Extra info */}
                {sessionDetails.summary?.caloriesBurned && (
                    <div className="flex items-center justify-center gap-2 py-2 px-3 bg-orange-500/10 rounded-lg">

                        <span className="text-sm text-orange-400 font-medium">
                            ~{sessionDetails.summary.caloriesBurned} kcal brûlées
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-[#18181b] p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex gap-3">
                <div className="relative">
                    {activity.user.profilePictureUrl ? (
                        <img src={activity.user.profilePictureUrl} className="h-10 w-10 rounded-full object-cover" alt={activity.user.name} />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                            {activity.user.name[0]}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-[#18181b] rounded-full p-0.5">
                        {renderIcon()}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {renderContent()}
                    <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: fr })}</p>
                </div>
            </div>

            {/* Show Details Button - Only for SESSION_COMPLETED */}
            {activity.type === 'SESSION_COMPLETED' && activity.data?.sessionId && (
                <button
                    onClick={handleShowDetails}
                    disabled={isLoadingDetails}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                >
                    {isLoadingDetails ? (
                        <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
                    ) : showDetails ? (
                        <>
                            <ChevronUpIcon className="w-3.5 h-3.5" />
                            Masquer les détails
                        </>
                    ) : (
                        <>
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                            Voir les performances
                        </>
                    )}
                </button>
            )}

            {/* Session Details */}
            {showDetails && renderSessionDetails()}

            {/* Reactions */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                {REACTION_TYPES.map((type) => {
                    const count = activity.reactions.filter((r: any) => r.emoji === type.emoji).length;
                    const isActive = myReaction?.emoji === type.emoji;

                    return (
                        <button
                            key={type.emoji}
                            onClick={() => handleReaction(type.emoji)}
                            disabled={isReacting}
                            className={`
                                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all
                                ${isActive
                                    ? 'bg-[#94fbdd]/20 text-[#94fbdd] border border-[#94fbdd]/30'
                                    : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                                }
                            `}
                        >
                            <span>{type.emoji}</span>
                            {count > 0 && <span>{count}</span>}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
