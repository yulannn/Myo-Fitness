import { useState } from 'react';
import { Modal, ModalContent } from './';
import {
    UsersIcon,
    UserGroupIcon,
    MagnifyingGlassIcon,
    PaperAirplaneIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import useFriendsList from '../../../api/hooks/friend/useGetFriendsList';
import useGetUserGroups from '../../../api/hooks/group/useGetUserGroups';
import ChatService from '../../../api/services/chatService';
import { useMutation } from '@tanstack/react-query';
import { getImageUrl } from '../../../utils/imageUtils';

interface ShareProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    program: any;
}

export const ShareProgramModal = ({ isOpen, onClose, program }: ShareProgramModalProps) => {
    const { data: friends = [] } = useFriendsList();
    const { data: groups = [] } = useGetUserGroups();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'friends' | 'groups'>('friends');
    const [sentTo, setSentTo] = useState<Set<string>>(new Set());

    // Filter friends
    const filteredFriends = friends.filter((f: any) =>
        f.friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter groups
    const filteredGroups = groups.filter((g: any) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const shareMutation = useMutation({
        mutationFn: async (target: { type: 'friend' | 'group', id: number }) => {
            let conversationId;

            if (target.type === 'friend') {
                const res = await ChatService.createConversation({
                    type: 'PRIVATE',
                    participantIds: [target.id]
                });
                conversationId = res.data.id;
            } else {
                // Try to create/get group conversation
                const res = await ChatService.createConversation({
                    type: 'GROUP',
                    groupId: target.id,
                    participantIds: [],
                    name: 'Général'
                });
                conversationId = res.data.id;
            }

            const content = JSON.stringify({
                programId: program.id,
                programName: program.name,
                sessionCount: program.sessionTemplates?.length || 0
            });

            await ChatService.sendMessage({
                conversationId,
                content,
                type: 'PROGRAM_SHARE'
            });

            return target;
        },
        onSuccess: (data) => {
            setSentTo(prev => new Set(prev).add(`${data.type}-${data.id}`));
        }
    });

    const handleSend = (type: 'friend' | 'group', id: number) => {
        if (sentTo.has(`${type}-${id}`)) return;
        shareMutation.mutate({ type, id });
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} showClose={false} className="max-w-md bg-[#121214] border border-white/5 rounded-[32px] shadow-2xl h-[600px] max-h-[90vh]">
            <ModalContent className="!p-0 h-full flex flex-col overflow-hidden">
                {/* Header - Minimalist */}
                <div className="p-8 pb-4 flex-shrink-0 flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">Partager</h3>
                        <p className="text-sm text-gray-500 font-medium">{program.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 -mt-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-all duration-300"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8 pt-2 flex flex-col flex-1 min-h-0 space-y-6">
                    {/* Modern Segmented Control */}
                    <div className="flex-shrink-0 flex p-1.5 bg-[#18181b] rounded-2xl border border-white/5">
                        <button
                            onClick={() => setSelectedTab('friends')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-500 ${selectedTab === 'friends'
                                ? 'bg-[#27272a] text-white shadow-lg shadow-black/50'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <UsersIcon className="h-4 w-4" />
                            Amis
                        </button>
                        <button
                            onClick={() => setSelectedTab('groups')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-500 ${selectedTab === 'groups'
                                ? 'bg-[#27272a] text-white shadow-lg shadow-black/50'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <UserGroupIcon className="h-4 w-4" />
                            Groupes
                        </button>
                    </div>

                    {/* Clean Search Input */}
                    <div className="flex-shrink-0 relative group">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-0 top-3 text-gray-600 group-focus-within:text-[#94fbdd] transition-colors duration-300" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full bg-transparent border-b border-white/10 pl-8 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#94fbdd] transition-all duration-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* List - Airy & Clean */}
                    <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-1 custom-scrollbar min-h-0">
                        {selectedTab === 'friends' ? (
                            filteredFriends.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-500">
                                    <UsersIcon className="h-12 w-12 text-gray-800 mb-3" />
                                    <p className="text-gray-600 text-sm">Aucun ami trouvé</p>
                                </div>
                            ) : (
                                filteredFriends.map((f: any) => (
                                    <div key={f.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.03] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#18181b] rounded-full overflow-hidden border border-white/5 group-hover:border-white/10 transition-colors">
                                                {f.friend.profilePictureUrl ? (
                                                    <img src={getImageUrl(f.friend.profilePictureUrl)} alt={f.friend.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#27272a] text-gray-500 font-bold">
                                                        {f.friend.name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{f.friend.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleSend('friend', f.friend.id)}
                                            disabled={sentTo.has(`friend-${f.friend.id}`)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${sentTo.has(`friend-${f.friend.id}`)
                                                ? 'bg-[#94fbdd]/10 text-[#94fbdd] cursor-default'
                                                : 'bg-white/5 text-gray-400 hover:bg-[#94fbdd] hover:text-[#121214] hover:scale-110'
                                                }`}
                                        >
                                            {sentTo.has(`friend-${f.friend.id}`) ? (
                                                <CheckIcon className="h-5 w-5" />
                                            ) : (
                                                <PaperAirplaneIcon className="h-5 w-5 -rotate-45 translate-x-0.5" />
                                            )}
                                        </button>
                                    </div>
                                ))
                            )
                        ) : (
                            filteredGroups.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-500">
                                    <UserGroupIcon className="h-12 w-12 text-gray-800 mb-3" />
                                    <p className="text-gray-600 text-sm">Aucun groupe trouvé</p>
                                </div>
                            ) : (
                                filteredGroups.map((g: any) => (
                                    <div key={g.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.03] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#18181b] rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                                                <UserGroupIcon className="h-6 w-6 text-gray-500 group-hover:text-gray-400 transition-colors" />
                                            </div>
                                            <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{g.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleSend('group', g.id)}
                                            disabled={sentTo.has(`group-${g.id}`)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${sentTo.has(`group-${g.id}`)
                                                ? 'bg-[#94fbdd]/10 text-[#94fbdd] cursor-default hover:bg-[#94fbdd]/20'
                                                : 'bg-white/5 text-gray-400 hover:bg-[#94fbdd] hover:text-[#121214] hover:scale-110'
                                                }`}
                                        >
                                            {sentTo.has(`group-${g.id}`) ? (
                                                <CheckIcon className="h-5 w-5" />
                                            ) : (
                                                <PaperAirplaneIcon className="h-5 w-5 -rotate-45 translate-x-0.5" />
                                            )}
                                        </button>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
};
