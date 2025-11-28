import { useMutation, useQueryClient } from '@tanstack/react-query';
import GroupService from '../../services/groupService';

export function useRemoveMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, userId }: { groupId: number, userId: number }) => GroupService.removeMember(groupId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groupMembers'] });
            queryClient.invalidateQueries({ queryKey: ['myGroups'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });
}

export default useRemoveMember;
