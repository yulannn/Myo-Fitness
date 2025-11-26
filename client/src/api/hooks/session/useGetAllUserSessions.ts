import { useQuery } from '@tanstack/react-query';
import SessionFetchDataService from '../../services/sessionService';

const useGetAllUserSessions = () => {
    return useQuery({
        queryKey: ['sessions', 'all'],
        queryFn: () => SessionFetchDataService.getAllUserSessions(),
    });
};

export default useGetAllUserSessions;
