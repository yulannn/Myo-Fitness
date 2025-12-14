import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/apiClient';
import ActivityItem from './ActivityItem';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function ActivityFeed() {
    const queryClient = useQueryClient();
    const { ref, inView } = useInView();

    const fetchFeed = async ({ pageParam = 1 }) => {
        const { data } = await api.get(`/activity/feed?page=${pageParam}&limit=20`);
        return data;
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['activity-feed'],
        queryFn: fetchFeed,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 20 ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
    });

    const reactionMutation = useMutation({
        mutationFn: async ({ activityId, emoji }: { activityId: number, emoji: string }) => {
            await api.post(`/activity/${activityId}/react`, { emoji });
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['activity-feed'] });
            const previousFeed = queryClient.getQueryData(['activity-feed']);

            queryClient.setQueryData(['activity-feed'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => page)
                };
            });

            return { previousFeed };
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
        }
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (status === 'pending') return <div className="text-center py-10 text-gray-500">Chargement du feed...</div>;
    if (status === 'error') return <div className="text-center py-10 text-red-500">Erreur lors du chargement.</div>;

    const isEmpty = !data?.pages[0] || data.pages[0].length === 0;

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {isEmpty ? (
                <div className="text-center py-12 bg-[#18181b] rounded-xl border border-white/5">
                    <p className="text-gray-400">Aucune activité récente.</p>
                    <p className="text-sm text-gray-500 mt-1">Vos amis sont peut-être au repos ? 😴</p>
                </div>
            ) : (
                data?.pages.map((group, i) => (
                    <div key={i} className="space-y-4">
                        {group.map((activity: any) => (
                            <ActivityItem
                                key={activity.id}
                                activity={activity}
                                onReact={(id: number, emoji: string) => reactionMutation.mutate({ activityId: id, emoji })}
                            />
                        ))}
                    </div>
                ))
            )}

            {(isFetchingNextPage || hasNextPage) && (
                <div ref={ref} className="py-4 text-center text-gray-500 text-sm">
                    {isFetchingNextPage ? 'Chargement...' : 'Plus d\'activités'}
                </div>
            )}
        </div>
    );
}
