import { useMutation, useQueryClient } from '@tanstack/react-query';
import GroupService from '../../services/groupService';
import type { Group, SendGroupRequestPayload } from '../../../types/group.type';

export function useSendGroupRequest(groupId?: number) {
    const qc = useQueryClient();

    return useMutation<Group, unknown, SendGroupRequestPayload>({
        mutationFn: (payload: SendGroupRequestPayload) => GroupService.sendGroupRequest(groupId as number, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['groups'] });
            qc.invalidateQueries({ queryKey: ['groupRequests'] });
        }
    });
}

export default useSendGroupRequest;

