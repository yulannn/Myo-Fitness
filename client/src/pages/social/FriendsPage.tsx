import { useState } from 'react';
import {
    MagnifyingGlassIcon,
    UsersIcon,
    PlusIcon,
    CheckIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import useFriendsList from '../../api/hooks/friend/useGetFriendsList';
import useSearchUsers from '../../api/hooks/friend/useSearchUsers';
import useSendFriendRequest from '../../api/hooks/friend/useSendFriendRequest';
import { getImageUrl } from '../../utils/imageUtils';
import ChatService from '../../api/services/chatService';
import { SOCIAL_CHATS } from '../../utils/paths';

export default function FriendsPage() {
    const navigate = useNavigate();
    // const queryClient = useQueryClient();
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [friendRequestSent, setFriendRequestSent] = useState<number | null>(null);

    // --- FRIENDS ---
    // --- FRIENDS ---
    const { data: friends = [] } = useFriendsList();
    const { data: searchResults = [] } = useSearchUsers(searchQuery);
    const sendFriendRequest = useSendFriendRequest();

    const startChatWithFriend = async (friendId: number) => {
        try {
            const res = await ChatService.createConversation({
                type: 'PRIVATE',
                participantIds: [friendId]
            });
            navigate(SOCIAL_CHATS, { state: { conversationId: res.data.id } });
        } catch (e) {
            console.error("Erreur création chat", e);
            navigate(SOCIAL_CHATS); // Fallback
        }
    };

    return (
        <div className="min-h-screen bg-[#121214] pb-20">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-4 sm:space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white">
                            <ArrowLeftIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-white">Mes Amis</h1>
                    </div>
                    <button
                        onClick={() => setShowSearchModal(true)}
                        className="p-2 bg-[#27272a] hover:bg-[#94fbdd]/10 text-white hover:text-[#94fbdd] rounded-lg transition-all border border-white/5"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Recherche */}
                {showSearchModal && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="w-full max-w-lg bg-[#18181b] p-4 rounded-xl border border-white/10 shadow-2xl relative">
                            <button
                                onClick={() => {
                                    setShowSearchModal(false);
                                    setSearchQuery('');
                                }}
                                className="absolute -top-2 -right-2 p-2 bg-[#27272a] text-white rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>

                            <h3 className="text-lg font-bold text-white mb-4">Ajouter un ami</h3>

                            <div className="relative mb-4">
                                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom..."
                                    className="w-full bg-[#27272a] pl-10 pr-4 py-3 rounded-lg border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-[#94fbdd] focus:ring-1 focus:ring-[#94fbdd] transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto space-y-2">
                                {searchResults.length === 0 && searchQuery && (
                                    <p className="text-center text-gray-500 py-4">Aucun utilisateur trouvé</p>
                                )}
                                {searchResults.map((user: any) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-[#27272a] rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#18181b] rounded-full overflow-hidden border border-white/10">
                                                {user.profilePictureUrl ? (
                                                    <img src={getImageUrl(user.profilePictureUrl)} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UsersIcon className="w-5 h-5 m-2.5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{user.name}</p>
                                            </div>
                                        </div>
                                        {(user.status === 'NONE' || user.status === 'SENT') && (
                                            <button
                                                onClick={() => {
                                                    if (user.status === 'NONE') {
                                                        sendFriendRequest.mutate({ friendId: user.id }, {
                                                            onSuccess: () => {
                                                                setFriendRequestSent(user.id);
                                                            }
                                                        });
                                                    }
                                                }}
                                                disabled={user.status === 'SENT'}
                                                className={`p-2 rounded-lg transition-all duration-300 ${friendRequestSent === user.id || user.status === 'SENT'
                                                    ? 'bg-green-500/10 text-green-400 cursor-default'
                                                    : 'bg-white/5 text-[#94fbdd] hover:bg-[#94fbdd]/10 cursor-pointer'
                                                    }`}
                                            >
                                                {friendRequestSent === user.id || user.status === 'SENT' ? (
                                                    <CheckIcon className="h-5 w-5" />
                                                ) : (
                                                    <PlusIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        )}
                                        {user.status === 'FRIEND' && <span className="text-xs text-[#94fbdd] bg-[#94fbdd]/10 px-2 py-1 rounded">Ami</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Liste d'amis */}

                {/* Liste d'amis */}
                <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                    <h3 className="font-bold text-white mb-4">Mes Amis ({friends.length})</h3>
                    {friends.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <UsersIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Vous n'avez pas encore d'amis.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {friends.map((f: any) => (
                                <div
                                    key={f.id}
                                    className="flex items-center justify-between p-3 bg-[#27272a] rounded-lg border border-white/5 hover:border-[#94fbdd]/30 transition-all cursor-pointer group"
                                    onClick={() => startChatWithFriend(f.friend.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#18181b] rounded-full overflow-hidden border border-white/10">
                                            {f.friend.profilePictureUrl ? (
                                                <img src={getImageUrl(f.friend.profilePictureUrl)} alt={f.friend.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UsersIcon className="w-5 h-5 m-2.5 text-gray-400" />
                                            )}
                                        </div>
                                        <span className="font-bold text-white group-hover:text-[#94fbdd] transition-colors text-sm">{f.friend.name}</span>
                                    </div>
                                    <div className="p-2 bg-[#18181b] rounded-lg text-gray-400 group-hover:text-[#94fbdd] transition-colors">
                                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
