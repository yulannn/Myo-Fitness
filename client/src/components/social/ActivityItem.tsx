
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    TrophyIcon,
    FireIcon,
    CheckCircleIcon,
    CalendarIcon
} from '@heroicons/react/24/solid'; // Using solid for reactions/types
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';


const REACTION_TYPES = [
    { emoji: '💪', label: 'Strong' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '👏', label: 'Clap' },
    { emoji: '🏆', label: 'Trophy' },
];

export default function ActivityItem({ activity, onReact }: { activity: any, onReact: (id: number, emoji: string) => void }) {
    const { user } = useAuth();
    const [isReacting, setIsReacting] = useState(false);


    const myReaction = activity.reactions.find((r: any) => r.user.id === user?.id);

    const handleReaction = async (emoji: string) => {
        setIsReacting(true);
        try {
            await onReact(activity.id, emoji);
        } finally {
            setIsReacting(false);
        }
    };

    const renderIcon = () => {
        switch (activity.type) {
            case 'SESSION_COMPLETED': return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
            case 'PERSONAL_RECORD': return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
            case 'PROGRAM_COMPLETED': return <CalendarIcon className="h-6 w-6 text-purple-500" />;
            case 'STREAK_REACHED': return <FireIcon className="h-6 w-6 text-orange-500" />;
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
            // ... other types
            default:
                return (
                    <p className="text-sm text-gray-300">
                        <span className="font-bold text-white">{activity.user.name}</span> a accompli quelque chose.
                    </p>
                )
        }
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
                                flex items - center gap - 1 px - 2 py - 1 rounded - full text - xs font - medium transition - all
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
