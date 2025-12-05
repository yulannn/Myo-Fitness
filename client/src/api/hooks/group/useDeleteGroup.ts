import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GroupFetchDataService } from '../../services/groupService';

export function useDeleteGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (groupId: number) => GroupFetchDataService.deleteGroup(groupId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}

export default useDeleteGroup;
