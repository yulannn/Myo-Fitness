import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GroupFetchDataService } from '../../services/groupService';

export function useLeaveGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (groupId: number) => GroupFetchDataService.leaveGroup(groupId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}

export default useLeaveGroup;
