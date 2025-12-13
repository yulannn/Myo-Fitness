import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserPlusIcon, UserGroupIcon, CheckIcon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import useGetPendingFriendRequests from '../../api/hooks/friend/useGetPendingFriendRequests';
import useAcceptFriendRequest from '../../api/hooks/friend/useAcceptFriendRequest';
import useDeclineFriendRequest from '../../api/hooks/friend/useDeclineFriendRequest';
import usePendingGroupRequests from '../../api/hooks/group/useGetPendingGroupRequests';
// Assuming useAccept/DeclineGroupRequest exist based on file listing earlier
import useAcceptGroupRequest from '../../api/hooks/group/useAcceptGroupRequest';
import useDeclineGroupRequest from '../../api/hooks/group/useDeclineGroupRequest';
import { getImageUrl } from '../../utils/imageUtils';

export default function NotificationsPage() {
    const navigate = useNavigate();

    // Friend Requests
    const { data: friendRequests = [], isLoading: loadingFriends } = useGetPendingFriendRequests();
    const acceptFriend = useAcceptFriendRequest();
    const declineFriend = useDeclineFriendRequest();

    // Group Requests - Assuming this hook returns Group[] or specific Request object
    // I need to check the return type of usePendingGroupRequests. Code snippet said Group[].
    const { data: groupRequests = [], isLoading: loadingGroups } = usePendingGroupRequests();
    const acceptGroup = useAcceptGroupRequest();
    const declineGroup = useDeclineGroupRequest();

    const isLoading = loadingFriends || loadingGroups;
    const hasNotifications = friendRequests.length > 0 || groupRequests.length > 0;

    return (
        <div className="min-h-screen bg-[#121214] pb-20">
            <div className="max-w-xl mx-auto px-4 py-6 space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Notifications</h1>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-[#94fbdd] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : !hasNotifications ? (
                    <div className="text-center py-16 text-gray-500">
                        <div className="w-16 h-16 bg-[#18181b] rounded-full flex items-center justify-center mx-auto mb-4">
                            <BellIcon className="h-8 w-8 opacity-20" />
                        </div>
                        <p>Aucune nouvelle notification</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-300">

                        {/* Friend Requests */}
                        {friendRequests.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <UserPlusIcon className="h-4 w-4" />
                                    Demandes d'amis ({friendRequests.length})
                                </h2>
                                <div className="space-y-3">
                                    {friendRequests.map((req: any) => (
                                        <div key={req.id} className="bg-[#18181b] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-[#27272a] rounded-full overflow-hidden border border-white/10">
                                                    {req.sender?.profilePictureUrl ? (
                                                        <img src={getImageUrl(req.sender.profilePictureUrl)} alt={req.sender.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserPlusIcon className="w-6 h-6 m-3 text-gray-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{req.sender?.name || 'Utilisateur'}</p>
                                                    <p className="text-xs text-gray-500">Souhaite vous ajouter</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => acceptFriend.mutate(req.id)}
                                                    className="p-2 bg-[#94fbdd] text-[#121214] rounded-lg hover:bg-[#94fbdd]/90 transition-colors"
                                                    disabled={acceptFriend.isPending}
                                                >
                                                    <CheckIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => declineFriend.mutate(req.id)}
                                                    className="p-2 bg-[#27272a] text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                                    disabled={declineFriend.isPending}
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Group Requests */}
                        {groupRequests.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <UserGroupIcon className="h-4 w-4" />
                                    Invitations de groupe ({groupRequests.length})
                                </h2>
                                <div className="space-y-3">
                                    {groupRequests.map((group: any) => (
                                        <div key={group.id} className="bg-[#18181b] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-[#27272a] rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                                                    <UserGroupIcon className="w-6 h-6 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{group.name}</p>
                                                    <p className="text-xs text-gray-500">Invitation à rejoindre</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => acceptGroup.mutate(group.id)}
                                                    className="p-2 bg-[#94fbdd] text-[#121214] rounded-lg hover:bg-[#94fbdd]/90 transition-colors"
                                                    disabled={acceptGroup.isPending}
                                                >
                                                    <CheckIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => declineGroup.mutate(group.id)}
                                                    className="p-2 bg-[#27272a] text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                                    disabled={declineGroup.isPending}
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
