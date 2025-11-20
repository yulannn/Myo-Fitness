import api from '../apiClient';
import type { SessionAdaptation } from '../../types/session-adaptation.type';

export const SessionAdaptationFetchDataService = {
    async getSessionWithPerformances(trainingSessionId: number): Promise<SessionAdaptation> {
        const res = await api.get<SessionAdaptation>(`/session-adaptation/${trainingSessionId}`);
        return res.data;
    },

    async createAdaptedSession(trainingSessionId: number): Promise<SessionAdaptation> {
        const res = await api.post<SessionAdaptation>(`/session-adaptation/${trainingSessionId}/adapt`);
        return res.data;
    },

    async createNewSimilarSession(trainingSessionId: number): Promise<SessionAdaptation> {
        const res = await api.post<SessionAdaptation>(`/session-adaptation/${trainingSessionId}/similar`);
        return res.data;
    },
};

export default SessionAdaptationFetchDataService;

