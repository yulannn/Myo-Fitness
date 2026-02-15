import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FireIcon,
    TrophyIcon,
    CheckBadgeIcon,
    BellIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import ActivityService from '../../api/services/activityService';

const ICON_MAP: Record<string, any> = {
    SESSION_COMPLETED: CheckBadgeIcon,
    PERSONAL_RECORD: TrophyIcon,
    PROGRAM_COMPLETED: FireIcon,
    COACH_MODIFICATION: WrenchScrewdriverIcon,
};

const COLOR_MAP: Record<string, string> = {
    SESSION_COMPLETED: 'text-emerald-400 bg-emerald-500/10',
    PERSONAL_RECORD: 'text-yellow-400 bg-yellow-500/10',
    PROGRAM_COMPLETED: 'text-orange-400 bg-orange-500/10',
    COACH_MODIFICATION: 'text-primary bg-primary/10',
};

export default function ActivityFeed() {
    const { data: activities, isLoading } = useQuery({
        queryKey: ['activity-feed'],
        queryFn: () => ActivityService.getFeed(),
    });

    if (isLoading) return <div className="space-y-4 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-surface rounded-2xl" />)}</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
                <BellIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-white">Flux d'activité</h2>
            </div>

            <div className="space-y-3">
                {activities?.map((activity: any) => {
                    const Icon = ICON_MAP[activity.type] || BellIcon;
                    const colorClass = COLOR_MAP[activity.type] || 'text-text-secondary bg-white/5';

                    return (
                        <div
                            key={activity.id}
                            className="group bg-surface border border-border-subtle rounded-2xl p-4 hover:border-primary/20 transition-all duration-300"
                        >
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                            {activity.type === 'COACH_MODIFICATION' ? 'Mise à jour du programme' : activity.type.replace('_', ' ')}
                                        </p>
                                        <span className="text-[10px] text-text-secondary uppercase">
                                            {new Date(activity.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary line-clamp-2">
                                        {activity.type === 'COACH_MODIFICATION' ? activity.data?.description : 'Une activité a été enregistrée.'}
                                    </p>
                                    {activity.type === 'COACH_MODIFICATION' && (
                                        <div className="mt-2 flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-wider">
                                            Coach : {activity.data?.coachName}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {activities?.length === 0 && (
                    <div className="py-10 text-center bg-surface border border-border-subtle border-dashed rounded-2xl">
                        <p className="text-sm text-text-secondary">Aucune activité récente.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
