import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import GroupService from '../../services/groupService';
import type { Group, SendGroupRequestPayload } from '../../../types/group.type';

interface SendGroupRequestParams {
    groupId: number;
    payload: SendGroupRequestPayload;
}

export function useSendGroupRequest(options?: Partial<UseMutationOptions<Group, unknown, SendGroupRequestParams>>) {
    const qc = useQueryClient();

    return useMutation<Group, unknown, SendGroupRequestParams>({
        mutationFn: ({ groupId, payload }: SendGroupRequestParams) => GroupService.sendGroupRequest(groupId, payload),
        onSuccess: async (...args) => {
            qc.invalidateQueries({ queryKey: ['groups'] });
            qc.invalidateQueries({ queryKey: ['groupRequests'] });
            if (options?.onSuccess) {
                options.onSuccess(...args);
            }
        },
        ...options,
    });
}

export default useSendGroupRequest;

