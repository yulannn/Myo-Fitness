import { useQuery } from '@tanstack/react-query';
import UserService from '../../services/userService';
import type { User } from '../../../types/user.type';

export function useUserById(userId: number | undefined) {
    return useQuery<User, unknown>({
        queryKey: ['user', userId],
        queryFn: () => UserService.getUserById(userId as number),
        enabled: typeof userId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default useUserById;

