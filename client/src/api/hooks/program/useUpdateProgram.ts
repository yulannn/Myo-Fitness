import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProgramFetchDataService from '../../services/programService';

export const useUpdateProgram = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ programId, payload }: { programId: number; payload: any }) =>
            ProgramFetchDataService.updateProgram(programId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['program'] });
        },
    });
};

export default useUpdateProgram;
