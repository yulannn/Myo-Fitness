import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import GroupService from '../../services/groupService';
import type { Group, CreateGroupPayload } from '../../../types/group.type';

export function useCreateGroup(options?: Partial<UseMutationOptions<Group, unknown, CreateGroupPayload>>) {
  const qc = useQueryClient();

  const mutation = useMutation<Group, unknown, CreateGroupPayload>({
    mutationFn: (payload: CreateGroupPayload) => GroupService.createGroup(payload),
    onSuccess: async (...args) => {
      await qc.invalidateQueries({ queryKey: ['groups'] });
      await qc.invalidateQueries({ queryKey: ['myGroups'] });
      await qc.invalidateQueries({ queryKey: ['conversations'] });
      if (options?.onSuccess) {
        options.onSuccess(...args);
      }
    },
    ...options,
  });
  return mutation;
}

export default useCreateGroup;

