import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FriendFetchDataService } from '../../services/friendService';

export function useCancelFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId: string) => FriendFetchDataService.cancelFriendRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sentFriendRequests'] });
        },
    });
}

export default useCancelFriendRequest;
