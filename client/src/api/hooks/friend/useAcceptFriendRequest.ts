import { useMutation, useQueryClient } from '@tanstack/react-query';
import FriendService from '../../services/friendService';

export function useAcceptFriendRequest() {
    const qc = useQueryClient();

    return useMutation<{ message: string }, unknown, number>({
        mutationFn: (requestId: number) => FriendService.acceptFriendRequest(requestId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['friends'] });
            qc.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
            qc.invalidateQueries({ queryKey: ['conversations'] });
        }
    });
}

export default useAcceptFriendRequest;

