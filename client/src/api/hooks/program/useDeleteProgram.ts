import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProgramFetchDataService from '../../services/programService';

export const useDeleteProgram = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (programId: number) =>
            ProgramFetchDataService.deleteProgram(programId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program'] });
        },
    });
};

export default useDeleteProgram;
