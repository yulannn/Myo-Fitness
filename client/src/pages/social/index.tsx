import { useNavigate } from 'react-router-dom';
import {
    ChatBubbleLeftRightIcon,
    UsersIcon,
    BellIcon
} from '@heroicons/react/24/outline';
import SharedSessionsList from '../../components/social/SharedSessionsList';
import { useSessionNotifications } from '../../api/hooks/shared-session/useSessionNotifications';
import { useFriendNotifications } from '../../api/hooks/friend/useFriendNotifications';
import { useGlobalMessageListener } from '../../api/hooks/chat/useGlobalMessageListener';
import { SOCIAL_CHATS, SOCIAL_FRIENDS, SOCIAL_NOTIFICATIONS } from '../../utils/paths';
import useGetPendingFriendRequests from '../../api/hooks/friend/useGetPendingFriendRequests';
import usePendingGroupRequests from '../../api/hooks/group/useGetPendingGroupRequests';
import { useConversations } from '../../api/hooks/chat/useConversations';
import { useState } from 'react';
import ActivityFeed from '../../components/social/ActivityFeed';

export default function SocialFeed() {
    const navigate = useNavigate();

    // Activer les notifications de séances
    useSessionNotifications();
    // Activer les notifications de demandes d'ami en temps réel
    useFriendNotifications();
    // Activer l'écoute globale des messages
    useGlobalMessageListener();

    // Data for badges
    const { data: friendRequests = [] } = useGetPendingFriendRequests();
    const { data: groupRequests = [] } = usePendingGroupRequests();
    const { data: conversations = [] } = useConversations();

    const [viewMode, setViewMode] = useState<'sessions' | 'feed'>('sessions');

    const unreadMessagesCount = conversations.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
    const notificationsCount = friendRequests.length + (groupRequests?.length || 0);

    return (
        <div className="min-h-screen bg-[#121214] pb-20">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-4 sm:space-y-6">

                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#121214]/95 backdrop-blur-xl z-20 py-4 -mx-4 px-4 border-b border-white/5 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Social</h1>
                    </div>

                    <div className="flex gap-3">
                        {/* Notifications Button */}
                        <button
                            onClick={() => navigate(SOCIAL_NOTIFICATIONS)}
                            className="p-2.5 rounded-full bg-[#27272a] border border-white/5 text-white hover:bg-white/10 transition-all relative"
                            title="Notifications"
                        >
                            <BellIcon className="h-6 w-6" />
                            {notificationsCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#121214]">
                                    {notificationsCount}
                                </span>
                            )}
                        </button>

                        {/* Amis Button */}
                        <button
                            onClick={() => navigate(SOCIAL_FRIENDS)}
                            className="p-2.5 rounded-full bg-[#27272a] border border-white/5 text-white hover:bg-white/10 transition-all relative"
                            title="Mes amis"
                        >
                            <UsersIcon className="h-6 w-6" />
                        </button>

                        {/* Chat Button */}
                        <button
                            onClick={() => navigate(SOCIAL_CHATS)}
                            className="p-2.5 rounded-full bg-[#27272a] border border-white/5 text-white hover:bg-white/10 transition-all relative"
                            title="Conversations"
                        >
                            <ChatBubbleLeftRightIcon className="h-6 w-6" />
                            {unreadMessagesCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#94fbdd] text-[#121214] text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#121214]">
                                    {unreadMessagesCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Toggle: Séances vs Feed */}
                <div className="flex justify-center mb-6">
                    <div className="bg-[#18181b] p-1 rounded-xl border border-white/5 inline-flex">
                        <button
                            onClick={() => setViewMode('sessions')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'sessions'
                                ? 'bg-[#27272a] text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            Séances Partagées
                        </button>
                        <button
                            onClick={() => setViewMode('feed')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'feed'
                                ? 'bg-[#27272a] text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            Fil d'actualité
                            <span className="ml-2 text-[10px] bg-[#94fbdd]/10 text-[#94fbdd] px-1.5 py-0.5 rounded border border-[#94fbdd]/20">BETA</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {viewMode === 'sessions' ? (
                    <SharedSessionsList />
                ) : (
                    <ActivityFeed />
                )}

            </div>
        </div>
    );
}
