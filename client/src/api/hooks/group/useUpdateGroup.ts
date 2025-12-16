import { useMutation, useQueryClient } from '@tanstack/react-query';
import GroupService from '../../services/groupService';

export function useUpdateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name }: { id: number, name: string }) => GroupService.updateGroup(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myGroups'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });
}

export default useUpdateGroup;
