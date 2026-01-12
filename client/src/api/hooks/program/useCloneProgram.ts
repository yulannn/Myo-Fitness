import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../apiClient';

const cloneProgram = async (programId: number) => {
    const { data } = await api.post(`/program/${programId}/clone`);
    return data;
};

export default function useCloneProgram() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cloneProgram,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['archived-programs'] });
            // Optionally invalidate active program if we decide to auto-activate (not currently planned)
        },
    });
}
