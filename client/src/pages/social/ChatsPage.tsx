import { useState, useRef, useEffect } from 'react';
import {
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    ArrowLeftIcon,
    PaperAirplaneIcon,
    XMarkIcon,
    InformationCircleIcon,
    TrashIcon,
    PlusIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import useUpdateGroup from '../../api/hooks/group/useUpdateGroup';
import useRemoveMember from '../../api/hooks/group/useRemoveMember';
import useDeleteGroup from '../../api/hooks/group/useDeleteGroup';
import useGroupMembers from '../../api/hooks/group/useGetGroupMembers';
import useCreateGroup from '../../api/hooks/group/useCreateGroup';
import useSendGroupRequest from '../../api/hooks/group/useSendGroupRequest';
import useLeaveGroup from '../../api/hooks/group/useLeaveGroup';
import useFriendsList from '../../api/hooks/friend/useGetFriendsList';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useConversations } from '../../api/hooks/chat/useConversations';
import { useMessages } from '../../api/hooks/chat/useMessages';
import { useSendMessage, useMarkAsRead } from '../../api/hooks/chat/useSendMessage';
import { useTypingIndicator } from '../../api/hooks/chat/useTypingIndicator';
import { useConversationRoom } from '../../api/hooks/chat/useConversationRoom';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUtils';
import useJoinSession from '../../api/hooks/shared-session/useJoinSession';
import { useSharedSessions } from '../../api/hooks/shared-session/useSharedSessions';

export default function ChatsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const location = useLocation();

    // State
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
    const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<any | null>(null);
    const [invitedFriends, setInvitedFriends] = useState<number[]>([]);
    const [updateGroupNameStatus, setUpdateGroupNameStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<number | null>(null);

    // Queries
    const { data: conversations = [], isLoading: loadingConvs } = useConversations();
    const { data: messages = [] } = useMessages(selectedConversation);
    const { mutate: sendMessage } = useSendMessage();
    const { mutate: markAsRead } = useMarkAsRead();
    const { data: friendsList = [] } = useFriendsList();

    // Mutations
    const sendGroupRequestMutation = useSendGroupRequest();
    const joinSession = useJoinSession();
    const { data: sharedSessions } = useSharedSessions();

    const createGroupMutation = useCreateGroup({
        onSuccess: (newGroup) => {
            // Send requests to selected friends
            if (selectedFriends.length > 0) {
                selectedFriends.forEach(friendId => {
                    sendGroupRequestMutation.mutate({ groupId: newGroup.id, payload: { receiverId: friendId } });
                });
            }
            setIsCreatingGroup(false);
            setNewGroupName('');
            setSelectedFriends([]);
            // Select the new group conversation if possible, or just refresh
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });


    // Group management mutations
    const updateGroupMutation = useUpdateGroup();
    const removeMemberMutation = useRemoveMember();
    const deleteGroupMutation = useDeleteGroup();
    const leaveGroupMutation = useLeaveGroup();

    const selectedConv = conversations.find((c: any) => c.id === selectedConversation);
    const isGroupChat = selectedConv?.type === 'GROUP' || !!selectedConv?.groupId;
    const { data: groupMembersData } = useGroupMembers(isGroupChat ? selectedConv?.groupId : undefined);
    const groupMembers = groupMembersData?.members || [];
    const isAdmin = groupMembersData?.adminId === user?.id;

    // Check location state for pre-selected conversation
    useEffect(() => {
        if (location.state?.conversationId) {
            setSelectedConversation(location.state.conversationId);
        }
    }, [location.state]);


    // Websocket hooks
    const { typingUsers, startTyping, stopTyping } = useTypingIndicator(selectedConversation);
    useConversationRoom(selectedConversation);

    // Scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, typingUsers, selectedConversation]);

    // Handlers
    const handleSelectConversation = (convId: string) => {
        setSelectedConversation(convId);
        markAsRead(convId);
    };

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

    // Filtered conversations
    const filteredConversations = conversations.filter((c: any) => {
        const name = c.name || c.participants?.filter((p: any) => p.user?.id !== user?.id).map((p: any) => p.user?.name).join(', ') || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });


    // --- RENDER ---

    return (
        <div className="flex h-screen bg-[#121214] pb-safe">
            {/* Note: h-screen might conflict with layout, using h-[calc(100vh-bottom_nav)] if needed, but let's try to fit container */}
            <div className={`flex w-full h-full max-w-5xl mx-auto overflow-hidden ${selectedConversation ? 'bg-[#18181b]' : ''}`}>

                {/* LISTE DES CONVERSATIONS (Sidebar) */}
                <div className={`w-full md:w-1/3 flex flex-col border-r border-white/5 bg-[#121214] ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header Liste */}
                    <div className="p-4 border-b border-white/5 bg-[#121214] sticky top-0 z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white">
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                            <h1 className="text-2xl font-bold text-white">Conversations</h1>
                            <button
                                onClick={() => setIsCreatingGroup(true)}
                                className="ml-auto p-2 bg-[#94fbdd]/10 text-[#94fbdd] rounded-full hover:bg-[#94fbdd]/20 transition-colors"
                            >
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3.5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="w-full bg-[#18181b] pl-9 pr-4 py-2.5 rounded-lg border border-white/5 text-sm text-white focus:outline-none focus:border-[#94fbdd]/50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Liste */}
                    <div className="flex-1 overflow-y-auto">
                        {loadingConvs ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#94fbdd] border-t-transparent"></div>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">
                                <p>Aucune conversation trouvée.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredConversations.map((conv: any) => {
                                    const isGroup = conv.type === 'GROUP' || conv.groupId;
                                    const otherParticipant = conv.participants?.find((p: any) => p.user && p.user.id !== user?.id)?.user;
                                    const firstLetter = (conv.name || 'C')[0].toUpperCase();

                                    // Helper for Group Avatar Color
                                    const getColorFromLetter = (letter: string) => {
                                        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
                                        return colors[letter.charCodeAt(0) % colors.length];
                                    };

                                    const avatarColor = getColorFromLetter(firstLetter);

                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => handleSelectConversation(conv.id)}
                                            className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${selectedConversation === conv.id ? 'bg-white/5' : ''}`}
                                        >
                                            {/* Avatar */}
                                            {isGroup ? (
                                                <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                                                    {firstLetter}
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-[#27272a] overflow-hidden flex-shrink-0">
                                                    {otherParticipant?.profilePictureUrl ? (
                                                        <img src={getImageUrl(otherParticipant.profilePictureUrl)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                                            {otherParticipant?.name?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className="font-semibold text-white truncate pr-2">
                                                        {conv.name || otherParticipant?.name || 'Conversation'}
                                                    </h3>
                                                    {conv.lastMessage && (
                                                        <span className="text-[10px] text-gray-500 flex-shrink-0">
                                                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                        {conv.lastMessage?.sender?.id === user?.id && 'Vous: '}
                                                        {conv.lastMessage?.content || 'Nouvelle conversation'}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="bg-[#94fbdd] text-[#121214] text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ZONE DE CHAT (Main content) */}
                <div className={`flex-1 flex flex-col bg-[#121214] md:bg-[#18181b] relative w-full h-full ${!selectedConversation ? 'hidden md:flex' : 'flex'} pb-24`}>
                    {/* pb-20 to avoid hidden by bottom nav on mobile if absolute */}

                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-[#121214]/50 backdrop-blur-md sticky top-0 z-20">
                                <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white">
                                    <ArrowLeftIcon className="h-6 w-6" />
                                </button>

                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Avatar Mini */}
                                    {/* Simplified avatar logic for header */}
                                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                        {selectedConv?.type === 'PRIVATE' ? (
                                            (() => {
                                                const p = selectedConv.participants?.find((p: any) => p.user?.id !== user?.id)?.user;
                                                return p?.profilePictureUrl ? <img src={getImageUrl(p.profilePictureUrl)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">{p?.name?.[0]}</div>
                                            })()
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs bg-purple-600 font-bold">{selectedConv?.name?.[0]}</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white truncate">
                                            {selectedConv?.name || selectedConv?.participants?.find((p: any) => p.user?.id !== user?.id)?.user?.name || 'Discussion'}
                                        </h3>
                                        {typingUsers.length > 0 && (
                                            <p className="text-xs text-[#94fbdd] animate-pulse">
                                                {typingUsers.join(', ')} écrit...
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowDetails(true)}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                        title="Détails"
                                    >
                                        <InformationCircleIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg: any) => {
                                    // Handle System Messages
                                    if (msg.type === 'SYSTEM') {
                                        return (
                                            <div key={msg.id} className="flex justify-center my-2">
                                                <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                                    {msg.content}
                                                </span>
                                            </div>
                                        );
                                    }

                                    const isMe = msg.sender?.id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe
                                                ? 'bg-[#94fbdd] text-[#121214]'
                                                : 'bg-[#27272a] text-white'
                                                }`}>
                                                {!isMe && (
                                                    <p className="text-[10px] font-bold opacity-50 mb-1">{msg.sender?.name}</p>
                                                )}
                                                {/* Content handling for Session Invites */
                                                    (() => {
                                                        const sessionMatch = msg.content.match(/SESSION_ID:(\S+)/);
                                                        if (sessionMatch) {
                                                            const sessionId = sessionMatch[1];
                                                            const displayContent = msg.content.replace(/SESSION_ID:\S+/, '').trim();

                                                            // Check if already joined
                                                            const isJoined = sharedSessions?.some((s: any) => s.id === sessionId);

                                                            return (
                                                                <div className="space-y-2">
                                                                    <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
                                                                    {!isMe && (
                                                                        isJoined ? (
                                                                            <button
                                                                                disabled
                                                                                className="w-full bg-[#94fbdd]/10 text-[#94fbdd] text-xs font-bold py-2 px-3 rounded-lg border border-[#94fbdd]/20 cursor-default flex items-center justify-center gap-2"
                                                                            >
                                                                                <CheckIcon className="h-4 w-4" />
                                                                                Déjà rejoint
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => joinSession.mutate(sessionId)}
                                                                                disabled={joinSession.isPending}
                                                                                className="w-full bg-[#121214]/50 hover:bg-[#121214]/80 text-white text-xs font-bold py-2 px-3 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2"
                                                                            >
                                                                                {joinSession.isPending ? 'Rejoint...' : 'Rejoindre la séance'}
                                                                            </button>
                                                                        )
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                        return <p className="text-sm">{msg.content}</p>;
                                                    })()
                                                }
                                                <p className={`text-[9px] mt-1 text-right ${isMe ? 'opacity-50' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-3 bg-[#121214] border-t border-white/5">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => handleMessageInputChange(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Message..."
                                        className="flex-1 bg-[#27272a] border-none rounded-full px-4 py-2.5 text-white placeholder-gray-500 focus:ring-1 focus:ring-[#94fbdd]"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        className="p-2.5 bg-[#94fbdd] text-[#121214] rounded-full disabled:opacity-50 active:scale-95 transition-transform"
                                    >
                                        <PaperAirplaneIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <ChatBubbleLeftRightIcon className="h-16 w-16 mb-4 opacity-20" />
                            <p>Sélectionnez une conversation</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Modal Détails / Gestion Groupe */}
            {showDetails && selectedConv && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#18181b] rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border border-white/5 shadow-2xl relative">
                        <button
                            onClick={() => setShowDetails(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6">
                            {isGroupChat ? 'Infos du groupe' : 'Infos de la discussion'}
                        </h2>

                        {/* Contenu Groupe */}
                        {isGroupChat ? (
                            <div className="space-y-6">
                                {/* Nom du groupe (Admin only edit) */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Nom du groupe</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            defaultValue={selectedConv.name}
                                            className="flex-1 bg-[#27272a] border border-white/10 rounded-lg px-3 py-2 text-white disabled:opacity-50"
                                            disabled={!isAdmin}
                                            id="groupNameInput"
                                        />
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    const name = (document.getElementById('groupNameInput') as HTMLInputElement).value;
                                                    if (name && selectedConv.groupId) {
                                                        setUpdateGroupNameStatus('saving');
                                                        updateGroupMutation.mutate({ id: selectedConv.groupId, name }, {
                                                            onSuccess: () => {
                                                                setUpdateGroupNameStatus('success');
                                                                setTimeout(() => {
                                                                    setUpdateGroupNameStatus('idle');
                                                                }, 2000);
                                                                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                                                            },
                                                            onError: () => {
                                                                setUpdateGroupNameStatus('error');
                                                                setTimeout(() => {
                                                                    setUpdateGroupNameStatus('idle');
                                                                }, 2000);
                                                            }
                                                        });
                                                    }
                                                }}
                                                disabled={updateGroupNameStatus !== 'idle'}
                                                className={`px-3 py-2 rounded-lg font-bold transition-all ${updateGroupNameStatus === 'success'
                                                    ? 'bg-green-500 text-white'
                                                    : updateGroupNameStatus === 'error'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-[#94fbdd] text-[#18181b] hover:bg-[#94fbdd]/90'
                                                    }`}
                                            >
                                                {updateGroupNameStatus === 'saving' ? '...' :
                                                    updateGroupNameStatus === 'success' ? <CheckIcon className="h-5 w-5" /> :
                                                        updateGroupNameStatus === 'error' ? '!' :
                                                            'Sauver'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Membres */}
                                <div>
                                    <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">Membres ({groupMembers.length})</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {groupMembers.map((member: any) => (
                                            <div key={member.id} className="flex justify-between items-center p-2 bg-[#27272a] rounded-lg border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-[#18181b] rounded-full overflow-hidden border border-white/10">
                                                        {member.profilePictureUrl ? <img src={getImageUrl(member.profilePictureUrl)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs bg-gray-700">{member.name[0]}</div>}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-200 text-sm font-bold">
                                                            {member.name} {member.id === user?.id && <span className="text-[#94fbdd] text-xs">(Moi)</span>}
                                                        </span>
                                                        {groupMembersData?.adminId === member.id && (
                                                            <span className="text-xs text-yellow-500 font-semibold">Admin</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {isAdmin && member.id !== user?.id && (
                                                    <button
                                                        onClick={() => setMemberToRemove(member)}
                                                        className="text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Exclure"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ajouter des membres */}
                                {isAdmin && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-white text-sm uppercase tracking-wide">Ajouter des membres</h3>
                                            <button
                                                onClick={() => setIsAddingMember(!isAddingMember)}
                                                className="text-[#94fbdd] text-xs hover:underline"
                                            >
                                                {isAddingMember ? 'Fermer' : 'Ajouter'}
                                            </button>
                                        </div>

                                        {isAddingMember && (
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 bg-[#121214] p-2 rounded-lg border border-white/5">
                                                {friendsList
                                                    .filter((f: any) => !groupMembers.find((m: any) => m.id === f.friend.id))
                                                    .map((f: any) => (
                                                        <div key={f.id} className="flex justify-between items-center p-2 rounded hover:bg-white/5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 bg-[#27272a] rounded-full overflow-hidden">
                                                                    {f.friend.profilePictureUrl ? (
                                                                        <img src={getImageUrl(f.friend.profilePictureUrl)} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                                                            {f.friend.name[0]}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-white text-sm">{f.friend.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    if (selectedConv.groupId) {
                                                                        sendGroupRequestMutation.mutate({
                                                                            groupId: selectedConv.groupId,
                                                                            payload: { receiverId: f.friend.id }
                                                                        }, {
                                                                            onSuccess: () => {
                                                                                setInvitedFriends(prev => [...prev, f.friend.id]);
                                                                            }
                                                                        });
                                                                    }
                                                                }}
                                                                disabled={sendGroupRequestMutation.isPending || invitedFriends.includes(f.friend.id)}
                                                                className={`p-1 rounded transition-colors ${invitedFriends.includes(f.friend.id)
                                                                    ? 'text-green-500 bg-green-500/10'
                                                                    : 'text-[#94fbdd] hover:bg-[#94fbdd]/10'
                                                                    }`}
                                                            >
                                                                {invitedFriends.includes(f.friend.id) ? (
                                                                    <CheckIcon className="h-4 w-4" />
                                                                ) : (
                                                                    <PlusIcon className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    ))}
                                                {friendsList.filter((f: any) => !groupMembers.find((m: any) => m.id === f.friend.id)).length === 0 && (
                                                    <p className="text-gray-500 text-xs text-center py-2">Aucun ami à ajouter</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Delete Group Button */}
                                {isAdmin ? (
                                    <div className="pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => {
                                                if (selectedConv.groupId) {
                                                    setShowDeleteGroupModal(true);
                                                }
                                            }}
                                            className="w-full py-3 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                            Supprimer le groupe
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => setShowLeaveGroupModal(true)}
                                            className="w-full py-3 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeftIcon className="h-5 w-5" />
                                            Quitter le groupe
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>Conversation privée</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Confirmation Suppression Groupe */}
            {showDeleteGroupModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl bg-[#18181b] p-6 shadow-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-lg">
                                <TrashIcon className="h-6 w-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Supprimer le groupe</h3>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible et supprimera toutes les données associées.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteGroupModal(false)}
                                className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedConv?.groupId) {
                                        deleteGroupMutation.mutate(selectedConv.groupId, {
                                            onSuccess: () => {
                                                setShowDeleteGroupModal(false);
                                                setShowDetails(false);
                                                setSelectedConversation(null);
                                                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                                            }
                                        });
                                    }
                                }}
                                disabled={deleteGroupMutation.isPending}
                                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteGroupMutation.isPending ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmation Quitter Groupe */}
            {showLeaveGroupModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl bg-[#18181b] p-6 shadow-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-lg">
                                <ArrowLeftIcon className="h-6 w-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Quitter le groupe</h3>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Voulez-vous vraiment quitter ce groupe ? Vous ne pourrez plus voir les messages ni y répondre à moins d'y être invité à nouveau.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveGroupModal(false)}
                                className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedConv?.groupId) {
                                        leaveGroupMutation.mutate(selectedConv.groupId, {
                                            onSuccess: () => {
                                                setShowLeaveGroupModal(false);
                                                setShowDetails(false);
                                                setSelectedConversation(null);
                                                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                                            }
                                        });
                                    }
                                }}
                                disabled={leaveGroupMutation.isPending}
                                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {leaveGroupMutation.isPending ? 'En cours...' : 'Quitter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmation Suppression Membre */}
            {memberToRemove && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl bg-[#18181b] p-6 shadow-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-orange-500/10 rounded-lg">
                                <TrashIcon className="h-6 w-6 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Retirer un membre</h3>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Voulez-vous vraiment retirer <strong>{memberToRemove.name}</strong> du groupe ?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setMemberToRemove(null)}
                                className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedConv?.groupId) {
                                        removeMemberMutation.mutate({ groupId: selectedConv.groupId, userId: memberToRemove.id }, {
                                            onSuccess: () => setMemberToRemove(null)
                                        });
                                    }
                                }}
                                disabled={removeMemberMutation.isPending}
                                className="flex-1 px-4 py-3 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {removeMemberMutation.isPending ? 'En cours...' : 'Retirer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Création Groupe */}
            {isCreatingGroup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#18181b] rounded-xl w-full max-w-md p-6 border border-white/5 shadow-2xl relative">
                        <button
                            onClick={() => setIsCreatingGroup(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6">Créer un groupe</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Nom du groupe</label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Ex: Team Muscu"
                                    className="w-full bg-[#27272a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#94fbdd]"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Inviter des amis</label>
                                <div className="max-h-48 overflow-y-auto bg-[#121214] rounded-lg border border-white/5 p-2 space-y-1">
                                    {friendsList.map((f: any) => {
                                        const isSelected = selectedFriends.includes(f.friend.id);
                                        return (
                                            <div
                                                key={f.id}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedFriends(prev => prev.filter(id => id !== f.friend.id));
                                                    } else {
                                                        setSelectedFriends(prev => [...prev, f.friend.id]);
                                                    }
                                                }}
                                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-[#94fbdd]/10 border border-[#94fbdd]/20' : 'hover:bg-white/5 border border-transparent'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-[#27272a] rounded-full overflow-hidden">
                                                        {f.friend.profilePictureUrl ? (
                                                            <img src={getImageUrl(f.friend.profilePictureUrl)} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">{f.friend.name[0]}</div>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-[#94fbdd]' : 'text-gray-300'}`}>{f.friend.name}</span>
                                                </div>
                                                {isSelected && <CheckIcon className="h-4 w-4 text-[#94fbdd]" />}
                                            </div>
                                        );
                                    })}
                                    {friendsList.length === 0 && <p className="text-center text-gray-500 text-xs py-4">Pas d'amis trouvés</p>}
                                </div>
                            </div>

                            <button
                                onClick={() => createGroupMutation.mutate({ name: newGroupName })}
                                disabled={!newGroupName.trim() || createGroupMutation.isPending}
                                className="w-full py-3 bg-[#94fbdd] text-[#121214] font-bold rounded-lg hover:bg-[#94fbdd]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                            >
                                {createGroupMutation.isPending ? 'Création...' : 'Créer le groupe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
