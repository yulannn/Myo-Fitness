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

    /**
     * 📊 OPTIMISÉ: Récupère les statistiques utilisateur (calcul côté backend)
     */
    async getUserStats(): Promise<{
        totalSessions: number;
        completedSessions: number;
        upcomingSessions: number;
    }> {
        const res = await api.get('/session/user/stats');
        return res.data;
    },

    /**
     * 🏆 OPTIMISÉ: Récupère les records personnels (calcul côté backend)
     */
    async getPersonalRecords(limit = 3): Promise<Array<{
        exerciseId: number;
        exerciseName: string;
        weight: number;
        reps: number;
        date: string;
        volume: number;
    }>> {
        const res = await api.get(`/session/user/records?limit=${limit}`);
        return res.data;
    },

    /**
     * 🔥 OPTIMISÉ: Récupère les données de streak (calcul côté backend)
     */
    async getUserStreak(): Promise<{
        currentStreak: number;
        longestStreak: number;
        weekActivity: boolean[];
        totalCompletedSessions: number;
    }> {
        const res = await api.get('/session/user/streak');
        return res.data;
    },

    /**
     * 🔧 Modifier le nombre de séries d'un exercice pendant une session
     */
    async updateExerciceSets(exerciceSessionId: number, sets: number): Promise<any> {
        const res = await api.patch(`/session/exercice-session/${exerciceSessionId}/sets`, { sets });
        return res.data;
    },

    /**
     * 🔄 Récupère la session en cours (IN_PROGRESS) s'il y en a une
     */
    async getInProgressSession(): Promise<any | null> {
        const res = await api.get('/session/user/in-progress');
        return res.data;
    },

    /**
     * 🚫 Annule une session en cours et la remet en SCHEDULED
     */
    async cancelInProgressSession(sessionId: number): Promise<{ message: string }> {
        const res = await api.delete<{ message: string }>(`/session/user/in-progress/${sessionId}`);
        return res.data;
    },
};

export default SessionFetchDataService;

