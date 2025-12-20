import { useState } from 'react';
import {
    MagnifyingGlassIcon,
    UsersIcon,
    PlusIcon,
    CheckIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    ArrowLeftIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import useFriendsList from '../../api/hooks/friend/useGetFriendsList';
import useSearchUsers from '../../api/hooks/friend/useSearchUsers';
import useSendFriendRequest from '../../api/hooks/friend/useSendFriendRequest';
import useRemoveFriend from '../../api/hooks/friend/useRemoveFriend';
import useSentFriendRequests from '../../api/hooks/friend/useSentFriendRequests';
import useCancelFriendRequest from '../../api/hooks/friend/useCancelFriendRequest';
import { getImageUrl } from '../../utils/imageUtils';
import ChatService from '../../api/services/chatService';
import { SOCIAL_CHATS } from '../../utils/paths';
import { useAuth } from '../../context/AuthContext';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';


export default function FriendsPage() {
    const navigate = useNavigate();
    // const queryClient = useQueryClient();
    // const [showSearchModal, setShowSearchModal] = useState(false); // Removed modal state
    // const queryClient = useQueryClient();
    // const [showSearchModal, setShowSearchModal] = useState(false); // Removed modal state
    const [searchQuery, setSearchQuery] = useState('');
    const [lastSearchedQuery, setLastSearchedQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [friendRequestSent, setFriendRequestSent] = useState<number | null>(null);
    const [showSentRequestsModal, setShowSentRequestsModal] = useState(false);
    const [requestToCancel, setRequestToCancel] = useState<string | null>(null);
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    const copyFriendCode = () => {
        if (user?.friendCode) {
            navigator.clipboard.writeText(user.friendCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // --- FRIENDS ---
    const { data: friends = [] } = useFriendsList();
    const { data: sentRequests = [] } = useSentFriendRequests();
    const cancelRequest = useCancelFriendRequest();
    const { data: searchResults = [], isLoading: isLoadingSearch } = useSearchUsers(lastSearchedQuery, { enabled: isSearching });

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        setLastSearchedQuery(searchQuery.trim().toUpperCase());
        setIsSearching(true); // Enable query execution
        // We can optionally use useEffect to trigger refetch if query key changes, 
        // but updating lastSearchedQuery (which is in the query key) should be enough.
    };

    // Auto-uppercase input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value.toUpperCase());
    };
    const sendFriendRequest = useSendFriendRequest();

    // Remove Friend Logic
    const removeFriendMutation = useRemoveFriend();
    const [friendToRemove, setFriendToRemove] = useState<any | null>(null);

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
                        onClick={() => setShowSentRequestsModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-white/10 rounded-lg hover:bg-[#27272a] transition-colors"
                    >
                        <PaperAirplaneIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-300">Envoyées</span>
                        {sentRequests.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-[#94fbdd]/20 text-[#94fbdd] text-xs rounded-full font-bold">
                                {sentRequests.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Friend Code Card */}
                <div className="bg-gradient-to-r from-[#27272a] to-[#18181b] p-4 rounded-xl border border-white/5 flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Ton Code Ami</p>
                        <p className="text-2xl font-mono font-bold text-white tracking-widest">
                            {user?.friendCode || <span className="text-gray-600 text-sm">Génération...</span>}
                        </p>
                    </div>
                    <button
                        onClick={copyFriendCode}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                        title="Copier le code"
                    >
                        {copied ? (
                            <CheckIcon className="h-6 w-6 text-green-400" />
                        ) : (
                            <ClipboardDocumentIcon className="h-6 w-6 text-gray-400 group-hover:text-white" />
                        )}
                    </button>
                </div>

                {/* Search Bar Section */}
                <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                    <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Ajouter un ami</h3>
                    <div className="relative mb-4 flex gap-2">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="CODE AMI"
                                className="w-full bg-[#27272a] pl-10 pr-4 py-3 rounded-lg border border-white/5 text-white placeholder-gray-500 font-mono tracking-widest uppercase focus:outline-none focus:border-[#94fbdd] focus:ring-1 focus:ring-[#94fbdd] transition-all"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                maxLength={8}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={!searchQuery.trim()}
                            className="p-3 bg-[#94fbdd] text-[#121214] rounded-lg hover:bg-[#7dfbc9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <MagnifyingGlassIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Search Results */}
                    {(searchResults.length > 0 || isLoadingSearch || (lastSearchedQuery && searchResults.length === 0)) && (
                        <div className="max-h-[300px] overflow-y-auto space-y-2 mt-4 pt-4 border-t border-white/5">
                            {isLoadingSearch && (
                                <div className="p-4 text-center">
                                    <div className="w-6 h-6 border-2 border-[#94fbdd] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                </div>
                            )}
                            {!isLoadingSearch && searchResults.length === 0 && lastSearchedQuery && (
                                <p className="text-center text-gray-500 py-4">Aucun utilisateur trouvé</p>
                            )}
                            {searchResults.map((user: any) => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-[#27272a] rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${user.id}`)}>
                                        <div className="w-10 h-10 bg-[#18181b] rounded-full overflow-hidden border border-white/10">
                                            {user.profilePictureUrl ? (
                                                <img src={getImageUrl(user.profilePictureUrl)} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UsersIcon className="w-5 h-5 m-2.5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm hover:text-[#94fbdd] transition-colors">{user.name}</p>
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
                    )}
                </div>

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
                                    className="flex items-center justify-between p-3 bg-[#27272a] rounded-lg border border-white/5 group relative"
                                >
                                    <div
                                        className="flex items-center gap-3 flex-1 cursor-pointer"
                                        onClick={() => navigate(`/user/${f.friend.id}`)}
                                    >
                                        <div className="w-10 h-10 bg-[#18181b] rounded-full overflow-hidden border border-white/10">
                                            {f.friend.profilePictureUrl ? (
                                                <img src={getImageUrl(f.friend.profilePictureUrl)} alt={f.friend.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UsersIcon className="w-5 h-5 m-2.5 text-gray-400" />
                                            )}
                                        </div>
                                        <span className="font-bold text-white group-hover:text-[#94fbdd] transition-colors text-sm">{f.friend.name}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startChatWithFriend(f.friend.id)}
                                            className="p-2 bg-[#18181b] rounded-lg text-gray-400 hover:text-[#94fbdd] transition-colors"
                                        >
                                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFriendToRemove(f.friend);
                                            }}
                                            className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                            title="Retirer cet ami"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Confirmation Suppression */}
                {friendToRemove && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-xl bg-[#18181b] p-6 shadow-2xl border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-500/10 rounded-lg">
                                    <XMarkIcon className="h-6 w-6 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Retirer un ami</h3>
                            </div>
                            <p className="text-gray-400 mb-6">
                                Voulez-vous vraiment retirer <strong>{friendToRemove.name}</strong> de vos amis ?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setFriendToRemove(null)}
                                    className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        removeFriendMutation.mutate(friendToRemove.id, {
                                            onSuccess: () => {
                                                setFriendToRemove(null);
                                            },
                                            onError: (err) => {
                                                console.error("Error removing friend", err);
                                                // Optional: Add toast notification
                                            }
                                        });
                                    }}
                                    disabled={removeFriendMutation.isPending}
                                    className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {removeFriendMutation.isPending ? 'En cours...' : 'Retirer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Sent Friend Requests Modal */}
            {showSentRequestsModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowSentRequestsModal(false)}>
                    <div className="bg-[#18181b] rounded-xl border border-white/10 max-w-md w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-[#18181b] border-b border-white/10 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <PaperAirplaneIcon className="h-5 w-5 text-[#94fbdd]" />
                                Demandes envoyées
                            </h2>
                            <button onClick={() => setShowSentRequestsModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <XMarkIcon className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-4">
                            {sentRequests.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <PaperAirplaneIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>Aucune demande envoyée</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sentRequests.map((req: any) => (
                                        <div key={req.id} className="bg-[#27272a] p-4 rounded-lg border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => { setShowSentRequestsModal(false); navigate(`/user/${req.receiver.id}`); }}>
                                                <div className="w-12 h-12 bg-[#18181b] rounded-full overflow-hidden border border-white/10">
                                                    {req.receiver?.profilePictureUrl ? (
                                                        <img src={getImageUrl(req.receiver.profilePictureUrl)} alt={req.receiver.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UsersIcon className="w-6 h-6 m-3 text-gray-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white hover:text-[#94fbdd] transition-colors">{req.receiver?.name || 'Utilisateur'}</p>
                                                    <p className="text-xs text-gray-500">En attente de réponse</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setRequestToCancel(req.id)}
                                                className="px-3 py-1.5 text-sm bg-[#18181b] text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                                disabled={cancelRequest.isPending}
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal for Canceling Request */}
            {requestToCancel && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#18181b] rounded-xl border border-white/10 max-w-sm w-full p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Annuler la demande ?</h3>
                        <p className="text-gray-400 text-sm mb-6">Êtes-vous sûr de vouloir annuler cette demande d'ami ?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRequestToCancel(null)}
                                className="flex-1 px-4 py-2 bg-[#27272a] text-gray-300 rounded-lg hover:bg-[#3a3a3f] transition-colors"
                            >
                                Non
                            </button>
                            <button
                                onClick={() => {
                                    cancelRequest.mutate(requestToCancel, {
                                        onSuccess: () => {
                                            setRequestToCancel(null);
                                        }
                                    });
                                }}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                disabled={cancelRequest.isPending}
                            >
                                {cancelRequest.isPending ? 'Annulation...' : 'Oui, annuler'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
}
