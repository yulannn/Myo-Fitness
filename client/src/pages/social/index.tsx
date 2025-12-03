import { useState, useRef, useEffect } from 'react';
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
    CalendarIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import SharedSessionsList from '../../components/social/SharedSessionsList';
import { useJoinSharedSession } from '../../api/hooks/shared-session/useSharedSessions';
import { useConversations } from '../../api/hooks/chat/useConversations';
import { useMessages } from '../../api/hooks/chat/useMessages';
import { useSendMessage, useMarkAsRead } from '../../api/hooks/chat/useSendMessage';
import { useTypingIndicator } from '../../api/hooks/chat/useTypingIndicator';
import { useConversationRoom } from '../../api/hooks/chat/useConversationRoom';
import ChatService from '../../api/services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useSessionNotifications } from '../../api/hooks/shared-session/useSessionNotifications';
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
import useDeclineGroupRequest from '../../api/hooks/group/useDeclineGroupRequest';
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
    const [friendRequestSent, setFriendRequestSent] = useState<number | null>(null);
    const [groupInviteSent, setGroupInviteSent] = useState<number[]>([]);
    const [showLeaveGroupConfirm, setShowLeaveGroupConfirm] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<any | null>(null);
    const [joinedSessions, setJoinedSessions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const declineGroup = useDeclineGroupRequest();
    const updateGroupMutation = useUpdateGroup();
    const removeMemberMutation = useRemoveMember();
    const inviteMemberMutation = useSendGroupRequest();

    // Scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, typingUsers]);

    // --- HANDLERS ---
    const handleSendMessage = () => {
        if (!selectedConversation || !messageInput.trim()) return;

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

        if (value.trim()) {
            startTyping();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = window.setTimeout(() => {
                stopTyping();
            }, 3000);
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
        { id: 'messages' as const, label: 'Messages', icon: ChatBubbleLeftRightIcon },
        { id: 'friends' as const, label: 'Amis', icon: UsersIcon },
        { id: 'groups' as const, label: 'Groupes', icon: UserGroupIcon },
    ];

    const selectedConv = conversations.find((c: any) => c.id === selectedConversation);

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Social</h1>
                    <p className="text-sm text-gray-400">Restez connecté avec votre communauté</p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex p-1 bg-[#252527] rounded-xl border border-purple-500/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-[#121214]/50'
                                }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Section Séances Planifiées (Toggle) */}
                <div className="bg-[#252527] rounded-2xl border border-purple-500/10 overflow-hidden">
                    <button
                        onClick={() => setShowSessions(!showSessions)}
                        className="w-full p-4 flex items-center justify-between hover:bg-[#121214]/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-xl">
                                <CalendarIcon className="h-6 w-6 text-purple-400" />
                            </div>
                            <div className="text-left">
                                <h2 className="font-bold text-white">Séances Planifiées</h2>
                                <p className="text-xs text-gray-400">Rejoindre des séances d'entraînement</p>
                            </div>
                        </div>
                        <div className={`transform transition-transform duration-300 ${showSessions ? 'rotate-180' : ''}`}>
                            <div className="p-1 rounded-full bg-[#121214] border border-purple-500/10">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </button>
                    {showSessions && (
                        <div className="p-4 border-t border-purple-500/10 bg-[#121214]/50">
                            <SharedSessionsList />
                        </div>
                    )}
                </div>

                {/* --- ONGLET MESSAGES --- */}
                {activeTab === 'messages' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-280px)] min-h-[500px]">
                        {/* Liste Conversations */}
                        <div className={`bg-[#252527] rounded-2xl border border-purple-500/10 overflow-hidden flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-4 border-b border-purple-500/10 bg-[#121214]/30">
                                <h2 className="font-bold text-white">Conversations</h2>
                            </div>

                            {loadingConvs ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                                    <ChatBubbleLeftRightIcon className="h-12 w-12 mb-2 opacity-20" />
                                    <p>Aucune conversation</p>
                                    <p className="text-xs mt-1">Commencez à discuter avec vos amis !</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-purple-500/5 overflow-y-auto flex-1">
                                    {conversations.map((conv: any) => {
                                        // Déterminer si c'est un groupe ou une conversation privée
                                        const isGroup = conv.type === 'GROUP' || conv.groupId;
                                        const otherParticipant = conv.participants?.find((p: any) => p.user && p.user.id !== user?.id)?.user;

                                        // Générer une couleur basée sur la première lettre
                                        const getColorFromLetter = (letter: string) => {
                                            const colors = [
                                                'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
                                                'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
                                            ];
                                            const index = letter.charCodeAt(0) % colors.length;
                                            return colors[index];
                                        };

                                        const firstLetter = (conv.name || 'C')[0].toUpperCase();
                                        const avatarColor = getColorFromLetter(firstLetter);

                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => handleSelectConversation(conv.id)}
                                                className={`w-full p-4 text-left hover:bg-[#121214]/50 transition-colors ${selectedConversation === conv.id ? 'bg-purple-500/10 border-l-4 border-purple-500' : 'border-l-4 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Avatar */}
                                                    {isGroup ? (
                                                        <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                                                            <span className="text-white font-bold text-lg">{firstLetter}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-[#252527] overflow-hidden border-2 border-purple-500/20 flex-shrink-0">
                                                            {otherParticipant?.profilePictureUrl ? (
                                                                <img
                                                                    src={"http://localhost:3000" + otherParticipant.profilePictureUrl}
                                                                    alt={otherParticipant.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                                                                    <span className="text-white font-bold text-lg">
                                                                        {otherParticipant?.name?.[0]?.toUpperCase() || '?'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className={`font-semibold truncate ${selectedConversation === conv.id ? 'text-purple-400' : 'text-white'}`}>
                                                            {conv.name || (() => {
                                                                const otherParticipants = conv.participants
                                                                    ?.filter((p: any) => p.user && p.user.id !== user?.id)
                                                                    .map((p: any) => p.user.name.split(' ')[0]);
                                                                return otherParticipants?.join(', ') || 'Conversation';
                                                            })()}
                                                        </h3>
                                                        {conv.lastMessage && (
                                                            <p className="text-sm text-gray-400 truncate mt-1">
                                                                {conv.lastMessage.sender?.id === user?.id ? 'Vous: ' : ''}{conv.lastMessage.content}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Fenêtre Chat */}
                        <div className={`md:col-span-2 bg-[#252527] rounded-2xl border border-purple-500/10 flex flex-col overflow-hidden ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                            {selectedConversation ? (
                                <>
                                    {/* Header Chat */}
                                    <div className="p-4 border-b border-purple-500/10 bg-[#121214]/30 flex items-center gap-3">
                                        <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white truncate">
                                                {selectedConv?.name || (() => {
                                                    const otherParticipants = selectedConv?.participants
                                                        ?.filter((p: any) => p.user && p.user.id !== user?.id)
                                                        .map((p: any) => p.user.name.split(' ')[0]);
                                                    return otherParticipants?.join(', ') || 'Conversation';
                                                })()}
                                            </h3>
                                            {typingUsers.length > 0 && (
                                                <p className="text-xs text-purple-400 animate-pulse">
                                                    {typingUsers.join(', ')} écrit...
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121214]/20">
                                        {messages.slice().map((msg: any) => {
                                            const isMe = msg.sender?.id === user?.id;
                                            const isSessionInvitation = msg.content.includes('📅 INVITATION');
                                            const sessionIdMatch = msg.content.match(/SESSION_ID:(\S+)/);
                                            const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;
                                            const displayContent = isSessionInvitation ? msg.content.split('SESSION_ID:')[0] : msg.content;

                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${isMe
                                                        ? 'bg-purple-500 text-white rounded-tr-none'
                                                        : 'bg-[#121214] border border-purple-500/10 text-gray-200 rounded-tl-none'
                                                        }`}>
                                                        {!isMe && (
                                                            <p className="text-xs font-bold text-purple-300 mb-1">
                                                                {msg.sender?.name}
                                                            </p>
                                                        )}
                                                        <p className="whitespace-pre-wrap text-sm sm:text-base">{displayContent}</p>

                                                        {isSessionInvitation && sessionId && !isMe && (
                                                            <button
                                                                onClick={() => {
                                                                    if (!joinedSessions.includes(sessionId)) {
                                                                        joinSession.mutate(sessionId, {
                                                                            onSuccess: () => {
                                                                                setJoinedSessions(prev => [...prev, sessionId]);
                                                                            }
                                                                        });
                                                                    }
                                                                }}
                                                                disabled={joinedSessions.includes(sessionId)}
                                                                className={`mt-3 w-full px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${joinedSessions.includes(sessionId)
                                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                                                                        : 'bg-[#252527] hover:bg-[#121214] text-purple-400 border border-purple-500/30'
                                                                    }`}
                                                            >
                                                                {joinedSessions.includes(sessionId) ? (
                                                                    <>
                                                                        <CheckIcon className="h-4 w-4" />
                                                                        Rejoint
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckIcon className="h-4 w-4" />
                                                                        Accepter l'invitation
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}

                                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-[#121214]/60' : 'text-gray-500'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-3 sm:p-4 border-t border-purple-500/10 bg-[#121214]/30">
                                        <div className="flex gap-2 sm:gap-3">
                                            <input
                                                type="text"
                                                value={messageInput}
                                                onChange={(e) => handleMessageInputChange(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Écrivez votre message..."
                                                className="flex-1 bg-[#121214] border border-purple-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!messageInput.trim()}
                                                className="p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                                            >
                                                <PaperAirplaneIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                                    <div className="w-20 h-20 bg-[#252527] rounded-full flex items-center justify-center mb-4 border border-purple-500/10">
                                        <ChatBubbleLeftRightIcon className="h-10 w-10 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Vos Messages</h3>
                                    <p className="max-w-xs">Sélectionnez une conversation dans la liste pour commencer à discuter.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- ONGLET AMIS --- */}
                {activeTab === 'friends' && (
                    <div className="space-y-6">
                        {/* Recherche */}
                        <div className="bg-[#252527] p-4 rounded-2xl border border-purple-500/10">
                            <div className="relative">
                                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un utilisateur..."
                                    className="w-full bg-[#121214] pl-10 pr-4 py-3 rounded-xl border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {searchResults.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {searchResults.map((user: any) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-purple-500/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#252527] rounded-full overflow-hidden border border-purple-500/20">
                                                    {user.profilePictureUrl ? (
                                                        <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UsersIcon className="w-5 h-5 m-2.5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
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
                                                    className={`p-2 rounded-lg transition-all duration-500 ease-in-out transform ${friendRequestSent === user.id || user.status === 'SENT'
                                                        ? 'bg-green-500/20 text-green-400 scale-110 cursor-default'
                                                        : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:scale-105 cursor-pointer'
                                                        }`}
                                                >
                                                    {friendRequestSent === user.id || user.status === 'SENT' ? (
                                                        <CheckIcon className="h-5 w-5 animate-in zoom-in duration-300" />
                                                    ) : (
                                                        <PlusIcon className="h-5 w-5" />
                                                    )}
                                                </button>
                                            )}
                                            {user.status === 'FRIEND' && <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">Ami</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Demandes reçues */}
                        {friendRequests.length > 0 && (
                            <div className="bg-[#252527] p-4 rounded-2xl border border-purple-500/10">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    Demandes reçues
                                </h3>
                                <div className="space-y-3">
                                    {friendRequests.map((req: any) => (
                                        <div key={req.id} className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-purple-500/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#252527] rounded-full overflow-hidden border border-purple-500/20">
                                                    {req.sender?.profilePictureUrl ? (
                                                        <img src={req.sender.profilePictureUrl} alt={req.sender.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UsersIcon className="w-5 h-5 m-2.5 text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-white">{req.sender?.name || 'Utilisateur'}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => acceptFriend.mutate(req.id)} className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors">
                                                    <CheckIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => declineFriend.mutate(req.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Liste d'amis */}
                        <div className="bg-[#252527] p-4 rounded-2xl border border-purple-500/10">
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
                                            className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-purple-500/5 hover:border-purple-500/30 transition-all cursor-pointer group"
                                            onClick={() => startChatWithFriend(f.friend.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#252527] rounded-full overflow-hidden border border-purple-500/20">
                                                    {f.friend.profilePictureUrl ? (
                                                        <img src={f.friend.profilePictureUrl} alt={f.friend.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UsersIcon className="w-5 h-5 m-2.5 text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-white group-hover:text-purple-400 transition-colors">{f.friend.name}</span>
                                            </div>
                                            <div className="p-2 bg-[#252527] rounded-lg text-gray-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                                                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                            </div>
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
                        <div className="bg-[#252527] p-4 rounded-2xl border border-purple-500/10">
                            {!isCreatingGroup ? (
                                <button
                                    onClick={() => setIsCreatingGroup(true)}
                                    className="w-full py-4 border border-dashed border-purple-500/30 rounded-xl text-purple-400 font-semibold hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    Créer un nouveau groupe
                                </button>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nom du groupe"
                                        className="flex-1 bg-[#121214] border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => createGroup.mutate({ name: newGroupName })}
                                            disabled={!newGroupName.trim()}
                                            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-purple-600 transition-colors"
                                        >
                                            Créer
                                        </button>
                                        <button
                                            onClick={() => setIsCreatingGroup(false)}
                                            className="px-6 py-3 bg-[#121214] text-gray-400 rounded-xl font-semibold hover:text-white transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Invitations Groupes */}
                        {groupRequests.length > 0 && (
                            <div className="bg-[#252527] p-4 rounded-2xl border border-purple-500/10">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    Invitations de groupe
                                </h3>
                                <div className="space-y-3">
                                    {groupRequests.map((req: any) => (
                                        <div key={req.id} className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-purple-500/5">
                                            <span className="text-gray-300 text-sm">
                                                <strong className="text-white">{req.sender?.name}</strong> vous invite à rejoindre <strong className="text-purple-400">{req.group?.name}</strong>
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => declineGroup.mutate(req.id)}
                                                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                                    title="Refuser"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => acceptGroup.mutate(req.id)}
                                                    className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors"
                                                    title="Accepter"
                                                >
                                                    <CheckIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Liste Groupes */}
                        <div className="bg-[#252527] p-4 rounded-2xl border border-purple-500/10">
                            <h3 className="font-bold text-white mb-4">Mes Groupes</h3>
                            {myGroups.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <UserGroupIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>Vous ne faites partie d'aucun groupe.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {myGroups.map((group: any) => (
                                        <div
                                            key={group.id}
                                            className="p-4 bg-[#121214] border border-purple-500/10 rounded-xl hover:border-purple-500/30 transition-all flex justify-between items-center group"
                                        >
                                            <div onClick={() => openGroupChat(group.id)} className="cursor-pointer flex-1">
                                                <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">{group.name}</h4>
                                                <p className="text-xs text-gray-500">{group.members?.length || 0} membres</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setManagingGroup(group)}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-[#252527] rounded-lg transition-colors"
                                                    title="Gérer le groupe"
                                                >
                                                    <Cog6ToothIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => openGroupChat(group.id)}
                                                    className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                                                    title="Ouvrir le chat"
                                                >
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
            </div>

            {/* MODAL GESTION GROUPE */}
            {managingGroup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#252527] rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border border-purple-500/20 shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 border-b border-purple-500/10 pb-4">
                            <h2 className="text-xl font-bold text-white">Gérer le groupe</h2>
                            <button onClick={() => setManagingGroup(null)} className="text-gray-400 hover:text-white">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Nom */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nom du groupe</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    defaultValue={managingGroup.name}
                                    className="flex-1 bg-[#121214] border border-purple-500/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                    id="groupNameInput"
                                />
                                <button
                                    onClick={() => {
                                        const name = (document.getElementById('groupNameInput') as HTMLInputElement).value;
                                        updateGroupMutation.mutate({ id: managingGroup.id, name });
                                    }}
                                    className="bg-purple-500 text-[#121214] px-4 py-2 rounded-xl font-bold hover:bg-purple-500/90"
                                >
                                    Sauver
                                </button>
                            </div>
                        </div>

                        {/* Membres */}
                        <div className="mb-6">
                            <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">Membres ({groupMembers.length})</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {groupMembers.map((member: any) => (
                                    <div key={member.id} className="flex justify-between items-center p-2 bg-[#121214] rounded-lg border border-purple-500/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-[#252527] rounded-full overflow-hidden border border-purple-500/20">
                                                {member.profilePictureUrl ? <img src={"http://localhost:3000" + member.profilePictureUrl} className="w-full h-full object-cover" /> : <UsersIcon className="h-4 w-4 m-2 text-gray-400" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-200 text-sm">
                                                    {member.name} {member.id === user?.id && <span className="text-purple-400 text-xs">(Moi)</span>}
                                                </span>
                                                {groupMembers[0]?.id === member.id && (
                                                    <span className="text-xs text-yellow-400 font-semibold">Créateur</span>
                                                )}
                                            </div>
                                        </div>
                                        {member.id !== user?.id ? (
                                            // Seul le créateur (premier membre) peut exclure
                                            groupMembers[0]?.id === user?.id && (
                                                <button
                                                    onClick={() => setMemberToRemove(member)}
                                                    className="text-red-400 p-1.5 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Exclure du groupe"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                onClick={() => setShowLeaveGroupConfirm(true)}
                                                className="text-orange-400 p-1.5 hover:bg-orange-400/10 rounded-lg transition-colors"
                                                title="Quitter le groupe"
                                            >
                                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ajouter des membres */}
                        <div>
                            <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">Inviter des amis</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {friends
                                    .filter((f: any) => !groupMembers.some((m: any) => m.id === f.friend.id))
                                    .map((f: any) => (
                                        <div key={f.id} className="flex justify-between items-center p-2 bg-[#121214] rounded-lg border border-purple-500/5">
                                            <span className="text-gray-300 text-sm">{f.friend.name}</span>
                                            <button
                                                onClick={() => {
                                                    inviteMemberMutation.mutate({ groupId: managingGroup.id, payload: { receiverId: f.friend.id } }, {
                                                        onSuccess: () => {
                                                            setGroupInviteSent(prev => [...prev, f.friend.id]);
                                                        }
                                                    });
                                                }}
                                                disabled={groupInviteSent.includes(f.friend.id)}
                                                className={`flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-lg transition-all duration-500 ease-in-out transform ${groupInviteSent.includes(f.friend.id)
                                                    ? 'bg-green-500/20 text-green-400 scale-105 cursor-default'
                                                    : 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 hover:scale-105 cursor-pointer'
                                                    }`}
                                            >
                                                {groupInviteSent.includes(f.friend.id) ? (
                                                    <>
                                                        <CheckIcon className="h-4 w-4 animate-in zoom-in duration-300" />
                                                        Invité
                                                    </>
                                                ) : (
                                                    'Inviter'
                                                )}
                                            </button>
                                        </div>
                                    ))
                                }
                                {friends.filter((f: any) => !groupMembers.some((m: any) => m.id === f.friend.id)).length === 0 && (
                                    <p className="text-gray-500 text-sm italic text-center py-2">Tous vos amis sont déjà dans ce groupe.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Modale de confirmation de sortie de groupe */}
            {showLeaveGroupConfirm && managingGroup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#252527] rounded-2xl border border-purple-500/20 max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-orange-500/10 rounded-xl">
                                <ArrowRightOnRectangleIcon className="h-6 w-6 text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {groupMembers.length === 1 ? 'Supprimer le groupe ?' : 'Quitter le groupe ?'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {groupMembers.length === 1
                                        ? `Vous êtes le dernier membre de "${managingGroup.name}". Le groupe sera définitivement supprimé.`
                                        : `Êtes-vous sûr de vouloir quitter "${managingGroup.name}" ? Vous pourrez être réinvité plus tard.`
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveGroupConfirm(false)}
                                className="flex-1 px-4 py-3 bg-[#121214] text-gray-300 rounded-xl hover:bg-[#1a1a1c] transition-colors font-semibold"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    const currentUserId = user?.id;
                                    if (currentUserId) {
                                        removeMemberMutation.mutate({ groupId: managingGroup.id, userId: currentUserId });
                                        setManagingGroup(null);
                                        setShowLeaveGroupConfirm(false);
                                    }
                                }}
                                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold shadow-lg shadow-orange-500/20"
                            >
                                {groupMembers.length === 1 ? 'Supprimer' : 'Quitter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale de confirmation d'exclusion de membre */}
            {memberToRemove && managingGroup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#252527] rounded-2xl border border-purple-500/20 max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <TrashIcon className="h-6 w-6 text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Exclure ce membre ?
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Êtes-vous sûr de vouloir exclure <strong className="text-white">{memberToRemove.name}</strong> du groupe "<strong className="text-purple-400">{managingGroup.name}</strong>" ?
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setMemberToRemove(null)}
                                className="flex-1 px-4 py-3 bg-[#121214] text-gray-300 rounded-xl hover:bg-[#1a1a1c] transition-colors font-semibold"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    removeMemberMutation.mutate({ groupId: managingGroup.id, userId: memberToRemove.id });
                                    setMemberToRemove(null);
                                }}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold shadow-lg shadow-red-500/20"
                            >
                                Exclure
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
