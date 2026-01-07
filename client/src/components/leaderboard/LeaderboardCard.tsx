import React from 'react';
import type { LeaderboardEntry } from '../../types/leaderboard.type';
import { motion } from 'framer-motion';

interface LeaderboardCardProps {
    entry: LeaderboardEntry;
    type: string;
    index: number;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ entry, type, index }) => {
    const { rank, userName, profilePictureUrl, value, level, isCurrentUser } = entry;

    const formatValue = (val: number, type: string) => {
        switch (type) {
            case 'TOTAL_VOLUME':
                return val >= 1000 ? `${(val / 1000).toFixed(1)}t` : `${val.toFixed(0)} kg`;
            case 'CURRENT_STREAK':
                return val === 1 ? '1 jour' : `${val} jours`;
            case 'TOTAL_SESSIONS':
                return val === 1 ? '1 séance' : `${val} séances`;
            case 'LEVEL':
                return `Niveau ${val}`;
            default:
                return val.toString();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            className={`
                flex items-center gap-3 p-3 border-b border-white/5 last:border-0
                ${isCurrentUser
                    ? 'bg-[#94fbdd]/10'
                    : 'hover:bg-white/5 transition-colors'
                }
            `}
        >
            {/* Rank */}
            <div className={`flex-shrink-0 w-8 text-center font-mono font-medium ${isCurrentUser ? 'text-[#94fbdd]' : 'text-gray-500'}`}>
                #{rank}
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
                <div className={`
                    w-10 h-10 rounded-full overflow-hidden 
                    ${isCurrentUser ? 'ring-2 ring-[#94fbdd] ring-offset-2 ring-offset-[#121214]' : ''}
                `}>
                    {profilePictureUrl ? (
                        <img src={profilePictureUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[#27272a] flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-400">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-[#94fbdd]' : 'text-white'}`}>
                        {userName}
                    </h3>
                    {isCurrentUser && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94fbdd]/70">
                            (Moi)
                        </span>
                    )}
                </div>
                {level && (
                    <p className="text-[10px] text-gray-500">
                        Niv {level}
                    </p>
                )}
            </div>

            {/* Value */}
            <div className="text-right">
                <span className={`text-base font-bold tracking-tight ${isCurrentUser ? 'text-[#94fbdd]' : 'text-white'}`}>
                    {formatValue(value, type)}
                </span>
            </div>
        </motion.div>
    );
};

export default LeaderboardCard;
