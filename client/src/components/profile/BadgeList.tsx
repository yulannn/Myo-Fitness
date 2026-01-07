import React, { useState } from 'react';
import type { UserBadge } from '../../types/badge.type';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '../ui/modal';
import { StarIcon } from '@heroicons/react/24/solid';

interface BadgeListProps {
    userBadges: UserBadge[];
    isLoading?: boolean;
}

const TIER_COLORS = {
    BRONZE: 'text-orange-700 bg-orange-900/20 border-orange-800/50',
    SILVER: 'text-gray-300 bg-gray-700/30 border-gray-600/50',
    GOLD: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50',
    PLATINUM: 'text-cyan-400 bg-cyan-900/20 border-cyan-700/50',
    LEGENDARY: 'text-purple-400 bg-purple-900/20 border-purple-700/50',
};

const TIER_LABELS = {
    BRONZE: 'Bronze',
    SILVER: 'Argent',
    GOLD: 'Or',
    PLATINUM: 'Platine',
    LEGENDARY: 'Légendaire',
};

export default function BadgeList({ userBadges, isLoading = false }: BadgeListProps) {
    const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const getBadgeImageUrl = (iconUrl: string | null) => {
        if (!iconUrl) return null;
        return iconUrl.startsWith('http')
            ? iconUrl
            : `${API_URL}/assets/badge_icons/${iconUrl}`;
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-full bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!userBadges || userBadges.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <StarIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Pas encore de badges débloqués.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {userBadges.map((ub) => {
                    const badge = ub.badge;
                    const imageUrl = getBadgeImageUrl(badge.iconUrl);
                    const tierStyle = TIER_COLORS[badge.tier] || TIER_COLORS.BRONZE;

                    return (
                        <button
                            key={ub.id}
                            onClick={() => setSelectedBadge(ub)}
                            className="group relative flex flex-col items-center gap-2 p-3 rounded-xl bg-[#18181b] border border-white/5 hover:bg-[#202024] hover:border-[#94fbdd]/30 transition-all"
                        >
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={badge.name}
                                        className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.classList.add('fallback-icon');
                                        }}
                                    />
                                ) : null}

                                {/* Fallback Icon */}
                                <div className={`${imageUrl ? 'hidden' : ''} fallback-icon:flex w-full h-full items-center justify-center rounded-full bg-white/5`}>
                                    <StarIcon className={`w-8 h-8 ${tierStyle.split(' ')[0]}`} />
                                </div>
                            </div>

                            <span className="text-xs font-semibold text-center text-gray-300 group-hover:text-white line-clamp-2">
                                {badge.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            <Modal
                isOpen={!!selectedBadge}
                onClose={() => setSelectedBadge(null)}
                showClose={false}
                className="!p-0 !bg-transparent !border-none !shadow-none !max-w-none flex items-center justify-center pointer-events-none"
            >
                <div className="bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden relative w-full max-w-sm mx-auto shadow-2xl pointer-events-auto">
                    {/* Close Button Custom */}
                    <button
                        onClick={() => setSelectedBadge(null)}
                        className="absolute top-4 right-4 z-50 p-2 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all backdrop-blur-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {selectedBadge && (
                        <div className="flex flex-col items-center text-center p-6 space-y-4">
                            {/* Badge Icon Large */}
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Glow Effect */}
                                <div className={`absolute inset-0 blur-2xl opacity-20 ${TIER_COLORS[selectedBadge.badge.tier].split(' ')[0].replace('text-', 'bg-')}`}></div>

                                {getBadgeImageUrl(selectedBadge.badge.iconUrl) ? (
                                    <img
                                        src={getBadgeImageUrl(selectedBadge.badge.iconUrl)!}
                                        alt={selectedBadge.badge.name}
                                        className="relative z-10 w-full h-full object-contain drop-shadow-xl"
                                    />
                                ) : (
                                    <StarIcon className={`relative z-10 w-20 h-20 ${TIER_COLORS[selectedBadge.badge.tier].split(' ')[0]}`} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <ModalTitle className="text-2xl font-bold text-white">
                                    {selectedBadge.badge.name}
                                </ModalTitle>

                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${TIER_COLORS[selectedBadge.badge.tier]}`}>
                                    {TIER_LABELS[selectedBadge.badge.tier]}
                                </span>
                            </div>

                            <ModalDescription className="text-gray-400">
                                {selectedBadge.badge.description}
                            </ModalDescription>

                            <div className="w-full h-px bg-white/10 my-2" />

                            <div className="text-sm text-gray-500">
                                Obtenu le {new Date(selectedBadge.unlockedAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>

                            <div className="text-xs font-medium text-[#94fbdd] bg-[#94fbdd]/5 px-3 py-1.5 rounded-lg border border-[#94fbdd]/10">
                                +{selectedBadge.badge.xpReward} XP
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
