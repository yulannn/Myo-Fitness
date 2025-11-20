import { useMutation, useQueryClient } from '@tanstack/react-query';
import GroupService from '../../services/groupService';
import type { Group, CreateGroupPayload } from '../../../types/group.type';

export function useCreateGroup() {
  const qc = useQueryClient();

  const mutation = useMutation<Group, unknown, CreateGroupPayload>({
    mutationFn: (payload: CreateGroupPayload) => GroupService.createGroup(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
  return mutation;
}

export default useCreateGroup;

