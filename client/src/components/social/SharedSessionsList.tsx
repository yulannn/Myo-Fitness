import React, { useState } from 'react';
import { useSharedSessions, useJoinSharedSession, useLeaveSharedSession, useDeleteSharedSession, useInviteGroupToSession, useInviteFriendToSession } from '../../api/hooks/shared-session/useSharedSessions';
import useUserGroups from '../../api/hooks/group/useGetUserGroups';
import { useFriendsList } from '../../api/hooks/friend/useGetFriendsList';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, Users, Plus, Trash2, LogOut, LogIn, UserPlus, X, ChevronDown, ChevronUp, AlertTriangle, Check } from 'lucide-react';
import CreateSharedSessionModal from './CreateSharedSessionModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getImageUrl } from '../../utils/imageUtils';

const SharedSessionsList: React.FC = () => {
    const { user } = useAuth();
    const { data: sessions, isLoading } = useSharedSessions();
    const { data: groups } = useUserGroups();
    const { data: friends } = useFriendsList();
    const joinSession = useJoinSharedSession();
    const leaveSession = useLeaveSharedSession();
    const deleteSession = useDeleteSharedSession();
    const inviteGroup = useInviteGroupToSession();
    const inviteFriend = useInviteFriendToSession();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [inviteModalSessionId, setInviteModalSessionId] = useState<string | null>(null);
    const [inviteTab, setInviteTab] = useState<'groups' | 'friends'>('groups');
    const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
    const [deleteConfirmSessionId, setDeleteConfirmSessionId] = useState<string | null>(null);
    const [invitedFriends, setInvitedFriends] = useState<number[]>([]);

    const toggleSessionExpansion = (sessionId: string) => {
        setExpandedSessions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sessionId)) {
                newSet.delete(sessionId);
            } else {
                newSet.add(sessionId);
            }
            return newSet;
        });
    };

    const handleInviteGroup = (sessionId: string, groupId: number) => {
        inviteGroup.mutate({ sessionId, groupId }, {
            onSuccess: () => {
                setInviteModalSessionId(null);
            }
        });
    };

    const handleInviteFriend = (sessionId: string, friendId: number) => {
        inviteFriend.mutate({ sessionId, friendId }, {
            onSuccess: () => {
                setInvitedFriends(prev => [...prev, friendId]);
            }
        });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirmSessionId) {
            deleteSession.mutate(deleteConfirmSessionId, {
                onSuccess: () => {
                    setDeleteConfirmSessionId(null);
                }
            });
        }
    };

    if (isLoading) return <div className="text-center py-8 text-gray-400">Chargement des séances...</div>;

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Séances Partagées</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="p-2 bg-[#27272a] hover:bg-[#94fbdd]/10 text-white hover:text-[#94fbdd] rounded-lg transition-all border border-white/5"
                    title="Créer une séance"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <Users size={20} className="text-gray-500" />
                        </div>
                        <p className="text-gray-500 font-medium">Aucune séance partagée à venir</p>
                    </div>
                )}

                {sessions?.map((session: any) => {
                    const isOrganizer = session.organizerId === user?.id;
                    const isParticipant = session.participants.some((p: any) => p.userId === user?.id);
                    const isFull = session.maxParticipants ? session.participants.length >= session.maxParticipants : false;
                    const isExpanded = expandedSessions.has(session.id);

                    return (
                        <div key={session.id} className="bg-[#18181b] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all group">
                            {/* Header - Always visible */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-[#94fbdd]/10 rounded-md">
                                            <Users size={16} className="text-[#94fbdd]" />
                                        </div>
                                        <span className="text-xs font-bold text-[#94fbdd] uppercase tracking-wide">Séance Partagée</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-white mb-1 truncate">{session.title}</h3>
                                    {session.group && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-xs font-medium text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                                                {session.group.name} • {(session.group as any).members?.length || 0} membres
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleSessionExpansion(session.id)}
                                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                        title={isExpanded ? "Masquer les détails" : "Afficher les détails"}
                                    >
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    {isOrganizer && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setInviteModalSessionId(session.id);
                                                    setInvitedFriends([]);
                                                }}
                                                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#94fbdd] hover:bg-[#94fbdd]/10 transition-all"
                                                title="Inviter des personnes"
                                            >
                                                <UserPlus size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmSessionId(session.id)}
                                                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                title="Supprimer la séance"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Collapsible Details */}
                            {isExpanded && (
                                <>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{session.description || "Pas de description"}</p>

                                    <div className="space-y-2 text-sm text-gray-300 mb-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-500" />
                                            <span>{format(new Date(session.startTime), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-500" />
                                            <span>{session.location || 'Non spécifié'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-gray-500" />
                                            <span>
                                                {session.participants.length} / {session.maxParticipants || '∞'} participants
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {session.participants.slice(0, 3).map((p: any) => (
                                                <img
                                                    key={p.id}
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[#18181b] object-cover"
                                                    src={getImageUrl(p.user.profilePictureUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.name)}&background=random`}
                                                    alt={p.user.name}
                                                    title={p.user.name}
                                                />
                                            ))}
                                            {session.participants.length > 3 && (
                                                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-[#18181b] bg-[#27272a] text-xs text-gray-300 font-medium">
                                                    +{session.participants.length - 3}
                                                </div>
                                            )}
                                        </div>

                                        {isParticipant ? (
                                            <button
                                                onClick={() => leaveSession.mutate(session.id)}
                                                disabled={isOrganizer}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isOrganizer
                                                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                    }`}
                                            >
                                                {isOrganizer ? 'Organisateur' : (
                                                    <>
                                                        <LogOut size={16} />
                                                        Quitter
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => joinSession.mutate(session.id)}
                                                disabled={isFull}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${isFull
                                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                    : 'bg-[#94fbdd] text-[#18181b] hover:bg-[#94fbdd]/90'
                                                    }`}
                                            >
                                                <LogIn size={16} />
                                                {isFull ? 'Complet' : 'Rejoindre'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Compact view when collapsed */}
                            {!isExpanded && (
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar size={14} className="text-[#94fbdd]" />
                                        <span className="text-xs">{format(new Date(session.startTime), "d MMM 'à' HH:mm", { locale: fr })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {session.participants.slice(0, 2).map((p: any) => (
                                                <img
                                                    key={p.id}
                                                    className="inline-block h-6 w-6 rounded-full ring-2 ring-[#18181b] object-cover"
                                                    src={getImageUrl(p.user.profilePictureUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.name)}&background=random`}
                                                    alt={p.user.name}
                                                />
                                            ))}
                                            {session.participants.length > 2 && (
                                                <div className="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-[#18181b] bg-[#27272a] text-[10px] text-gray-300 font-medium">
                                                    +{session.participants.length - 2}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal Création */}
            <CreateSharedSessionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Modal Confirmation de suppression */}
            {deleteConfirmSessionId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl bg-[#18181b] p-6 shadow-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-500/10 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Supprimer la séance</h3>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Êtes-vous sûr de vouloir supprimer cette séance partagée ? Cette action est irréversible et tous les participants seront notifiés.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmSessionId(null)}
                                className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteSession.isPending}
                                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteSession.isPending ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Invitation avec ONGLETS Groupes / Amis */}
            {inviteModalSessionId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-[#18181b] rounded-xl w-full max-w-md p-6 relative shadow-2xl border border-white/5">
                        <button
                            onClick={() => setInviteModalSessionId(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-all"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-2">Inviter des personnes</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Un message d'invitation sera envoyé dans le chat.
                        </p>

                        {/* Onglets */}
                        <div className="flex gap-2 mb-4 p-1 bg-[#27272a] rounded-lg">
                            <button
                                onClick={() => setInviteTab('groups')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${inviteTab === 'groups'
                                    ? 'bg-[#18181b] text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Groupes
                            </button>
                            <button
                                onClick={() => setInviteTab('friends')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${inviteTab === 'friends'
                                    ? 'bg-[#18181b] text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Amis
                            </button>
                        </div>

                        {/* Contenu selon l'onglet */}
                        <div className="space-y-2 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {inviteTab === 'groups' ? (
                                // LISTE DES GROUPES
                                (groups?.length || 0) > 0 ? (
                                    groups?.map((group: any) => (
                                        <button
                                            key={group.id}
                                            onClick={() => handleInviteGroup(inviteModalSessionId!, group.id)}
                                            disabled={inviteGroup.isPending}
                                            className="w-full text-left p-4 bg-[#27272a] hover:bg-[#27272a]/80 rounded-lg transition-all border border-transparent hover:border-[#94fbdd]/30 disabled:opacity-50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-white">{group.name}</p>
                                                    <p className="text-sm text-gray-400">{group.members?.length || 0} membres</p>
                                                </div>
                                                <UserPlus size={20} className="text-[#94fbdd]" />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400 py-8">
                                        Vous n'avez aucun groupe.
                                    </p>
                                )
                            ) : (
                                // LISTE DES AMIS
                                (friends?.length || 0) > 0 ? (
                                    friends?.map((friendData: any) => {
                                        const isInvited = invitedFriends.includes(friendData.friend.id);
                                        return (
                                            <button
                                                key={friendData.id}
                                                onClick={() => !isInvited && handleInviteFriend(inviteModalSessionId!, friendData.friend.id)}
                                                disabled={inviteFriend.isPending || isInvited}
                                                className={`w-full text-left p-4 rounded-lg transition-all border ${isInvited
                                                    ? 'bg-green-500/10 border-green-500/30 cursor-default'
                                                    : 'bg-[#27272a] border-transparent hover:border-[#94fbdd]/30'
                                                    } disabled:opacity-50`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={getImageUrl(friendData.friend.profilePictureUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(friendData.friend.name)}&background=random`}
                                                            alt={friendData.friend.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <p className={`font-semibold ${isInvited ? 'text-green-400' : 'text-white'}`}>
                                                            {friendData.friend.name}
                                                        </p>
                                                    </div>
                                                    {isInvited ? (
                                                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                                            <span>Invité</span>
                                                            <Check size={20} />
                                                        </div>
                                                    ) : (
                                                        <UserPlus size={20} className="text-[#94fbdd]" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-gray-400 py-8">
                                        Vous n'avez aucun ami.
                                    </p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharedSessionsList;
