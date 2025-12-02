import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProgramFetchDataService from '../../services/programService';

export const useUpdateProgramStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ programId, status }: { programId: number; status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'DRAFT' }) =>
            ProgramFetchDataService.updateProgramStatus(programId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        },
    });
};

export default useUpdateProgramStatus;
