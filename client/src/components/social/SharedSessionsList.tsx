import React, { useState } from 'react';
import { useSharedSessions, useJoinSharedSession, useLeaveSharedSession, useDeleteSharedSession, useInviteGroupToSession, useInviteFriendToSession } from '../../api/hooks/shared-session/useSharedSessions';
import useUserGroups from '../../api/hooks/group/useGetUserGroups';
import { useFriendsList } from '../../api/hooks/friend/useGetFriendsList';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, Users, Plus, Trash2, LogOut, LogIn, UserPlus, X } from 'lucide-react';
import CreateSharedSessionModal from './CreateSharedSessionModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
                setInviteModalSessionId(null);
            }
        });
    };

    if (isLoading) return <div className="text-center py-8 text-gray-400">Chargement des séances...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Séances Partagées</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-[#94fbdd] hover:bg-[#94fbdd]/80 text-[#121214] px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus size={18} />
                    Proposer une séance
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions?.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-[#252527] rounded-xl border border-gray-700 border-dashed">
                        <p className="text-gray-400">Aucune séance partagée prévue pour le moment.</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-[#121214] hover:text-[#94fbdd] mt-2 text-sm font-medium"
                        >
                            Soyez le premier à en proposer une !
                        </button>
                    </div>
                )}

                {sessions?.map((session: any) => {
                    const isOrganizer = session.organizerId === user?.id;
                    const isParticipant = session.participants.some((p: any) => p.userId === user?.id);
                    const isFull = session.maxParticipants ? session.participants.length >= session.maxParticipants : false;

                    return (
                        <div key={session.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-lg hover:border-gray-600 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-white">{session.title}</h3>
                                    {session.group && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-xs font-medium text-[#121214] bg-[#121214]/10 px-2 py-0.5 rounded-full">
                                                {session.group.name} • {(session.group as any).members?.length || 0} membres
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {/* Bouton TOUJOURS visible pour l'organisateur */}
                                    {isOrganizer && (
                                        <button
                                            onClick={() => setInviteModalSessionId(session.id)}
                                            className="text-[#121214] hover:text-[#121214]/80 transition-colors"
                                            title="Inviter des personnes"
                                        >
                                            <UserPlus size={18} />
                                        </button>
                                    )}
                                    {isOrganizer && (
                                        <button
                                            onClick={() => deleteSession.mutate(session.id)}
                                            className="text-gray-500 hover:text-red-400 transition-colors"
                                            title="Supprimer la séance"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{session.description || "Pas de description"}</p>

                            <div className="space-y-2 text-sm text-gray-300 mb-6">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-[#121214]" />
                                    <span>{format(new Date(session.startTime), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-[#121214]" />
                                    <span>{session.location || 'Non spécifié'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-[#121214]" />
                                    <span>
                                        {session.participants.length} / {session.maxParticipants || '∞'} participants
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {session.participants.slice(0, 3).map((p: any) => (
                                        <img
                                            key={p.id}
                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-800 object-cover"
                                            src={p.user.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.name)}&background=random`}
                                            alt={p.user.name}
                                            title={p.user.name}
                                        />
                                    ))}
                                    {session.participants.length > 3 && (
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-gray-800 bg-gray-700 text-xs text-white font-medium">
                                            +{session.participants.length - 3}
                                        </div>
                                    )}
                                </div>

                                {isParticipant ? (
                                    <button
                                        onClick={() => leaveSession.mutate(session.id)}
                                        disabled={isOrganizer}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isOrganizer
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
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
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isFull
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                    >
                                        <LogIn size={16} />
                                        {isFull ? 'Complet' : 'Rejoindre'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Création */}
            <CreateSharedSessionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Modal Invitation avec ONGLETS Groupes / Amis */}
            {inviteModalSessionId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 relative shadow-xl border border-gray-700">
                        <button
                            onClick={() => setInviteModalSessionId(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-2">Inviter des personnes</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Un message d'invitation sera envoyé dans le chat.
                        </p>

                        {/* Onglets */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setInviteTab('groups')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${inviteTab === 'groups'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                            >
                                Groupes
                            </button>
                            <button
                                onClick={() => setInviteTab('friends')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${inviteTab === 'friends'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                            >
                                Amis
                            </button>
                        </div>

                        {/* Contenu selon l'onglet */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {inviteTab === 'groups' ? (
                                // LISTE DES GROUPES
                                groups && groups.length > 0 ? (
                                    groups.map((group: any) => (
                                        <button
                                            key={group.id}
                                            onClick={() => handleInviteGroup(inviteModalSessionId, group.id)}
                                            disabled={inviteGroup.isPending}
                                            className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-gray-600 hover:border-blue-500 disabled:opacity-50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-white">{group.name}</p>
                                                    <p className="text-sm text-gray-400">{group.members?.length || 0} membres</p>
                                                </div>
                                                <UserPlus size={20} className="text-blue-400" />
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
                                friends && friends.length > 0 ? (
                                    friends.map((friend: any) => (
                                        <button
                                            key={friend.id}
                                            onClick={() => handleInviteFriend(inviteModalSessionId, friend.id)}
                                            className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-gray-600 hover:border-green-500"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={friend.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=random`}
                                                        alt={friend.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <p className="font-semibold text-white">{friend.name}</p>
                                                </div>
                                                <UserPlus size={20} className="text-green-400" />
                                            </div>
                                        </button>
                                    ))
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
