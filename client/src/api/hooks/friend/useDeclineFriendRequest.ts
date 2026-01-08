import { useMutation, useQueryClient } from '@tanstack/react-query';
import FriendService from '../../services/friendService';

export function useDeclineFriendRequest() {
    const qc = useQueryClient();

    return useMutation<{ message: string }, unknown, number>({
        mutationFn: (requestId: number) => FriendService.declineFriendRequest(requestId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['friends'] });
            qc.invalidateQueries({ queryKey: ['friendRequests'] });
        }
    });
}

export default useDeclineFriendRequest;

