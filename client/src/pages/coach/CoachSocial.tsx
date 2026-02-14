import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { useConversations } from '../../api/hooks/chat/useConversations';
import { useCoachClients } from '../../api/hooks/coaching/useCoachClients';
import { SOCIAL_CHATS } from '../../utils/paths';
import { getImageUrl } from '../../utils/imageUtils';

export default function CoachSocial() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: conversations = [], isLoading: loadingConvs } = useConversations();
  const { data: clients = [] } = useCoachClients();

  // Combine clients and existing conversations
  const allConversations = useMemo(() => {
    const clientIds = new Set(clients.map(c => c.id));

    // 1. Get existing client conversations
    const existingClientConvs = conversations.filter((conv: any) => {
      return conv.type === 'PRIVATE' && conv.participants?.some((p: any) => clientIds.has(p.user?.id));
    });

    // 2. Map existing conversations to client IDs
    const clientIdsWithConvs = new Set();
    existingClientConvs.forEach((conv: any) => {
      const otherParticipant = conv.participants.find((p: any) => clientIds.has(p.user?.id));
      if (otherParticipant) clientIdsWithConvs.add(otherParticipant.user.id);
    });

    // 3. Create "virtual" conversations for clients without them
    const virtualConvs = clients
      .filter(client => !clientIdsWithConvs.has(client.id))
      .map(client => ({
        id: `virtual-${client.id}`,
        isVirtual: true,
        targetUserId: client.id,
        participants: [{ user: client }],
        unreadCount: 0,
        lastMessage: null,
        name: client.name
      }));

    // 4. Merge and sort
    const combined = [...existingClientConvs, ...virtualConvs];

    return combined.sort((a: any, b: any) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;

      // Push virtual conversations to the bottom if no recent messages
      if (dateA === 0 && dateB > 0) return 1;
      if (dateB === 0 && dateA > 0) return -1;

      return dateB - dateA;
    });
  }, [conversations, clients]);

  const filteredConversations = allConversations.filter((conv: any) => {
    const clientPart = conv.participants?.find((p: any) => clients.some(c => c.id === p.user?.id))?.user;
    const name = conv.name || clientPart?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle direct navigation from CoachClients with targetUserId
  useEffect(() => {
    const targetUserId = location.state?.targetUserId;
    if (targetUserId && !loadingConvs) {
      // Find if conversation exists
      const existing = conversations.find((conv: any) =>
        conv.type === 'PRIVATE' && conv.participants?.some((p: any) => p.user?.id === targetUserId)
      );

      if (existing) {
        navigate(SOCIAL_CHATS, { state: { conversationId: existing.id } });
      } else {
        // It's a virtual one, ChatsPage will need to handle creation
        navigate(SOCIAL_CHATS, { state: { targetUserId } });
      }
    }
  }, [location.state, conversations, loadingConvs, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-[#121214] pb-24">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Messagerie</h1>
          <p className="text-[#94fbdd] text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Espace Professionnel</p>
        </div>
        <button
          onClick={() => navigate('/coach/clients')}
          className="p-3 rounded-2xl bg-[#94fbdd]/10 text-[#94fbdd] border border-[#94fbdd]/20 active:scale-95 transition-all"
        >
          <UserPlusIcon className="w-6 h-6" />
        </button>
      </header>

      {/* ── Search ─────────────────────────────────────────── */}
      <div className="px-6 mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#252527] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-[#94fbdd]/30 transition-all font-medium"
          />
        </div>
      </div>

      {/* ── Conversations List (Flat Style) ────────────────── */}
      <div className="flex-1 bg-[#121214]">
        {loadingConvs ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#94fbdd] border-t-transparent" />
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="divide-y divide-white/5 border-t border-white/5">
            {filteredConversations.map((conv: any) => {
              const clientPart = conv.participants?.find((p: any) => clients.some(c => c.id === p.user?.id))?.user;

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    if (conv.isVirtual) {
                      navigate(SOCIAL_CHATS, { state: { targetUserId: conv.targetUserId } });
                    } else {
                      navigate(SOCIAL_CHATS, { state: { conversationId: conv.id } });
                    }
                  }}
                  className="w-full px-6 py-5 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-[#27272a] border border-white/5 overflow-hidden">
                      {clientPart?.profilePictureUrl ? (
                        <img src={getImageUrl(clientPart.profilePictureUrl)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                          {clientPart?.name?.[0]}
                        </div>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#94fbdd] rounded-full flex items-center justify-center border-2 border-[#121214] text-[#121214] text-[10px] font-black">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-white font-bold truncate pr-3">
                        {clientPart?.name || 'Client'}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-gray-600 font-bold uppercase flex-shrink-0">
                          {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(conv.lastMessage.createdAt))}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>
                      {conv.lastMessage?.content || 'Nouvelle conversation...'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-[#252527] rounded-full flex items-center justify-center mx-auto mb-6">
              <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-800" />
            </div>
            <h3 className="text-white font-black text-lg mb-2">Aucun message</h3>
            <p className="text-gray-500 text-sm max-w-[200px] mx-auto leading-relaxed">
              Tes conversations avec tes athlètes apparaîtront ici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
