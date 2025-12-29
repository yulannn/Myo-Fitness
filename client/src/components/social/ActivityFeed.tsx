import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/apiClient';
import ActivityItem from './ActivityItem';
import { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 20;

// Types for API response
interface PaginatedResponse {
    data: any[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Skeleton component for loading state
function ActivitySkeleton() {
    return (
        <div className="bg-[#18181b] p-4 rounded-xl border border-white/5 space-y-3 animate-pulse">
            <div className="flex gap-3">
                <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white/5" />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded-md w-3/4" />
                    <div className="h-3 bg-white/5 rounded-md w-1/2" />
                    <div className="h-3 bg-white/5 rounded-md w-1/4" />
                </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-7 w-12 bg-white/5 rounded-full" />
                ))}
            </div>
        </div>
    );
}

// Pagination button component - Compact
function PaginationButton({
    onClick,
    disabled,
    active,
    children
}: {
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                min-w-[40px] h-10 px-3 rounded-xl text-sm font-medium
                flex items-center justify-center
                transition-all duration-150
                ${active
                    ? 'bg-[#94fbdd] text-[#09090b]'
                    : disabled
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-white/10 active:scale-95'
                }
            `}
        >
            {children}
        </button>
    );
}

// Pagination controls component - Compact style
function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    isLoading
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
}) {
    // Simple pagination: 1, 2, 3 ... lastPage
    const pageNumbers = useMemo(() => {
        const pages: (number | 'ellipsis')[] = [];

        if (totalPages <= 5) {
            // Show all pages if 5 or less
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show 1, 2, 3
            pages.push(1, 2, 3);
            pages.push('ellipsis');
            pages.push(totalPages);
        }

        return pages;
    }, [totalPages]);

    return (
        <div className="flex items-center justify-center gap-1 pt-6 pb-2 mb-10">
            {/* Previous */}
            <PaginationButton
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
            >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
            </PaginationButton>

            {/* Page numbers */}
            {pageNumbers.map((page, index) => (
                page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-1 text-gray-600 text-xs">
                        ...
                    </span>
                ) : (
                    <PaginationButton
                        key={page}
                        onClick={() => onPageChange(page)}
                        active={page === currentPage}
                        disabled={isLoading}
                    >
                        {page}
                    </PaginationButton>
                )
            ))}

            {/* Next */}
            <PaginationButton
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
            >
                <ChevronRightIcon className="w-3.5 h-3.5" />
            </PaginationButton>
        </div>
    );
}

export default function ActivityFeed() {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);

    const fetchFeed = async (page: number): Promise<PaginatedResponse> => {
        const { data } = await api.get(`/activity/feed?page=${page}&limit=${ITEMS_PER_PAGE}`);
        return data;
    };

    const {
        data: response,
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ['activity-feed', currentPage],
        queryFn: () => fetchFeed(currentPage),
        placeholderData: (previousData) => previousData,
    });

    const reactionMutation = useMutation({
        mutationFn: async ({ activityId, emoji }: { activityId: number, emoji: string }) => {
            await api.post(`/activity/${activityId}/react`, { emoji });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
        }
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Loading state with skeletons
    if (isLoading) {
        return (
            <div className="space-y-4 max-w-2xl mx-auto">
                {[...Array(3)].map((_, i) => (
                    <ActivitySkeleton key={i} />
                ))}
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="text-center py-12 bg-[#18181b] rounded-xl border border-red-500/20 max-w-2xl mx-auto">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-red-400 font-medium">Erreur lors du chargement</p>
                <p className="text-sm text-gray-500 mt-1">Vérifie ta connexion et réessaie</p>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['activity-feed'] })}
                    className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    const activities = response?.data || [];
    const meta = response?.meta || { total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 1 };
    const isEmpty = activities.length === 0;

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {isEmpty ? (
                <div className="text-center py-12 bg-[#18181b] rounded-xl border border-white/5">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                        <span className="text-3xl">😴</span>
                    </div>
                    <p className="text-gray-400 font-medium">Aucune activité récente</p>
                    <p className="text-sm text-gray-500 mt-1">Tes amis sont peut-être au repos ?</p>
                </div>
            ) : (
                <>
                    {/* Loading overlay when fetching new page */}
                    <div className={`space-y-4 transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                        {activities.map((activity: any, index: number) => (
                            <div
                                key={activity.id}
                                className="animate-fadeIn"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animationFillMode: 'both'
                                }}
                            >
                                <ActivityItem
                                    activity={activity}
                                    onReact={(id: number, emoji: string) => reactionMutation.mutate({ activityId: id, emoji })}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pagination controls */}
                    {meta.totalPages > 1 && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={meta.totalPages}
                            onPageChange={handlePageChange}
                            isLoading={isFetching}
                        />
                    )}
                </>
            )}
        </div>
    );
}
