import { useMutation, useQueryClient } from '@tanstack/react-query';
import LevelService from '../../services/levelService';
import type { Level } from '../../../types/level.type';

export function useInitializeMyLeveling() {
    const qc = useQueryClient();

    const mutation = useMutation<Level, unknown, void>({
        mutationFn: () => LevelService.initializeMyLeveling(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['level'] });
        },
    });
    return mutation;
}

export default useInitializeMyLeveling;
