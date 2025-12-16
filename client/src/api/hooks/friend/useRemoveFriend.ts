import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../apiClient';

const useRemoveFriend = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (friendId: number) => {
            const response = await api.delete(`/friend/${friendId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['searchUsers'] });
        },
    });
};

export default useRemoveFriend;
