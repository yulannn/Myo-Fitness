import { useMutation, useQueryClient } from '@tanstack/react-query';
import FriendService from '../../services/friendService';
import type { Friend, CreateFriendPayload } from '../../../types/friend.type';

export function useSendFriendRequest() {
  const qc = useQueryClient();

  const mutation = useMutation<Friend, unknown, CreateFriendPayload>({
    mutationFn: (payload: CreateFriendPayload) => FriendService.sendFriendRequest(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['friends'] });
      await qc.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
    },
  });
  return mutation;
}

export default useSendFriendRequest;

