import api from '../apiClient';
import type { Program, CreateProgramPayload, ManualProgramPayload, AddSessionPayload } from '../../types/program.type';

export const ProgramFetchDataService = {
    // ✅ NOUVEAU: Récupère uniquement le programme ACTIF
    async getActiveProgram(): Promise<Program | null> {
        const res = await api.get<Program>('/program/active');
        return res.data;
    },

    // ✅ NOUVEAU: Récupère uniquement les programmes ARCHIVÉS
    async getArchivedPrograms(): Promise<Program[]> {
        const res = await api.get<Program[]>('/program/archived');
        return res.data;
    },

    // 🔧 LEGACY: Garde pour compatibilité
    async getProgramsByUser(): Promise<Program[]> {
        const res = await api.get<Program[]>('/program');
        return res.data;
    },

    async getProgramById(programId: number): Promise<Program> {
        const res = await api.get<Program>(`/program/${programId}`);
        return res.data;
    },

    async createProgram(payload: CreateProgramPayload): Promise<Program> {
        const res = await api.post<Program>('/program', payload);
        return res.data;
    },

    async createManualProgram(payload: ManualProgramPayload): Promise<Program> {
        const res = await api.post<Program>('/program/manual', payload);
        return res.data;
    },

    async addSessionToProgram(programId: number, payload: AddSessionPayload): Promise<Program> {
        const res = await api.post<Program>(`/program/add-session/${programId}`, payload);
        return res.data;
    },

    async deleteSessionFromProgram(sessionId: number): Promise<Program> {
        const res = await api.delete<Program>(`/program/delete-session/${sessionId}`);
        return res.data;
    },

    async updateProgramStatus(programId: number, status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'DRAFT'): Promise<Program> {
        const res = await api.patch<Program>(`/program/${programId}/status`, { status });
        return res.data;
    },

    async updateProgram(programId: number, payload: any): Promise<Program> {
        const res = await api.patch<Program>(`/program/${programId}`, payload);
        return res.data;
    },

    async deleteProgram(programId: number): Promise<void> {
        await api.delete(`/program/${programId}`);
    },
};

export default ProgramFetchDataService;
