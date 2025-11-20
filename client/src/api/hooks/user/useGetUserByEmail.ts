import { useQuery } from '@tanstack/react-query';
import { UserFetchDataService } from '../../services/userService';
import type { User } from '../../../types/user.type';

export function useUserByEmail(email: string | undefined) {
    return useQuery<User, unknown>({
        queryKey: ['user', 'email', email],
        queryFn: () => UserFetchDataService.getUserByEmail(email as string),
        enabled: typeof email === 'string' && email.length > 0,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default useUserByEmail;

