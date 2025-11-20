import { useMutation, useQueryClient } from '@tanstack/react-query';
import GroupService from '../../services/groupService';

export function useDeclineGroupRequest() {
    const qc = useQueryClient();

    return useMutation<{ message: string }, unknown, number>({
        mutationFn: (requestId: number) => GroupService.declineGroupRequest(requestId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['groups'] });
            qc.invalidateQueries({ queryKey: ['groupRequests'] });
        }
    });
}

export default useDeclineGroupRequest;

