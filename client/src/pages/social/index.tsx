import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    UsersIcon,
    PlusIcon,
    CheckIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    Cog6ToothIcon,
    TrashIcon,
    ArrowRightOnRectangleIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import SharedSessionsList from '../../components/social/SharedSessionsList';
import { useJoinSharedSession } from '../../api/hooks/useSharedSessions';
import { useConversations } from '../../api/hooks/chat/useConversations';
import { useMessages } from '../../api/hooks/chat/useMessages';
import { useSendMessage, useMarkAsRead } from '../../api/hooks/chat/useSendMessage';
import { useTypingIndicator } from '../../api/hooks/chat/useTypingIndicator';
import { useConversationRoom } from '../../api/hooks/chat/useConversationRoom';
import ChatService from '../../api/services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useSessionNotifications } from '../../api/hooks/useSessionNotifications';
// Friends hooks
import useFriendsList from '../../api/hooks/friend/useGetFriendsList';
import useGetPendingFriendRequests from '../../api/hooks/friend/useGetPendingFriendRequests';
import useSearchUsers from '../../api/hooks/friend/useSearchUsers';
import useSendFriendRequest from '../../api/hooks/friend/useSendFriendRequest';
import useAcceptFriendRequest from '../../api/hooks/friend/useAcceptFriendRequest';
import useDeclineFriendRequest from '../../api/hooks/friend/useDeclineFriendRequest';
// Groups hooks
import useGetUserGroups from '../../api/hooks/group/useGetUserGroups';
import useGetPendingGroupRequests from '../../api/hooks/group/useGetPendingGroupRequests';
import useGroupMembers from '../../api/hooks/group/useGetGroupMembers';
import useCreateGroup from '../../api/hooks/group/useCreateGroup';
import useAcceptGroupRequest from '../../api/hooks/group/useAcceptGroupRequest';
import useSendGroupRequest from '../../api/hooks/group/useSendGroupRequest';
import useUpdateGroup from '../../api/hooks/group/useUpdateGroup';
import useRemoveMember from '../../api/hooks/group/useRemoveMember';

export default function SocialPage() {
    const { user } = useAuth();
    const joinSession = useJoinSharedSession();
    const queryClient = useQueryClient();

    // Activer les notifications de séances
    useSessionNotifications();
    const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'messages'>('messages');
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [showSessions, setShowSessions] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [managingGroup, setManagingGroup] = useState<any | null>(null);

    // --- DATA FETCHING ---
    const { data: conversations = [], isLoading: loadingConvs } = useConversations();
    const { data: messages = [] } = useMessages(selectedConversation);
    const { mutate: sendMessage } = useSendMessage();
    const { mutate: markAsRead } = useMarkAsRead();

    // --- WEBSOCKET FEATURES ---
    const { typingUsers, startTyping, stopTyping } = useTypingIndicator(selectedConversation);
    useConversationRoom(selectedConversation);

    const typingTimeoutRef = useRef<number | null>(null);

    // --- FRIENDS ---
    const { data: friends = [] } = useFriendsList();
    const { data: friendRequests = [] } = useGetPendingFriendRequests();
    const { data: searchResults = [] } = useSearchUsers(searchQuery);
    const sendFriendRequest = useSendFriendRequest();
    const acceptFriend = useAcceptFriendRequest();
    const declineFriend = useDeclineFriendRequest();

    // --- GROUPS ---
    const { data: myGroups = [] } = useGetUserGroups();
    const { data: groupRequests = [] } = useGetPendingGroupRequests();
    const { data: groupMembers = [] } = useGroupMembers(managingGroup?.id);
    const createGroup = useCreateGroup({
        onSuccess: () => {
            setIsCreatingGroup(false);
            setNewGroupName('');
        }
    });
    const acceptGroup = useAcceptGroupRequest();
    const updateGroupMutation = useUpdateGroup();
    const removeMemberMutation = useRemoveMember();
    const inviteMemberMutation = useSendGroupRequest();

    // --- HANDLERS ---
    const handleSendMessage = () => {
        if (!selectedConversation || !messageInput.trim()) return;

        // Arrêter l'indicateur de frappe
        stopTyping();
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        sendMessage({ conversationId: selectedConversation, content: messageInput.trim() }, {
            onSuccess: () => setMessageInput(''),
        });
    };

    const handleMessageInputChange = (value: string) => {
        setMessageInput(value);

        // Démarrer l'indicateur de frappe
        if (value.trim()) {
            startTyping();

            // Réinitialiser le timeout pour arrêter l'indicateur
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = window.setTimeout(() => {
                stopTyping();
            }, 3000); // Arrêter après 3s d'inactivité
        } else {
            stopTyping();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }
    };

    const handleSelectConversation = (convId: string) => {
        setSelectedConversation(convId);
        markAsRead(convId);
    };

    const startChatWithFriend = async (friendId: number) => {
        const existingConv = conversations.find((c: any) =>
            c.type === 'PRIVATE' && c.participants.some((p: any) => p.userId === friendId)
        );

        if (existingConv) {
            setSelectedConversation(existingConv.id);
            setActiveTab('messages');
        } else {
            try {
                const res = await ChatService.createConversation({
                    type: 'PRIVATE',
                    participantIds: [friendId]
                });
                setSelectedConversation(res.data.id);
                setActiveTab('messages');
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            } catch (e) {
                console.error(e);
                alert("Erreur lors de la création du chat");
            }
        }
    };

    const openGroupChat = (groupId: number) => {
        const existingConv = conversations.find((c: any) => c.groupId === groupId);
        if (existingConv) {
            setSelectedConversation(existingConv.id);
            setActiveTab('messages');
        } else {
            alert("Conversation de groupe introuvable");
        }
    };

    const tabs = [
        { id: 'friends' as const, label: 'Amis', icon: UsersIcon },
        { id: 'groups' as const, label: 'Groupes', icon: UserGroupIcon },
        { id: 'messages' as const, label: 'Messages', icon: ChatBubbleLeftRightIcon },
    ];

    const selectedConv = conversations.find((c: any) => c.id === selectedConversation);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2F4858] to-[#7CD8EE] text-white p-6 shadow-lg sticky top-0 z-20">
                <h1 className="text-2xl font-bold">Social</h1>
                <p className="text-white/80 text-sm">Restez connecté avec votre communauté</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white sticky top-[88px] z-10 shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all ${activeTab === tab.id
                            ? 'text-[#7CD8EE] border-b-2 border-[#7CD8EE]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="h-5 w-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-4 max-w-4xl mx-auto">
                {/* Section Séances Planifiées */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowSessions(!showSessions)}
                        className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="h-6 w-6 text-[#7CD8EE]" />
                            <div className="text-left">
                                <h2 className="font-bold text-lg text-[#2F4858]">Séances Planifiées</h2>
                                <p className="text-sm text-gray-500">Organisez et rejoignez des séances d'entraînement</p>
                            </div>
                        </div>
                        <div className={`transform transition-transform ${showSessions ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>
                    {showSessions && (
                        <div className="mt-4">
                            <SharedSessionsList />
                        </div>
                    )}
                </div>

                {/* --- ONGLET AMIS --- */}
                {activeTab === 'friends' && (
                    <div className="space-y-6">
                        {/* Recherche */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <div className="relative">
                                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un utilisateur..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7CD8EE] outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {searchResults.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {searchResults.map((user: any) => (
                                        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                                    {user.profilePictureUrl ? (
                                                        <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UsersIcon className="w-6 h-6 m-2 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            {user.status === 'NONE' && (
                                                <button
                                                    onClick={() => sendFriendRequest.mutate(user.id)}
                                                    className="text-[#7CD8EE] hover:bg-[#7CD8EE]/10 p-2 rounded-full"
                                                >
                                                    <PlusIcon className="h-6 w-6" />
                                                </button>
                                            )}
                                            {user.status === 'SENT' && <span className="text-xs text-gray-400">Envoyé</span>}
                                            {user.status === 'FRIEND' && <span className="text-xs text-green-500">Ami</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Demandes reçues */}
                        {friendRequests.length > 0 && (
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-3">Demandes reçues</h3>
                                <div className="space-y-3">
                                    {friendRequests.map((req: any) => (
                                        <div key={req.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                                    {req.sender?.profilePictureUrl ? (
                                                        <img src={req.sender.profilePictureUrl} alt={req.sender.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UsersIcon className="w-6 h-6 m-2 text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="font-medium">{req.sender?.name || 'Utilisateur'}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => acceptFriend.mutate(req.id)} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                                                    <CheckIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => declineFriend.mutate(req.id)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Liste d'amis */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h3 className="font-bold text-gray-700 mb-3">Mes Amis</h3>
                            {friends.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">Vous n'avez pas encore d'amis.</p>
                            ) : (
                                <div className="space-y-3">
                                    {friends.map((f: any) => (
                                        <div key={f.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => startChatWithFriend(f.friend.id)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                                    {f.friend.profilePictureUrl ? (
                                                        <img src={f.friend.profilePictureUrl} alt={f.friend.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UsersIcon className="w-6 h-6 m-2 text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="font-medium">{f.friend.name}</span>
                                            </div>
                                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-[#7CD8EE]" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- ONGLET GROUPES --- */}
                {activeTab === 'groups' && (
                    <div className="space-y-6">
                        {/* Créer Groupe */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            {!isCreatingGroup ? (
                                <button
                                    onClick={() => setIsCreatingGroup(true)}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-semibold hover:border-[#7CD8EE] hover:text-[#7CD8EE] transition-colors flex items-center justify-center gap-2"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    Créer un groupe
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nom du groupe"
                                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7CD8EE] outline-none"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                    />
                                    <button
                                        onClick={() => createGroup.mutate({ name: newGroupName })}
                                        disabled={!newGroupName.trim()}
                                        className="px-4 py-2 bg-[#7CD8EE] text-white rounded-lg font-semibold disabled:opacity-50"
                                    >
                                        Créer
                                    </button>
                                    <button
                                        onClick={() => setIsCreatingGroup(false)}
                                        className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Invitations Groupes */}
                        {groupRequests.length > 0 && (
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-3">Invitations de groupe</h3>
                                {groupRequests.map((req: any) => (
                                    <div key={req.id} className="flex items-center justify-between py-2">
                                        <span><strong>{req.sender?.name || 'Quelqu\'un'}</strong> vous invite à rejoindre <strong>{req.group?.name || 'un groupe'}</strong></span>
                                        <button onClick={() => acceptGroup.mutate(req.id)} className="text-green-600 font-semibold">Accepter</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Liste Groupes */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h3 className="font-bold text-gray-700 mb-3">Mes Groupes</h3>
                            {myGroups.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">Aucun groupe.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {myGroups.map((group: any) => (
                                        <div
                                            key={group.id}
                                            className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow flex justify-between items-center"
                                        >
                                            <div onClick={() => openGroupChat(group.id)} className="cursor-pointer flex-1">
                                                <h4 className="font-bold text-[#2F4858]">{group.name}</h4>
                                                <p className="text-xs text-gray-500">{group.members?.length || 0} membres</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setManagingGroup(group)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                                    <Cog6ToothIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => openGroupChat(group.id)} className="p-2 text-[#7CD8EE] hover:bg-[#7CD8EE]/10 rounded-full">
                                                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- ONGLET MESSAGES --- */}
                {activeTab === 'messages' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
                        {/* Liste Conversations */}
                        <div className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="font-bold text-lg">Conversations</h2>
                            </div>

                            {loadingConvs ? (
                                <div className="p-4 text-center text-gray-500">Chargement...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    Aucune conversation
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
                                    {conversations.map((conv: any) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => handleSelectConversation(conv.id)}
                                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedConversation === conv.id ? 'bg-[#7CD8EE]/10' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-[#2F4858] truncate">
                                                        {conv.name || conv.participants
                                                            ?.filter((p: any) => p.user)
                                                            .map((p: any) => p.user.name)
                                                            .join(', ') || 'Conversation'}
                                                    </h3>
                                                    {conv.lastMessage && (
                                                        <p className="text-sm text-gray-600 truncate mt-1">
                                                            {conv.lastMessage.content}
                                                        </p>
                                                    )}
                                                </div>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-[#7CD8EE] text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fenêtre Chat */}
                        <div className={`md:col-span-2 bg-white rounded-xl shadow-md flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                            {selectedConversation ? (
                                <>
                                    {/* Header */}
                                    <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                                        <button onClick={() => setSelectedConversation(null)} className="md:hidden text-gray-500">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                        <h3 className="font-bold text-lg text-[#2F4858] truncate">
                                            {selectedConv?.name || selectedConv?.participants
                                                ?.filter((p: any) => p.user)
                                                .map((p: any) => p.user.name)
                                                .join(', ') || 'Conversation'}
                                        </h3>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
                                        <div className="flex flex-col space-y-4">
                                            {/* Indicateur de frappe */}
                                            {typingUsers.length > 0 && (
                                                <div className="flex justify-start">
                                                    <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl text-sm italic">
                                                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'est en train d\'écrire' : 'sont en train d\'écrire'}...
                                                    </div>
                                                </div>
                                            )}

                                            {messages.map((msg: any) => {
                                                const isSessionInvitation = msg.content.includes('📅 INVITATION');
                                                const sessionIdMatch = msg.content.match(/SESSION_ID:(\S+)/);
                                                const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;
                                                const displayContent = isSessionInvitation ? msg.content.split('SESSION_ID:')[0] : msg.content;

                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${msg.sender?.id === user?.id
                                                            ? 'justify-end'
                                                            : 'justify-start'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender?.id === user?.id
                                                                ? 'bg-gradient-to-r from-[#7CD8EE] to-[#2F4858] text-white'
                                                                : 'bg-gray-100 text-gray-900'
                                                                }`}
                                                        >
                                                            <p className={`text-xs font-bold mb-1 ${msg.sender?.id === user?.id ? 'text-white/80' : 'text-[#7CD8EE]'
                                                                }`}>
                                                                {msg.sender?.name}
                                                            </p>
                                                            <p className="whitespace-pre-wrap">{displayContent}</p>

                                                            {isSessionInvitation && sessionId && msg.sender?.id !== user?.id && (
                                                                <button
                                                                    onClick={() => joinSession.mutate(sessionId)}
                                                                    className="mt-3 w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                                                                >
                                                                    <CheckIcon className="h-4 w-4" />
                                                                    Accepter l'invitation
                                                                </button>
                                                            )}

                                                            <p className={`text-[10px] opacity-60 mt-1 text-right ${msg.sender?.id === user?.id ? 'text-white' : 'text-gray-500'
                                                                }`}>
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Input */}
                                    <div className="p-4 border-t border-gray-200">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={messageInput}
                                                onChange={(e) => handleMessageInputChange(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Écrivez votre message..."
                                                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-[#7CD8EE] focus:outline-none"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!messageInput.trim()}
                                                className="px-6 py-2 bg-gradient-to-r from-[#7CD8EE] to-[#2F4858] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                                            >
                                                Envoyer
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    Sélectionnez une conversation pour commencer à discuter
                                </div>
                            )}
                        </div>
                    </div>
                )}


            </div>

            {/* MODAL GESTION GROUPE */}
            {managingGroup && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Gérer le groupe</h2>
                            <button onClick={() => setManagingGroup(null)}><XMarkIcon className="h-6 w-6" /></button>
                        </div>

                        {/* Nom */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom du groupe</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    defaultValue={managingGroup.name}
                                    className="flex-1 border rounded-lg px-3 py-2"
                                    id="groupNameInput"
                                />
                                <button
                                    onClick={() => {
                                        const name = (document.getElementById('groupNameInput') as HTMLInputElement).value;
                                        updateGroupMutation.mutate({ id: managingGroup.id, name });
                                    }}
                                    className="bg-[#7CD8EE] text-white px-4 py-2 rounded-lg"
                                >
                                    Sauver
                                </button>
                            </div>
                        </div>

                        {/* Membres */}
                        <div className="mb-6">
                            <h3 className="font-bold mb-3">Membres ({groupMembers.length})</h3>
                            <div className="space-y-2">
                                {groupMembers.map((member: any) => (
                                    <div key={member.id} className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                                {member.profilePictureUrl ? <img src={member.profilePictureUrl} className="w-full h-full object-cover" /> : <UsersIcon className="h-5 w-5 m-1.5 text-gray-400" />}
                                            </div>
                                            <span>{member.name} {member.id === user?.id && '(Moi)'}</span>
                                        </div>
                                        {member.id !== user?.id ? (
                                            <button
                                                onClick={() => removeMemberMutation.mutate({ groupId: managingGroup.id, userId: member.id })}
                                                className="text-red-500 p-1 hover:bg-red-50 rounded"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Voulez-vous vraiment quitter le groupe ?')) {
                                                        removeMemberMutation.mutate({ groupId: managingGroup.id, userId: member.id });
                                                        setManagingGroup(null);
                                                    }
                                                }}
                                                className="text-orange-500 p-1 hover:bg-orange-50 rounded"
                                                title="Quitter le groupe"
                                            >
                                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ajouter des membres */}
                        <div>
                            <h3 className="font-bold mb-3">Inviter des amis</h3>
                            <div className="space-y-2">
                                {friends
                                    .filter((f: any) => !groupMembers.some((m: any) => m.id === f.friend.id))
                                    .map((f: any) => (
                                        <div key={f.id} className="flex justify-between items-center">
                                            <span>{f.friend.name}</span>
                                            <button
                                                onClick={() => inviteMemberMutation.mutate({ groupId: managingGroup.id, payload: { receiverId: f.friend.id } })}
                                                className="text-[#7CD8EE] font-semibold text-sm"
                                            >
                                                Inviter
                                            </button>
                                        </div>
                                    ))
                                }
                                {friends.filter((f: any) => !groupMembers.some((m: any) => m.id === f.friend.id)).length === 0 && (
                                    <p className="text-gray-400 text-sm">Tous vos amis sont déjà dans ce groupe.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
