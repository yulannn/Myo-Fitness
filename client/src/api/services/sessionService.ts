import api from '../apiClient';
import type { Session, UpdateSessionDatePayload, AddExerciseToSessionPayload } from '../../types/session.type';

export const SessionFetchDataService = {
    async getSessionById(sessionId: number): Promise<Session> {
        const res = await api.get<Session>(`/session/${sessionId}`);
        return res.data;
    },

    async getAllUserSessions(startDate?: string, endDate?: string): Promise<Session[]> {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await api.get<Session[]>('/session/user/all', { params });
        return res.data;
    },

    /**
     * 🚀 OPTIMISÉ: Récupère les sessions pour l'affichage calendrier
     * Utilise l'endpoint ultra-optimisé qui retourne uniquement les données minimales
     */
    async getSessionsForCalendar(startDate?: string, endDate?: string): Promise<any[]> {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await api.get<any[]>('/session/user/calendar', { params });
        return res.data;
    },

    async updateSessionDate(sessionId: number, payload: UpdateSessionDatePayload): Promise<Session> {
        const res = await api.patch<Session>(`/session/${sessionId}/date`, payload);
        return res.data;
    },

    async deleteExerciseFromSession(sessionId: number, exerciceId: number): Promise<Session> {
        const res = await api.delete<Session>(`/session/delete-exercise/${sessionId}/${exerciceId}`);
        return res.data;
    },

    async addExerciseToSession(sessionId: number, exerciceId: number, payload: AddExerciseToSessionPayload): Promise<Session> {
        const res = await api.post<Session>(`/session/add-exercise/${sessionId}/${exerciceId}`, payload);
        return res.data;
    },

    async updateExerciseInSession(sessionId: number, exerciceId: number, payload: AddExerciseToSessionPayload): Promise<Session> {
        const res = await api.put<Session>(`/session/update-exercise/${sessionId}/${exerciceId}`, payload);
        return res.data;
    },

    async completedSession(sessionId: number): Promise<Session> {
        const res = await api.patch<Session>(`/session/${sessionId}/completed`);
        return res.data;
    },

    async updateSessionName(sessionId: number, sessionName: string): Promise<Session> {
        const res = await api.patch<Session>(`/session/${sessionId}/sessionName`, { sessionName });
        return res.data;
    },

    async deleteSession(sessionId: number): Promise<void> {
        await api.delete(`/session/${sessionId}`);
    },
};

export default SessionFetchDataService;

