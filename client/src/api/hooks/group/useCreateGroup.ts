import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import GroupService from '../../services/groupService';
import type { Group, CreateGroupPayload } from '../../../types/group.type';

export function useCreateGroup(options?: Partial<UseMutationOptions<Group, unknown, CreateGroupPayload>>) {
  const qc = useQueryClient();

  const { onSuccess, ...otherOptions } = options || {};

  const mutation = useMutation<Group, unknown, CreateGroupPayload>({
    mutationFn: (payload: CreateGroupPayload) => GroupService.createGroup(payload),
    onSuccess: async (...args) => {
      await qc.invalidateQueries({ queryKey: ['groups'] });
      await qc.invalidateQueries({ queryKey: ['conversations'] });
      if (onSuccess) {
        onSuccess(...args);
      }
    },
    ...otherOptions,
  });
  return mutation;
}

export default useCreateGroup;

