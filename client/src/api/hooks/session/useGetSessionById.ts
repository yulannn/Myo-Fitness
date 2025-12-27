import { useQuery } from '@tanstack/react-query';
import SessionFetchDataService from '../../services/sessionService';

const useGetSessionById = (sessionId: number) => {
    return useQuery({
        queryKey: ['session', sessionId],
        queryFn: () => SessionFetchDataService.getSessionById(sessionId),
        enabled: !!sessionId,
        staleTime: 60 * 1000,
    });
};

export default useGetSessionById;
